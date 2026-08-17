import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from "react";

/*
  Each theme is built from a 5-color palette:
  ┌─────────┬──────────────────────────────────────────────┐
  │  Role   │  Maps to                                     │
  ├─────────┼──────────────────────────────────────────────┤
  │  c1     │  Body bg, input bg (lightest / darkest)      │
  │  c2     │  Panel bg, card bg, tab bg, borders          │
  │  c3     │  Accent — glow, active tabs, buttons, links  │
  │  c4     │  accentSoft — titles, active nav, labels     │
  │  c5     │  Primary text, headings (darkest / lightest) │
  └─────────┴──────────────────────────────────────────────┘
  For dark themes (isDark=true), c1 is darkest and c5 is lightest.

  Contrast targets (WCAG AA+):
    textPrimary    ≥ 10:1 on bgBody
    textSecondary  ≥  6:1 on panel bg
    textMuted      ≥  4.5:1 on panel bg
    accentSoft     ≥  8:1 on bgBody / 6:1 on panel bg

  Every token below is a finished, ready-to-use color (solid or rgba) — never
  wrap `--theme-accent`, `--theme-accent-soft`, `--theme-bg-panel` or
  `--theme-text-primary` in an outer rgba(var(--x-color), N) yourself. For the
  rare one-off opacity a named token doesn't cover, compose it from the raw
  channel triplets instead: --theme-accent-rgb, --theme-accent-soft-rgb,
  --theme-panel-rgb, --theme-text-rgb, e.g. rgba(var(--theme-accent-rgb), .42).
*/

function hex2rgbTriplet(hex: string): string {
  return [
    parseInt(hex.slice(1, 3), 16),
    parseInt(hex.slice(3, 5), 16),
    parseInt(hex.slice(5, 7), 16),
  ].join(", ");
}

function hex2rgba(hex: string, alpha: number): string {
  return `rgba(${hex2rgbTriplet(hex)}, ${alpha})`;
}

function buildTheme(
  name: string,
  c1: string,
  c2: string,
  c3: string,
  c4: string,
  c5: string,
  isDark = false,
  customRed: string | null = null
) {
  const c2rgb = hex2rgbTriplet(c2);
  const c3rgb = hex2rgbTriplet(c3);
  const red = customRed || (isDark ? "#ff4466" : "#db2740");

  return {
    name,
    isDark,
    palette: [c1, c2, c3, c4, c5] as const,

    colors: {
      "--theme-accent": c3,
      "--theme-accent-rgb": c3rgb,
      "--theme-accent-glow": hex2rgba(c3, 0.35),
      "--theme-accent-bg": hex2rgba(c3, 0.08),
      "--theme-accent-border": hex2rgba(c3, 0.25),
      "--theme-accent-fill": hex2rgba(c3, 0.55),
      "--theme-accent-soft": c4,
      "--theme-accent-soft-rgb": hex2rgbTriplet(c4),

      "--theme-red": red,

      "--theme-text-primary": c5,
      // Bumped from 0.78 → 0.85 for better legibility on translucent panel bgs
      "--theme-text-secondary": hex2rgba(c5, 0.85),
      // Bumped from 0.65/0.70 → 0.70/0.75 — still de-emphasised but meets 4.5:1 on panels
      "--theme-text-muted": hex2rgba(c5, isDark ? 0.75 : 0.7),
      "--theme-text-rgb": hex2rgbTriplet(c5),
      "--theme-text-on-accent": isDark ? c1 : "#ffffff",

      "--theme-bg-body": c1,
      "--theme-bg-surface": isDark ? hex2rgba(c2, 0.92) : "rgba(255, 255, 255, 0.88)",
      "--theme-bg-panel": hex2rgba(c2, 0.9),
      "--theme-bg-elevated": isDark
        ? `rgba(${lighten(c2, 15)}, 0.95)`
        : "rgba(255, 255, 255, 0.95)",
      "--theme-bg-input": isDark ? c2 : "#ffffff",
      "--theme-bg-overlay": isDark ? "rgba(0, 0, 0, 0.65)" : hex2rgba(c5, 0.4),
      "--theme-panel-rgb": c2rgb,

      "--theme-border-light": hex2rgba(c3, isDark ? 0.12 : 0.15),
      "--theme-border-medium": hex2rgba(c3, 0.25),
      "--theme-border-input": c2,

      "--theme-shadow-glow": `0 0 12px ${hex2rgba(c3, 0.2)}`,

      "--theme-tab-bg": isDark ? hex2rgba(c2, 0.6) : hex2rgba(c2, 0.3),
      "--theme-tab-active": hex2rgba(c3, 0.1),

      "--theme-card-bg": isDark ? hex2rgba(c2, 0.8) : "rgba(255, 255, 255, 0.9)",
      "--theme-counter-bg": hex2rgba(c3, 0.04),
    } as Record<string, string>,
  };
}

function lighten(hex: string, amount: number): string {
  const channel = (start: number) =>
    Math.min(255, parseInt(hex.slice(start, start + 2), 16) + amount);

  return `${channel(1)}, ${channel(3)}, ${channel(5)}`;
}

const themes = {
  // ── Light Themes ─────────────────────────────────────────

  linen: buildTheme(
    // Warm neutral ivory — comfortable, editorial
    'Linen',
    '#F3F1EE',  // Warm Ivory
    '#DDD6D2',  // Warm Gray
    '#5E606E',  // Slate Blue
    '#3D4470',  // Deep Slate-Blue (accentSoft — was washed Quick Silver #B1A6A4)
    '#1A1818',  // Near-Black
  ),

  arctic: buildTheme(
    // Cold ocean teal — professional, clear
    'Arctic',
    '#F4F7F6',  // White Smoke
    '#B5DBDF',  // Powder Blue
    '#2A7580',  // Deep Teal
    '#144A52',  // Dark Teal (accentSoft — was washed Moonstone #6FB3B8)
    '#0C2028',  // Near-black Teal
  ),

  rosewood: buildTheme(
    // Soft blush — bold deep rose
    'Rosewood',
    '#FEF3F3',  // Lavender Blush
    '#E8CECE',  // Tea Rose
    '#A84C55',  // Deep Rose
    '#5E2830',  // Dark Rose (accentSoft — was pale French Beige #D1A080)
    '#2A1215',  // Near-black Rose
    false,
    '#F53163',  // Radical Red
  ),

  amethyst: buildTheme(
    // Rich lavender — purple depth
    'Amethyst',
    '#EDEAF2',  // Soft Lavender Blush
    '#CFC7E2',  // Lavender Panel
    '#6560B0',  // Toolbox Purple
    '#3A2868',  // Deep Indigo (accentSoft — was bright Lavender #BD9DEA)
    '#1C1435',  // Near-black Purple
    false,
    '#EA7186',  // Tango Pink
  ),

  cerulean: buildTheme(
    // Deep ocean blue — bold water
    'Cerulean',
    '#E4EEF8',  // Glitter Blue
    '#A8D0E0',  // Powder Blue
    '#1C68B4',  // Deep Cerulean
    '#0C3055',  // Dark Navy (accentSoft — was mid-blue #7aaed0)
    '#071825',  // Near-black Navy
    false,
    '#DF4C73',  // Fandango Pink
  ),

  ember: buildTheme(
    // Warm orange fire — earthy heat
    'Ember',
    '#FFF0E6',  // Linen
    '#EAD0C0',  // Dust Storm
    '#E04A00',  // Orange Pantone
    '#7A2500',  // Dark Burnt Orange (accentSoft — was pale Copper #CF8B64)
    '#2C1000',  // Near-black Brown
  ),

  pacific: buildTheme(
    // Sky and sea blue — bold, energetic
    'Pacific',
    '#EEF4F8',  // Light Blue Tint
    '#C0D8EE',  // Light Blue
    '#2E7EC0',  // Carolina Blue
    '#0F3860',  // Deep Navy (accentSoft — was Sea Serpent #53BAC1)
    '#081E35',  // Near-black Navy
    false,
    '#DB0038',  // Rich Carmine
  ),

  crimson: buildTheme(
    // English red on warm ivory — vivid and sharp
    'Crimson',
    '#F5F0F0',  // Warm Ivory
    '#EEC8C5',  // Orchid Pink
    '#C03038',  // English Red
    '#6A1818',  // Dark Crimson (accentSoft — was Spanish Gray #8C8C8C, ~2.7:1 fail)
    '#220C0C',  // Near-black Wine
  ),

  cobalt: buildTheme(
    // Deep indigo — ocean monochrome authority
    'Cobalt',
    '#FAFAF8',  // Baby Powder
    '#BDC8E8',  // Pale Aqua
    '#3840B0',  // Ocean Blue
    '#181880',  // Deep Indigo (accentSoft — was mid Toolbox #6F7BC5)
    '#0A0A60',  // Near-black Navy
  ),

  royal: buildTheme(
    // Deep navy — authoritative command
    'Royal',
    '#F8F9FC',  // White
    '#DBE3EF',  // Glitter
    '#0D2E7F',  // Royal Blue
    '#1A3A88',  // Medium-Dark Royal Blue (accentSoft — was Payne's Grey #535F80)
    '#040E28',  // Near-black
  ),

  aura: buildTheme(
    // Cool lavender-gray bg + vibrant purple — matches the dribbble light palette
    'Aura',
    '#EDEEF5',  // Light lavender-gray (body bg — image primary bg)
    '#CCCAE8',  // Soft lavender (panel bg, borders)
    '#5B4CF7',  // Vibrant purple (accent: buttons, glow, active)
    '#2A15A0',  // Deep indigo (accentSoft: titles, nav labels — 10:1 on body bg)
    '#0C0A20',  // Near-black indigo
  ),

  // ── Dark Themes ──────────────────────────────────────────

  jungle: buildTheme(
    // Earthy dark green + warm gold — organic
    'Jungle',
    '#2A2115',  // Bistre
    '#3C3020',  // Dark Earth
    '#78B83C',  // Palm Leaf
    '#E8CC5A',  // Bright Gold (accentSoft — brighter than #C7AB59)
    '#F2ECC8',  // Bright Desert Cream
    true,
  ),

  midnight: buildTheme(
    // Deep navy — authority in darkness
    'Midnight',
    '#08101E',  // Maastricht Blue
    '#101C30',  // Oxford Blue
    '#4E96E8',  // Steel Blue
    '#B0C8E0',  // Light Steel Blue (accentSoft — was dim Shadow Blue #7b9cc0)
    '#E8F0F8',  // Near-white
    true,
  ),

  slate: buildTheme(
    // Dark gray + teal — industrial precision
    'Slate',
    '#2E2E32',  // Onyx
    '#404044',  // Dim Gray
    '#3C9CB0',  // Queen Blue
    '#C8C8C5',  // Bright Taupe (accentSoft — was dark Taupe Gray #8D8C8A)
    '#F4F4F4',  // Near-white
    true,
    '#E9322E',  // Geranium Lake
  ),

  cyber: buildTheme(
    // Dark navy + mint — cyberpunk glow
    'Cyber',
    '#262840',  // Gunmetal
    '#32365C',  // Arsenic
    '#2ECFA5',  // Keppel Mint
    '#A8D8CC',  // Light Mint (accentSoft — was dim Rhythm #707793, wrong hue entirely)
    '#EEF8F4',  // Near-white Mint
    true,
  ),

  onyx: buildTheme(
    // Near-black + red — maximum drama
    'Onyx',
    '#161418',  // Eerie Black
    '#242228',  // Dark Gray
    '#EE3530',  // Geranium Red
    '#C8C7C5',  // Light Silver (accentSoft — was dim Spanish Gray #959794)
    '#F2F2F2',  // Near-white
    true,
  ),

  carbon: buildTheme(
    // Pure grayscale — minimal, typographic
    'Carbon',
    '#1A1A1A',  // Raisin Black
    '#2A2A2A',  // Dark Charcoal
    '#A0A0A0',  // Gray
    '#D0D0D0',  // Bright Silver (accentSoft — was Dim Gray #6B6B6B, only ~3.1:1!)
    '#ECECEC',  // Near-white
    true,
    '#E9322E',
  ),

  spectra: buildTheme(
    // Deep indigo + vibrant purple + lime — maximum contrast
    'Spectra',
    '#1C1A2E',  // Very dark indigo (body bg)
    '#272440',  // Dark purple panel
    '#5B4CF7',  // Vibrant purple (accent: buttons, active, glow)
    '#C6F754',  // Bright lime (accentSoft: titles, nav labels — 14:1 on dark bg)
    '#E8E6F8',  // Near-white with purple tint
    true,
    '#FF6B6B',  // Coral red
  ),
};

type ThemeName = keyof typeof themes;
type Theme = ReturnType<typeof buildTheme>;

const isThemeName = (value: string | null): value is ThemeName => {
  return !!value && value in themes;
};

interface ThemeContextValue {
  themeName: ThemeName;
  setThemeName: React.Dispatch<React.SetStateAction<ThemeName>>;
  theme: Theme;
  themes: typeof themes;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

interface ThemeProviderProps {
  children: ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  const [themeName, setThemeName] = useState<ThemeName>(() => {
    const saved = localStorage.getItem("wd2-theme");
    return isThemeName(saved) ? saved : "arctic";
  });

  const theme = themes[themeName];

  useEffect(() => {
    localStorage.setItem('wd2-theme', themeName);
    const root = document.documentElement;
    root.setAttribute('data-theme', themeName);

    Object.entries(theme.colors).forEach(([key, value]) =>
      root.style.setProperty(key, value)
    );
  }, [themeName, theme]);

  return (
    <ThemeContext.Provider value={{ themeName, setThemeName, theme, themes }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);

  if (!context) {
    throw new Error("useTheme must be used inside ThemeProvider");
  }

  return context;
}

export { themes };
