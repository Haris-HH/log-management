import pdfMake from "pdfmake/build/pdfmake";

// Utils
import { loadFont } from "../utils/commonFunctions";

export const getConfiguredPdfMake = async () => {
  const [reg, bold, semi] = await Promise.all([
    loadFont("/fonts/Sarabun-Regular.ttf"),
    loadFont("/fonts/Sarabun-Bold.ttf"),
    loadFont("/fonts/Sarabun-SemiBold.ttf")
  ]);

  pdfMake.vfs = { "Sarabun-R.ttf": reg, "Sarabun-B.ttf": bold, "Sarabun-S.ttf": semi };
  pdfMake.fonts = { Sarabun: { normal: "Sarabun-R.ttf", bold: "Sarabun-B.ttf", bolditalics: "Sarabun-S.ttf" }};
};