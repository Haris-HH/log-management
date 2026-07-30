/*
  This is a React context module: like `useTheme`, it deliberately exports the
  provider component alongside the `useNavPosition` hook and the
  `NAV_POSITIONS` list that consumers need. Splitting them apart only to
  satisfy Fast Refresh would fragment the definition for no runtime benefit.
*/
/* eslint-disable react-refresh/only-export-components */
import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from "react";
import { useLocation } from "react-router-dom";

// Material UI
import useMediaQuery from "@mui/material/useMediaQuery";

/*
  Where the navigation menu lives. Each edge is a genuinely different control,
  not one widget being moved around:
    bottom       → the floating DockDrawer
    top          → an inline menu in the Navbar (a drawer on mobile)
    left / right → a drawer opened by the Navbar hamburger
*/
export type NavPosition = "left" | "top" | "right" | "bottom";

/* Ordered as they read in the picker, not as they render. */
export const NAV_POSITIONS: NavPosition[] = ["left", "top", "right", "bottom"];

/* Width of the left/right drawer. Lives here rather than in the component so
   that `useNavLayout` can reach it without importing the component it feeds. */
export const NAV_SIDEBAR_WIDTH = 264;

/* Below this the drawer overlays instead of pinning, and the Navbar collapses
   to its compact form. Matches Tailwind's `lg` breakpoint. */
export const NAV_DESKTOP_BREAKPOINT = 1024;

const POSITION_KEY = "wd2-nav-position";
const SIDEBAR_KEY = "wd2-nav-sidebar-open";

/* "bottom" reproduces the dock's original hard-coded placement. */
const DEFAULT_NAV_POSITION: NavPosition = "bottom";

const isNavPosition = (value: string | null): value is NavPosition => {
  return !!value && (NAV_POSITIONS as string[]).includes(value);
};

interface NavPositionContextValue {
  navPosition: NavPosition;
  setNavPosition: React.Dispatch<React.SetStateAction<NavPosition>>;
  /* Desktop drawer visibility for left/right. Persisted: a user who closed the
     sidebar should not find it reopened on the next page load. */
  sidebarOpen: boolean;
  setSidebarOpen: React.Dispatch<React.SetStateAction<boolean>>;
  /* The temporary mobile drawer. Deliberately not persisted — an overlay that
     restored itself open on load would cover the page. */
  mobileNavOpen: boolean;
  setMobileNavOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

const NavPositionContext = createContext<NavPositionContextValue | undefined>(
  undefined
);

interface NavPositionProviderProps {
  children: ReactNode;
}

export function NavPositionProvider({ children }: NavPositionProviderProps) {
  const [navPosition, setNavPosition] = useState<NavPosition>(() => {
    const saved = localStorage.getItem(POSITION_KEY);

    return isNavPosition(saved) ? saved : DEFAULT_NAV_POSITION;
  });

  const [sidebarOpen, setSidebarOpen] = useState<boolean>(() => {
    return localStorage.getItem(SIDEBAR_KEY) !== "false";
  });

  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem(POSITION_KEY, navPosition);
  }, [navPosition]);

  useEffect(() => {
    localStorage.setItem(SIDEBAR_KEY, String(sidebarOpen));
  }, [sidebarOpen]);

  return (
    <NavPositionContext.Provider
      value={{
        navPosition,
        setNavPosition,
        sidebarOpen,
        setSidebarOpen,
        mobileNavOpen,
        setMobileNavOpen,
      }}
    >
      {children}
    </NavPositionContext.Provider>
  );
}

export function useNavPosition() {
  const context = useContext(NavPositionContext);

  if (!context) {
    throw new Error("useNavPosition must be used inside NavPositionProvider");
  }

  return context;
}

/**
 * Resolves the raw settings into the layout facts Navbar and MainLayout both
 * need. Kept in one place so the two can never disagree about whether the
 * drawer is pinned — a disagreement would show up as the navbar overlapping the
 * sidebar, or as a strip of dead space beside it.
 */
export function useNavLayout() {
  const { navPosition, sidebarOpen } = useNavPosition();
  const location = useLocation();

  const isWideViewport = useMediaQuery(
    `(min-width:${NAV_DESKTOP_BREAKPOINT}px)`
  );

  /*
    Home is a landing page with its own menu, so it carries no navigation — the
    rule the dock has always followed, now applied to every shape.
  */
  const showNav = location.pathname !== "/";

  const isSidebarPosition = navPosition === "left" || navPosition === "right";

  /*
    Only a pinned drawer reserves space. The mobile drawer is a temporary
    overlay and the dock floats, so neither shifts the navbar or the page.
  */
  const sidebarPinned =
    showNav && isSidebarPosition && isWideViewport && sidebarOpen;

  const sidebarOffset = sidebarPinned ? NAV_SIDEBAR_WIDTH : 0;

  return {
    navPosition,
    showNav,
    isSidebarPosition,
    isWideViewport,
    sidebarPinned,
    sidebarOffset,
  };
}
