import { describe, it, expect, vi } from "vitest";
import { render, screen, act } from "@testing-library/react";

import { ThemeProvider, useTheme, themes } from "./useTheme";

const Probe = () => {
  const { themeName, setThemeName, theme } = useTheme();
  return (
    <div>
      <span data-testid="name">{themeName}</span>
      <span data-testid="label">{theme.name}</span>
      <span data-testid="dark">{String(theme.isDark)}</span>
      <button onClick={() => setThemeName("onyx")}>onyx</button>
    </div>
  );
};

const renderProbe = () =>
  render(
    <ThemeProvider>
      <Probe />
    </ThemeProvider>
  );

const cssVar = (name: string) =>
  document.documentElement.style.getPropertyValue(name);

describe("ThemeProvider", () => {
  it("defaults to arctic with no stored preference", () => {
    renderProbe();
    expect(screen.getByTestId("name")).toHaveTextContent("arctic");
    expect(screen.getByTestId("label")).toHaveTextContent("Arctic");
  });

  it("restores a stored theme", () => {
    localStorage.setItem("wd2-theme", "midnight");
    renderProbe();
    expect(screen.getByTestId("name")).toHaveTextContent("midnight");
    expect(screen.getByTestId("dark")).toHaveTextContent("true");
  });

  it("falls back to the default for an unknown stored value", () => {
    localStorage.setItem("wd2-theme", "not-a-theme");
    renderProbe();
    expect(screen.getByTestId("name")).toHaveTextContent("arctic");
  });

  it("writes the palette to CSS custom properties on the root element", () => {
    renderProbe();
    expect(cssVar("--main-bg-color")).toBe(
      themes.arctic.colors["--main-bg-color"]
    );
    expect(cssVar("--primary-color")).toBe(
      themes.arctic.colors["--primary-color"]
    );
    expect(cssVar("--text-color")).toBe("black");
  });

  it("derives the rgb triplet from the hex palette", () => {
    renderProbe();
    // Arctic primary #2A7580
    expect(cssVar("--primary-color-rgb")).toBe("42, 117, 128");
  });

  it("stamps data-theme for CSS selectors to hook onto", () => {
    localStorage.setItem("wd2-theme", "cyber");
    renderProbe();
    expect(document.documentElement.getAttribute("data-theme")).toBe("cyber");
  });

  it("persists and repaints when the theme changes", async () => {
    renderProbe();

    await act(async () => {
      screen.getByRole("button", { name: "onyx" }).click();
    });

    expect(screen.getByTestId("name")).toHaveTextContent("onyx");
    expect(localStorage.getItem("wd2-theme")).toBe("onyx");
    expect(document.documentElement.getAttribute("data-theme")).toBe("onyx");
    expect(cssVar("--main-bg-color")).toBe(
      themes.onyx.colors["--main-bg-color"]
    );
    expect(cssVar("--text-color")).toBe("white");
  });

  it("marks light themes as not dark", () => {
    expect(themes.arctic.isDark).toBe(false);
    expect(themes.linen.isDark).toBe(false);
  });

  it("exposes every palette variable for each theme", () => {
    for (const theme of Object.values(themes)) {
      expect(theme.colors["--main-bg-color"]).toMatch(/^#[0-9A-Fa-f]{6}$/);
      expect(theme.colors["--primary-color-rgb"]).toMatch(
        /^\d{1,3}, \d{1,3}, \d{1,3}$/
      );
    }
  });
});

describe("useTheme", () => {
  it("throws when used outside the provider", () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    expect(() => render(<Probe />)).toThrow(
      "useTheme must be used inside ThemeProvider"
    );
  });
});
