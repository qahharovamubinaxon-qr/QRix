/* The dataset behind /qr-code-statistics.
 *
 * Why this is a module and not JSX: the page, the JSON-LD and the test suite
 * all have to agree on the same numbers, and the one rule the page sells is
 * that no figure ships without a source you can open. That rule is only real
 * if something enforces it — npm run test:qr-stats asserts it against this
 * file, so a stat added in a hurry without a citation fails the build step
 * rather than quietly going live.
 *
 * Every entry below was read off the linked page by hand on 2026-07-22.
 * `kind` is not decoration: it is how much weight the number can carry.
 *   government        — a state body publishing its own operational data
 *   analyst           — a paid research house; methodology is behind the paywall
 *   vendor-platform   — a company counting events on its own platform
 *   vendor-survey     — a company polling an audience it also sells to
 *   regulator         — a consumer-protection body's own published warning
 * `caveat` is mandatory on anything that is not `government`, because every
 * one of these numbers is a measurement of something narrower than the
 * headline suggests, and that is the part roundup posts drop.
 */

export type SourceKind = "government" | "analyst" | "vendor-platform" | "vendor-survey" | "regulator";

export type Source = {
  name: string;
  /** The exact page the figure was read from. */
  url: string;
  kind: SourceKind;
  /** Publication date of that page, as stated on it. */
  published: string;
};

export type Stat = {
  id: string;
  /** The headline figure, formatted for display. */
  value: string;
  /** What the figure actually counts — written to survive being quoted alone. */
  claim: string;
  /** The window the figure covers. */
  period: string;
  source: Source;
  /** What this number does NOT prove. Required unless the source is a government one. */
  caveat?: string;
};

export type StatGroup = {
  id: string;
  title: string;
  intro: string;
  stats: Stat[];
};

/* ------------------------------------------------------------------ sources */

const JUNIPER: Source = {
  name: "Juniper Research — “QR Code Payments to Exceed $8tn by 2029”",
  url: "https://www.juniperresearch.com/press/qr-code-payments-to-exceed-8tn-by-2029/",
  kind: "analyst",
  published: "10 February 2025",
};

const NPCI_GOV: Source = {
  name: "NewsOnAir (Government of India), reporting NPCI figures",
  url: "https://www.newsonair.gov.in/upi-transaction-volume-rises-29-year-on-year-to-21-63-billion-in-december",
  kind: "government",
  published: "1 January 2026",
};

const BITLY_SCANS: Source = {
  name: "Bitly — “The State of QR Code Scans in 2026”",
  url: "https://bitly.com/blog/state-of-qr-code-scans-2026/",
  kind: "vendor-platform",
  published: "10 March 2026",
};

const BITLY_SURVEY: Source = {
  name: "Bitly — 2025 marketer survey, published in its QR statistics roundup",
  url: "https://bitly.com/blog/qr-code-statistics/",
  kind: "vendor-survey",
  published: "2025",
};

export const FTC_ALERT: Source = {
  name: "US Federal Trade Commission — consumer alert on QR codes in unexpected packages",
  url: "https://consumer.ftc.gov/consumer-alerts/2025/01/scam-alert-qr-code-unexpected-package",
  kind: "regulator",
  published: "January 2025",
};

/* A vendor's platform telemetry is a census of that vendor, nothing wider. */
const PLATFORM_CAVEAT =
  "Counted on one provider's platform. It measures how that provider's customers behave, not the world's QR traffic.";

/* ------------------------------------------------------------------- groups */

export const STAT_GROUPS: StatGroup[] = [
  {
    id: "payments",
    title: "Scan-to-pay",
    intro:
      "The largest QR number by far is money, not marketing — and it is the one area where a forecast from a paid research house is the best public figure available.",
    stats: [
      {
        id: "pay-2025-value",
        value: "$5.4 trillion",
        claim: "Global value of payments made by scanning a QR code.",
        period: "2025",
        source: JUNIPER,
        caveat:
          "A research-house estimate, not a settled total. The methodology behind it sits inside a paid report, so it cannot be independently recomputed from the press release.",
      },
      {
        id: "pay-2029-value",
        value: "over $8 trillion",
        claim: "Forecast value of QR code payments by 2029.",
        period: "2029 (forecast)",
        source: JUNIPER,
        caveat: "A forecast published in early 2025 — it predates the market it describes.",
      },
      {
        id: "pay-growth",
        value: "+50%",
        claim: "Forecast growth in QR payment value between 2025 and 2029.",
        period: "2025 → 2029",
        source: JUNIPER,
        caveat: "Derived from the two forecast endpoints above, so it inherits their uncertainty.",
      },
      {
        id: "pay-scope",
        value: "61 countries",
        claim:
          "Countries covered by the dataset the payment forecasts are drawn from — the scope figure that tells you how global “global” is here.",
        period: "2025",
        source: JUNIPER,
        caveat: "Scope, not a market measurement. Included so the forecasts above can be read in context.",
      },
    ],
  },
  {
    id: "india",
    title: "India, where scan-to-pay is ordinary",
    intro:
      "India publishes its real-time payment volumes as official statistics, which makes this the most solid tier of evidence on this page. UPI is the rail; a very large share of its in-person use is a QR scan.",
    stats: [
      {
        id: "upi-volume",
        value: "21.63 billion",
        claim: "UPI transactions processed in a single month.",
        period: "December 2025",
        source: NPCI_GOV,
      },
      {
        id: "upi-daily",
        value: "698 million/day",
        claim: "Average daily UPI transaction count across the month.",
        period: "December 2025",
        source: NPCI_GOV,
      },
      {
        id: "upi-growth",
        value: "+29%",
        claim: "Year-on-year growth in UPI transaction volume.",
        period: "December 2025 vs December 2024",
        source: NPCI_GOV,
      },
      {
        id: "upi-value-growth",
        value: "+20%",
        claim:
          "Year-on-year growth in UPI transaction value, against ₹28 lakh crore for the month — value is growing more slowly than volume, i.e. the average payment is getting smaller.",
        period: "December 2025 vs December 2024",
        source: NPCI_GOV,
      },
    ],
  },
  {
    id: "scans",
    title: "Are scans still growing?",
    intro:
      "The interesting question is not how many codes exist but whether people still scan them. The strongest available signal is a provider comparing scans against codes created on its own platform: if scans outrun creations, the installed base is getting more use, not less.",
    stats: [
      {
        id: "scan-eu",
        value: "+42%",
        claim: "Change in scan rate in Europe — the fastest-growing region in the report.",
        period: "2024 → 2025",
        source: BITLY_SCANS,
        caveat: PLATFORM_CAVEAT,
      },
      {
        id: "scan-latam",
        value: "+40%",
        claim: "Change in scan rate in Latin America.",
        period: "2024 → 2025",
        source: BITLY_SCANS,
        caveat: PLATFORM_CAVEAT,
      },
      {
        id: "scan-apac",
        value: "+21%",
        claim: "Change in scan rate in Asia-Pacific.",
        period: "2024 → 2025",
        source: BITLY_SCANS,
        caveat: PLATFORM_CAVEAT,
      },
      {
        id: "scan-mena",
        value: "+18%",
        claim: "Change in scan rate across the Middle East and North Africa.",
        period: "2024 → 2025",
        source: BITLY_SCANS,
        caveat: PLATFORM_CAVEAT,
      },
      {
        id: "scan-ssa",
        value: "+10%",
        claim: "Change in scan rate in Sub-Saharan Africa.",
        period: "2024 → 2025",
        source: BITLY_SCANS,
        caveat: PLATFORM_CAVEAT,
      },
      {
        id: "scan-na",
        value: "+8%",
        claim:
          "Change in scan rate in North America — the slowest of the six regions, which reads as a mature market rather than a declining one.",
        period: "2024 → 2025",
        source: BITLY_SCANS,
        caveat: PLATFORM_CAVEAT,
      },
      {
        id: "scan-vs-create-eu",
        value: "+7% codes, +53% scans",
        claim:
          "Europe created barely more QR codes but scanned them far more often — the clearest published evidence against the “QR fatigue” story.",
        period: "2024 → 2025",
        source: BITLY_SCANS,
        caveat:
          PLATFORM_CAVEAT +
          " The same report also gives Europe as +42% in its regional table; the published text does not make clear whether the two figures measure the same thing, so both are reproduced here as printed.",
      },
      {
        id: "scan-vs-create-latam",
        value: "+0.5% codes, +41% scans",
        claim: "Latin America added almost no new codes while scans of the existing ones grew by two fifths.",
        period: "2024 → 2025",
        source: BITLY_SCANS,
        caveat: PLATFORM_CAVEAT,
      },
    ],
  },
  {
    id: "marketers",
    title: "What marketers say they do",
    intro:
      "These come from a survey run by a QR code vendor among marketers. That is worth knowing before quoting any of them: the sample is people who already buy this category, asked by the company selling it. Read them as a picture of practice inside the industry, not as evidence that QR codes work.",
    stats: [
      {
        id: "mk-use",
        value: "over 90%",
        claim: "Marketers surveyed who say they use QR codes.",
        period: "2025",
        source: BITLY_SURVEY,
        caveat: "Vendor survey of an audience that self-selects into the category. Treat as directional only.",
      },
      {
        id: "mk-increased",
        value: "94%",
        claim: "Say they increased their use of QR codes over the previous 12 months.",
        period: "2025",
        source: BITLY_SURVEY,
        caveat: "Self-reported change, with no baseline volume published alongside it.",
      },
      {
        id: "mk-sentiment",
        value: "88%",
        claim: "Believe consumer sentiment toward QR codes improved over the previous 12 months.",
        period: "2025",
        source: BITLY_SURVEY,
        caveat: "This measures what marketers believe consumers think — not what consumers think.",
      },
      {
        id: "mk-plan",
        value: "86%",
        claim: "Plan to increase QR code use over the next 12 months.",
        period: "2025",
        source: BITLY_SURVEY,
        caveat: "A stated intention, not a spend commitment.",
      },
      {
        id: "mk-dynamic",
        value: "69%",
        claim:
          "Update or redirect a dynamic QR code at least monthly — the single most useful number here, because it explains why dynamic codes exist at all.",
        period: "2025",
        source: BITLY_SURVEY,
        caveat: "Asked of marketers already using dynamic codes, so it cannot be read as adoption of dynamic codes.",
      },
      {
        id: "mk-exclusive",
        value: "39%",
        claim: "Name exclusive content as the strongest reason a person will scan.",
        period: "2025",
        source: BITLY_SURVEY,
        caveat: "An opinion about what works, not a measurement of scan rates.",
      },
      {
        id: "mk-discount",
        value: "33%",
        claim: "Name a discount or promotional offer as the strongest reason to scan.",
        period: "2025",
        source: BITLY_SURVEY,
        caveat: "Same survey question as above; the two options split the field roughly evenly.",
      },
      {
        id: "mk-metric",
        value: "54%",
        claim: "Say unique users is the QR metric they value most, ahead of raw scan counts.",
        period: "2025",
        source: BITLY_SURVEY,
        caveat: "Preference, not practice — the survey does not report what they actually track.",
      },
      {
        id: "mk-roi",
        value: "87%",
        claim:
          "Name understanding what happens after the scan as their biggest measurement problem — the honest admission buried in a promotional survey.",
        period: "2025",
        source: BITLY_SURVEY,
        caveat: "Self-reported difficulty. Included because it cuts against the survey's own interest.",
      },
      {
        id: "mk-ai",
        value: "84%",
        claim: "Say they plan to combine QR codes with AI or machine learning.",
        period: "2025",
        source: BITLY_SURVEY,
        caveat:
          "A 2025 intention question about AI, asked of marketers. Intention questions about AI in 2025 ran high across every category.",
      },
    ],
  },
];

export const ALL_STATS: Stat[] = STAT_GROUPS.flatMap((g) => g.stats);

/* ---------------------------------------------------------------- rejected */

export type Rejected = {
  claim: string;
  /** Why it is not on the page above. Written from what we actually checked. */
  finding: string;
};

/* Numbers we went looking for, found everywhere, and could not stand behind.
   Checked 2026-07-22. This section is the point of the page: the reason our
   list is shorter than a "80+ QR statistics" post is that those posts include
   these. */
export const REJECTED: Rejected[] = [
  {
    claim: "“Over 2 billion QR codes are scanned every day.”",
    finding:
      "No primary source. It appears in roundup after roundup with no study behind it, and several of the same pages also print an annual worldwide scan total far smaller than 2 billion a day would imply. A figure that contradicts its own page cannot be repeated.",
  },
  {
    claim: "“Worldwide scans reached 130,115,528, up 211.5%.”",
    finding:
      "Quoted as a global census. A count to the single digit can only come from one platform's logs, which makes it that platform's number, not the world's — and it sits on pages that simultaneously claim billions of scans per day.",
  },
  {
    claim: "“84% of mobile users have scanned a QR code at least once.”",
    finding:
      "We could not identify the survey: no sample size, no fieldwork date, no publisher named anywhere in the chain of pages repeating it.",
  },
  {
    claim: "The widely-quoted QR phishing percentages (“12% of phishing attacks”, “68% target mobile”).",
    finding:
      "Traced to a roundup listing 69 quishing statistics that attributes only three or four of them to a named report. The underlying vendor telemetry may well be sound, but nothing published lets a reader check which vendor measured what, over what period.",
  },
];

/* ------------------------------------------------------- the embeddable card */
/* /qr-code-statistics asks to be cited in prose, which is a request, not a
   mechanism. The card at /embed/qr-stat/<id> is the mechanism: a blogger who
   quotes one of these figures can paste an iframe that carries the number, the
   period, the source's own name and date, the tier badge and the caveat — and a
   link back here. It is the caveat travelling with the number that makes this
   worth shipping rather than just a backlink trick, since the failure mode this
   whole page exists to fight is a figure quoted with none of its conditions. */

/** Tier wording and colour, shared by the page and the embed so a badge cannot
 *  mean one thing in the card and another in the iframe. */
export const KIND_LABEL: Record<SourceKind, string> = {
  government: "Government statistic",
  regulator: "Regulator",
  analyst: "Research house",
  "vendor-platform": "Vendor platform data",
  "vendor-survey": "Vendor survey",
};

export const KIND_TONE: Record<SourceKind, string> = {
  government: "var(--success)",
  regulator: "var(--success)",
  analyst: "var(--primary-bright)",
  "vendor-platform": "var(--primary-bright)",
  "vendor-survey": "var(--text-faint)",
};

/** Width the height below is computed for. An embedder sets width="100%", so the
 *  rendered width is the HOST's column and we cannot know it — 320 is the narrow
 *  case inside a typical blog body, and sizing for it means the card never
 *  clips. A wider column just leaves slack, which is invisible because the embed
 *  paints no background of its own and centres the card in whatever it is given. */
export const EMBED_WIDTH_BASIS = 320;

/** Height for a stat's iframe, in px. Deterministic, so the snippet on the page
 *  and any test agree without measuring a browser.
 *
 *  M141 recalibrated this against the real thing, and found the first version
 *  short on ALL 26 cards — by 30 to 102 px, i.e. every embedded card was cutting
 *  off its own footer and, on the worst, its caveat. That is the one part of the
 *  card that must survive, so the numbers below are not guesses any more: each
 *  term is the CSS in lib/qr-stat-embed.ts, and the constant is what 26 cards
 *  actually measured at 320px in headless Chrome (model fits every card ±1 px).
 *
 *  Only the LINE COUNTS are estimated, and the divisors sit under the TIGHTEST
 *  packing in the dataset, not the loosest: a 43-character caveat wrapped onto
 *  two lines (21.5 chars/line) while a 305-character one fitted 50.8, because
 *  wrapping depends on where the long words fall. Sizing to the loose numbers
 *  left five cards still clipping. Rounding up costs slack, and slack is
 *  invisible — the card centres and paints no background of its own. */
export function embedHeight(s: Stat): number {
  /* chars that fit on one line at EMBED_WIDTH_BASIS, per text style */
  const lines = (text: string, perLine: number) => Math.max(1, Math.ceil(text.length / perLine));

  const figure = lines(s.value, 18) * 22.4;                                   // clamp() floor, 1.4rem × 1
  const claim = lines(s.claim, 36) * 21.125;                                  // 13px × 1.625
  const caveat = s.caveat ? 6.5 + lines(s.caveat, 40) * 16.25 : 0;            // 10px × 1.625, + flex gap
  const source = lines(`${s.source.name} · ${s.source.published}`, 36) * 15.125; // 11px × 1.375
  /* the tier badge and the period share one flex row and wrap onto two at ~40
     mono chars; assumed above 36, which costs 18 px of invisible slack when wrong */
  const badgeWrap = KIND_LABEL[s.source.kind].length + s.period.length > 36 ? 18 : 0;
  /* margins + badge row + footer + card padding + border + body padding */
  const CHROME = 146.1;

  return Math.ceil(CHROME + figure + claim + caveat + source + badgeWrap) + 8; // 8px deliberate slack
}

/** The snippet an embedder pastes. Kept here so the page, the widgets directory
 *  and the tests cannot render three different versions of it. */
export function embedSnippet(s: Stat, siteUrl: string): string {
  return (
    `<iframe src="${siteUrl}/embed/qr-stat/${s.id}" width="100%" height="${embedHeight(s)}" ` +
    `style="border:0;max-width:640px" loading="lazy" ` +
    `title="${s.claim.replace(/"/g, "&quot;")}"></iframe>`
  );
}
