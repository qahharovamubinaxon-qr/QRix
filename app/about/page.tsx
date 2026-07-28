import type { Metadata } from "next";
import Link from "next/link";
import LegalShell, { H2, P, UL } from "@/components/LegalShell";
import { pageMeta, jsonLd, breadcrumbLd, SITE_NAME, SITE_URL } from "@/lib/seo";
import { personLd, OPERATOR, OPERATOR_EMAIL, OPERATOR_TG, OPERATOR_TG_URL } from "@/lib/operator";
import { TG_CHANNEL, TG_CHANNEL_URL } from "@/lib/social";

/* M145. This page used to be four generic paragraphs, which meant the site
   failed Google's "Who created it?" question on every page — the single lowest
   score in the M142 audit (content 41/100). Every factual claim below is
   checkable against the repo, and the two paragraphs that matter most are the
   ones that give something up: what actually leaves your device, and which tool
   is not what its name says. An about page that only makes claims is worth
   nothing as a trust signal. */

export const metadata: Metadata = pageMeta({
  title: `About ${SITE_NAME} — who builds it, and why it's free`,
  description: `${SITE_NAME} is built and maintained by one developer. What it does, how the on-device tools actually work, exactly what leaves your device, and how to reach a human.`,
  path: "/about",
  keywords: ["about qrix", "who made qrix", "qrix privacy", "is qrix safe", "on-device qr generator"],
});

const A = { color: "var(--primary)" };

export default function Page() {
  return (
    <LegalShell title={`About ${SITE_NAME}`} updated="July 2026">
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={jsonLd([
          {
            "@context": "https://schema.org",
            "@type": "AboutPage",
            "@id": `${SITE_URL}/about`,
            name: `About ${SITE_NAME}`,
            url: `${SITE_URL}/about`,
            mainEntity: { "@id": `${SITE_URL}/about#operator` },
            publisher: { "@id": `${SITE_URL}/#organization` },
          },
          personLd(),
          breadcrumbLd([
            { name: "Home", path: "/" },
            { name: "About", path: "/about" },
          ]),
        ])}
      />

      <P>
        {SITE_NAME} is a free toolkit for the small digital chores that shouldn&rsquo;t
        need an account: making a QR code, merging a PDF, shrinking a photo. Most
        of it runs inside your browser rather than on a server, which is the
        reason it can be free with no signup, no watermark and no expiry.
      </P>

      <H2>Who builds it</H2>
      <P>
        One person. {SITE_NAME} is designed, built and maintained by{" "}
        <strong style={{ color: "var(--text)" }}>{OPERATOR.name}</strong> — a solo
        developer, not a company or a team. There is no support department behind
        this site: mail to{" "}
        <a href={`mailto:${OPERATOR_EMAIL}`} style={A}>{OPERATOR_EMAIL}</a> or{" "}
        <a href={OPERATOR_TG_URL} style={A} rel="me">@{OPERATOR_TG}</a> on Telegram
        reaches the person who wrote the code, and bug reports get read.
      </P>
      <P>
        That is worth stating plainly because it cuts both ways. A one-person
        project ships fixes the same day and answers its own email — and it also
        has no on-call rota, so treat {SITE_NAME} as a good tool rather than
        critical infrastructure, and keep your own copy of anything important.
      </P>

      <H2>Why it&rsquo;s free</H2>
      <P>
        Because the expensive part doesn&rsquo;t happen here. When a tool runs on your
        device, the work is done by <em>your</em> processor, and this site pays only
        to send you the page — which costs about the same whether you convert one
        file or two hundred. Tools that genuinely need a server (below) are the
        few that carry a real per-use cost, and those are the ones with limits.
      </P>
      <P>
        There is no free tier designed to run out: nothing expires and no feature
        is held back for an account. One honest caveat on the word
        &ldquo;watermark&rdquo; — the{" "}
        <Link href="/poster" style={A}>poster maker</Link> adds a small
        &ldquo;Made with {SITE_NAME}&rdquo; credit line by default, and there is a
        switch to turn it off before you export. Every other tool hands back your
        file untouched.
      </P>

      <H2>How the on-device tools actually work</H2>
      <P>
        &ldquo;Runs in your browser&rdquo; is a claim worth being specific about, so here is
        the machinery. PDFs are read and written with{" "}
        <span className="qx-mono">pdf.js</span> and{" "}
        <span className="qx-mono">pdf-lib</span>; images are resized, converted and
        re-compressed through the browser&rsquo;s own Canvas encoder; text is pulled out
        of scans by an OCR engine compiled to WebAssembly, and background removal
        runs a real neural network downloaded to your device and executed there.
        Finished files are handed to you through the browser&rsquo;s save dialog. Your
        file is passed between functions in the same tab that opened it — there is
        no upload step to skip, because there is no upload step.
      </P>
      <P>
        A practical consequence: those tools keep working with your network
        disconnected once the page has loaded. That is the easiest way to check
        this claim yourself rather than take it on trust, and it is a better test
        than anything this page could tell you.
      </P>

      <H2>What does leave your device</H2>
      <P>
        Three things, and naming them is the point — a privacy claim with no
        exceptions listed is usually just an unaudited one.
      </P>
      <UL>
        <li>
          <strong style={{ color: "var(--text)" }}>PDF to Word.</strong> Converting a
          PDF back into an editable document to a standard a desktop app would
          accept is beyond what a browser can do well, so{" "}
          <Link href="/pdf-tools/pdf-to-word" style={A}>that one tool</Link> sends
          your file to a conversion service when the high-fidelity mode is
          available, and says so on the page. It also offers on-device modes; pick
          those if the document is sensitive.
        </li>
        <li>
          <strong style={{ color: "var(--text)" }}>Dynamic QR codes and scan
          analytics.</strong> A QR code whose destination you can edit later has to
          point at a link on this server, so scans pass through it and get counted.
          That is the whole feature. A{" "}
          <Link href="/free-forever" style={A}>static QR code</Link> encodes your
          data directly and never contacts us at all — not even when scanned.
        </li>
        <li>
          <strong style={{ color: "var(--text)" }}>The media downloader.</strong> It
          fetches the file from the platform on your behalf, so the request is made
          from a server rather than your browser.
        </li>
      </UL>

      <H2>Where the numbers come from</H2>
      <P>
        Statistics quoted on this site carry a source and a date. The{" "}
        <Link href="/qr-code-statistics" style={A}>QR code statistics</Link> page is
        the clearest example of the standard: every figure names the study behind
        it and states what it does <em>not</em> prove, and four numbers that get
        quoted constantly elsewhere are listed as rejected, with the reason. If a
        claim on this site has no source, treat it as an error and tell me.
      </P>

      <H2>Known rough edges</H2>
      <P>
        Kept public on purpose. The{" "}
        <Link href="/image-tools/upscale" style={A}>image upscaler</Link> is named
        as an AI tool and is not one — it is a high-quality sharpening enlarger,
        with no model involved. It does a decent job on photos and logos; it will
        not invent detail that was never in the file, and the name overpromises
        until it is either renamed or given a real model. The rest of the AI
        category runs on your device, which also means it is bounded by what your
        device can do.
      </P>

      <H2>Contact</H2>
      <P>
        Email{" "}
        <a href={`mailto:${OPERATOR_EMAIL}`} style={A}>{OPERATOR_EMAIL}</a>, Telegram{" "}
        <a href={OPERATOR_TG_URL} style={A} rel="me">@{OPERATOR_TG}</a>, or the{" "}
        <a href={TG_CHANNEL_URL} style={A} rel="me">@{TG_CHANNEL}</a> channel for
        what&rsquo;s new. Feature requests and &ldquo;this is broken&rdquo; reports are equally
        welcome — see also the <Link href="/contact" style={A}>contact page</Link>.
      </P>
    </LegalShell>
  );
}
