import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach, beforeEach, vi } from "vitest";

// react-i18next: render keys verbatim so assertions are stable and no XHR
// backend is needed. `t("a.b")` -> "a.b".
//
// `t` and `i18n` are module-level singletons on purpose: the real library hands
// back referentially stable values for a given language, and hooks here memoise
// on `[t, i18n.language]`. Returning fresh objects per render would silently
// break those memos under test only.
vi.mock("react-i18next", () => {
  const t = (key: string) => key;
  const i18n = { language: "th", changeLanguage: vi.fn() };

  return {
    useTranslation: () => ({ t, i18n }),
    initReactI18next: { type: "3rdParty", init: vi.fn() },
    Trans: ({ children }: { children?: unknown }) => children,
  };
});

beforeEach(() => {
  localStorage.clear();
});

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});
