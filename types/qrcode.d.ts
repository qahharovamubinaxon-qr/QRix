/* `qrcode` ships no types and @types/qrcode would be a new dependency for four
   call signatures. Same shape as types/utif.d.ts and types/gifenc.d.ts: declare
   exactly what the code uses, so a wrong option name is still a type error. */
declare module "qrcode" {
  export type ErrorCorrectionLevel = "L" | "M" | "Q" | "H";

  export interface RenderOptions {
    errorCorrectionLevel?: ErrorCorrectionLevel;
    margin?: number;
    width?: number;
    scale?: number;
    color?: { dark?: string; light?: string };
    type?: "png" | "svg" | "utf8";
  }

  export function toString(text: string, options?: RenderOptions): Promise<string>;
  export function toBuffer(text: string, options?: RenderOptions): Promise<Buffer>;
  export function toDataURL(text: string, options?: RenderOptions): Promise<string>;

  const _default: {
    toString: typeof toString;
    toBuffer: typeof toBuffer;
    toDataURL: typeof toDataURL;
  };
  export default _default;
}
