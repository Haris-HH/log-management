import pdfMake from "pdfmake/build/pdfmake";
import { saveAs } from "file-saver";
import dayjs from "dayjs";
import type { TDocumentDefinitions, TableCell } from "pdfmake/interfaces";
import type { OverallCheckpointsPdfData } from "../types/pdf";
import buddhistEra from "dayjs/plugin/buddhistEra";

// Utils
import { getConfiguredPdfMake } from "../utils/loadFontPdf";

dayjs.extend(buddhistEra);

export const generateOverallCheckpointsPdfBlob = async (
  data: OverallCheckpointsPdfData[],
  t: (key: string) => string,
  i18n: any
): Promise<Blob> => {
  await getConfiguredPdfMake();

  const body: TableCell[][] = [
    [
      { text: t('table.header.no'), style: "tableHeader" },
      { text: t('table.header.camera-checkpoint'), style: "tableHeader" },
      { text: t('table.header.checkpoint'), style: "tableHeader" },
      { text: t('table.header.station'), style: "tableHeader" },
      { text: t('table.header.area'), style: "tableHeader" },
      { text: t('table.header.province'), style: "tableHeader" },
      { text: t('table.header.district'), style: "tableHeader" },
      { text: t('table.header.subdistrict'), style: "tableHeader" },
      { text: t('table.header.road'), style: "tableHeader" },
      { text: t('table.header.route'), style: "tableHeader" },
      { text: t('table.header.project'), style: "tableHeader" },
    ],
    ...data.map((item, index) => [
      { text: String(index + 1), alignment: "center" } as TableCell,
      { text: item.checkpoint_name } as TableCell,
      { text: item.camera_name } as TableCell,
      { text: item.station_name } as TableCell,
      { text: item.area_name } as TableCell,
      { text: item.province_name } as TableCell,
      { text: item.district_name } as TableCell,
      { text: item.subdistrict_name } as TableCell,
      { text: item.road } as TableCell,
      { text: item.route } as TableCell,
      { text: item.project } as TableCell,
    ]),
  ];

  const docDefinition: TDocumentDefinitions = {
    pageSize: "A4",
    pageMargins: [10, 30, 10, 30],
    pageOrientation: "landscape",
    defaultStyle: {
      font: "Sarabun",
      fontSize: 10,
    },
    header: () => ({
      columns: [
        {
          text: t('pdf.overall-checkpoints'),
          alignment: "left",
          color: "#ACACAC",
        },
        {
          text: `${t('text.export-date')}: ${dayjs().format(i18n.language === "th" ? "DD/MM/BBBB HH:mm:ss" : "DD/MM/YYYY HH:mm:ss")}`,
          alignment: "right",
          color: "#ACACAC",
        },
      ],
      margin: [10, 10, 10, 10],
    }),
    content: [
      {
        text: t('pdf.overall-checkpoints'),
        alignment: "center",
        style: "header",
        color: "#000000",
        margin: [0, 0, 0, 10],
      },
      {
        table: {
          headerRows: 1,
          widths: [30, 85, 85, 85, 45, 70, 45, 45, 100, 40, 70],
          body,
        },
        layout: {
          fillColor: (rowIndex: number) => {
            return rowIndex === 0 ? "#D9D9D9" : null;
          },
          hLineColor: () => "#BFBFBF",
          vLineColor: () => "#BFBFBF",
          hLineWidth: () => 1,
          vLineWidth: () => 1,
          paddingLeft: () => 5,
          paddingRight: () => 5,
          paddingTop: () => 4,
          paddingBottom: () => 4,
        },
      },
    ],
    styles: {
      header: {
        fontSize: 16,
        bold: true,
        margin: [0, 0, 0, 10],
      },
      tableHeader: {
        bold: true,
        fillColor: "#eeeeee",
        color: "#585858",
        alignment: "center",
      },
    },
    footer: (currentPage: number) => ({
      text: currentPage,
      alignment: "right",
      margin: [0, 10, 40, 0],
    }),
  };

  const pdfDocGenerator = pdfMake.createPdf(docDefinition);

  return new Promise<Blob>((resolve, reject) => {
    pdfDocGenerator.getBlob((blob) => {
      if (blob) resolve(blob);
      else reject(new Error("PDF generation failed"));
    });
  });
};

export const downloadOverallCheckpointsPdf = async (
  data: OverallCheckpointsPdfData[],
  fileName: string,
  t: (key: string) => string,
  i18n: any
) => {
  const blob = await generateOverallCheckpointsPdfBlob(data, t, i18n);
  saveAs(blob, fileName);
};