import { motion } from "framer-motion";

// i18n
import { useTranslation } from "react-i18next";

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
      className={`flex overflow-hidden text-(--primary-color) ${className}`}
      style={{
        textShadow: "1px 3px 2px var(--tertiary-color)"
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
  
  return (
    <motion.div 
      exit={{
        opacity: 0,
        y: -100,
        scale: 0.5,
      }}
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
        initial={{ 
          scale: 5, 
          opacity: 1, 
          x: 0 
        }}
        animate={{
          scale: 2,
          opacity: 1,
          x: 0,
        }}
        transition={{
          duration: skipIntro ? 0.8 : 1.8,
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
        className="text-(--primary-color)"
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
          background: "rgba(var(--primary-color-rgb),0.1)",
          filter: "blur(90px)",
        }}
        animate={{
          scale: [1, 1.3, 1],
          opacity: [0.4, 0.8, 0.4],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
        }}
      />
    </motion.div>
  );
};

export default CinematicTitle;