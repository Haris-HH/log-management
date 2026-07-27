import { describe, it, expect, vi, beforeEach } from "vitest";

const loadFont = vi.fn();
vi.mock("../utils/commonFunctions", () => ({
  loadFont: (...args: unknown[]) => loadFont(...args),
}));

vi.mock("pdfmake/build/pdfmake", () => ({
  default: {} as Record<string, unknown>,
}));

const loadModule = async () => {
  vi.resetModules();
  return import("./loadFontPdf");
};

beforeEach(() => {
  vi.clearAllMocks();
  loadFont.mockImplementation(async (p: string) => `base64:${p}`);
});

describe("getConfiguredPdfMake", () => {
  it("loads the three Sarabun weights from /public/fonts", async () => {
    const { getConfiguredPdfMake } = await loadModule();
    await getConfiguredPdfMake();

    expect(loadFont).toHaveBeenCalledTimes(3);
    expect(loadFont.mock.calls.map((c) => c[0])).toEqual([
      "/fonts/Sarabun-Regular.ttf",
      "/fonts/Sarabun-Bold.ttf",
      "/fonts/Sarabun-SemiBold.ttf",
    ]);
  });

  it("returns an instance with the fonts registered in its virtual file system", async () => {
    const { getConfiguredPdfMake } = await loadModule();
    const pdfMake = await getConfiguredPdfMake();

    expect(pdfMake.vfs).toEqual({
      "Sarabun-R.ttf": "base64:/fonts/Sarabun-Regular.ttf",
      "Sarabun-B.ttf": "base64:/fonts/Sarabun-Bold.ttf",
      "Sarabun-S.ttf": "base64:/fonts/Sarabun-SemiBold.ttf",
    });
  });

  it("declares a Sarabun family so Thai glyphs render", async () => {
    const { getConfiguredPdfMake } = await loadModule();
    const pdfMake = await getConfiguredPdfMake();

    expect(pdfMake.fonts).toEqual({
      Sarabun: {
        normal: "Sarabun-R.ttf",
        bold: "Sarabun-B.ttf",
        bolditalics: "Sarabun-S.ttf",
      },
    });
  });

  it("fetches the fonts once and reuses the instance across exports", async () => {
    const { getConfiguredPdfMake } = await loadModule();

    const [a, b] = await Promise.all([
      getConfiguredPdfMake(),
      getConfiguredPdfMake(),
    ]);
    const c = await getConfiguredPdfMake();

    expect(loadFont).toHaveBeenCalledTimes(3); // 3 weights, not 9
    expect(a).toBe(b);
    expect(b).toBe(c);
  });

  it("surfaces a font fetch failure instead of producing a broken document", async () => {
    loadFont.mockRejectedValue(new Error("404"));

    const { getConfiguredPdfMake } = await loadModule();
    await expect(getConfiguredPdfMake()).rejects.toThrow("404");
  });

  it("does not cache a failure, so a later export can retry", async () => {
    loadFont.mockRejectedValueOnce(new Error("offline"));

    const { getConfiguredPdfMake } = await loadModule();
    await expect(getConfiguredPdfMake()).rejects.toThrow("offline");

    loadFont.mockImplementation(async (p: string) => `base64:${p}`);
    await expect(getConfiguredPdfMake()).resolves.toBeDefined();
  });
});
