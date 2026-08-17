import { useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

// Material UI
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";

import SearchOffIcon from "@mui/icons-material/SearchOff";
import HomeIcon from "@mui/icons-material/Home";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";

// i18n
import { useTranslation } from "react-i18next";

// Hooks
import usePageTitle from "../hooks/usePageTitle";

/**
 * Catch-all screen for URLs that match no route.
 *
 * It renders inside `MainLayout`, so the navbar and whichever navigation shape
 * the user has chosen stay available — a dead end that offers no way out is
 * worse than the wrong URL. Unauthenticated visitors never reach this: the route
 * guard in `App.tsx` sends any token-less request to `/login` first.
 */
const NotFound = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // i18n
  const { t } = useTranslation();

  usePageTitle(t("pages.not-found"));

  /*
    ปุ่ม "ย้อนกลับ" มีประโยชน์เฉพาะตอนที่ผู้ใช้เดินมาจากหน้าอื่นในแอป ถ้าเปิด URL
    ผิดมาตรง ๆ react-router จะให้ key เป็น "default" แปลว่าไม่มีที่ให้ย้อนไป
    การกดปุ่มจะพาออกนอกแอป จึงซ่อนไว้แทน
  */
  const canGoBack = location.key !== "default";

  const buttonSx = {
    fontSize: "14px",
    height: "36px",
    px: 2.5,
    textTransform: "capitalize",
  } as const;

  return (
    <section
      id="not-found"
      className="flex h-full w-full items-center justify-center overflow-y-auto p-4"
    >
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25, ease: [0.23, 1, 0.32, 1] }}
        className="w-full max-w-150"
      >
        <Box
          className="flex flex-col items-center gap-4 rounded-lg border border-(--theme-accent) p-10 text-center"
          sx={{
            backgroundColor: "rgba(var(--theme-panel-rgb),0.8)",
            boxShadow: "0 4px 15px rgba(var(--theme-accent-soft-rgb),0.25)",
          }}
        >
          <SearchOffIcon
            sx={{ fontSize: 64, color: "var(--theme-accent)", opacity: 0.8 }}
          />

          <Typography
            component="p"
            sx={{
              fontSize: "4rem",
              fontWeight: "bold",
              lineHeight: 1,
              color: "var(--theme-accent)",
              textShadow: "5px 3px 5px var(--theme-border-input)",
            }}
          >
            404
          </Typography>

          <Typography
            component="h1"
            sx={{
              fontSize: "1.4rem",
              fontWeight: "bold",
              color: "var(--theme-accent)",
            }}
          >
            {t("pages.not-found")}
          </Typography>

          <Typography
            sx={{
              fontSize: "0.95rem",
              color: "var(--theme-accent-soft)",
              opacity: 0.9,
            }}
          >
            {t("text.not-found-message")}
          </Typography>

          {/* ที่อยู่ที่เรียกมา ช่วยให้ผู้ใช้แจ้งปัญหาได้ตรงจุด — เป็น text node
              ของ React จึงถูก escape ให้แล้ว ไม่ได้ประกอบเป็น HTML เอง */}
          <Typography
            component="code"
            sx={{
              fontSize: "0.8rem",
              color: "var(--theme-accent-soft)",
              opacity: 0.7,
              wordBreak: "break-all",
            }}
          >
            {t("text.not-found-path")}: {location.pathname}
          </Typography>

          <Box className="mt-2 flex flex-wrap items-center justify-center gap-3">
            <Button
              variant="contained"
              startIcon={<HomeIcon />}
              onClick={() => navigate("/", { replace: true })}
              sx={{
                ...buttonSx,
                backgroundColor: "var(--theme-accent)",
                color: "var(--theme-border-input)",
                boxShadow: "none",
                "&:hover": {
                  backgroundColor: "rgba(var(--theme-accent-rgb),0.8)",
                  boxShadow: "none",
                },
              }}
            >
              {t("button.back-home")}
            </Button>

            {canGoBack && (
              <Button
                variant="outlined"
                startIcon={<ArrowBackIcon />}
                onClick={() => navigate(-1)}
                sx={{
                  ...buttonSx,
                  border: "1px solid var(--theme-accent)",
                  color: "var(--theme-accent)",
                  "&:hover": {
                    border: "1px solid var(--theme-accent)",
                    backgroundColor: "rgba(var(--theme-accent-rgb),0.1)",
                  },
                }}
              >
                {t("button.go-back")}
              </Button>
            )}
          </Box>
        </Box>
      </motion.div>
    </section>
  );
};

export default NotFound;
