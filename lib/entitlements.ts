// Client-safe: pure constants, types and helpers only (no server imports).

/** Reward for each side when a referral is completed. */
export const REFERRAL_REWARD_CREDITS = 50;

/** How many Pro days a chunk of credits can later unlock (used once billing lands). */
export const CREDITS_PER_PRO_DAY = 25;

export type Profile = {
  id: string;
  email: string | null;
  plan: "free" | "pro";
  pro_until: string | null;
  credits: number;
  referral_code: string | null;
  referred_by: string | null;
  created_at: string;
};

/** True if the profile currently has active Pro access. */
export function isPro(profile: Pick<Profile, "plan" | "pro_until"> | null): boolean {
  if (!profile) return false;
  if (profile.plan === "pro") return true;
  return !!profile.pro_until && new Date(profile.pro_until).getTime() > Date.now();
}
