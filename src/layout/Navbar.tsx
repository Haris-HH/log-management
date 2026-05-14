import { useEffect, useState } from "react";
import dayjs from "dayjs";
import buddhistEra from "dayjs/plugin/buddhistEra";
import "dayjs/locale/th";
import { Th, Gb } from "react-flags-select"

// Material UI
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import Avatar from '@mui/material/Avatar';
import Button from "@mui/material/Button";
import Divider from "@mui/material/Divider";

import ColorLensIcon from '@mui/icons-material/ColorLens';
import LanguageIcon from '@mui/icons-material/Language';

// Components
import HoverSelectMenu from "../components/select-menu/HoverSelectMenu";

// Constants
import { THEMES } from "../constants/themes";
import { LANGUAGES } from "../constants/language";

// i18n
import { useTranslation } from 'react-i18next';

dayjs.extend(buddhistEra);

const Navbar = () => {
  const version = __APP_VERSION__

  // Data
  const [currentTime, setCurrentTime] = useState(dayjs());
  const [selectedLanguage, setSelectedLanguage] = useState(LANGUAGES[0]);
  const [selectedTheme, setSelectedTheme] = useState(THEMES[0]);

  // i18n
  const { t, i18n } = useTranslation();

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(dayjs());
    }, 1000);

    const savedTheme = localStorage.getItem("theme");
    if (savedTheme) {
      setSelectedTheme(JSON.parse(savedTheme));
    }

    const savedLanguage = localStorage.getItem("language");
    if (savedLanguage) {
      setSelectedLanguage(JSON.parse(savedLanguage));
    }

    return () => clearInterval(timer);
  }, [])

  return (
    <AppBar 
      position="fixed"
      sx={{
        zIndex: (theme) => theme.zIndex.modal + 1,
        backgroundColor: "rgba(var(--secondary-color-rgb), 0.1)",
        boxShadow: "1px 1px 5px rgba(var(--secondary-color-rgb), 0.1)",
        color: "var(--primary-color)",
        minHeight: "64px",
      }}
    >
      <Toolbar sx={{ display: "flex", justifyContent: "space-between", padding: "10px 24px" }}>
        <div className="flex [@media(max-width:600px)]:pt-0.5">
          <div className="flex gap-2 items-center justify-center">
            <Avatar alt="Logo" src="/project-logo/logo.png" />
            <div className="flex flex-col [@media(max-width:600px)]:hidden">
              <Typography variant="h6" sx={{ fontSize: "1.2rem", fontWeight: "bold" }}>
                {t('project.title')}
              </Typography>
              <div className="flex gap-2">
                <Typography variant="subtitle2" sx={{ fontSize: "0.6rem", mt: -0.8 }}>
                  {t('project.subtitle')}
                </Typography>
                <Typography variant="subtitle2" sx={{ fontSize: "0.6rem", mt: -0.8 }}>
                  v{version}
                </Typography>
              </div>
            </div>
          </div>
        </div>

        <div className="flex gap-4 items-center justify-center [@media(max-width:600px)]:pt-0.5">
          <HoverSelectMenu
            icon={
              <LanguageIcon
                sx={{
                  color: "var(--primary-color)",
                  width: 18,
                  height: 18,
                }}
              />
            }
            selectedItem={selectedLanguage}
            items={LANGUAGES}
            getLabel={(lang) => lang.label}
            getKey={(lang) => lang.code}
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
          <Divider orientation="vertical" sx={{ borderColor: "var(--primary-color)", opacity: 0.2, height: "20px" }} className="[@media(max-height:780px)]:hidden" />
          <HoverSelectMenu
            icon={
              <ColorLensIcon
                sx={{
                  color: selectedTheme.primary,
                  width: 18,
                  height: 18,
                }}
              />
            }
            selectedItem={selectedTheme}
            items={THEMES}
            getLabel={(theme) => theme.name}
            getKey={(theme) => theme.name}
            selectedColor={selectedTheme.primary}
            onSelect={(theme) => {
              setSelectedTheme(theme);
              localStorage.setItem("theme", JSON.stringify(theme));

              document.documentElement.style.setProperty(
                "--primary-color",
                theme.primary
              );

              document.documentElement.style.setProperty(
                "--primary-color-rgb",
                theme.rgb
              );
            }}
            renderItemPrefix={(theme, isSelected) => (
              <div
                className="w-4 h-4 rounded-full"
                style={{
                  backgroundColor: theme.primary,
                  boxShadow: isSelected
                    ? `0 0 2px ${theme.primary}`
                    : "none",
                }}
              />
            )}
            className="[@media(max-height:780px)]:hidden"
          />
          <Divider orientation="vertical" sx={{ borderColor: "var(--primary-color)", opacity: 0.2, height: "20px" }} className="[@media(max-height:780px)]:hidden" />
          <div className="flex gap-2 items-center">
            <Typography variant="body1" sx={{ fontSize: "1rem", color: "var(--primary-color)", fontWeight: "bold" }} className="[@media(max-height:780px)]:hidden">
              ดต.ญ.สุมาลี บุญเลิศ
            </Typography>
            <Avatar alt="User" src="/avatars/user1.png" sx={{ width: 34, height: 34 }} />
          </div>
          <Divider orientation="vertical" flexItem sx={{ borderColor: "var(--primary-color)", opacity: 0.2 }} />
          <div 
            className="flex flex-col w-17.5"
          >
            <Typography variant="body1" sx={{ fontSize: "0.6rem", color: "var(--text-color)", opacity: 0.8, textAlign: "right" }}>
              {dayjs().locale(i18n.language).format("dd DD/MM/BBBB")}
            </Typography>
            <Typography variant="body1" sx={{ fontSize: "1rem", color: "var(--primary-color)", textAlign: "right", fontWeight: "bold" }}>
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
          >
            {t("navbar.logout")}
          </Button>
        </div>
      </Toolbar>
    </AppBar>
  )
}

export default Navbar;