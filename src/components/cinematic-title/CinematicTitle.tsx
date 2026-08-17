import { motion } from "framer-motion";

// i18n
import { useTranslation } from "react-i18next";

// Hooks
import { useReducedMotion } from "../../hooks/useReducedMotion";

const AnimatedText = ({
  text,
  delay = 0,
  className = "",
}: {
  text: string;
  delay?: number;
  className?: string;
}) => {
  return (
    <div 
      className={`flex overflow-hidden text-(--theme-accent) ${className}`}
      style={{
        textShadow: "1px 3px 2px var(--theme-border-input)"
      }}
    >
      {text.split("").map((char, index) => (
        <motion.span
          key={index}
          initial={{ width: 0, opacity: 0 }}
          animate={{ width: "auto", opacity: 1 }}
          transition={{
            delay: delay + index * 0.04,
            duration: 0.08,
          }}
          style={{
            display: "inline-block",
            whiteSpace: "pre",
            overflow: "hidden",
          }}
        >
          {char}
        </motion.span>
      ))}
    </div>
  );
};

const CinematicTitle = ({ skipIntro = false }: { skipIntro?: boolean }) => {
  // i18n
  const { t } = useTranslation();

  // Hooks
  const prefersReducedMotion = useReducedMotion();

  return (
    <motion.div 
      exit={
        prefersReducedMotion
          ? { opacity: 0 }
          : { opacity: 0, y: -100, scale: 0.5 }
      }
      transition={{
        duration: skipIntro ? 0.8 : 0.5,
        ease: "easeOut",
      }}
      className="flex items-center justify-center"
    >
      {/* LOGO */}
      <motion.img
        src="/project-logo/logo.png"
        alt="Logo"
        /* ลดการเคลื่อนไหว: โลโก้ปรากฏที่ขนาดสุดท้ายเลย ไม่ซูมจาก 5 เท่า */
        initial={prefersReducedMotion ? { scale: 2, opacity: 0 } : { scale: 5 }}
        animate={prefersReducedMotion ? { scale: 2, opacity: 1 } : { scale: 2 }}
        transition={{
          duration: prefersReducedMotion ? 0.2 : skipIntro ? 0.8 : 1.8,
          ease: "easeIn",
        }}
        className="mx-4 w-24 h-24"
      />

      {/* TEXT */}
      <motion.div
        initial={{ opacity: 0, x: 45 }}
        animate={{ opacity: 1, x: 45 }}
        transition={{
          delay: skipIntro ? 0.2 : 2,
        }}
        className="text-(--theme-accent)"
      >
        <AnimatedText
          text={t('project.title')}
          delay={skipIntro ? 0.2 : 2}
          className="text-6xl font-bold h-17"
        />
        <AnimatedText
          text={t('project.subtitle')}
          delay={skipIntro ? 0.5 : 2.8}
          className="text-2xl"
        />
      </motion.div>

      {/* GLOW */}
      <motion.div
        className="absolute w-96 h-96 rounded-full"
        style={{
          background: "rgba(var(--theme-accent-rgb),0.1)",
          filter: "blur(90px)",
        }}
        /* ลดการเคลื่อนไหว: แสงเรืองค้างที่ความสว่างกลาง ไม่หายใจเข้าออกไม่รู้จบ */
        animate={
          prefersReducedMotion
            ? { scale: 1, opacity: 0.6 }
            : { scale: [1, 1.3, 1], opacity: [0.4, 0.8, 0.4] }
        }
        transition={
          prefersReducedMotion
            ? { duration: 0 }
            : { duration: 3, repeat: Infinity, ease: "easeInOut" }
        }
      />
    </motion.div>
  );
};

export default CinematicTitle;