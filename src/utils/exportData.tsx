import type ExcelJS from "exceljs";
import { saveAs } from "file-saver";

// exceljs is ~1.1 MB and only runs when a user exports a spreadsheet, so it is
// loaded on demand rather than shipped in the initial bundle. Memoised so a
// chunked export (one workbook per 1000 rows) resolves the module once.
let excelJsPromise: Promise<typeof ExcelJS> | null = null;

const getExcelJs = (): Promise<typeof ExcelJS> => {
  if (!excelJsPromise) {
    excelJsPromise = import("exceljs")
      .then((mod) => (mod.default ?? mod) as unknown as typeof ExcelJS)
      .catch((error) => {
        excelJsPromise = null;
        throw error;
      });
  }

  return excelJsPromise;
};

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

export const generateExcelBlob = async <T,>(
  params: Omit<ExportExcelParams<T>, "fileName">
): Promise<Blob> => {
  const ExcelJs = await getExcelJs();

  const workbook = new ExcelJs.Workbook();
  const sheet = workbook.addWorksheet(params.sheetName);

  const headerRow = sheet.addRow(params.headers);

  headerRow.eachCell((cell) => {
    cell.font = { bold: true, color: { argb: "00000000" } };
    cell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "B7B7B7" },
    };
    cell.alignment = { vertical: "middle", horizontal: "center" };
  });

  params.data.forEach((item, index) => {
    const row = sheet.addRow(params.mapRow(item, index));

    Object.entries(params.columnStyles ?? {}).forEach(([colIndex, style]) => {
      const cell = row.getCell(Number(colIndex));

      if (style.alignment) cell.alignment = style.alignment;
      if (style.numFmt) cell.numFmt = style.numFmt;
    });
  });

  sheet.columns.forEach((column) => {
    let maxLength = 10;

    column.eachCell?.({ includeEmpty: true }, (cell) => {
      const val = cell.value ? cell.value.toString() : "";
      maxLength = Math.max(maxLength, val.length);
    });

    column.width = maxLength + 2;
  });

  const buffer = await workbook.xlsx.writeBuffer();

  return new Blob([buffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
};

export const exportExcel = async <T,>(params: ExportExcelParams<T>) => {
  const blob = await generateExcelBlob(params);
  saveAs(blob, params.fileName);
};