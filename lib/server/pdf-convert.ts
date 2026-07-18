/* Server-side PDF → Word conversion — a provider FALLBACK CHAIN.
   SERVER ONLY.

   Each provider is a small fetch adapter with a monthly/daily free tier. They
   are tried in quality order; the first one that is configured AND succeeds
   wins. A provider that is over quota simply throws, and the chain falls
   through to the next — which also gives automatic RECOVERY: next request we
   try the top provider again, so when its window resets it silently comes back
   into use. No usage table to keep in sync.

   A provider only joins the chain when its env keys are present, so the whole
   feature is inert (route replies "not configured") until the owner adds keys.

   Add providers by pushing another entry into PROVIDERS. Order = priority. */

export type ConvertResult = { docx: Uint8Array; provider: string };

type Provider = {
  name: string;
  enabled: () => boolean;
  convert: (pdf: Uint8Array, signal: AbortSignal) => Promise<Uint8Array>;
};

const DOCX_MIME = "application/vnd.openxmlformats-officedocument.wordprocessingml.document";

function timeout(ms: number): { signal: AbortSignal; clear: () => void } {
  const c = new AbortController();
  const t = setTimeout(() => c.abort(), ms);
  return { signal: c.signal, clear: () => clearTimeout(t) };
}

/** A Blob backed by a plain ArrayBuffer copy — a fetch/Blob-safe body that
    sidesteps the ArrayBufferLike vs ArrayBuffer type friction. */
function u8blob(u8: Uint8Array, type = "application/pdf"): Blob {
  const ab = u8.buffer.slice(u8.byteOffset, u8.byteOffset + u8.byteLength) as ArrayBuffer;
  return new Blob([ab], { type });
}

/* ── Adobe PDF Services (500 free Document Transactions / month) ──
   REST flow: token → create asset → upload → export(docx) → poll → download.
   Highest fidelity of the free tiers (real tables/paragraphs). */
const adobe: Provider = {
  name: "adobe",
  enabled: () => !!(process.env.ADOBE_PDF_CLIENT_ID && process.env.ADOBE_PDF_CLIENT_SECRET),
  async convert(pdf, signal) {
    const clientId = process.env.ADOBE_PDF_CLIENT_ID!;
    const clientSecret = process.env.ADOBE_PDF_CLIENT_SECRET!;
    const base = "https://pdf-services.adobe.io";
    const h = (token: string, json = true) => ({
      Authorization: `Bearer ${token}`,
      "x-api-key": clientId,
      ...(json ? { "Content-Type": "application/json" } : {}),
    });

    // 1. access token
    const tokRes = await fetch(`${base}/token`, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ client_id: clientId, client_secret: clientSecret }),
      signal,
    });
    if (!tokRes.ok) throw new Error(`adobe token ${tokRes.status}`);
    const token = (await tokRes.json()).access_token as string;
    if (!token) throw new Error("adobe no token");

    // 2. create upload asset
    const assetRes = await fetch(`${base}/assets`, {
      method: "POST", headers: h(token), signal,
      body: JSON.stringify({ mediaType: "application/pdf" }),
    });
    if (!assetRes.ok) throw new Error(`adobe asset ${assetRes.status}`);
    const { uploadUri, assetID } = await assetRes.json();
    if (!uploadUri || !assetID) throw new Error("adobe no upload uri");

    // 3. upload the PDF bytes
    const up = await fetch(uploadUri, { method: "PUT", headers: { "Content-Type": "application/pdf" }, body: u8blob(pdf), signal });
    if (!up.ok) throw new Error(`adobe upload ${up.status}`);

    // 4. start export → docx
    const job = await fetch(`${base}/operation/exportpdf`, {
      method: "POST", headers: h(token), signal,
      body: JSON.stringify({ assetID, targetFormat: "docx" }),
    });
    // 429 = quota exhausted → let the chain fall through
    if (job.status === 429) throw new Error("adobe quota");
    if (job.status !== 201) throw new Error(`adobe export ${job.status}`);
    const pollUrl = job.headers.get("location");
    if (!pollUrl) throw new Error("adobe no poll url");

    // 5. poll until done (cap ~50s)
    const deadline = Date.now() + 50_000;
    let downloadUri = "";
    for (;;) {
      if (Date.now() > deadline) throw new Error("adobe timeout");
      await new Promise((r) => setTimeout(r, 1500));
      const st = await fetch(pollUrl, { headers: h(token, false), signal });
      if (!st.ok) throw new Error(`adobe poll ${st.status}`);
      const body = await st.json();
      const status = String(body.status || "").toLowerCase();
      if (status === "done") { downloadUri = body?.asset?.downloadUri; break; }
      if (status === "failed") throw new Error("adobe failed");
    }
    if (!downloadUri) throw new Error("adobe no download uri");

    // 6. fetch the resulting docx
    const dl = await fetch(downloadUri, { signal });
    if (!dl.ok) throw new Error(`adobe download ${dl.status}`);
    return new Uint8Array(await dl.arrayBuffer());
  },
};

/* ── Aspose.Words Cloud (150 free API calls / month) ──
   OAuth client-credentials token, then PUT /v4.0/words/convert?format=docx
   with the PDF as multipart "Document". Returns the DOCX bytes directly. */
const aspose: Provider = {
  name: "aspose",
  enabled: () => !!(process.env.ASPOSE_CLIENT_ID && process.env.ASPOSE_CLIENT_SECRET),
  async convert(pdf, signal) {
    const tokRes = await fetch("https://api.aspose.cloud/connect/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        grant_type: "client_credentials",
        client_id: process.env.ASPOSE_CLIENT_ID!,
        client_secret: process.env.ASPOSE_CLIENT_SECRET!,
      }),
      signal,
    });
    if (!tokRes.ok) throw new Error(`aspose token ${tokRes.status}`);
    const token = (await tokRes.json()).access_token as string;
    if (!token) throw new Error("aspose no token");

    const fd = new FormData();
    fd.append("Document", u8blob(pdf), "input.pdf");
    const res = await fetch("https://api.aspose.cloud/v4.0/words/convert?format=docx", {
      method: "PUT",
      headers: { Authorization: `Bearer ${token}` },
      body: fd, signal,
    });
    if (res.status === 429) throw new Error("aspose quota");
    if (!res.ok) throw new Error(`aspose convert ${res.status}`);
    const buf = new Uint8Array(await res.arrayBuffer());
    if (buf.byteLength < 1000) throw new Error("aspose empty");
    return buf;
  },
};

/* ── CloudConvert (free ~25 conversion minutes/day; $9 = 500 more) ──
   v2 jobs API: create job (import/upload → convert → export/url), upload
   the file to the import task's signed form, poll, download the export. */
const cloudconvert: Provider = {
  name: "cloudconvert",
  enabled: () => !!process.env.CLOUDCONVERT_API_KEY,
  async convert(pdf, signal) {
    const key = process.env.CLOUDCONVERT_API_KEY!;
    const h = { Authorization: `Bearer ${key}`, "Content-Type": "application/json" };
    const jobRes = await fetch("https://api.cloudconvert.com/v2/jobs", {
      method: "POST", headers: h, signal,
      body: JSON.stringify({
        tasks: {
          "import-1": { operation: "import/upload" },
          "convert-1": { operation: "convert", input: "import-1", input_format: "pdf", output_format: "docx" },
          "export-1": { operation: "export/url", input: "convert-1" },
        },
      }),
    });
    if (jobRes.status === 402 || jobRes.status === 429) throw new Error("cloudconvert quota");
    if (!jobRes.ok) throw new Error(`cloudconvert job ${jobRes.status}`);
    const job = (await jobRes.json()).data;
    const importTask = (job.tasks as any[]).find((t) => t.name === "import-1");
    const form = importTask?.result?.form;
    if (!form?.url) throw new Error("cloudconvert no upload form");

    const fd = new FormData();
    for (const [k, v] of Object.entries(form.parameters || {})) fd.append(k, String(v));
    fd.append("file", u8blob(pdf), "input.pdf");
    const up = await fetch(form.url, { method: "POST", body: fd, signal });
    if (!up.ok && up.status !== 201) throw new Error(`cloudconvert upload ${up.status}`);

    // poll the job (cap ~50s)
    const deadline = Date.now() + 50_000;
    let fileUrl = "";
    for (;;) {
      if (Date.now() > deadline) throw new Error("cloudconvert timeout");
      await new Promise((r) => setTimeout(r, 2000));
      const st = await fetch(`https://api.cloudconvert.com/v2/jobs/${job.id}`, { headers: { Authorization: `Bearer ${key}` }, signal });
      if (!st.ok) throw new Error(`cloudconvert poll ${st.status}`);
      const jd = (await st.json()).data;
      if (jd.status === "finished") {
        const exp = (jd.tasks as any[]).find((t) => t.name === "export-1");
        fileUrl = exp?.result?.files?.[0]?.url || "";
        break;
      }
      if (jd.status === "error") throw new Error("cloudconvert failed");
    }
    if (!fileUrl) throw new Error("cloudconvert no file url");
    const dl = await fetch(fileUrl, { signal });
    if (!dl.ok) throw new Error(`cloudconvert download ${dl.status}`);
    const buf = new Uint8Array(await dl.arrayBuffer());
    if (buf.byteLength < 1000) throw new Error("cloudconvert empty");
    return buf;
  },
};

/* ── Own self-hosted engine (Stirling PDF / Gotenberg / pdf2docx) ──
   The unlimited final fallback. Set PDF_ENGINE_URL to a running instance that
   accepts a multipart "file" and returns the .docx (Stirling:
   /api/v1/convert/pdf/word). Optional bearer via PDF_ENGINE_TOKEN. */
const selfHosted: Provider = {
  name: "self-hosted",
  enabled: () => !!process.env.PDF_ENGINE_URL,
  async convert(pdf, signal) {
    const url = process.env.PDF_ENGINE_URL!;
    const fd = new FormData();
    fd.append("fileInput", u8blob(pdf), "input.pdf");
    fd.append("outputFormat", "docx");
    // Stirling PDF expects X-API-KEY; send Bearer too for other engines.
    const token = process.env.PDF_ENGINE_TOKEN;
    const res = await fetch(url, {
      method: "POST",
      headers: token ? { Authorization: `Bearer ${token}`, "X-API-KEY": token } : undefined,
      body: fd, signal,
    });
    if (!res.ok) throw new Error(`self-hosted ${res.status}`);
    const buf = new Uint8Array(await res.arrayBuffer());
    if (buf.byteLength < 1000) throw new Error("self-hosted empty");
    return buf;
  },
};

// Priority order: best fidelity first, unlimited self-host last.
const PROVIDERS: Provider[] = [adobe, aspose, cloudconvert, selfHosted];

/** True when at least one provider has its keys — the server route is live. */
export function serverConvertAvailable(): boolean {
  return PROVIDERS.some((p) => p.enabled());
}

/** Try each configured provider in order; first success wins. */
export async function convertPdfToWord(pdf: Uint8Array): Promise<ConvertResult> {
  const active = PROVIDERS.filter((p) => p.enabled());
  if (!active.length) throw new Error("no_providers_configured");
  const errors: string[] = [];
  for (const p of active) {
    const t = timeout(55_000);
    try {
      const docx = await p.convert(pdf, t.signal);
      if (docx && docx.byteLength > 1000) return { docx, provider: p.name };
      errors.push(`${p.name}: empty`);
    } catch (e) {
      errors.push(`${p.name}: ${(e as Error).message}`);
    } finally {
      t.clear();
    }
  }
  throw new Error(`all_providers_failed: ${errors.join("; ")}`);
}

export const DOCX_CONTENT_TYPE = DOCX_MIME;
