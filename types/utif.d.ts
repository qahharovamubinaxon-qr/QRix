declare module "utif" {
  /** One TIFF directory = one page. `data` is filled in by decodeImage.
      Raw tags are exposed as `t<number>` (almost always arrays). */
  export type IFD = {
    width: number;
    height: number;
    data?: Uint8Array;
    [tag: `t${number}`]: unknown;
  };
  export type UtifApi = {
    decode(buf: ArrayBuffer | Uint8Array): IFD[];
    decodeImage(buf: ArrayBuffer | Uint8Array, ifd: IFD, ifds?: IFD[]): void;
    toRGBA8(ifd: IFD): Uint8Array;
  };
  /* CJS module: bundlers may surface the API as named exports or only as
     `default`, so both shapes are declared and the caller picks. */
  export const decode: UtifApi["decode"];
  export const decodeImage: UtifApi["decodeImage"];
  export const toRGBA8: UtifApi["toRGBA8"];
  const UTIF: UtifApi;
  export default UTIF;
}
