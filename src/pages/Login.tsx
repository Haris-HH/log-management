import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { motion, AnimatePresence } from "framer-motion";

// Material UI
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";

// Components
import MatrixRainingCode from "../components/matrix-raining-effect/MatrixRainingEffect";
import TextBox from "../components/text-box/TextBox";
import CinematicTitle from "../components/cinematic-title/CinematicTitle";

// i18n
import { useTranslation } from "react-i18next";

interface FormData {
  username: string;
  password: string;
}

const Login = () => {
  const version = __APP_VERSION__;

  // i18n
  const { t } = useTranslation();

  const [introDone, setIntroDone] = useState(false);
  const [skipIntro, setSkipIntro] = useState(false);

  const [formData, setFormData] = React.useState<FormData>({
    username: "",
    password: "",
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm();

  useEffect(() => {
    const timer = setTimeout(() => {
      setIntroDone(true);
    }, 5500);

    return () => clearTimeout(timer);
  }, []);

  const finishIntro = () => {
    setSkipIntro(true);
    setIntroDone(true);
  };

  const handleTextChange = (key: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
    setValue(key, value);
  };

  const handleFormSubmit = () => {
    alert("Login");
  };

  return (
    <section
      id="login"
      onClick={finishIntro}
      className="h-screen w-screen flex items-center justify-center relative overflow-hidden"
      style={{
        backgroundColor: "rgba(var(--secondary-color-rgb), 0.1)"
      }}
    >
      {
        introDone && <MatrixRainingCode className="absolute inset-0" />
      }

      {/* INTRO OVERLAY */}
      <AnimatePresence mode="wait">
        {!introDone && (
          <motion.div
            className="absolute inset-0 z-50 flex flex-col items-center justify-center"
            style={{
              background: "var(--secondary-color)",
            }}
            initial={{ opacity: 1 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1 }}
          >
            <CinematicTitle skipIntro={skipIntro} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* LOGIN CARD */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{
          opacity: introDone ? 1 : 0,
          y: introDone ? 0 : 40,
        }}
        transition={{ duration: 0.8 }}
        className="flex flex-col w-122 h-90 rounded-lg z-10"
        style={{
          backgroundColor: "rgba(var(--secondary-color-rgb),0.8)",
          border: "1px solid var(--primary-color)",
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
            className="flex flex-col text-(--tertiary-color)"
          >
            <Typography
              variant="h6"
              sx={{ fontSize: "1.8rem", fontWeight: "bold", textShadow: "1px 2px 2px var(--primary-color)" }}
            >
              {t('project.title')}
            </Typography>
            <Typography
              variant="h6"
              sx={{ fontSize: "0.8rem", mt: -1, textShadow: "1px 1px 2px var(--primary-color)" }}
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
            whileHover={{ scale: 1.05 }}
            style={{
              backgroundColor: "var(--primary-color)",
              width: "100%",
              height: "50px",
              borderRadius: "5px",
              marginTop: "10px",
              color: "var(--tertiary-color)",
            }}
          >
            {t("button.login")}
          </motion.button>
        </form>

        {/* Footer */}
        <div
          className="flex justify-center items-center w-full h-15"
          style={{
            backgroundColor: "rgba(var(--primary-color-rgb), 0.1)",
          }}
        >
          <Typography
            variant="subtitle2"
            sx={{
              fontSize: "0.9rem",
              color: "var(--primary-color)",
            }}
          >
            {`${t('text.app-version')}: ${version}`}
          </Typography>
        </div>
      </motion.div>
    </section>
  );
};

export default Login;