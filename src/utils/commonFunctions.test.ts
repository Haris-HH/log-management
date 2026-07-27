import { describe, it, expect, vi, afterEach } from "vitest";

import {
  escapeHtml,
  buildOptions,
  getPercent,
  toNumber,
  formatNumber,
  formatPercent,
  getLocalizedName,
  formatPhone,
  formatThaiID,
  loadFont,
  loadImageAsBase64,
} from "./commonFunctions";

const t = (key: string) => key;
const i18nTh = { language: "th" };
const i18nEn = { language: "en" };

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("escapeHtml", () => {
  it("neutralises a script tag", () => {
    expect(escapeHtml('<script>alert(1)</script>')).toBe(
      "&lt;script&gt;alert(1)&lt;/script&gt;"
    );
  });

  it("escapes attribute-breaking quotes", () => {
    expect(escapeHtml(`" onerror="alert(1)`)).toBe(
      "&quot; onerror=&quot;alert(1)"
    );
    expect(escapeHtml("' onload='x")).toBe("&#39; onload=&#39;x");
  });

  it("escapes ampersands first so entities are not double-decoded", () => {
    expect(escapeHtml("&lt;")).toBe("&amp;lt;");
  });

  it("leaves benign text — including Thai — byte-for-byte intact", () => {
    expect(escapeHtml("ด่านตรวจบางนา 01")).toBe("ด่านตรวจบางนา 01");
    expect(escapeHtml("Route 7 / Lane 2")).toBe("Route 7 / Lane 2");
  });

  it("stringifies numbers and renders nullish as empty", () => {
    expect(escapeHtml(12)).toBe("12");
    expect(escapeHtml(0)).toBe("0");
    expect(escapeHtml(null)).toBe("");
    expect(escapeHtml(undefined)).toBe("");
  });
});

describe("buildOptions", () => {
  const list = [
    { code: "A", name: "Alpha" },
    { code: "B", name: "Beta" },
  ];

  it("prepends an 'all' entry by default", () => {
    expect(buildOptions(list, "All")).toEqual([
      { label: "All", value: "0" },
      { label: "Alpha", value: "A" },
      { label: "Beta", value: "B" },
    ]);
  });

  it("honours custom label/value fields", () => {
    const rows = [{ ou_abbr_th: "ตร.", ou_code: "X" }];
    expect(buildOptions(rows, "All", "ou_abbr_th", "ou_code")).toEqual([
      { label: "All", value: "0" },
      { label: "ตร.", value: "X" },
    ]);
  });

  it("omits the 'all' entry when isAll is false", () => {
    expect(buildOptions(list, "All", "name", "code", false)).toHaveLength(2);
  });

  it("supports a custom all-value sentinel", () => {
    expect(buildOptions([], "All", "name", "code", true, "-1")[0]).toEqual({
      label: "All",
      value: "-1",
    });
  });

  it("returns just the 'all' entry for an empty list", () => {
    expect(buildOptions([], "All")).toEqual([{ label: "All", value: "0" }]);
  });
});

describe("getPercent", () => {
  it("computes a percentage", () => {
    expect(getPercent(25, 200)).toBe(12.5);
  });

  it("guards against divide-by-zero", () => {
    expect(getPercent(5, 0)).toBe(0);
  });
});

describe("toNumber", () => {
  it.each([
    ["42", 42],
    [42, 42],
    ["3.5", 3.5],
    ["", 0],
  ])("coerces %o to %o", (input, expected) => {
    expect(toNumber(input)).toBe(expected);
  });

  it.each([["abc"], [null], [undefined], [NaN], [Infinity], [{}]])(
    "falls back to 0 for %o",
    (input) => {
      expect(toNumber(input)).toBe(0);
    }
  );
});

describe("formatNumber / formatPercent", () => {
  it("groups thousands using the ambient locale", () => {
    expect(formatNumber(1234567)).toBe((1234567).toLocaleString());
  });

  it("renders non-numeric input as zero", () => {
    expect(formatNumber("oops")).toBe((0).toLocaleString());
  });

  it("fixes percentages to one decimal", () => {
    expect(formatPercent(12.345)).toBe("12.3");
    expect(formatPercent("bad")).toBe("0.0");
  });
});

describe("getLocalizedName", () => {
  const item = { name_th: "ไทย", name_en: "English" };

  it("returns the all-label for the '0' sentinel", () => {
    expect(getLocalizedName("0", item, "name_th", "name_en", t, i18nTh)).toBe(
      "text.all"
    );
  });

  it("picks the field matching the active language", () => {
    expect(getLocalizedName("1", item, "name_th", "name_en", t, i18nTh)).toBe(
      "ไทย"
    );
    expect(getLocalizedName("1", item, "name_th", "name_en", t, i18nEn)).toBe(
      "English"
    );
  });

  it("falls back to a dash when the item or field is missing", () => {
    expect(
      getLocalizedName("1", undefined, "name_th", "name_en", t, i18nTh)
    ).toBe("-");
    expect(getLocalizedName("1", {}, "name_th", "name_en", t, i18nTh)).toBe("-");
  });
});

describe("formatPhone", () => {
  it.each([
    ["0812345678", "081-234-5678"],
    ["081", "081"],
    ["081234", "081-234"],
    ["0812345", "081-234-5"],
  ])("formats %s as %s", (input, expected) => {
    expect(formatPhone(input)).toBe(expected);
  });

  it("strips non-digits and caps at 10 digits", () => {
    expect(formatPhone("(081) 234-5678")).toBe("081-234-5678");
    expect(formatPhone("08123456789999")).toBe("081-234-5678");
  });

  it("returns empty for missing input", () => {
    expect(formatPhone(undefined)).toBe("");
    expect(formatPhone("")).toBe("");
  });
});

describe("formatThaiID", () => {
  it("formats a full 13-digit national ID", () => {
    expect(formatThaiID("1234567890123")).toBe("1-2345-67890-12-3");
  });

  it.each([
    ["1", "1"],
    ["12345", "1-2345"],
    ["1234567890", "1-2345-67890"],
    ["123456789012", "1-2345-67890-12"],
  ])("formats the partial input %s as %s", (input, expected) => {
    expect(formatThaiID(input)).toBe(expected);
  });

  it("strips separators already present and caps at 13 digits", () => {
    expect(formatThaiID("1-2345-67890-12-3")).toBe("1-2345-67890-12-3");
    expect(formatThaiID("12345678901239999")).toBe("1-2345-67890-12-3");
  });

  it("returns empty for missing input", () => {
    expect(formatThaiID(undefined)).toBe("");
  });
});

describe("loadFont", () => {
  it("base64-encodes the fetched font bytes", async () => {
    const bytes = new Uint8Array([72, 101, 108, 108, 111]); // "Hello"
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => ({ arrayBuffer: async () => bytes.buffer }))
    );

    await expect(loadFont("/fonts/Sarabun-Regular.ttf")).resolves.toBe(
      btoa("Hello")
    );
  });
});

describe("loadImageAsBase64", () => {
  const asDataUrl = (blob: Blob) =>
    new Promise<string>((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.readAsDataURL(blob);
    });

  it("returns the image as a data URL", async () => {
    const blob = new Blob(["png-bytes"], { type: "image/png" });
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => ({ ok: true, blob: async () => blob }))
    );

    await expect(loadImageAsBase64("/logo.png")).resolves.toBe(
      await asDataUrl(blob)
    );
  });

  it("falls back to the placeholder on a non-OK response", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    vi.stubGlobal("fetch", vi.fn(async () => ({ ok: false })));

    await expect(loadImageAsBase64("/missing.png")).resolves.toMatch(
      /^data:image\/png;base64,/
    );
  });

  it("falls back to the placeholder when the request throws", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => {
        throw new Error("network down");
      })
    );

    await expect(loadImageAsBase64("/x.png")).resolves.toMatch(
      /^data:image\/png;base64,/
    );
  });
});
