import pdfMake from "pdfmake/build/pdfmake";
import { saveAs } from "file-saver";
import dayjs from "dayjs";
import type { TDocumentDefinitions, TableCell } from "pdfmake/interfaces";
import type { LogUsagePdfData } from "../types/pdf";
import buddhistEra from "dayjs/plugin/buddhistEra";

// Utils
import { getConfiguredPdfMake } from "../utils/loadFontPdf";

dayjs.extend(buddhistEra);

export const generateStatisticUsageLogPdfBlob = async (
  data: LogUsagePdfData,
  t: (key: string) => string,
  i18n: any
): Promise<Blob> => {
  await getConfiguredPdfMake();

  const body: TableCell[][] = [
    [
      { text: t('table.header.no'), style: "tableHeader" },
      { text: t('table.header.first-name-last-name'), style: "tableHeader" },
      { text: t('table.header.pid-full-with-space'), style: "tableHeader" },
      { text: t('table.header.date'), style: "tableHeader" },
      { text: t('table.header.ip-address'), style: "tableHeader" },
      { text: t('table.header.coordinates'), style: "tableHeader" },
      { text: t('table.header.user-agent'), style: "tableHeader" },
      { text: t('table.header.agency'), style: "tableHeader" },
      { text: t('table.header.bh-with-space'), style: "tableHeader" },
      { text: t('table.header.bk-with-space'), style: "tableHeader" },
      { text: t('table.header.org-with-space'), style: "tableHeader" },
    ],
    ...data.logUsage.map((item, index) => [
      { text: String(index + 1), alignment: "center" } as TableCell,
      { text: item.name } as TableCell,
      { text: item.pid } as TableCell,
      { text: dayjs(item.date_time).format(i18n.language === "th" ? "DD/MM/BBBB HH:mm" : "DD/MM/YYYY HH:mm")} as TableCell,
      { text: item.ip_address } as TableCell,
      { text: `${item.latitude},${item.longitude}`} as TableCell,
      { text: item.user_agent } as TableCell,
      { text: item.agency_name } as TableCell,
      { text: item.bh_name } as TableCell,
      { text: item.bk_name } as TableCell,
      { text: item.org_name } as TableCell,
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
          text: t('pdf.statistic-usage-person'),
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
        text: t('pdf.statistic-usage-person'),
        alignment: "center",
        style: "header",
        color: "#000000",
      },
      {
        columns: [
          {
            columns: [
              { text: `${t('table.header.pid-full')}/${t('table.header.water-mark')}`, width: 140 },
              { text: data.pid_or_water_mark, bold: true },
            ],
          },
          {
            columns: [
              { text: t('table.header.first-name-last-name'), width: 80 },
              { text: data.name, bold: true },
            ],
          },
          {
            columns: [
              { text: t('table.header.between-date'), width: 80 },
              { text: `${data.start_date} - ${data.end_date}`, bold: true },
            ],
          },
        ],
        margin: [0, 0, 0, 10],
      },
      {
        columns: [
          {
            columns: [
              { text: t('table.header.agency'), width: 140 },
              { text: data.agency_name, bold: true },
            ]
          },
          {
            columns: [
              { text: t('table.header.bh'), width: 80 },
              { text: data.bh_name, bold: true },
            ]
          },
          {
            columns: [
              { text: t('table.header.bk'), width: 80 },
              { text: data.bk_name, bold: true },
            ]
          },
        ],
        margin: [0, 0, 0, 10],
      },
      {
        columns: [
          {
            columns: [
              { text: t('table.header.org'), width: 140 },
              { text: data.org_name, bold: true },
            ]
          },
        ],
        margin: [0, 0, 0, 20],
      },
      {
        table: {
          headerRows: 1,
          widths: [30, 85, 80, 55, 55, 55, 120, 55, 55, 55, 55],
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

export const downloadStatisticUsageLogPdf = async (
  data: LogUsagePdfData,
  fileName: string,
  t: (key: string) => string,
  i18n: any
) => {
  const blob = await generateStatisticUsageLogPdfBlob(data, t, i18n);
  saveAs(blob, fileName);
};