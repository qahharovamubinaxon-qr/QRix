/* The sourced half of /compare/[slug].
 *
 * WHY THIS EXISTS. The three comparison pages shipped 21 head-to-head cells
 * about NAMED products — iLovePDF, TinyWow, SnapTik — typed by hand, with no
 * source and no date. That is the same defect M148 removed from /free-forever
 * and M151 removed from its promise cards, on the largest surface left. Three
 * of those cells turned out to be factually wrong when the vendors' own pages
 * were finally read (see WHAT CHANGED below), which is exactly what an
 * unsourced comparison table is for: nobody can tell.
 *
 * METHOD, identical to lib/qr-generator-study.ts and stated because it bounds
 * every line here. Each vendor's own live page was fetched on `checked` and
 * read in RAW MARKUP, not tag-stripped text — the M148 method note, which
 * exists because a tick adjacent to a label makes column attribution ambiguous
 * once the tags are gone. What is recorded is WHAT THE VENDOR STATES ABOUT
 * ITSELF. No accounts were created and no payments were made, so nothing here
 * describes behaviour inside a paid or logged-in product. Where a page does not
 * answer a question the answer says so; it is never a guess.
 *
 * PRICES ARE THE MOST PERISHABLE THING ON THIS PAGE. They are also region- and
 * currency-dependent: TinyWow's own plan JSON carries both USD and GBP rows, so
 * a reader elsewhere may be quoted a different number. Every price below is
 * therefore rendered WITH its currency and its checked date, and a vendor
 * changing its pricing does not make this page wrong — it makes it dated.
 *
 * WHAT CHANGED WHEN THE PAGES WERE ACTUALLY READ (M152):
 *  1. iLovePDF — the table claimed "Limited tasks/day on free tier". The
 *     pricing page states no daily task cap at all; the free limit it does
 *     state is FILE SIZE per task, and its own "Batch processing" row reads
 *     Unlimited for free and paid alike. Corrected to the stated limit.
 *  2. TinyWow — the table priced ad-free at "~$6/month". The pricing page
 *     lists $20/month, or $15/month billed yearly. The ~$6 figure appears to
 *     have been a GBP category-plan price (£5.99) read as the USD ad-free one.
 *  3. SnapTik — the table credited it with "Sound as MP3: Yes" and downgraded
 *     its photo support to "Partial". Its own FAQ says the opposite on both:
 *     it declines to offer MP3 ("respects the intellectual property rights of
 *     the tracks") and it merges photo slideshows into MP4 automatically.
 *     We had been wrong in the competitor's favour on one and against them on
 *     the other, which is the signature of cells nobody checked.
 */

export type Source = {
  /** The exact page these answers were read from. */
  url: string;
  label: string;
  /** ISO date the page was fetched and read. */
  checked: string;
};

export type SourcedRow = {
  /** The question, phrased so both columns answer the same thing. */
  feature: string;
  /** What QRix does. A claim about us, verifiable in this repo. */
  qrix: string;
  /** What the vendor's own page states — or that it does not state it. */
  theirs: string;
  /** false when the vendor's page does not answer, so the UI can mark it. */
  stated: boolean;
};

export type VendorCompare = {
  sources: Source[];
  rows: SourcedRow[];
  /** Rendered under the table. Must describe the method, not sell. */
  sourceNote: string;
};

const D = "2026-08-01";

export const COMPARE_SOURCES: Record<string, VendorCompare> = {
  "qrix-vs-ilovepdf": {
    sources: [
      { url: "https://www.ilovepdf.com/pricing", label: "iLovePDF pricing page", checked: D },
    ],
    rows: [
      {
        feature: "Free-tier limit the vendor states",
        qrix: "No task or file-size cap; fair-use rate limiting only",
        theirs: "File size per task — its pricing table reads “Filesize per task: Limited” for Free and “Unlimited” for Premium. No daily task cap is stated.",
        stated: true,
      },
      {
        feature: "Free file-size ceiling, per tool",
        qrix: "Not capped — most PDF tools run in your browser, so the ceiling is your device",
        theirs: "Merge PDF 100 MB · Split PDF 100 MB · Compress PDF 200 MB on Free; 4 GB on Premium",
        stated: true,
      },
      {
        feature: "Batch processing",
        qrix: "Yes, free",
        theirs: "Its pricing table reads “Unlimited” for both Free and Premium",
        stated: true,
      },
      {
        feature: "Price to remove the limits",
        qrix: "Free",
        theirs: `Premium 4 US$/month billed annually (48 US$/year), or 7 US$/month billed monthly, as listed on ${D}`,
        stated: true,
      },
      {
        feature: "Signup required",
        qrix: "Never for the free tools",
        theirs: "Not stated on the pricing page — we did not create an account to find out",
        stated: false,
      },
      {
        feature: "On-device processing",
        qrix: "Most tools process files in your browser; the ones that upload say so on their own page",
        theirs: "Not stated on the pricing page",
        stated: false,
      },
      {
        feature: "Beyond PDF",
        qrix: "185+ tools: QR studio, barcode, image, AI, 3D, downloader",
        theirs: "Its pricing page covers PDF tools and iLoveSign; we did not audit its full catalogue",
        stated: false,
      },
    ],
    sourceNote:
      "Every iLovePDF cell above was read from its own pricing page on " +
      D +
      ", in raw markup. Prices are shown in the currency that page served us and may differ by region.",
  },

  "qrix-vs-tinywow": {
    sources: [
      { url: "https://tinywow.com/pricing", label: "TinyWow pricing page", checked: D },
    ],
    rows: [
      {
        feature: "Ads on the free tier",
        qrix: "None on tool pages",
        theirs: "Yes — its pricing page sells Premium with “No advertisements” as the first listed benefit",
        stated: true,
      },
      {
        feature: "CAPTCHAs on the free tier",
        qrix: "None",
        theirs: "Yes — “Skip all CAPTCHAs” is listed as a Premium benefit",
        stated: true,
      },
      {
        feature: "Processing priority",
        qrix: "One queue for everyone",
        theirs: "“Priority processing for faster results” is listed as a Premium benefit",
        stated: true,
      },
      {
        feature: "Price to remove ads",
        qrix: "Free",
        theirs: `Premium 20 US$/month, or 15 US$/month billed yearly (180 US$/year), as listed on ${D}`,
        stated: true,
      },
      {
        feature: "Cheaper single-category plans",
        qrix: "Not applicable — nothing is behind a plan",
        theirs: "Its plan data lists per-category plans (PDF, Image, Video, Write, Files) at 3 US$/month or 24 US$/year",
        stated: true,
      },
      {
        feature: "Signup required",
        qrix: "Never for the free tools",
        theirs: "Not stated on the pricing page — we did not create an account to find out",
        stated: false,
      },
      {
        feature: "On-device processing",
        qrix: "Most image/PDF tools run inside your browser",
        theirs: "Not stated on the pricing page",
        stated: false,
      },
    ],
    sourceNote:
      "Every TinyWow cell above was read from its own pricing page on " +
      D +
      ", in raw markup, including the plan data embedded in that page. Its plan list carries both USD and GBP rows, so the price you are quoted may differ by region.",
  },

  "qrix-vs-snaptik": {
    sources: [
      { url: "https://snaptik.app/", label: "SnapTik home page and FAQ", checked: D },
    ],
    rows: [
      {
        feature: "TikTok without the watermark",
        qrix: "Yes",
        theirs: "Yes — it describes itself as “No watermark, HD quality, works on all devices”",
        stated: true,
      },
      {
        feature: "Audio as MP3",
        qrix: "Yes",
        theirs: "No — its FAQ says it will not provide MP3 download, because it “respects the intellectual property rights of the tracks”",
        stated: true,
      },
      {
        feature: "Photo slideshow posts",
        qrix: "Yes",
        theirs: "Yes — it states it merges a TikTok photo slideshow's images and music into an MP4 automatically",
        stated: true,
      },
      {
        feature: "Other platforms",
        qrix: "Instagram, VK, OK, X, Pinterest, SoundCloud and 10 more in the same tool",
        theirs: "Its home page is TikTok-only; we did not audit its sister sites",
        stated: false,
      },
      {
        feature: "Third-party ad scripts in the served page",
        qrix: "None",
        theirs: "The HTML it served us carried 3 script tags and one external host (Google Tag Manager), plus an “Advertisement” slot in the markup",
        stated: true,
      },
      {
        feature: "Ad behaviour after you click Download",
        qrix: "Nothing — no interstitial, no pop-under",
        theirs: "Not measured. Reading the served HTML cannot establish what an ad slot fills with later, and we did not run their download flow.",
        stated: false,
      },
      {
        feature: "Signup required",
        qrix: "Never",
        theirs: "Not stated on the page we read",
        stated: false,
      },
    ],
    sourceNote:
      "Every SnapTik cell above was read from the page it served us on " +
      D +
      ". The ad row deliberately reports only what is in that markup: an ad slot and one external script host. What an ad slot later fills with is not something a fetched page can show, so this page does not claim it.",
  },
};

/** Cells whose vendor column the vendor's own page does not answer. */
export const NOT_STATED_COUNT = Object.values(COMPARE_SOURCES).reduce(
  (n, v) => n + v.rows.filter((r) => !r.stated).length,
  0,
);

export const COMPARE_CHECKED = D;
