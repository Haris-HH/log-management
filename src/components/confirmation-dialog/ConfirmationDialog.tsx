import { useEffect, useMemo, useRef, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";

// Material UI
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import CancelRoundedIcon from "@mui/icons-material/CancelRounded";
import WarningRoundedIcon from "@mui/icons-material/WarningRounded";
import InfoRoundedIcon from "@mui/icons-material/InfoRounded";
import HelpRoundedIcon from "@mui/icons-material/HelpRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";

// i18n
import { useTranslation } from "react-i18next";

// Utils
import {
  getActiveDialog,
  resolveActiveDialog,
  subscribeConfirmationDialog,
  type DialogConfig,
  type PopupIcon,
} from "./confirmationDialogStore";

const ICON_MAP: Record<PopupIcon, typeof CheckCircleRoundedIcon> = {
  success: CheckCircleRoundedIcon,
  error: CancelRoundedIcon,
  warning: WarningRoundedIcon,
  info: InfoRoundedIcon,
  question: HelpRoundedIcon,
};

// No dedicated success/warning theme tokens exist in this app's palette
// (src/hooks/useTheme.tsx), unlike --theme-red/--theme-accent — so those two
// fall back to fixed colors instead of a CSS var.
const ICON_COLORS: Record<PopupIcon, string> = {
  success: "#2e7d32",
  error: "var(--theme-red)",
  warning: "#ed6c02",
  info: "#0288d1",
  question: "var(--theme-accent)",
};

const panelVariants = {
  hidden: { opacity: 0, scale: 0.92, y: 14 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      type: "spring" as const,
      stiffness: 420,
      damping: 30,
      mass: 0.9,
      staggerChildren: 0.045,
      delayChildren: 0.05,
    },
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    y: 8,
    transition: { duration: 0.14, ease: "easeIn" as const },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 8 },
  visible: { opacity: 1, y: 0 },
};

const FOCUSABLE_SELECTOR =
  'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

function DialogView({ config }: { config: DialogConfig }) {
  const { t } = useTranslation();
  const panelRef = useRef<HTMLDivElement>(null);
  const primaryButtonRef = useRef<HTMLButtonElement>(null);

  const Icon = ICON_MAP[config.icon];
  const iconColor = config.iconColor || ICON_COLORS[config.icon];

  const confirm = (result: boolean) => resolveActiveDialog(result);
  const dismiss = () => confirm(false);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => primaryButtonRef.current?.focus(), 220);

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        dismiss();
        return;
      }

      if (event.key !== "Tab" || !panelRef.current) return;

      const focusable = Array.from(
        panelRef.current.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)
      );
      if (focusable.length === 0) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("keydown", onKeyDown);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <motion.div
      className="fixed inset-0 flex items-center justify-center p-4"
      style={{ zIndex: 99999 }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.16 }}
    >
      <motion.div
        className="absolute inset-0"
        style={{ backgroundColor: "var(--theme-bg-overlay)", backdropFilter: "blur(2px)" }}
        onClick={dismiss}
      />

      <motion.div
        ref={panelRef}
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="confirmation-dialog-title"
        aria-describedby="confirmation-dialog-text"
        variants={panelVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
        className="relative w-full flex flex-col items-center text-center gap-3 px-6 py-7"
        style={{
          maxWidth: "420px",
          borderRadius: "12px",
          backgroundColor: "var(--theme-bg-panel)",
          border: "1px solid rgba(var(--theme-accent-rgb), 0.35)",
          boxShadow: "0 12px 40px rgba(var(--theme-panel-rgb), 0.35)",
        }}
      >
        <IconButton
          onClick={dismiss}
          aria-label={t("button.close")}
          sx={{
            position: "absolute",
            top: 6,
            right: 6,
            color: "var(--theme-accent)",
          }}
        >
          <CloseRoundedIcon sx={{ fontSize: 20 }} />
        </IconButton>

        <motion.div variants={itemVariants}>
          <Icon sx={{ fontSize: 56, color: iconColor }} />
        </motion.div>

        {config.title && (
          <motion.h2
            id="confirmation-dialog-title"
            variants={itemVariants}
            className="text-lg font-semibold m-0"
            style={{ color: "var(--theme-accent)" }}
          >
            {config.title}
          </motion.h2>
        )}

        {config.text && (
          <motion.p
            id="confirmation-dialog-text"
            variants={itemVariants}
            className="text-sm m-0 whitespace-pre-line"
            style={{ color: "var(--theme-text-secondary)" }}
          >
            {config.text}
          </motion.p>
        )}

        <motion.div variants={itemVariants} className="flex justify-center gap-2 pt-2 flex-wrap">
          {config.kind === "alert" && (
            <Button
              ref={primaryButtonRef}
              variant="contained"
              onClick={() => confirm(true)}
              sx={{ backgroundColor: "var(--theme-accent)", color: "var(--theme-text-on-accent)" }}
            >
              {t("button.close")}
            </Button>
          )}

          {config.kind === "confirm" && (
            <>
              <Button
                variant="outlined"
                onClick={dismiss}
                sx={{ color: "var(--theme-accent)", borderColor: "var(--theme-accent)" }}
              >
                {config.cancelText}
              </Button>
              <Button
                ref={primaryButtonRef}
                variant="contained"
                onClick={() => confirm(true)}
                sx={{ backgroundColor: "var(--theme-accent)", color: "var(--theme-text-on-accent)" }}
              >
                {config.confirmText}
              </Button>
            </>
          )}
        </motion.div>
      </motion.div>
    </motion.div>
  );
}

/**
 * Mounted once near the app root. Subscribes to the confirmation dialog
 * store and renders the active dialog (if any) through a portal, animated
 * with framer-motion. `src/utils/popupMessage.tsx` is the imperative API
 * that feeds this store.
 */
const ConfirmationDialog = () => {
  const active = useSyncExternalStore(subscribeConfirmationDialog, getActiveDialog, getActiveDialog);
  const portalTarget = useMemo(() => document.body, []);

  return createPortal(
    <AnimatePresence mode="wait">
      {active && <DialogView key={active.id} config={active.config} />}
    </AnimatePresence>,
    portalTarget
  );
};

export default ConfirmationDialog;
