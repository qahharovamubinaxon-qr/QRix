import { notFound } from "next/navigation";
import Link from "next/link";
import DownloaderClient from "@/components/DownloaderClient";
import { PLATFORMS } from "@/lib/downloader-platforms";
import { pageMeta, jsonLd, breadcrumbLd, softwareAppLd, faqLd } from "@/lib/seo";

/* Oʻzbekcha SEO sahifalari (lotin) — Oʻzbek Google-qidiruvi asosan lotin
   yozuvida: "tiktok video yuklab olish", "instagram reels yuklash" kabi
   soʻrovlar katta hajmli va raqobati zaif. hreflang har sahifani EN/RU
   juftlariga bogʻlaydi. */

type UzCopy = {
  title: string; h1: string; desc: string; intro: string;
  keywords: string[];
  features?: [string, string][];
  faqs?: { q: string; a: string }[];
};

const UZ: Record<string, Partial<UzCopy>> = {
  tiktok: {
    title: "TikTok videoni suv belgisisiz yuklab olish — bepul HD",
    h1: "TikTok videoni suv belgisisiz yuklash",
    desc: "TikTok videolarini suv belgisisiz HD sifatda yoki ovozini MP3 qilib yuklab oling. Bepul, ilovasiz va roʻyxatdan oʻtmasdan.",
    intro: "Istalgan ochiq TikTok videoning havolasini tashlang — logotipsiz HD sifatda saqlang yoki faqat ovozini MP3 qilib oling. vt.tiktok.com qisqa havolalari, telefon va kompyuterda ishlaydi.",
    keywords: ["tiktok video yuklab olish", "tiktok suv belgisisiz", "tiktok yuklash", "tiktokdan video yuklab olish", "tiktok ovozini yuklash", "tik tok video skachat"],
    features: [
      ["Suv belgisisiz", "HD versiya TikTok logotipisiz saqlanadi."],
      ["Ovozi MP3 formatda", "Videoning original ovozini alohida MP3 fayl qilib oling."],
      ["HD va SD", "Toʻliq sifat yoki kichik hajm — oʻzingiz tanlaysiz."],
      ["Ilovasiz", "Hammasi brauzerda — iPhone, Android va PC'da."],
    ],
    faqs: [
      { q: "TikTok videoni suv belgisisiz qanday yuklab olaman?", a: "TikTok'da «Ulashish» orqali havolani nusxalang, uni yuqoriga qoʻying va «Video · HD (no watermark)» ni tanlang — toza MP4 saqlanadi." },
      { q: "Faqat ovozini saqlash mumkinmi?", a: "Ha — Audio boʻlimida original ovozni MP3 qilib saqlang. Trend ovozlar uchun qulay." },
      { q: "vt.tiktok.com qisqa havolalari ishlaydimi?", a: "Ha, qisqa havolalar avtomatik aniqlanadi." },
      { q: "Yopiq (private) videolar yuklanadimi?", a: "Yoʻq, faqat ochiq videolar — yopiq akkauntlar yopiqligicha qoladi." },
    ],
  },
  instagram: {
    title: "Instagram Reels va video yuklab olish — MP4, MP3, rasm",
    h1: "Instagram Reels va videoni yuklash",
    desc: "Instagram Reels, video va rasmlarni HD sifatda yuklab oling yoki ovozini MP3 qilib oling. Bepul onlayn yuklagich, login talab qilmaydi.",
    intro: "Ochiq Reel, video yoki rasm havolasini tashlang — QRix uni asl sifatda saqlaydi, ovozini esa alohida MP3 qilib olish mumkin.",
    keywords: ["instagram reels yuklab olish", "instagramdan video yuklash", "instagram rasm yuklab olish", "reels mp3 yuklash", "instagram yuklagich"],
    faqs: [
      { q: "Reels'ni qanday yuklab olaman?", a: "Reel'ni oching → Ulashish → Havolani nusxalang, uni yuqoriga qoʻying va Video · HD ni tanlang." },
      { q: "Rasm yuklash mumkinmi?", a: "Ha — rasm postlari va karusellar toʻliq sifatda saqlanadi." },
      { q: "Login kerakmi?", a: "Yoʻq. QRix faqat ochiq postlarni oʻqiydi — login shart emas." },
      { q: "Stories ishlaydimi?", a: "Yoʻq, faqat ochiq postlar va Reels." },
    ],
  },
  vk: {
    title: "VK video va kliplarni yuklab olish — bepul MP4",
    h1: "VK'dan video yuklash",
    desc: "VKontakte video va kliplarini MP4 qilib yuklab oling — vk.com va vkvideo.ru qoʻllab-quvvatlanadi. Bepul, loginsiz.",
    intro: "VK ochiq video va kliplarini MP4 qilib saqlang. Ikkala havola ham — vk.com va vkvideo.ru qoʻllab-quvvatlanadi.",
    keywords: ["vk video yuklab olish", "vkontakte video yuklash", "vk klip yuklab olish", "vkvideo yuklash", "vk skachat"],
  },
  ok: {
    title: "OK.ru (Odnoklassniki) videoni yuklab olish — bepul HD",
    h1: "Odnoklassniki (OK.ru) videoni yuklash",
    desc: "OK.ru videolarini MP4 qilib 1080p gacha yuklab oling — bepul onlayn Odnoklassniki yuklagichi, roʻyxatdan oʻtmasdan.",
    intro: "ok.ru/video/… havolasini tashlang — rolikni eng yaxshi sifatda saqlang. Ovozini brauzerning oʻzida MP3 qilib olish mumkin.",
    keywords: ["ok ru video yuklab olish", "odnoklassniki video yuklash", "ok.ru yuklagich", "odnoklassniki skachat"],
  },
  pinterest: {
    title: "Pinterest video va rasmlarni yuklab olish — bepul",
    h1: "Pinterest'dan yuklash",
    desc: "Pinterest video-pinlarini MP4, rasmlarni asl sifatda yuklab oling. pin.it qisqa havolalari qoʻllab-quvvatlanadi.",
    intro: "Istalgan ochiq pin: video MP4, rasm asl sifatda saqlanadi. pin.it qisqa havolalari avtomatik ishlaydi.",
    keywords: ["pinterest video yuklab olish", "pinterest rasm yuklash", "pin.it yuklash", "pinterest yuklagich"],
  },
  soundcloud: {
    title: "SoundCloud musiqasini MP3 qilib yuklab olish — bepul",
    h1: "SoundCloud'ni MP3 qilib yuklash",
    desc: "Ochiq SoundCloud treklarini muqova va nomi bilan MP3 qilib yuklab oling. Bepul va roʻyxatdan oʻtmasdan.",
    intro: "Trek havolasini tashlang — muqova va ijrochini koʻrasiz, Save bosing va oflayn tinglash uchun MP3 oling.",
    keywords: ["soundcloud mp3 yuklab olish", "soundcloud musiqa yuklash", "soundcloud skachat", "saundklaud mp3"],
  },
};

function copyFor(id: string, name: string): UzCopy {
  const o = UZ[id] || {};
  return {
    title: o.title || `${name}'dan video yuklab olish — bepul MP4`,
    h1: o.h1 || `${name}'dan video yuklash`,
    desc: o.desc || `${name}'dan videolarni MP4 qilib bepul yuklab oling — roʻyxatsiz, reklamasiz va suv belgisisiz onlayn yuklagich.`,
    intro: o.intro || `${name} ochiq postining havolasini tashlang — QRix video, audio va rasmlarni topib, asl sifatda brauzerda saqlaydi.`,
    keywords: o.keywords || [`${name.toLowerCase()} video yuklab olish`, `${name.toLowerCase()} yuklash`, `${name.toLowerCase()} yuklagich`, "video yuklab olish bepul"],
    features: o.features || [
      ["Eng yaxshi sifatda MP4", `Video ${name} bergan eng yuqori sifatda saqlanadi.`],
      ["Ovozi MP3 formatda", "Audio yoʻlni alohida saqlash mumkin, mavjud boʻlsa."],
      ["Roʻyxatsiz", "Akkaunt, reklama va suv belgisi yoʻq."],
      ["Telefon va PC", "Istalgan brauzerda ishlaydi — hech narsa oʻrnatmaysiz."],
    ],
    faqs: o.faqs || [
      { q: `${name}'dan videoni qanday yuklab olaman?`, a: "Post havolasini «Ulashish» orqali nusxalang, uni yuqoriga qoʻying va formatni tanlang — MP4, MP3 yoki rasm." },
      { q: "Bepulmi?", a: "Ha — toʻliq bepul, roʻyxatsiz va suv belgisisiz." },
      { q: "Yopiq kontent yuklanadimi?", a: "Yoʻq. Faqat ochiq postlar ishlaydi." },
      { q: "QRix fayllarimni saqlaydimi?", a: "Yoʻq. Fayl toʻgʻridan-toʻgʻri qurilmangizga oʻtadi, QRix hech narsa saqlamaydi." },
    ],
  };
}

export function generateStaticParams() {
  return PLATFORMS.map((p) => ({ platform: p.id }));
}

export async function generateMetadata({ params }: { params: Promise<{ platform: string }> }) {
  const { platform } = await params;
  const p = PLATFORMS.find((x) => x.id === platform);
  if (!p) return {};
  const c = copyFor(p.id, p.name);
  return pageMeta({
    title: c.title, description: c.desc, path: `/uz/downloader/${platform}`, keywords: c.keywords,
    languages: { en: `/downloader/${platform}`, ru: `/ru/downloader/${platform}`, uz: `/uz/downloader/${platform}`, "x-default": `/downloader/${platform}` },
  });
}

export default async function UzPlatformPage({ params }: { params: Promise<{ platform: string }> }) {
  const { platform } = await params;
  const p = PLATFORMS.find((x) => x.id === platform);
  if (!p) notFound();
  const c = copyFor(p.id, p.name);
  const others = PLATFORMS.filter((x) => x.id !== platform);
  const steps: [string, string][] = [
    ["Havolani nusxalang", `${p.name}'da postni oching va «Ulashish» → «Havolani nusxalash» ni bosing.`],
    ["QRix'ga qoʻying", "Yuklagich barcha mavjud versiyalarni darhol topadi."],
    ["Formatni tanlang", "Video (MP4), audio (MP3) yoki rasm — fayl jonli progress bilan saqlanadi."],
  ];

  return (
    <>
      <script type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={jsonLd([
          softwareAppLd(c.title, c.desc, `/uz/downloader/${platform}`),
          breadcrumbLd([{ name: "Bosh sahifa", path: "/" }, { name: "Yuklagich", path: "/uz/downloader" }, { name: p.name, path: `/uz/downloader/${platform}` }]),
          faqLd(c.faqs!),
        ])} />

      <main className="max-w-3xl mx-auto px-5 lg:px-8 pt-10 lg:pt-16 pb-24">
        <nav className="text-[12px] mb-4" style={{ color: "var(--text-faint)" }}>
          <Link href="/" className="hover:underline">Bosh sahifa</Link> <span className="mx-1">›</span>
          <Link href="/uz/downloader" className="hover:underline">Yuklagich</Link> <span className="mx-1">›</span> {p.name}
        </nav>

        <header className="mb-6">
          <div className="flex items-center gap-3 mb-3">
            <span className="w-10 h-10 block shrink-0" aria-hidden dangerouslySetInnerHTML={{ __html: p.svg }} />
            <h1 className="font-display text-3xl lg:text-4xl font-extrabold tracking-tight" style={{ color: "var(--text)" }}>{c.h1}</h1>
          </div>
          <p className="text-[14.5px]" style={{ color: "var(--text-muted)" }}>{c.intro}</p>
        </header>

        <DownloaderClient placeholder={`${p.name} havolasini tashlang…`} />

        <section className="mt-12">
          <h2 className="font-display text-xl font-bold mb-4" style={{ color: "var(--text)" }}>{p.name}'dan qanday yuklab olinadi</h2>
          <ol className="space-y-3">
            {steps.map(([h, body], i) => (
              <li key={h} className="flex gap-3">
                <span className="shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-[12px] font-bold text-white" style={{ background: "var(--grad-primary)" }}>{i + 1}</span>
                <div><b style={{ color: "var(--text)" }}>{h}.</b> <span style={{ color: "var(--text-muted)" }}>{body}</span></div>
              </li>
            ))}
          </ol>
        </section>

        <section className="mt-10">
          <h2 className="font-display text-xl font-bold mb-4" style={{ color: "var(--text)" }}>Nega QRix</h2>
          <div className="grid sm:grid-cols-2 gap-3">
            {c.features!.map(([h, body]) => (
              <div key={h} className="qx-card p-4">
                <h3 className="font-bold text-[14px] mb-1" style={{ color: "var(--text)" }}>{h}</h3>
                <p className="text-[13px]" style={{ color: "var(--text-muted)" }}>{body}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-10">
          <h2 className="font-display text-xl font-bold mb-4" style={{ color: "var(--text)" }}>Savol-javob</h2>
          <div className="space-y-3">
            {c.faqs!.map((f) => (
              <details key={f.q} className="qx-card p-4">
                <summary className="font-bold text-[14px] cursor-pointer" style={{ color: "var(--text)" }}>{f.q}</summary>
                <p className="mt-2 text-[13.5px]" style={{ color: "var(--text-muted)" }}>{f.a}</p>
              </details>
            ))}
          </div>
        </section>

        <section className="mt-10">
          <h2 className="font-display text-xl font-bold mb-4" style={{ color: "var(--text)" }}>Boshqa platformalar</h2>
          <div className="flex flex-wrap gap-2.5">
            {others.map((o) => (
              <Link key={o.id} href={`/uz/downloader/${o.id}`}
                className="inline-flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-full text-[12.5px] font-semibold transition-colors hover:opacity-80"
                style={{ background: "var(--surface-2)", border: "1px solid var(--border)", color: "var(--text)" }}>
                <span className="w-5 h-5 block" aria-hidden dangerouslySetInnerHTML={{ __html: o.svg }} /> {o.name}
              </Link>
            ))}
            <Link href={`/downloader/${platform}`} className="inline-flex items-center px-3 py-1.5 rounded-full text-[12.5px] font-bold"
              style={{ background: "var(--surface-2)", border: "1px solid var(--border-hover)", color: "var(--primary-bright)" }}>
              English version →
            </Link>
          </div>
        </section>
      </main>
    </>
  );
}
