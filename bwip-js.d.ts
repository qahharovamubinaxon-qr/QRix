// bwip-js ships types under the "browser" export condition, which our TS
// moduleResolution doesn't pick up — declare a minimal ambient module so the
// dynamic client-side import type-checks. Real API is used via `as any`.
declare module "bwip-js";
