import { useEffect, useState } from "react";
import dayjs from "dayjs";
import buddhistEra from "dayjs/plugin/buddhistEra";
import "dayjs/locale/th";
import { Th, Gb } from "react-flags-select";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

// Material UI
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import Avatar from "@mui/material/Avatar";
import Button from "@mui/material/Button";
import Divider from "@mui/material/Divider";

import ColorLensIcon from "@mui/icons-material/ColorLens";
import LanguageIcon from "@mui/icons-material/Language";

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

  const [isLoading, setIsLoading] = useState(false);
  const [currentTime, setCurrentTime] = useState(dayjs());
  const [selectedLanguage, setSelectedLanguage] = useState(LANGUAGES[0]);

  const { t, i18n } = useTranslation();

  const { user } = useSelector((state: RootState) => state.authUser);

  const themeItems = Object.entries(themes).map(([key, value]) => ({
    key: key as keyof typeof themes,
    ...value,
  }));

  const lightThemes = themeItems.filter((item) => !item.isDark);
  const darkThemes = themeItems.filter((item) => item.isDark);

  const selectedTheme =
    themeItems.find((item) => item.key === themeName) ?? themeItems[0];

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
    }
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
          padding: "10px 24px",
        }}
      >
        {/* left */}
        <div className="flex [@media(max-width:600px)]:pt-0.5">
          <div className="flex gap-2 items-center justify-center">
            <Avatar alt="Logo" src="/project-logo/logo.png" />

            <div className="flex flex-col [@media(max-width:600px)]:hidden">
              <Typography
                variant="h6"
                sx={{ fontSize: "1.2rem", fontWeight: "bold" }}
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

        {/* right */}
        <div className="flex gap-4 items-center justify-center [@media(max-width:600px)]:pt-0.5">
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
            onSelect={(lang) => {
              setSelectedLanguage(lang);
              i18n.changeLanguage(lang.code);
              localStorage.setItem("language", JSON.stringify(lang));
            }}
            renderItemPrefix={(lang) => (
              <div className="w-4 h-4 rounded-full overflow-hidden">
                {lang.code === "th" ? (
                  <Th style={{ width: "100%", height: "100%" }} />
                ) : (
                  <Gb style={{ width: "100%", height: "100%" }} />
                )}
              </div>
            )}
            className="[@media(max-height:780px)]:hidden"
          />

          <Divider
            orientation="vertical"
            sx={{
              borderColor: primaryColor,
              opacity: 0.2,
              height: "20px",
            }}
            className="[@media(max-height:780px)]:hidden"
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
            className="[@media(max-height:780px)]:hidden"
          />

          <Divider
            orientation="vertical"
            sx={{
              borderColor: primaryColor,
              opacity: 0.2,
              height: "20px",
            }}
            className="[@media(max-height:780px)]:hidden"
          />

          <div className="flex gap-2 items-center">
            <Typography
              variant="body1"
              sx={{
                fontSize: "1rem",
                color: primaryColor,
                fontWeight: "bold",
              }}
              className="[@media(max-height:780px)]:hidden"
            >
              {user
                ? `${i18n.language === "th" ? user.title_name_th : user.title_name_en}${user.first_name} ${user.last_name}`
                : "-"}
            </Typography>

            <Avatar
              alt="User"
              src="/avatars/user1.png"
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
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;