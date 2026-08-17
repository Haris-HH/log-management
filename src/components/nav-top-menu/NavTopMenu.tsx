import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

// Material UI
import Box from "@mui/material/Box";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";

import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";

// Types
import type { DockItem } from "../../hooks/useDockItems";

// Hooks
import { useDockItems, isDockItemActive } from "../../hooks/useDockItems";

// i18n
import { useTranslation } from "react-i18next";

/**
 * Horizontal navigation rendered inside the Navbar for the `top` position.
 * Two levels only: a top-level entry either navigates directly or opens a
 * dropdown of its children. Desktop-only — MainLayout falls back to the drawer
 * on mobile, where these buttons would not fit beside the branding.
 *
 * Scrolls horizontally rather than wrapping, so a long menu can never push the
 * navbar past its fixed 64px height.
 */
const NavTopMenu = () => {
  const dockItems = useDockItems();
  const navigate = useNavigate();
  const location = useLocation();

  // i18n
  const { t } = useTranslation();

  return (
    <Box
      component="nav"
      aria-label={t("nav.menu")}
      sx={{
        display: "flex",
        alignItems: "center",
        gap: 0.5,
        minWidth: 0,
        overflowX: "auto",
        overflowY: "hidden",
        whiteSpace: "nowrap",
        "&::-webkit-scrollbar": { height: 0 },
      }}
    >
      {dockItems.map((item, index) =>
        item.subMenu?.length ? (
          <NavTopGroup
            key={index}
            item={item}
            pathname={location.pathname}
            onNavigate={navigate}
          />
        ) : (
          <NavTopButton
            key={index}
            active={isDockItemActive(item, location.pathname)}
            onClick={() => {
              if (item.path) navigate(item.path);
            }}
          >
            {item.icon}
            {item.label}
          </NavTopButton>
        )
      )}
    </Box>
  );
};

type NavTopButtonProps = {
  active: boolean;
  onClick: (event: React.MouseEvent<HTMLElement>) => void;
  children: React.ReactNode;
  "aria-haspopup"?: "menu";
  "aria-expanded"?: boolean;
};

const NavTopButton = ({
  active,
  onClick,
  children,
  ...rest
}: NavTopButtonProps) => {
  return (
    <Box
      component="button"
      type="button"
      onClick={onClick}
      {...rest}
      sx={{
        display: "inline-flex",
        alignItems: "center",
        gap: 0.5,
        height: 38,
        px: 1.25,
        border: "none",
        borderBottom: `2px solid ${active ? "var(--theme-accent)" : "transparent"}`,
        background: "transparent",
        cursor: "pointer",
        color: "var(--theme-accent)",
        opacity: active ? 1 : 0.75,
        fontSize: "0.85rem",
        fontWeight: active ? 700 : 500,
        whiteSpace: "nowrap",
        transition: "opacity 0.2s",
        "&:hover": { opacity: 1 },
      }}
    >
      {children}
    </Box>
  );
};

type NavTopGroupProps = {
  item: DockItem;
  pathname: string;
  onNavigate: (path: string) => void;
};

const NavTopGroup = ({ item, pathname, onNavigate }: NavTopGroupProps) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleSelect = (path: string) => {
    onNavigate(path);
    setAnchorEl(null);
  };

  return (
    <>
      <NavTopButton
        active={isDockItemActive(item, pathname)}
        aria-haspopup="menu"
        aria-expanded={Boolean(anchorEl)}
        onClick={(event) => setAnchorEl(event.currentTarget)}
      >
        {item.icon}
        {item.label}
        <KeyboardArrowDownIcon sx={{ fontSize: 16 }} />
      </NavTopButton>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={() => setAnchorEl(null)}
        slotProps={{
          paper: {
            sx: {
              mt: 1,
              minWidth: 200,
              borderRadius: "16px",
              backgroundColor: "var(--theme-border-input)",
              boxShadow: "0 8px 24px rgba(var(--theme-accent-soft-rgb),0.15)",
              border: "1px solid rgba(var(--theme-accent-soft-rgb),0.18)",
              color: "var(--theme-accent)",
            },
          },
        }}
      >
        {item.subMenu?.map((subItem, subIndex) => (
          <MenuItem
            key={subIndex}
            selected={subItem.path === pathname}
            onClick={() => handleSelect(subItem.path)}
            sx={{
              color: "var(--theme-accent)",
              fontSize: "0.82rem",
              py: 1.1,
              px: 2,
              "&.Mui-selected": {
                backgroundColor: "rgba(var(--theme-accent-rgb),0.12)",
              },
              "&:hover": {
                backgroundColor: "rgba(var(--theme-accent-rgb),0.08)",
              },
            }}
          >
            {subItem.label}
          </MenuItem>
        ))}
      </Menu>
    </>
  );
};

export default NavTopMenu;
