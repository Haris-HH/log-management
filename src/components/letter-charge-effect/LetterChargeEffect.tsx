import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

// i18n
import { useTranslation } from "react-i18next";

type Particle = {
  id: number;
  char: string;
  x: number;
  y: number;
  dx: number;
  dy: number;
};


const LetterChargeEffect = () => {

  // i18n
  const { t } = useTranslation();

  // Data
  const [particles, setParticles] = useState<Particle[]>([]);

  const CHARS = t('project.title');

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const clickX = e.clientX;
    const clickY = e.clientY;

    const newParticles: Particle[] = Array.from({ length: 45 }).map((_, index) => {
      const angle = Math.random() * Math.PI * 2;
      const distance = 50 + Math.random() * 350;

      return {
        id: Date.now() + index,
        char: CHARS[Math.floor(Math.random() * CHARS.length)],
        x: clickX + Math.cos(angle) * distance,
        y: clickY + Math.sin(angle) * distance,
        dx: clickX,
        dy: clickY,
      };
    });

    setParticles((prev) => [...prev, ...newParticles]);

    setTimeout(() => {
      setParticles((prev) =>
        prev.filter((p) => !newParticles.some((np) => np.id === p.id))
      );
    }, 900);
  };

  return (
    <div
      onClick={handleClick}
      className="fixed inset-0 pointer-events-auto z-20"
    >
      <AnimatePresence>
        {particles.map((particle) => (
          <motion.span
            key={particle.id}
            initial={{
              x: particle.x,
              y: particle.y,
              opacity: 0,
              scale: 1.8,
              rotate: Math.random() * 360,
            }}
            animate={{
              x: particle.dx,
              y: particle.dy,
              opacity: [0, 1, 1, 0],
              scale: [1.8, 1.2, 0.3],
              rotate: 0,
            }}
            exit={{ opacity: 0 }}
            transition={{
              duration: 0.8,
              ease: "easeInOut",
            }}
            style={{
              position: "fixed",
              left: 0,
              top: 0,
              color: "var(--primary-color)",
              fontSize: "18px",
              fontWeight: "bold",
              textShadow: "0 0 8px var(--primary-color)",
              pointerEvents: "none",
            }}
          >
            {particle.char}
          </motion.span>
        ))}
      </AnimatePresence>
    </div>
  );
};

export default LetterChargeEffect;