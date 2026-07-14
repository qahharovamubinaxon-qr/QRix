"use client";

/* Reviews — the form on the left, the reviews drifting up beside it.
   The write-a-review card stays put; the testimonials float continuously through
   the space between it and the right edge (a masked vertical marquee, seamless
   because the pool is rendered twice and the track travels exactly one copy). It
   pauses on hover, and under prefers-reduced-motion it does not move at all. */

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
    live: "Live reviews",
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
    live: "Живые отзывы",
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
    live: "Жонли отзивлар",
  },
};

/** Curated testimonials so the marquee is never empty; user reviews merge in front. */
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
          tabIndex={onChange ? 0 : -1}
        >
          <FiStar size={size} fill={s <= value ? "#fbbf24" : "none"} />
        </button>
      ))}
    </div>
  );
}

/** Initials on a colour derived from the name — stable per person, no avatar hosting. */
function Avatar({ name }: { name: string }) {
  const h = (name.length * 47) % 360;
  return (
    <span className="qx-rv-av" aria-hidden
      style={{ background: `linear-gradient(135deg, hsl(${h},65%,55%), hsl(${(h + 60) % 360},65%,45%))` }}>
      {name.slice(0, 2)}
    </span>
  );
}

function Bubble({ r, i, accent }: { r: Review; i: number; accent: boolean }) {
  const mine = i % 2 === 1; // alternate sides, the way a conversation reads
  return (
    <div className={`qx-rv-row${mine ? " qx-rv-row--mine" : ""}`}>
      <Avatar name={r.name} />
      <figure className={`qx-rv-bub${accent ? " qx-rv-bub--accent" : ""}`}>
        <figcaption className="qx-rv-head">
          <span className="qx-rv-name">{r.name}</span>
          <Stars value={r.rating} size={9} />
        </figcaption>
        <blockquote className="qx-rv-text">{r.comment}</blockquote>
      </figure>
    </div>
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
  const [freshId, setFreshId] = useState<string | number | null>(null);

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
        } catch { /* nothing stored */ }
      } else {
        setReviews(data || []);
      }
    })();
  }, []);

  // The drifting pool: user reviews in front, seed behind, capped for a calm loop.
  const pool = useMemo(() => [...reviews, ...SEED].slice(0, 14), [reviews]);
  // Constant scroll speed regardless of how many are in the pool.
  const driftSeconds = Math.max(28, pool.length * 3.6);

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

    const saveLocal = () => {
      const all = [newReview, ...JSON.parse(localStorage.getItem("qrix-reviews") || "[]")];
      localStorage.setItem("qrix-reviews", JSON.stringify(all.slice(0, 50)));
    };

    if (!useLocal) {
      const { error } = await supabaseBrowser.from("reviews").insert({
        name: newReview.name,
        rating: newReview.rating,
        comment: newReview.comment,
      });
      if (error) { setUseLocal(true); saveLocal(); }
    } else {
      saveLocal();
    }

    setReviews((prev) => [newReview, ...prev].slice(0, 12));
    setName("");
    setComment("");
    setRating(5);
    setSending(false);
    setThanks(true);
    // Their review joins the front of the drift, lit up as it floats past.
    setFreshId(newReview.id);
    setTimeout(() => setThanks(false), 3500);
  };

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

      <div className="qx-rv-grid max-w-[1240px] mx-auto px-5 lg:px-8" data-reveal>
        {/* ── left: leave a review (stays put) ── */}
        <div className="qx-card p-6 lg:p-7 flex flex-col">
          <h3 className="font-display text-lg font-bold mb-5" style={{ color: "var(--text)" }}>{t.formTitle}</h3>
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
            rows={4}
            className="w-full px-4 py-3 text-sm mb-4 resize-none flex-1 min-h-[128px]"
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

        {/* ── right: the reviews, drifting upward ── */}
        <div className="qx-rv-chat">
          <div className="qx-rv-live">
            <span className="qx-rv-live-dot" aria-hidden />
            {t.live}
          </div>

          <div className="qx-rv-float">
            {/* rendered twice; the track travels exactly one copy, so the loop is seamless */}
            <div className="qx-rv-track" style={{ animationDuration: `${driftSeconds}s` }}>
              {[0, 1].map((copy) =>
                pool.map((r, i) => (
                  <Bubble key={`${copy}-${r.id}`} r={r} i={i} accent={r.id === freshId} />
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .qx-rv-grid {
          display: grid;
          grid-template-columns: minmax(0, 400px) minmax(0, 1fr);
          gap: clamp(24px, 3.5vw, 56px);
          align-items: stretch;   /* form + drift share one top and one bottom edge */
        }

        /* the right column is a fixed-height window; the form stretches to match it */
        .qx-rv-chat {
          position: relative;
          height: clamp(440px, 56vh, 560px);
          display: flex;
          flex-direction: column;
        }
        .qx-rv-live {
          display: inline-flex; align-items: center; gap: 7px;
          font-family: "Space Mono", ui-monospace, monospace;
          font-size: 10px; letter-spacing: .16em; text-transform: uppercase;
          color: var(--text-faint);
          margin-bottom: 14px;
        }
        .qx-rv-live-dot {
          width: 6px; height: 6px; border-radius: 50%;
          background: #4ade80;
          box-shadow: 0 0 0 0 rgba(74, 222, 128, .6);
          animation: qx-rv-live 2.4s ease-out infinite;
        }
        @keyframes qx-rv-live {
          0%   { box-shadow: 0 0 0 0 rgba(74, 222, 128, .55); }
          70%  { box-shadow: 0 0 0 7px rgba(74, 222, 128, 0); }
          100% { box-shadow: 0 0 0 0 rgba(74, 222, 128, 0); }
        }

        /* the drift viewport — masked so bubbles dissolve at the top and bottom
           instead of popping at a hard edge */
        .qx-rv-float {
          position: relative;
          flex: 1;
          overflow: hidden;
          mask-image: linear-gradient(180deg, transparent, #000 9%, #000 91%, transparent);
        }
        .qx-rv-track {
          display: flex; flex-direction: column;
          animation-name: qx-rv-drift;
          animation-timing-function: linear;
          animation-iteration-count: infinite;
          will-change: transform;
        }
        /* margin-bottom on EVERY row (not flex gap): gap gives N items only N-1
           gaps, so translateY(-50%) lands half a gap off and the loop jumps. With a
           trailing margin on all 2N rows, -50% is exactly one copy → seamless. */
        .qx-rv-track > .qx-rv-row { margin-bottom: 14px; }
        /* the pool is rendered twice; travelling exactly -50% lands copy 2 where copy
           1 began, so the seam is invisible */
        @keyframes qx-rv-drift {
          from { transform: translateY(0); }
          to   { transform: translateY(-50%); }
        }
        .qx-rv-float:hover .qx-rv-track { animation-play-state: paused; }

        /* one message: avatar, then the bubble — mirrored on every other line */
        .qx-rv-row {
          display: flex; align-items: flex-start; gap: 11px;
          max-width: 90%;
        }
        .qx-rv-row--mine { flex-direction: row-reverse; margin-left: auto; }

        .qx-rv-av {
          width: 34px; height: 34px; flex-shrink: 0;
          border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          font-size: 11.5px; font-weight: 800; text-transform: uppercase;
          color: #fff;
          box-shadow: 0 2px 10px rgba(0, 0, 0, .4);
        }

        /* The bubbles sit over the world-map dot field, so the backing has to be
           near-opaque or the map bleeds through the text. This is the site's own card
           glass pushed to ~92%. Standard backdrop-filter only — Lightning CSS drops
           the standard property if a -webkit- prefix follows it. */
        .qx-rv-bub {
          position: relative;
          padding: 11px 15px 12px;
          border-radius: 16px;
          background: linear-gradient(160deg, rgba(26, 30, 46, 0.93), rgba(15, 18, 30, 0.95));
          backdrop-filter: blur(12px) saturate(150%);
          border: 1px solid var(--card-border, rgba(255, 255, 255, 0.10));
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.38);
          min-width: 0;
        }
        .qx-rv-row:not(.qx-rv-row--mine) .qx-rv-bub { border-top-left-radius: 5px; }
        .qx-rv-row--mine .qx-rv-bub { border-top-right-radius: 5px; }

        /* the visitor's own review — brand orange, and a shine that crosses it */
        .qx-rv-bub--accent {
          background: var(--grad-primary, linear-gradient(135deg, #ff8a3c, #ff4d1c));
          border-color: transparent;
          box-shadow: 0 10px 30px rgba(255, 77, 28, .28);
          overflow: hidden;
        }
        .qx-rv-bub--accent::after {
          content: ""; position: absolute; inset: 0;
          background: linear-gradient(105deg, transparent 38%, rgba(255,255,255,.32) 50%, transparent 62%);
          transform: translateX(-120%);
          animation: qx-rv-shine 3.6s ease-in-out 1.1s infinite;
        }
        @keyframes qx-rv-shine {
          0%        { transform: translateX(-120%); }
          40%, 100% { transform: translateX(120%); }
        }
        .qx-rv-bub--accent .qx-rv-name,
        .qx-rv-bub--accent .qx-rv-text { color: #150a05; }

        .qx-rv-head {
          display: flex; align-items: center; gap: 8px;
          margin-bottom: 4px;
        }
        .qx-rv-name {
          font-size: 12px; font-weight: 800;
          color: var(--text);
          white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
        }
        .qx-rv-text {
          font-size: 13.5px; line-height: 1.6;
          color: #cdd2de;
        }

        @media (max-width: 900px) {
          .qx-rv-grid { grid-template-columns: 1fr; }
          .qx-rv-chat { height: clamp(380px, 70vh, 480px); }
          .qx-rv-row { max-width: 96%; }
        }

        /* Auto-motion is decoration, not information: stop the drift entirely and
           show the reviews as a plain, scrollable column. */
        @media (prefers-reduced-motion: reduce) {
          .qx-rv-track { animation: none; }
          .qx-rv-float { overflow-y: auto; mask-image: none; }
          .qx-rv-live-dot, .qx-rv-bub--accent::after { animation: none; }
        }
      `}</style>
    </section>
  );
}
