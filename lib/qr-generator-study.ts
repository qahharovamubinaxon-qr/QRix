/* The dataset behind /free-qr-code-generator-comparison.
 *
 * WHY THIS EXISTS. /free-forever shipped the sentence "A test of 20 'free' QR
 * generators found 14 had hidden limits". No such test existed. Under the
 * fabrication rule (M143) an unsourced number is a fabrication, so M148 ran the
 * study for real and the page's number now follows the study rather than the
 * other way round. The measured figure is 13, not 14, and the site was changed
 * to say 13.
 *
 * METHOD, and its limits, stated up front because they bound every claim below.
 * Each vendor's own live pricing and/or FAQ page was fetched on the date in
 * `checked` and read for six specific questions. What is recorded is what the
 * VENDOR STATES ABOUT ITSELF on that page. No accounts were created, no cards
 * were entered, and no code was pushed through a signup flow — so nothing here
 * is a claim about behaviour observed inside a logged-in product. Where a page
 * did not answer a question, the answer is `unknown`, never a guess. That is
 * the same rule /qr-code-statistics runs on, and it is the reason this page can
 * be cited: a vendor can disagree with the reading, but the page it was read
 * from is linked next to every line.
 *
 * A vendor changing its pricing does not make this page wrong — it makes it
 * dated. That is why `checked` is per-vendor and rendered next to every row.
 */

export type Verdict = "ok" | "limit" | "na" | "unknown";

export type Check = {
  v: Verdict;
  /** What the vendor's page actually says. Written to survive being quoted alone. */
  note: string;
};

/** The six questions every vendor was read for, in table order. */
export type Checks = {
  /** Do the free codes keep working indefinitely? */
  permanent: Check;
  /** Can you get a usable code without creating an account? */
  noAccount: Check;
  /** Is there a free dynamic (editable) code, and what switches it off? */
  freeDynamic: Check;
  /** Is there a cap on how many times a free code can be scanned? */
  scanCap: Check;
  /** Is print-quality vector output (SVG/EPS/PDF) available for free? */
  vector: Check;
  /** Is the free output free of the vendor's watermark, branding or ads? */
  unbranded: Check;
};

export type Vendor = {
  id: string;
  name: string;
  host: string;
  /** The exact page these answers were read from. */
  sourceUrl: string;
  sourceLabel: string;
  /** ISO date the page was fetched and read. */
  checked: string;
  /** static = no accounts, no dashboard. platform = account-based product. */
  shape: "static-only" | "platform";
  checks: Checks;
  /** The single sentence that decides the verdict. */
  headline: string;
};

const OK = (note: string): Check => ({ v: "ok", note });
const LIMIT = (note: string): Check => ({ v: "limit", note });
const NA = (note: string): Check => ({ v: "na", note });
const UNK = (note: string): Check => ({ v: "unknown", note });

const D = "2026-07-30";

export const VENDORS: Vendor[] = [
  /* ---------------------------------------------------------------- clean */
  {
    id: "qrcode-monkey",
    name: "QRCode Monkey",
    host: "qrcode-monkey.com",
    sourceUrl: "https://www.qrcode-monkey.com/",
    sourceLabel: "Homepage + FAQ",
    checked: D,
    shape: "static-only",
    headline: "Says its static codes never expire and have no scan limit, and gives away the vector formats most tools charge for.",
    checks: {
      permanent: OK("Its FAQ states the codes do not expire and will work forever, because they are static."),
      noAccount: OK("The generator runs on the homepage. The sign-up links go to a separate paid PRO product, not to the free generator."),
      freeDynamic: NA("No free dynamic code. Editable codes are the paid PRO product."),
      scanCap: OK("Its FAQ answers the scan-limit question directly: there is none."),
      vector: OK("SVG, EPS and PDF are offered on the free generator, and the site notes most free makers do not offer vector at all."),
      unbranded: OK("States all generated codes are free for any use, including commercial."),
    },
  },
  {
    id: "goqr-me",
    name: "goQR.me",
    host: "goqr.me",
    sourceUrl: "https://goqr.me/",
    sourceLabel: "Homepage + FAQ",
    checked: D,
    shape: "static-only",
    headline: "Static only, and honest about why: the data lives in the graphic, so there is nothing on a server to switch off.",
    checks: {
      permanent: OK("Its FAQ explains that technically the codes cannot expire, because the information is stored in the graphic itself."),
      noAccount: OK("Downloads are offered directly from the generator page."),
      freeDynamic: NA("None. The FAQ says static codes cannot be converted to dynamic and points at a separate paid management product."),
      scanCap: OK("No cap stated; a static code is decoded by the phone, so the site has no way to count or cap scans."),
      vector: OK("Lists PNG, JPG, GIF, SVG, EPS and PDF as supported download formats."),
      unbranded: UNK("Not stated on the pages checked."),
    },
  },
  {
    id: "forqrcode",
    name: "ForQRCode",
    host: "forqrcode.com",
    sourceUrl: "https://forqrcode.com/",
    sourceLabel: "Homepage + FAQ",
    checked: D,
    shape: "static-only",
    headline: "Free vector output and no scan limit, stated on the page — a straightforward static generator.",
    checks: {
      permanent: OK("The page's own summary line says the codes never expire."),
      noAccount: OK("Generation and download happen on the page; no account is asked for."),
      freeDynamic: NA("No dynamic code offered; the site explains the difference and only makes static ones."),
      scanCap: OK("States its codes are not limited by number of scans."),
      vector: OK("SVG, PDF and EPS offered free, alongside PNG."),
      unbranded: OK("The watermark control is for the user's own logo, not the vendor's branding."),
    },
  },
  {
    id: "qr-code-generator-org",
    name: "QR Code Generator (.org)",
    host: "qr-code-generator.org",
    sourceUrl: "https://www.qr-code-generator.org/",
    sourceLabel: "Homepage",
    checked: D,
    shape: "static-only",
    headline: "Puts 'No Sign Up' in its own heading and offers free vector formats.",
    checks: {
      permanent: UNK("Expiry is not addressed on the page checked. The codes are static, which is the mechanism that makes expiry impossible."),
      noAccount: OK("The page's own heading is 'Free QR Code Generator No Sign Up'."),
      freeDynamic: NA("None offered. There is no account, no dashboard and no redirect domain — the page makes a file and hands it over."),
      scanCap: UNK("Not stated on the page checked. A static code is decoded by the phone, so there is no counter to cap."),
      vector: OK("Available formats listed as PNG, SVG and PDF, described as free vector formats for print."),
      unbranded: OK("The watermark option applies the user's own image."),
    },
  },
  {
    id: "shopify",
    name: "Shopify QR Code Generator",
    host: "shopify.com",
    sourceUrl: "https://www.shopify.com/tools/qr-code-generator",
    sourceLabel: "Tool page + FAQ",
    checked: D,
    shape: "static-only",
    headline: "Answers the signup question with a flat no, and states unlimited usage with no expiry.",
    checks: {
      permanent: OK("Its FAQ answers 'Do QR codes expire?' with no, and states every code stays active unless deleted."),
      noAccount: OK("Asked directly whether a Shopify account is needed, the FAQ says no — the tool is for anyone, not only merchants."),
      freeDynamic: UNK("The FAQ mentions dynamic codes generally; it does not state a free dynamic tier on this tool."),
      scanCap: OK("States static codes are permanent and have no scan limit."),
      vector: UNK("Download formats are not listed on the page checked."),
      unbranded: UNK("Not stated on the page checked."),
    },
  },
  {
    id: "adobe-express",
    name: "Adobe Express",
    host: "adobe.com",
    sourceUrl: "https://www.adobe.com/express/feature/image/qr-code-generator",
    sourceLabel: "Feature page",
    checked: D,
    shape: "platform",
    headline: "Explicitly markets the absence of a time limit — but the listed download formats stop short of vector SVG.",
    checks: {
      permanent: OK("States codes made in Express never expire and contrasts itself with free tools that put a time limit on generated codes."),
      noAccount: UNK("Not stated on the page checked. Express is an account product, so this is the one to test yourself."),
      freeDynamic: NA("Not offered on this feature; the page describes static codes only."),
      scanCap: UNK("Not stated on the page checked."),
      vector: LIMIT("Downloads are listed as PNG, JPEG and PDF. SVG is not among them, so there is no true vector path for print scaling."),
      unbranded: UNK("Not stated on the page checked."),
    },
  },

  /* -------------------------------------------------------------- limited */
  {
    id: "qr-tiger",
    name: "QR TIGER",
    host: "qrcode-tiger.com",
    sourceUrl: "https://www.qrcode-tiger.com/faq",
    sourceLabel: "FAQ",
    checked: D,
    shape: "platform",
    headline: "Free dynamic codes exist but carry a 500-scan ceiling each, and the vendor's own ads appear to the people who scan them.",
    checks: {
      permanent: OK("Free static codes are unlimited in number and never expire, per its FAQ."),
      noAccount: LIMIT("Dynamic codes require an account; the FAQ routes every dynamic action through a dashboard login."),
      freeDynamic: LIMIT("Three free dynamic codes, and its FAQ adds that if a plan expires the codes stop working."),
      scanCap: LIMIT("500 scans per free dynamic code. The FAQ states unlimited scans apply to paid plans only."),
      vector: UNK("SVG is discussed as a format; the FAQ does not state which tier it is available on."),
      unbranded: LIMIT("Its FAQ states the vendor's ads display when a code generated on the free version is scanned, and disappear on a paid plan."),
    },
  },
  {
    id: "uniqode",
    name: "Uniqode (ex-Beaconstac)",
    host: "uniqode.com",
    sourceUrl: "https://www.uniqode.com/pricing",
    sourceLabel: "Pricing FAQ",
    checked: D,
    shape: "platform",
    headline: "The clearest statement of the trap on any page in this study: the account has to stay active for the codes to work.",
    checks: {
      permanent: LIMIT("Static codes survive, but only in the sense that the graphic still decodes — its FAQ says once the trial ends you can no longer access the account."),
      noAccount: LIMIT("Account required; the free entry point is a trial, not a free plan."),
      freeDynamic: LIMIT("Trial only. The FAQ has a dedicated question for what happens to dynamic codes when the trial expires."),
      scanCap: LIMIT("Plans carry scan limits, and its FAQ states they reset annually rather than monthly — so a busy month cannot be waited out."),
      vector: UNK("Not stated on the page checked."),
      unbranded: UNK("Not stated on the page checked."),
    },
  },
  {
    id: "tqrcg",
    name: "The QR Code Generator",
    host: "the-qrcode-generator.com",
    sourceUrl: "https://www.the-qrcode-generator.com/pricing",
    sourceLabel: "Pricing table + FAQ",
    checked: D,
    shape: "platform",
    headline: "Its own feature table marks 'watermark-free QR codes' with a cross on the free plan — the watermark is the free tier.",
    checks: {
      permanent: LIMIT("Static codes are unlimited, but its FAQ states that once the trial expires all dynamic codes created become inactive apart from two."),
      noAccount: LIMIT("The free plan is an account plan; the page's primary call to action is 'Sign up free'."),
      freeDynamic: LIMIT("Two dynamic codes on the free plan. Anything created above that during the trial goes inactive when the trial ends."),
      scanCap: UNK("Not stated for the free plan on the page checked."),
      vector: UNK("Not stated on the page checked."),
      unbranded: LIMIT("'Watermark-free QR codes' is a paid row in the comparison table, marked with a cross on the free plan and a tick on every paid one."),
    },
  },
  {
    id: "qr-code-generator-com",
    name: "QR Code Generator (.com)",
    host: "qr-code-generator.com",
    sourceUrl: "https://www.qr-code-generator.com/pricing/",
    sourceLabel: "Pricing FAQ",
    checked: D,
    shape: "platform",
    headline: "The 'free' entry point is a 14-day trial that you continue by supplying payment details.",
    checks: {
      permanent: LIMIT("What survives is what the trial leaves behind; the pricing FAQ frames continuation as providing payment details."),
      noAccount: LIMIT("A free account must be created to start."),
      freeDynamic: LIMIT("Dynamic codes are the paid product. The free route is the 14-day trial."),
      scanCap: LIMIT("Scans are a metered row in the plan table."),
      vector: UNK("Not stated on the page checked."),
      unbranded: UNK("Not stated on the page checked."),
    },
  },
  {
    id: "bitly",
    name: "Bitly",
    host: "bitly.com",
    sourceUrl: "https://bitly.com/pages/pricing",
    sourceLabel: "Pricing table",
    checked: D,
    shape: "platform",
    headline: "The free plan is real and open-ended — it is just two QR codes per month.",
    checks: {
      permanent: UNK("Not stated for the free plan on the page checked."),
      noAccount: LIMIT("Account required; the free plan is a signed-up plan."),
      freeDynamic: LIMIT("Two QR codes per month on the free plan, against 5 / 10 / 200 on the paid tiers."),
      scanCap: OK("The free plan row states unlimited clicks and QR code scans."),
      vector: UNK("The download-format row lists PNG, JPEG and SVG across plans; the page's flattened table does not let the free row be read with certainty."),
      unbranded: UNK("Not stated on the page checked."),
    },
  },
  {
    id: "qrcodechimp",
    name: "QRCodeChimp",
    host: "qrcodechimp.com",
    sourceUrl: "https://www.qrcodechimp.com/pricing",
    sourceLabel: "Pricing FAQ",
    checked: D,
    shape: "platform",
    headline: "Calls the plan 'Free Forever', then pauses your scans for the rest of the month at 1,000.",
    checks: {
      permanent: LIMIT("Its FAQ says the code stays valid, but a dynamic one is paused when its monthly scan limit is reached."),
      noAccount: LIMIT("The free plan's own call to action is a signup, and the scan pool is metered per account."),
      freeDynamic: LIMIT("Dynamic codes are included on the free plan but share one monthly scan pool."),
      scanCap: LIMIT("1,000 scans per month across all dynamic codes combined. Its FAQ states scans are paused on reaching it and reopen next month."),
      vector: UNK("Not stated on the page checked."),
      unbranded: UNK("Not stated on the page checked."),
    },
  },
  {
    id: "qrstuff",
    name: "QRStuff",
    host: "qrstuff.com",
    sourceUrl: "https://www.qrstuff.com/pricing",
    sourceLabel: "Pricing table + FAQ",
    checked: D,
    shape: "platform",
    headline: "Caps the free plan at five static codes — the only tool here that rations the format that costs it nothing to serve.",
    checks: {
      permanent: LIMIT("Its FAQ states static codes remain permanent after cancellation, but dynamic codes follow plan terms — and it answers 'do my QR codes expire if I cancel' with yes for dynamic."),
      noAccount: LIMIT("The free plan is an account plan; both the static and dynamic quotas are counted per account."),
      freeDynamic: LIMIT("Ten dynamic codes with limited data types on the free plan."),
      scanCap: LIMIT("The comparison table carries both a 'Monthly Scan Limit' and a 'Time Limit' row across plans."),
      vector: LIMIT("SVG appears as a plan-differentiated row rather than a free-for-all format."),
      unbranded: UNK("Not stated on the page checked."),
    },
  },
  {
    id: "me-qr",
    name: "ME-QR",
    host: "me-qr.com",
    sourceUrl: "https://me-qr.com/faq",
    sourceLabel: "Pricing + FAQ",
    checked: D,
    shape: "platform",
    headline: "Genuinely uncapped on scans and lifetime — and it puts its own ads in front of the people who scan your code.",
    checks: {
      permanent: OK("Its FAQ states the codes have no time limit and can be used for as long as needed."),
      noAccount: LIMIT("Its FAQ repeatedly requires the code to be 'in the account' for it to be managed or de-branded."),
      freeDynamic: OK("The free plan includes dynamic codes with unlimited creation, per its pricing table."),
      scanCap: OK("Its FAQ answers the scanning-limit question with a flat no."),
      vector: UNK("Not stated on the pages checked."),
      unbranded: LIMIT("Its FAQ confirms ads are removed on a paid subscription, which is the same as saying the free tier's scans carry them."),
    },
  },
  {
    id: "flowcode",
    name: "Flowcode",
    host: "flowcode.com",
    sourceUrl: "https://www.flowcode.com/pricing",
    sourceLabel: "Pricing table",
    checked: D,
    shape: "platform",
    headline: "The code is not capped, the measurement is: free analytics stop at 500 scans.",
    checks: {
      permanent: OK("Its generator page states the codes never expire and scans are unlimited."),
      noAccount: LIMIT("The free tier's call to action is 'Sign up for free'."),
      freeDynamic: LIMIT("Dynamic codes sit on the plan ladder; the free entry is the constrained one."),
      scanCap: LIMIT("Analytics for up to 500 scans on the entry tier, against 6,000 and 10,000 above it — the scan itself works, the reporting stops."),
      vector: UNK("Not stated on the page checked."),
      unbranded: UNK("Not stated on the page checked."),
    },
  },
  {
    id: "unitag",
    name: "Unitag",
    host: "unitag.io",
    sourceUrl: "https://www.unitag.io/qrcode",
    sourceLabel: "QR page FAQ + pricing",
    checked: D,
    shape: "platform",
    headline: "Free gets you a 1200×1200 PNG. Vector for print starts two tiers up.",
    checks: {
      permanent: UNK("Not answered directly; its FAQ redirects the expiry question to how dynamic codes are edited."),
      noAccount: LIMIT("The page's call to action is 'Start free trial'."),
      freeDynamic: LIMIT("Editing a dynamic code requires a Live subscription, per its FAQ."),
      scanCap: OK("Its pricing page states unlimited scans with no per-scan fees on every plan."),
      vector: LIMIT("Free output is an HD PNG. Its FAQ states SVG, PDF and JPEG start with the Silver plan."),
      unbranded: UNK("Not stated on the pages checked."),
    },
  },
  {
    id: "scanova",
    name: "Scanova",
    host: "scanova.io",
    sourceUrl: "https://scanova.io/pricing/",
    sourceLabel: "Pricing page",
    checked: D,
    shape: "platform",
    headline: "No permanent free plan at all — the free thing is a 14-day trial, which is a different product.",
    checks: {
      permanent: LIMIT("No free plan for codes to be permanent on."),
      noAccount: LIMIT("Trial requires signing up, though the page states no credit card is needed to start."),
      freeDynamic: LIMIT("Dynamic codes are the paid product; the free route is the 14-day trial."),
      scanCap: OK("Unlimited scans is stated as a plan feature — on the paid plans."),
      vector: LIMIT("Vector formats are listed as a plan feature, not a free one."),
      unbranded: LIMIT("Its own feature copy notes lead-capture pages carry a 'Powered by Scanova' footer."),
    },
  },
  {
    id: "qr-io",
    name: "QR.io",
    host: "qr.io",
    sourceUrl: "https://qr.io/pricing",
    sourceLabel: "Pricing FAQ",
    checked: D,
    shape: "platform",
    headline: "Seven-day trial, and unusually clear about the split: your static codes survive it, your dynamic ones are the product.",
    checks: {
      permanent: LIMIT("Its FAQ states static codes continue to work after the trial expires — which leaves the dynamic ones as the thing that stops."),
      noAccount: LIMIT("Sign-up is required for the trial, which is the only free route into the product."),
      freeDynamic: LIMIT("Dynamic codes are available during the 7-day trial only."),
      scanCap: OK("Unlimited scans stated as a plan feature."),
      vector: OK("PNG and SVG download listed as a plan feature."),
      unbranded: UNK("Not stated on the page checked."),
    },
  },
  {
    id: "qrplanet",
    name: "QR Planet",
    host: "qrplanet.com",
    sourceUrl: "https://qrplanet.com/pricing",
    sourceLabel: "Pricing + FAQ",
    checked: D,
    shape: "platform",
    headline: "Has both a 'Forever Free' plan and a 15-day trial that deactivates your account if you do not add payment details.",
    checks: {
      permanent: LIMIT("Its FAQ states that if payment data is not entered during the trial, the account is set inactive when the trial ends."),
      noAccount: LIMIT("Registration required, though the trial states no credit card up front."),
      freeDynamic: LIMIT("A 'Forever Free' plan is listed, with dynamic features on the paid ladder above it."),
      scanCap: OK("Its own marketing line states unlimited scans and no expiration date."),
      vector: LIMIT("SVG and CMYK vector output appear as plan features rather than free ones."),
      unbranded: UNK("Not stated on the pages checked."),
    },
  },
  {
    id: "qrcodedynamic",
    name: "QR Code Dynamic",
    host: "qrcodedynamic.com",
    sourceUrl: "https://qrcodedynamic.com/",
    sourceLabel: "Homepage",
    checked: D,
    shape: "platform",
    headline: "States no scan limit and that static codes do not expire — but every path on the page runs through a signup.",
    checks: {
      permanent: OK("States a static code will not expire as long as its information is unchanged, and that dynamic codes stay valid when updated."),
      noAccount: LIMIT("Sign in / sign up are the page's primary actions and the generator is presented as an account product."),
      freeDynamic: UNK("A free tier is implied by the name and the call to action; its limits are not stated on the page checked."),
      scanCap: OK("'No scan limit' is one of the page's own three headline claims."),
      vector: UNK("Not stated on the page checked."),
      unbranded: UNK("Not stated on the page checked."),
    },
  },
];

/** The six questions, in the order they are asked of every vendor. */
export const CHECK_LABELS: { key: keyof Checks; label: string; short: string }[] = [
  { key: "permanent", label: "Do the free codes keep working?", short: "Permanent" },
  { key: "noAccount", label: "Usable without an account?", short: "No account" },
  { key: "freeDynamic", label: "Free dynamic (editable) code?", short: "Free dynamic" },
  { key: "scanCap", label: "Scan cap on the free tier?", short: "No scan cap" },
  { key: "vector", label: "Vector (SVG/EPS/PDF) for free?", short: "Free vector" },
  { key: "unbranded", label: "Free output free of ads/watermark?", short: "Unbranded" },
];

/* THE HEADLINE METRIC, defined narrowly on purpose.
 *
 * "Requires an account" and "vector costs money" are real constraints, but they
 * are disclosed at the door — you learn them before you print anything. What
 * /free-forever actually claims about competitors is the other kind: a limit
 * that bites AFTER the code is on a menu, a flyer or a shop window. So the
 * headline count is restricted to the four checks that can do that:
 *
 *   permanent   — the code, or the account holding it, gets switched off
 *   freeDynamic — the editable code is trial-bound or rationed
 *   scanCap     — the code stops resolving once enough people scan it
 *   unbranded   — the vendor's ad or watermark rides along to the scanner
 *
 * Account walls and paywalled vector are counted too, just reported separately
 * as friction. Splitting them is what stops this page from being a list of
 * grievances dressed up as a finding.
 */
const KILL_SWITCH: (keyof Checks)[] = ["permanent", "freeDynamic", "scanCap", "unbranded"];
const FRICTION: (keyof Checks)[] = ["noAccount", "vector"];

/** True when something the vendor calls free can stop working, get capped, or carry its branding. */
export function hasKillSwitch(v: Vendor): boolean {
  return KILL_SWITCH.some((k) => v.checks[k].v === "limit");
}

/** True when the free tier is gated or degraded, but nothing bites after printing. */
export function hasFrictionOnly(v: Vendor): boolean {
  return !hasKillSwitch(v) && FRICTION.some((k) => v.checks[k].v === "limit");
}

export const LIMITED = VENDORS.filter(hasKillSwitch);
export const NO_LIMIT_FOUND = VENDORS.filter((v) => !hasKillSwitch(v));

/** Counts the page and /free-forever both quote. Derived, never typed by hand. */
export const COUNTS = {
  total: VENDORS.length,
  limited: LIMITED.length,
  clean: NO_LIMIT_FOUND.length,
  /** How many put the vendor's own ads or watermark in front of a scanner. */
  branded: VENDORS.filter((v) => v.checks.unbranded.v === "limit").length,
  scanCapped: VENDORS.filter((v) => v.checks.scanCap.v === "limit").length,
  accountRequired: VENDORS.filter((v) => v.checks.noAccount.v === "limit").length,
  vectorPaywalled: VENDORS.filter((v) => v.checks.vector.v === "limit").length,
  /** Of the ones with no kill switch, how many are static-only generators. */
  cleanAndStaticOnly: NO_LIMIT_FOUND.filter((v) => v.shape === "static-only").length,
  /** Vendors whose free tier is gated but where nothing bites after printing. */
  frictionOnly: VENDORS.filter(hasFrictionOnly).length,
};

/** The date the whole sweep was run. Rendered as the study date. */
export const STUDY_DATE = D;

/* QRix measured by its own six questions, so the page cannot grade everyone
   else and exempt itself. The `limit` entries here are real and are the reason
   this block exists: a comparison page that finds nothing wrong with its own
   product is an advert. */
export const SELF: Vendor = {
  id: "qrix",
  name: "QRix (this site)",
  host: "qrixtools.com",
  sourceUrl: "/free-forever",
  sourceLabel: "Our own terms",
  checked: D,
  shape: "platform",
  headline: "Static codes are permanent, unbranded and need no account. Our dynamic codes have the same dependency every platform here has — if this site goes away, they stop.",
  checks: {
    permanent: OK("Static codes hold their data in the graphic, so nothing on our servers can switch them off."),
    noAccount: OK("Every QR tool works signed out; the generator runs in the browser."),
    freeDynamic: LIMIT("Dynamic codes are free but resolve through our redirect. If this site stops running, they stop resolving — that is true of every dynamic code on this page, ours included."),
    scanCap: OK("No scan cap. Static codes have no counter to cap, and we do not meter the dynamic ones."),
    vector: OK("SVG export is free and needs no account."),
    unbranded: OK("No watermark on the code and no interstitial on the scan."),
  },
};
