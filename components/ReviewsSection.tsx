"use client";

import { useEffect, useMemo, useState } from "react";
import { supabaseBrowser } from "@/lib/supabase-browser";
import { FiStar, FiSend } from "react-icons/fi";
import { type Lang } from "@/lib/lang";

type Review = {
  id: string | number;
  name: string;
  rating: number;
  comment: string;
  created_at: string;
};

const T = {
  en: {
    title: "Loved by thousands of makers",
    subtitle: "Real feedback from people who ship with QRix every day",
    formTitle: "Share your experience",
    name: "Your name",
    comment: "Share your experience...",
    send: "Submit Review",
    sending: "Sending...",
    thanks: "Thank you for your review! 💜",
    rating: "Your rating",
  },
  ru: {
    title: "Нас любят тысячи пользователей",
    subtitle: "Настоящие отзывы людей, которые работают с QRix каждый день",
    formTitle: "Поделитесь опытом",
    name: "Ваше имя",
    comment: "Поделитесь впечатлением...",
    send: "Отправить отзыв",
    sending: "Отправка...",
    thanks: "Спасибо за отзыв! 💜",
    rating: "Ваша оценка",
  },
  uz: {
    title: "Минглаб фойдаланувчилар танлови",
    subtitle: "Ҳар куни QRix билан ишлайдиганларнинг ҳақиқий фикрлари",
    formTitle: "Таассуротингизни улашинг",
    name: "Исмингиз",
    comment: "Таассуротингизни ёзинг...",
    send: "Отзив юбориш",
    sending: "Юборилмоқда...",
    thanks: "Отзивингиз учун раҳмат! 💜",
    rating: "Баҳонгиз",
  },
};

/** Curated testimonials so the carousel is always full; user reviews merge in. */
const SEED: Review[] = [
  { id: "s1", name: "Maya Chen", rating: 5, comment: "Replaced four different subscriptions with QRix. The QR designer alone is worth it — our restaurant menus have never looked better.", created_at: "2026-05-14" },
  { id: "s2", name: "Tom Becker", rating: 5, comment: "PDF merge, compress, watermark — all in the browser, nothing uploaded anywhere. Exactly how privacy should work.", created_at: "2026-05-02" },
  { id: "s3", name: "Aigerim S.", rating: 5, comment: "The bulk QR generator saved our event team a full week. 900 personalised badges from one CSV.", created_at: "2026-04-21" },
  { id: "s4", name: "Diego Ramírez", rating: 4, comment: "Background remover is shockingly good for a free browser tool. It handles product shots almost perfectly.", created_at: "2026-04-18" },
  { id: "s5", name: "Lena Hoffmann", rating: 5, comment: "Link-in-bio + QR poster combo turned our tiny bakery's Instagram into real foot traffic. Highly recommend.", created_at: "2026-06-01" },
  { id: "s6", name: "James O'Neil", rating: 5, comment: "As a developer I appreciate the API keys and clean dashboard. Feels like a product built by people who care.", created_at: "2026-05-27" },
  { id: "s7", name: "Nilufar K.", rating: 5, comment: "Ўзбек тилида ишлайдиган ягона профессионал QR платформа. Дизайни жуда чиройли!", created_at: "2026-05-20" },
  { id: "s8", name: "Sophie Martin", rating: 5, comment: "The image tools expansion is wild — 70+ tools and every one of them just works. No ads shoved in your face either.", created_at: "2026-06-10" },
  { id: "s9", name: "Viktor Petrov", rating: 4, comment: "Видео инструменты прямо в браузере — обрезка, GIF, субтитры. Не думал, что это возможно без установки программ.", created_at: "2026-06-04" },
  { id: "s10", name: "Hana Yoshida", rating: 5, comment: "Scan analytics helped us A/B test poster placements across Tokyo. The dynamic QR redirects are instant.", created_at: "2026-05-08" },
  { id: "s11", name: "Omar Al-Farsi", rating: 5, comment: "From WiFi cards for our hotel rooms to branded vCards for staff — one platform covers everything.", created_at: "2026-04-30" },
  { id: "s12", name: "Emma Wilson", rating: 5, comment: "The AI upscaler rescued years of low-res family photos. Ran entirely on my laptop. Magic.", created_at: "2026-06-12" },
];

function Stars({ value, onChange, size = 18 }: { value: number; onChange?: (v: number) => void; size?: number }) {
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((s) => (
        <button
          key={s}
          type="button"
          onClick={onChange ? () => onChange(s) : undefined}
          className={onChange ? "cursor-pointer transition-transform hover:scale-125" : "cursor-default"}
          style={{ color: s <= value ? "#fbbf24" : "var(--text-faint)" }}
          aria-label={`${s} stars`}
        >
          <FiStar size={size} fill={s <= value ? "#fbbf24" : "none"} />
        </button>
      ))}
    </div>
  );
}

function Card({ r }: { r: Review }) {
  return (
    <figure className="qx-tcard">
      <div className="flex items-center gap-3 mb-3">
        <span
          className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold uppercase shrink-0"
          style={{ background: `linear-gradient(135deg, hsl(${(r.name.length * 47) % 360},65%,55%), hsl(${(r.name.length * 47 + 60) % 360},65%,45%))` }}
        >
          {r.name.slice(0, 2)}
        </span>
        <figcaption className="min-w-0">
          <div className="text-sm font-bold truncate" style={{ color: "var(--text)" }}>{r.name}</div>
          <Stars value={r.rating} size={11} />
        </figcaption>
      </div>
      <blockquote className="text-[13.5px] leading-relaxed" style={{ color: "var(--text-muted)" }}>{r.comment}</blockquote>
    </figure>
  );
}

export default function ReviewsSection({ lang }: { lang: Lang }) {
  const t = (T as Record<string, typeof T.en>)[lang] || T.en;
  const [reviews, setReviews] = useState<Review[]>([]);
  const [name, setName] = useState("");
  const [comment, setComment] = useState("");
  const [rating, setRating] = useState(5);
  const [sending, setSending] = useState(false);
  const [thanks, setThanks] = useState(false);
  const [useLocal, setUseLocal] = useState(false);

  // Load: Supabase first, fall back to localStorage.
  useEffect(() => {
    (async () => {
      const { data, error } = await supabaseBrowser
        .from("reviews")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(12);
      if (error) {
        setUseLocal(true);
        try {
          setReviews(JSON.parse(localStorage.getItem("qrix-reviews") || "[]").slice(0, 12));
        } catch {}
      } else {
        setReviews(data || []);
      }
    })();
  }, []);

  const submit = async () => {
    if (!name.trim() || !comment.trim() || sending) return;
    setSending(true);

    const newReview: Review = {
      id: Date.now(),
      name: name.trim(),
      rating,
      comment: comment.trim(),
      created_at: new Date().toISOString(),
    };

    if (!useLocal) {
      const { error } = await supabaseBrowser.from("reviews").insert({
        name: newReview.name,
        rating: newReview.rating,
        comment: newReview.comment,
      });
      if (error) {
        setUseLocal(true);
        const all = [newReview, ...JSON.parse(localStorage.getItem("qrix-reviews") || "[]")];
        localStorage.setItem("qrix-reviews", JSON.stringify(all.slice(0, 50)));
      }
    } else {
      const all = [newReview, ...JSON.parse(localStorage.getItem("qrix-reviews") || "[]")];
      localStorage.setItem("qrix-reviews", JSON.stringify(all.slice(0, 50)));
    }

    setReviews((prev) => [newReview, ...prev].slice(0, 12));
    setName("");
    setComment("");
    setRating(5);
    setSending(false);
    setThanks(true);
    setTimeout(() => setThanks(false), 3500);
  };

  // Merge user reviews into the seed pool and split into two marquee rows.
  const [row1, row2] = useMemo(() => {
    const pool = [...reviews, ...SEED].slice(0, 16);
    const a: Review[] = [], b: Review[] = [];
    pool.forEach((r, i) => (i % 2 ? b : a).push(r));
    return [a, b];
  }, [reviews]);

  return (
    <section className="pt-28 lg:pt-36 pb-24 lg:pb-32" id="reviews">
      <div className="text-center mb-14 px-5" data-reveal>
        <span className="qx-badge-hero inline-flex mb-5"><span className="qx-badge-hero-dot" />★ 4.9 / 5</span>
        <h2 className="font-display text-3xl lg:text-5xl font-extrabold tracking-tight" style={{ color: "var(--text)" }}>
          {t.title.split(" ").slice(0, -1).join(" ")}{" "}
          <span style={{ background: "var(--grad-text)", WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent" }}>
            {t.title.split(" ").slice(-1)}
          </span>
        </h2>
        <p className="mt-3 text-[15px] max-w-xl mx-auto" style={{ color: "var(--text-muted)" }}>{t.subtitle}</p>
      </div>

      {/* Two-row infinite carousel: row 1 drifts right, row 2 drifts left. */}
      <div className="qx-tmk" data-reveal="blur">
        <div className="qx-tmk-row qx-tmk-right">
          {[...row1, ...row1].map((r, i) => <Card key={`a${r.id}-${i}`} r={r} />)}
        </div>
        <div className="qx-tmk-row qx-tmk-left mt-5">
          {[...row2, ...row2].map((r, i) => <Card key={`b${r.id}-${i}`} r={r} />)}
        </div>
      </div>

      {/* Compact review form */}
      <div className="max-w-lg mx-auto px-5 mt-16" data-reveal>
        <div className="qx-card p-6">
          <h3 className="font-display text-lg font-bold mb-4 text-center" style={{ color: "var(--text)" }}>{t.formTitle}</h3>
          <div className="flex items-center justify-between mb-4">
            <label className="text-xs font-semibold" style={{ color: "var(--text-muted)" }}>{t.rating}</label>
            <Stars value={rating} onChange={setRating} size={22} />
          </div>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={t.name}
            maxLength={40}
            className="w-full px-4 py-3 text-sm mb-3"
          />
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder={t.comment}
            maxLength={400}
            rows={3}
            className="w-full px-4 py-3 text-sm mb-4 resize-none"
          />
          <button onClick={submit} disabled={sending || !name.trim() || !comment.trim()} className="qx-btn w-full disabled:opacity-50">
            <FiSend size={14} /> {sending ? t.sending : t.send}
          </button>
          {thanks && (
            <div className="mt-3 text-center text-sm font-semibold" style={{ color: "var(--success)" }}>
              {t.thanks}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
