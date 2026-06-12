"use client";

import { useEffect, useState } from "react";
import { supabaseBrowser } from "@/lib/supabase-browser";
import { FiStar, FiSend } from "react-icons/fi";

type Review = {
  id: string | number;
  name: string;
  rating: number;
  comment: string;
  created_at: string;
};

const T = {
  en: {
    title: "What our users say",
    subtitle: "Leave a review and help QRix grow",
    name: "Your name",
    comment: "Share your experience...",
    send: "Submit Review",
    sending: "Sending...",
    thanks: "Thank you for your review! 💜",
    empty: "Be the first to leave a review!",
    rating: "Your rating",
  },
  ru: {
    title: "Отзывы пользователей",
    subtitle: "Оставьте отзыв и помогите QRix расти",
    name: "Ваше имя",
    comment: "Поделитесь впечатлением...",
    send: "Отправить отзыв",
    sending: "Отправка...",
    thanks: "Спасибо за отзыв! 💜",
    empty: "Будьте первым, кто оставит отзыв!",
    rating: "Ваша оценка",
  },
  uz: {
    title: "Фойдаланувчилар фикри",
    subtitle: "Отзив қолдиринг ва QRix ўсишига ёрдам беринг",
    name: "Исмингиз",
    comment: "Таассуротингизни ёзинг...",
    send: "Отзив юбориш",
    sending: "Юборилмоқда...",
    thanks: "Отзивингиз учун раҳмат! 💜",
    empty: "Биринчи бўлиб отзив қолдиринг!",
    rating: "Баҳонгиз",
  },
};

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

export default function ReviewsSection({ lang }: { lang: "en" | "ru" | "uz" }) {
  const t = T[lang] || T.en;
  const [reviews, setReviews] = useState<Review[]>([]);
  const [name, setName] = useState("");
  const [comment, setComment] = useState("");
  const [rating, setRating] = useState(5);
  const [sending, setSending] = useState(false);
  const [thanks, setThanks] = useState(false);
  const [useLocal, setUseLocal] = useState(false);

  // Юклаш: аввал Supabase, бўлмаса localStorage
  useEffect(() => {
    (async () => {
      const { data, error } = await supabaseBrowser
        .from("reviews")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(6);
      if (error) {
        setUseLocal(true);
        try {
          setReviews(JSON.parse(localStorage.getItem("qrix-reviews") || "[]").slice(0, 6));
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
        // Жадвал йўқ — localStorage'га ўтамиз
        setUseLocal(true);
        const all = [newReview, ...JSON.parse(localStorage.getItem("qrix-reviews") || "[]")];
        localStorage.setItem("qrix-reviews", JSON.stringify(all.slice(0, 50)));
      }
    } else {
      const all = [newReview, ...JSON.parse(localStorage.getItem("qrix-reviews") || "[]")];
      localStorage.setItem("qrix-reviews", JSON.stringify(all.slice(0, 50)));
    }

    setReviews((prev) => [newReview, ...prev].slice(0, 6));
    setName("");
    setComment("");
    setRating(5);
    setSending(false);
    setThanks(true);
    setTimeout(() => setThanks(false), 3500);
  };

  return (
    <section className="max-w-7xl mx-auto px-5 lg:px-8 py-20" id="reviews">
      <div className="text-center mb-12">
        <h2 className="font-display text-3xl lg:text-4xl font-bold" style={{ color: "var(--text)" }}>
          {t.title.split(" ").slice(0, -1).join(" ")}{" "}
          <span style={{ background: "var(--grad-text)", WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent" }}>
            {t.title.split(" ").slice(-1)}
          </span>
        </h2>
        <p className="mt-2 text-sm" style={{ color: "var(--text-muted)" }}>{t.subtitle}</p>
      </div>

      <div className="grid lg:grid-cols-[380px_1fr] gap-8 items-start">
        {/* Форма */}
        <div className="qx-card p-6 lg:sticky lg:top-24">
          <div className="mb-4">
            <label className="block text-xs font-semibold mb-2" style={{ color: "var(--text-muted)" }}>{t.rating}</label>
            <Stars value={rating} onChange={setRating} size={24} />
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

        {/* Отзив карталари */}
        <div className="grid sm:grid-cols-2 gap-4">
          {reviews.length === 0 && (
            <div
              className="sm:col-span-2 py-16 text-center rounded-2xl text-sm"
              style={{ background: "var(--surface-hover)", border: "1px dashed var(--border)", color: "var(--text-muted)" }}
            >
              ⭐ {t.empty}
            </div>
          )}
          {reviews.map((r, i) => (
            <div key={r.id} className={`qx-card qx-card-lift qx-rise qx-rise-${(i % 4) + 1} p-5`}>
              <div className="flex items-center gap-3 mb-3">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold uppercase shrink-0"
                  style={{ background: `linear-gradient(135deg, hsl(${(r.name.length * 47) % 360},65%,55%), hsl(${(r.name.length * 47 + 60) % 360},65%,45%))` }}
                >
                  {r.name.slice(0, 2)}
                </div>
                <div className="min-w-0">
                  <div className="text-sm font-bold truncate" style={{ color: "var(--text)" }}>{r.name}</div>
                  <Stars value={r.rating} size={12} />
                </div>
                <div className="ml-auto text-[10px] shrink-0" style={{ color: "var(--text-faint)" }}>
                  {new Date(r.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                </div>
              </div>
              <p className="text-sm leading-relaxed" style={{ color: "var(--text-muted)" }}>{r.comment}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
