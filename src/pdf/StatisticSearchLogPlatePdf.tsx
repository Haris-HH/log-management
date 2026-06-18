import pdfMake from "pdfmake/build/pdfmake";
import { saveAs } from "file-saver";
import dayjs from "dayjs";
import type { TDocumentDefinitions, TableCell } from "pdfmake/interfaces";
import type { SearchLogPlatePdfData } from "../types/pdf";
import buddhistEra from "dayjs/plugin/buddhistEra";

// Utils
import { getConfiguredPdfMake } from "../utils/loadFontPdf";

dayjs.extend(buddhistEra);

export const generateStatisticSearchLogPlatePdfBlob = async (
  data: SearchLogPlatePdfData,
  t: (key: string) => string,
): Promise<Blob> => {
  await getConfiguredPdfMake();

  const body: TableCell[][] = [
    [
      { text: t('table.header.no'), style: "tableHeader" },
      { text: t('table.header.first-name-last-name'), style: "tableHeader" },
      { text: t('table.header.pid-full-with-space'), style: "tableHeader" },
      { text: t('table.header.date'), style: "tableHeader" },
      { text: t('table.header.detail'), style: "tableHeader" },
      { text: t('table.header.ip-address'), style: "tableHeader" },
      { text: t('table.header.coordinates'), style: "tableHeader" },
      { text: t('table.header.user-agent'), style: "tableHeader" },
      { text: t('table.header.agency'), style: "tableHeader" },
      { text: t('table.header.bh-with-space'), style: "tableHeader" },
      { text: t('table.header.bk-with-space'), style: "tableHeader" },
      { text: t('table.header.org-with-space'), style: "tableHeader" },
    ],
    ...data.logPlate.map((item, index) => [
      { text: String(index + 1), alignment: "center" } as TableCell,
      { text: `${item.title || ""} ${item.firstname} ${item.lastname}` } as TableCell,
      { text: item.idcard } as TableCell,
      { text: dayjs(item.log_timestamp).format("DD/MM/BBBB HH:mm")} as TableCell,
      { text: "" } as TableCell,
      { text: item.request_ip } as TableCell,
      { text: `${item.location_webui?.lat?.toFixed(5)}, ${item.location_webui?.lng?.toFixed(5)}`} as TableCell,
      { text: item.user_agent } as TableCell,
      { text: item.ou_name } as TableCell,
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
          text: t('pdf.statistic-search-log-plate'),
          alignment: "left",
          color: "#ACACAC",
        },
        {
          text: `${t('text.export-date')}: ${dayjs().format("DD/MM/BBBB HH:mm:ss")}`,
          alignment: "right",
          color: "#ACACAC",
        },
      ],
      margin: [10, 10, 10, 10],
    }),
    content: [
      {
        text: t('pdf.statistic-search-log-plate'),
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
          widths: [30, 55, 45, 45, 120, 45, 45, 120, 45, 45, 45, 45],
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

export const downloadStatisticSearchLogPlatePdf = async (
  data: SearchLogPlatePdfData,
  fileName: string,
  t: (key: string) => string,
) => {
  const blob = await generateStatisticSearchLogPlatePdfBlob(data, t);
  saveAs(blob, fileName);
};