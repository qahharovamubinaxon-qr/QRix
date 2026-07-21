/* RU + UZ copy for the localized hub pages:
   /ru|/uz/resize  → parent of the 50 localized preset pages
   /ru|/uz/convert → parent of the 40 localized converter pairs

   The preset and pair pages already rank on their own long-tail terms; what
   they lacked was a localized parent, so every internal path out of them
   dropped the visitor into English. These hubs also carry the head terms
   themselves ("конвертер изображений", "rasm o'lchamini o'zgartirish"),
   which no single preset page can target. Copy is written per language —
   not translated from the EN hub — because the explanations people search
   for differ (RU/UZ users arrive from document-photo and print queries far
   more often than EN users do). */

export type Lang = "ru" | "uz";

export type HubCopy = {
  title: string;
  desc: string;
  keywords: string[];
  crumb: string;                 // breadcrumb leaf + JSON-LD name
  h1: string;
  intro: string;
  meta: (n: number) => string;   // the mono line under the intro
  itemListName: string;
  /** resize only — section per preset group */
  groups?: Record<string, { title: string; blurb: string }>;
  /** convert only — section per target format */
  sectionTitle?: (to: string) => string;
  explainTitle: string;
  explain: [string, string][];   // bold lead-in + body
  faqTitle: string;
  faqs: { q: string; a: string }[];
  links: { href: string; label: string }[];
};

const HOME = { ru: "Главная", uz: "Bosh sahifa" };
export const hubHome = (l: Lang) => HOME[l];

/* ─────────────────────────── /resize ─────────────────────────── */

export const RESIZE_HUB: Record<Lang, HubCopy> = {
  ru: {
    title: "Изменить размер изображения — 25 готовых размеров, бесплатно",
    desc: "Подгоните фото под точный размер в пикселях: 1920x1080, 4K, квадрат, фото на паспорт, 10x15 см, A4 и другие. Всё работает в браузере — без загрузки на сервер и без водяных знаков.",
    keywords: [
      "изменить размер изображения",
      "изменить размер фото онлайн",
      "размер фото в пикселях",
      "фото на документы размер",
      "уменьшить размер картинки",
      "resize фото бесплатно",
    ],
    crumb: "Размеры изображений",
    h1: "Изменить размер изображения под точный размер",
    intro:
      "Выберите нужный размер — кадрирование подберётся само: «заполнить», чтобы закрыть всю рамку без полей, или «вписать», чтобы сохранить снимок целиком на фоне выбранного цвета. Всё считается прямо в браузере: файл не уходит на сервер, регистрация не нужна, водяных знаков нет.",
    meta: (n) => `${n} размеров · бесплатно · без загрузки на сервер`,
    itemListName: "Размеры изображений",
    groups: {
      Display: {
        title: "Экраны и обои",
        blurb: "Стандартные разрешения мониторов и телевизоров — для обоев рабочего стола, фонов презентаций и видео.",
      },
      Web: {
        title: "Веб и соцсети",
        blurb: "Квадраты, аватары и карточки ссылок в тех размерах, в которых их показывают сами площадки.",
      },
      Print: {
        title: "Размеры для печати",
        blurb: "Фотографические и бумажные форматы в полных 300 DPI, которые просит типография.",
      },
      ID: {
        title: "Документы и паспорт",
        blurb: "Официальные размеры фото на документы. Требования к позе, фону и полям уточняйте в своей стране — здесь задаются только пиксели.",
      },
    },
    explainTitle: "«Заполнить» или «вписать» — что выбрать?",
    explain: [
      ["Заполнить", "масштабирует изображение, пока оно не закроет всю рамку, и обрезает то, что вышло за края. Берите для обоев, портретов и всего, что должно быть без полей."],
      ["Вписать", "масштабирует изображение так, чтобы оно поместилось целиком, а оставшееся место заливает выбранным цветом. Берите для логотипов, товарных фото и схем, где детали у краёв терять нельзя."],
      ["Пропорции сохраняются всегда", "инструмент обрезает или добавляет поля, но никогда не растягивает кадр — лица и формы остаются правильными в обоих режимах."],
      ["У увеличения есть предел", "растянуть маленький снимок до крупного размера можно, но новых деталей не появится. Начинайте с самого большого оригинала, который у вас есть."],
    ],
    faqTitle: "Вопросы и ответы",
    faqs: [
      {
        q: "Как понять, какой размер мне нужен?",
        a: "Отталкивайтесь от того, где изображение покажут. Экран и видео — это 16:9 (1920×1080, 2560×1440, 4K). Соцсети — квадрат или вертикаль. Печать — сантиметры, пересчитанные в пиксели при 300 DPI. Документы — миллиметры по требованию ведомства. В каждой карточке подписано, для чего размер нужен.",
      },
      {
        q: "Загружаются ли мои изображения на сервер?",
        a: "Нет. Изменение размера выполняется прямо в браузере через Canvas API: файл не покидает ваше устройство, ничего не сохраняется и не передаётся.",
      },
      {
        q: "Нужного размера нет в списке — что делать?",
        a: "Откройте инструмент со свободными шириной и высотой: там задаются любые значения в пикселях, а режимы «заполнить» и «вписать» работают так же.",
      },
      {
        q: "Меняется ли формат файла при изменении размера?",
        a: "Формат сохраняется: JPG остаётся JPG, PNG — PNG вместе с прозрачностью, WebP — WebP. Остальные исходники (HEIC, TIFF, BMP) отдаются как JPG, потому что браузер не умеет записывать их обратно. Нужен другой формат специально — конвертер изображений после изменения размера.",
      },
    ],
    links: [
      { href: "/image-tools/resize", label: "Свои ширина и высота" },
      { href: "/ru/convert", label: "Конвертер изображений" },
      { href: "/image-tools", label: "Все инструменты для изображений" },
    ],
  },
  uz: {
    title: "Rasm o'lchamini o'zgartirish — 25 ta tayyor o'lcham, bepul",
    desc: "Fotoni aniq piksel o'lchamiga moslang: 1920x1080, 4K, kvadrat, hujjat uchun surat, 10x15 sm, A4 va boshqalar. Hammasi brauzerda ishlaydi — serverga yuklamasdan va suv belgisisiz.",
    keywords: [
      "rasm o'lchamini o'zgartirish",
      "surat o'lchamini kichraytirish",
      "rasm o'lchami piksel",
      "hujjat uchun surat o'lchami",
      "onlayn rasm resize",
      "foto o'lchamini moslash",
    ],
    crumb: "Rasm o'lchamlari",
    h1: "Rasm o'lchamini aniq o'lchamga keltirish",
    intro:
      "Kerakli o'lchamni tanlang — kesish o'zi to'g'rilanadi: kadrni chetsiz to'liq qoplash uchun «to'ldirish», rasmni butunligicha tanlangan rangdagi fonda saqlash uchun «sig'dirish». Barchasi brauzerda hisoblanadi: fayl serverga ketmaydi, ro'yxatdan o'tish shart emas, suv belgisi yo'q.",
    meta: (n) => `${n} ta o'lcham · bepul · serverga yuklamasdan`,
    itemListName: "Rasm o'lchamlari",
    groups: {
      Display: {
        title: "Ekranlar va fon rasmlari",
        blurb: "Monitor va televizorlarning standart o'lchamlari — ish stoli foni, taqdimot va video fonlari uchun.",
      },
      Web: {
        title: "Veb va ijtimoiy tarmoqlar",
        blurb: "Kvadratlar, avatarlar va havola kartochkalari — platformalar aynan shu o'lchamlarda ko'rsatadi.",
      },
      Print: {
        title: "Bosma o'lchamlari",
        blurb: "Bosmaxona so'raydigan to'liq 300 DPI dagi foto va qog'oz formatlari.",
      },
      ID: {
        title: "Hujjat va pasport",
        blurb: "Hujjatga surat uchun rasmiy o'lchamlar. Poza, fon va chetlar bo'yicha talablarni o'z davlatingizdan aniqlang — bu yerda faqat piksel beriladi.",
      },
    },
    explainTitle: "«To'ldirish» yoki «sig'dirish» — qaysi biri?",
    explain: [
      ["To'ldirish", "rasmni butun kadrni qoplaguncha kattalashtiradi va chetdan chiqqanini kesadi. Fon rasmlari, portretlar va chetsiz bo'lishi kerak bo'lgan hamma narsa uchun."],
      ["Sig'dirish", "rasm to'liq sig'adigan qilib kichraytiradi, qolgan joyni esa tanlangan rang bilan to'ldiradi. Logotip, mahsulot surati va chizmalar uchun — chetdagi detallarni yo'qotib bo'lmaydigan joyda."],
      ["Nisbat har doim saqlanadi", "vosita kesadi yoki chet qo'shadi, lekin kadrni hech qachon cho'zmaydi — yuz va shakllar ikkala rejimda ham to'g'ri qoladi."],
      ["Kattalashtirishning chegarasi bor", "kichik suratni katta o'lchamga cho'zish mumkin, ammo yangi detallar paydo bo'lmaydi. Eng katta originaldan boshlang."],
    ],
    faqTitle: "Savol-javob",
    faqs: [
      {
        q: "Menga qaysi o'lcham kerakligini qanday bilaman?",
        a: "Rasm qayerda ko'rsatilishidan kelib chiqing. Ekran va video — 16:9 (1920×1080, 2560×1440, 4K). Ijtimoiy tarmoqlar — kvadrat yoki vertikal. Bosma — 300 DPI da pikselga aylantirilgan santimetrlar. Hujjat — idora talab qilgan millimetrlar. Har bir kartochkada o'lcham nima uchun kerakligi yozilgan.",
      },
      {
        q: "Rasmlarim serverga yuklanadimi?",
        a: "Yo'q. O'lcham o'zgartirish to'g'ridan-to'g'ri brauzerda Canvas API orqali bajariladi: fayl qurilmangizdan chiqmaydi, hech narsa saqlanmaydi va uzatilmaydi.",
      },
      {
        q: "Kerakli o'lcham ro'yxatda yo'q bo'lsa-chi?",
        a: "Eni va bo'yi erkin bo'lgan vositani oching: u yerda istalgan piksel qiymatini kiritish mumkin, «to'ldirish» va «sig'dirish» rejimlari xuddi shunday ishlaydi.",
      },
      {
        q: "O'lcham o'zgarganda fayl formati o'zgaradimi?",
        a: "Format saqlanadi: JPG — JPG, PNG — shaffofligi bilan PNG, WebP — WebP bo'lib qaytadi. Boshqa manbalar (HEIC, TIFF, BMP) JPG bo'lib beriladi, chunki brauzer ularni qayta yoza olmaydi. Boshqa format ataylab kerak bo'lsa — o'lchamdan keyin rasm konverteridan foydalaning.",
      },
    ],
    links: [
      { href: "/image-tools/resize", label: "O'z eni va bo'yi" },
      { href: "/uz/convert", label: "Rasm konverteri" },
      { href: "/image-tools", label: "Barcha rasm vositalari" },
    ],
  },
};

/* ─────────────────────────── /convert ─────────────────────────── */

export const CONVERT_HUB: Record<Lang, HubCopy> = {
  ru: {
    title: "Конвертер изображений — PNG, JPG, WebP, AVIF, TIFF онлайн",
    desc: "Конвертируйте изображения между PNG, JPG, WebP, AVIF, BMP, ICO и TIFF бесплатно. Каждое преобразование выполняется в браузере — файлы не загружаются на сервер, водяных знаков нет.",
    keywords: [
      "конвертер изображений",
      "конвертировать фото онлайн",
      "png в jpg",
      "webp конвертер",
      "avif конвертер",
      "поменять формат изображения",
    ],
    crumb: "Конвертер изображений",
    h1: "Конвертер изображений",
    intro:
      "Выберите нужное направление конвертации — из какого формата и в какой. Всё работает прямо в браузере через Canvas API: файлы не отправляются на сервер, регистрация не нужна, водяных знаков нет, а размер файла ничем не ограничен, кроме памяти вашего устройства.",
    meta: (n) => `${n} конвертеров · бесплатно · без загрузки на сервер`,
    itemListName: "Конвертеры изображений",
    sectionTitle: (to) => `Конвертировать в ${to}`,
    explainTitle: "Какой формат выбрать?",
    explain: [
      ["JPG", "фотографии и всё, что должно открыться где угодно. Сжатие с потерями, прозрачности нет, поддержка абсолютная."],
      ["PNG", "скриншоты, логотипы и графика с чёткими линиями. Без потерь и с полной прозрачностью, но файлы крупнее."],
      ["WebP", "разумный формат по умолчанию для сайта: примерно на треть легче JPG при том же качестве, умеет прозрачность, понимают все актуальные браузеры."],
      ["AVIF", "самые маленькие файлы на сегодня, часто вдвое легче JPG. Кодируется медленнее — на сайте отдавайте с запасным вариантом."],
      ["TIFF", "сканы, архивы и типография. Формат без потерь, который принимают печатные и документные системы; бывает многостраничным."],
      ["BMP и ICO", "BMP — несжатые пиксели для старого софта и встроенных экранов; ICO — иконки Windows и фавиконка сайта по адресу /favicon.ico."],
    ],
    faqTitle: "Вопросы и ответы",
    faqs: [
      {
        q: "Какой формат лучше для сайта?",
        a: "WebP — он легче JPG примерно на 30% при том же качестве, поддерживает прозрачность и работает во всех современных браузерах. AVIF ещё компактнее, но его стоит отдавать вместе с запасным WebP или JPG.",
      },
      {
        q: "Теряется ли качество при конвертации?",
        a: "Зависит от целевого формата. PNG, TIFF и BMP хранят пиксели без потерь. JPG, WebP и AVIF пересжимают изображение: на качестве 90 разница глазом не видна, ниже 70 становятся заметны ореолы вокруг текста и резких границ.",
      },
      {
        q: "Что происходит с прозрачностью?",
        a: "PNG, WebP, AVIF, TIFF и ICO прозрачность сохраняют. JPG и BMP её не поддерживают, поэтому прозрачные области заливаются белым перед сохранением — чёрных квадратов, как у дешёвых конвертеров, не будет.",
      },
      {
        q: "Загружаются ли файлы на сервер?",
        a: "Нет. Конвертация выполняется в браузере через Canvas API: изображение никуда не передаётся и нигде не сохраняется, поэтому паспорта, договоры и медицинские снимки можно конвертировать спокойно.",
      },
    ],
    links: [
      { href: "/ru/resize", label: "Изменить размер изображения" },
      { href: "/image-tools/compress", label: "Сжать изображение" },
      { href: "/image-tools", label: "Все инструменты для изображений" },
    ],
  },
  uz: {
    title: "Rasm konverteri — PNG, JPG, WebP, AVIF, TIFF onlayn",
    desc: "Rasmlarni PNG, JPG, WebP, AVIF, BMP, ICO va TIFF orasida bepul aylantiring. Har bir aylantirish brauzerda bajariladi — fayllar serverga yuklanmaydi, suv belgisi yo'q.",
    keywords: [
      "rasm konverteri",
      "rasm formatini o'zgartirish",
      "png dan jpg ga",
      "webp konverter",
      "avif konverter",
      "onlayn foto konverter",
    ],
    crumb: "Rasm konverteri",
    h1: "Rasm konverteri",
    intro:
      "Kerakli yo'nalishni tanlang — qaysi formatdan qaysisiga. Barchasi brauzerda Canvas API orqali ishlaydi: fayllar serverga yuborilmaydi, ro'yxatdan o'tish shart emas, suv belgisi yo'q, fayl hajmi esa faqat qurilmangiz xotirasi bilan cheklanadi.",
    meta: (n) => `${n} ta konverter · bepul · serverga yuklamasdan`,
    itemListName: "Rasm konverterlari",
    sectionTitle: (to) => `${to} ga aylantirish`,
    explainTitle: "Qaysi formatni tanlash kerak?",
    explain: [
      ["JPG", "fotosuratlar va hamma joyda ochilishi kerak bo'lgan hamma narsa. Yo'qotishli siqish, shaffoflik yo'q, qo'llab-quvvatlash mutlaq."],
      ["PNG", "skrinshotlar, logotiplar va aniq chiziqli grafika. Yo'qotishsiz va to'liq shaffoflik bilan, ammo fayllar kattaroq."],
      ["WebP", "sayt uchun oqilona standart: bir xil sifatda JPG'dan taxminan uchdan bir yengil, shaffoflikni biladi, barcha zamonaviy brauzerlar tushunadi."],
      ["AVIF", "bugungi kunda eng kichik fayllar, ko'pincha JPG'dan ikki barobar yengil. Sekinroq kodlanadi — saytda zaxira variant bilan bering."],
      ["TIFF", "skanlar, arxivlar va bosmaxona. Bosma va hujjat tizimlari qabul qiladigan yo'qotishsiz format; ko'p sahifali bo'lishi mumkin."],
      ["BMP va ICO", "BMP — eski dasturlar va o'rnatilgan ekranlar uchun siqilmagan piksellar; ICO — Windows ikonkalari va /favicon.ico manzilidagi sayt favikonkasi."],
    ],
    faqTitle: "Savol-javob",
    faqs: [
      {
        q: "Sayt uchun qaysi format yaxshiroq?",
        a: "WebP — bir xil sifatda JPG'dan taxminan 30% yengil, shaffoflikni qo'llaydi va barcha zamonaviy brauzerlarda ishlaydi. AVIF yanada ixcham, lekin uni zaxira WebP yoki JPG bilan birga berish tavsiya etiladi.",
      },
      {
        q: "Aylantirishda sifat yo'qoladimi?",
        a: "Maqsad formatiga bog'liq. PNG, TIFF va BMP piksellarni yo'qotishsiz saqlaydi. JPG, WebP va AVIF rasmni qayta siqadi: 90 sifatda farq ko'zga ko'rinmaydi, 70 dan pastda matn va keskin chegaralar atrofida iz sezila boshlaydi.",
      },
      {
        q: "Shaffoflik nima bo'ladi?",
        a: "PNG, WebP, AVIF, TIFF va ICO shaffoflikni saqlaydi. JPG va BMP uni qo'llamaydi, shuning uchun shaffof joylar saqlashdan oldin oq rang bilan to'ldiriladi — arzon konverterlardagidek qora kvadratlar chiqmaydi.",
      },
      {
        q: "Fayllar serverga yuklanadimi?",
        a: "Yo'q. Aylantirish brauzerda Canvas API orqali bajariladi: rasm hech qayerga uzatilmaydi va saqlanmaydi, shuning uchun pasport, shartnoma va tibbiy suratlarni bemalol aylantirsa bo'ladi.",
      },
    ],
    links: [
      { href: "/uz/resize", label: "Rasm o'lchamini o'zgartirish" },
      { href: "/image-tools/compress", label: "Rasmni siqish" },
      { href: "/image-tools", label: "Barcha rasm vositalari" },
    ],
  },
};

/* ─────────────────────────── /barcode ─────────────────────────── */

/* The 13 localized symbology pages each own a narrow query ("генератор
   pdf417"). What none of them can own is the head term — "генератор штрих
   кодов" / "shtrix kod generatori" — or the comparison intent that brings
   most of this traffic: someone who knows they need a barcode but not which
   symbology. So this hub is written as a chooser, grouped by where the code
   is actually used, rather than as a list of links. */

export const BARCODE_HUB: Record<Lang, HubCopy> = {
  ru: {
    title: "Генератор штрих-кодов — 13 форматов онлайн и бесплатно",
    desc: "Создайте штрих-код любого из 13 форматов: EAN-13, UPC-A, Code 128, PDF417, Data Matrix, Aztec, ITF-14, Code 39 и другие. Скачайте PNG или векторный SVG для печати. Без регистрации, всё считается в браузере.",
    keywords: [
      "генератор штрих кодов",
      "создать штрих код онлайн",
      "штрих код генератор бесплатно",
      "сделать штрих код для товара",
      "генератор ean 13",
      "штрих код в svg для печати",
    ],
    crumb: "Штрих-коды",
    h1: "Генератор штрих-кодов",
    intro:
      "Выберите формат по задаче — товар на полке, коробка на складе, деталь размером с ноготь или удостоверение. Введите значение, настройте вид и скачайте PNG для экрана либо SVG для типографии. Ничего не загружается на сервер: код рисуется прямо в браузере.",
    meta: (n) => `${n} форматов · PNG и SVG · всё в браузере`,
    itemListName: "Форматы штрих-кодов",
    groups: {
      "2D codes": {
        title: "Двумерные коды",
        blurb: "Хранят текст, а не только цифры: от сотен до тысяч символов в одном символе. Нужны там, где в одно сканирование надо передать целую запись — документ, билет, маркировку детали.",
      },
      Retail: {
        title: "Розница",
        blurb: "Товарные номера, которые читает касса. Длина фиксирована, контрольная цифра считается автоматически — вводите цифры без неё.",
      },
      Logistics: {
        title: "Склад и логистика",
        blurb: "Коробки, паллеты, накладные. Здесь важнее не плотность, а надёжное чтение с расстояния и печать на гофрокартоне.",
      },
      Industry: {
        title: "Промышленность и спецформаты",
        blurb: "Закрытые системы учёта, аптечная упаковка, банки крови, библиотеки. Форматы старые, но живые — их всё ещё требуют работающие парки считывателей.",
      },
    },
    explainTitle: "Как выбрать формат",
    explain: [
      ["Товар в магазине", "EAN-13 — мировой стандарт, UPC-A — США и Канада, EAN-8 — для мелкой упаковки. Сам номер выдаёт GS1: генератор рисует символ, но не регистрирует номер за вами."],
      ["Внутренний учёт", "Code 128 — самый практичный выбор: принимает буквы и цифры, компактен и читается любым сканером. Code 39 берут там, где парк оборудования старый."],
      ["Коробки и паллеты", "ITF-14 рассчитан на печать по гофрокартону: толстые штрихи и рамка-bearer bar прощают растекание краски при флексопечати."],
      ["Мелкая деталь", "Data Matrix плотнее всех на площади в несколько миллиметров и читается даже после разрушения трети символа — поэтому его выжигают лазером прямо по металлу."],
      ["Билет или документ", "Aztec не требует пустого поля вокруг и экономит место на узком билете; PDF417 вмещает около 1850 символов и стоит на правах и посадочных талонах."],
      ["Печать против экрана", "SVG — вектор: штрихи остаются резкими при любом физическом размере, это то, что просит типография. PNG берите для документа, презентации или экрана."],
    ],
    faqTitle: "Частые вопросы",
    faqs: [
      {
        q: "Какой штрих-код нужен для продажи товара в магазине?",
        a: "EAN-13 в большинстве стран и UPC-A в США и Канаде. Но одного генератора мало: чтобы номер был уникальным в мире, его нужно получить в GS1 — генератор корректно закодирует уже выданный вам номер в символ, готовый к печати.",
      },
      {
        q: "Нужно ли самому считать контрольную цифру?",
        a: "Нет. Для EAN-13, EAN-8, UPC-A и ITF-14 введите цифры без последней — контрольная посчитается автоматически. У ITF, MSI и Pharmacode собственной контрольной цифры в формате нет, поэтому значение вводится целиком.",
      },
      {
        q: "Чем 2D-коды отличаются от обычных штрих-кодов?",
        a: "Линейный код хранит идентификатор — короткую строку, по которой система находит запись в базе. Двумерный хранит саму запись: имя, адрес, номер партии, ссылку. Поэтому Data Matrix и PDF417 работают там, где базы под рукой нет.",
      },
      {
        q: "Загружаются ли данные на сервер?",
        a: "Нет. Штрих-код целиком рисуется в вашем браузере — введённое значение никуда не отправляется и нигде не сохраняется.",
      },
      {
        q: "Можно ли сделать сразу много кодов?",
        a: "Да: в генераторе есть пакетный режим — вставьте значения по одному в строке и скачайте все символы разом.",
      },
    ],
    links: [
      { href: "/qr-tools", label: "Генератор QR-кодов" },
      { href: "/ru/convert", label: "Конвертер изображений" },
      { href: "/qr-tools/decode", label: "Сканер кодов" },
    ],
  },
  uz: {
    title: "Shtrix kod generatori — 13 ta format onlayn va bepul",
    desc: "13 ta formatdan istalganida shtrix kod yarating: EAN-13, UPC-A, Code 128, PDF417, Data Matrix, Aztec, ITF-14, Code 39 va boshqalar. Bosma uchun PNG yoki vektor SVG yuklab oling. Ro'yxatdan o'tmasdan, hammasi brauzerda.",
    keywords: [
      "shtrix kod generatori",
      "shtrix kod yaratish onlayn",
      "bepul shtrix kod generatori",
      "tovar uchun shtrix kod",
      "ean 13 generatori",
      "bosma uchun svg shtrix kod",
    ],
    crumb: "Shtrix kodlar",
    h1: "Shtrix kod generatori",
    intro:
      "Formatni vazifaga qarab tanlang — javondagi tovar, ombordagi quti, tirnoqdek mayda detal yoki guvohnoma. Qiymatni kiriting, ko'rinishini sozlang va ekran uchun PNG yoki bosmaxona uchun SVG yuklab oling. Hech narsa serverga yuklanmaydi: kod bevosita brauzerda chiziladi.",
    meta: (n) => `${n} ta format · PNG va SVG · hammasi brauzerda`,
    itemListName: "Shtrix kod formatlari",
    groups: {
      "2D codes": {
        title: "Ikki o'lchovli kodlar",
        blurb: "Faqat raqamni emas, matnni saqlaydi: bitta belgiga yuzlab-minglab belgi sig'adi. Bitta skanerlashda butun yozuvni — hujjat, chipta, detal markirovkasini — uzatish kerak bo'lganda ishlatiladi.",
      },
      Retail: {
        title: "Chakana savdo",
        blurb: "Kassa o'qiydigan tovar raqamlari. Uzunligi qat'iy, nazorat raqami avtomatik hisoblanadi — raqamlarni usiz kiriting.",
      },
      Logistics: {
        title: "Ombor va logistika",
        blurb: "Qutilar, pallettalar, yuk hujjatlari. Bu yerda zichlik emas, masofadan ishonchli o'qilishi va gofrokartonga bosilishi muhimroq.",
      },
      Industry: {
        title: "Sanoat va maxsus formatlar",
        blurb: "Yopiq hisob tizimlari, dorixona o'ramlari, qon banklari, kutubxonalar. Formatlar eski, lekin tirik — ishlab turgan o'quvchilar parki ularni hanuz talab qiladi.",
      },
    },
    explainTitle: "Formatni qanday tanlash kerak",
    explain: [
      ["Do'kondagi tovar", "EAN-13 — jahon standarti, UPC-A — AQSh va Kanada, EAN-8 — mayda o'ram uchun. Raqamning o'zini GS1 beradi: generator belgini chizadi, lekin raqamni sizga ro'yxatdan o'tkazmaydi."],
      ["Ichki hisob", "Code 128 — eng amaliy tanlov: harf va raqamni qabul qiladi, ixcham va istalgan skaner o'qiydi. Uskunalar parki eski bo'lgan joyda Code 39 olinadi."],
      ["Qutilar va pallettalar", "ITF-14 gofrokartonga bosish uchun mo'ljallangan: qalin chiziqlar va bearer bar ramkasi fleksobosmadagi bo'yoq yoyilishini kechiradi."],
      ["Mayda detal", "Data Matrix bir necha millimetr maydonda eng zich va belgining uchdan biri buzilsa ham o'qiladi — shuning uchun uni metallga lazer bilan kuydiradilar."],
      ["Chipta yoki hujjat", "Aztec ga atrofdagi bo'sh maydon kerak emas va ingichka chiptada joy tejaydi; PDF417 esa 1850 ga yaqin belgini sig'diradi va guvohnoma hamda aviatalonlarda turadi."],
      ["Bosma va ekran", "SVG — vektor: chiziqlar istalgan jismoniy o'lchamda keskin qoladi, bosmaxona aynan shuni so'raydi. PNG ni hujjat, taqdimot yoki ekran uchun oling."],
    ],
    faqTitle: "Ko'p so'raladigan savollar",
    faqs: [
      {
        q: "Do'konda tovar sotish uchun qaysi shtrix kod kerak?",
        a: "Ko'pchilik davlatlarda EAN-13, AQSh va Kanadada UPC-A. Ammo generatorning o'zi yetarli emas: raqam jahon miqyosida noyob bo'lishi uchun uni GS1 dan olish kerak — generator sizga berilgan raqamni bosmaga tayyor belgiga to'g'ri kodlaydi.",
      },
      {
        q: "Nazorat raqamini o'zim hisoblashim kerakmi?",
        a: "Yo'q. EAN-13, EAN-8, UPC-A va ITF-14 uchun raqamlarni oxirgisisiz kiriting — nazorat raqami avtomatik hisoblanadi. ITF, MSI va Pharmacode formatlarida o'z nazorat raqami yo'q, shuning uchun qiymat to'liq kiritiladi.",
      },
      {
        q: "2D kodlar oddiy shtrix koddan nimasi bilan farq qiladi?",
        a: "Chiziqli kod identifikatorni saqlaydi — tizim baza'dan yozuvni topadigan qisqa qator. Ikki o'lchovlisi yozuvning o'zini saqlaydi: ism, manzil, partiya raqami, havola. Shuning uchun Data Matrix va PDF417 baza yo'q joyda ham ishlaydi.",
      },
      {
        q: "Ma'lumotlar serverga yuklanadimi?",
        a: "Yo'q. Shtrix kod to'liq brauzeringizda chiziladi — kiritilgan qiymat hech qayerga yuborilmaydi va saqlanmaydi.",
      },
      {
        q: "Bir vaqtda ko'p kod yasash mumkinmi?",
        a: "Ha: generatorda paketli rejim bor — qiymatlarni har qatorga bittadan joylashtiring va barcha belgilarni birdaniga yuklab oling.",
      },
    ],
    links: [
      { href: "/qr-tools", label: "QR kod generatori" },
      { href: "/uz/convert", label: "Rasm konverteri" },
      { href: "/qr-tools/decode", label: "Kod skaneri" },
    ],
  },
};
