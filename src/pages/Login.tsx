import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import type { SubmitHandler } from "react-hook-form";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";

// Material UI
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";

import SkipNextIcon from "@mui/icons-material/SkipNext";

// Components
import MatrixRainingCode from "../components/matrix-raining-effect/MatrixRainingEffect";
import TextBox from "../components/text-box/TextBox";
import CinematicTitle from "../components/cinematic-title/CinematicTitle";
import LetterChargeEffect from "../components/letter-charge-effect/LetterChargeEffect";

// i18n
import { useTranslation } from "react-i18next";

// API
import { loginApi } from "../features/login/api/LoginApi";
import { getUserApi } from "../features/users/api/UsersApi";
import { setAuthUser } from "../features/auth-user/api/AuthUserSlice";
import { getTitle, getAgency } from "../features/dropdown/api/DropdownApi";

// Utils
import { PopupMessage } from "../utils/popupMessage";
import { consumeLogoutReason } from "../utils/logoutReason";
import type { LogoutReason } from "../utils/logoutReason";

// Store
import { useAppDispatch } from "../store/hooks";

// Hooks
import usePageTitle from '../hooks/usePageTitle';
import { useReducedMotion } from "../hooks/useReducedMotion";

// Constants
import { MOTION_DURATION } from "../constants/motion";

type FormData = {
  username: string;
  password: string;
}

const Login = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const version = __APP_VERSION__;

  // i18n
  const { t } = useTranslation();

  usePageTitle("");

  // Hooks
  const prefersReducedMotion = useReducedMotion();

  /*
    State

    ผู้ใช้ที่ขอลดการเคลื่อนไหวไม่ควรถูกบังคับดู intro 5.5 วินาที (บวกอีก 0.4
    วินาทีที่ overlay ค่อย ๆ จาง) จึงเริ่มที่สถานะ "intro จบแล้ว" ไปเลย — ตั้งค่า
    ตอน initialise ไม่ใช่ setState ใน effect เพื่อไม่ให้ render รอบแรกโชว์ intro
    แล้วกระตุกหายไป
  */
  const [introDone, setIntroDone] = useState(prefersReducedMotion);
  const [skipIntro, setSkipIntro] = useState(prefersReducedMotion);
  const [loading, setLoading] = useState(false);

  /*
    อ่านครั้งเดียวตอน mount แล้วค่าจะถูกล้างทิ้ง ถ้าเข้าหน้านี้เองโดยไม่ได้ถูกไล่
    ออกมาก็จะได้ null และไม่มีอะไรแสดง
  */
  const [endedReason] = useState<LogoutReason | null>(consumeLogoutReason);

  // Form Data
  const [formData, setFormData] = React.useState<FormData>({
    username: "",
    password: "",
  });
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<FormData>();

  useEffect(() => {
    if (prefersReducedMotion) return;

    const timer = setTimeout(() => {
      setIntroDone(true);
    }, 5500);

    return () => clearTimeout(timer);
  }, [prefersReducedMotion]);

  const finishIntro = () => {
    setSkipIntro(true);
    setIntroDone(true);
  };

  /*
    เดิมข้าม intro ได้ด้วยการคลิกที่ไหนก็ได้อย่างเดียว ซึ่งคนใช้คีย์บอร์ดหรือ
    screen reader ไม่มีทางรู้และไม่มีทางทำ — เพิ่มปุ่มที่โฟกัสได้จริง พร้อมรับ
    Escape / Enter / Space จากทั้งหน้าไว้ด้วย
  */
  useEffect(() => {
    if (introDone) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (
        event.key === "Escape" ||
        event.key === "Enter" ||
        event.key === " " ||
        event.key === "Spacebar"
      ) {
        event.preventDefault();
        finishIntro();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [introDone]);

  const handleTextChange = (key: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
    setValue(key, value);
  };

  const handleFormSubmit: SubmitHandler<FormData> = async (data) => {
    setLoading(true);

    try {
      const result = await loginApi({
        username: data.username,
        password: data.password,
      });

      localStorage.setItem("accessToken", result.accessToken);

      if (result.userId) {
        const userResponse = await getUserApi({ filter: `user_id=${result.userId}` });
        const titleData = await getTitle({ filter: `id=${userResponse.data[0]?.title_id}` });
        const nsbOuData = await getAgency({ filter: `ou_code=${userResponse.data[0]?.ou_code}` });
        
        dispatch(
          setAuthUser({
            user_id: userResponse.data[0]?.user_id ?? "-",
            hash_id: userResponse.data[0]?.hash_id ?? "-",
            title_name_th: titleData.data[0]?.title_abbr_th ?? "",
            title_name_en: titleData.data[0]?.title_abbr_en ?? "",
            first_name: userResponse.data[0]?.firstname ?? "-",
            last_name: userResponse.data[0]?.lastname ?? "-",
            image_url: userResponse.data[0]?.image_url ?? "-",
            permission: userResponse.data[0]?.permissions ?? null,
            agency: {
              ou_code: userResponse.data[0]?.ou_code,
              ou_abbr_th: nsbOuData.data[0]?.ou_abbr_th ?? "-",
              ou_abbr_en: nsbOuData.data[0]?.ou_abbr_en ?? "-",
            },
          })
        );
      }

      navigate("/", { replace: true });
    } 
    catch (error) {
      await PopupMessage(t("popup.login-failed-title"), t("popup.login-failed-message"), "error");
    } 
    finally {
      setLoading(false);
    }
  };

  return (
    <section
      id="login"
      onClick={finishIntro}
      className="h-screen w-screen flex items-center justify-center relative overflow-hidden"
      style={{
        backgroundColor: "rgba(var(--theme-accent-soft-rgb),0.1)"
      }}
    >
      {
        introDone && <MatrixRainingCode className="absolute inset-0" />
      }

      {introDone && <LetterChargeEffect />}

      {/* INTRO OVERLAY */}
      <AnimatePresence mode="wait">
        {!introDone && (
          <motion.div
            className="absolute inset-0 z-50 flex flex-col items-center justify-center"
            style={{
              background: "var(--theme-border-input)",
            }}
            initial={{ opacity: 1 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            /* 1 วินาทีคือเวลาที่ผู้ใช้ต้องรออีกต่อหนึ่งหลัง intro จบแล้ว ย่อลงมา
               อยู่ในงบของ overlay (400ms) */
            transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
          >
            <CinematicTitle skipIntro={skipIntro} />

            {/* ปุ่มข้าม — โฟกัสได้ด้วยคีย์บอร์ดและ screen reader อ่านออก
                ต่างจากการคลิกที่พื้นหลังซึ่งไม่มีอะไรบอกว่าทำได้ */}
            <Button
              variant="outlined"
              startIcon={<SkipNextIcon />}
              onClick={(event) => {
                event.stopPropagation();
                finishIntro();
              }}
              sx={{
                position: "absolute",
                bottom: 32,
                right: 32,
                zIndex: 60,
                fontSize: "14px",
                height: "36px",
                px: 2.5,
                textTransform: "capitalize",
                border: "1px solid var(--theme-accent)",
                color: "var(--theme-accent)",
                backgroundColor: "rgba(var(--theme-panel-rgb),0.6)",
                "&:hover": {
                  border: "1px solid var(--theme-accent)",
                  backgroundColor: "rgba(var(--theme-accent-rgb),0.1)",
                },
              }}
            >
              {t("button.skip-intro")}
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* LOGIN CARD */}
      <div className="flex flex-col items-center gap-3 z-30">
      {/*
        บอกว่าทำไมถึงกลับมาอยู่หน้า login - ไม่งั้นการถูกไล่ออกจากระบบเพราะมีการ
        เข้าใช้งานบัญชีเดียวกันที่อื่น จะดูไม่ต่างจาก session หมดอายุตามปกติ
      */}
      {endedReason === "signed-in-elsewhere" && (
        <motion.p
          role="status"
          initial={{ opacity: 0, y: prefersReducedMotion ? 0 : -12 }}
          animate={{
            opacity: introDone ? 1 : 0,
            y: introDone || prefersReducedMotion ? 0 : -12,
          }}
          transition={{ duration: MOTION_DURATION.slow / 1000 }}
          className="w-122 px-4 py-2.5 rounded-lg text-center text-sm"
          style={{
            backgroundColor: "rgba(var(--theme-panel-rgb),0.8)",
            border: "1px solid var(--theme-accent)",
            color: "var(--theme-accent)",
          }}
        >
          {t("text.signed-in-elsewhere")}
        </motion.p>
      )}

      <motion.div
        initial={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: 40 }}
        animate={
          prefersReducedMotion
            ? { opacity: introDone ? 1 : 0 }
            : { opacity: introDone ? 1 : 0, y: introDone ? 0 : 40 }
        }
        transition={{ duration: prefersReducedMotion ? 0.2 : 0.8 }}
        className="flex flex-col w-122 h-90 rounded-lg"
        style={{
          backgroundColor: "rgba(var(--theme-panel-rgb),0.8)",
          border: "1px solid var(--theme-accent)",
        }}
      >
        {/* Header */}
        <div className="flex gap-2 items-center justify-center p-4">
          <img
            src="/project-logo/logo.png"
            alt="Logo"
            className="w-17 h-17"
          />
          <div
            className="flex flex-col text-(--theme-accent)"
          >
            <Typography
              variant="h6"
              sx={{ fontSize: "1.8rem", fontWeight: "bold", textShadow: "1px 2px 2px var(--theme-border-input)" }}
            >
              {t('project.title')}
            </Typography>
            <Typography
              variant="h6"
              sx={{ fontSize: "0.8rem", mt: -1, textShadow: "1px 1px 2px var(--theme-border-input)" }}
            >
              {t('project.subtitle')}
            </Typography>
          </div>
        </div>

        {/* Form */}
        <form
          className="px-6 py-4 h-full"
          onSubmit={handleSubmit(handleFormSubmit)}
        >
          <Box className="w-full h-19">
            <TextBox
              id="username"
              label=""
              placeholder={t("placeholder.pid")}
              value={formData.username}
              autoComplete="username"
              onChange={(e) =>
                handleTextChange("username", e.target.value)
              }
              register={register("username", { required: true })}
              helperText={
                !!errors.username
                  ? t("helperText.please-input-pid")
                  : ""
              }
              error={!!errors.username}
              minHeight="40px"
              labelFontSize="16px"
            />
          </Box>

          <Box className="w-full h-15.75 -mt-2.5">
            <TextBox
              id="password"
              type="password"
              label=""
              placeholder={t("placeholder.password")}
              value={formData.password}
              onChange={(e) =>
                handleTextChange("password", e.target.value)
              }
              register={register("password", { required: true })}
              helperText={
                !!errors.password
                  ? t("helperText.please-input-password")
                  : ""
              }
              error={!!errors.password}
              minHeight="40px"
              labelFontSize="16px"
            />
          </Box>

          <motion.button
            type="submit"
            disabled={loading}
            whileHover={{ scale: loading ? 1 : 1.05 }}
            style={{
              backgroundColor: "var(--theme-accent)",
              width: "100%",
              height: "50px",
              borderRadius: "5px",
              marginTop: "10px",
              color: "var(--theme-border-input)",
              opacity: loading ? 0.6 : 1,
              cursor: loading ? "not-allowed" : "pointer",
            }}
          >
            {loading ? t("button.loading") : t("button.login")}
          </motion.button>
        </form>

        {/* Footer */}
        <div
          className="flex justify-center items-center w-full h-15"
          style={{
            backgroundColor: "rgba(var(--theme-accent-rgb),0.1)",
          }}
        >
          <Typography
            variant="subtitle2"
            sx={{
              fontSize: "0.9rem",
              color: "var(--theme-accent)",
            }}
          >
            {`${t('text.app-version')}: ${version}`}
          </Typography>
        </div>
      </motion.div>
      </div>
    </section>
  );
};

export default Login;