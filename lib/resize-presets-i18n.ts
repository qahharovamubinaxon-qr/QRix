/* RU + UZ localized copy for the /resize/<preset> pages.
   Size-intent queries ("размер фото на паспорт", "rasm o'lchamini o'zgartirish",
   "10x15 сколько пикселей") are high-volume in ru/uz with weak local
   competition. Every preset gets its own written facts + caveat + two of its
   own FAQs, so no page is a template of another — thin twins don't rank. */

import { RESIZE_PRESETS, type ResizePreset } from "@/lib/resize-presets";

type Lang = "ru" | "uz";
type Copy = { label: string; what: string; tip: string; faqs: [string, string][] };

/* per-size written copy, keyed by slug */
const C: Record<string, Record<Lang, Copy>> = {
  "1920x1080": {
    ru: {
      label: "Full HD",
      what: "1920×1080 — самое распространённое разрешение экрана в мире, поэтому именно его ждут обои рабочего стола, фоны презентаций, заставки видео и цифровые вывески. Это кадр 16:9, а телефон снимает в 4:3 или 3:2 — значит часть кадра придётся либо обрезать, либо дополнить фоном.",
      tip: "Увеличивать маленькую картинку до 1080p можно, но детализации это не добавит: лучше начинать с оригинала шириной хотя бы 1280 пикселей.",
      faqs: [
        ["Почему фото обрезается при 1920x1080?", "1920×1080 — это 16:9, а снимки с телефона обычно выше по пропорциям. В режиме «заполнить» верх и низ подрезаются, чтобы закрыть всю рамку. Переключитесь на «вписать», если нельзя терять ни одной детали."],
        ["1920x1080 и 1080p — это одно и то же?", "Да. 1080p означает 1080 строк по вертикали в кадре 16:9, то есть ровно 1920×1080 пикселей."],
      ],
    },
    uz: {
      label: "Full HD",
      what: "1920×1080 — dunyodagi eng keng tarqalgan ekran o'lchami, shuning uchun ish stoli fonlari, taqdimot slaydlari, video fonlari va raqamli tablolar aynan shu o'lchamni kutadi. Bu 16:9 kadr, telefon esa 4:3 yoki 3:2 da suratga oladi — demak kadrning bir qismini kesish yoki fon bilan to'ldirish kerak bo'ladi.",
      tip: "Kichik rasmni 1080p gacha kattalashtirish mumkin, lekin bu detalizatsiya qo'shmaydi: kamida 1280 piksel kenglikdagi originaldan boshlagan ma'qul.",
      faqs: [
        ["Nega rasm 1920x1080 da kesiladi?", "1920×1080 — bu 16:9, telefon suratlari esa odatda balandroq nisbatda. «To'ldirish» rejimida yuqori va past qismi kadrni qoplash uchun kesiladi. Hech narsani yo'qotmaslik kerak bo'lsa, «sig'dirish»ga o'ting."],
        ["1920x1080 va 1080p bir xilmi?", "Ha. 1080p 16:9 kadrda 1080 ta vertikal chiziqni bildiradi, ya'ni aynan 1920×1080 piksel."],
      ],
    },
  },
  "1280x720": {
    ru: {
      label: "HD 720p",
      what: "1280×720 — минимальное разрешение, которое ещё считается высокой чёткостью, и стандартный размер для превью видео и обложек онлайн-курсов: на телефоне выглядит резко, а весит мало и грузится мгновенно. Это те же 16:9, что и 1080p, только вдвое меньше по количеству пикселей, поэтому экспорт 1920×1080 уменьшается сюда идеально, без обрезки.",
      tip: "Для большинства современных камер 720p — это уменьшение, а уменьшение почти всегда выглядит чётче, чем растягивание вверх.",
      faqs: [
        ["1280x720 достаточно для превью видео?", "Да — это минимальный рекомендованный размер на большинстве видеоплатформ, и в типичном размере превью он выглядит резко. Берите 1920×1080, если нужен запас на будущую обрезку."],
        ["Потеряется ли качество при уменьшении с 1920x1080?", "Практически нет. Обе стороны — 16:9, поэтому это чистое пропорциональное уменьшение без обрезки."],
      ],
    },
    uz: {
      label: "HD 720p",
      what: "1280×720 — hali ham yuqori aniqlik hisoblanadigan eng kichik o'lcham va video preview hamda onlayn kurs muqovalari uchun standart: telefonda aniq ko'rinadi, hajmi kichik va bir zumda yuklanadi. Bu 1080p bilan bir xil 16:9, faqat piksel soni ikki barobar kam, shuning uchun 1920×1080 eksport bu yerga kesishsiz mukammal kichrayadi.",
      tip: "Ko'pchilik zamonaviy kameralar uchun 720p — kichraytirish, kichraytirish esa deyarli har doim kattalashtirishdan aniqroq ko'rinadi.",
      faqs: [
        ["1280x720 video preview uchun yetarlimi?", "Ha — ko'pchilik video platformalarda tavsiya etilgan minimal o'lcham va odatiy preview o'lchamida aniq ko'rinadi. Kelajakda kesish uchun zaxira kerak bo'lsa, 1920×1080 ni oling."],
        ["1920x1080 dan kichraytirganda sifat yo'qoladimi?", "Deyarli yo'q. Ikkalasi ham 16:9, shuning uchun bu kesishsiz toza proporsional kichraytirish."],
      ],
    },
  },
  "3840x2160": {
    ru: {
      label: "4K UHD",
      what: "3840×2160 — это 4K UHD: четыре кадра 1080p в одном и родное разрешение большинства современных телевизоров и всё большей доли мониторов. Такой размер берут, когда обои должны остаться резкими на экране с высокой плотностью пикселей, когда работу покажут на большой панели или когда нужен запас для последующей обрезки.",
      tip: "Честная оговорка — исходник: увеличение картинки шириной 1200 пикселей до 3840 даёт файл 4K, но не детализацию 4K.",
      faqs: [
        ["Можно ли сделать из маленького фото настоящее 4K?", "Файл 3840×2160 получится, но увеличение не создаёт деталей, которых не было в кадре. Для реальной резкости начинайте с оригинала высокого разрешения или сначала прогоните снимок через ИИ-апскейлер."],
        ["3840x2160 — это то же самое, что 4K?", "Это 4K UHD, потребительский стандарт для телевизоров и мониторов. Кинематографический 4K чуть шире — 4096×2160, поэтому уточните, какой именно нужен."],
      ],
    },
    uz: {
      label: "4K UHD",
      what: "3840×2160 — bu 4K UHD: bitta kadrda to'rtta 1080p va ko'pchilik zamonaviy televizorlar hamda tobora ko'proq monitorlarning tabiiy o'lchami. Bu o'lcham fon rasmi yuqori piksel zichligidagi ekranda aniq qolishi kerak bo'lganda, ish katta panelda ko'rsatilganda yoki keyinchalik kesish uchun zaxira kerak bo'lganda tanlanadi.",
      tip: "Halol ogohlantirish — manba: 1200 piksellik rasmni 3840 gacha kattalashtirish 4K fayl beradi, lekin 4K detalizatsiyani emas.",
      faqs: [
        ["Kichik rasmdan haqiqiy 4K qilish mumkinmi?", "3840×2160 fayl chiqadi, lekin kattalashtirish kadrda bo'lmagan detallarni yarata olmaydi. Haqiqiy aniqlik uchun yuqori o'lchamli originaldan boshlang yoki avval AI upscaler'dan o'tkazing."],
        ["3840x2160 — bu 4K bilan bir xilmi?", "Bu 4K UHD, televizor va monitorlar uchun iste'mol standarti. Kinematografik 4K biroz kengroq — 4096×2160, shuning uchun qaysi biri kerakligini aniqlang."],
      ],
    },
  },
  "2560x1440": {
    ru: {
      label: "QHD 1440p",
      what: "2560×1440 — разрешение QHD, золотая середина между 1080p и 4K: заметно резче Full HD на 27-дюймовом мониторе, но файлы весят в разы меньше, чем 4K. Это стандарт для игровых мониторов, обоев на ноутбуках с плотным экраном и исходников для стримов.",
      tip: "Кадр остаётся 16:9, поэтому уменьшение с 4K или увеличение с 1080p проходит без обрезки — меняется только количество пикселей.",
      faqs: [
        ["1440p сильно лучше 1080p?", "На мониторе 27 дюймов и больше разница видна отчётливо: текст и мелкие детали заметно чище. На экране 24 дюйма и меньше выигрыш скромнее."],
        ["Подойдёт ли 2560x1440 как обои для 4K-монитора?", "Изображение растянется до 3840×2160 средствами системы и станет чуть мягче. Для идеальной резкости лучше сразу подготовить файл 4K."],
      ],
    },
    uz: {
      label: "QHD 1440p",
      what: "2560×1440 — QHD o'lchami, 1080p va 4K orasidagi oltin o'rtalik: 27 dyuymli monitorda Full HD dan sezilarli aniqroq, ammo fayllar 4K dan bir necha barobar yengil. Bu o'yin monitorlari, zich ekranli noutbuk fonlari va strim manbalari uchun standart.",
      tip: "Kadr 16:9 bo'lib qoladi, shuning uchun 4K dan kichraytirish yoki 1080p dan kattalashtirish kesishsiz o'tadi — faqat piksel soni o'zgaradi.",
      faqs: [
        ["1440p 1080p dan ancha yaxshimi?", "27 dyuym va undan katta monitorda farq aniq ko'rinadi: matn va mayda detallar sezilarli toza. 24 dyuym va undan kichik ekranda yutuq kamtarona."],
        ["2560x1440 4K monitor uchun fon sifatida to'g'ri keladimi?", "Tasvir tizim tomonidan 3840×2160 gacha cho'ziladi va biroz yumshoq bo'ladi. Ideal aniqlik uchun darhol 4K fayl tayyorlagan ma'qul."],
      ],
    },
  },
  "1080x1080": {
    ru: {
      label: "квадрат для соцсетей",
      what: "1080×1080 — квадрат, на котором держится лента: посты в Instagram, карточки товаров, обложки альбомов и квадратные рекламные креативы. Тысяча восемьдесят пикселей — это ровно та ширина, которую большинство приложений считает «полным качеством» и не пережимает дополнительно.",
      tip: "Любой неквадратный снимок придётся либо обрезать до квадрата, либо положить на цветной фон — третьего варианта у формата нет.",
      faqs: [
        ["Почему именно 1080x1080, а не 1000x1000?", "Ленты соцсетей рассчитаны на ширину 1080 пикселей: файл меньше будет растянут и станет мягче, файл больше просто уменьшится при загрузке."],
        ["Как не обрезать важное при переходе в квадрат?", "Выберите режим «вписать» и подберите цвет фона под ленту или бренд — изображение останется целиком, а рамка добьётся квадрата."],
      ],
    },
    uz: {
      label: "ijtimoiy tarmoq kvadrati",
      what: "1080×1080 — lenta tayanadigan kvadrat: Instagram postlari, mahsulot kartochkalari, albom muqovalari va kvadrat reklama kreativlari. Ming sakson piksel — ko'pchilik ilovalar «to'liq sifat» deb hisoblaydigan va qo'shimcha siqmaydigan aynan shu kenglik.",
      tip: "Kvadrat bo'lmagan har qanday suratni yo kvadratgacha kesish, yo rangli fonga qo'yish kerak — formatda uchinchi variant yo'q.",
      faqs: [
        ["Nega 1000x1000 emas, aynan 1080x1080?", "Ijtimoiy tarmoq lentalari 1080 piksel kenglikka mo'ljallangan: kichikroq fayl cho'zilib yumshoq bo'ladi, kattarog'i esa yuklashda kichrayadi."],
        ["Kvadratga o'tishda muhim qismni qanday saqlash mumkin?", "«Sig'dirish» rejimini tanlang va fon rangini lenta yoki brendga moslang — rasm to'liq qoladi, ramka esa kvadratni to'ldiradi."],
      ],
    },
  },
  "1200x630": {
    ru: {
      label: "превью ссылки, OG-картинка",
      what: "1200×630 — размер картинки, которую подставляют Open Graph и Twitter Card: именно её видят люди, когда ваша ссылка появляется в Facebook, LinkedIn, Telegram или в мессенджере. Пропорция примерно 1.91:1, и социальные сети обрезают всё, что в неё не влезло, поэтому логотип и заголовок нужно держать ближе к центру.",
      tip: "Проверьте результат в отладчике ссылок соцсети — кэш превью живёт долго, и старая картинка может показываться ещё несколько дней.",
      faqs: [
        ["Какой размер OG-изображения правильный?", "1200×630 — рекомендация Facebook и Open Graph, её же корректно принимают LinkedIn, Telegram и большинство мессенджеров. Twitter/X показывает такую картинку как крупную карточку."],
        ["Почему мою картинку обрезали в превью?", "Разные площадки кадрируют по-своему. Держите текст и логотип в центральной зоне — тогда любая обрезка их не заденет."],
      ],
    },
    uz: {
      label: "havola preview, OG rasm",
      what: "1200×630 — Open Graph va Twitter Card qo'yadigan rasm o'lchami: havolangiz Facebook, LinkedIn, Telegram yoki messenjerda paydo bo'lganda odamlar aynan shuni ko'radi. Nisbat taxminan 1.91:1, ijtimoiy tarmoqlar esa sig'magan hamma narsani kesadi, shuning uchun logotip va sarlavhani markazga yaqin saqlash kerak.",
      tip: "Natijani ijtimoiy tarmoq havola debagerida tekshiring — preview keshi uzoq yashaydi va eski rasm yana bir necha kun ko'rinishi mumkin.",
      faqs: [
        ["OG rasm uchun to'g'ri o'lcham qaysi?", "1200×630 — Facebook va Open Graph tavsiyasi, uni LinkedIn, Telegram va ko'pchilik messenjerlar ham to'g'ri qabul qiladi. Twitter/X buni katta kartochka sifatida ko'rsatadi."],
        ["Nega rasmim preview'da kesildi?", "Har bir platforma o'zicha kadrlaydi. Matn va logotipni markaziy zonada saqlang — u holda hech qanday kesish ularga tegmaydi."],
      ],
    },
  },
  "800x600": {
    ru: {
      label: "SVGA 4:3",
      what: "800×600 — классический SVGA: пропорция 4:3, которую до сих пор требуют старые проекторы, панели управления оборудованием, форумы с лимитом на вложения и внутренние системы, где картинку нельзя загружать тяжелее пары сотен килобайт. Размер небольшой, поэтому файл получается лёгким даже при высоком качестве.",
      tip: "Современный снимок 16:9 в 4:3 не влезает: «заполнить» подрежет края по бокам, «вписать» добавит поля сверху и снизу.",
      faqs: [
        ["Зачем сегодня нужен размер 800x600?", "Его до сих пор просят старые проекторы и киоски, встроенные веб-интерфейсы устройств и площадки со строгим лимитом на вес вложения."],
        ["800x600 — это какая пропорция?", "4:3. Это более «квадратный» кадр, чем нынешний 16:9, поэтому широкие снимки в него не помещаются целиком."],
      ],
    },
    uz: {
      label: "SVGA 4:3",
      what: "800×600 — klassik SVGA: 4:3 nisbat, uni hozirgacha eski proyektorlar, uskuna boshqaruv panellari, biriktirma hajmi cheklangan forumlar va rasmni bir necha yuz kilobayt ichida saqlashni talab qiladigan ichki tizimlar so'raydi. O'lcham kichik, shuning uchun fayl yuqori sifatda ham yengil chiqadi.",
      tip: "Zamonaviy 16:9 surat 4:3 ga sig'maydi: «to'ldirish» yon chekkalarni kesadi, «sig'dirish» esa yuqori va pastga maydon qo'shadi.",
      faqs: [
        ["Bugun 800x600 nima uchun kerak?", "Uni hanuz eski proyektor va kiosklar, qurilmalarning ichki veb-interfeyslari va biriktirma hajmiga qat'iy cheklov qo'ygan saytlar so'raydi."],
        ["800x600 qanday nisbat?", "4:3. Bu hozirgi 16:9 dan ko'ra «kvadratroq» kadr, shuning uchun keng suratlar unga to'liq sig'maydi."],
      ],
    },
  },
  "1024x768": {
    ru: {
      label: "XGA 4:3",
      what: "1024×768 — разрешение XGA, десятилетиями бывшее стандартом офисных проекторов и мониторов, и до сих пор родное для многих конференц-залов, электронных досок и старых планшетов. Это то же 4:3, что и 800×600, но с полуторакратным запасом по пикселям — текст на слайде читается заметно лучше.",
      tip: "Если слайд готовится для проектора неизвестной модели, 1024×768 — самый безопасный выбор: его понимает практически любое оборудование.",
      faqs: [
        ["1024x768 подходит для презентации?", "Да, если проектор или экран работает в 4:3. Для современных широкоформатных экранов берите 1920×1080 — иначе по бокам останутся чёрные поля."],
        ["Чем 1024x768 лучше 800x600?", "Пропорции те же, но пикселей на 64% больше: мелкий текст и схемы остаются читаемыми, а вес файла всё ещё небольшой."],
      ],
    },
    uz: {
      label: "XGA 4:3",
      what: "1024×768 — XGA o'lchami, o'nyilliklar davomida ofis proyektorlari va monitorlari standarti bo'lgan hamda hanuzgacha ko'plab konferens-zallar, elektron doskalar va eski planshetlar uchun tabiiy. Bu 800×600 bilan bir xil 4:3, ammo piksel zaxirasi bir yarim barobar ko'p — slayddagi matn sezilarli yaxshi o'qiladi.",
      tip: "Slayd noma'lum modeldagi proyektor uchun tayyorlanayotgan bo'lsa, 1024×768 — eng xavfsiz tanlov: uni deyarli har qanday uskuna tushunadi.",
      faqs: [
        ["1024x768 taqdimot uchun to'g'ri keladimi?", "Ha, agar proyektor yoki ekran 4:3 da ishlasa. Zamonaviy keng ekranlar uchun 1920×1080 ni oling — aks holda yon tomonlarda qora maydonlar qoladi."],
        ["1024x768 800x600 dan nimasi bilan yaxshi?", "Nisbat bir xil, ammo piksel 64% ko'p: mayda matn va sxemalar o'qiladigan qoladi, fayl hajmi esa hamon kichik."],
      ],
    },
  },
  "600x600": {
    ru: {
      label: "фото на паспорт США, 2×2 дюйма",
      what: "600×600 — квадрат 2×2 дюйма при 300 DPI, размер, который Госдепартамент США требует для загрузки фото на паспорт и грин-карту. Инструмент задаёт именно эти пиксельные размеры: он не проверяет положение головы, фон и выражение лица — за это отвечают отдельные требования ведомства.",
      tip: "Проверьте требования по композиции отдельно: высота головы, отступ до макушки, ровный светлый фон и отсутствие теней — при их нарушении заявку отклонят даже с идеальным размером.",
      faqs: [
        ["Этот инструмент делает фото, готовое для паспорта?", "Он приводит снимок к точному размеру 600×600 пикселей. Требования к позе, фону, освещению и выражению лица нужно соблюсти самостоятельно — размер лишь одно из условий."],
        ["Почему именно 600x600?", "Это 2×2 дюйма при 300 DPI — стандарт фотографии на документы в США. Загрузка допускает и больший квадрат, но 600×600 проходит гарантированно."],
      ],
    },
    uz: {
      label: "AQSh pasport fotosi, 2×2 dyuym",
      what: "600×600 — 300 DPI da 2×2 dyuymlik kvadrat, AQSh Davlat departamenti pasport va yashil karta uchun foto yuklashda talab qiladigan o'lcham. Vosita aynan shu piksel o'lchamini beradi: u bosh holati, fon va yuz ifodasini tekshirmaydi — bular idoraning alohida talablari.",
      tip: "Kompozitsiya talablarini alohida tekshiring: bosh balandligi, tepagacha bo'lgan masofa, tekis och fon va soyalarning yo'qligi — bular buzilsa, o'lcham ideal bo'lsa ham ariza rad etiladi.",
      faqs: [
        ["Bu vosita pasportga tayyor foto tayyorlaydimi?", "U suratni aniq 600×600 piksel o'lchamiga keltiradi. Poza, fon, yoritish va yuz ifodasi talablariga o'zingiz rioya qilishingiz kerak — o'lcham shartlardan biri xolos."],
        ["Nega aynan 600x600?", "Bu 300 DPI da 2×2 dyuym — AQShda hujjat fotosining standarti. Kattaroq kvadrat ham qabul qilinadi, ammo 600×600 kafolatli o'tadi."],
      ],
    },
  },
  "413x531": {
    ru: {
      label: "фото 35×45 мм",
      what: "413×531 — это 35×45 миллиметров при 300 DPI, стандартный размер фотографии на документы в большинстве стран Европы, СНГ и Азии: паспорт, виза, студенческий, водительское удостоверение. Пропорция вытянутая, ближе к портретной, поэтому кадрировать нужно вокруг лица, а не по краям снимка.",
      tip: "Инструмент задаёт только пиксельные размеры — требования к фону, освещению и положению головы у каждого ведомства свои, уточните их до подачи.",
      faqs: [
        ["35x45 мм — это сколько пикселей?", "413×531 при 300 DPI. При 600 DPI получится 827×1063, но большинство сервисов приёма документов рассчитаны на 300."],
        ["Можно ли этим сделать фото на визу?", "Размер получится верным, но визовые центры проверяют ещё фон, освещение, долю лица в кадре и выражение — сверьтесь с требованиями конкретной страны."],
      ],
    },
    uz: {
      label: "35×45 mm hujjat fotosi",
      what: "413×531 — bu 300 DPI da 35×45 millimetr, Yevropa, MDH va Osiyoning ko'p mamlakatlarida hujjat fotosining standart o'lchami: pasport, viza, talaba guvohnomasi, haydovchilik guvohnomasi. Nisbat cho'ziq, portretga yaqin, shuning uchun kadrlashni surat chekkalaridan emas, yuz atrofidan qilish kerak.",
      tip: "Vosita faqat piksel o'lchamini beradi — fon, yoritish va bosh holatiga qo'yiladigan talablar har bir idorada o'zicha, topshirishdan oldin aniqlang.",
      faqs: [
        ["35x45 mm necha piksel?", "300 DPI da 413×531. 600 DPI da — 827×1063, ammo hujjat qabul qiluvchi ko'pchilik xizmatlar 300 ga mo'ljallangan."],
        ["Bu bilan viza uchun foto qilsa bo'ladimi?", "O'lcham to'g'ri chiqadi, ammo viza markazlari fon, yoritish, yuzning kadrdagi ulushi va ifodani ham tekshiradi — aniq davlat talablari bilan solishtiring."],
      ],
    },
  },
  "400x400": {
    ru: {
      label: "аватар профиля",
      what: "400×400 — универсальный квадрат для аватара: столько пикселей достаточно, чтобы фото осталось резким в шапке профиля, и при этом файл лёгкий, а сервисы обычно не пережимают его повторно. Этот размер принимают LinkedIn, X, Telegram, Slack, Discord и большинство корпоративных систем.",
      tip: "Почти везде аватар обрезается в круг — держите лицо по центру и оставляйте немного воздуха по краям, иначе подбородок или макушка уйдут за границу.",
      faqs: [
        ["Какого размера должен быть аватар?", "Квадрат от 400×400 покрывает почти все площадки. Меньше — рискуете размытием на экранах с высокой плотностью пикселей, больше — сервис всё равно уменьшит при загрузке."],
        ["Почему у аватара обрезаются края?", "Большинство сайтов вписывает квадрат в круг, срезая углы. Композицию нужно строить так, чтобы важное оставалось внутри вписанной окружности."],
      ],
    },
    uz: {
      label: "profil rasmi",
      what: "400×400 — avatar uchun universal kvadrat: bu piksel soni fotoning profil sarlavhasida aniq qolishiga yetadi, fayl esa yengil va xizmatlar odatda uni qayta siqmaydi. Bu o'lchamni LinkedIn, X, Telegram, Slack, Discord va ko'pchilik korporativ tizimlar qabul qiladi.",
      tip: "Deyarli hamma joyda avatar doira shaklida kesiladi — yuzni markazda saqlang va chekkalarda biroz bo'sh joy qoldiring, aks holda iyak yoki tepa chegaradan chiqib ketadi.",
      faqs: [
        ["Avatar qanday o'lchamda bo'lishi kerak?", "400×400 dan boshlangan kvadrat deyarli barcha platformalarni qoplaydi. Kichikroq bo'lsa yuqori zichlikdagi ekranlarda xiralashish xavfi bor, kattaroq bo'lsa xizmat baribir yuklashda kichraytiradi."],
        ["Nega avatarning chekkalari kesiladi?", "Ko'pchilik saytlar kvadratni doiraga joylab, burchaklarni kesadi. Kompozitsiyani muhim qism ichki doira ichida qoladigan qilib quring."],
      ],
    },
  },
  "1200x1800": {
    ru: {
      label: "печать 4×6 дюймов, 10×15 см",
      what: "1200×1800 — это 4×6 дюймов (примерно 10×15 см) при 300 DPI, самый массовый формат печати фотографий в мире: именно его печатают фотокиоски, лаборатории и домашние принтеры по умолчанию. Пропорция 2:3 совпадает с кадром зеркальных и беззеркальных камер, поэтому такие снимки ложатся в формат без обрезки.",
      tip: "А вот телефонный кадр 4:3 в 2:3 не помещается — заранее решите, что обрезать, иначе за вас это сделает лаборатория.",
      faqs: [
        ["10x15 см — это сколько пикселей?", "1200×1800 при 300 DPI. Для печати это стандарт; при 200 DPI хватит и 800×1200, но отпечаток будет мягче."],
        ["Почему фото с телефона обрезается при печати 10x15?", "Телефон обычно снимает в 4:3, а формат 10×15 — это 2:3. Часть кадра по длинной стороне неизбежно уходит, если не выбрать режим «вписать» с полями."],
      ],
    },
    uz: {
      label: "4×6 dyuym bosma, 10×15 sm",
      what: "1200×1800 — bu 300 DPI da 4×6 dyuym (taxminan 10×15 sm), dunyodagi eng ommaviy foto bosma formati: fotokiosklar, laboratoriyalar va uy printerlari sukut bo'yicha aynan shuni chiqaradi. 2:3 nisbat oyna va oynasiz kameralar kadri bilan mos, shuning uchun bunday suratlar formatga kesishsiz tushadi.",
      tip: "Telefonning 4:3 kadri esa 2:3 ga sig'maydi — nimani kesishni oldindan hal qiling, aks holda buni laboratoriya o'zi qiladi.",
      faqs: [
        ["10x15 sm necha piksel?", "300 DPI da 1200×1800. Bosma uchun bu standart; 200 DPI da 800×1200 ham yetadi, ammo nashr yumshoqroq chiqadi."],
        ["Nega telefon surati 10x15 bosmada kesiladi?", "Telefon odatda 4:3 da suratga oladi, 10×15 format esa 2:3. Uzun tomondagi bir qism muqarrar ketadi, agar maydonli «sig'dirish» tanlanmasa."],
      ],
    },
  },
  "1500x2100": {
    ru: {
      label: "печать 5×7 дюймов, 13×18 см",
      what: "1500×2100 — 5×7 дюймов (около 13×18 см) при 300 DPI: формат для рамки на столе, приглашений, открыток и небольших постеров. Пропорция 5:7 чуть «квадратнее» стандартных 10×15, поэтому снимок, идеально лёгший в 4×6, здесь потребует другой обрезки.",
      tip: "Печатаете серию в разных форматах — кадрируйте каждый отдельно от оригинала, а не переиспользуйте один и тот же кроп.",
      faqs: [
        ["13x18 см — это сколько пикселей?", "1500×2100 при 300 DPI. Это же соотношение 5:7 используется для приглашений и открыток."],
        ["Подойдёт ли один и тот же кроп для 10x15 и 13x18?", "Нет — пропорции разные. Каждый формат печати требует своей обрезки исходника, иначе лаборатория срежет края по-своему."],
      ],
    },
    uz: {
      label: "5×7 dyuym bosma, 13×18 sm",
      what: "1500×2100 — 300 DPI da 5×7 dyuym (taxminan 13×18 sm): stol ramkasi, taklifnoma, otkritka va kichik posterlar uchun format. 5:7 nisbat standart 10×15 dan biroz «kvadratroq», shuning uchun 4×6 ga mukammal tushgan surat bu yerda boshqacha kesishni talab qiladi.",
      tip: "Turli formatlarda seriya chiqarayotgan bo'lsangiz — har birini originaldan alohida kadrlang, bitta kropni qayta ishlatmang.",
      faqs: [
        ["13x18 sm necha piksel?", "300 DPI da 1500×2100. Xuddi shu 5:7 nisbat taklifnoma va otkritkalarda ishlatiladi."],
        ["10x15 va 13x18 uchun bitta krop to'g'ri keladimi?", "Yo'q — nisbatlar har xil. Har bir bosma format originaldan o'z kesishini talab qiladi, aks holda laboratoriya chekkalarni o'zicha kesadi."],
      ],
    },
  },
  "2480x3508": {
    ru: {
      label: "A4 при 300 DPI",
      what: "2480×3508 — полная страница A4 (210×297 мм) при 300 DPI, то разрешение, которое просят типографии для резюме с фото, обложек отчётов, сертификатов и постеров формата листа. Все размеры серии A имеют пропорцию 1:√2, поэтому макет A4 масштабируется в A3 или A5 без единой обрезки.",
      tip: "Оставьте несколько миллиметров поля по краям: почти ни один принтер не печатает до самого края, и всё, что там окажется, обрежется.",
      faqs: [
        ["A4 — это сколько пикселей?", "2480×3508 при 300 DPI. При 150 DPI получится 1240×1754 — годится для черновика, но в печати заметно мягче."],
        ["Хватит ли фото с телефона на полный лист A4?", "Современный снимок 12 МП — это около 4000×3000 пикселей, чего достаточно по ширине, но пропорция другая, поэтому часть кадра уйдёт при обрезке."],
      ],
    },
    uz: {
      label: "A4, 300 DPI",
      what: "2480×3508 — 300 DPI da to'liq A4 sahifa (210×297 mm), bosmaxonalar fotoli rezyume, hisobot muqovasi, sertifikat va varaq formatidagi posterlar uchun so'raydigan o'lcham. A seriyasining barcha o'lchamlari 1:√2 nisbatga ega, shuning uchun A4 maketi A3 yoki A5 ga bitta ham kesishsiz masshtablanadi.",
      tip: "Chekkalarda bir necha millimetr maydon qoldiring: deyarli hech bir printer eng chetigacha bosmaydi va u yerdagi hamma narsa kesiladi.",
      faqs: [
        ["A4 necha piksel?", "300 DPI da 2480×3508. 150 DPI da 1240×1754 chiqadi — qoralama uchun yaraydi, ammo bosmada sezilarli yumshoq."],
        ["Telefon surati to'liq A4 varaq uchun yetadimi?", "Zamonaviy 12 MP kadr taxminan 4000×3000 piksel, bu kenglik bo'yicha yetarli, ammo nisbat boshqacha, shuning uchun kadrning bir qismi kesishda ketadi."],
      ],
    },
  },
  "500x500": {
    ru: {
      label: "небольшой квадрат",
      what: "500×500 — компактный квадрат для карточек товаров в каталоге, иконок в интерфейсе, логотипов в письмах и превью в списках. Он вдвое меньше 1080×1080 по стороне и вчетверо по площади, поэтому страница со ста такими картинками грузится заметно быстрее.",
      tip: "Для экранов с двойной плотностью 500 пикселей на карточку шириной 250 — ровно то, что нужно: резко, но без лишнего веса.",
      faqs: [
        ["Когда брать 500x500, а когда 1080x1080?", "500×500 — для сеток, каталогов и писем, где важна скорость. 1080×1080 — для лент соцсетей, где картинку смотрят во весь экран."],
        ["Не будет ли 500x500 мылить на телефоне?", "Нет, если в вёрстке картинка занимает до 250 пикселей ширины — тогда на экране с двойной плотностью она остаётся резкой."],
      ],
    },
    uz: {
      label: "kichik kvadrat",
      what: "500×500 — katalogdagi mahsulot kartochkalari, interfeys ikonkalari, xatlardagi logotiplar va ro'yxat preview'lari uchun ixcham kvadrat. U 1080×1080 dan tomoni bo'yicha ikki, maydoni bo'yicha to'rt barobar kichik, shuning uchun yuzta shunday rasmli sahifa sezilarli tez yuklanadi.",
      tip: "Ikki barobar zichlikdagi ekranlar uchun 250 piksel kenglikdagi kartochkaga 500 piksel — aynan kerakli o'lcham: aniq, ammo ortiqcha vaznsiz.",
      faqs: [
        ["Qachon 500x500, qachon 1080x1080 olish kerak?", "500×500 — tezlik muhim bo'lgan setka, katalog va xatlar uchun. 1080×1080 — rasm butun ekranda ko'riladigan ijtimoiy tarmoq lentalari uchun."],
        ["500x500 telefonda xiralashmaydimi?", "Yo'q, agar sahifada rasm 250 piksel kenglikkacha joy egallasa — u holda ikki barobar zichlikdagi ekranda ham aniq qoladi."],
      ],
    },
  },
  "200x200": {
    ru: {
      label: "миниатюра",
      what: "200×200 — размер миниатюры: аватар в комментариях, иконка в списке, превью в таблице, логотип в подвале письма. На таком поле детали не читаются, поэтому лучше работают простые формы, крупный знак и высокий контраст, а не уменьшенная сложная фотография.",
      tip: "Если картинку показывают в 100 пикселей на экране с двойной плотностью, 200×200 — ровно нужный размер: резко и почти невесомо.",
      faqs: [
        ["Не слишком ли мал размер 200x200?", "Для миниатюры — нет. Он специально маленький, чтобы страница со множеством иконок грузилась мгновенно. Для обложек и лент берите размер крупнее."],
        ["Что лучше поместить в миниатюру?", "Один крупный объект или знак. Мелкий текст и сложные сцены на 200 пикселях превращаются в кашу."],
      ],
    },
    uz: {
      label: "miniatyura",
      what: "200×200 — miniatyura o'lchami: izohlardagi avatar, ro'yxatdagi ikonka, jadvaldagi preview, xat pastidagi logotip. Bunday maydonda detallar o'qilmaydi, shuning uchun kichraytirilgan murakkab fotodan ko'ra sodda shakllar, yirik belgi va yuqori kontrast yaxshiroq ishlaydi.",
      tip: "Rasm ikki barobar zichlikdagi ekranda 100 piksel bo'lib ko'rsatilsa, 200×200 — aynan kerakli o'lcham: aniq va deyarli vaznsiz.",
      faqs: [
        ["200x200 juda kichik emasmi?", "Miniatyura uchun — yo'q. U ataylab kichik, toki ko'plab ikonkali sahifa bir zumda yuklansin. Muqova va lentalar uchun kattaroq o'lcham oling."],
        ["Miniatyuraga nima joylash yaxshi?", "Bitta yirik obyekt yoki belgi. Mayda matn va murakkab sahnalar 200 pikselda o'qilmay qoladi."],
      ],
    },
  },
  "1080x1920": {
    ru: {
      label: "вертикаль 9:16, сторис",
      what: "1080×1920 — вертикальный кадр 9:16, полный экран телефона: сторис, Reels, Shorts, TikTok и вертикальная реклама. Интерфейс приложения закрывает верх и низ кадра, примерно по 250 пикселей с каждой стороны, поэтому текст и логотип стоит держать в центральной трети.",
      tip: "Горизонтальный снимок сюда не поместится без потерь: либо обрезайте до вертикали, либо ставьте на цветной фон с полями.",
      faqs: [
        ["Какой размер у сторис и Reels?", "1080×1920 пикселей, соотношение 9:16. Этот же размер подходит для Shorts, TikTok и вертикальных рекламных креативов."],
        ["Почему часть моего текста перекрывается интерфейсом?", "Аватар, подписи и кнопки приложения находятся поверх кадра сверху и снизу. Держите важное в средней части — примерно между 250-м и 1670-м пикселем по высоте."],
      ],
    },
    uz: {
      label: "vertikal 9:16, stories",
      what: "1080×1920 — vertikal 9:16 kadr, telefonning to'liq ekrani: stories, Reels, Shorts, TikTok va vertikal reklama. Ilova interfeysi kadrning yuqori va pastini yopadi, har tomondan taxminan 250 pikselni, shuning uchun matn va logotipni markaziy uchdan birida saqlash kerak.",
      tip: "Gorizontal surat bu yerga yo'qotishsiz sig'maydi: yo vertikalgacha kesing, yo maydonli rangli fonga qo'ying.",
      faqs: [
        ["Stories va Reels o'lchami qanday?", "1080×1920 piksel, 9:16 nisbat. Xuddi shu o'lcham Shorts, TikTok va vertikal reklama kreativlari uchun ham to'g'ri keladi."],
        ["Nega matnimning bir qismi interfeys ostida qoladi?", "Avatar, imzolar va ilova tugmalari kadr ustida yuqori va pastda joylashadi. Muhim narsani o'rta qismda saqlang — balandlik bo'yicha taxminan 250 va 1670 piksel orasida."],
      ],
    },
  },
  "1600x900": {
    ru: {
      label: "HD+ 16:9",
      what: "1600×900 — промежуточный размер 16:9 между 720p и 1080p: его берут для обложек статей и баннеров, когда 1920 пикселей избыточно, а 1280 уже маловато. На ноутбучных экранах шириной 1600 такой файл показывается пиксель в пиксель, без масштабирования.",
      tip: "Пропорция та же, что у 1080p, поэтому уменьшение с Full HD проходит без обрезки — меняется только вес файла.",
      faqs: [
        ["Чем 1600x900 лучше 1920x1080?", "Ничем по качеству — тот же кадр 16:9. Но пикселей на 30% меньше, значит файл легче и страница грузится быстрее."],
        ["Подойдёт ли 1600x900 для обложки статьи?", "Да, это удобный размер для баннера в блоге: достаточно резко на большинстве экранов и заметно легче Full HD."],
      ],
    },
    uz: {
      label: "HD+ 16:9",
      what: "1600×900 — 720p va 1080p orasidagi oraliq 16:9 o'lcham: uni maqola muqovalari va bannerlar uchun oladilar, chunki 1920 piksel ortiqcha, 1280 esa kam. Kengligi 1600 bo'lgan noutbuk ekranlarida bunday fayl masshtablanmasdan, piksel-ba-piksel ko'rsatiladi.",
      tip: "Nisbat 1080p bilan bir xil, shuning uchun Full HD dan kichraytirish kesishsiz o'tadi — faqat fayl hajmi o'zgaradi.",
      faqs: [
        ["1600x900 1920x1080 dan nimasi bilan yaxshi?", "Sifat bo'yicha hech nimasi bilan — o'sha 16:9 kadr. Ammo piksel 30% kam, demak fayl yengil va sahifa tezroq yuklanadi."],
        ["1600x900 maqola muqovasi uchun to'g'ri keladimi?", "Ha, bu blog banneri uchun qulay o'lcham: ko'pchilik ekranlarda yetarlicha aniq va Full HD dan sezilarli yengil."],
      ],
    },
  },
  "1920x1200": {
    ru: {
      label: "WUXGA 16:10",
      what: "1920×1200 — разрешение WUXGA с пропорцией 16:10, родное для многих рабочих ноутбуков, мониторов для вёрстки и планшетов: по сравнению с 16:9 кадр чуть выше, и это дополнительное место заметно при работе с текстом и таблицами. Обои 1080p на таком экране растягиваются и теряют резкость.",
      tip: "16:10 и 16:9 — разные пропорции, поэтому кадр 1920×1080 сюда не подойдёт без обрезки или полей.",
      faqs: [
        ["Чем 16:10 отличается от 16:9?", "16:10 выше при той же ширине — 1920×1200 против 1920×1080. Дополнительные 120 пикселей по высоте полезны для документов и интерфейсов."],
        ["Можно ли использовать обои 1920x1080 на экране 1920x1200?", "Можно, но система растянет их по высоте или оставит полосы. Файл ровно 1920×1200 покажется без искажений."],
      ],
    },
    uz: {
      label: "WUXGA 16:10",
      what: "1920×1200 — 16:10 nisbatli WUXGA o'lchami, ko'plab ishchi noutbuklar, dizayn monitorlari va planshetlar uchun tabiiy: 16:9 ga nisbatan kadr biroz balandroq va bu qo'shimcha joy matn hamda jadvallar bilan ishlashda sezilarli. Bunday ekranda 1080p fon rasmi cho'ziladi va aniqligini yo'qotadi.",
      tip: "16:10 va 16:9 — turli nisbatlar, shuning uchun 1920×1080 kadr bu yerga kesish yoki maydonsiz to'g'ri kelmaydi.",
      faqs: [
        ["16:10 16:9 dan nimasi bilan farq qiladi?", "16:10 bir xil kenglikda balandroq — 1920×1200 va 1920×1080. Balandlikdagi qo'shimcha 120 piksel hujjat va interfeyslar uchun foydali."],
        ["1920x1080 fon rasmini 1920x1200 ekranda ishlatsa bo'ladimi?", "Bo'ladi, ammo tizim uni balandlik bo'yicha cho'zadi yoki chiziq qoldiradi. Aniq 1920×1200 fayl buzilishsiz ko'rinadi."],
      ],
    },
  },
  "1024x1024": {
    ru: {
      label: "крупный квадрат",
      what: "1024×1024 — квадрат со стороной, кратной степени двойки: стандартный размер выдачи у генераторов изображений, привычный формат для текстур, спрайтов и иконок приложений в высоком разрешении. Инструменты, работающие с текстурами, любят такие числа — они делятся пополам без остатка много раз подряд.",
      tip: "Если картинка пойдёт в игровой движок или в набор иконок, размер, кратный степени двойки, избавит от неожиданного пересэмплирования.",
      faqs: [
        ["Почему многие ИИ-генераторы отдают именно 1024x1024?", "Это удобный для нейросетей квадрат: сторона кратна степени двойки, а разрешение достаточно высокое и для постов, и для печати небольшого формата."],
        ["Чем 1024x1024 отличается от 1080x1080?", "Только размером. 1080 — размер для лент соцсетей, 1024 — технический стандарт для текстур, иконок и генерации изображений."],
      ],
    },
    uz: {
      label: "yirik kvadrat",
      what: "1024×1024 — tomoni ikkining darajasiga karrali kvadrat: tasvir generatorlarining standart chiqish o'lchami, teksturalar, spraytlar va yuqori aniqlikdagi ilova ikonkalari uchun odatiy format. Teksturalar bilan ishlaydigan vositalar bunday sonlarni yaxshi ko'radi — ular ketma-ket ko'p marta qoldiqsiz ikkiga bo'linadi.",
      tip: "Rasm o'yin dvigateliga yoki ikonkalar to'plamiga ketadigan bo'lsa, ikkining darajasiga karrali o'lcham kutilmagan qayta namunalashdan xalos qiladi.",
      faqs: [
        ["Nega ko'p AI generatorlar aynan 1024x1024 beradi?", "Bu neyron tarmoqlar uchun qulay kvadrat: tomoni ikkining darajasiga karrali, o'lchami esa postlar uchun ham, kichik formatli bosma uchun ham yetarlicha yuqori."],
        ["1024x1024 1080x1080 dan nimasi bilan farq qiladi?", "Faqat o'lchami bilan. 1080 — ijtimoiy tarmoq lentalari uchun, 1024 — tekstura, ikonka va tasvir generatsiyasi uchun texnik standart."],
      ],
    },
  },
  "2048x2048": {
    ru: {
      label: "квадрат XL",
      what: "2048×2048 — крупный квадрат для случаев, когда важен запас: обложки альбомов в высоком разрешении, текстуры для 3D, исходники, из которых потом нарежут иконки всех размеров, печать квадратного постера примерно до 17 сантиметров при 300 DPI. Файл выходит тяжёлым, и это нормально — он рабочий, а не финальный для веба.",
      tip: "Для публикации в соцсетях уменьшите его до 1080×1080: платформы всё равно пережмут файл, и лучше контролировать этот шаг самому.",
      faqs: [
        ["Зачем нужен квадрат 2048x2048?", "Как мастер-файл: из него без потерь получаются 1024, 512 и 256, а также печать небольшого квадратного формата."],
        ["Стоит ли загружать 2048x2048 в соцсеть?", "Смысла мало — лента всё равно уменьшит картинку до своей ширины и пережмёт её своим кодеком. Уменьшите заранее и сохраните контроль над качеством."],
      ],
    },
    uz: {
      label: "XL kvadrat",
      what: "2048×2048 — zaxira muhim bo'lgan holatlar uchun yirik kvadrat: yuqori aniqlikdagi albom muqovalari, 3D uchun teksturalar, keyinchalik barcha o'lchamdagi ikonkalar kesib olinadigan manbalar, 300 DPI da taxminan 17 santimetrgacha kvadrat poster bosmasi. Fayl og'ir chiqadi va bu normal — u ishchi fayl, veb uchun yakuniy emas.",
      tip: "Ijtimoiy tarmoqqa joylash uchun uni 1080×1080 gacha kichraytiring: platformalar baribir siqadi, bu qadamni o'zingiz nazorat qilganingiz yaxshi.",
      faqs: [
        ["2048x2048 kvadrat nima uchun kerak?", "Master-fayl sifatida: undan yo'qotishsiz 1024, 512 va 256 chiqadi, shuningdek kichik kvadrat format bosmasi."],
        ["2048x2048 ni ijtimoiy tarmoqqa yuklash kerakmi?", "Ma'nosi kam — lenta baribir rasmni o'z kengligiga kichraytiradi va o'z kodeki bilan siqadi. Oldindan kichraytiring va sifat nazoratini saqlang."],
      ],
    },
  },
  "300x300": {
    ru: {
      label: "квадрат 300 пикселей",
      what: "300×300 — размер, который чаще всего просят маркетплейсы и каталоги для миниатюры товара, а также почтовые рассылки для логотипа и квадратного баннера. Он крупнее иконки, но всё ещё лёгкий: страница с сеткой из таких картинок остаётся быстрой даже на мобильном интернете.",
      tip: "В письмах многие клиенты не поддерживают современные форматы — сохраняйте такой квадрат в JPG или PNG, а не в WebP.",
      faqs: [
        ["Где обычно требуется 300x300?", "В карточках маркетплейсов, каталогах, почтовых рассылках и внутренних справочниках — везде, где картинка показывается небольшой, но должна оставаться разборчивой."],
        ["300x300 хватит для карточки товара?", "Для миниатюры в списке — да. Для страницы товара, где картинку увеличивают, берите от 1000 пикселей по стороне."],
      ],
    },
    uz: {
      label: "300 pikselli kvadrat",
      what: "300×300 — marketpleyslar va kataloglar mahsulot miniatyurasi uchun eng ko'p so'raydigan o'lcham, shuningdek pochta tarqatmalarida logotip va kvadrat banner uchun. U ikonkadan yirikroq, ammo hamon yengil: bunday rasmlar setkasidagi sahifa mobil internetda ham tez qoladi.",
      tip: "Xatlarda ko'p mijozlar zamonaviy formatlarni qo'llamaydi — bunday kvadratni WebP emas, JPG yoki PNG da saqlang.",
      faqs: [
        ["300x300 odatda qayerda talab qilinadi?", "Marketpleys kartochkalarida, kataloglarda, pochta tarqatmalarida va ichki ma'lumotnomalarda — rasm kichik ko'rsatiladigan, ammo tushunarli qolishi kerak bo'lgan hamma joyda."],
        ["300x300 mahsulot kartochkasi uchun yetadimi?", "Ro'yxatdagi miniatyura uchun — ha. Rasm kattalashtiriladigan mahsulot sahifasi uchun tomoni 1000 pikseldan boshlangan o'lchamni oling."],
      ],
    },
  },
  "2400x3000": {
    ru: {
      label: "печать 8×10 дюймов, 20×25 см",
      what: "2400×3000 — 8×10 дюймов (примерно 20×25 см) при 300 DPI: формат портрета в рамке, школьного и студийного фото, небольшого постера на стену. Пропорция 4:5 заметно «квадратнее», чем 10×15, и ближе к тому, как снимает телефон в вертикальной ориентации.",
      tip: "Снимок на 12 мегапикселей — это около 4000×3000 пикселей, то есть запаса по разрешению хватает с избытком; вопрос только в правильной обрезке.",
      faqs: [
        ["Можно ли напечатать 20x25 см с фото на 12 МП?", "Да. 12 МП — это примерно 4000×3000, что заметно больше нужных 2400×3000, поэтому снимок уменьшается без потери резкости."],
        ["Подойдёт ли одна обрезка для 13x18 и 20x25?", "Нет — 5:7 и 4:5 разные пропорции, каждому формату нужен свой кроп из оригинала."],
      ],
    },
    uz: {
      label: "8×10 dyuym bosma, 20×25 sm",
      what: "2400×3000 — 300 DPI da 8×10 dyuym (taxminan 20×25 sm): ramkadagi portret, maktab va studiya fotosi, devorga kichik poster formati. 4:5 nisbat 10×15 dan sezilarli «kvadratroq» va telefon vertikal holatda suratga oladigan kadrga yaqinroq.",
      tip: "12 megapiksellik kadr taxminan 4000×3000 piksel, ya'ni o'lcham zaxirasi ortig'i bilan yetadi; gap faqat to'g'ri kesishda.",
      faqs: [
        ["12 MP fotodan 20x25 sm bosib chiqarsa bo'ladimi?", "Ha. 12 MP — taxminan 4000×3000, bu kerakli 2400×3000 dan sezilarli katta, shuning uchun surat aniqlikni yo'qotmasdan kichrayadi."],
        ["13x18 va 20x25 uchun bitta kesish to'g'ri keladimi?", "Yo'q — 5:7 va 4:5 turli nisbatlar, har bir formatga originaldan o'z kropi kerak."],
      ],
    },
  },
  "1748x2480": {
    ru: {
      label: "A5 при 300 DPI",
      what: "1748×2480 — полная страница A5 (148×210 мм) при 300 DPI, ровно половина листа A4. Это рабочий формат флаеров, листовок, приглашений, программок и страниц буклета: места хватает и на изображение, и на блок текста, а раздавать такие тиражи дёшево.",
      tip: "Все размеры серии A имеют одну пропорцию, поэтому макет, собранный в A5, увеличивается до A4 или уменьшается до A6 без единой обрезки.",
      faqs: [
        ["A5 — это сколько пикселей?", "1748×2480 при 300 DPI. При 150 DPI выйдет 874×1240 — приемлемо для черновой распечатки, но в тираже заметно мягче."],
        ["A5 — это ровно половина A4?", "Да. Сложенный пополам лист A4 даёт A5, и благодаря пропорции 1:√2 форма страницы при этом не меняется."],
      ],
    },
    uz: {
      label: "A5, 300 DPI",
      what: "1748×2480 — 300 DPI da to'liq A5 sahifa (148×210 mm), aynan A4 varag'ining yarmi. Bu flayer, varaqa, taklifnoma, dastur va buklet sahifalarining ishchi formati: joy ham rasmga, ham matn blokiga yetadi, bunday tirajni tarqatish esa arzon.",
      tip: "A seriyasining barcha o'lchamlari bir xil nisbatga ega, shuning uchun A5 da yig'ilgan maket A4 gacha kattalashadi yoki A6 gacha kichrayadi — bitta ham kesishsiz.",
      faqs: [
        ["A5 necha piksel?", "300 DPI da 1748×2480. 150 DPI da 874×1240 chiqadi — qoralama chop etish uchun maqbul, ammo tirajda sezilarli yumshoq."],
        ["A5 aynan A4 ning yarmimi?", "Ha. Ikki buklangan A4 varaq A5 beradi va 1:√2 nisbat tufayli sahifa shakli o'zgarmaydi."],
      ],
    },
  },
  "3508x4961": {
    ru: {
      label: "A3 при 300 DPI",
      what: "3508×4961 — полная страница A3 (297×420 мм) при 300 DPI, вдвое больше A4 по площади. Это территория постеров: афиши мероприятий, настенная печать, крупноформатная графика и презентационные щиты. Здесь разрешение исходника перестаёт быть деталью и становится главным вопросом.",
      tip: "Картинка, выглядевшая резкой на экране, может рассыпаться при увеличении почти до пяти тысяч пикселей по высоте — проверьте оригинал заранее.",
      faqs: [
        ["A3 — это сколько пикселей?", "3508×4961 при 300 DPI. Постер, который смотрят издалека, допустимо печатать и в 150–200 DPI, но типографии обычно просят 300."],
        ["Оригинал слишком мал для A3 — что делать?", "Либо печатать в A4, либо сначала увеличить снимок. Обычное растягивание задаёт размер, но не добавляет деталей — ИИ-апскейлер справится заметно лучше."],
      ],
    },
    uz: {
      label: "A3, 300 DPI",
      what: "3508×4961 — 300 DPI da to'liq A3 sahifa (297×420 mm), maydoni bo'yicha A4 dan ikki barobar katta. Bu poster hududi: tadbir afishalari, devor bosmasi, yirik formatli grafika va taqdimot taxtalari. Bu yerda manba o'lchami tafsilot bo'lishdan to'xtaydi va asosiy masalaga aylanadi.",
      tip: "Ekranda aniq ko'ringan rasm balandligi deyarli besh ming pikselgacha kattalashtirilganda parchalanib ketishi mumkin — originalni oldindan tekshiring.",
      faqs: [
        ["A3 necha piksel?", "300 DPI da 3508×4961. Uzoqdan ko'riladigan posterni 150–200 DPI da ham bosish mumkin, ammo bosmaxonalar odatda 300 ni so'raydi."],
        ["Original A3 uchun juda kichik — nima qilish kerak?", "Yo A4 da bosish, yo avval suratni kattalashtirish. Oddiy cho'zish o'lchamni beradi, lekin detal qo'shmaydi — AI upscaler sezilarli yaxshi uddalaydi."],
      ],
    },
  },
};

/* fill-vs-fit explained for the actual shape of this frame */
const MODE: Record<"landscape" | "portrait" | "square", Record<Lang, string>> = {
  landscape: {
    ru: "«Заполнить» покрывает всю широкую рамку и обрезает лишнее сверху и снизу; «вписать» оставляет изображение целиком и добавляет фон по бокам.",
    uz: "«To'ldirish» keng kadrni to'liq qoplaydi va ortiqchasini yuqori-pastdan kesadi; «sig'dirish» rasmni butunligicha qoldirib, yon tomonlarga fon qo'shadi.",
  },
  portrait: {
    ru: "«Заполнить» покрывает всю вертикальную рамку и обрезает лишнее по бокам; «вписать» оставляет изображение целиком и добавляет фон сверху и снизу.",
    uz: "«To'ldirish» vertikal kadrni qoplaydi va yon tomonlarni kesadi; «sig'dirish» rasmni to'liq qoldirib, yuqori va pastga fon qo'shadi.",
  },
  square: {
    ru: "«Заполнить» обрезает длинную сторону до квадрата; «вписать» вмещает всё изображение и заполняет остаток выбранным цветом.",
    uz: "«To'ldirish» uzun tomonni kvadratga kesadi; «sig'dirish» butun rasmni joylashtirib, qolgan joyni tanlangan rang bilan to'ldiradi.",
  },
};

/* closing FAQs shared by every page — the two above them are size-specific */
const COMMON: Record<Lang, { q: string; a: string }[]> = {
  ru: [
    { q: "Чем «заполнить» отличается от «вписать»?", a: "«Заполнить» гарантирует точный размер, обрезая то, что не помещается. «Вписать» сохраняет изображение целиком и добавляет фон выбранного цвета. Итоговые пиксельные размеры в обоих случаях одинаковые." },
    { q: "Загружаются ли мои изображения на сервер?", a: "Нет. Изменение размера выполняется прямо в браузере через Canvas API — файл не покидает ваше устройство и нигде не сохраняется." },
    { q: "Это бесплатно и без водяных знаков?", a: "Да — без регистрации, без лимитов и без водяных знаков." },
  ],
  uz: [
    { q: "«To'ldirish» va «sig'dirish» farqi nima?", a: "«To'ldirish» sig'magan joyni kesib, aniq o'lchamni kafolatlaydi. «Sig'dirish» rasmni butunligicha saqlab, tanlangan rangda fon qo'shadi. Yakuniy piksel o'lchami ikkalasida ham bir xil." },
    { q: "Rasmlarim serverga yuklanadimi?", a: "Yo'q. O'lcham o'zgartirish Canvas API orqali brauzerda bajariladi — fayl qurilmangizdan chiqmaydi va hech qayerda saqlanmaydi." },
    { q: "Bepulmi, suv belgisi bormi?", a: "To'liq bepul — ro'yxatdan o'tmasdan, cheklovsiz va suv belgisisiz." },
  ],
};

const T = {
  ru: { home: "Главная", hub: "Размеры изображений", how: "Как изменить размер", faq: "Вопросы и ответы", other: "Другие размеры", en: "English version", free: "Бесплатно · в браузере · без загрузки на сервер", custom: "Свои ширина и высота", compress: "Сжать изображение", convert: "Сменить формат" },
  uz: { home: "Bosh sahifa", hub: "Rasm o'lchamlari", how: "O'lchamni qanday o'zgartirish", faq: "Savol-javob", other: "Boshqa o'lchamlar", en: "English version", free: "Bepul · brauzerda · serverga yuklamasdan", custom: "O'z eni va bo'yi", compress: "Rasmni siqish", convert: "Formatni almashtirish" },
} as const;
export const resizeUI = (l: Lang) => T[l];

export type LocResize = {
  title: string; h1: string; desc: string; intro: string; about: string;
  keywords: string[]; steps: [string, string][]; faqs: { q: string; a: string }[];
};

export function locResize(p: ResizePreset, lang: Lang): LocResize {
  const c = C[p.slug][lang];
  const shape = p.w === p.h ? "square" : p.w > p.h ? "landscape" : "portrait";
  const about = `${c.what} ${MODE[shape][lang]} ${c.tip}`;
  const faqs = [
    ...c.faqs.map(([q, a]) => ({ q, a })),
    ...COMMON[lang],
  ];

  if (lang === "ru") {
    return {
      title: `Изменить размер изображения до ${p.w}x${p.h} — онлайн бесплатно`,
      h1: `Изменить размер изображения до ${p.w}×${p.h}`,
      desc: `Измените размер фото ровно до ${p.w}x${p.h} пикселей (${c.label}) онлайн и бесплатно. Обрезка по размеру или вписывание с фоном — прямо в браузере, без загрузки на сервер.`,
      intro: `Точный размер ${p.w}×${p.h} — ${c.label}. Обрежьте по рамке или впишите целиком с фоном.`,
      about,
      keywords: [
        `изменить размер фото до ${p.w}x${p.h}`,
        `${p.w}x${p.h} онлайн`,
        `сделать изображение ${p.w}x${p.h}`,
        `${p.w} на ${p.h} пикселей`,
        c.label,
      ],
      steps: [
        ["Загрузите изображение", "Перетащите файл или выберите его — снимок остаётся на вашем устройстве."],
        ["Выберите режим", MODE[shape].ru],
        [`Скачайте ${p.w}×${p.h}`, "Сохраните готовый файл — качество регулируется ползунком."],
      ],
      faqs,
    };
  }
  return {
    title: `Rasm o'lchamini ${p.w}x${p.h} ga o'zgartirish — bepul onlayn`,
    h1: `Rasm o'lchamini ${p.w}×${p.h} ga o'zgartirish`,
    desc: `Rasm o'lchamini aniq ${p.w}x${p.h} pikselga (${c.label}) bepul onlayn o'zgartiring. Kesib to'ldirish yoki fon bilan sig'dirish — brauzerda, serverga yuklamasdan.`,
    intro: `Aniq ${p.w}×${p.h} — ${c.label}. Kadr bo'yicha kesing yoki fon bilan butunligicha sig'diring.`,
    about,
    keywords: [
      `rasm o'lchamini ${p.w}x${p.h} ga o'zgartirish`,
      `${p.w}x${p.h} rasm`,
      `${p.w}x${p.h} onlayn`,
      `rasmni ${p.w}x${p.h} qilish`,
      c.label,
    ],
    steps: [
      ["Rasmni yuklang", "Faylni tashlang yoki tanlang — surat qurilmangizda qoladi."],
      ["Rejimni tanlang", MODE[shape].uz],
      [`${p.w}×${p.h} ni yuklab oling`, "Tayyor faylni saqlang — sifat slayder bilan boshqariladi."],
    ],
    faqs,
  };
}

/** Only presets we have written localized copy for (all 25 qualify). */
export const LOC_RESIZE_PRESETS = RESIZE_PRESETS.filter((p) => C[p.slug]);

/** Short localized name of a size ("Full HD", "Фото на паспорт") — used by the
    localized hub cards so they don't fall back to the English label. */
export const resizeLabel = (slug: string, l: Lang) => C[slug]?.[l]?.label ?? "";
