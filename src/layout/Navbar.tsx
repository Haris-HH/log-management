import { useEffect, useState } from "react";
import dayjs from "dayjs";
import buddhistEra from "dayjs/plugin/buddhistEra";
import "dayjs/locale/th";
import { Th, Gb } from "react-flags-select";
import { useSelector } from "react-redux";
import useMediaQuery from "@mui/material/useMediaQuery";

// Material UI
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import Avatar from "@mui/material/Avatar";
import Button from "@mui/material/Button";
import Divider from "@mui/material/Divider";
import IconButton from "@mui/material/IconButton";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import Box from "@mui/material/Box";

import SettingsIcon from "@mui/icons-material/Settings";
import ColorLensIcon from "@mui/icons-material/ColorLens";
import LanguageIcon from "@mui/icons-material/Language";
import LogoutIcon from "@mui/icons-material/Logout";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import ViewSidebarIcon from "@mui/icons-material/ViewSidebar";
import MenuIcon from "@mui/icons-material/Menu";

// Components
import HoverSelectMenu from "../components/select-menu/HoverSelectMenu";
import LoadingScreen from "../components/loading-screen/LoadingScreen";
import NavTopMenu from "../components/nav-top-menu/NavTopMenu";

// Constants
import { LANGUAGES } from "../constants/language";
import { transitionOf } from "../constants/motion";

// i18n
import { useTranslation } from "react-i18next";
// Utils
import { PopupMessageWithCancel } from "../utils/popupMessage";

// Store
import type { RootState } from "../store/store";

// Hook
import { useTheme } from "../hooks/useTheme";
import { useForceLogout } from "../hooks/useForceLogout";
import {
  useNavPosition,
  useNavLayout,
  NAV_POSITIONS,
  NAV_DESKTOP_BREAKPOINT,
} from "../hooks/useNavPosition";

dayjs.extend(buddhistEra);

const Navbar = () => {
  const { forceLogout } = useForceLogout();

  const version = __APP_VERSION__;
  const { themeName, setThemeName, theme, themes } = useTheme();
  const { setNavPosition, sidebarOpen, setSidebarOpen, setMobileNavOpen } =
    useNavPosition();
  const { navPosition, showNav, isWideViewport, sidebarOffset } = useNavLayout();
  const primaryColor = theme.colors["--theme-accent"];

  // State
  const [isLoading, setIsLoading] = useState(false);

  // Data
  const [currentTime, setCurrentTime] = useState(dayjs());
  const [selectedLanguage, setSelectedLanguage] = useState(LANGUAGES[0]);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  // i18n
  const { t, i18n } = useTranslation();

  // Redux
  const { user } = useSelector((state: RootState) => state.authUser);

  const isMenuOpen = Boolean(anchorEl);

  /*
    Opening the sidebar takes 264px off the navbar without changing the
    viewport, so a plain viewport breakpoint would keep insisting there is room
    and the controls would overflow. Shifting every threshold by the sidebar's
    width makes each one describe the space the navbar *actually* has, so
    opening the sidebar degrades it exactly as if the window had been narrowed
    by the same amount.
  */
  const hasRoomFor = (width: number) =>
    `(min-width:${width + sidebarOffset}px)`;

  /* Full control cluster, or collapse everything into the settings menu. */
  const showFullControls = useMediaQuery(hasRoomFor(NAV_DESKTOP_BREAKPOINT));

  /* Two intermediate tiers, dropped longest-first, so the cluster thins out
     gradually instead of snapping straight to the compact form. */
  const showUserName = useMediaQuery(hasRoomFor(1180));
  const showClock = useMediaQuery(hasRoomFor(1320));

  /*
    The hamburger only ever OPENS the drawer; it is closed by the drawer's own
    X (pinned) or its backdrop (overlay). So it shows only while the drawer is
    hidden, and it sits on whichever side the drawer opens from. Below the
    desktop breakpoint every position except the dock collapses into that same
    drawer. These track the *viewport* rather than the navbar's own space,
    because they must agree with the variant NavSidebar picks.
  */
  const openNav = () => {
    if (isWideViewport) {
      setSidebarOpen(true);
    } else {
      setMobileNavOpen(true);
    }
  };

  const showStartHamburger =
    showNav &&
    ((!isWideViewport && navPosition !== "bottom") ||
      (isWideViewport && navPosition === "left" && !sidebarOpen));

  const showEndHamburger =
    showNav && isWideViewport && navPosition === "right" && !sidebarOpen;

  const showTopMenu = showNav && showFullControls && navPosition === "top";

  /*
    The top menu shares the toolbar with these controls, so they give up their
    labels and keep only their icons — the value is still one hover away in the
    dropdown, and the menu gets the width it needs for its entries.
  */
  const compactSelectors = showTopMenu;

  const themeItems = Object.entries(themes).map(([key, value]) => ({
    key: key as keyof typeof themes,
    ...value,
  }));

  const lightThemes = themeItems.filter((item) => !item.isDark);
  const darkThemes = themeItems.filter((item) => item.isDark);

  const selectedTheme =
    themeItems.find((item) => item.key === themeName) ?? themeItems[0];

  const navPositionItems = NAV_POSITIONS.map((position) => ({
    key: position,
    label: t(`nav-position.${position}`),
  }));

  const selectedNavPosition =
    navPositionItems.find((item) => item.key === navPosition) ??
    navPositionItems[0];

  /*
    A 16px miniature of the viewport with the menu's edge filled in, so the
    option reads at a glance without relying on the label alone — the same role
    the colour dot plays for themes and the flag for languages.
  */
  const renderNavPositionPrefix = (
    item: (typeof navPositionItems)[number],
    isSelected: boolean
  ) => {
    const isVertical = item.key === "left" || item.key === "right";
    const edgeColor = isSelected ? primaryColor : "var(--theme-accent-soft)";

    return (
      <Box
        sx={{
          width: 16,
          height: 16,
          flexShrink: 0,
          borderRadius: "3px",
          border: `1px solid ${edgeColor}`,
          display: "flex",
          alignItems: item.key === "bottom" ? "flex-end" : "flex-start",
          justifyContent: item.key === "right" ? "flex-end" : "flex-start",
          p: "1.5px",
        }}
      >
        <Box
          sx={{
            width: isVertical ? "4px" : "100%",
            height: isVertical ? "100%" : "4px",
            borderRadius: "1px",
            backgroundColor: edgeColor,
          }}
        />
      </Box>
    );
  };

  const userFullName = user
    ? `${i18n.language === "th" ? user.title_name_th : user.title_name_en}${user.first_name} ${user.last_name}`
    : "-";

  const closeMenu = () => {
    setAnchorEl(null);
  };

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(dayjs());
    }, 1000);

    const savedLanguage = localStorage.getItem("language");

    if (savedLanguage) {
      setSelectedLanguage(JSON.parse(savedLanguage));
    }

    return () => clearInterval(timer);
  }, []);

  // Close the compact menu once the navbar regains room for the full controls,
  // which now also happens when the sidebar is closed rather than only when the
  // window is resized — otherwise the menu would be left open with its own
  // trigger button gone. Adjusted during render (rather than in an effect) to
  // avoid a synchronous setState-in-effect and the extra render that would cause.
  const [prevShowFullControls, setPrevShowFullControls] =
    useState(showFullControls);

  if (showFullControls !== prevShowFullControls) {
    setPrevShowFullControls(showFullControls);

    if (showFullControls) {
      closeMenu();
    }
  }

  const handleLogout = async () => {
    const isConfirmed = await PopupMessageWithCancel(
      t("popup.logout-title"),
      t("popup.logout-message"),
      t("button.confirm"),
      t("button.cancel"),
      "warning"
    );

    if (!isConfirmed) return;

    setIsLoading(true);

    await forceLogout(true);

    setIsLoading(false);
    closeMenu();
  };

  const toggleMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl((prev) => (prev ? null : event.currentTarget));
  };

  const handleChangeLanguage = (lang: (typeof LANGUAGES)[number]) => {
    setSelectedLanguage(lang);
    i18n.changeLanguage(lang.code);
    localStorage.setItem("language", JSON.stringify(lang));
    closeMenu();
  };

  const handleChangeTheme = (themeKey: keyof typeof themes) => {
    setThemeName(themeKey);
    closeMenu();
  };

  const handleChangeNavPosition = (position: (typeof NAV_POSITIONS)[number]) => {
    setNavPosition(position);
    closeMenu();
  };

  return (
    <AppBar
      position="fixed"
      sx={{
        zIndex: (muiTheme) => muiTheme.zIndex.modal + 1,
        backgroundColor: "var(--theme-border-input)",
        background:
          "linear-gradient(0deg, rgba(var(--theme-panel-rgb),0.9) 0%, rgba(var(--theme-panel-rgb),1) 100%)",
        boxShadow: "1px 1px 5px rgba(var(--theme-accent-soft-rgb),0.1)",
        color: "var(--theme-accent)",
        minHeight: "64px",
        /*
          The pinned sidebar runs the full height of the viewport, so the navbar
          steps aside for it instead of covering it. `left` is set explicitly
          because a fixed AppBar defaults to `left: auto; right: 0`, which would
          silently put the gap on the wrong side for a right-anchored sidebar;
          pinning `left` and `right: auto` makes one rule cover every position.
          The transition matches the page content's so the layout shifts as one.
        */
        width: `calc(100% - ${sidebarOffset}px)`,
        left: navPosition === "left" ? `${sidebarOffset}px` : 0,
        right: "auto",
        transition: transitionOf(["width", "left"], "base", "movement"),
      }}
    >
      {isLoading && <LoadingScreen />}

      <Toolbar
        sx={{
          display: "flex",
          justifyContent: "space-between",
          gap: 2,
          padding: "10px 24px",
          minHeight: "64px !important",
        }}
      >
        {/* left */}
        <div className="flex min-w-0 items-center gap-1">
          {showStartHamburger && (
            <IconButton
              onClick={openNav}
              aria-label={t("nav.menu")}
              aria-expanded={isWideViewport ? sidebarOpen : undefined}
              sx={{ color: primaryColor }}
            >
              <MenuIcon />
            </IconButton>
          )}

          <div className="flex gap-2 items-center justify-center min-w-0">
            <Avatar alt="Logo" src="/project-logo/logo.png" />

            <div className="flex flex-col min-w-0">
              <Typography
                variant="h6"
                sx={{
                  fontSize: "1.2rem",
                  fontWeight: "bold",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {t("project.title")}
              </Typography>

              <div className="flex gap-2">
                <Typography
                  variant="subtitle2"
                  sx={{ fontSize: "0.6rem", mt: -0.8 }}
                >
                  {t("project.subtitle")}
                </Typography>

                <Typography
                  variant="subtitle2"
                  sx={{ fontSize: "0.6rem", mt: -0.8 }}
                >
                  v{version}
                </Typography>
              </div>
            </div>
          </div>
        </div>

        {/* top-position navigation — absorbs the free space so the branding and
            the controls stay pinned to their respective ends */}
        {showTopMenu && (
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <NavTopMenu />
          </Box>
        )}

        <Box sx={{ display: "flex", gap: 2 }}>
        {/* desktop — gated on the navbar's own space, not the viewport's, so an
            open sidebar collapses it the same way a narrow window does */}
        {showFullControls && (
        <div className="flex items-center justify-center gap-4">
          <HoverSelectMenu
            icon={
              <LanguageIcon
                sx={{
                  color: primaryColor,
                  width: 18,
                  height: 18,
                }}
              />
            }
            selectedItem={selectedLanguage}
            items={LANGUAGES}
            getLabel={(lang) => lang.label}
            getKey={(lang) => lang.code}
            selectedColor={primaryColor}
            iconOnly={compactSelectors}
            onSelect={handleChangeLanguage}
            renderItemPrefix={(lang) => (
              <div className="w-4 h-4 rounded-full overflow-hidden">
                {lang.code === "th" ? (
                  <Th style={{ width: "100%", height: "100%" }} />
                ) : (
                  <Gb style={{ width: "100%", height: "100%" }} />
                )}
              </div>
            )}
          />

          <Divider
            orientation="vertical"
            sx={{
              borderColor: primaryColor,
              opacity: 0.2,
              height: "20px",
            }}
          />

          <HoverSelectMenu
            icon={
              <ColorLensIcon
                sx={{
                  color: primaryColor,
                  width: 18,
                  height: 18,
                }}
              />
            }
            selectedItem={selectedTheme}
            groups={[
              {
                label: "Light",
                items: lightThemes,
              },
              {
                label: "Dark",
                items: darkThemes,
              },
            ]}
            getLabel={(item) => item.name}
            getKey={(item) => item.key}
            selectedColor={primaryColor}
            iconOnly={compactSelectors}
            onSelect={(item) => setThemeName(item.key)}
            renderItemPrefix={(item, isSelected) => (
              <div
                className="w-4 h-4 rounded-full"
                style={{
                  backgroundColor: item.colors["--theme-accent"],
                  boxShadow: isSelected
                    ? `0 0 6px ${item.colors["--theme-accent"]}`
                    : "none",
                }}
              />
            )}
          />

          <Divider
            orientation="vertical"
            sx={{
              borderColor: primaryColor,
              opacity: 0.2,
              height: "20px",
            }}
          />

          <HoverSelectMenu
            icon={
              <ViewSidebarIcon
                sx={{
                  color: primaryColor,
                  width: 18,
                  height: 18,
                }}
              />
            }
            selectedItem={selectedNavPosition}
            items={navPositionItems}
            getLabel={(item) => item.label}
            getKey={(item) => item.key}
            selectedColor={primaryColor}
            iconOnly={compactSelectors}
            onSelect={(item) => setNavPosition(item.key)}
            renderItemPrefix={renderNavPositionPrefix}
          />

          <Divider
            orientation="vertical"
            sx={{
              borderColor: primaryColor,
              opacity: 0.2,
              height: "20px",
            }}
          />

          {/* The name is the longest item here, so it is the first to go; the
              avatar stays as the identity cue. `title` keeps the full name
              reachable once the text itself is dropped. */}
          <div className="flex gap-2 items-center min-w-0">
            {showUserName && (
              <Typography
                variant="body1"
                sx={{
                  fontSize: "1rem",
                  color: primaryColor,
                  fontWeight: "bold",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {userFullName}
              </Typography>
            )}

            <Avatar
              alt="User"
              title={userFullName}
              src={user?.image_url}
              sx={{
                width: 34,
                height: 34,
                flexShrink: 0,
                backgroundColor: "rgba(var(--theme-accent-rgb),0.8)",
                color: "var(--theme-border-input)",
              }}
            />
          </div>

          {showClock && (
          <Divider
            orientation="vertical"
            flexItem
            sx={{
              borderColor: primaryColor,
              opacity: 0.2,
            }}
          />
          )}

          {showClock && (
          <div className="flex flex-col w-17.5">
            <Typography
              variant="body1"
              sx={{
                fontSize: "0.6rem",
                color: "var(--theme-accent-soft)",
                opacity: 0.8,
                textAlign: "right",
              }}
            >
              {dayjs(currentTime)
                .locale(i18n.language)
                .format("dd DD/MM/BBBB")}
            </Typography>

            <Typography
              variant="body1"
              sx={{
                fontSize: "1rem",
                color: primaryColor,
                textAlign: "right",
                fontWeight: "bold",
              }}
            >
              {dayjs(currentTime).format("HH:mm:ss")}
            </Typography>
          </div>
          )}

          <Button
            variant="outlined"
            sx={{
              border: "1px solid var(--theme-red)",
              color: "var(--theme-red)",
              fontSize: "14px",
              width: "120px",
              flexShrink: 0,
              height: "30px",
              textTransform: "capitalize",
              "&:hover": {
                backgroundColor: "var(--theme-red)",
                color: "white",
              },
            }}
            onClick={handleLogout}
          >
            {t("navbar.logout")}
          </Button>
        </div>
        )}
        {/* A right-anchored drawer opens from this end, so its hamburger lives here. */}
        {showEndHamburger && (
          <IconButton
            onClick={openNav}
            aria-label={t("nav.menu")}
            aria-expanded={sidebarOpen}
            sx={{ color: primaryColor }}
          >
            <MenuIcon />
          </IconButton>
        )}
        </Box>

        {/* compact — everything folds into the settings menu */}
        {!showFullControls && (
        <div className="flex items-center gap-1">
          <Avatar
            alt="User"
            src={user?.image_url}
            sx={{
              width: 34,
              height: 34,
              backgroundColor: "rgba(var(--theme-accent-rgb),0.8)",
              color: "var(--theme-border-input)",
            }}
          />

          <IconButton
            onClick={toggleMenu}
            sx={{
              color: primaryColor,
            }}
          >
            <SettingsIcon />
          </IconButton>

          <Menu
            anchorEl={anchorEl}
            open={isMenuOpen}
            onClose={closeMenu}
            slotProps={{
              paper: {
                sx: {
                  mt: 1,
                  minWidth: 240,
                  borderRadius: "16px",
                  opacity: 0.8,
                  backgroundColor: "var(--theme-border-input)",
                  boxShadow: "0 8px 24px rgba(var(--theme-accent-soft-rgb),0.15)",
                  border: "1px solid rgba(var(--theme-accent-soft-rgb),0.18)",
                  color: "var(--theme-accent)",
                },
              }
            }}
          >
            <MenuItem 
              disabled
              sx={{
                opacity: "1 !important",
                color: "var(--theme-accent) !important",

                "&.Mui-disabled": {
                  opacity: "1 !important",
                  color: "var(--theme-accent) !important",
                },

                "& .MuiSvgIcon-root": {
                  color: "var(--theme-accent) !important",
                },

                "& .MuiTypography-root": {
                  color: "var(--theme-accent) !important",
                },
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <Avatar
                  src={user?.image_url}
                  sx={{
                    width: 26,
                    height: 26,
                    backgroundColor: "rgba(var(--theme-accent-rgb),0.8)",
                    color: "var(--theme-border-input)",
                  }}
                />

                <Typography
                  sx={{
                    fontSize: "14px",
                    color: primaryColor,
                    fontWeight: "bold",
                  }}
                >
                  {userFullName}
                </Typography>
              </Box>
            </MenuItem>

            <MenuItem 
              disabled
              sx={{
                opacity: "1 !important",
                color: "var(--theme-accent) !important",

                "&.Mui-disabled": {
                  opacity: "1 !important",
                  color: "var(--theme-accent) !important",
                },

                "& .MuiSvgIcon-root": {
                  color: "var(--theme-accent) !important",
                },

                "& .MuiTypography-root": {
                  color: "var(--theme-accent) !important",
                },
              }}
            >
              <AccessTimeIcon sx={{ mr: 1, fontSize: 18 }} />
              <Box className="flex flex-col">
                <Typography sx={{ fontSize: "12px" }}>
                  {dayjs(currentTime)
                    .locale(i18n.language)
                    .format("dd DD/MM/BBBB")}
                </Typography>
                <Typography sx={{ fontSize: "14px", fontWeight: "bold" }}>
                  {dayjs(currentTime).format("HH:mm:ss")}
                </Typography>
              </Box>
            </MenuItem>

            <Divider />

            <MenuItem 
              disabled
              sx={{
                opacity: "1 !important",
                color: "var(--theme-accent) !important",

                "&.Mui-disabled": {
                  opacity: "1 !important",
                  color: "var(--theme-accent) !important",
                },

                "& .MuiSvgIcon-root": {
                  color: "var(--theme-accent) !important",
                },

                "& .MuiTypography-root": {
                  color: "var(--theme-accent) !important",
                },
              }}
            >
              <LanguageIcon sx={{ mr: 1, fontSize: 18 }} />
              {t("navbar.language")}
            </MenuItem>

            {LANGUAGES.map((lang) => (
              <MenuItem
                key={lang.code}
                selected={selectedLanguage.code === lang.code}
                onClick={() => handleChangeLanguage(lang)}
                sx={{
                  pl: 4,
                  "&.Mui-selected": {
                    border: "1px solid var(--theme-accent)",
                    borderRadius: "12px",
                    backgroundColor: "rgba(var(--theme-accent-rgb),0.06)",
                  },
                }}
              >
                <Box
                  sx={{
                    width: 16,
                    height: 16,
                    borderRadius: "50%",
                    overflow: "hidden",
                    mr: 1,
                  }}
                >
                  {lang.code === "th" ? (
                    <Th style={{ width: "100%", height: "100%" }} />
                  ) : (
                    <Gb style={{ width: "100%", height: "100%" }} />
                  )}
                </Box>

                {lang.label}
              </MenuItem>
            ))}

            <Divider />

            <MenuItem 
              disabled
              sx={{
                opacity: "1 !important",
                color: "var(--theme-accent) !important",

                "&.Mui-disabled": {
                  opacity: "1 !important",
                  color: "var(--theme-accent) !important",
                },

                "& .MuiSvgIcon-root": {
                  color: "var(--theme-accent) !important",
                },

                "& .MuiTypography-root": {
                  color: "var(--theme-accent) !important",
                },
              }}
            >
              <ColorLensIcon sx={{ mr: 1, fontSize: 18 }} />
              {t("navbar.theme")}
            </MenuItem>

            {themeItems.map((themeItem) => (
              <MenuItem
                key={themeItem.key}
                selected={themeName === themeItem.key}
                onClick={() => handleChangeTheme(themeItem.key)}
                sx={{
                  pl: 4,
                  "&.Mui-selected": {
                    border: "1px solid var(--theme-accent)",
                    borderRadius: "12px",
                    backgroundColor: "rgba(var(--theme-accent-rgb),0.06)",
                  },
                }}
              >
                <Box
                  sx={{
                    width: 14,
                    height: 14,
                    borderRadius: "50%",
                    backgroundColor: themeItem.colors["--theme-accent"],
                    mr: 1,
                  }}
                />

                {themeItem.name}
              </MenuItem>
            ))}

            <Divider />

            <MenuItem
              disabled
              sx={{
                opacity: "1 !important",
                color: "var(--theme-accent) !important",

                "&.Mui-disabled": {
                  opacity: "1 !important",
                  color: "var(--theme-accent) !important",
                },

                "& .MuiSvgIcon-root": {
                  color: "var(--theme-accent) !important",
                },

                "& .MuiTypography-root": {
                  color: "var(--theme-accent) !important",
                },
              }}
            >
              <ViewSidebarIcon sx={{ mr: 1, fontSize: 18 }} />
              {t("navbar.nav-position")}
            </MenuItem>

            {navPositionItems.map((item) => (
              <MenuItem
                key={item.key}
                selected={navPosition === item.key}
                onClick={() => handleChangeNavPosition(item.key)}
                sx={{
                  pl: 4,
                  "&.Mui-selected": {
                    border: "1px solid var(--theme-accent)",
                    borderRadius: "12px",
                    backgroundColor: "rgba(var(--theme-accent-rgb),0.06)",
                  },
                }}
              >
                <Box sx={{ mr: 1, display: "flex" }}>
                  {renderNavPositionPrefix(item, navPosition === item.key)}
                </Box>

                {item.label}
              </MenuItem>
            ))}

            <Divider />

            <MenuItem
              onClick={() => {
                closeMenu();
                handleLogout();
              }}
              sx={{
                color: "var(--theme-red)",
              }}
            >
              <LogoutIcon sx={{ mr: 1, fontSize: 18 }} />
              {t("navbar.logout")}
            </MenuItem>
          </Menu>
        </div>
        )}
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;