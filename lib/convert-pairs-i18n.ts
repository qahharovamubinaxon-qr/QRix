/* RU + UZ localized copy for the /convert/<pair> pages. Yandex already sends
   most of our referred traffic and "png в jpg" / "png dan jpg" queries are
   huge with weak local competition, so each pair gets real, unique localized
   copy — composed from per-format facts so nothing is thin or templated. */

import { CONVERT_PAIRS, type ConvertPair } from "@/lib/convert-pairs";

type Lang = "ru" | "uz";

/* what each format IS (one substantive sentence per language) */
const FMT: Record<string, Record<Lang, string>> = {
  PNG: {
    ru: "PNG хранит каждый пиксель без потерь и поддерживает прозрачность, поэтому скриншоты и логотипы в нём весят много",
    uz: "PNG har bir pikselni yo'qotishsiz saqlaydi va shaffoflikni qo'llab-quvvatlaydi, shuning uchun skrinshot va logotiplar katta hajmda bo'ladi",
  },
  JPG: {
    ru: "JPG отбрасывает детали, которые глаз почти не замечает, и обычно уменьшает файл в разы, но не умеет хранить прозрачность",
    uz: "JPG ko'z sezmaydigan detallarni tashlab, faylni bir necha barobar kichraytiradi, lekin shaffoflikni saqlay olmaydi",
  },
  WebP: {
    ru: "WebP от Google сжимает лучше JPG и PNG при том же качестве и поддерживает прозрачность и анимацию",
    uz: "Google'ning WebP formati bir xil sifatda JPG va PNG'dan yaxshiroq siqadi hamda shaffoflik va animatsiyani qo'llaydi",
  },
  AVIF: {
    ru: "AVIF — самый современный формат: он сжимает ещё сильнее WebP и держит HDR, но чуть медленнее кодируется",
    uz: "AVIF — eng zamonaviy format: u WebP'dan ham kuchliroq siqadi va HDR'ni saqlaydi, lekin biroz sekinroq kodlanadi",
  },
  BMP: {
    ru: "BMP хранит изображение вообще без сжатия, поэтому файлы огромные, зато формат читается любой старой программой",
    uz: "BMP tasvirni umuman siqmasdan saqlaydi, shuning uchun fayllar juda katta, ammo har qanday eski dastur uni o'qiy oladi",
  },
  ICO: {
    ru: "ICO — формат иконок Windows: он хранит квадратное изображение в нескольких размерах для ярлыков и фавиконов",
    uz: "ICO — Windows ikonka formati: u yorliq va favikonlar uchun kvadrat tasvirni bir necha o'lchamda saqlaydi",
  },
  GIF: {
    ru: "GIF ограничен 256 цветами и хранит анимацию, но для обычных фото и графики он устарел",
    uz: "GIF 256 rang bilan cheklangan va animatsiyani saqlaydi, ammo oddiy foto va grafika uchun eskirgan",
  },
};

/* the specific trade-off note for a conversion (keyed by "FROM>TO") */
const NOTE: Record<string, Record<Lang, string>> = {
  "PNG>JPG": { ru: "Прозрачные участки заливаются белым фоном, а ползунок качества задаёт баланс размера и детализации.", uz: "Shaffof joylar oq fon bilan to'ldiriladi, sifat slayderi esa hajm va detalizatsiya muvozanatini belgilaydi." },
  "JPG>PNG": { ru: "PNG не вернёт потерянные при JPG детали, но даст чёткие края без «мыла» и место для прозрачности.", uz: "PNG JPG'da yo'qolgan detallarni qaytармaydi, ammo aniq chekkalar va shaffoflik uchun joy beradi." },
  "PNG>WebP": { ru: "WebP сохраняет прозрачность PNG, но весит заметно меньше — идеально для сайтов и Core Web Vitals.", uz: "WebP PNG'ning shaffofligini saqlaydi, lekin ancha kam joy egallaydi — saytlar va Core Web Vitals uchun ideal." },
  "WebP>PNG": { ru: "Пригодится, когда программа или заказчик не открывает WebP — получите обычный PNG с прозрачностью.", uz: "Dastur yoki mijoz WebP'ni ochmasa qo'l keladi — shaffoflikli oddiy PNG olasiz." },
  "JPG>WebP": { ru: "При том же виде WebP обычно на 25–35% легче JPG — быстрее грузится страница.", uz: "Bir xil ko'rinishda WebP odatda JPG'dan 25–35% yengilroq — sahifa tezroq yuklanadi." },
  "WebP>JPG": { ru: "Максимальная совместимость: JPG откроет любой редактор, мессенджер и старый телефон.", uz: "Maksimal moslik: JPG'ni har qanday tahrirlagich, messenjer va eski telefon ochadi." },
  "PNG>AVIF": { ru: "AVIF даёт самый маленький файл с сохранением прозрачности — лучший вариант для скорости сайта.", uz: "AVIF shaffoflikni saqlagan holda eng kichik faylni beradi — sayt tezligi uchun eng yaxshi tanlov." },
  "AVIF>PNG": { ru: "Разворачивает AVIF в универсальный PNG для программ, которые новый формат ещё не понимают.", uz: "AVIF'ni yangi formatni tushunmaydigan dasturlar uchun universal PNG'ga ochadi." },
  "JPG>AVIF": { ru: "Тот же снимок в AVIF занимает в разы меньше места при равном качестве.", uz: "Xuddi shu surat AVIF'da bir xil sifatda bir necha barobar kam joy egallaydi." },
  "AVIF>JPG": { ru: "Возвращает AVIF в привычный JPG для полной совместимости с любыми сервисами.", uz: "AVIF'ni har qanday xizmat bilan to'liq moslik uchun oddiy JPG'ga qaytaradi." },
  "WebP>AVIF": { ru: "Шаг к ещё меньшему размеру: AVIF сжимает плотнее WebP, сохраняя прозрачность.", uz: "Yanada kichik hajm sari qadam: AVIF WebP'dan zichroq siqadi va shaffoflikni saqlaydi." },
  "AVIF>WebP": { ru: "WebP поддерживается шире AVIF, поэтому это безопасный формат «на сегодня».", uz: "WebP AVIF'dan kengroq qo'llanadi, shuning uchun bu «bugungi kun» uchun xavfsiz format." },
  "BMP>PNG": { ru: "Сжимает громоздкий BMP в компактный PNG без потери качества.", uz: "Og'ir BMP'ni sifatni yo'qotmasdan ixcham PNG'ga siqadi." },
  "BMP>JPG": { ru: "Огромный несжатый BMP превращается в лёгкий JPG для почты и загрузок.", uz: "Katta siqilmagan BMP pochta va yuklashlar uchun yengil JPG'ga aylanadi." },
  "PNG>BMP": { ru: "Нужен для старых программ и оборудования, которым подавай несжатый BMP.", uz: "Siqilmagan BMP talab qiladigan eski dastur va uskunalar uchun kerak." },
  "JPG>BMP": { ru: "Разворачивает JPG в несжатый BMP для ПО, не понимающего сжатие.", uz: "JPG'ni siqishni tushunmaydigan dastur uchun siqilmagan BMP'ga ochadi." },
  "GIF>PNG": { ru: "Берёт кадр GIF и сохраняет как чёткий PNG без ограничения в 256 цветов.", uz: "GIF kadrini oladi va 256 rang cheklovisiz aniq PNG qilib saqlaydi." },
  "GIF>JPG": { ru: "Превращает кадр GIF в компактный JPG для вставки в документы и посты.", uz: "GIF kadrini hujjat va postlarga qo'yish uchun ixcham JPG'ga aylantiradi." },
  "PNG>ICO": { ru: "Делает из PNG иконку .ico для ярлыков Windows и фавиконки сайта.", uz: "PNG'dan Windows yorliqlari va sayt favikonkasi uchun .ico ikonka yasaydi." },
  "JPG>ICO": { ru: "Превращает JPG в квадратную иконку .ico для приложения или сайта.", uz: "JPG'ni ilova yoki sayt uchun kvadrat .ico ikonkaga aylantiradi." },
};

const T = {
  ru: { conv: "Конвертер", how: "Как конвертировать", faq: "Вопросы и ответы", other: "Другие конвертеры", en: "English version", free: "Бесплатно · в браузере · без загрузки на сервер", to: "в" },
  uz: { conv: "Konverter", how: "Qanday aylantirish", faq: "Savol-javob", other: "Boshqa konverterlar", en: "English version", free: "Bepul · brauzerda · serverga yuklamasdan", to: "→" },
} as const;
export const convUI = (l: Lang) => T[l];

export type LocConvert = {
  title: string; h1: string; desc: string; intro: string; about: string;
  keywords: string[]; steps: [string, string][]; faqs: { q: string; a: string }[];
};

export function locConvert(p: ConvertPair, lang: Lang): LocConvert {
  const F = p.from, To = p.to;
  const note = NOTE[`${F}>${To}`]?.[lang] || "";
  const fromB = FMT[F]?.[lang] || F;
  const toB = FMT[To]?.[lang] || To;
  if (lang === "ru") {
    return {
      title: `${F} в ${To} — конвертер онлайн бесплатно, без загрузки`,
      h1: `Конвертировать ${F} в ${To}`,
      desc: `Конвертируйте ${F} в ${To} онлайн бесплатно. Всё происходит прямо в браузере — файлы не загружаются на сервер, без водяных знаков и регистрации.`,
      intro: `Быстро превратите ${F} в ${To} прямо в браузере — без установки программ и загрузки на чужой сервер.`,
      about: `${fromB}. ${toB}. ${note} Конвертация выполняется на вашем устройстве: изображение никуда не отправляется, поэтому это безопасно даже для личных и рабочих файлов. Поддерживается пакетная обработка — перетащите несколько ${F}-файлов и получите ${To} одним нажатием.`,
      keywords: [`${F.toLowerCase()} в ${To.toLowerCase()}`, `конвертировать ${F.toLowerCase()} в ${To.toLowerCase()}`, `${F.toLowerCase()} ${To.toLowerCase()} онлайн`, `перевести ${F.toLowerCase()} в ${To.toLowerCase()}`, `${F.toLowerCase()} to ${To.toLowerCase()}`],
      steps: [
        [`Загрузите ${F}`, `Перетащите или выберите один или несколько ${F}-файлов.`],
        ["Конвертация", `Инструмент кодирует изображение в ${To} прямо в браузере.`],
        [`Скачайте ${To}`, `Сохраните готовый файл — качество и размер под контролем.`],
      ],
      faqs: [
        { q: `Как конвертировать ${F} в ${To}?`, a: `Загрузите ${F}-файл выше, дождитесь обработки и скачайте ${To}. Всё происходит в браузере, ничего устанавливать не нужно.` },
        { q: "Загружаются ли мои файлы на сервер?", a: "Нет — конвертация идёт на вашем устройстве, изображение не покидает браузер." },
        { q: "Это бесплатно?", a: "Да, полностью бесплатно, без водяных знаков и лимитов." },
        { q: "Можно конвертировать несколько файлов сразу?", a: `Да — перетащите сразу несколько ${F}-файлов, и все они станут ${To}.` },
      ],
    };
  }
  return {
    title: `${F}'ni ${To}'ga aylantirish — bepul onlayn konverter`,
    h1: `${F}'ni ${To}'ga aylantirish`,
    desc: `${F}'ni ${To}'ga bepul onlayn aylantiring. Hammasi brauzerda bo'ladi — fayllar serverga yuklanmaydi, suv belgisi va ro'yxatsiz.`,
    intro: `${F}'ni to'g'ridan-to'g'ri brauzerda ${To}'ga aylantiring — dastur o'rnatmasdan, begona serverga yuklamasdan.`,
    about: `${fromB}. ${toB}. ${note} Aylantirish qurilmangizda bajariladi: rasm hech qayerga yuborilmaydi, shuning uchun shaxsiy va ish fayllari uchun ham xavfsiz. To'plamli ishlov qo'llanadi — bir nechta ${F} faylni tashlang va bitta bosishda ${To} oling.`,
    keywords: [`${F.toLowerCase()} dan ${To.toLowerCase()}`, `${F.toLowerCase()} ni ${To.toLowerCase()} ga aylantirish`, `${F.toLowerCase()} ${To.toLowerCase()} onlayn`, `${F.toLowerCase()} to ${To.toLowerCase()}`, `rasmni ${To.toLowerCase()} ga aylantirish`],
    steps: [
      [`${F} yuklang`, `Bir yoki bir nechta ${F} faylni tashlang yoki tanlang.`],
      ["Aylantirish", `Vosita rasmni brauzerda ${To} formatiga kodlaydi.`],
      [`${To} yuklab oling`, `Tayyor faylni saqlang — sifat va hajm nazorat ostida.`],
    ],
    faqs: [
      { q: `${F}'ni ${To}'ga qanday aylantiraman?`, a: `Yuqoriga ${F} faylni yuklang, ishlov tugashini kuting va ${To}'ni yuklab oling. Hammasi brauzerda, hech narsa o'rnatish shart emas.` },
      { q: "Fayllarim serverga yuklanadimi?", a: "Yo'q — aylantirish qurilmangizda bo'ladi, rasm brauzerdan chiqmaydi." },
      { q: "Bepulmi?", a: "Ha, to'liq bepul, suv belgisi va cheklovsiz." },
      { q: "Bir nechta faylni birdan aylantirsam bo'ladimi?", a: `Ha — bir nechta ${F} faylni tashlang, hammasi ${To} bo'ladi.` },
    ],
  };
}

/** Only pairs whose formats we have localized facts for (all 20 qualify). */
export const LOC_CONVERT_PAIRS = CONVERT_PAIRS.filter((p) => FMT[p.from] && FMT[p.to]);
