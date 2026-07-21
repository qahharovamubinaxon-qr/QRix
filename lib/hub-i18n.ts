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
        a: "Нет, формат остаётся прежним. Если нужно ещё и сменить формат — например, PNG на JPG, — воспользуйтесь конвертером изображений после изменения размера.",
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
        a: "Yo'q, format o'zgarmaydi. Formatni ham almashtirish kerak bo'lsa — masalan, PNG'ni JPG'ga — o'lchamni o'zgartirgandan keyin rasm konverteridan foydalaning.",
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
