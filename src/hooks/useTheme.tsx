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
*/

function hex2rgb(hex: string): string {
  return [
    parseInt(hex.slice(1, 3), 16),
    parseInt(hex.slice(3, 5), 16),
    parseInt(hex.slice(5, 7), 16),
  ].join(", ");
}

function buildTheme(
  name: string,
  mainBgColor: string,
  primaryColor: string,
  secondaryColor: string,
  tertiaryColor: string,
  isDark = false
) {
  return {
    name,
    isDark,

    colors: {
      "--main-bg-color": mainBgColor,

      "--primary-color": primaryColor,
      "--primary-color-rgb": hex2rgb(primaryColor),

      "--secondary-color": secondaryColor,
      "--secondary-color-rgb": hex2rgb(secondaryColor),

      "--tertiary-color": tertiaryColor,
      "--tertiary-color-rgb": hex2rgb(tertiaryColor),

      "--text-color": isDark ? "white" : "black",
    },
  };
}

const themes = {
  // ── Light Themes ─────────────────────────────────────────

  linen: buildTheme(
    // Warm neutral ivory — comfortable, editorial
    'Linen',
    '#F3F1EE',  // Warm Ivory
    '#5E606E',  // Slate Blue
    '#3D4470',  // Deep Slate-Blue (accentSoft — was washed Quick Silver #B1A6A4)
    '#DDD6D2',  // Warm Gray
  ),

  arctic: buildTheme(
    // Cold ocean teal — professional, clear
    'Arctic',
    '#F4F7F6',  // White Smoke
    '#2A7580',  // Deep Teal
    '#144A52',  // Dark Teal (accentSoft — was washed Moonstone #6FB3B8)
    '#B5DBDF',  // Powder Blue
  ),

  rosewood: buildTheme(
    // Soft blush — bold deep rose
    'Rosewood',
    '#FEF3F3',  // Lavender Blush
    '#A84C55',  // Deep Rose
    '#5E2830',  // Dark Rose (accentSoft — was pale French Beige #D1A080)
    '#E8CECE',  // Tea Rose
  ),

  amethyst: buildTheme(
    // Rich lavender — purple depth
    'Amethyst',
    '#EDEAF2',  // Soft Lavender Blush
    '#6560B0',  // Toolbox Purple
    '#3A2868',  // Deep Indigo (accentSoft — was bright Lavender #BD9DEA)
    '#CFC7E2',  // Lavender Panel
  ),

  cerulean: buildTheme(
    // Deep ocean blue — bold water
    'Cerulean',
    '#E4EEF8',  // Glitter Blue
    '#1C68B4',  // Deep Cerulean
    '#0C3055',  // Dark Navy (accentSoft — was mid-blue #7aaed0)
    '#A8D0E0',  // Powder Blue
  ),

  ember: buildTheme(
    // Warm orange fire — earthy heat
    'Ember',
    '#FFF0E6',  // Linen
    '#E04A00',  // Orange Pantone
    '#7A2500',  // Dark Burnt Orange (accentSoft — was pale Copper #CF8B64)
    '#EAD0C0',  // Dust Storm
  ),

  pacific: buildTheme(
    // Sky and sea blue — bold, energetic
    'Pacific',
    '#EEF4F8',  // Light Blue Tint
    '#2E7EC0',  // Carolina Blue
    '#0F3860',  // Deep Navy (accentSoft — was Sea Serpent #53BAC1)
    '#C0D8EE',  // Light Blue
  ),

  crimson: buildTheme(
    // English red on warm ivory — vivid and sharp
    'Crimson',
    '#F5F0F0',  // Warm Ivory
    '#C03038',  // English Red
    '#6A1818',  // Dark Crimson (accentSoft — was Spanish Gray #8C8C8C, ~2.7:1 fail)
    '#EEC8C5',  // Orchid Pink
  ),

  cobalt: buildTheme(
    // Deep indigo — ocean monochrome authority
    'Cobalt',
    '#FAFAF8',  // Baby Powder
    '#3840B0',  // Ocean Blue
    '#181880',  // Deep Indigo (accentSoft — was mid Toolbox #6F7BC5)
    '#BDC8E8',  // Pale Aqua
  ),

  royal: buildTheme(
    // Deep navy — authoritative command
    'Royal',
    '#F8F9FC',  // White
    '#0D2E7F',  // Royal Blue
    '#1A3A88',  // Medium-Dark Royal Blue (accentSoft — was Payne's Grey #535F80)
    '#DBE3EF',  // Glitter
  ),

  aura: buildTheme(
    // Cool lavender-gray bg + vibrant purple — matches the dribbble light palette
    'Aura',
    '#EDEEF5',  // Light lavender-gray (body bg — image primary bg)
    '#5B4CF7',  // Vibrant purple (accent: buttons, glow, active)
    '#2A15A0',  // Deep indigo (accentSoft: titles, nav labels — 10:1 on body bg)
    '#CCCAE8',  // Soft lavender (panel bg, borders)
  ),

  // ── Dark Themes ──────────────────────────────────────────

  jungle: buildTheme(
    // Earthy dark green + warm gold — organic
    'Jungle',
    '#2A2115',  // Bistre
    '#78B83C',  // Palm Leaf
    '#E8CC5A',  // Bright Gold (accentSoft — brighter than #C7AB59)
    '#3C3020',  // Dark Earth
    true,
  ),

  midnight: buildTheme(
    // Deep navy — authority in darkness
    'Midnight',
    '#08101E',  // Maastricht Blue
    '#4E96E8',  // Steel Blue
    '#B0C8E0',  // Light Steel Blue (accentSoft — was dim Shadow Blue #7b9cc0)
    '#101C30',  // Oxford Blue
    true,
  ),

  slate: buildTheme(
    // Dark gray + teal — industrial precision
    'Slate',
    '#2E2E32',  // Onyx
    '#3C9CB0',  // Queen Blue
    '#C8C8C5',  // Bright Taupe (accentSoft — was dark Taupe Gray #8D8C8A)
    '#404044',  // Dim Gray
    true,
  ),

  cyber: buildTheme(
    // Dark navy + mint — cyberpunk glow
    'Cyber',
    '#262840',  // Gunmetal
    '#2ECFA5',  // Keppel Mint
    '#A8D8CC',  // Light Mint (accentSoft — was dim Rhythm #707793, wrong hue entirely)
    '#32365C',  // Arsenic
    true,
  ),

  onyx: buildTheme(
    // Near-black + red — maximum drama
    'Onyx',
    '#161418',  // Eerie Black
    '#EE3530',  // Geranium Red
    '#C8C7C5',  // Light Silver (accentSoft — was dim Spanish Gray #959794)
    '#242228',  // Dark Gray
    true,
  ),

  carbon: buildTheme(
    // Pure grayscale — minimal, typographic
    'Carbon',
    '#1A1A1A',  // Raisin Black
    '#A0A0A0',  // Gray
    '#D0D0D0',  // Bright Silver (accentSoft — was Dim Gray #6B6B6B, only ~3.1:1!)
    '#2A2A2A',  // Dark Charcoal
    true,
  ),

  spectra: buildTheme(
    // Deep indigo + vibrant purple + lime — maximum contrast
    'Spectra',
    '#1C1A2E',  // Very dark indigo (body bg)
    '#5B4CF7',  // Vibrant purple (accent: buttons, active, glow)
    '#C6F754',  // Bright lime (accentSoft: titles, nav labels — 14:1 on dark bg)
    '#272440',  // Dark purple panel
    true,
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

    Object.entries({
      '--main-bg-color': theme.colors['--main-bg-color'],
      '--primary-color': theme.colors['--primary-color'],
      '--primary-color-rgb': theme.colors['--primary-color-rgb'],
      '--secondary-color': theme.colors['--secondary-color'],
      '--secondary-color-rgb': theme.colors['--secondary-color-rgb'],
      '--tertiary-color': theme.colors['--tertiary-color'],
      '--tertiary-color-rgb': theme.colors['--tertiary-color-rgb'],
      '--text-color': theme.colors['--text-color'],
    }).forEach(([key, value]) => root.style.setProperty(key, value));
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
