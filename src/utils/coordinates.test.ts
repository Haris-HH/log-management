import { describe, it, expect } from "vitest";

import {
  isValidLatitude,
  isValidLongitude,
  parseCoordinates,
  parseCoordinatesWith2Param,
} from "./coordinates";

describe("isValidLatitude", () => {
  it.each([0, 13.7563, 90, -90])("accepts %s", (lat) => {
    expect(isValidLatitude(lat)).toBe(true);
  });

  it.each([90.1, -90.1, NaN, 1000])("rejects %s", (lat) => {
    expect(isValidLatitude(lat)).toBe(false);
  });
});

describe("isValidLongitude", () => {
  it.each([0, 100.5018, 180, -180])("accepts %s", (lng) => {
    expect(isValidLongitude(lng)).toBe(true);
  });

  it.each([180.1, -180.1, NaN])("rejects %s", (lng) => {
    expect(isValidLongitude(lng)).toBe(false);
  });
});

describe("parseCoordinates", () => {
  it("parses a comma-separated pair", () => {
    expect(parseCoordinates("13.7563, 100.5018")).toEqual({
      lat: 13.7563,
      lng: 100.5018,
    });
  });

  it("tolerates surrounding whitespace", () => {
    expect(parseCoordinates("  13.7563 ,  100.5018  ")).toEqual({
      lat: 13.7563,
      lng: 100.5018,
    });
  });

  it("handles negative values", () => {
    expect(parseCoordinates("-33.86,151.2")).toEqual({
      lat: -33.86,
      lng: 151.2,
    });
  });

  it.each([
    ["13.7563"],
    ["13.7563,100.5018,5"],
    ["abc,def"],
    [""],
    ["91,100"],
    ["13,181"],
  ])("returns null for %o", (input) => {
    expect(parseCoordinates(input)).toBeNull();
  });
});

describe("parseCoordinatesWith2Param", () => {
  it("parses two numeric strings", () => {
    expect(parseCoordinatesWith2Param("13.7563", "100.5018")).toEqual({
      lat: 13.7563,
      lng: 100.5018,
    });
  });

  it.each([
    ["abc", "100.5"],
    ["13.7", "xyz"],
    ["91", "100"],
    ["13", "181"],
    ["", ""],
  ])("returns null for (%o, %o)", (lat, lng) => {
    expect(parseCoordinatesWith2Param(lat, lng)).toBeNull();
  });
});
