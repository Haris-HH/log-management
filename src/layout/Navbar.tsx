import { useEffect, useState } from "react";
import dayjs from "dayjs";
import buddhistEra from "dayjs/plugin/buddhistEra";
import "dayjs/locale/th";
import { Th, Gb } from "react-flags-select";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
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

// Components
import HoverSelectMenu from "../components/select-menu/HoverSelectMenu";
import LoadingScreen from "../components/loading-screen/LoadingScreen";

// Constants
import { LANGUAGES } from "../constants/language";

// i18n
import { useTranslation } from "react-i18next";

// API
import { logoutApi } from "../features/login/api/LoginApi";
import { clearAuthUser } from "../features/auth-user/api/AuthUserSlice";

// Utils
import { PopupMessage, PopupMessageWithCancel } from "../utils/popupMessage";

// Store
import type { RootState } from "../store/store";
import { useAppDispatch } from "../store/hooks";

// Hook
import { useTheme } from "../hooks/useTheme";

dayjs.extend(buddhistEra);

const Navbar = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const version = __APP_VERSION__;
  const { themeName, setThemeName, theme, themes } = useTheme();
  const primaryColor = theme.colors["--primary-color"];

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

  const isDesktop = useMediaQuery("(min-width:1024px)");

  const isMenuOpen = Boolean(anchorEl);

  const themeItems = Object.entries(themes).map(([key, value]) => ({
    key: key as keyof typeof themes,
    ...value,
  }));

  const lightThemes = themeItems.filter((item) => !item.isDark);
  const darkThemes = themeItems.filter((item) => item.isDark);

  const selectedTheme =
    themeItems.find((item) => item.key === themeName) ?? themeItems[0];

  const userFullName = user
    ? `${i18n.language === "th" ? user.title_name_th : user.title_name_en}${user.first_name} ${user.last_name}`
    : "-";

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

  useEffect(() => {
    if (isDesktop) {
      closeMenu();
    }
  }, [isDesktop]);

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

    try {
      await logoutApi();

      dispatch(clearAuthUser());

      localStorage.removeItem("accessToken");
      localStorage.removeItem("persist:root");

      navigate("/login", { replace: true });
    } catch {
      await PopupMessage(
        t("popup.logout-failed-title"),
        t("popup.logout-failed-message"),
        "error"
      );
    } finally {
      setIsLoading(false);
      closeMenu();
    }
  };

  const closeMenu = () => {
    setAnchorEl(null);
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

  return (
    <AppBar
      position="fixed"
      sx={{
        zIndex: (muiTheme) => muiTheme.zIndex.modal + 1,
        backgroundColor: "var(--tertiary-color)",
        background:
          "linear-gradient(0deg, rgba(var(--tertiary-color-rgb), 0.9) 0%, rgba(var(--tertiary-color-rgb), 1) 100%)",
        boxShadow: "1px 1px 5px rgba(var(--secondary-color-rgb), 0.1)",
        color: "var(--primary-color)",
        minHeight: "64px",
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
        <div className="flex min-w-0">
          <div className="flex gap-2 items-center justify-center min-w-0">
            <Avatar alt="Logo" src="/project-logo/logo.png" />

            <div className="flex flex-col min-w-0">
              <Typography
                variant="h6"
                sx={{
                  fontSize: "1.2rem",
                  fontWeight: "bold",
                  whiteSpace: "nowrap",
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

        {/* desktop */}
        <div className="hidden lg:flex items-center justify-center gap-4">
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
            onSelect={(item) => setThemeName(item.key)}
            renderItemPrefix={(item, isSelected) => (
              <div
                className="w-4 h-4 rounded-full"
                style={{
                  backgroundColor: item.colors["--primary-color"],
                  boxShadow: isSelected
                    ? `0 0 6px ${item.colors["--primary-color"]}`
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

          <div className="flex gap-2 items-center">
            <Typography
              variant="body1"
              sx={{
                fontSize: "1rem",
                color: primaryColor,
                fontWeight: "bold",
              }}
            >
              {userFullName}
            </Typography>

            <Avatar
              alt="User"
              src={user?.image_url}
              sx={{
                width: 34,
                height: 34,
                backgroundColor: "rgba(var(--primary-color-rgb), 0.8)",
                color: "var(--tertiary-color)",
              }}
            />
          </div>

          <Divider
            orientation="vertical"
            flexItem
            sx={{
              borderColor: primaryColor,
              opacity: 0.2,
            }}
          />

          <div className="flex flex-col w-17.5">
            <Typography
              variant="body1"
              sx={{
                fontSize: "0.6rem",
                color: "var(--secondary-color)",
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

          <Button
            variant="outlined"
            sx={{
              border: "1px solid var(--danger-color)",
              color: "var(--danger-color)",
              fontSize: "14px",
              width: "120px",
              height: "30px",
              textTransform: "capitalize",
              "&:hover": {
                backgroundColor: "var(--danger-color)",
                color: "white",
              },
            }}
            onClick={handleLogout}
          >
            {t("navbar.logout")}
          </Button>
        </div>

        {/* mobile / tablet */}
        <div className="flex lg:hidden items-center gap-1">
          <Avatar
            alt="User"
            src={user?.image_url}
            sx={{
              width: 34,
              height: 34,
              backgroundColor: "rgba(var(--primary-color-rgb), 0.8)",
              color: "var(--tertiary-color)",
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
                  backgroundColor: "var(--tertiary-color)",
                  boxShadow: "0 8px 24px rgba(var(--secondary-color-rgb), 0.15)",
                  border: "1px solid rgba(var(--secondary-color-rgb), 0.18)",
                  color: "var(--primary-color)",
                },
              }
            }}
          >
            <MenuItem 
              disabled
              sx={{
                opacity: "1 !important",
                color: "var(--primary-color) !important",

                "&.Mui-disabled": {
                  opacity: "1 !important",
                  color: "var(--primary-color) !important",
                },

                "& .MuiSvgIcon-root": {
                  color: "var(--primary-color) !important",
                },

                "& .MuiTypography-root": {
                  color: "var(--primary-color) !important",
                },
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <Avatar
                  src={user?.image_url}
                  sx={{
                    width: 26,
                    height: 26,
                    backgroundColor: "rgba(var(--primary-color-rgb), 0.8)",
                    color: "var(--tertiary-color)",
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
                color: "var(--primary-color) !important",

                "&.Mui-disabled": {
                  opacity: "1 !important",
                  color: "var(--primary-color) !important",
                },

                "& .MuiSvgIcon-root": {
                  color: "var(--primary-color) !important",
                },

                "& .MuiTypography-root": {
                  color: "var(--primary-color) !important",
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
                color: "var(--primary-color) !important",

                "&.Mui-disabled": {
                  opacity: "1 !important",
                  color: "var(--primary-color) !important",
                },

                "& .MuiSvgIcon-root": {
                  color: "var(--primary-color) !important",
                },

                "& .MuiTypography-root": {
                  color: "var(--primary-color) !important",
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
                    border: "1px solid var(--primary-color)",
                    borderRadius: "12px",
                    backgroundColor: "rgba(var(--primary-color-rgb), 0.06)",
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
                color: "var(--primary-color) !important",

                "&.Mui-disabled": {
                  opacity: "1 !important",
                  color: "var(--primary-color) !important",
                },

                "& .MuiSvgIcon-root": {
                  color: "var(--primary-color) !important",
                },

                "& .MuiTypography-root": {
                  color: "var(--primary-color) !important",
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
                    border: "1px solid var(--primary-color)",
                    borderRadius: "12px",
                    backgroundColor: "rgba(var(--primary-color-rgb), 0.06)",
                  },
                }}
              >
                <Box
                  sx={{
                    width: 14,
                    height: 14,
                    borderRadius: "50%",
                    backgroundColor: themeItem.colors["--primary-color"],
                    mr: 1,
                  }}
                />

                {themeItem.name}
              </MenuItem>
            ))}

            <Divider />

            <MenuItem
              onClick={() => {
                closeMenu();
                handleLogout();
              }}
              sx={{
                color: "var(--danger-color)",
              }}
            >
              <LogoutIcon sx={{ mr: 1, fontSize: 18 }} />
              {t("navbar.logout")}
            </MenuItem>
          </Menu>
        </div>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;