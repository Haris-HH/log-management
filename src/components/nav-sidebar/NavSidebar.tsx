import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

// Material UI
import Box from "@mui/material/Box";
import Collapse from "@mui/material/Collapse";
import Drawer from "@mui/material/Drawer";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import useMediaQuery from "@mui/material/useMediaQuery";

import CloseIcon from "@mui/icons-material/Close";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";

// Types
import type { DockItem } from "../../hooks/useDockItems";

// Hooks
import { useDockItems, isDockItemActive } from "../../hooks/useDockItems";
import {
  useNavPosition,
  NAV_SIDEBAR_WIDTH,
  NAV_DESKTOP_BREAKPOINT,
} from "../../hooks/useNavPosition";

// i18n
import { useTranslation } from "react-i18next";

/*
  The drawer runs the full height of the viewport and the Navbar shifts aside to
  make room, so the two sit side by side rather than overlapping. This matches
  the navbar's fixed height so the close button lines up with the navbar's own
  controls across the seam.
*/
const NAVBAR_HEIGHT = 64;

const rowSx = (active: boolean) => ({
  display: "flex",
  alignItems: "center",
  gap: 1.5,
  width: "100%",
  px: 1.5,
  py: 1.2,
  borderRadius: "12px",
  cursor: "pointer",
  color: "var(--primary-color)",
  opacity: active ? 1 : 0.75,
  backgroundColor: active
    ? "rgba(var(--primary-color-rgb), 0.12)"
    : "transparent",
  border: active
    ? "1px solid rgba(var(--primary-color-rgb), 0.35)"
    : "1px solid transparent",
  transition: "background-color 0.2s, opacity 0.2s",
  "&:hover": {
    opacity: 1,
    backgroundColor: "rgba(var(--primary-color-rgb), 0.08)",
  },
});

const labelSx = {
  fontSize: "0.85rem",
  whiteSpace: "nowrap",
  overflow: "hidden",
  textOverflow: "ellipsis",
};

/**
 * Vertical navigation drawer for the `left` / `right` positions, and the
 * fallback for `top` on mobile where an inline navbar menu will not fit.
 *
 * Two variants of one component: `persistent` on desktop, where MainLayout
 * reserves matching space so the drawer never overlaps page content; and
 * `temporary` on mobile, where it overlays with a backdrop. Opening is always
 * the Navbar hamburger — this closes itself via the X (desktop) or the backdrop
 * (mobile), which is why the hamburger disappears while it is open.
 */
const NavSidebar = () => {
  const {
    navPosition,
    sidebarOpen,
    setSidebarOpen,
    mobileNavOpen,
    setMobileNavOpen,
  } = useNavPosition();

  const dockItems = useDockItems();
  const navigate = useNavigate();
  const location = useLocation();

  // i18n
  const { t } = useTranslation();

  const isDesktop = useMediaQuery(`(min-width:${NAV_DESKTOP_BREAKPOINT}px)`);

  /* `top` only reaches this component on mobile, where it opens from the left. */
  const anchor = navPosition === "right" ? "right" : "left";
  const isTemporary = !isDesktop;

  const open = isTemporary ? mobileNavOpen : sidebarOpen;

  const handleClose = () => {
    if (isTemporary) {
      setMobileNavOpen(false);
    } else {
      setSidebarOpen(false);
    }
  };

  const handleNavigate = (path?: string) => {
    if (!path) return;

    navigate(path);

    /* The pinned desktop drawer stays put; the overlay has to get out of the way. */
    if (isTemporary) setMobileNavOpen(false);
  };

  return (
    <Drawer
      anchor={anchor}
      open={open}
      onClose={handleClose}
      variant={isTemporary ? "temporary" : "persistent"}
      /*
        Both variants run the full height of the viewport. The pinned one never
        meets the navbar — the navbar shifts aside for it — so it can sit at the
        usual depth. The overlay one does meet it, and has to win: the navbar is
        `modal + 1`, so anything lower would clip this drawer's close button
        behind it and leave the drawer unclosable except via the backdrop.
      */
      sx={{
        zIndex: (muiTheme) =>
          isTemporary ? muiTheme.zIndex.modal + 2 : muiTheme.zIndex.appBar,
      }}
      slotProps={{
        paper: {
          sx: {
            width: NAV_SIDEBAR_WIDTH,
            height: "100%",
            backgroundImage: "none",
            background:
              "linear-gradient(180deg, rgba(var(--tertiary-color-rgb),1), rgba(var(--tertiary-color-rgb),0.92))",
            backdropFilter: "blur(20px)",
            WebkitBackdropFilter: "blur(20px)",
            border: "none",
            [anchor === "left" ? "borderRight" : "borderLeft"]:
              "1px solid rgba(var(--primary-color-rgb), 0.18)",
            overflowX: "hidden",
          },
        },
      }}
    >
      <Box
        component="nav"
        aria-label={t("nav.menu")}
        sx={{ p: 1, display: "flex", flexDirection: "column", gap: 0.5 }}
      >
        {/* The hamburger "becomes" this X while the drawer is open. */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            minHeight: `${NAVBAR_HEIGHT}px`,
            justifyContent: anchor === "left" ? "flex-end" : "flex-start",
          }}
        >
          <IconButton
            size="small"
            onClick={handleClose}
            aria-label={t("nav.close")}
            sx={{ color: "var(--primary-color)" }}
          >
            <CloseIcon fontSize="small" />
          </IconButton>
        </Box>

        {dockItems.map((item, index) =>
          item.subMenu?.length ? (
            <NavSidebarGroup
              key={index}
              item={item}
              pathname={location.pathname}
              onNavigate={handleNavigate}
            />
          ) : (
            <NavSidebarRow
              key={index}
              icon={item.icon}
              label={item.label}
              active={isDockItemActive(item, location.pathname)}
              onClick={() => handleNavigate(item.path)}
            />
          )
        )}
      </Box>
    </Drawer>
  );
};

type NavSidebarRowProps = {
  icon?: React.ReactNode;
  label: string;
  active: boolean;
  indent?: boolean;
  onClick: () => void;
};

/* Sub-entries are label-only and indented to line up under their group label. */
const NavSidebarRow = ({
  icon,
  label,
  active,
  indent,
  onClick,
}: NavSidebarRowProps) => {
  return (
    <Box
      role="link"
      tabIndex={0}
      aria-current={active ? "page" : undefined}
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") onClick();
      }}
      sx={{
        ...rowSx(active),
        pl: indent ? "42px" : 1.5,
      }}
    >
      {icon}

      <Typography variant="body2" sx={labelSx}>
        {label}
      </Typography>
    </Box>
  );
};

type NavSidebarGroupProps = {
  item: DockItem;
  pathname: string;
  onNavigate: (path?: string) => void;
};

const NavSidebarGroup = ({
  item,
  pathname,
  onNavigate,
}: NavSidebarGroupProps) => {
  const parentActive = isDockItemActive(item, pathname);

  /* A group holding the current page starts expanded so that page is visible. */
  const [open, setOpen] = useState(parentActive);

  return (
    <Box>
      <Box
        role="button"
        tabIndex={0}
        aria-expanded={open}
        onClick={() => setOpen((prev) => !prev)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") setOpen((prev) => !prev);
        }}
        sx={{
          ...rowSx(parentActive && !open),
          justifyContent: "space-between",
        }}
      >
        <Box
          sx={{ display: "flex", alignItems: "center", gap: 1.5, minWidth: 0 }}
        >
          {item.icon}

          <Typography variant="body2" sx={labelSx}>
            {item.label}
          </Typography>
        </Box>

        <KeyboardArrowDownIcon
          sx={{
            fontSize: 18,
            transition: "transform 0.2s",
            transform: open ? "rotate(180deg)" : "none",
          }}
        />
      </Box>

      <Collapse in={open} unmountOnExit>
        <Box
          sx={{ display: "flex", flexDirection: "column", gap: 0.5, mt: 0.5 }}
        >
          {item.subMenu?.map((subItem, subIndex) => (
            <NavSidebarRow
              key={subIndex}
              label={subItem.label}
              active={subItem.path === pathname}
              indent
              onClick={() => onNavigate(subItem.path)}
            />
          ))}
        </Box>
      </Collapse>
    </Box>
  );
};

export default NavSidebar;
