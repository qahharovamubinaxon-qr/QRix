/* High-value tools localized for RU + UZ — the niches Vercel Analytics showed
   Yandex already sending traffic to. Each entry drives /ru/<slug> and
   /uz/<slug> (SSG) rendering the SAME working client with localized SEO copy.
   Kept to the biggest-volume, weak-competition tools rather than all 49. */

export type LocCopy = {
  title: string; h1: string; desc: string; intro: string;
  keywords: string[]; steps: [string, string][]; faqs: { q: string; a: string }[];
};

export type LocTool = {
  slug: string;      // route segment + engine key
  enPath: string;    // canonical English page (for hreflang + "English version")
  emoji: string; grad: string;
  ru: LocCopy; uz: LocCopy;
};

export const LOC_TOOLS: LocTool[] = [
  {
    slug: "pdf-to-word", enPath: "/pdf-tools/pdf-to-word", emoji: "📝", grad: "linear-gradient(135deg,#2563eb,#60a5fa)",
    ru: {
      title: "PDF в Word онлайн — конвертировать бесплатно, 1:1",
      h1: "Конвертировать PDF в Word",
      desc: "Бесплатный конвертер PDF в Word (DOCX) с сохранением таблиц, шрифтов и вёрстки 1:1. Без регистрации и водяных знаков.",
      intro: "Загрузите PDF — получите редактируемый документ Word, где таблицы, шрифты и расположение сохранены точь-в-точь. Работает на телефоне и компьютере, прямо в браузере.",
      keywords: ["pdf в word", "конвертировать pdf в word", "pdf to word бесплатно", "пдф в ворд онлайн", "перевести pdf в word"],
      steps: [["Загрузите PDF", "Выберите документ для конвертации."], ["Конвертация", "Инструмент переносит текст и вёрстку в формат Word."], ["Скачайте DOCX", "Сохраните редактируемый файл Word."]],
      faqs: [
        { q: "Сохраняется ли форматирование?", a: "Да — таблицы, шрифты, колонки и расположение переносятся максимально близко к оригиналу." },
        { q: "Это бесплатно?", a: "Да, полностью бесплатно, без регистрации и водяных знаков." },
        { q: "Работает ли со сканами?", a: "Для сканированных PDF применяется OCR, где это возможно; лучший результат — с текстовыми PDF." },
      ],
    },
    uz: {
      title: "PDF'ni Word'ga aylantirish — bepul, 1:1 onlayn",
      h1: "PDF'ni Word'ga aylantirish",
      desc: "PDF'ni Word'ga (DOCX) bepul aylantiring — jadvallar, shriftlar va dizayn 1:1 saqlanadi. Ro'yxatsiz, suv belgisisiz.",
      intro: "PDF yuklang — jadvallar, shriftlar va joylashuvi asl nusxadek saqlangan tahrirlanadigan Word hujjatini oling. Telefon va kompyuterda, brauzerda ishlaydi.",
      keywords: ["pdf ni word ga", "pdf word aylantirish", "pdf to word bepul", "pdf dan word", "pdf ni word ga o'tkazish"],
      steps: [["PDF yuklang", "Aylantiriladigan hujjatni tanlang."], ["Aylantirish", "Vosita matn va dizaynni Word formatiga o'tkazadi."], ["DOCX yuklab oling", "Tahrirlanadigan Word faylini saqlang."]],
      faqs: [
        { q: "Formatlash saqlanadimi?", a: "Ha — jadvallar, shriftlar, ustunlar va joylashuv asl nusxaga imkon qadar yaqin saqlanadi." },
        { q: "Bepulmi?", a: "Ha, to'liq bepul, ro'yxatsiz va suv belgisisiz." },
        { q: "Skan bilan ishlaydimi?", a: "Skanlangan PDF uchun imkon bo'lsa OCR qo'llanadi; eng yaxshi natija — matnli PDF bilan." },
      ],
    },
  },
  {
    slug: "merge", enPath: "/pdf-tools/merge", emoji: "🔗", grad: "linear-gradient(135deg,#dc2626,#f87171)",
    ru: {
      title: "Объединить PDF онлайн — соединить файлы бесплатно",
      h1: "Объединить PDF",
      desc: "Соедините несколько PDF в один файл онлайн бесплатно. Перетащите, измените порядок и скачайте — без регистрации.",
      intro: "Загрузите несколько PDF, расположите их в нужном порядке и объедините в один документ. Всё происходит в браузере — файлы никуда не загружаются.",
      keywords: ["объединить pdf", "соединить pdf", "склеить pdf онлайн", "объединить pdf файлы", "pdf merge бесплатно"],
      steps: [["Загрузите файлы", "Выберите несколько PDF."], ["Расположите по порядку", "Перетащите страницы в нужном порядке."], ["Скачайте один PDF", "Сохраните объединённый документ."]],
      faqs: [
        { q: "Сколько файлов можно объединить?", a: "Столько, сколько нужно — ограничения по количеству нет." },
        { q: "Загружаются ли мои файлы на сервер?", a: "Нет — объединение происходит прямо в браузере, файлы остаются на вашем устройстве." },
        { q: "Это бесплатно?", a: "Да, полностью бесплатно и без водяных знаков." },
      ],
    },
    uz: {
      title: "PDF fayllarni birlashtirish — bepul onlayn",
      h1: "PDF birlashtirish",
      desc: "Bir nechta PDF'ni bitta faylga bepul birlashtiring. Tartibini o'zgartiring va yuklab oling — ro'yxatsiz.",
      intro: "Bir nechta PDF yuklang, kerakli tartibda joylashtiring va bitta hujjatga birlashtiring. Hammasi brauzerda — fayllar hech qayerga yuklanmaydi.",
      keywords: ["pdf birlashtirish", "pdf fayllarni qo'shish", "pdf merge bepul", "pdf larni birlashtirish", "pdf ni bitta qilish"],
      steps: [["Fayllarni yuklang", "Bir nechta PDF tanlang."], ["Tartibga soling", "Sahifalarni kerakli tartibda joylashtiring."], ["Bitta PDF yuklang", "Birlashtirilgan hujjatni saqlang."]],
      faqs: [
        { q: "Nechta faylni birlashtirsam bo'ladi?", a: "Kerakligicha — soni cheklanmagan." },
        { q: "Fayllarim serverga yuklanadimi?", a: "Yo'q — birlashtirish brauzerda bo'ladi, fayllar qurilmangizda qoladi." },
        { q: "Bepulmi?", a: "Ha, to'liq bepul va suv belgisisiz." },
      ],
    },
  },
  {
    slug: "compress", enPath: "/pdf-tools/compress", emoji: "🗜️", grad: "linear-gradient(135deg,#059669,#34d399)",
    ru: {
      title: "Сжать PDF онлайн — уменьшить размер файла бесплатно",
      h1: "Сжать PDF",
      desc: "Уменьшите размер PDF онлайн без потери качества. Бесплатно, без регистрации, прямо в браузере.",
      intro: "Загрузите PDF — инструмент уменьшит его размер, сохранив читаемость. Удобно для отправки по почте и загрузки на сайты с лимитом размера.",
      keywords: ["сжать pdf", "уменьшить размер pdf", "сжатие pdf онлайн", "compress pdf бесплатно", "уменьшить pdf"],
      steps: [["Загрузите PDF", "Выберите файл для сжатия."], ["Сжатие", "Инструмент оптимизирует изображения и структуру."], ["Скачайте результат", "Сохраните PDF меньшего размера."]],
      faqs: [
        { q: "Потеряется ли качество?", a: "Инструмент подбирает баланс размера и качества, чтобы документ оставался читаемым." },
        { q: "Это безопасно?", a: "Да — сжатие идёт в браузере, файлы не загружаются на сервер." },
        { q: "Бесплатно?", a: "Да, полностью бесплатно." },
      ],
    },
    uz: {
      title: "PDF hajmini kichraytirish — bepul onlayn siqish",
      h1: "PDF siqish",
      desc: "PDF hajmini sifatni yo'qotmasdan kichraytiring. Bepul, ro'yxatsiz, brauzerda.",
      intro: "PDF yuklang — vosita uni o'qilishini saqlagan holda kichraytiradi. Pochta orqali yuborish va hajm cheklovi bor saytlarga yuklash uchun qulay.",
      keywords: ["pdf hajmini kichraytirish", "pdf siqish", "pdf kichraytirish onlayn", "compress pdf bepul", "pdf hajmini kamaytirish"],
      steps: [["PDF yuklang", "Siqiladigan faylni tanlang."], ["Siqish", "Vosita rasmlar va tuzilmani optimallashtiradi."], ["Natijani yuklang", "Kichikroq PDF'ni saqlang."]],
      faqs: [
        { q: "Sifat yo'qoladimi?", a: "Vosita hajm va sifat muvozanatini tanlaydi, hujjat o'qilaverishi uchun." },
        { q: "Xavfsizmi?", a: "Ha — siqish brauzerda bo'ladi, fayllar serverga yuklanmaydi." },
        { q: "Bepulmi?", a: "Ha, to'liq bepul." },
      ],
    },
  },
  {
    slug: "jpg-to-pdf", enPath: "/pdf-tools/jpg-to-pdf", emoji: "🖼️", grad: "linear-gradient(135deg,#7c3aed,#a78bfa)",
    ru: {
      title: "JPG в PDF онлайн — конвертировать фото в PDF бесплатно",
      h1: "JPG в PDF",
      desc: "Соберите фотографии и изображения JPG/PNG в один PDF онлайн бесплатно. Без регистрации и водяных знаков.",
      intro: "Загрузите изображения — расположите их по порядку и получите единый PDF. Удобно для документов, сканов и портфолио.",
      keywords: ["jpg в pdf", "фото в pdf", "изображение в pdf", "jpg to pdf онлайн", "картинки в pdf"],
      steps: [["Загрузите изображения", "Выберите файлы JPG или PNG."], ["Расположите", "Задайте порядок страниц."], ["Скачайте PDF", "Сохраните готовый документ."]],
      faqs: [
        { q: "Какие форматы поддерживаются?", a: "JPG, JPEG и PNG — их можно смешивать в одном PDF." },
        { q: "Загружаются ли файлы?", a: "Нет — всё собирается в браузере." },
        { q: "Бесплатно?", a: "Да, без ограничений и водяных знаков." },
      ],
    },
    uz: {
      title: "JPG'ni PDF'ga aylantirish — rasmlardan PDF bepul",
      h1: "JPG'ni PDF'ga aylantirish",
      desc: "JPG/PNG rasmlarni bitta PDF'ga bepul yig'ing. Ro'yxatsiz va suv belgisisiz.",
      intro: "Rasmlarni yuklang — tartibga soling va yagona PDF oling. Hujjatlar, skanlar va portfolio uchun qulay.",
      keywords: ["jpg pdf ga", "rasm pdf ga", "rasmni pdf ga aylantirish", "jpg to pdf onlayn", "rasmlardan pdf"],
      steps: [["Rasmlarni yuklang", "JPG yoki PNG fayllarni tanlang."], ["Tartibga soling", "Sahifalar tartibini belgilang."], ["PDF yuklang", "Tayyor hujjatni saqlang."]],
      faqs: [
        { q: "Qaysi formatlar qo'llanadi?", a: "JPG, JPEG va PNG — ularni bitta PDF'da aralashtirsa bo'ladi." },
        { q: "Fayllar yuklanadimi?", a: "Yo'q — hammasi brauzerda yig'iladi." },
        { q: "Bepulmi?", a: "Ha, cheklovsiz va suv belgisisiz." },
      ],
    },
  },
  {
    slug: "pdf-to-jpg", enPath: "/pdf-tools/pdf-to-jpg", emoji: "🏞️", grad: "linear-gradient(135deg,#ea580c,#fb923c)",
    ru: {
      title: "PDF в JPG онлайн — конвертировать страницы в изображения",
      h1: "PDF в JPG",
      desc: "Превратите страницы PDF в изображения JPG онлайн бесплатно. Скачайте каждую страницу как картинку — без регистрации.",
      intro: "Загрузите PDF — каждая страница превратится в изображение JPG в высоком качестве. Удобно для превью, соцсетей и вставки в документы.",
      keywords: ["pdf в jpg", "pdf в изображение", "конвертировать pdf в jpg", "pdf to jpg онлайн", "страницы pdf в картинки"],
      steps: [["Загрузите PDF", "Выберите документ."], ["Конвертация", "Каждая страница станет изображением."], ["Скачайте JPG", "Сохраните картинки."]],
      faqs: [
        { q: "В каком качестве изображения?", a: "Страницы рендерятся в высоком разрешении, пригодном для печати и экрана." },
        { q: "Можно скачать все страницы сразу?", a: "Да — доступно сохранение всех страниц." },
        { q: "Бесплатно?", a: "Да, полностью." },
      ],
    },
    uz: {
      title: "PDF'ni JPG'ga aylantirish — sahifalarni rasmga",
      h1: "PDF'ni JPG'ga aylantirish",
      desc: "PDF sahifalarini JPG rasmlarga bepul aylantiring. Har sahifani rasm qilib yuklab oling — ro'yxatsiz.",
      intro: "PDF yuklang — har bir sahifa yuqori sifatli JPG rasmga aylanadi. Preview, ijtimoiy tarmoqlar va hujjatlarga qo'yish uchun qulay.",
      keywords: ["pdf jpg ga", "pdf rasmga", "pdf ni jpg ga aylantirish", "pdf to jpg onlayn", "pdf sahifalarini rasmga"],
      steps: [["PDF yuklang", "Hujjatni tanlang."], ["Aylantirish", "Har sahifa rasmga aylanadi."], ["JPG yuklang", "Rasmlarni saqlang."]],
      faqs: [
        { q: "Rasm sifati qanday?", a: "Sahifalar bosma va ekran uchun yaroqli yuqori sifatda render qilinadi." },
        { q: "Barcha sahifani birdan yuklasa bo'ladimi?", a: "Ha — barcha sahifani saqlash mavjud." },
        { q: "Bepulmi?", a: "Ha, to'liq." },
      ],
    },
  },
  {
    slug: "background-remover", enPath: "/ai-tools/background-remover", emoji: "🪄", grad: "linear-gradient(135deg,#0ea5e9,#38bdf8)",
    ru: {
      title: "Удалить фон с фото онлайн — бесплатно, за секунды",
      h1: "Удалить фон с фото",
      desc: "Уберите фон с изображения одним кликом с помощью ИИ. Бесплатно, в полном разрешении, без регистрации.",
      intro: "Загрузите фото — ИИ автоматически удалит фон и оставит прозрачный PNG. Идеально для товаров, аватарок и дизайна.",
      keywords: ["удалить фон с фото", "убрать фон онлайн", "удалить фон с картинки", "стереть фон бесплатно", "прозрачный фон png"],
      steps: [["Загрузите фото", "Выберите изображение."], ["ИИ убирает фон", "Обработка занимает пару секунд."], ["Скачайте PNG", "Сохраните фото с прозрачным фоном."]],
      faqs: [
        { q: "Нужно ли выделять объект вручную?", a: "Нет — ИИ сам находит объект и отделяет его от фона." },
        { q: "Сохраняется ли качество?", a: "Да — результат выдаётся в исходном разрешении." },
        { q: "Это бесплатно?", a: "Да, без водяных знаков." },
      ],
    },
    uz: {
      title: "Rasmdan fonni o'chirish — bepul, bir necha soniyada",
      h1: "Rasm fonini o'chirish",
      desc: "AI yordamida rasm fonini bir klikda oling. Bepul, to'liq sifatda, ro'yxatsiz.",
      intro: "Rasm yuklang — AI fonni avtomatik o'chirib, shaffof PNG qoldiradi. Mahsulotlar, avatarlar va dizayn uchun ideal.",
      keywords: ["rasm fonini o'chirish", "fon o'chirish onlayn", "rasmdan fon olib tashlash", "fonni bepul o'chirish", "shaffof fon png"],
      steps: [["Rasm yuklang", "Rasmni tanlang."], ["AI fonni oladi", "Ishlov bir necha soniya oladi."], ["PNG yuklang", "Shaffof fonli rasmni saqlang."]],
      faqs: [
        { q: "Ob'ektni qo'lda belgilash kerakmi?", a: "Yo'q — AI ob'ektni o'zi topib, fondan ajratadi." },
        { q: "Sifat saqlanadimi?", a: "Ha — natija asl o'lchamda beriladi." },
        { q: "Bepulmi?", a: "Ha, suv belgisisiz." },
      ],
    },
  },
  {
    slug: "image-upscaler", enPath: "/ai-tools/image-upscaler", emoji: "🔍", grad: "linear-gradient(135deg,#8b5cf6,#c4b5fd)",
    ru: {
      title: "Улучшить качество фото онлайн — ИИ-апскейл бесплатно",
      h1: "Улучшить качество фото",
      desc: "Увеличьте разрешение и чёткость фото с помощью ИИ. Бесплатно, онлайн, без регистрации.",
      intro: "Загрузите изображение — ИИ увеличит его разрешение и уберёт размытие, сохранив детали. Удобно для старых или маленьких фото.",
      keywords: ["улучшить качество фото", "увеличить разрешение фото", "апскейл фото онлайн", "улучшить фото ии", "повысить качество изображения"],
      steps: [["Загрузите фото", "Выберите изображение."], ["ИИ улучшает", "Разрешение и чёткость повышаются."], ["Скачайте результат", "Сохраните улучшенное фото."]],
      faqs: [
        { q: "Насколько можно увеличить?", a: "Как правило, в 2–4 раза с восстановлением деталей." },
        { q: "Работает со старыми фото?", a: "Да — ИИ хорошо восстанавливает размытые и мелкие изображения." },
        { q: "Бесплатно?", a: "Да." },
      ],
    },
    uz: {
      title: "Rasm sifatini yaxshilash — AI upscale bepul onlayn",
      h1: "Rasm sifatini yaxshilash",
      desc: "AI yordamida rasm o'lchami va aniqligini oshiring. Bepul, onlayn, ro'yxatsiz.",
      intro: "Rasm yuklang — AI uning o'lchamini oshirib, xiralikni yo'qotadi va detallarni saqlaydi. Eski yoki kichik rasmlar uchun qulay.",
      keywords: ["rasm sifatini yaxshilash", "rasm o'lchamini oshirish", "rasm upscale onlayn", "rasmni ai bilan yaxshilash", "rasm aniqligini oshirish"],
      steps: [["Rasm yuklang", "Rasmni tanlang."], ["AI yaxshilaydi", "O'lcham va aniqlik oshadi."], ["Natijani yuklang", "Yaxshilangan rasmni saqlang."]],
      faqs: [
        { q: "Qancha kattalashtirsa bo'ladi?", a: "Odatda 2–4 barobar, detallarni tiklab." },
        { q: "Eski rasm bilan ishlaydimi?", a: "Ha — AI xira va kichik rasmlarni yaxshi tiklaydi." },
        { q: "Bepulmi?", a: "Ha." },
      ],
    },
  },
  {
    slug: "image-to-text", enPath: "/ai-tools/image-to-text", emoji: "✍️", grad: "linear-gradient(135deg,#0d9488,#5eead4)",
    ru: {
      title: "Текст с картинки онлайн — распознать текст (OCR) бесплатно",
      h1: "Извлечь текст из картинки",
      desc: "Распознайте и извлеките текст из фото или скана с помощью OCR. Более 100 языков, бесплатно, без регистрации.",
      intro: "Загрузите изображение — инструмент распознает текст и выдаст его в редактируемом виде. Поддерживает русский, узбекский, английский и ещё 100+ языков.",
      keywords: ["текст с картинки", "распознать текст с фото", "ocr онлайн", "извлечь текст из изображения", "фото в текст"],
      steps: [["Загрузите изображение", "Выберите фото или скан с текстом."], ["Распознавание", "OCR извлекает текст."], ["Скопируйте текст", "Отредактируйте или сохраните результат."]],
      faqs: [
        { q: "Какие языки поддерживаются?", a: "Более 100, включая русский, узбекский и английский." },
        { q: "Работает ли с рукописным текстом?", a: "Лучше всего распознаётся печатный текст; рукописный — с переменным успехом." },
        { q: "Бесплатно?", a: "Да, без ограничений." },
      ],
    },
    uz: {
      title: "Rasmdan matn olish — matnni tanish (OCR) bepul",
      h1: "Rasmdan matn olish",
      desc: "Foto yoki skandan matnni OCR bilan tanib oling. 100+ til, bepul, ro'yxatsiz.",
      intro: "Rasm yuklang — vosita matnni tanib, tahrirlanadigan ko'rinishda beradi. O'zbek, rus, ingliz va 100+ tilni qo'llaydi.",
      keywords: ["rasmdan matn olish", "fotodan matn", "ocr onlayn", "rasmdagi matnni olish", "rasmni matnga aylantirish"],
      steps: [["Rasm yuklang", "Matnli foto yoki skanni tanlang."], ["Tanish", "OCR matnni ajratadi."], ["Matnni nusxalang", "Natijani tahrirlang yoki saqlang."]],
      faqs: [
        { q: "Qaysi tillar qo'llanadi?", a: "100+ til, jumladan o'zbek, rus va ingliz." },
        { q: "Qo'lyozma bilan ishlaydimi?", a: "Bosma matn eng yaxshi tanaladi; qo'lyozma — turlicha." },
        { q: "Bepulmi?", a: "Ha, cheklovsiz." },
      ],
    },
  },
];

export const LOC_LANGS = ["ru", "uz"] as const;
export type LocLang = (typeof LOC_LANGS)[number];
export const getLocTool = (slug: string) => LOC_TOOLS.find((t) => t.slug === slug);
