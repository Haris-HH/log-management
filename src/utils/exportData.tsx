import ExcelJS from "exceljs";
import { saveAs } from "file-saver";

type ColumnStyle = {
  alignment?: Partial<ExcelJS.Alignment>;
  numFmt?: string;
};

type ExportExcelParams<T> = {
  sheetName: string;
  fileName: string;
  headers: string[];
  data: T[];
  mapRow: (item: T, index: number) => (string | number)[];
  columnStyles?: Record<number, ColumnStyle>;
};

export const exportExcel = async <T,>({
  sheetName,
  fileName,
  headers,
  data,
  mapRow,
  columnStyles = {},
}: ExportExcelParams<T>) => {
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet(sheetName);

  // Header
  const headerRow = sheet.addRow(headers);

  // Header style
  headerRow.eachCell((cell) => {
    cell.font = {
      bold: true,
      color: { argb: "00000000" },
    };
    cell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "B7B7B7" },
    };
    cell.alignment = { vertical: "middle", horizontal: "center" };
  });

  // Data rows
  data.forEach((item, index) => {
    const row = sheet.addRow(mapRow(item, index));

    Object.entries(columnStyles).forEach(([colIndex, style]) => {
      const cell = row.getCell(Number(colIndex));

      if (style.alignment) {
        cell.alignment = style.alignment;
      }

      if (style.numFmt) {
        cell.numFmt = style.numFmt;
      }
    });
  });

  // Auto width
  sheet.columns.forEach((column) => {
    let maxLength = 10;
    column.eachCell?.({ includeEmpty: true }, (cell) => {
      const val = cell.value ? cell.value.toString() : "";
      maxLength = Math.max(maxLength, val.length);
    });
    column.width = maxLength + 2;
  });

  // Export
  const buffer = await workbook.xlsx.writeBuffer();

  saveAs(
    new Blob([buffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    }),
    fileName
  );
};