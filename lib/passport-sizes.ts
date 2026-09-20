/* Passport and visa photo sizes, by country.
   ───────────────────────────────────────────────────────────────────────────
   Demand: /image-tools/passport-photo is 278 of the site's 1,881 weekly
   impressions at position 84 with zero clicks, on the generic query "passport
   photo online". The winnable queries name a country, and those are the ones a
   person actually types when they have a form in front of them.

   EVERY figure here is copied from the issuing authority's own published page,
   and that page is linked on the rendered page so a reader can check it. This
   is not decoration: a wrong millimetre here costs somebody a rejected
   application and a second trip, which is the most expensive kind of mistake
   this site can make. Anything that could not be confirmed at the source is NOT
   in this file — Schengen is the obvious absence, because the European
   Commission's own page defers to ICAO guidelines rather than stating
   dimensions, and a widely-repeated 35×45 is not the same thing as a sourced
   one. It goes in when a primary source is found, not before.

   A SECOND TRAP, found when Germany was added (Sep 20). A country's FORMAT can
   still be correct while the SUBMISSION ROUTE has changed underneath it:
   Germany's photo is still 35×45 mm, but since 1 May 2025 a domestic
   Personalausweis/Reisepass application takes a digital photo over an
   encrypted connection and stopped accepting paper prints after 31 July 2025.
   A page that published only the millimetres would be accurate and still send
   somebody to a print shop for nothing. Check how the photo is SUBMITTED, not
   only how big it is, before adding a country.

   Pixels are at 300 DPI, the print resolution these authorities assume:
   mm × 300 ÷ 25.4, and inches × 300 where the authority publishes inches.

   Verified 2026-08-07. Requirements change; `checked` records when this was
   last read from the source, and the page says so out loud. */

export type PassportSize = {
  slug: string;
  country: string;
  /** What the document is called on the authority's page. */
  document: string;
  /** As the authority writes it, in their unit. */
  sizeLabel: string;
  /** Print pixels at 300 DPI. */
  w: number;
  h: number;
  /** Head-height rule, exactly as published, or null where the source does not give one. */
  headRule: string | null;
  /** Two or three sentences that are true of this country and not of the others. */
  context: string;
  background: string;
  /** The authority, and the page the numbers came from. */
  authority: string;
  source: string;
  checked: string;
  notes: string[];
};

export const PASSPORT_SIZES: PassportSize[] = [
  {
    slug: "usa",
    context: "The United States is the odd one out on shape: a 2×2 inch square, where almost every other country uses a 35×45 mm rectangle. A photo cropped to the rectangular size and sent to a US application is rejected on framing alone, which is the single most common reason a reused photo fails. The State Department also publishes the head-height range, and it is wide — an inch to an inch and three-eighths — so the crop has more tolerance than the shape does.",
    country: "United States",
    document: "US passport and visa photo",
    sizeLabel: "2 × 2 inches (51 × 51 mm)",
    w: 600, h: 600,
    headRule: "Head must measure 1 to 1⅜ inches (25–35 mm) from the bottom of the chin to the top of the head.",
    background: "Plain white or off-white",
    authority: "U.S. Department of State",
    source: "https://travel.state.gov/content/travel/en/passports/how-apply/photos.html",
    checked: "2026-08-07",
    notes: [
      "The State Department says to submit the original, unchanged photo, and specifically not to alter it with software, phone apps, filters or AI.",
      "Cropping and resizing to the required frame is what this tool does; it does not retouch the face.",
    ],
  },
  {
    slug: "uk",
    context: "Printed photos are for PAPER applications only — GOV.UK states you need two identical prints if you apply on a paper form, and a digital photo if you apply online. The UK size is the one most photo booths in Britain already produce, so a booth photo is usually the right shape to begin with. What goes wrong is scale: HM Passport Office warns that a print slightly too small leaves white gaps at the edges when the photo is scanned, and one slightly too large loses head size when it is trimmed to fit. Printing at exactly 45×35 mm avoids both.",
    country: "United Kingdom",
    document: "UK passport photo (printed)",
    sizeLabel: "45 mm high × 35 mm wide",
    w: 413, h: 531,
    headRule: "The image of you — from the crown of your head to your chin — must be between 29 mm and 34 mm high.",
    background: "Plain light-grey or cream",
    authority: "HM Passport Office (GOV.UK)",
    source: "https://www.gov.uk/photos-for-passports/photo-requirements",
    checked: "2026-09-20",
    notes: [
      "Two identical printed photos are required, and only if you apply using a paper form. GOV.UK states plainly that you need digital photos to apply online.",
      "Applying online, the digital photo comes either from a booth or shop — choosing the option that gives you a code, which you enter during the application — or is taken on a device during the application with someone helping. GOV.UK says booth or shop photos are more likely to be approved than one taken on your own device.",
      "GOV.UK warns that a photo printed too small leaves white gaps at the edges when scanned, and one printed too large ends up with the wrong head size once it is trimmed.",
    ],
  },
  {
    slug: "canada",
    context: "Canada is the exception nobody expects: 50×70 mm, taller and wider than the international rectangle, and a photo cropped for any other country is the wrong shape. IRCC publishes a face-height range measured chin to crown, and requires two identical prints on photo-service paper — home printing is explicitly not accepted. The exception is renewing online, which takes a digital photo instead of prints, so check which route you are on before paying a photo shop for two copies.",
    country: "Canada",
    document: "Canadian passport photo",
    sizeLabel: "50 mm wide × 70 mm high (2 × 2¾ inches)",
    w: 591, h: 827,
    headRule: "Face must measure between 31 mm and 36 mm from chin to crown.",
    background: "Plain white or light-coloured",
    authority: "Immigration, Refugees and Citizenship Canada",
    source: "https://www.canada.ca/en/immigration-refugees-citizenship/services/canadian-passports/photos.html",
    checked: "2026-09-20",
    notes: [
      "Two identical photos are required with an in-person or mail application, and they must be taken within the previous 6 months.",
      "IRCC does not accept photos printed at home or on heavyweight paper — print at a photo service.",
      "Renewing online takes a DIGITAL photo instead of prints — IRCC states you need a digital passport photo only if you are renewing online, as a JPEG within its own pixel and file-size limits. Two prints are for the in-person and mail routes.",
    ],
  },
  {
    slug: "australia",
    context: "Australia publishes 45×35 mm as a MINIMUM rather than an exact size, and says not to trim a larger photo down. Its head-size rule is measured to the top of the head rather than the top of the hair, which is a distinction worth reading twice before cropping. The Passport Office also warns against online photo services and phone apps on identity-fraud grounds — an argument for a tool that never uploads the image at all.",
    country: "Australia",
    document: "Australian passport photo",
    sizeLabel: "45 mm high × 35 mm wide (minimum)",
    w: 413, h: 531,
    headRule: "Head should measure 32–36 mm from the top of the head, not the hair, to the bottom of the chin.",
    background: "Plain, light-coloured",
    authority: "Australian Passport Office",
    source: "https://www.passports.gov.au/getting-passport-how-it-works/photo-requirements",
    checked: "2026-08-07",
    notes: [
      "Two good-quality photos are required.",
      "The Passport Office states these are minimum dimensions and that larger photos should not be trimmed.",
      "It also advises against online photo services and phone apps on identity-fraud grounds — a reason to prefer a tool like this one, which never uploads the image, or a professional photographer.",
    ],
  },
  {
    slug: "india",
    context: "Read this before you print anything: for the route almost everyone uses, India does not want a photograph at all. Passport Seva's own instruction booklet states that a photograph is NOT REQUIRED for applications submitted at a Passport Seva Kendra (PSK) or Post Office Passport Seva Kendra (POPSK) — the photo and biometrics are captured at the centre during the appointment. The 4.5×3.5 cm print below is for the other collection channels: a District Passport Cell, an authorised Speed Post Centre, or a Citizen Service Centre, where the photo is pasted into the box on the form. For those, Passport Seva is specific about print quality rather than size — it will not accept a photograph in computer print, or a black-and-white one.",
    country: "India",
    document: "Indian passport photo",
    sizeLabel: "4.5 × 3.5 cm (45 × 35 mm)",
    w: 413, h: 531,
    headRule: null,
    background: "White",
    authority: "Ministry of External Affairs · Passport Seva (application form instruction booklet v3.0)",
    source: "https://www.passportindia.gov.in/AppOnlineProject/pdf/ApplicationformInstructionBooklet-V3.0.pdf",
    checked: "2026-09-20",
    notes: [
      "A photograph is NOT required at a Passport Seva Kendra (PSK) or Post Office Passport Seva Kendra (POPSK) — it is captured at the centre. The print is only for a District Passport Cell (DPC), an authorised Speed Post Centre (SPC) or a Citizen Service Centre (CSC).",
      "Where a print IS needed: paste exactly one colour photograph, 4.5 cm long by 3.5 cm wide, in the box on the form. It must not be smaller than the box.",
      "Plain white background and dark clothing. Head centred in the frame with both ears visible, both edges of the face clearly visible, eyes open and not covered by hair or dark glasses, expression natural — no grinning, frowning or raised eyebrows.",
      "Passport Seva will not accept a black-and-white photograph, one in computer print, one with a dark background or in uniform, or a photograph that has been signed.",
    ],
  },
  {
    slug: "russia",
    context: "Russia uses the same 35×45 mm rectangle as the UK, Australia and India, but MVD's regulation is more prescriptive than any of those: it states BOTH a maximum head height as a percentage of the frame and a fixed clear margin above the head, where most authorities publish only one or the other. This page covers the DOMESTIC internal passport (паспорт гражданина РФ) specifically — the biometric international passport (загранпаспорт) is a separate application with its own digital-upload specification, not this one.",
    country: "Russia",
    document: "Russian internal passport photo (паспорт гражданина РФ)",
    sizeLabel: "35 mm wide × 45 mm high",
    w: 413, h: 531,
    headRule: "Crown to chin must not exceed 80% of the frame's vertical height, and the clear space above the head must be 5 mm (±1 mm).",
    background: "White, even, no stripes, spots or shadows",
    authority: "Ministry of Internal Affairs of Russia (MVD), Order No. 773 of 16.11.2020",
    source: "http://publication.pravo.gov.ru/Document/View/0001202012310102",
    checked: "2026-09-02",
    notes: [
      "This is Приказ МВД России от 16.11.2020 № 773, п.36 — the administrative regulation for issuing and replacing the internal passport, published on Russia's official legal-acts portal.",
      "The percentage rule and the millimetre margin rule both apply; a crop that satisfies one does not automatically satisfy the other.",
      "Applying for the international biometric passport instead uses a different specification — check which document you are applying for before using this size.",
    ],
  },
  {
    slug: "germany",
    context: "Germany is the one country on this list where a printed photo may no longer be what the application wants. Since 1 May 2025 a Personalausweis or Reisepass applied for INSIDE Germany takes a digital photo — made at the authority itself, or made by a certified studio and collected by the office over an encrypted connection using a Data Matrix code you are handed on paper — and paper prints stopped being accepted after 31 July 2025. The 35×45 mm size is still the German format and still the one to print for an application made at a German mission abroad, so check which route your application takes before you print anything. The BMI is also unusual in stating its head rule as a PROPORTION of the frame rather than a measurement: the face fills 70 to 80% of the photo's height.",
    country: "Germany",
    document: "German passport and ID photo (Passbild)",
    sizeLabel: "35 mm wide × 45 mm high",
    w: 413, h: 531,
    headRule: "The face must fill 70–80% of the photo's height, measured from the tip of the chin to the top of the head — about 32–36 mm on a 45 mm photo. For children up to the age of 10 it is 50–80%.",
    background: "Plain, single-coloured and shadow-free, with clear contrast to the face and hair",
    authority: "Federal Ministry of the Interior (BMI) — Fotomustertafel, Stand Juli 2025",
    source: "https://www.bundesdruckerei-gmbh.de/files/dokumente/pdf/fotomustertafel.pdf",
    checked: "2026-09-20",
    notes: [
      "Since 1 May 2025, photos for a Personalausweis or Reisepass applied for in Germany must be digital — made at the passport authority, or made by a certified studio or drugstore and retrieved by the office over an encrypted connection using a Data Matrix code. Paper photos were accepted only until 31 July 2025.",
      "A printed 35×45 mm photo is still the right format for an application made at a German mission abroad, where the Federal Foreign Office publishes the same size and gives the head height as 32–36 mm.",
      "The quality criteria come from the BMI's Fotomustertafel (Artikelnummer BMI24037, Stand Juli 2025): neutral expression, mouth closed, looking straight into the camera, head centred and upright, eyes clearly visible and not covered by frames.",
      "Head coverings are permitted only on religious grounds, and then the face must be visible from the lower edge of the chin to the forehead with no shadow falling on it.",
      "Retouching, filters and soft focus are listed as grounds for rejection, as are red eye, reflections on the face, patterned or shadowed backgrounds, and tinted or reflecting lenses.",
      "German driving licences are not affected by the digital-photo rule.",
    ],
  },
];

export const getPassportSize = (slug: string) => PASSPORT_SIZES.find((p) => p.slug === slug);

export const otherPassportSizes = (slug: string) => PASSPORT_SIZES.filter((p) => p.slug !== slug);
