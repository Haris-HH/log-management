import { describe, it, expect, vi, beforeEach } from "vitest";
import ExcelJS from "exceljs";

const saveAs = vi.fn();
vi.mock("file-saver", () => ({
  saveAs: (...args: unknown[]) => saveAs(...args),
}));

import { generateExcelBlob, exportExcel } from "./exportData";

type Row = { name: string; total: number };

const rows: Row[] = [
  { name: "ตร.ภ.1", total: 1200 },
  { name: "ตร.ภ.2", total: 340 },
];

const params = {
  sheetName: "Usage",
  headers: ["No", "Agency", "Total"],
  data: rows,
  mapRow: (item: Row, index: number) => [index + 1, item.name, item.total],
};

const readBack = async (blob: Blob) => {
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.load(await blob.arrayBuffer());
  return workbook;
};

beforeEach(() => {
  vi.clearAllMocks();
});

describe("generateExcelBlob", () => {
  it("produces a spreadsheet blob", async () => {
    const blob = await generateExcelBlob(params);
    expect(blob.type).toBe(
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    expect(blob.size).toBeGreaterThan(0);
  });

  it("writes the header row followed by one row per record", async () => {
    const workbook = await readBack(await generateExcelBlob(params));
    const sheet = workbook.getWorksheet("Usage")!;

    expect(sheet).toBeDefined();
    expect(sheet.rowCount).toBe(3);
    expect(sheet.getRow(1).values).toEqual([
      undefined,
      "No",
      "Agency",
      "Total",
    ]);
    expect(sheet.getRow(2).values).toEqual([undefined, 1, "ตร.ภ.1", 1200]);
    expect(sheet.getRow(3).values).toEqual([undefined, 2, "ตร.ภ.2", 340]);
  });

  it("bolds and fills the header row", async () => {
    const workbook = await readBack(await generateExcelBlob(params));
    const header = workbook.getWorksheet("Usage")!.getRow(1);

    expect(header.getCell(1).font?.bold).toBe(true);
    expect(header.getCell(1).alignment).toMatchObject({
      vertical: "middle",
      horizontal: "center",
    });
  });

  it("applies per-column styles to data rows", async () => {
    const workbook = await readBack(
      await generateExcelBlob({
        ...params,
        columnStyles: {
          3: { numFmt: "#,##0", alignment: { horizontal: "right" } },
        },
      })
    );
    const cell = workbook.getWorksheet("Usage")!.getRow(2).getCell(3);

    expect(cell.numFmt).toBe("#,##0");
    expect(cell.alignment).toMatchObject({ horizontal: "right" });
  });

  it("widens columns to fit their longest value", async () => {
    const workbook = await readBack(
      await generateExcelBlob({
        ...params,
        data: [{ name: "a-very-long-agency-name-here", total: 1 }],
      })
    );
    const columns = workbook.getWorksheet("Usage")!.columns!;

    // Minimum width is 10 (+2 padding); the long value must push past it.
    expect(columns[1].width).toBeGreaterThan(12);
    expect(columns[0].width).toBe(12);
  });

  it("emits a header-only sheet for an empty dataset", async () => {
    const workbook = await readBack(
      await generateExcelBlob({ ...params, data: [] })
    );
    expect(workbook.getWorksheet("Usage")!.rowCount).toBe(1);
  });
});

describe("exportExcel", () => {
  it("hands the blob to file-saver under the requested name", async () => {
    await exportExcel({ ...params, fileName: "usage-2026.xlsx" });

    expect(saveAs).toHaveBeenCalledTimes(1);
    const [blob, fileName] = saveAs.mock.calls[0];
    expect(fileName).toBe("usage-2026.xlsx");
    expect(blob).toBeInstanceOf(Blob);
  });
});
