import pdfMake from "pdfmake/build/pdfmake";
import { saveAs } from "file-saver";
import dayjs from "dayjs";
import type { TDocumentDefinitions, TableCell } from "pdfmake/interfaces";
import type { OverallReportPdfData } from "../types/pdf";
import buddhistEra from "dayjs/plugin/buddhistEra";

// Utils
import { getConfiguredPdfMake } from "../utils/loadFontPdf";

dayjs.extend(buddhistEra);

export const generateOverallReportPdfBlob = async (
  data: OverallReportPdfData,
  t: (key: string) => string,
  i18n: any
): Promise<Blob> => {
  await getConfiguredPdfMake();

  const overallReport: TableCell[][] = [
    [
      { text: t('table.header.area'), style: "tableHeader" },
      { text: t('table.header.all-checkpoint'), style: "tableHeader" },
      { text: t('table.header.normal-status'), style: "tableHeader" },
      { text: t('table.header.device-outage'), style: "tableHeader" },
      { text: t('table.header.network-outage'), style: "tableHeader" },
      { text: t('table.header.disable'), style: "tableHeader" },
      { text: t('table.header.percenter-readiness'), style: "tableHeader" },
    ],
    ...data.overallReport.map((item, index, arr) => {
      const isLast = index === arr.length - 1;

      const cellStyle = isLast ? { style: "totalSum" } : {};

      return [
        { text: item.police_division_name, ...cellStyle },
        { text: item.total.toLocaleString(), ...cellStyle, alignment: "right"},
        { text: `${item.normal.toLocaleString()} (${item.normal_percent.toFixed(1)}%)`, ...cellStyle, alignment: "right" },
        { text: `${item.device.toLocaleString()} (${item.device_percent.toFixed(1)}%)`, ...cellStyle, alignment: "right" },
        { text: `${item.network.toLocaleString()} (${item.network_percent.toFixed(1)}%)`, ...cellStyle, alignment: "right" },
        { text: `${item.disable.toLocaleString()} (${item.disable_percent.toFixed(1)}%)`, ...cellStyle, alignment: "right" },
        { text: item.ready_percent.toFixed(1), ...cellStyle, alignment: "right" },
      ] as TableCell[];
    }),
  ];

  const overallReportDetail: TableCell[][] = [
    [
      { text: t('table.header.no'), style: "tableHeader" },
      { text: t('table.header.camera-checkpoint'), style: "tableHeader" },
      { text: t('table.header.checkpoint'), style: "tableHeader" },
      { text: t('table.header.station'), style: "tableHeader" },
      { text: t('table.header.area'), style: "tableHeader" },
      { text: t('table.header.province'), style: "tableHeader" },
      { text: t('table.header.project'), style: "tableHeader" },
      { text: t('table.header.status'), style: "tableHeader" },
      { text: t('table.header.problem-date'), style: "tableHeader" },
      { text: t('table.header.problem-percent'), style: "tableHeader" },
      { text: t('table.header.remark'), style: "tableHeader" },
    ],
    ...data.overallReportDetail.map((item, index) => [
      { text: index + 1, alignment: "center" } as TableCell,
      { text: item.checkpoint_name } as TableCell,
      { text: item.camera_name } as TableCell,
      { text: item.station_name } as TableCell,
      { text: item.area_name } as TableCell,
      { text: item.province_name } as TableCell,
      { text: item.project, alignment: "center" } as TableCell,
      { text: item.status_id === 1 ? t('text.enable') : t('text.disable'), alignment: "center" } as TableCell,
      { text: item.date_count_error, alignment: "center" } as TableCell,
      { text: item.date_count_error_percent.toFixed(1), alignment: "center" } as TableCell,
      { text: item.remark } as TableCell,
    ]),
  ];

  const lastOverallReportRowIndex = overallReport.length - 1;

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
          text: data.title,
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
        text: data.title,
        alignment: "center",
        style: "header",
        color: "#000000",
        margin: [0, 0, 0, 30],
      },
      {
        alignment: "center",
        columns: [
          {
            margin: [0, 0, 20, 0],
            columns: [
              { text: t('table.header.date'), width: 50 },
              { text: data.date, bold: true },
            ],
          },
          {
            margin: [10, 0, 10, 0],
            columns: [
              { text: t('table.header.area'), width: 50 },
              { text: data.area, bold: true },
            ],
          },
          {
            margin: [10, 0, 10, 0],
            columns: [
              { text: t('table.header.province'), width: 50 },
              { text: data.province, bold: true },
            ],
          },
          {
            margin: [10, 0, 10, 0],
            columns: [
              { text: t('table.header.project'), width: 50 },
              { text: data.project, bold: true },
            ],
          },
        ],
        margin: [0, 0, 0, 10],
      },
      {
        table: {
          headerRows: 1,
          widths: Array(overallReport[0]?.length).fill("*"),
          body: overallReport,
        },
        layout: {
          fillColor: (rowIndex: number) => {
            if (rowIndex === 0 || rowIndex === lastOverallReportRowIndex) {
              return "#D9D9D9";
            }
            return null;
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
      {
        pageBreak: "before",
        text: data.title,
        alignment: "center",
        style: "header",
        margin: [0, 0, 0, 20],
      },
      {
        table: {
          headerRows: 1,
          widths: [30, 95, 95, 95, 50, 50, 60, 50, 40, 40, 95],
          body: overallReportDetail,
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
      }
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
        color: "#000000",
        alignment: "center",
      },
      totalSum: {
        bold: true,
        fillColor: "#eeeeee",
        color: "#000000",
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

export const downloadOverallReportPdf = async (
  data: OverallReportPdfData,
  fileName: string,
  t: (key: string) => string,
  i18n: any
) => {
  const blob = await generateOverallReportPdfBlob(data, t, i18n);
  saveAs(blob, fileName);
};