// Utils
import { loadFont } from "../utils/commonFunctions";

type PdfMake = typeof import("pdfmake/build/pdfmake");

// pdfmake is ~2.8 MB and is only needed once a user actually exports a PDF.
// Importing it dynamically keeps it out of the initial bundle; the export flow
// already shows a loading screen while this resolves.
let pdfMakePromise: Promise<PdfMake> | null = null;

const configure = async (): Promise<PdfMake> => {
  const [pdfMakeModule, reg, bold, semi] = await Promise.all([
    import("pdfmake/build/pdfmake"),
    loadFont("/fonts/Sarabun-Regular.ttf"),
    loadFont("/fonts/Sarabun-Bold.ttf"),
    loadFont("/fonts/Sarabun-SemiBold.ttf")
  ]);

  // pdfmake ships as UMD/CJS: the bundler's interop may surface it as the
  // namespace itself or under `default`.
  const pdfMake =
    (pdfMakeModule as { default?: PdfMake }).default ?? pdfMakeModule;

  pdfMake.vfs = { "Sarabun-R.ttf": reg, "Sarabun-B.ttf": bold, "Sarabun-S.ttf": semi };
  pdfMake.fonts = { Sarabun: { normal: "Sarabun-R.ttf", bold: "Sarabun-B.ttf", bolditalics: "Sarabun-S.ttf" }};

  return pdfMake;
};

/**
 * Resolves a pdfMake instance with the Sarabun family registered.
 *
 * Memoised, so the library and its three font files are fetched once per
 * session instead of on every export. A failure is not cached, so a later
 * export can retry.
 */
export const getConfiguredPdfMake = (): Promise<PdfMake> => {
  if (!pdfMakePromise) {
    pdfMakePromise = configure().catch((error) => {
      pdfMakePromise = null;
      throw error;
    });
  }

  return pdfMakePromise;
};
