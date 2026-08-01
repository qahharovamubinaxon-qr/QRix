/* UI strings for the tool CLIENTS that LocalizedToolEngine mounts on the
   /ru/[tool] and /uz/[tool] routes (M150).

   Why this file exists: LocalizedToolEngine's header used to assert that "the
   tools are language-agnostic, only the surrounding SEO copy is localized".
   The first half was false — every one of those clients had English button,
   status and empty-state text, so a RU or UZ visitor got a localized page
   wrapping a fully English tool. Same defect class as M149 (BarcodeClient),
   which is the fourth time it has happened.

   Shape follows lib/barcode-types-i18n.ts: one dict per language, a lookup
   that falls back to EN, and functions (not template concatenation at the call
   site) wherever a string interpolates a number — so word order stays
   translatable. */

export type ToolLang = "en" | "ru" | "uz";

export type ToolStrings = {
  common: {
    browse: string;
    dropFileOr: string;
    selectedSuffix: string;
    addMore: string;
    chooseImage: string;
    imgFormats: string;
    copy: string;
    copied: string;
    download: string;
  };
  merge: {
    dropPdfsOr: string;
    twoOrMore: string;
    mergeBtn: string;
    merging: string;
    files: string;
    dragOrder: string;
    noPdfs: string;
    needTwo: string;
    failed: string;
  };
  compress: {
    levelLabel: string;
    levels: Record<"low" | "medium" | "high", { label: string; hint: string }>;
    originalSize: string;
    onDevice: string;
    compressBtn: string;
    compressing: string;
    doneTitle: string;
    rowOriginal: string;
    rowCompressed: string;
    rowSaved: string;
    smaller: (pct: number) => string;
    alreadyOptimized: string;
    noImagesNote: string;
    failed: string;
  };
  jpgToPdf: {
    dropImagesOr: string;
    formats: string;
    pageSize: string;
    sizes: Record<"a4" | "letter" | "fit", string>;
    margin: (px: number) => string;
    convertBtn: string;
    creating: string;
    selectedImages: string;
    dragReorder: string;
    noImages: string;
    failed: string;
  };
  pdfToJpg: {
    convertBtn: string;
    converting: string;
    note: string;
    failed: string;
  };
  removeBg: {
    original: string;
    removeBtn: string;
    processing: string;
    loadingModel: (pct: string) => string;
    processingPct: (pct: number) => string;
    error: string;
    localNote: string;
    result: string;
    transparentTag: string;
    resultHere: string;
    bgColor: string;
    pickNote: string;
    colors: Record<string, string>;
  };
  upscale: {
    chooseBlurry: string;
    dims: (ow: number, oh: number, nw: number, nh: number) => string;
    factor: string;
    sharpen: string;
    strength: (pct: number) => string;
    enhanceBtn: string;
    enhancing: string;
    enhancedResult: string;
    enhancedHere: string;
    enhancedTo: (w: number, h: number, scale: number, sharpened: boolean) => string;
  };
  imageToText: {
    hint: string;
    recogLang: string;
    extractBtn: string;
    extracting: string;
    extractedText: string;
    placeholder: string;
    noText: string;
    error: string;
  };
  pdfToWord: {
    modes: Record<"cloud" | "exact" | "flow", { label: string; hint: string }>;
    convertBtn: string;
    converting: string;
    onServer: string;
    serverUnavailable: string;
    readingPdf: string;
    buildingDoc: string;
    noteCloud: string;
    noteDevice: string;
    failed: string;
  };
};

const EN: ToolStrings = {
  common: {
    browse: "browse",
    dropFileOr: "Drop your file here or",
    selectedSuffix: "selected",
    addMore: "Add more",
    chooseImage: "Choose an image",
    imgFormats: "JPG, PNG, WebP",
    copy: "Copy",
    copied: "Copied",
    download: "Download",
  },
  merge: {
    dropPdfsOr: "Drop PDFs or",
    twoOrMore: "2 or more PDF files",
    mergeBtn: "Merge PDF",
    merging: "Merging…",
    files: "Files",
    dragOrder: "↔ drag to set merge order",
    noPdfs: "No PDFs yet",
    needTwo: "Add at least 2 PDFs.",
    failed: "Merge failed: ",
  },
  compress: {
    levelLabel: "Compression level",
    levels: {
      low: { label: "Low", hint: "Keeps photo detail" },
      medium: { label: "Medium", hint: "Best balance" },
      high: { label: "High", hint: "Smallest file" },
    },
    originalSize: "Original size:",
    onDevice: "compressed on this device, nothing is uploaded",
    compressBtn: "Compress PDF",
    compressing: "Compressing…",
    doneTitle: "Compressed",
    rowOriginal: "Original",
    rowCompressed: "Compressed",
    rowSaved: "Saved",
    smaller: (pct) => `${pct}% smaller`,
    alreadyOptimized: "Already optimized",
    noImagesNote:
      "This PDF is mostly text or vector graphics — there were no photos to shrink, so it was already close to its smallest lossless size.",
    failed: "Compression failed: ",
  },
  jpgToPdf: {
    dropImagesOr: "Drop images or",
    formats: "JPG, PNG, WEBP, GIF…",
    pageSize: "Page size",
    sizes: { a4: "A4", letter: "Letter", fit: "Fit" },
    margin: (px) => `Margin: ${px}px`,
    convertBtn: "Convert to PDF",
    creating: "Creating PDF…",
    selectedImages: "Selected images",
    dragReorder: "↔ drag to reorder",
    noImages: "No images yet",
    failed: "Conversion failed: ",
  },
  pdfToJpg: {
    convertBtn: "Convert to JPG (ZIP)",
    converting: "Converting…",
    note: "Each page becomes a high-quality JPG, packed into a ZIP.",
    failed: "Conversion failed: ",
  },
  removeBg: {
    original: "Original",
    removeBtn: "Remove Background",
    processing: "Processing…",
    loadingModel: (pct) => `Loading AI model…${pct} (first run only)`,
    processingPct: (pct) => `Processing… ${pct}%`,
    error: "Error — please try another image.",
    localNote: "Runs locally in your browser — your image is never uploaded.",
    result: "Result",
    transparentTag: "(transparent)",
    resultHere: "Result will appear here",
    bgColor: "Background color",
    pickNote: "Pick a color, then download. Transparent keeps the cut-out PNG.",
    colors: {
      transparent: "Transparent",
      white: "White",
      black: "Black",
      blue: "Blue",
      red: "Red",
      green: "Green",
      purple: "Purple",
      pink: "Pink",
      orange: "Orange",
      sky: "Sky",
    },
  },
  upscale: {
    chooseBlurry: "Choose a blurry / small image",
    dims: (ow, oh, nw, nh) => `Original: ${ow}×${oh}px → New: ${nw}×${nh}px`,
    factor: "Upscale factor",
    sharpen: "Sharpen details (recommended for blurry photos)",
    strength: (pct) => `Sharpen strength: ${pct}%`,
    enhanceBtn: "Enhance Image",
    enhancing: "Enhancing…",
    enhancedResult: "Enhanced Result",
    enhancedHere: "Enhanced image will appear here",
    enhancedTo: (w, h, scale, sharpened) =>
      `✓ Enhanced to ${w}×${h}px (${scale}× larger${sharpened ? ", sharpened" : ""})`,
  },
  imageToText: {
    hint: "JPG, PNG, WebP — text will be extracted",
    recogLang: "Recognition language",
    extractBtn: "Extract Text",
    extracting: "Extracting…",
    extractedText: "Extracted Text",
    placeholder: "Extracted text will appear here. You can edit it before copying.",
    noText: "(No text detected)",
    error: "Error: could not extract text. Try another image.",
  },
  pdfToWord: {
    modes: {
      cloud: { label: "★ Best quality (cloud)", hint: "Real Word tables & text like the pros — processed on a secure server" },
      exact: { label: "Exact layout (1:1)", hint: "Looks identical to the PDF — on your device, nothing uploaded" },
      flow: { label: "Flowing text", hint: "Clean paragraphs that reflow as you edit — on your device" },
    },
    convertBtn: "Convert to Word",
    converting: "Converting…",
    onServer: "Converting on the server (best quality)…",
    serverUnavailable: "Server unavailable — converting on your device instead…",
    readingPdf: "Reading PDF…",
    buildingDoc: "Building Word document…",
    noteCloud:
      "Best quality rebuilds real editable Word tables and text. Your file is sent to a secure conversion server and not stored. If it's ever unavailable, we convert on your device instead.",
    noteDevice:
      "Exact layout keeps the page size, positions, fonts and images 1:1 with the PDF while the text stays editable. Scanned pages are embedded as images automatically. Runs privately in your browser — nothing uploaded.",
    failed: "Conversion failed: ",
  },
};

const RU: ToolStrings = {
  common: {
    browse: "выберите файл",
    dropFileOr: "Перетащите файл сюда или",
    selectedSuffix: "выбран",
    addMore: "Добавить ещё",
    chooseImage: "Выберите изображение",
    imgFormats: "JPG, PNG, WebP",
    copy: "Копировать",
    copied: "Скопировано",
    download: "Скачать",
  },
  merge: {
    dropPdfsOr: "Перетащите PDF или",
    twoOrMore: "2 или более PDF-файлов",
    mergeBtn: "Объединить PDF",
    merging: "Объединение…",
    files: "Файлы",
    dragOrder: "↔ перетащите, чтобы задать порядок",
    noPdfs: "Пока нет PDF",
    needTwo: "Добавьте минимум 2 PDF-файла.",
    failed: "Не удалось объединить: ",
  },
  compress: {
    levelLabel: "Уровень сжатия",
    levels: {
      low: { label: "Низкий", hint: "Сохраняет детали фото" },
      medium: { label: "Средний", hint: "Лучший баланс" },
      high: { label: "Высокий", hint: "Наименьший файл" },
    },
    originalSize: "Исходный размер:",
    onDevice: "сжимается на этом устройстве, ничего не загружается",
    compressBtn: "Сжать PDF",
    compressing: "Сжатие…",
    doneTitle: "Сжато",
    rowOriginal: "Исходный",
    rowCompressed: "Сжатый",
    rowSaved: "Экономия",
    smaller: (pct) => `на ${pct}% меньше`,
    alreadyOptimized: "Уже оптимизирован",
    noImagesNote:
      "Этот PDF состоит в основном из текста и векторной графики — фотографий для сжатия не нашлось, файл уже близок к минимальному размеру без потерь.",
    failed: "Не удалось сжать: ",
  },
  jpgToPdf: {
    dropImagesOr: "Перетащите изображения или",
    formats: "JPG, PNG, WEBP, GIF…",
    pageSize: "Размер страницы",
    sizes: { a4: "A4", letter: "Letter", fit: "По размеру" },
    margin: (px) => `Поля: ${px}px`,
    convertBtn: "Конвертировать в PDF",
    creating: "Создание PDF…",
    selectedImages: "Выбранные изображения",
    dragReorder: "↔ перетащите, чтобы изменить порядок",
    noImages: "Пока нет изображений",
    failed: "Не удалось конвертировать: ",
  },
  pdfToJpg: {
    convertBtn: "Конвертировать в JPG (ZIP)",
    converting: "Конвертация…",
    note: "Каждая страница станет JPG высокого качества и попадёт в ZIP-архив.",
    failed: "Не удалось конвертировать: ",
  },
  removeBg: {
    original: "Оригинал",
    removeBtn: "Удалить фон",
    processing: "Обработка…",
    loadingModel: (pct) => `Загрузка ИИ-модели…${pct} (только при первом запуске)`,
    processingPct: (pct) => `Обработка… ${pct}%`,
    error: "Ошибка — попробуйте другое изображение.",
    localNote: "Работает локально в браузере — изображение никогда не загружается.",
    result: "Результат",
    transparentTag: "(прозрачный)",
    resultHere: "Результат появится здесь",
    bgColor: "Цвет фона",
    pickNote: "Выберите цвет и скачайте. Прозрачный сохраняет вырезанный PNG.",
    colors: {
      transparent: "Прозрачный",
      white: "Белый",
      black: "Чёрный",
      blue: "Синий",
      red: "Красный",
      green: "Зелёный",
      purple: "Фиолетовый",
      pink: "Розовый",
      orange: "Оранжевый",
      sky: "Голубой",
    },
  },
  upscale: {
    chooseBlurry: "Выберите размытое или маленькое изображение",
    dims: (ow, oh, nw, nh) => `Исходное: ${ow}×${oh}px → Новое: ${nw}×${nh}px`,
    factor: "Коэффициент увеличения",
    sharpen: "Повысить резкость (для размытых фото)",
    strength: (pct) => `Сила резкости: ${pct}%`,
    enhanceBtn: "Улучшить изображение",
    enhancing: "Улучшение…",
    enhancedResult: "Улучшенный результат",
    enhancedHere: "Улучшенное изображение появится здесь",
    enhancedTo: (w, h, scale, sharpened) =>
      `✓ Увеличено до ${w}×${h}px (в ${scale}× больше${sharpened ? ", с повышенной резкостью" : ""})`,
  },
  imageToText: {
    hint: "JPG, PNG, WebP — текст будет распознан",
    recogLang: "Язык распознавания",
    extractBtn: "Извлечь текст",
    extracting: "Извлечение…",
    extractedText: "Извлечённый текст",
    placeholder: "Извлечённый текст появится здесь. Его можно отредактировать перед копированием.",
    noText: "(Текст не найден)",
    error: "Ошибка: не удалось распознать текст. Попробуйте другое изображение.",
  },
  pdfToWord: {
    modes: {
      cloud: { label: "★ Лучшее качество (облако)", hint: "Настоящие таблицы и текст Word — обработка на защищённом сервере" },
      exact: { label: "Точная вёрстка (1:1)", hint: "Выглядит как исходный PDF — на вашем устройстве, без загрузки" },
      flow: { label: "Свободный текст", hint: "Чистые абзацы, которые перетекают при правке — на вашем устройстве" },
    },
    convertBtn: "Конвертировать в Word",
    converting: "Конвертация…",
    onServer: "Конвертация на сервере (лучшее качество)…",
    serverUnavailable: "Сервер недоступен — конвертируем на вашем устройстве…",
    readingPdf: "Чтение PDF…",
    buildingDoc: "Сборка документа Word…",
    noteCloud:
      "Режим «лучшее качество» собирает настоящие редактируемые таблицы и текст Word. Ваш файл отправляется на защищённый сервер конвертации и не сохраняется. Если сервер недоступен, конвертация выполняется на вашем устройстве.",
    noteDevice:
      "Точная вёрстка сохраняет размер страницы, положение элементов, шрифты и изображения 1:1 с PDF, а текст остаётся редактируемым. Отсканированные страницы автоматически встраиваются как изображения. Работает прямо в браузере — ничего не загружается.",
    failed: "Не удалось конвертировать: ",
  },
};

const UZ: ToolStrings = {
  common: {
    browse: "fayl tanlang",
    dropFileOr: "Faylni shu yerga tashlang yoki",
    selectedSuffix: "tanlandi",
    addMore: "Yana qo‘shish",
    chooseImage: "Rasm tanlang",
    imgFormats: "JPG, PNG, WebP",
    copy: "Nusxalash",
    copied: "Nusxalandi",
    download: "Yuklab olish",
  },
  merge: {
    dropPdfsOr: "PDF fayllarni tashlang yoki",
    twoOrMore: "2 yoki undan ortiq PDF fayl",
    mergeBtn: "PDF birlashtirish",
    merging: "Birlashtirilmoqda…",
    files: "Fayllar",
    dragOrder: "↔ tartibni belgilash uchun torting",
    noPdfs: "Hozircha PDF yo‘q",
    needTwo: "Kamida 2 ta PDF qo‘shing.",
    failed: "Birlashtirib bo‘lmadi: ",
  },
  compress: {
    levelLabel: "Siqish darajasi",
    levels: {
      low: { label: "Past", hint: "Foto tafsilotlarini saqlaydi" },
      medium: { label: "O‘rta", hint: "Eng yaxshi muvozanat" },
      high: { label: "Yuqori", hint: "Eng kichik fayl" },
    },
    originalSize: "Asl hajmi:",
    onDevice: "shu qurilmada siqiladi, hech narsa yuklanmaydi",
    compressBtn: "PDF siqish",
    compressing: "Siqilmoqda…",
    doneTitle: "Siqildi",
    rowOriginal: "Asl",
    rowCompressed: "Siqilgan",
    rowSaved: "Tejaldi",
    smaller: (pct) => `${pct}% kichikroq`,
    alreadyOptimized: "Allaqachon optimallashtirilgan",
    noImagesNote:
      "Bu PDF asosan matn va vektor grafikadan iborat — siqiladigan surat topilmadi, shuning uchun fayl allaqachon yo‘qotishsiz eng kichik hajmiga yaqin.",
    failed: "Siqib bo‘lmadi: ",
  },
  jpgToPdf: {
    dropImagesOr: "Rasmlarni tashlang yoki",
    formats: "JPG, PNG, WEBP, GIF…",
    pageSize: "Sahifa o‘lchami",
    sizes: { a4: "A4", letter: "Letter", fit: "Moslash" },
    margin: (px) => `Chekka: ${px}px`,
    convertBtn: "PDF ga aylantirish",
    creating: "PDF yaratilmoqda…",
    selectedImages: "Tanlangan rasmlar",
    dragReorder: "↔ tartiblash uchun torting",
    noImages: "Hozircha rasm yo‘q",
    failed: "Aylantirib bo‘lmadi: ",
  },
  pdfToJpg: {
    convertBtn: "JPG ga aylantirish (ZIP)",
    converting: "Aylantirilmoqda…",
    note: "Har bir sahifa yuqori sifatli JPG bo‘lib, ZIP arxivga joylanadi.",
    failed: "Aylantirib bo‘lmadi: ",
  },
  removeBg: {
    original: "Asl rasm",
    removeBtn: "Fonni olib tashlash",
    processing: "Ishlanmoqda…",
    loadingModel: (pct) => `AI modeli yuklanmoqda…${pct} (faqat birinchi marta)`,
    processingPct: (pct) => `Ishlanmoqda… ${pct}%`,
    error: "Xatolik — boshqa rasmni sinab ko‘ring.",
    localNote: "Brauzeringizda ishlaydi — rasmingiz hech qachon yuklanmaydi.",
    result: "Natija",
    transparentTag: "(shaffof)",
    resultHere: "Natija shu yerda paydo bo‘ladi",
    bgColor: "Fon rangi",
    pickNote: "Rang tanlang va yuklab oling. Shaffof variant kesilgan PNG ni saqlaydi.",
    colors: {
      transparent: "Shaffof",
      white: "Oq",
      black: "Qora",
      blue: "Ko‘k",
      red: "Qizil",
      green: "Yashil",
      purple: "Binafsha",
      pink: "Pushti",
      orange: "To‘q sariq",
      sky: "Moviy",
    },
  },
  upscale: {
    chooseBlurry: "Xira yoki kichik rasmni tanlang",
    dims: (ow, oh, nw, nh) => `Asl: ${ow}×${oh}px → Yangi: ${nw}×${nh}px`,
    factor: "Kattalashtirish koeffitsienti",
    sharpen: "Tafsilotlarni aniqlashtirish (xira suratlar uchun tavsiya etiladi)",
    strength: (pct) => `Aniqlashtirish kuchi: ${pct}%`,
    enhanceBtn: "Rasmni yaxshilash",
    enhancing: "Yaxshilanmoqda…",
    enhancedResult: "Yaxshilangan natija",
    enhancedHere: "Yaxshilangan rasm shu yerda paydo bo‘ladi",
    enhancedTo: (w, h, scale, sharpened) =>
      `✓ ${w}×${h}px gacha kattalashtirildi (${scale}× katta${sharpened ? ", aniqlashtirilgan" : ""})`,
  },
  imageToText: {
    hint: "JPG, PNG, WebP — matn ajratib olinadi",
    recogLang: "Tanib olish tili",
    extractBtn: "Matnni ajratish",
    extracting: "Ajratilmoqda…",
    extractedText: "Ajratilgan matn",
    placeholder: "Ajratilgan matn shu yerda paydo bo‘ladi. Nusxalashdan oldin tahrirlashingiz mumkin.",
    noText: "(Matn topilmadi)",
    error: "Xatolik: matnni ajratib bo‘lmadi. Boshqa rasmni sinab ko‘ring.",
  },
  pdfToWord: {
    modes: {
      cloud: { label: "★ Eng yaxshi sifat (bulut)", hint: "Haqiqiy Word jadvallari va matni — himoyalangan serverda qayta ishlanadi" },
      exact: { label: "Aniq joylashuv (1:1)", hint: "PDF bilan bir xil ko‘rinadi — qurilmangizda, hech narsa yuklanmaydi" },
      flow: { label: "Erkin matn", hint: "Tahrirlaganda qayta oqadigan toza xatboshilar — qurilmangizda" },
    },
    convertBtn: "Word ga aylantirish",
    converting: "Aylantirilmoqda…",
    onServer: "Serverda aylantirilmoqda (eng yaxshi sifat)…",
    serverUnavailable: "Server mavjud emas — qurilmangizda aylantirilmoqda…",
    readingPdf: "PDF o‘qilmoqda…",
    buildingDoc: "Word hujjati yig‘ilmoqda…",
    noteCloud:
      "«Eng yaxshi sifat» rejimi haqiqiy tahrirlanadigan Word jadvallari va matnini qayta quradi. Faylingiz himoyalangan aylantirish serveriga yuboriladi va saqlanmaydi. Agar server mavjud bo‘lmasa, aylantirish qurilmangizda bajariladi.",
    noteDevice:
      "Aniq joylashuv sahifa o‘lchami, elementlar o‘rni, shriftlar va rasmlarni PDF bilan 1:1 saqlaydi, matn esa tahrirlanadigan bo‘lib qoladi. Skanerlangan sahifalar avtomatik ravishda rasm sifatida joylashtiriladi. Brauzeringizda ishlaydi — hech narsa yuklanmaydi.",
    failed: "Aylantirib bo‘lmadi: ",
  },
};

const DICTS: Record<ToolLang, ToolStrings> = { en: EN, ru: RU, uz: UZ };

export function toolUI(lang: ToolLang = "en"): ToolStrings {
  return DICTS[lang] ?? EN;
}
