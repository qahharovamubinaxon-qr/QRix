/* Programmatic barcode-type pages: /barcode/<type>.
   Each entry drives one SSG page rendering the SAME working
   components/BarcodeClient with that symbology preselected, plus copy written
   for that specific format (never templated — thin pages don't rank).
   `format` is the FORMATS id inside components/BarcodeClient.tsx. */

export type BarcodeFamily = "2D codes" | "Retail" | "Logistics" | "Industry";

export type BarcodeType = {
  slug: string;                 // route segment, e.g. "pdf417"
  format: string;               // BarcodeClient FORMATS id, e.g. "PDF417"
  name: string;                 // display label
  family: BarcodeFamily;
  emoji: string;
  title: string; h1: string; desc: string;
  intro: string;                // one line under the h1
  about: string;                // unique body copy (~130+ words)
  keywords: string[];
  steps: [string, string][];
  faqs: { q: string; a: string }[];
  useCases: string[];
};

/** Family accent, so codes of the same class look related across the section. */
const GRAD: Record<BarcodeFamily, string> = {
  "2D codes": "linear-gradient(135deg,#4338ca,#818cf8)",
  Retail: "linear-gradient(135deg,#b45309,#fbbf24)",
  Logistics: "linear-gradient(135deg,#0e7490,#22d3ee)",
  Industry: "linear-gradient(135deg,#166534,#4ade80)",
};
export const typeGrad = (t: BarcodeType) => GRAD[t.family];

export const BARCODE_TYPES: BarcodeType[] = [
  /* ─────────────────────────  2D codes  ───────────────────────── */
  {
    slug: "pdf417", format: "PDF417", name: "PDF417", family: "2D codes", emoji: "🪪",
    title: "PDF417 Barcode Generator — Free, Online, No Signup",
    h1: "PDF417 Barcode Generator",
    desc: "Create PDF417 barcodes free online. The 2D stacked code used on driver's licenses, boarding passes, visas and shipping labels. Download crisp PNG or SVG — nothing is uploaded.",
    intro: "Encode a paragraph of text, an ID record or a tracking payload into the stacked 2D code that ID cards and boarding passes are built on.",
    about: "PDF417 stands for Portable Data File, and the 417 describes its building block: every codeword is 17 modules wide, made of four bars and four spaces. That stacked structure is why it looks like a squashed ladder rather than a square, and why a laser line scanner can read it at all — a genuine advantage over QR in places where handheld laser guns are still standard issue. One symbol holds roughly 1,850 alphanumeric characters or 1,100 raw bytes, enough for a full name, address, date of birth, licence class and portrait hash, which is exactly what the AAMVA standard packs onto the back of North American driver's licences. Built-in Reed–Solomon error correction lets a scanner reconstruct the payload even when the label is scuffed, folded or partially torn. Paste any text below and the symbol rebuilds instantly.",
    keywords: ["pdf417 generator", "pdf417 barcode generator", "create pdf417 barcode", "pdf417 online free", "driver license barcode generator", "2d stacked barcode"],
    steps: [
      ["Pick your payload", "PDF417 accepts free text, so paste anything — a record, a URL, a tracking string. There is no digit-only restriction."],
      ["Tune the look", "Set the bar colour and toggle the human-readable line underneath. The symbol re-renders as you type."],
      ["Download PNG or SVG", "SVG stays razor-sharp on a printed card or label at any size; PNG drops straight into a document."],
    ],
    faqs: [
      { q: "What is a PDF417 barcode used for?", a: "It carries large text payloads on identity and travel documents: US and Canadian driver's licences, state ID cards, visas, IATA boarding passes, USPS and courier shipping labels, and some vehicle registration papers." },
      { q: "How much data fits in a PDF417 code?", a: "About 1,850 alphanumeric characters, 1,100 bytes or 2,700 digits in a single symbol. Longer payloads simply produce a taller symbol with more stacked rows." },
      { q: "Is PDF417 the same as a QR code?", a: "No. PDF417 is a stacked linear code — rows of bars — while QR is a true square matrix. PDF417 holds more text and can be read by laser scanners; QR is faster to scan with a phone camera and tolerates more damage." },
      { q: "Can I generate a real driver's licence barcode?", a: "This tool encodes whatever text you type into a valid PDF417 symbol. Producing a licence that a government reader accepts also requires the officially issued AAMVA data string, which only the issuing authority can supply." },
      { q: "Does the generated code expire or need an account?", a: "Neither. The barcode is drawn in your browser, it never touches a server, and the image you download works forever." },
    ],
    useCases: ["Identity and membership cards", "Boarding passes and travel documents", "Courier and shipping labels", "Warehouse records that need a lot of text in one scan", "Government and insurance forms"],
  },
  {
    slug: "aztec-code", format: "AZTEC", name: "Aztec Code", family: "2D codes", emoji: "🎫",
    title: "Aztec Code Generator — Free Online Aztec Barcode Maker",
    h1: "Aztec Code Generator",
    desc: "Generate Aztec 2D barcodes free online. The compact code on train tickets and boarding passes — needs no quiet zone. Download PNG or SVG, no signup, nothing uploaded.",
    intro: "Make the compact square-with-a-bullseye code that rail and airline tickets use — it fits where other 2D codes will not.",
    about: "Aztec Code is named for the stepped bullseye at its centre, which resembles an Aztec pyramid viewed from directly above. That central finder pattern is the format's defining trick: because the scanner locks onto the middle rather than hunting for corner markers, an Aztec symbol needs no quiet zone at all. Every other 2D code demands a blank margin around it, so on a crowded ticket stub or a narrow luggage tag Aztec reliably wins the space argument — often by twenty to thirty percent. It is standardised as ISO/IEC 24778, holds up to roughly 3,000 characters, and lets you dial error correction anywhere from five to ninety-five percent, with twenty-three percent as the sensible default. Deutsche Bahn, SNCF, Trenitalia and most European rail operators print Aztec on mobile and paper tickets for exactly these reasons.",
    keywords: ["aztec code generator", "aztec barcode generator", "generate aztec code online", "aztec 2d barcode", "train ticket barcode generator", "iso 24778"],
    steps: [
      ["Type the ticket or record data", "Aztec takes any text — a booking reference, a URL, a signed token, a passenger record."],
      ["Choose colours and label", "Set the module colour and decide whether the readable text prints beneath the symbol."],
      ["Export", "Download SVG for print production or PNG for a screen, app or e-ticket email."],
    ],
    faqs: [
      { q: "Where are Aztec codes used?", a: "Mostly in transport and ticketing: European rail tickets, airline boarding passes, event admission, some vehicle registration documents, and Czech and Slovak payment slips." },
      { q: "Why does Aztec not need a quiet zone?", a: "Its finder pattern is a bullseye in the centre of the symbol rather than markers at the corners, so a scanner can locate and lock onto the code without a blank margin telling it where the edges are." },
      { q: "How much data can an Aztec code hold?", a: "Up to about 3,000 alphanumeric characters or 3,800 digits, depending on the error-correction level you accept." },
      { q: "Aztec or QR — which should I use?", a: "Use QR when a phone camera is the reader and you have room. Use Aztec when space is tight, when you need no quiet zone, or when you are matching an existing transport-industry system that already expects it." },
      { q: "Will my phone scan an Aztec code?", a: "Most dedicated barcode apps and every ticket-validation scanner read Aztec. Some built-in phone camera apps only look for QR, so test with a general barcode reader if the code is meant for consumers." },
    ],
    useCases: ["Rail and bus tickets", "Airline boarding passes", "Event and cinema admission", "Narrow labels where a quiet zone will not fit", "Vehicle and insurance documents"],
  },
  {
    slug: "data-matrix", format: "DATAMATRIX", name: "Data Matrix", family: "2D codes", emoji: "🔬",
    title: "Data Matrix Generator — Free Online Data Matrix Barcode Maker",
    h1: "Data Matrix Generator",
    desc: "Create Data Matrix 2D barcodes free online. The tiny square code used for pharma serialisation, electronics and part marking. Download crisp PNG or SVG — no signup, no upload.",
    intro: "Generate the small square matrix code that survives being printed a few millimetres wide on a circuit board, a vial or a surgical instrument.",
    about: "Data Matrix packs the most data into the least physical area of any common symbology, which is why it dominates anywhere the label is tiny. You can recognise it by its two solid edges forming an L — that is the finder pattern — with an alternating dotted clock track on the opposite two sides telling the scanner the module grid size. Standardised as ISO/IEC 16022 with ECC200 Reed–Solomon correction, a single symbol carries up to 2,335 alphanumeric characters and stays readable after roughly thirty percent of it has been destroyed. That damage tolerance is what makes it the format of choice for Direct Part Marking, where the code is laser-etched or dot-peened straight into metal and then survives heat, oil and abrasion. Europe's Falsified Medicines Directive mandates GS1 Data Matrix on prescription packaging for the same reason.",
    keywords: ["data matrix generator", "datamatrix barcode generator", "gs1 data matrix generator", "2d matrix barcode online", "iso 16022", "pharma serialisation barcode"],
    steps: [
      ["Enter the code content", "Any text works — a serial number, a GTIN with batch and expiry, a part reference, a URL."],
      ["Set colour and caption", "Dark modules on a light background scan best; keep contrast high if the code will be printed small."],
      ["Download SVG for production", "SVG is the right choice for labels and part marking because it stays exact at any physical size."],
    ],
    faqs: [
      { q: "What is Data Matrix used for?", a: "Marking small items: pharmaceutical packaging under the EU FMD, electronic components and PCBs, surgical and aerospace parts under MIL-STD-130, postal mail, and laboratory samples." },
      { q: "How small can a Data Matrix code be?", a: "It stays readable down to about two to three millimetres square with a suitable scanner, which is far smaller than any linear barcode can manage with the same payload." },
      { q: "What is the difference between Data Matrix and QR?", a: "Both are square matrix codes. Data Matrix uses an L-shaped finder and is denser at small sizes, so it wins on tiny parts. QR uses three corner squares, is faster for phone cameras and holds more data at larger sizes." },
      { q: "Does this create a GS1 Data Matrix?", a: "It encodes exactly the text you supply. To make it GS1-compliant you type the GS1 element string yourself — for example the GTIN in AI 01 followed by batch in AI 10 — using the format your trading partner specifies." },
      { q: "How much damage can the code survive?", a: "ECC200 error correction reconstructs the payload with roughly thirty percent of the symbol obscured, scratched or missing." },
    ],
    useCases: ["Pharmaceutical and medical packaging", "Electronics and PCB marking", "Aerospace and automotive part marking", "Laboratory sample tubes", "Any label too small for a linear barcode"],
  },

  /* ─────────────────────────  Retail  ───────────────────────── */
  {
    slug: "ean-13", format: "EAN13", name: "EAN-13", family: "Retail", emoji: "🛒",
    title: "EAN-13 Barcode Generator — Free Retail Product Barcodes",
    h1: "EAN-13 Barcode Generator",
    desc: "Generate EAN-13 retail barcodes free online. Type 12 digits and the checksum is added automatically. Download print-ready SVG or high-resolution PNG — no signup.",
    intro: "Create the 13-digit product barcode scanned at supermarket checkouts worldwide — with the check digit calculated for you.",
    about: "EAN-13 is the International Article Number, the barcode on virtually every retail product sold outside North America and on most sold inside it too. Its thirteen digits break into three parts: a two- or three-digit GS1 prefix identifying the numbering organisation that issued the number, a manufacturer and product reference, and a final check digit computed with a modulo-10 weighted sum. A detail worth knowing is that the prefix identifies where the number was registered, not where the goods were made — a 50 prefix means the company registered with GS1 UK, not that the item was manufactured in Britain. Another quirk: the thirteenth digit is not drawn as bars at all. It is encoded implicitly in the odd/even parity pattern of the six left-hand digits, which is how a scanner can read the symbol from either direction and still recover the full number.",
    keywords: ["ean 13 generator", "ean13 barcode generator", "product barcode generator", "retail barcode maker", "ean barcode online free", "13 digit barcode"],
    steps: [
      ["Enter 12 digits", "Type the twelve significant digits of your product number. The thirteenth check digit is calculated and appended automatically."],
      ["Check the preview", "Live validation flags the wrong digit count before you export anything."],
      ["Download for packaging", "Take the SVG to your print house so the bars stay dimensionally exact at any size."],
    ],
    faqs: [
      { q: "Do I need to buy a barcode number?", a: "To sell through retailers, yes — a GTIN must be licensed from GS1 so it is globally unique to your product. This tool draws the barcode symbol for a number you already own; it does not allocate numbers." },
      { q: "What does the first digit or prefix mean?", a: "It identifies the GS1 member organisation that issued the number, not the country of manufacture. A product made in one country can legitimately carry a prefix registered in another." },
      { q: "Why do I enter 12 digits and get 13?", a: "The final digit is a modulo-10 checksum derived from the first twelve. Adding it automatically prevents the single most common cause of a barcode that will not scan at the till." },
      { q: "Is EAN-13 the same as UPC-A?", a: "They are close relatives. UPC-A is twelve digits and used in the US and Canada; EAN-13 is its thirteen-digit international superset. A UPC-A number is simply an EAN-13 with a leading zero, and modern retail scanners read both." },
      { q: "What size should the printed barcode be?", a: "The nominal EAN-13 size is 37.29 mm wide by 25.93 mm tall. Retailers generally accept 80 to 200 percent of that, but never stretch it non-proportionally and always keep the light margins on both sides." },
    ],
    useCases: ["Retail product packaging", "Grocery and FMCG lines", "Books and magazines with an ISSN or ISBN prefix", "Export goods sold internationally", "Point-of-sale and stock systems"],
  },
  {
    slug: "upc-a", format: "UPC", name: "UPC-A", family: "Retail", emoji: "🇺🇸",
    title: "UPC-A Barcode Generator — Free 12-Digit Product Barcodes",
    h1: "UPC-A Barcode Generator",
    desc: "Generate UPC-A barcodes free online. Enter 11 digits and the check digit is added automatically. Download print-ready SVG or high-res PNG for US and Canadian retail packaging.",
    intro: "Create the twelve-digit product code that US and Canadian retailers scan — checksum handled automatically.",
    about: "UPC-A was the original retail barcode, first scanned on a pack of chewing gum in an Ohio supermarket in 1974, and it still governs product identification across the United States and Canada. Twelve digits: a leading number-system character, a manufacturer code, an item reference and a modulo-10 check digit. That first digit carries real meaning that catches people out. A zero, one, six, seven or eight marks an ordinary retail item; a two signals a variable-measure product where the price is encoded in-store, which is why loose meat and deli packages get their label printed at the counter; a three prefixes National Drug Code items in pharmacy; a four is reserved for retailer in-store use and never leaves the building; five and nine are coupon codes. Pick the wrong leading digit and your product can behave strangely at the till even though the symbol scans perfectly.",
    keywords: ["upc barcode generator", "upc a generator", "12 digit barcode generator", "create upc barcode free", "us product barcode", "upc code maker"],
    steps: [
      ["Enter 11 digits", "Type the number-system digit, manufacturer code and item reference. The twelfth check digit is computed for you."],
      ["Confirm the symbol", "Validation catches a wrong length immediately, before it reaches your packaging artwork."],
      ["Export SVG or PNG", "SVG keeps the bar widths exact through prepress; PNG is fine for a mock-up or listing image."],
    ],
    faqs: [
      { q: "What is the difference between UPC and EAN?", a: "UPC-A has twelve digits and is the North American standard; EAN-13 has thirteen and is the international one. An EAN-13 beginning with zero is the same number as the equivalent UPC-A, and modern scanners handle both." },
      { q: "Where do I get a legitimate UPC number?", a: "From GS1 US, which licenses the company prefix that makes your numbers globally unique. Resold or recycled numbers frequently fail retailer onboarding checks." },
      { q: "What does the leading digit mean?", a: "It is the number-system character: 0, 1, 6, 7 and 8 are standard retail; 2 is variable-weight in-store items; 3 is pharmaceutical NDC; 4 is retailer internal use; 5 and 9 are coupons." },
      { q: "Can I use a UPC barcode on Amazon?", a: "Amazon requires a GTIN that traces back to your own GS1-licensed prefix. The symbol this tool draws is correct, but the number itself must be genuinely yours." },
      { q: "How big should a UPC-A barcode be printed?", a: "Nominal size is 37.29 by 25.93 mm. Scaling between 80 and 200 percent is normally accepted; below 80 percent scan reliability at the checkout drops off quickly." },
    ],
    useCases: ["US and Canadian retail packaging", "Amazon and marketplace listings", "Grocery and convenience products", "Pharmacy items using NDC codes", "In-store price and stock labels"],
  },
  {
    slug: "ean-8", format: "EAN8", name: "EAN-8", family: "Retail", emoji: "🥫",
    title: "EAN-8 Barcode Generator — Free Short Retail Barcodes",
    h1: "EAN-8 Barcode Generator",
    desc: "Generate EAN-8 barcodes free online for small packages. Enter 7 digits and the checksum is added automatically. Download print-ready SVG or high-resolution PNG.",
    intro: "The short retail barcode for packs too small to carry a full EAN-13 — chewing gum, cosmetics, single-serve items.",
    about: "EAN-8 exists for one reason: some packages are physically too small to carry an EAN-13 without the barcode swallowing the design. Eight digits — a two- or three-digit GS1 prefix, a short item reference and a modulo-10 check digit — compress into a symbol roughly two-thirds the width of its bigger sibling. The important thing to understand is that an EAN-8 number is not derived from your EAN-13 by truncating it. It is allocated separately by GS1 from a deliberately limited pool, because the short number space is a genuinely scarce global resource. GS1 member organisations therefore grant EAN-8 numbers case by case and usually ask you to demonstrate that the product really cannot accommodate an EAN-13, even at the minimum permitted eighty percent scale. If your packaging has the room, use EAN-13; keep EAN-8 for the cases where it truly does not.",
    keywords: ["ean 8 generator", "ean8 barcode generator", "short barcode generator", "8 digit barcode", "small package barcode", "ean 8 online free"],
    steps: [
      ["Enter 7 digits", "Type the seven significant digits GS1 allocated to you; the eighth check digit is added automatically."],
      ["Preview at real size", "Because EAN-8 is used on small packs, check that the symbol still holds its light margins in your artwork."],
      ["Download SVG", "Vector output means the bar widths remain exact when the printer scales the label."],
    ],
    faqs: [
      { q: "When should I use EAN-8 instead of EAN-13?", a: "Only when the package is genuinely too small for an EAN-13 at its minimum permitted size. GS1 treats short numbers as a scarce resource and expects EAN-13 wherever it fits." },
      { q: "Can I make an EAN-8 by shortening my EAN-13?", a: "No. EAN-8 numbers are issued independently by GS1 from a separate pool. Truncating an EAN-13 produces a number that belongs to someone else or to nobody." },
      { q: "How many digits do I type?", a: "Seven. The eighth is a modulo-10 check digit calculated from them, which this generator appends for you." },
      { q: "Do retail scanners read EAN-8 everywhere?", a: "Yes — every point-of-sale scanner built for EAN-13 also reads EAN-8; it is part of the same GS1 retail family." },
      { q: "What is the correct printed size?", a: "Nominal EAN-8 is 26.73 by 21.64 mm. As with EAN-13, scale proportionally and never crop the quiet zones on either side." },
    ],
    useCases: ["Chewing gum, sweets and single-serve packs", "Cosmetics and sample sizes", "Cigarette and tobacco packaging", "Small hardware and stationery items", "Any retail pack where EAN-13 will not fit"],
  },

  /* ─────────────────────────  Logistics  ───────────────────────── */
  {
    slug: "code-128", format: "CODE128", name: "Code 128", family: "Logistics", emoji: "📦",
    title: "Code 128 Barcode Generator — Free Online, Any Text",
    h1: "Code 128 Barcode Generator",
    desc: "Generate Code 128 barcodes free online. Encode any letters, numbers or symbols — the universal logistics and inventory barcode. Download print-ready SVG or PNG, no signup.",
    intro: "The workhorse barcode of supply chain and inventory: encode any text or number, at the highest density a linear code offers.",
    about: "Code 128 is the barcode most warehouses, couriers and inventory systems actually run on, and it earns that position through density. It encodes the full 128-character ASCII set using three interchangeable subsets, and the third of these — subset C — packs two digits into every symbol character, so a long numeric string compresses to roughly half the width Code 39 would need. A mandatory modulo-103 check character is built into every symbol, which means a misread is caught by the scanner rather than passed silently into your stock system. It is standardised as ISO/IEC 15417 and is the foundation of GS1-128, the application-identifier scheme that carries batch numbers, expiry dates and SSCC pallet identifiers through the entire supply chain. When you have no external mandate forcing a specific symbology and you need a linear barcode that simply works, this is the default worth choosing.",
    keywords: ["code 128 barcode generator", "code128 generator", "gs1 128 generator", "inventory barcode generator", "logistics barcode maker", "free code 128 online"],
    steps: [
      ["Type any value", "Letters, digits and punctuation all work — a SKU, an asset tag, a tracking reference, a location code."],
      ["Adjust height and colour", "Taller bars scan more reliably from a distance or at an angle on a warehouse label."],
      ["Download and print", "SVG for label templates and thermal printers; PNG for documents and screens."],
    ],
    faqs: [
      { q: "What can Code 128 encode?", a: "The complete ASCII character set — uppercase and lowercase letters, all digits, punctuation and control characters — with no fixed length limit." },
      { q: "Why is Code 128 narrower than Code 39?", a: "Its subset C encodes two digits per symbol character, so numeric data takes roughly half the width. Code 39 encodes one character at a time and uses wide bars, making it noticeably longer." },
      { q: "What is GS1-128?", a: "A standardised use of Code 128 in which the data is structured with GS1 Application Identifiers — for example (01) for GTIN, (10) for batch, (17) for expiry — so trading partners can parse a single barcode into distinct fields." },
      { q: "Does it need a check digit?", a: "The modulo-103 check character is part of the symbology and is always included automatically. You do not add one yourself." },
      { q: "Is Code 128 free to use?", a: "Yes, the symbology is an open ISO standard with no licence fee, and this generator adds no watermark or usage limit." },
    ],
    useCases: ["Warehouse and inventory labels", "Courier and parcel tracking", "Asset tagging and IT equipment", "Manufacturing work-in-progress tickets", "Internal SKU and location labels"],
  },
  {
    slug: "itf-14", format: "ITF14", name: "ITF-14", family: "Logistics", emoji: "🚚",
    title: "ITF-14 Barcode Generator — Free Carton & Case Code Maker",
    h1: "ITF-14 Barcode Generator",
    desc: "Generate ITF-14 shipping carton barcodes free online. Enter 13 digits and the check digit is added automatically. Download print-ready SVG or PNG for corrugated cases.",
    intro: "The 14-digit case code printed on shipping cartons — built with thick bars specifically to survive printing straight onto corrugated cardboard.",
    about: "ITF-14 encodes a GTIN-14, the number that identifies a whole carton or case rather than the individual item inside it. Its first digit is an indicator that describes the packaging level — how many consumer units are in the box — followed by the base product number and a modulo-10 check digit. What makes ITF-14 visually distinctive is that it is engineered for bad printing conditions. Cartons are usually flexographically printed directly onto brown corrugated board, a surface that absorbs ink unevenly and blurs fine detail, so ITF-14 uses deliberately thick bars and is normally enclosed in a heavy rectangular frame called a bearer bar. That frame is not decoration: interleaved codes can be misread as a shorter valid number if a scanner clips the edge of the symbol, and the bearer bar makes such a partial scan physically impossible.",
    keywords: ["itf 14 generator", "itf14 barcode generator", "carton barcode generator", "case code barcode", "shipping box barcode", "gtin 14 barcode"],
    steps: [
      ["Enter 13 digits", "Start with the packaging indicator digit, then the base product number. The fourteenth check digit is calculated automatically."],
      ["Increase the bar height", "Carton labels are scanned from a distance by fixed readers, so give the symbol plenty of height."],
      ["Download SVG for the carton artwork", "Send vector output to the carton printer and ask them to add the bearer bar frame."],
    ],
    faqs: [
      { q: "What is ITF-14 used for?", a: "Identifying shipping cartons, cases and pallet layers in distribution — the outer box, not the retail item inside it." },
      { q: "What is the indicator digit?", a: "The first of the fourteen digits. It describes the packaging level, distinguishing a case of twelve from a case of twenty-four of the same product." },
      { q: "What is a bearer bar and do I need one?", a: "It is the thick frame drawn around the symbol. It prevents a partial scan being read as a shorter valid number and helps flexographic print quality. It is strongly recommended and usually added at the carton-printing stage." },
      { q: "Can I use ITF-14 at a retail checkout?", a: "No. Point-of-sale systems expect EAN-13 or UPC-A on the consumer item. ITF-14 is for the outer case and is read in the warehouse and in goods-in." },
      { q: "Why are the bars so thick?", a: "Because cartons are printed directly onto corrugated board, where ink spreads and fine bars smear. Thick bars keep the symbol readable through that print variation." },
    ],
    useCases: ["Shipping cartons and outer cases", "Pallet and distribution labels", "Warehouse goods-in scanning", "Wholesale and cash-and-carry stock", "Cross-docking and 3PL operations"],
  },
  {
    slug: "interleaved-2-of-5", format: "ITF", name: "ITF (Interleaved 2 of 5)", family: "Logistics", emoji: "🔢",
    title: "Interleaved 2 of 5 Barcode Generator — Free ITF Maker",
    h1: "Interleaved 2 of 5 Generator",
    desc: "Generate Interleaved 2 of 5 (ITF) barcodes free online. Compact numeric encoding for warehousing and distribution. Download print-ready SVG or high-resolution PNG.",
    intro: "A dense numeric-only barcode that encodes one digit in the bars and the next in the spaces between them.",
    about: "Interleaved 2 of 5 gets its name from a genuinely clever encoding trick. Digits are handled in pairs: the first digit of each pair is drawn in the bars and the second in the spaces between those bars, so the two are literally interleaved. Nothing is wasted, and the result is one of the most compact numeric symbologies available — noticeably narrower than Code 39 for the same digits. The consequence of pairing is a hard rule: ITF can only encode an even number of digits. Give it an odd count and you must pad with a leading zero, which every correct implementation does silently. Its one real weakness follows from the same design. Because any even-length substring is itself structurally valid, a scanner that clips the start or end of a wide symbol can return a shorter number that looks perfectly legitimate, which is why bearer bars are standard practice on wide ITF labels.",
    keywords: ["interleaved 2 of 5 generator", "itf barcode generator", "i2of5 barcode", "numeric barcode generator", "warehouse barcode maker", "2 of 5 code online"],
    steps: [
      ["Enter an even number of digits", "ITF encodes digits in pairs. An odd count is padded with a leading zero automatically."],
      ["Set the height", "Distribution labels are read by fixed scanners, so a taller symbol improves first-pass read rates."],
      ["Export SVG or PNG", "Vector output keeps the narrow-to-wide bar ratio exact, which matters for this symbology."],
    ],
    faqs: [
      { q: "Why must ITF have an even number of digits?", a: "Each pair of digits shares one group of bars and spaces — one digit in the bars, one in the spaces. An unpaired digit has nowhere to go, so odd values are padded with a leading zero." },
      { q: "What is ITF used for?", a: "Warehousing, distribution and inventory, plus historical use in film and photo processing. Its best-known descendant is ITF-14 for shipping cartons." },
      { q: "What is the truncation problem?", a: "Any even-length portion of an ITF symbol is itself a structurally valid code, so a partial scan can return a shorter wrong number without any error. Bearer bars around the symbol prevent this." },
      { q: "Can ITF encode letters?", a: "No. It is strictly numeric. If you need letters, use Code 128 for density or Code 39 for maximum scanner compatibility." },
      { q: "Does ITF include a check digit?", a: "The base symbology does not require one. Applications built on it, such as ITF-14, add a modulo-10 check digit as part of their own specification." },
    ],
    useCases: ["Warehouse and distribution labels", "Inventory and stock rotation", "Carton and packaging identification", "Film and photo processing envelopes", "Numeric-only internal reference codes"],
  },

  /* ─────────────────────────  Industry  ───────────────────────── */
  {
    slug: "code-39", format: "CODE39", name: "Code 39", family: "Industry", emoji: "🏭",
    title: "Code 39 Barcode Generator — Free Online Code 3 of 9 Maker",
    h1: "Code 39 Barcode Generator",
    desc: "Generate Code 39 (Code 3 of 9) barcodes free online. Letters, digits and symbols, readable by virtually every scanner ever made. Download print-ready SVG or PNG.",
    intro: "The first alphanumeric barcode ever made, and still the one that almost any scanner on earth will read without configuration.",
    about: "Code 39, also written Code 3 of 9, was introduced in 1974 and was the first barcode able to encode letters as well as digits. The name describes its structure: each character is nine elements, three of which are wide. Its character set covers the digits, uppercase A to Z, and the symbols hyphen, period, space, dollar, slash, plus and percent, with an asterisk serving as the start and stop marker. It is self-checking and needs no check digit, though an optional modulo-43 one exists for high-integrity applications. The trade-off for that simplicity is width — Code 39 is the least dense common symbology, and a long value produces a long label. What keeps it alive after fifty years is universal compatibility: US Department of Defense LOGMARS labelling, automotive AIAG standards, hospital wristbands and ID badges all still specify it, and no scanner needs configuring to read it.",
    keywords: ["code 39 generator", "code 3 of 9 barcode generator", "alphanumeric barcode generator", "id badge barcode", "logmars barcode", "free code 39 online"],
    steps: [
      ["Type your value", "Use uppercase letters, digits and the supported symbols. Lowercase is not part of the standard character set."],
      ["Set height and colour", "Badges and asset tags usually want a shorter symbol; shelf and rack labels want a taller one."],
      ["Download", "SVG for print and badge templates, PNG for documents, spreadsheets and screens."],
    ],
    faqs: [
      { q: "What characters does Code 39 support?", a: "Digits 0–9, uppercase A–Z, and the symbols hyphen, period, space, dollar, slash, plus and percent. Lowercase letters require the Full ASCII extension, which many readers do not enable by default." },
      { q: "Why is Code 39 wider than Code 128?", a: "It encodes one character per nine-element group and relies on wide bars, whereas Code 128 can pack two digits into a single character. For long numeric values Code 39 can be nearly twice the width." },
      { q: "Does Code 39 need a check digit?", a: "No. The symbology is self-checking. A modulo-43 check digit is optional and used mainly in defence and healthcare applications that require it." },
      { q: "Should I still use Code 39 today?", a: "Choose it when maximum scanner compatibility matters or a standard mandates it — defence, automotive, ID badges. For new internal systems Code 128 is denser and generally the better choice." },
      { q: "Why do some Code 39 barcodes have asterisks?", a: "The asterisk is the start and stop character. Some systems print it in the human-readable line; it is part of the symbol structure, not part of your data." },
    ],
    useCases: ["Employee ID and access badges", "Defence and government LOGMARS labels", "Automotive and industrial parts", "Hospital wristbands and specimen labels", "Legacy systems needing guaranteed compatibility"],
  },
  {
    slug: "msi-barcode", format: "MSI", name: "MSI", family: "Industry", emoji: "🏷️",
    title: "MSI Barcode Generator — Free MSI Plessey Code Maker",
    h1: "MSI Barcode Generator",
    desc: "Generate MSI Plessey barcodes free online. The numeric code used on retail shelf labels for inventory and reordering. Download print-ready SVG or high-resolution PNG.",
    intro: "The numeric shelf-label barcode supermarkets use for stock counting and automatic reordering.",
    about: "MSI, often called MSI Plessey, is a numeric-only symbology that MSI Data Corporation derived from the earlier Plessey Code, and it survives today in one specific niche: retail shelf labelling. It is the barcode on the price rail beneath the products rather than on the products themselves. Staff walking the aisles with a handheld scanner read shelf tags to count facings, trigger replenishment and reprice, and MSI is what those tags carry in a great many chains. The symbology accepts any number of digits, has no built-in checksum, and offers optional modulo-10 or modulo-11 check digits that the application layer chooses. That flexibility is precisely why it stays inside closed inventory systems and never appears on consumer packaging — with no mandatory check character and no standards body governing its use, it is unsuitable for data that crosses between companies.",
    keywords: ["msi barcode generator", "msi plessey generator", "shelf label barcode", "inventory barcode generator", "retail shelf tag barcode", "msi code online free"],
    steps: [
      ["Enter digits only", "MSI is numeric. Type the shelf, bin or item number your inventory system uses."],
      ["Match your label size", "Shelf tags are small, so keep the value short and give the bars enough height to scan at an angle."],
      ["Download for label printing", "SVG feeds shelf-tag templates and thermal printers cleanly at any size."],
    ],
    faqs: [
      { q: "What is MSI used for?", a: "Almost entirely retail shelf labels — inventory counting, replenishment triggers and repricing within a single chain's own system." },
      { q: "Can MSI encode letters?", a: "No, it is strictly numeric. For alphanumeric data use Code 128 or Code 39." },
      { q: "Does MSI have a check digit?", a: "Not by default. Optional modulo-10 or modulo-11 check digits exist and the choice belongs to the system using the code, which is one reason MSI stays inside closed environments." },
      { q: "Is MSI the same as Plessey Code?", a: "It is a variant. MSI Data Corporation modified the original Plessey Code, and the modified version is what is in use today, though the names are often used interchangeably." },
      { q: "Should I use MSI for a new project?", a: "Only if you are matching existing shelf-label hardware that expects it. For anything new, Code 128 is denser, self-checking and far more widely supported." },
    ],
    useCases: ["Retail shelf and price-rail labels", "Warehouse bin and rack locations", "Stock counting and replenishment", "Internal inventory numbering", "Legacy shelf-scanning hardware"],
  },
  {
    slug: "pharmacode", format: "pharmacode", name: "Pharmacode", family: "Industry", emoji: "💊",
    title: "Pharmacode Generator — Free Pharmaceutical Binary Code Maker",
    h1: "Pharmacode Generator",
    desc: "Generate Pharmacode (Laetus) barcodes free online for pharmaceutical packaging control. Enter a number from 3 to 131070 and download print-ready SVG or PNG.",
    intro: "The pharmaceutical packaging control code — designed to be read reliably at high speed on a production line, in any colour.",
    about: "Pharmacode, also known as the Laetus code, is not really a barcode in the usual sense. It is a binary number rendered as bars: a thin bar means zero, a thick bar means one, and the value is read as a binary sequence rather than decoded character by character. It carries a single integer between 3 and 131070 and nothing else — no text, no check digit, no structure. That radical simplicity is the entire point. Pharmacode exists to let a packaging line verify at high speed that the leaflet inside a carton matches the carton itself, and it must do so through printing conditions that would defeat a conventional symbology: it can be read in either direction, tolerates enormous variation in ink density, and works when printed in colours other than black, which lets it hide inside the existing artwork. It complements rather than replaces the Data Matrix code used for serialisation.",
    keywords: ["pharmacode generator", "laetus code generator", "pharmaceutical barcode generator", "packaging control code", "pharma packaging barcode", "pharmacode online free"],
    steps: [
      ["Enter a number from 3 to 131070", "Pharmacode encodes a single integer in that range — typically a leaflet or carton control number."],
      ["Choose a colour", "Unlike most symbologies, Pharmacode is routinely printed in a non-black colour so it blends into the packaging artwork."],
      ["Download SVG for prepress", "Send vector output to the packaging designer so the bar widths survive prepress unchanged."],
    ],
    faqs: [
      { q: "What is Pharmacode used for?", a: "Packaging control in pharmaceutical manufacturing — confirming on the line that the leaflet, carton and blister belong to the same product before the pack is sealed." },
      { q: "What range of numbers can it encode?", a: "A single integer from 3 to 131070. It carries no text, no letters and no additional fields." },
      { q: "Why can Pharmacode be printed in colour?", a: "Its readers are calibrated for the specific ink and substrate on the line rather than relying on generic high contrast, so the code can be printed in a colour that blends into the artwork." },
      { q: "Is Pharmacode the same as a serialisation code?", a: "No. Serialisation under the EU Falsified Medicines Directive uses GS1 Data Matrix carrying the product code, batch, expiry and unique serial. Pharmacode is a much simpler line-control mark and the two are used together." },
      { q: "Does it have a check digit?", a: "No. Integrity comes from the reader being calibrated to the line and from the value being verified against the expected job number, not from a checksum in the symbol." },
    ],
    useCases: ["Pharmaceutical carton and leaflet matching", "Blister and foil packaging control", "High-speed production line verification", "Print job identification on packaging", "Colour-printed codes hidden inside artwork"],
  },
  {
    slug: "codabar", format: "codabar", name: "Codabar", family: "Industry", emoji: "🩸",
    title: "Codabar Generator — Free Online Codabar Barcode Maker",
    h1: "Codabar Generator",
    desc: "Generate Codabar barcodes free online. The self-checking code used by blood banks, libraries and courier airbills. Download print-ready SVG or high-resolution PNG.",
    intro: "The self-checking numeric code still trusted by blood banks, libraries and courier systems where a misread is unacceptable.",
    about: "Codabar was developed by Pitney Bowes in 1972 and is sometimes listed as Monarch or NW-7. It encodes the ten digits plus the symbols hyphen, dollar, colon, slash, period and plus, and it is framed by one of four start and stop characters — A, B, C or D — which applications use to signal what kind of record the code represents. Its enduring virtue is that it is discrete and self-checking: each character stands alone with a gap between characters, and the structure itself catches most substitution errors without needing a check digit. That reliability is why it took root in settings where a wrong read has real consequences. The American Blood Commission adopted it for blood bag labelling, libraries used it for decades on borrower cards and book spines, and FedEx built its early airbill tracking on it. Newer systems favour Code 128, but the installed base keeps Codabar in daily use.",
    keywords: ["codabar generator", "codabar barcode generator", "blood bank barcode", "library barcode generator", "nw-7 barcode", "monarch barcode online"],
    steps: [
      ["Type digits with start and stop letters", "Wrap your value in one of the start/stop characters A, B, C or D — for example A123456A."],
      ["Adjust bar height", "Library spine labels and blood bag tags are scanned at close range, so moderate height is usually enough."],
      ["Download SVG or PNG", "Vector output prints cleanly on adhesive label stock at any size."],
    ],
    faqs: [
      { q: "What characters can Codabar encode?", a: "Digits 0–9 and the symbols hyphen, dollar, colon, slash, period and plus, framed by a start and stop character chosen from A, B, C or D." },
      { q: "What do the A, B, C and D characters mean?", a: "They are start and stop markers. Applications assign meaning to the combination — a library might use one pairing for borrower cards and another for items — so the reader can tell record types apart." },
      { q: "Why is Codabar still used in blood banks?", a: "The American Blood Commission standardised on it, it is self-checking without needing a check digit, and the validated installed base of readers and labelling systems is expensive to replace." },
      { q: "Does Codabar need a check digit?", a: "No. Its discrete, self-checking structure catches most substitution errors on its own, though some applications add a modulo-16 check character." },
      { q: "Should I choose Codabar for a new system?", a: "Only to interoperate with existing Codabar equipment. For anything new, Code 128 encodes more, packs it tighter and is better supported." },
    ],
    useCases: ["Blood bank and transfusion labelling", "Library borrower cards and book spines", "Courier and airbill tracking", "Photo processing envelopes", "Legacy systems with validated Codabar readers"],
  },
];

export const getBarcodeType = (slug: string) => BARCODE_TYPES.find((t) => t.slug === slug);

/** Same-family codes first, then the rest — internal linking across the section. */
export function relatedTypes(t: BarcodeType, n = 6): BarcodeType[] {
  const rest = BARCODE_TYPES.filter((o) => o.slug !== t.slug);
  return [...rest.filter((o) => o.family === t.family), ...rest.filter((o) => o.family !== t.family)].slice(0, n);
}

export const BARCODE_FAMILIES: BarcodeFamily[] = ["2D codes", "Retail", "Logistics", "Industry"];
