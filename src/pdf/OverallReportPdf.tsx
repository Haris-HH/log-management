import { saveAs } from "file-saver";
import dayjs from "dayjs";
import buddhistEra from "dayjs/plugin/buddhistEra";
import type { TDocumentDefinitions, TableCell, Content } from "pdfmake/interfaces";

// Types
import type { OverallReportPdfData } from "../types/pdf";

// Utils
import { getConfiguredPdfMake } from "../utils/loadFontPdf";
import { formatNumber, formatPercent } from "../utils/commonFunctions";

dayjs.extend(buddhistEra);

export const generateOverallReportPdfBlob = async (
  data: OverallReportPdfData,
  t: (key: string) => string,
  i18n: any
): Promise<Blob> => {
  const pdfMake = await getConfiguredPdfMake();

  const overallReport: TableCell[][] = [
    [
      { text: t("table.header.area"), style: "tableHeader" },
      { text: t("table.header.all-checkpoint"), style: "tableHeader" },
      { text: t("table.header.normal-status"), style: "tableHeader" },
      { text: t("table.header.device-outage"), style: "tableHeader" },
      { text: t("table.header.network-outage"), style: "tableHeader" },
      { text: t("table.header.disable"), style: "tableHeader" },
      { text: t("table.header.percenter-readiness"), style: "tableHeader" },
    ],
    ...(data.overallReport ?? []).map((item) => {
      const policeRegion =
        i18n.language === "th"
          ? item.police_region?.title_abbr_th ?? "-"
          : item.police_region?.title_abbr_en ?? "-";

      return [
        { text: policeRegion },
        {
          text: formatNumber(item.total),
          alignment: "right",
        },
        {
          text: `${formatNumber(item.online)} (${formatPercent(
            item.online_percent
          )}%)`,
          alignment: "right",
        },
        {
          text: `${formatNumber(item.device_offline)} (${formatPercent(
            item.device_offline_percent
          )}%)`,
          alignment: "right",
        },
        {
          text: `${formatNumber(item.network_offline)} (${formatPercent(
            item.network_offline_percent
          )}%)`,
          alignment: "right",
        },
        {
          text: `${formatNumber(item.offline)} (${formatPercent(
            item.offline_percent
          )}%)`,
          alignment: "right",
        },
        {
          text: formatPercent(item.availability_pct),
          alignment: "right",
        },
      ] as TableCell[];
    }),
  ];

  overallReport.push([
    { text: t("table.header.total"), style: "totalSum" },
    {
      text: formatNumber(data?.summary?.total ?? 0),
      style: "totalSum",
      alignment: "right",
    },
    {
      text: `${formatNumber(data?.summary?.online ?? 0)} (${formatPercent(
        data?.summary?.online_percent ?? 0
      )}%)`,
      style: "totalSum",
      alignment: "right",
    },
    {
      text: `${formatNumber(data?.summary?.device_offline ?? 0)} (${formatPercent(
        data?.summary?.device_offline_percent ?? 0
      )}%)`,
      style: "totalSum",
      alignment: "right",
    },
    {
      text: `${formatNumber(data?.summary?.network_offline ?? 0)} (${formatPercent(
        data?.summary?.network_offline_percent ?? 0
      )}%)`,
      style: "totalSum",
      alignment: "right",
    },
    {
      text: `${formatNumber(data?.summary?.offline ?? 0)} (${formatPercent(
        data?.summary?.offline_percent ?? 0
      )}%)`,
      style: "totalSum",
      alignment: "right",
    },
    {
      text: formatPercent(data?.summary?.availability_pct ?? 0),
      style: "totalSum",
      alignment: "right",
    },
  ]);

  const overallReportDetail: TableCell[][] = [
    [
      { text: t("table.header.no"), style: "tableHeader" },
      { text: t("table.header.camera-checkpoint"), style: "tableHeader" },
      { text: t("table.header.checkpoint"), style: "tableHeader" },
      { text: t("table.header.station"), style: "tableHeader" },
      { text: t("table.header.area"), style: "tableHeader" },
      { text: t("table.header.province"), style: "tableHeader" },
      { text: t("table.header.project"), style: "tableHeader" },
      { text: t("table.header.status"), style: "tableHeader" },
      { text: t("table.header.problem-date-with-space"), style: "tableHeader" },
      { text: t("table.header.problem-percent"), style: "tableHeader" },
      { text: t("table.header.remark"), style: "tableHeader" },
    ],
    ...data.overallReportDetail.map((item, index) => [
      { text: index + 1, alignment: "center" },
      { text: item.device_name ?? "-" },
      { text: item.checkpoint_name ?? "-" },
      { text: item.station_name ?? "-" },
      { text: item.police_region ?? "-" },
      { text: item.province_name ?? "-" },
      { text: item.project_name ?? "-", alignment: "center" },
      {
        text:
          item.device_status_code === "online"
            ? t("text.enable")
            : t("text.disable"),
        alignment: "center",
      },
      { text: formatNumber(item.problem_days), alignment: "center" },
      { text: `${formatPercent(item.problem_pct)}%`, alignment: "center" },
      { text: item.remark ?? "-" },
    ] as TableCell[]),
  ];

  const lastOverallReportRowIndex = overallReport.length - 1;

  const content: Content[] = [
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
            { text: t("table.header.date"), width: 50 },
            { text: data.date, bold: true },
          ],
        },
        {
          margin: [10, 0, 10, 0],
          columns: [
            { text: t("table.header.area"), width: 50 },
            { text: data.area, bold: true },
          ],
        },
        {
          margin: [10, 0, 10, 0],
          columns: [
            { text: t("table.header.province"), width: 50 },
            { text: data.province, bold: true },
          ],
        },
        {
          margin: [10, 0, 10, 0],
          columns: [
            { text: t("table.header.project"), width: 50 },
            { text: data.project, bold: true },
          ],
        },
      ],
      margin: [0, 0, 0, 10],
    },
    {
      table: {
        headerRows: 1,
        widths: Array(overallReport[0]?.length ?? 0).fill("*"),
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
  ];

  if ((data.overallReportDetail ?? []).length > 0) {
    content.push(
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
    );
  }

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
          text: `${t("text.export-date")}: ${dayjs().format(
            i18n.language === "th"
              ? "DD/MM/BBBB HH:mm:ss"
              : "DD/MM/YYYY HH:mm:ss"
          )}`,
          alignment: "right",
          color: "#ACACAC",
        },
      ],
      margin: [10, 10, 10, 10],
    }),
    content,
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
      text: currentPage.toString(),
      alignment: "right",
      margin: [0, 10, 40, 0],
    }),
  };

  const pdfDocGenerator = pdfMake.createPdf(docDefinition);

  return new Promise<Blob>((resolve, reject) => {
    pdfDocGenerator.getBlob((blob) => {
      if (blob) {
        resolve(blob);
      } else {
        reject(new Error("PDF generation failed"));
      }
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