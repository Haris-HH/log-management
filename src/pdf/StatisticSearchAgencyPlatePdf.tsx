import { saveAs } from "file-saver";
import dayjs from "dayjs";
import type { TDocumentDefinitions, TableCell } from "pdfmake/interfaces";
import type { SearchAgencyPlatePdfData } from "../types/pdf";
import buddhistEra from "dayjs/plugin/buddhistEra";

// Utils
import { getConfiguredPdfMake } from "../utils/loadFontPdf";

dayjs.extend(buddhistEra);

export const generateStatisticSearchAgencyPlatePdfBlob = async (
  data: SearchAgencyPlatePdfData,
  t: (key: string) => string,
  i18n: any
): Promise<Blob> => {
  const pdfMake = await getConfiguredPdfMake();

  const body: TableCell[][] = [
    [
      { text: t('table.header.no'), style: "tableHeader" },
      { text: t('table.header.count'), style: "tableHeader" },
      { text: t('table.header.agency'), style: "tableHeader" },
      { text: t('table.header.bh'), style: "tableHeader" },
      { text: t('table.header.bk'), style: "tableHeader" },
      { text: t('table.header.org'), style: "tableHeader" },
    ],
    ...data.agencyPlate.map((item, index) => [
      { text: String(index + 1), alignment: "center" } as TableCell,
      { text: (item.total || 0).toLocaleString(), alignment: "center" } as TableCell,
      { text: item.ou_name } as TableCell,
      { text: item.bh_name } as TableCell,
      { text: item.bk_name } as TableCell,
      { text: item.org_name } as TableCell,
    ]),
  ];

  const docDefinition: TDocumentDefinitions = {
    pageSize: "A4",
    pageMargins: [40, 40, 40, 40],
    defaultStyle: {
      font: "Sarabun",
      fontSize: 10,
    },
    header: () => ({
      columns: [
        {
          text: t('pdf.statistic-search-agency-plate'),
          alignment: "left",
          color: "#ACACAC",
        },
        {
          text: `${t('text.export-date')}: ${dayjs().format(i18n.language === "th" ? "DD/MM/BBBB HH:mm:ss" : "DD/MM/YYYY HH:mm:ss")}`,
          alignment: "right",
          color: "#ACACAC",
        },
      ],
      margin: [40, 10, 40, 20],
    }),
    content: [
      {
        text: t('pdf.statistic-search-agency-plate'),
        alignment: "center",
        style: "header",
        color: "#000000",
      },
      {
        columns: [
          {
            columns: [
              {
                columns: [
                  { text: t('table.header.agency'), width: 80 },
                  { text: data.agency_name, bold: true },
                ]
              },
            ],
          },
          {
            columns: [
              {
                columns: [
                  { text: t('table.header.bh'), width: 80 },
                  { text: data.bh_name, bold: true },
                ]
              },
            ],
          },
        ],
        margin: [0, 0, 0, 10],
      },
      {
        columns: [
          {
            columns: [
              { text: t('table.header.bk'), width: 80 },
              { text: data.bk_name, bold: true },
            ]
          },
          {
            columns: [
              { text: t('table.header.vehicle-plate'), width: 80 },
              { text: `${data.plate_group || "-"} ${data.plate_number || "-"} ${data.province_name || "-"}`, bold: true },
            ]
          },
        ],
        margin: [0, 0, 0, 10],
      },
      {
        columns: [
          {
            columns: [
              { text: t('table.header.between-date'), width: 80 },
              { text: `${data.start_date} - ${data.end_date}`, bold: true },
            ]
          },
        ],
        margin: [0, 0, 0, 20],
      },
      {
        table: {
          headerRows: 1,
          widths: [40, 60, 80, "*", "*", "*"],
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

// --------------------
// Download
// --------------------
export const downloadStatisticSearchAgencyPlatePdf = async (
  data: SearchAgencyPlatePdfData,
  fileName: string,
  t: (key: string) => string,
  i18n: any
) => {
  const blob = await generateStatisticSearchAgencyPlatePdfBlob(data, t, i18n);
  saveAs(blob, fileName);
};