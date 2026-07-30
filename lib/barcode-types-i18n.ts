/* RU + UZ localized copy for the /barcode/<type> pages.
   Yandex is the site's #1 referrer, and symbology queries ("генератор pdf417",
   "штрих код ean 13 создать", "shtrix kod generatori") have real volume with
   almost no local competition. Every format gets its own written facts, its own
   caveat and two of its own FAQs, so no page is a template of another —
   thin twins don't rank. */

import { BARCODE_TYPES, type BarcodeType } from "@/lib/barcode-types";

type Lang = "ru" | "uz";
type Copy = { label: string; what: string; tip: string; faqs: [string, string][] };

/** Digit-only symbologies whose length is fixed and whose check digit BarcodeClient
    appends for you (these are the ones carrying `fixedLen` in the client). */
const NUMERIC_CHECKED = new Set(["ean-13", "ean-8", "upc-a", "itf-14"]);
/** Digit-only, but free length and no automatic check digit — don't promise one. */
const NUMERIC_PLAIN = new Set(["interleaved-2-of-5", "msi-barcode", "pharmacode"]);

/* per-symbology written copy, keyed by slug */
const C: Record<string, Record<Lang, Copy>> = {
  /* ───────── 2D codes ───────── */
  pdf417: {
    ru: {
      label: "2D-код для документов",
      what: "PDF417 расшифровывается как Portable Data File, а число 417 описывает структуру: каждое кодовое слово состоит из 17 модулей — четырёх штрихов и четырёх пробелов. Именно поэтому код выглядит как приплюснутая лестница, а не как квадрат, и читается обычным лазерным сканером. В один символ помещается около 1850 символов текста, чего хватает на имя, адрес, дату рождения и категорию прав — ровно то, что печатают на обороте водительских удостоверений.",
      tip: "Встроенная коррекция ошибок Рида — Соломона позволяет считать код, даже если этикетка потёрта, согнута или частично надорвана.",
      faqs: [
        ["Где применяется PDF417?", "На водительских удостоверениях и ID-картах, в визах, на посадочных талонах авиакомпаний, транспортных накладных и почтовых наклейках — везде, где в одном сканировании нужно передать много текста."],
        ["Можно ли сделать настоящий штрих-код водительского удостоверения?", "Генератор кодирует в корректный символ PDF417 любой введённый текст. Но чтобы код приняло государственное считывающее устройство, нужна официально выданная строка данных стандарта AAMVA — её выдаёт только орган, оформляющий документ."],
      ],
    },
    uz: {
      label: "hujjatlar uchun 2D kod",
      what: "PDF417 — Portable Data File degani, 417 raqami esa tuzilishini bildiradi: har bir kod so'zi 17 moduldan iborat — to'rtta chiziq va to'rtta bo'shliq. Aynan shuning uchun kod kvadrat emas, yassilangan narvonga o'xshaydi va oddiy lazerli skaner ham o'qiy oladi. Bitta belgiga taxminan 1850 ta belgi sig'adi — ism, manzil, tug'ilgan sana va toifa uchun yetarli, ya'ni haydovchilik guvohnomasi orqasiga bosiladigan ma'lumotning o'zi.",
      tip: "Rid — Solomon xatolarni tuzatish tizimi yorliq ishqalangan, bukilgan yoki qisman yirtilgan bo'lsa ham kodni o'qishga imkon beradi.",
      faqs: [
        ["PDF417 qayerda ishlatiladi?", "Haydovchilik guvohnomalari va ID kartalarda, vizalarda, aviachipta talonlarida, transport hujjatlari va pochta yorliqlarida — bitta skanerlashda ko'p matn uzatish kerak bo'lgan hamma joyda."],
        ["Haqiqiy haydovchilik guvohnomasi kodini yasash mumkinmi?", "Generator siz kiritgan istalgan matnni to'g'ri PDF417 belgisiga kodlaydi. Ammo kodni davlat o'quvchisi qabul qilishi uchun AAMVA standartidagi rasmiy ma'lumot qatori kerak — uni faqat hujjatni beruvchi organ taqdim etadi."],
      ],
    },
  },
  "aztec-code": {
    ru: {
      label: "код для билетов",
      what: "Aztec Code назван из-за ступенчатой мишени в центре, похожей на ацтекскую пирамиду сверху. Эта центральная метка — главный приём формата: сканер цепляется за середину, а не ищет угловые маркеры, поэтому Aztec вообще не требует «тихой зоны» — пустого поля вокруг кода. На тесном билете или узкой багажной бирке это даёт выигрыш в 20–30% места, и именно поэтому Deutsche Bahn, SNCF и большинство европейских перевозчиков печатают на билетах Aztec.",
      tip: "Уровень коррекции ошибок настраивается от 5 до 95%; по умолчанию берут 23% — разумный компромисс между размером и живучестью.",
      faqs: [
        ["Почему Aztec не нужна тихая зона?", "Его поисковый шаблон — мишень в центре символа, а не маркеры по углам. Сканеру не нужно пустое поле, чтобы понять, где заканчивается код: он находит центр и разворачивает сетку от него."],
        ["Прочитает ли телефон код Aztec?", "Специализированные приложения-сканеры и все билетные валидаторы читают Aztec без проблем. Встроенная камера некоторых телефонов ищет только QR, поэтому для потребительских задач проверьте код универсальным сканером."],
      ],
    },
    uz: {
      label: "chiptalar uchun kod",
      what: "Aztec Code nomi markazidagi zinapoyasimon nishondan kelib chiqqan — u tepadan qaralgan atstek piramidasiga o'xshaydi. Bu markaziy belgi formatning asosiy hiylasi: skaner burchaklardagi belgilarni qidirmay, o'rtaga yopishadi, shuning uchun Aztec ga «tinch zona» — kod atrofidagi bo'sh maydon umuman kerak emas. Tor chipta yoki ingichka bagaj yorlig'ida bu 20–30% joy yutug'ini beradi, shu sababli Deutsche Bahn, SNCF va ko'pchilik yevropa tashuvchilari chiptalarga Aztec bosadi.",
      tip: "Xatolarni tuzatish darajasi 5 dan 95% gacha sozlanadi; odatda 23% olinadi — o'lcham va bardoshlilik orasidagi oqilona muvozanat.",
      faqs: [
        ["Nega Aztec ga tinch zona kerak emas?", "Uning qidiruv shabloni burchaklardagi belgilar emas, balki belgi markazidagi nishon. Skanerga kod qayerda tugashini bilish uchun bo'sh maydon kerak emas: u markazni topib, panjarani o'sha yerdan yozadi."],
        ["Telefon Aztec kodini o'qiydimi?", "Maxsus skaner ilovalari va barcha chipta validatorlari Aztec ni bemalol o'qiydi. Ba'zi telefonlarning o'rnatilgan kamerasi faqat QR ni qidiradi, shuning uchun iste'molchilar uchun kodni universal skaner bilan tekshiring."],
      ],
    },
  },
  "data-matrix": {
    ru: {
      label: "квадратный код для маркировки",
      what: "Data Matrix вмещает больше данных на единицу площади, чем любая другая распространённая символика, поэтому доминирует там, где этикетка крошечная. Узнать его легко: две сплошные стороны образуют букву L — это поисковый шаблон, — а на двух противоположных идёт пунктирная «тактовая дорожка», сообщающая сканеру размер сетки. Один символ несёт до 2335 символов и остаётся читаемым после разрушения примерно 30% его площади.",
      tip: "Именно эта живучесть сделала Data Matrix стандартом прямой маркировки деталей: код выжигают лазером прямо по металлу, и он переживает нагрев, масло и истирание.",
      faqs: [
        ["Насколько маленьким может быть Data Matrix?", "При подходящем сканере он читается вплоть до 2–3 мм в стороне — гораздо мельче, чем способен любой линейный штрих-код с тем же объёмом данных."],
        ["Чем Data Matrix отличается от QR-кода?", "Оба квадратные матричные. Data Matrix использует L-образный поисковый шаблон и плотнее на малых размерах, поэтому выигрывает на мелких деталях. QR использует три угловых квадрата, быстрее считывается камерой телефона и вмещает больше на крупных размерах."],
      ],
    },
    uz: {
      label: "markirovka uchun kvadrat kod",
      what: "Data Matrix maydon birligiga boshqa har qanday keng tarqalgan simvologiyadan ko'proq ma'lumot sig'diradi, shuning uchun yorliq juda kichik bo'lgan joylarda hukmronlik qiladi. Uni tanish oson: ikkita to'liq tomon L harfini hosil qiladi — bu qidiruv shabloni, — qarama-qarshi ikkitasida esa skanerga panjara o'lchamini bildiruvchi punktir «takt yo'lakchasi» boradi. Bitta belgi 2335 tagacha belgini olib yuradi va maydonining taxminan 30% yo'q qilinganidan keyin ham o'qiladi.",
      tip: "Aynan shu bardoshlilik Data Matrix ni detallarni to'g'ridan-to'g'ri belgilash standartiga aylantirdi: kod metallga lazer bilan o'yiladi va issiqlik, moy hamda ishqalanishga chidaydi.",
      faqs: [
        ["Data Matrix qanchalik kichik bo'lishi mumkin?", "Mos skaner bilan tomoni 2–3 mm gacha o'qiladi — bir xil ma'lumot hajmidagi istalgan chiziqli shtrix koddan ancha mayda."],
        ["Data Matrix QR koddan nimasi bilan farq qiladi?", "Ikkalasi ham kvadrat matritsa. Data Matrix L shaklidagi qidiruv shablonidan foydalanadi va kichik o'lchamlarda zichroq, shuning uchun mayda detallarda yutadi. QR uchta burchak kvadratidan foydalanadi, telefon kamerasi bilan tezroq o'qiladi va katta o'lchamlarda ko'proq sig'diradi."],
      ],
    },
  },

  /* ───────── Retail ───────── */
  "ean-13": {
    ru: {
      label: "розничный код товара",
      what: "EAN-13 — международный товарный номер, штрих-код почти на каждом товаре в рознице. Его тринадцать цифр делятся на три части: префикс GS1 из двух-трёх цифр, код производителя с кодом товара и контрольная цифра по модулю 10. Важная деталь: префикс указывает, где номер зарегистрирован, а не где произведён товар — префикс 50 означает регистрацию в GS1 Великобритании, а не британское производство.",
      tip: "Тринадцатая цифра вообще не рисуется штрихами: она закодирована чётностью первых шести цифр — поэтому сканер читает символ с любой стороны и всё равно восстанавливает номер целиком.",
      faqs: [
        ["Нужно ли покупать номер штрих-кода?", "Для продажи через розничные сети — да: GTIN лицензируется в GS1, чтобы быть глобально уникальным. Этот инструмент рисует символ для номера, который у вас уже есть, но сам номер не выдаёт."],
        ["Какого размера печатать штрих-код?", "Номинальный размер EAN-13 — 37,29 × 25,93 мм. Розница обычно принимает от 80 до 200% от него, но масштабировать нужно пропорционально и всегда сохранять светлые поля по бокам."],
      ],
    },
    uz: {
      label: "chakana savdo kodi",
      what: "EAN-13 — xalqaro tovar raqami, chakana savdodagi deyarli har bir mahsulotdagi shtrix kod. Uning o'n uchta raqami uch qismga bo'linadi: ikki-uch raqamli GS1 prefiksi, ishlab chiqaruvchi va mahsulot kodi hamda modul 10 bo'yicha nazorat raqami. Muhim tafsilot: prefiks tovar qayerda ishlab chiqarilganini emas, raqam qayerda ro'yxatdan o'tganini bildiradi — 50 prefiksi Britaniyada ishlab chiqarilganini emas, GS1 Buyuk Britaniyada ro'yxatdan o'tganini anglatadi.",
      tip: "O'n uchinchi raqam umuman chiziq bilan chizilmaydi: u birinchi oltita raqamning juftlik naqshiga kodlangan — shuning uchun skaner belgini istalgan tomondan o'qib, raqamni to'liq tiklaydi.",
      faqs: [
        ["Shtrix kod raqamini sotib olish kerakmi?", "Chakana savdo tarmoqlari orqali sotish uchun — ha: GTIN global noyob bo'lishi uchun GS1 dan litsenziyalanadi. Bu vosita sizda allaqachon mavjud raqam uchun belgi chizadi, raqamning o'zini bermaydi."],
        ["Shtrix kodni qanday o'lchamda bosish kerak?", "EAN-13 ning nominal o'lchami — 37,29 × 25,93 mm. Chakana savdo odatda uning 80 dan 200% gachasini qabul qiladi, lekin proporsional masshtablash va yon tomonlardagi och maydonlarni saqlash shart."],
      ],
    },
  },
  "upc-a": {
    ru: {
      label: "код товара США и Канады",
      what: "UPC-A был первым розничным штрих-кодом — его впервые считали на упаковке жевательной резинки в супермаркете Огайо в 1974 году, и он до сих пор определяет идентификацию товаров в США и Канаде. Двенадцать цифр: ведущий символ системы нумерации, код производителя, номер товара и контрольная цифра по модулю 10. Первая цифра несёт вполне конкретный смысл, на котором часто спотыкаются.",
      tip: "Ноль, единица, шестёрка, семёрка и восьмёрка — обычный товар; двойка означает товар переменного веса, который взвешивают и маркируют в магазине; тройка — лекарства по коду NDC; четвёрка зарезервирована для внутреннего использования магазином; пятёрка и девятка — купоны.",
      faqs: [
        ["Чем UPC отличается от EAN?", "UPC-A состоит из двенадцати цифр и принят в Северной Америке; EAN-13 — его тринадцатизначная международная надстройка. EAN-13, начинающийся с нуля, — это тот же номер, что и соответствующий UPC-A, и современные сканеры читают оба."],
        ["Подойдёт ли такой штрих-код для Amazon?", "Amazon требует GTIN, который прослеживается до вашего собственного префикса, лицензированного в GS1. Символ, который рисует этот инструмент, корректен, но сам номер должен действительно принадлежать вам."],
      ],
    },
    uz: {
      label: "AQSh va Kanada tovar kodi",
      what: "UPC-A birinchi chakana shtrix kod bo'lgan — u 1974 yilda Ogayo supermarketida saqich o'ramida birinchi marta o'qilgan va hozirgacha AQSh va Kanadada tovar identifikatsiyasini belgilaydi. O'n ikki raqam: raqamlash tizimining boshlang'ich belgisi, ishlab chiqaruvchi kodi, tovar raqami va modul 10 bo'yicha nazorat raqami. Birinchi raqam aniq ma'noga ega va ko'pchilik shu yerda adashadi.",
      tip: "Nol, bir, olti, yetti va sakkiz — oddiy tovar; ikki — do'konda tortilib belgilanadigan o'zgaruvchan og'irlikdagi mahsulot; uch — NDC kodi bo'yicha dorilar; to'rt — do'konning ichki foydalanishi uchun; besh va to'qqiz — kuponlar.",
      faqs: [
        ["UPC EAN dan nimasi bilan farq qiladi?", "UPC-A o'n ikki raqamdan iborat va Shimoliy Amerikada qabul qilingan; EAN-13 — uning o'n uch raqamli xalqaro kengaytmasi. Noldan boshlanuvchi EAN-13 mos UPC-A bilan bir xil raqam va zamonaviy skanerlar ikkalasini ham o'qiydi."],
        ["Bu shtrix kod Amazon uchun to'g'ri keladimi?", "Amazon o'zingizning GS1 dan litsenziyalangan prefiksingizga borib taqaladigan GTIN ni talab qiladi. Bu vosita chizadigan belgi to'g'ri, lekin raqamning o'zi haqiqatan sizniki bo'lishi kerak."],
      ],
    },
  },
  "ean-8": {
    ru: {
      label: "короткий код для мелкой упаковки",
      what: "EAN-8 существует по одной причине: некоторые упаковки физически малы, и EAN-13 на них проглатывает весь дизайн. Восемь цифр — префикс GS1 из двух-трёх цифр, короткий номер товара и контрольная цифра по модулю 10 — умещаются в символ примерно на треть уже старшего собрата. Главное, что нужно понимать: номер EAN-8 не получают усечением EAN-13.",
      tip: "Короткие номера GS1 выдаёт отдельно и очень скупо — это дефицитный глобальный ресурс. Обычно просят доказать, что товар действительно не вмещает EAN-13 даже при минимальных 80% масштаба.",
      faqs: [
        ["Когда использовать EAN-8 вместо EAN-13?", "Только когда упаковка действительно мала для EAN-13 в минимально допустимом размере. GS1 считает короткие номера дефицитным ресурсом и ждёт EAN-13 везде, где он помещается."],
        ["Можно ли сделать EAN-8, укоротив свой EAN-13?", "Нет. Номера EAN-8 выдаются GS1 независимо, из отдельного пула. Усечение EAN-13 даёт номер, который принадлежит кому-то другому или никому."],
      ],
    },
    uz: {
      label: "mayda o'ram uchun qisqa kod",
      what: "EAN-8 bitta sabab uchun mavjud: ba'zi o'ramlar jismonan kichik va EAN-13 ularda butun dizaynni yutib yuboradi. Sakkiz raqam — ikki-uch raqamli GS1 prefiksi, qisqa tovar raqami va modul 10 bo'yicha nazorat raqami — kattarog'idan taxminan uchdan bir ingichka belgiga sig'adi. Asosiy tushunish kerak bo'lgan narsa: EAN-8 raqami EAN-13 ni qisqartirish orqali olinmaydi.",
      tip: "Qisqa raqamlarni GS1 alohida va juda ziqnalik bilan beradi — bu taqchil global resurs. Odatda tovar 80% minimal masshtabda ham EAN-13 ni sig'dira olmasligini isbotlash so'raladi.",
      faqs: [
        ["EAN-13 o'rniga EAN-8 ni qachon ishlatish kerak?", "Faqat o'ram EAN-13 uchun minimal ruxsat etilgan o'lchamda ham haqiqatan kichik bo'lganda. GS1 qisqa raqamlarni taqchil resurs deb biladi va sig'adigan hamma joyda EAN-13 ni kutadi."],
        ["EAN-13 ni qisqartirib EAN-8 yasash mumkinmi?", "Yo'q. EAN-8 raqamlarini GS1 mustaqil ravishda, alohida to'plamdan beradi. EAN-13 ni qisqartirish boshqa birovga tegishli yoki hech kimga tegishli bo'lmagan raqam beradi."],
      ],
    },
  },

  /* ───────── Logistics ───────── */
  "code-128": {
    ru: {
      label: "универсальный код логистики",
      what: "Code 128 — тот штрих-код, на котором реально работает большинство складов, курьерских служб и систем учёта, и держится он на плотности. Он кодирует полный набор из 128 символов ASCII через три взаимозаменяемых подмножества, а третье из них — подмножество C — упаковывает по две цифры в каждый символьный знак, поэтому длинная числовая строка сжимается примерно вдвое против Code 39.",
      tip: "Контрольный знак по модулю 103 встроен в каждый символ, поэтому ошибка считывания ловится сканером, а не уходит молча в вашу складскую систему.",
      faqs: [
        ["Что можно закодировать в Code 128?", "Полный набор ASCII — прописные и строчные буквы, все цифры, знаки препинания и управляющие символы, без жёсткого ограничения по длине."],
        ["Что такое GS1-128?", "Стандартизованное применение Code 128, где данные структурированы идентификаторами применения GS1 — например (01) для GTIN, (10) для партии, (17) для срока годности — чтобы контрагенты могли разобрать один штрих-код на отдельные поля."],
      ],
    },
    uz: {
      label: "universal logistika kodi",
      what: "Code 128 — ko'pchilik omborlar, kuryerlik xizmatlari va hisob tizimlari amalda ishlaydigan shtrix kod va u zichlik hisobiga ushlab turibdi. U to'liq 128 ta ASCII belgisini uchta almashinuvchi to'plam orqali kodlaydi, ulardan uchinchisi — C to'plami — har bir belgi ichiga ikkitadan raqam joylaydi, shuning uchun uzun raqamli qator Code 39 ga nisbatan taxminan ikki barobar qisqaradi.",
      tip: "Modul 103 bo'yicha nazorat belgisi har bir belgiga o'rnatilgan, shuning uchun o'qish xatosi ombor tizimingizga jimgina o'tib ketmay, skaner tomonidan tutiladi.",
      faqs: [
        ["Code 128 ga nimani kodlash mumkin?", "To'liq ASCII to'plamini — bosh va kichik harflar, barcha raqamlar, tinish belgilari va boshqaruv belgilari, uzunlik bo'yicha qat'iy cheklovsiz."],
        ["GS1-128 nima?", "Code 128 ning standartlashtirilgan qo'llanilishi bo'lib, unda ma'lumot GS1 qo'llash identifikatorlari bilan tuzilgan — masalan GTIN uchun (01), partiya uchun (10), yaroqlilik muddati uchun (17) — shunda hamkorlar bitta shtrix kodni alohida maydonlarga ajrata oladi."],
      ],
    },
  },
  "itf-14": {
    ru: {
      label: "код транспортной коробки",
      what: "ITF-14 кодирует GTIN-14 — номер, который идентифицирует целый короб или упаковку, а не отдельный товар внутри. Первая цифра — индикатор уровня упаковки: он отличает короб из двенадцати штук от короба из двадцати четырёх того же товара. Визуально ITF-14 узнаётся по нарочито толстым штрихам, и это инженерное решение, а не стиль.",
      tip: "Короба печатают флексографией прямо по бурому гофрокартону — поверхности, которая неравномерно впитывает краску и размывает тонкие детали, поэтому штрихи делают толстыми, а символ обрамляют тяжёлой рамкой.",
      faqs: [
        ["Что такое опорная рамка и нужна ли она?", "Это толстая рамка вокруг символа. Она не даёт прочитать частично захваченный код как более короткий, но формально верный номер, и помогает флексографской печати. Её настоятельно рекомендуют и обычно добавляют на этапе печати короба."],
        ["Можно ли применять ITF-14 на кассе?", "Нет. Кассовые системы ждут на потребительском товаре EAN-13 или UPC-A. ITF-14 предназначен для внешнего короба и читается на складе и при приёмке."],
      ],
    },
    uz: {
      label: "transport qutisi kodi",
      what: "ITF-14 GTIN-14 ni kodlaydi — bu ichidagi alohida tovarni emas, butun quti yoki o'ramni aniqlaydigan raqam. Birinchi raqam — o'ram darajasi ko'rsatkichi: u bir xil tovarning o'n ikkitalik qutisini yigirma to'rttalik qutisidan ajratadi. Ko'rinishidan ITF-14 ataylab qalin chiziqlari bilan taniladi va bu uslub emas, muhandislik yechimi.",
      tip: "Qutilar fleksografiya bilan to'g'ridan-to'g'ri jigarrang gofrokartonga bosiladi — bu bo'yoqni notekis shimadigan va nozik detallarni yoyib yuboradigan sirt, shuning uchun chiziqlar qalin qilinadi va belgi og'ir ramka bilan o'raladi.",
      faqs: [
        ["Tayanch ramka nima va u kerakmi?", "Bu belgi atrofidagi qalin ramka. U qisman ushlangan kodni qisqaroq, ammo rasman to'g'ri raqam sifatida o'qishga yo'l qo'ymaydi va fleksografik bosmaga yordam beradi. U qat'iy tavsiya etiladi va odatda quti bosish bosqichida qo'shiladi."],
        ["ITF-14 ni kassada ishlatish mumkinmi?", "Yo'q. Kassa tizimlari iste'mol tovarida EAN-13 yoki UPC-A ni kutadi. ITF-14 tashqi quti uchun mo'ljallangan va omborda hamda qabul qilishda o'qiladi."],
      ],
    },
  },
  "interleaved-2-of-5": {
    ru: {
      label: "плотный числовой код",
      what: "Interleaved 2 of 5 получил имя за по-настоящему остроумный приём кодирования. Цифры обрабатываются парами: первая цифра пары рисуется штрихами, вторая — пробелами между ними, то есть они буквально переплетены. Ничего не пропадает впустую, и получается одна из самых компактных числовых символик — заметно уже, чем Code 39 на тех же цифрах.",
      tip: "Из парности следует жёсткое правило: ITF кодирует только чётное число цифр. При нечётном количестве добавляется ведущий ноль — это делает любая корректная реализация.",
      faqs: [
        ["Почему в ITF должно быть чётное число цифр?", "Каждая пара цифр делит одну группу штрихов и пробелов: одна цифра в штрихах, другая в пробелах. Непарной цифре просто некуда деться, поэтому нечётные значения дополняются ведущим нулём."],
        ["В чём проблема усечения?", "Любая часть символа ITF чётной длины сама по себе структурно корректна, поэтому частичное считывание может вернуть более короткий неверный номер вообще без ошибки. Опорные рамки вокруг символа это предотвращают."],
      ],
    },
    uz: {
      label: "zich raqamli kod",
      what: "Interleaved 2 of 5 nomini haqiqatan topqir kodlash usuli uchun olgan. Raqamlar juft-juft ishlanadi: juftlikning birinchi raqami chiziqlar bilan, ikkinchisi ular orasidagi bo'shliqlar bilan chiziladi, ya'ni ular tom ma'noda chirmashib ketgan. Hech narsa behuda ketmaydi va eng ixcham raqamli simvologiyalardan biri chiqadi — bir xil raqamlarda Code 39 dan sezilarli ingichka.",
      tip: "Juftlikdan qat'iy qoida kelib chiqadi: ITF faqat juft sondagi raqamni kodlaydi. Toq son bo'lganda boshiga nol qo'shiladi — buni har qanday to'g'ri amalga oshirish bajaradi.",
      faqs: [
        ["Nega ITF da raqamlar soni juft bo'lishi kerak?", "Har bir raqamlar juftligi bitta chiziq va bo'shliq guruhini bo'lishadi: bir raqam chiziqlarda, ikkinchisi bo'shliqlarda. Juftsiz raqamga joy yo'q, shuning uchun toq qiymatlar boshiga nol qo'shib to'ldiriladi."],
        ["Kesilish muammosi nimada?", "ITF belgisining juft uzunlikdagi istalgan qismi o'zi tuzilish jihatdan to'g'ri, shuning uchun qisman o'qish umuman xatosiz qisqaroq noto'g'ri raqam qaytarishi mumkin. Belgi atrofidagi tayanch ramkalar buning oldini oladi."],
      ],
    },
  },

  /* ───────── Industry ───────── */
  "code-39": {
    ru: {
      label: "первый буквенно-цифровой код",
      what: "Code 39, он же Code 3 of 9, появился в 1974 году и стал первым штрих-кодом, способным кодировать буквы, а не только цифры. Название описывает структуру: каждый знак — девять элементов, три из которых широкие. Набор символов охватывает цифры, прописные латинские буквы и знаки дефис, точка, пробел, доллар, слэш, плюс и процент, а звёздочка служит меткой старта и стопа.",
      tip: "Плата за простоту — ширина: Code 39 наименее плотный из распространённых, и длинное значение даёт длинную этикетку. Живёт он благодаря универсальной совместимости — ни один сканер не нужно настраивать.",
      faqs: [
        ["Какие символы поддерживает Code 39?", "Цифры 0–9, прописные латинские A–Z и знаки дефис, точка, пробел, доллар, слэш, плюс и процент. Строчные буквы требуют расширения Full ASCII, которое многие считыватели по умолчанию не включают."],
        ["Стоит ли использовать Code 39 сегодня?", "Берите его, когда критична максимальная совместимость сканеров или этого требует стандарт — оборона, автопром, пропуска. Для новых внутренних систем Code 128 плотнее и обычно лучше."],
      ],
    },
    uz: {
      label: "birinchi harf-raqamli kod",
      what: "Code 39, ya'ni Code 3 of 9, 1974 yilda paydo bo'lgan va faqat raqam emas, harflarni ham kodlay oladigan birinchi shtrix kod bo'lgan. Nomi tuzilishini bildiradi: har bir belgi to'qqiz elementdan iborat, ulardan uchtasi keng. Belgilar to'plami raqamlar, bosh lotin harflari hamda chiziqcha, nuqta, bo'shliq, dollar, slesh, plyus va foiz belgilarini qamraydi, yulduzcha esa start va stop belgisi vazifasini bajaradi.",
      tip: "Soddalik uchun to'lov — kenglik: Code 39 keng tarqalganlar orasida eng zich emas va uzun qiymat uzun yorliq beradi. U universal moslik hisobiga yashaydi — hech bir skanerni sozlash kerak emas.",
      faqs: [
        ["Code 39 qanday belgilarni qo'llab-quvvatlaydi?", "0–9 raqamlari, bosh lotin A–Z harflari hamda chiziqcha, nuqta, bo'shliq, dollar, slesh, plyus va foiz belgilari. Kichik harflar Full ASCII kengaytmasini talab qiladi, uni ko'p o'quvchilar sukut bo'yicha yoqmaydi."],
        ["Bugun Code 39 ni ishlatish arziydimi?", "Skanerlarning maksimal mosligi muhim bo'lganda yoki standart talab qilganda oling — mudofaa, avtosanoat, ruxsatnomalar. Yangi ichki tizimlar uchun Code 128 zichroq va odatda yaxshiroq."],
      ],
    },
  },
  "msi-barcode": {
    ru: {
      label: "код полочных ценников",
      what: "MSI, часто называемый MSI Plessey, — числовая символика, которую MSI Data Corporation вывела из более раннего Plessey Code, и сегодня она держится в одной конкретной нише: маркировка полок в рознице. Это штрих-код на ценниковой планке под товаром, а не на самом товаре. Сотрудники обходят зал со сканером и считывают полочные ярлыки, чтобы считать выкладку, запускать пополнение и менять цены.",
      tip: "Собственной контрольной суммы у MSI нет, а необязательные контрольные цифры по модулю 10 или 11 выбирает прикладной уровень — поэтому формат и остаётся внутри закрытых систем учёта, не выходя на потребительскую упаковку.",
      faqs: [
        ["Где применяется MSI?", "Почти исключительно на полочных ярлыках в рознице — инвентаризация, автозаказ и переоценка внутри собственной системы одной сети."],
        ["Стоит ли брать MSI для нового проекта?", "Только если вы подстраиваетесь под существующее оборудование полочной маркировки, которое его ожидает. Для всего нового Code 128 плотнее, самопроверяемый и куда шире поддерживается."],
      ],
    },
    uz: {
      label: "javon narx yorliqlari kodi",
      what: "MSI, ko'pincha MSI Plessey deb ataladi — MSI Data Corporation avvalgi Plessey Code dan chiqargan raqamli simvologiya bo'lib, bugun bitta aniq sohada saqlanib qolgan: chakana savdoda javonlarni belgilash. Bu tovarning o'zidagi emas, uning ostidagi narx reykasidagi shtrix kod. Xodimlar zalni skaner bilan aylanib, javon yorliqlarini o'qiydi — joylashuvni sanash, to'ldirishni ishga tushirish va narxni o'zgartirish uchun.",
      tip: "MSI ning o'z nazorat yig'indisi yo'q, modul 10 yoki 11 bo'yicha ixtiyoriy nazorat raqamlarini esa amaliy daraja tanlaydi — shu sababli format yopiq hisob tizimlari ichida qolib, iste'mol o'ramiga chiqmaydi.",
      faqs: [
        ["MSI qayerda ishlatiladi?", "Deyarli faqat chakana savdodagi javon yorliqlarida — bitta tarmoqning o'z tizimi ichida inventarizatsiya, avtomatik buyurtma va narxni qayta belgilash."],
        ["Yangi loyiha uchun MSI ni olish kerakmi?", "Faqat uni kutadigan mavjud javon belgilash uskunasiga moslashayotgan bo'lsangiz. Qolgan hamma yangi ish uchun Code 128 zichroq, o'zini tekshiradigan va ancha keng qo'llab-quvvatlanadi."],
      ],
    },
  },
  pharmacode: {
    ru: {
      label: "фармацевтический контрольный код",
      what: "Pharmacode, известный также как код Laetus, в привычном смысле вообще не штрих-код. Это двоичное число, нарисованное штрихами: тонкий штрих — ноль, толстый — единица, и значение читается как двоичная последовательность, а не декодируется знак за знаком. Он несёт одно целое число от 3 до 131070 и больше ничего — ни текста, ни контрольной цифры, ни структуры.",
      tip: "Эта предельная простота и есть смысл: код должен на скорости подтвердить, что вкладыш внутри пачки соответствует самой пачке, читается в обе стороны, терпит огромный разброс плотности краски и работает при печати не чёрным цветом — то есть может прятаться внутри дизайна.",
      faqs: [
        ["Какие числа кодирует Pharmacode?", "Одно целое число от 3 до 131070. Ни текста, ни букв, ни дополнительных полей он не несёт."],
        ["Pharmacode — это код сериализации?", "Нет. Сериализация по европейской директиве о фальсифицированных лекарствах использует GS1 Data Matrix с кодом товара, партией, сроком годности и уникальным серийным номером. Pharmacode — куда более простая линейная метка контроля, и их применяют вместе."],
      ],
    },
    uz: {
      label: "farmatsevtika nazorat kodi",
      what: "Pharmacode, Laetus kodi nomi bilan ham tanilgan, odatiy ma'noda umuman shtrix kod emas. Bu chiziqlar bilan chizilgan ikkilik son: ingichka chiziq — nol, qalin chiziq — bir, qiymat esa belgima-belgi dekodlanmay, ikkilik ketma-ketlik sifatida o'qiladi. U 3 dan 131070 gacha bitta butun sonni olib yuradi, boshqa hech narsani — na matn, na nazorat raqami, na tuzilma.",
      tip: "Ana shu o'ta soddalik uning ma'nosi: kod tezlikda quti ichidagi varaqa qutining o'ziga mos kelishini tasdiqlashi, ikki tomonga o'qilishi, bo'yoq zichligidagi katta tafovutga chidashi va qora bo'lmagan rangda bosilganda ham ishlashi kerak — ya'ni dizayn ichiga yashirinishi mumkin.",
      faqs: [
        ["Pharmacode qanday sonlarni kodlaydi?", "3 dan 131070 gacha bitta butun sonni. U na matn, na harf, na qo'shimcha maydon olib yurmaydi."],
        ["Pharmacode serializatsiya kodimi?", "Yo'q. Yevropaning soxta dorilar bo'yicha direktivasiga ko'ra serializatsiya tovar kodi, partiya, yaroqlilik muddati va noyob seriya raqami bilan GS1 Data Matrix dan foydalanadi. Pharmacode ancha sodda liniya nazorat belgisi va ular birga qo'llaniladi."],
      ],
    },
  },
  codabar: {
    ru: {
      label: "код банков крови и библиотек",
      what: "Codabar разработан в Pitney Bowes в 1972 году и иногда встречается под именами Monarch или NW-7. Он кодирует десять цифр плюс знаки дефис, доллар, двоеточие, слэш, точку и плюс, а обрамляется одним из четырёх стартовых и стоповых знаков — A, B, C или D, — которыми приложения обозначают тип записи. Его главное достоинство в том, что он дискретный и самопроверяемый.",
      tip: "Каждый знак стоит отдельно, с промежутком между знаками, и сама структура ловит большинство ошибок подстановки без контрольной цифры — поэтому формат прижился там, где неверное считывание имеет реальные последствия.",
      faqs: [
        ["Что означают знаки A, B, C и D?", "Это метки старта и стопа. Смысл сочетанию присваивает приложение — библиотека может использовать одну пару для читательских билетов и другую для изданий, — чтобы считыватель различал типы записей."],
        ["Почему Codabar до сих пор в банках крови?", "Американская комиссия по крови стандартизовала именно его, он самопроверяемый без контрольной цифры, а заменить проверенный парк считывателей и систем маркировки дорого."],
      ],
    },
    uz: {
      label: "qon banklari va kutubxonalar kodi",
      what: "Codabar 1972 yilda Pitney Bowes da ishlab chiqilgan va ba'zan Monarch yoki NW-7 nomlari bilan uchraydi. U o'nta raqam hamda chiziqcha, dollar, ikki nuqta, slesh, nuqta va plyus belgilarini kodlaydi, atrofi esa to'rtta start va stop belgisidan biri bilan — A, B, C yoki D — o'raladi, ilovalar shular bilan yozuv turini bildiradi. Uning asosiy fazilati diskret va o'zini tekshiradigan bo'lishida.",
      tip: "Har bir belgi alohida, belgilar orasida oraliq bilan turadi va tuzilmaning o'zi nazorat raqamisiz ham almashtirish xatolarining ko'pini tutadi — shuning uchun format noto'g'ri o'qish real oqibatga olib keladigan joylarda o'rnashib qolgan.",
      faqs: [
        ["A, B, C va D belgilari nimani bildiradi?", "Bular start va stop belgilari. Kombinatsiyaga ma'noni ilova beradi — kutubxona bir juftlikni o'quvchi chiptalari, boshqasini nashrlar uchun ishlatishi mumkin — shunda o'quvchi yozuv turlarini ajratadi."],
        ["Nega Codabar hanuz qon banklarida?", "Amerika qon komissiyasi aynan uni standartlashtirgan, u nazorat raqamisiz o'zini tekshiradi, sinovdan o'tgan o'quvchilar va belgilash tizimlari parkini almashtirish esa qimmat."],
      ],
    },
  },
};

/* Shared closing FAQs — the trust questions every visitor asks. */
const COMMON: Record<Lang, { q: string; a: string }[]> = {
  ru: [
    { q: "Генератор штрих-кодов бесплатный?", a: "Да — неограниченно, без водяного знака, без регистрации и без карты. Готовое изображение остаётся вашим навсегда." },
    { q: "Загружаются ли мои данные на сервер?", a: "Нет. Штрих-код целиком рисуется в вашем браузере — введённое значение никуда не отправляется." },
    { q: "Что скачивать для печати — PNG или SVG?", a: "SVG: это вектор, поэтому штрихи остаются идеально резкими при любом физическом размере и в типографии. PNG берите для документа, презентации или экрана." },
  ],
  uz: [
    { q: "Shtrix kod generatori bepulmi?", a: "Ha — cheklovsiz, suv belgisisiz, ro'yxatdan o'tmasdan va kartasiz. Tayyor rasm abadiy sizniki bo'lib qoladi." },
    { q: "Ma'lumotlarim serverga yuklanadimi?", a: "Yo'q. Shtrix kod to'liq brauzeringizda chiziladi — kiritilgan qiymat hech qayerga yuborilmaydi." },
    { q: "Bosma uchun nima yuklab olish kerak — PNG yoki SVG?", a: "SVG: bu vektor, shuning uchun chiziqlar istalgan jismoniy o'lchamda va bosmaxonada mukammal aniq qoladi. PNG ni hujjat, taqdimot yoki ekran uchun oling." },
  ],
};

/** What to type — differs for 2D (free text) vs digit-only vs text symbologies. */
const INPUT_STEP: Record<"2d" | "numericChecked" | "numeric" | "text", Record<Lang, string>> = {
  "2d": {
    ru: "Двумерные коды принимают любой текст — запись, ссылку, идентификатор. Ограничения «только цифры» здесь нет.",
    uz: "Ikki o'lchovli kodlar istalgan matnni qabul qiladi — yozuv, havola, identifikator. Bu yerda «faqat raqam» cheklovi yo'q.",
  },
  numericChecked: {
    ru: "Введите цифры — проверка на лету покажет, сколько знаков ждёт формат, а контрольную цифру можно не вводить: она посчитается автоматически.",
    uz: "Raqamlarni kiriting — jonli tekshiruv format nechta belgi kutayotganini ko'rsatadi, nazorat raqamini esa kiritmasangiz ham bo'ladi: u avtomatik hisoblanadi.",
  },
  numeric: {
    ru: "Введите цифры — длина здесь свободная, поэтому вводите значение целиком, включая контрольный знак, если он предусмотрен вашей схемой нумерации.",
    uz: "Raqamlarni kiriting — bu yerda uzunlik erkin, shuning uchun qiymatni to'liq kiriting, agar raqamlash sxemangizda nazorat belgisi bo'lsa, uni ham qo'shing.",
  },
  text: {
    ru: "Введите значение — буквы, цифры и поддерживаемые знаки, например артикул, инвентарный номер или код места.",
    uz: "Qiymatni kiriting — harflar, raqamlar va qo'llab-quvvatlanadigan belgilar, masalan artikul, inventar raqami yoki joy kodi.",
  },
};

export type LocBarcode = {
  title: string; h1: string; desc: string; intro: string; about: string;
  keywords: string[];
  steps: [string, string][];
  faqs: { q: string; a: string }[];
};

const kindOf = (t: BarcodeType): "2d" | "numericChecked" | "numeric" | "text" =>
  t.family === "2D codes" ? "2d"
    : NUMERIC_CHECKED.has(t.slug) ? "numericChecked"
    : NUMERIC_PLAIN.has(t.slug) ? "numeric"
    : "text";

export function locBarcode(t: BarcodeType, lang: Lang): LocBarcode {
  const c = C[t.slug][lang];
  const about = `${c.what} ${c.tip}`;
  const faqs = [...c.faqs.map(([q, a]) => ({ q, a })), ...COMMON[lang]];
  const input = INPUT_STEP[kindOf(t)][lang];

  if (lang === "ru") {
    return {
      title: `Генератор ${t.name} — создать штрих-код онлайн бесплатно`,
      h1: `Генератор ${t.name}`,
      desc: `Создайте штрих-код ${t.name} онлайн и бесплатно — ${c.label}. Скачайте чёткий PNG или векторный SVG для печати. Без регистрации, всё считается в браузере.`,
      intro: `${t.name} — ${c.label}. Введите значение и скачайте готовый символ в PNG или SVG.`,
      about,
      keywords: [
        `генератор ${t.name}`, `${t.name} штрих код`, `создать ${t.name} онлайн`,
        `${t.name} генератор бесплатно`, "генератор штрих кодов", c.label,
      ],
      steps: [
        ["Введите значение", input],
        ["Настройте вид", "Задайте цвет штрихов и высоту, при необходимости отключите подпись под кодом. Предпросмотр обновляется на лету."],
        ["Скачайте PNG или SVG", "SVG — для типографии и этикеток, PNG — для документа или экрана."],
      ],
      faqs,
    };
  }
  return {
    title: `${t.name} generatori — shtrix kodni onlayn bepul yarating`,
    h1: `${t.name} generatori`,
    desc: `${t.name} shtrix kodini onlayn va bepul yarating — ${c.label}. Aniq PNG yoki bosma uchun vektor SVG yuklab oling. Ro'yxatdan o'tmasdan, hammasi brauzerda hisoblanadi.`,
    intro: `${t.name} — ${c.label}. Qiymatni kiriting va tayyor belgini PNG yoki SVG da yuklab oling.`,
    about,
    keywords: [
      `${t.name} generatori`, `${t.name} shtrix kod`, `${t.name} onlayn yaratish`,
      `${t.name} bepul generator`, "shtrix kod generatori", c.label,
    ],
    steps: [
      ["Qiymatni kiriting", input],
      ["Ko'rinishini sozlang", "Chiziqlar rangi va balandligini belgilang, kerak bo'lsa kod ostidagi yozuvni o'chiring. Ko'rib chiqish jonli yangilanadi."],
      ["PNG yoki SVG yuklab oling", "SVG — bosmaxona va yorliqlar uchun, PNG — hujjat yoki ekran uchun."],
    ],
    faqs,
  };
}

/** Small UI dictionary for the localized page chrome. */
export function barcodeUI(lang: Lang) {
  return lang === "ru"
    ? { home: "Главная", free: "Бесплатно · без регистрации · всё в браузере", how: "Как это сделать", faq: "Частые вопросы", other: "Другие типы штрих-кодов", en: "English version", all: "Все 13 типов", qr: "Генератор QR-кодов" }
    : { home: "Bosh sahifa", free: "Bepul · ro'yxatdan o'tmasdan · hammasi brauzerda", how: "Qanday qilinadi", faq: "Ko'p so'raladigan savollar", other: "Boshqa shtrix kod turlari", en: "English version", all: "Barcha 13 turi", qr: "QR kod generatori" };
}

/** Only symbologies we have written localized copy for (all 13 qualify). */
export const LOC_BARCODE_TYPES = BARCODE_TYPES.filter((t) => C[t.slug]);

/** One-line "what this format is for", reused as the hub card subtitle. */
export const barcodeLabel = (slug: string, lang: Lang) => C[slug]?.[lang].label ?? "";

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
