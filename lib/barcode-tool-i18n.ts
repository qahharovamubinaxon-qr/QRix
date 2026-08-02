/* Tool-control strings for components/BarcodeClient.tsx — its own module.

   Extracted from lib/barcode-types-i18n in M159, and the reason is the same one
   that produced lib/nav-i18n: BarcodeClient is a client component, so its import
   of barcodeTool() dragged the ENTIRE localized barcode registry into the eager
   bundle of /barcode and every /barcode/<type> route, EN, RU and UZ alike. That
   registry is written for the SERVER pages — per-symbology copy, caveats and
   FAQs in three languages, plus the type list it filters — and none of it is
   reachable from the tool's controls. Measured on production before the split:
   /barcode shipped a 94.5 KB chunk that no other template carries.

   Nothing here may import lib/barcode-types or the localized registry. The
   moment it does, the whole thing comes back and the page still looks correct —
   which is why npm run test:layout asserts the boundary.
*/

type Lang = "ru" | "uz";

/* ---------------------------------------------------------------------------
   Tool-control strings for components/BarcodeClient.tsx.

   Until M149 the component had no `lang` prop and LocalizedBarcodePage never
   passed one, so every RU and UZ barcode page wrapped a fully English tool:
   "Value to encode", "Bar color", "Show value under bars", "Download PNG".
   barcodeUI() above covers only the page chrome, which is why the gap survived
   two localization passes — the surrounding page looked translated.

   `en` is included rather than left implicit so the component reads its labels
   the same way in all three languages; there is no English fallback path that
   can silently swallow a missing translation.

   The colour names exist for a second reason beyond translation: the six
   preset swatches used to announce themselves to a screen reader as their hex
   value ("#7c3aed"), which is not a name.
--------------------------------------------------------------------------- */

export type ToolLang = "en" | Lang;

export type BarcodeToolStrings = {
  typeLabel: (n: number) => string;
  value: string;
  valuePlaceholderNote: string;
  invalidGeneric: string;
  needValue: string;
  digitsOnly: string;
  fixedLen: (lens: string) => string;
  barColor: string;
  customColor: string;
  colorNames: string[];
  height: (px: number) => string;
  showText: string;
  downloadPng: string;
  downloadSvg: string;
  copyValue: string;
  copied: string;
  bulkTitle: string;
  bulkPlaceholder: string;
  bulkGo: string;
  bulkBusy: string;
  bulkResult: (ok: number, fail: number) => string;
  bulkNote: string;
  previewEmpty: string;
  previewInvalid: string;
};

const BARCODE_TOOL: Record<ToolLang, BarcodeToolStrings> = {
  en: {
    typeLabel: (n) => `Barcode type (${n})`,
    value: "Value to encode",
    valuePlaceholderNote: "Value",
    invalidGeneric: "This value is not valid for the selected format",
    needValue: "Enter a value to encode",
    digitsOnly: "This format accepts digits only",
    fixedLen: (l) => `Needs ${l} digits (checksum auto-added)`,
    barColor: "Bar color",
    customColor: "Custom bar color",
    colorNames: ["Black", "Slate", "Violet", "Teal", "Forest green", "QRix orange"],
    height: (px) => `Height — ${px}px`,
    showText: "Show value under bars",
    downloadPng: "Download PNG",
    downloadSvg: "SVG",
    copyValue: "Copy value",
    copied: "Copied",
    bulkTitle: "Bulk generate (up to 200)",
    bulkPlaceholder: "One value per line:\n590123412345\n590123412346",
    bulkGo: "Download ZIP",
    bulkBusy: "Generating…",
    bulkResult: (ok, fail) => `${ok} generated${fail > 0 ? ` · ${fail} invalid skipped` : ""}`,
    bulkNote: "Uses the format, color and size selected above — one PNG per line, zipped.",
    previewEmpty: "Enter a value to see your barcode.",
    previewInvalid: "Invalid value for this format — check the hint above.",
  },
  ru: {
    typeLabel: (n) => `Тип штрих-кода (${n})`,
    value: "Что закодировать",
    valuePlaceholderNote: "Значение",
    invalidGeneric: "Это значение не подходит для выбранного формата",
    needValue: "Введите значение для кодирования",
    digitsOnly: "Этот формат принимает только цифры",
    fixedLen: (l) => `Нужно ${l} цифр (контрольная сумма добавится сама)`,
    barColor: "Цвет полос",
    customColor: "Свой цвет полос",
    colorNames: ["Чёрный", "Графитовый", "Фиолетовый", "Бирюзовый", "Тёмно-зелёный", "Оранжевый QRix"],
    height: (px) => `Высота — ${px}px`,
    showText: "Показывать значение под кодом",
    downloadPng: "Скачать PNG",
    downloadSvg: "SVG",
    copyValue: "Копировать значение",
    copied: "Скопировано",
    bulkTitle: "Массовая генерация (до 200)",
    bulkPlaceholder: "По одному значению в строке:\n590123412345\n590123412346",
    bulkGo: "Скачать ZIP",
    bulkBusy: "Генерируем…",
    bulkResult: (ok, fail) => `${ok} готово${fail > 0 ? ` · ${fail} с ошибкой пропущено` : ""}`,
    bulkNote: "Берёт формат, цвет и размер, выбранные выше — по одному PNG на строку, в архиве.",
    previewEmpty: "Введите значение, чтобы увидеть штрих-код.",
    previewInvalid: "Значение не подходит для этого формата — смотрите подсказку выше.",
  },
  uz: {
    typeLabel: (n) => `Shtrix kod turi (${n})`,
    value: "Nimani kodlash kerak",
    valuePlaceholderNote: "Qiymat",
    invalidGeneric: "Bu qiymat tanlangan formatga to'g'ri kelmaydi",
    needValue: "Kodlash uchun qiymat kiriting",
    digitsOnly: "Bu format faqat raqamlarni qabul qiladi",
    fixedLen: (l) => `${l} ta raqam kerak (nazorat raqami o'zi qo'shiladi)`,
    barColor: "Chiziqlar rangi",
    customColor: "O'z rangingiz",
    colorNames: ["Qora", "Grafit", "Binafsha", "Feruza", "To'q yashil", "QRix to'q sariq"],
    height: (px) => `Balandlik — ${px}px`,
    showText: "Qiymatni kod ostida ko'rsatish",
    downloadPng: "PNG yuklab olish",
    downloadSvg: "SVG",
    copyValue: "Qiymatni nusxalash",
    copied: "Nusxalandi",
    bulkTitle: "Ommaviy yaratish (200 tagacha)",
    bulkPlaceholder: "Har bir qatorda bitta qiymat:\n590123412345\n590123412346",
    bulkGo: "ZIP yuklab olish",
    bulkBusy: "Yaratilmoqda…",
    bulkResult: (ok, fail) => `${ok} ta tayyor${fail > 0 ? ` · ${fail} ta xato o'tkazib yuborildi` : ""}`,
    bulkNote: "Yuqorida tanlangan format, rang va o'lchamni oladi — har qatorga bitta PNG, arxivda.",
    previewEmpty: "Shtrix kodni ko'rish uchun qiymat kiriting.",
    previewInvalid: "Qiymat bu formatga to'g'ri kelmaydi — yuqoridagi izohga qarang.",
  },
};

export const barcodeTool = (lang: ToolLang = "en"): BarcodeToolStrings => BARCODE_TOOL[lang] ?? BARCODE_TOOL.en;
