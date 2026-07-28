/* QRix operator identity — the single source of truth for "who created this".
   ---------------------------------------------------------------------------
   Google's quality guidance asks "Who created it?" of every page, and until
   M145 the site could not answer it: /about was four generic paragraphs and the
   site-wide Organization schema carried only a name, a URL and a logo.

   Everything in here is either already published on the site or verifiable in
   this repo. Nothing is invented. The fields the owner must supply personally
   are `null` on purpose and every consumer treats null as "omit", so filling
   one in is a one-file edit that propagates to /about, the site-wide
   Organization schema and every article byline at once — and leaving one null
   never renders an empty label or an "undefined" in JSON-LD.

   Do NOT guess the null fields. A fabricated legal name, photo or social
   profile is worse than a missing one: E-E-A-T signals that don't check out are
   exactly what the fabrication rule (M143) exists to prevent. */

import { SITE_NAME, SITE_URL } from "@/lib/seo";
import { TG_CHANNEL_URL, TG_BOT_URL } from "@/lib/social";

/** Personal Telegram handle — already published on /about before M145. */
export const OPERATOR_TG = "QRix2020";
export const OPERATOR_TG_URL = `https://t.me/${OPERATOR_TG}`;

/** Contact address — already published on /about before M145. Replace with a
 *  domain address (hello@qrixtools.com) when one exists; a domain address is a
 *  stronger trust signal than a free mailbox and is an owner [B] item. */
export const OPERATOR_EMAIL = "musarasulzada@gmail.com";

export type Operator = {
  /** Display name used in bylines. Kept to the name the operator already uses
   *  in this app rather than a fuller form nobody has published. */
  name: string;
  /** Full legal/professional name, once the owner chooses to publish it. */
  fullName: string | null;
  /** One line of who this actually is. Rendered on /about and in schema. */
  role: string;
  email: string;
  telegram: string;
  /** Absolute URL of a real photo. null = no `image` in Person schema. */
  imageUrl: string | null;
  /** Verifiable profiles elsewhere — the strongest single E-E-A-T signal a solo
   *  operator can add, and the one thing this file cannot derive. */
  github: string | null;
  linkedin: string | null;
  x: string | null;
};

export const OPERATOR: Operator = {
  name: "Musa",
  fullName: null,
  role: `Solo developer and maintainer of ${SITE_NAME}`,
  email: OPERATOR_EMAIL,
  telegram: OPERATOR_TG_URL,
  imageUrl: null,
  github: null,
  linkedin: null,
  x: null,
};

/** Everything about the operator that is a public, checkable URL. */
export function operatorSameAs(): string[] {
  return [OPERATOR.telegram, OPERATOR.github, OPERATOR.linkedin, OPERATOR.x].filter(
    (u): u is string => typeof u === "string" && u.length > 0,
  );
}

/** Public URLs that belong to the SITE rather than the person. */
export function organizationSameAs(): string[] {
  return [TG_CHANNEL_URL, TG_BOT_URL].filter((u) => u.length > 0);
}

/** The Person node. Referenced by @id from Organization.founder and from every
 *  Article author, so the graph has ONE person in it rather than a copy per
 *  page — which is what lets a search engine treat the bylines as the same
 *  entity. */
export function personLd(): Record<string, unknown> {
  const sameAs = operatorSameAs();
  return {
    "@context": "https://schema.org",
    "@type": "Person",
    "@id": `${SITE_URL}/about#operator`,
    name: OPERATOR.fullName || OPERATOR.name,
    ...(OPERATOR.fullName && OPERATOR.fullName !== OPERATOR.name
      ? { alternateName: OPERATOR.name }
      : {}),
    description: OPERATOR.role,
    url: `${SITE_URL}/about`,
    email: `mailto:${OPERATOR.email}`,
    ...(OPERATOR.imageUrl ? { image: OPERATOR.imageUrl } : {}),
    ...(sameAs.length ? { sameAs } : {}),
    worksFor: { "@id": `${SITE_URL}/#organization` },
  };
}

/** The Organization node — an upgrade of the name/url/logo stub that shipped in
 *  the root layout, now carrying the founder reference, the real Telegram
 *  properties and a contact point. `logo` must stay /icon.png: /icon and
 *  /apple-icon both 404 (verified Jul 28) and pointing schema at a 404 is the
 *  exact defect M142 fixed here. */
export function organizationLd(): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `${SITE_URL}/#organization`,
    name: SITE_NAME,
    url: SITE_URL,
    logo: { "@type": "ImageObject", url: `${SITE_URL}/icon.png` },
    description: `${SITE_NAME} is a free browser-based toolkit for QR codes, PDFs and images. Most tools run entirely on your device.`,
    foundingDate: "2025",
    founder: { "@id": `${SITE_URL}/about#operator` },
    sameAs: organizationSameAs(),
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "customer support",
      email: OPERATOR.email,
      url: `${SITE_URL}/contact`,
      availableLanguage: ["English", "Russian", "Uzbek"],
    },
  };
}

/** Author node for Article schema. A Person author outranks an Organization
 *  author as an E-E-A-T signal, and the @id ties every article to the one
 *  Person defined on /about. */
export function articleAuthorLd(): Record<string, unknown> {
  return {
    "@type": "Person",
    "@id": `${SITE_URL}/about#operator`,
    name: OPERATOR.fullName || OPERATOR.name,
    url: `${SITE_URL}/about`,
  };
}

/** Publisher node for Article schema. */
export function articlePublisherLd(): Record<string, unknown> {
  return {
    "@type": "Organization",
    "@id": `${SITE_URL}/#organization`,
    name: SITE_NAME,
    url: SITE_URL,
    logo: { "@type": "ImageObject", url: `${SITE_URL}/icon.png` },
  };
}

/** Visible byline text. Deliberately the same string in schema and on the page —
 *  a byline that disagrees with its own markup is a negative signal. */
export const BYLINE = `${OPERATOR.fullName || OPERATOR.name} · ${SITE_NAME}`;
