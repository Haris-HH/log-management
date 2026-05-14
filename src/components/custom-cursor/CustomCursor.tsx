import { useEffect, useState } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";

const CLICKABLE_SELECTOR = `
  a,
  button,
  input,
  textarea,
  select,
  label,
  summary,
  [role="button"],
  [role="link"],
  [data-cursor="pointer"],
  .cursor-pointer
`;

const CustomCursor = () => {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const [cursorVariant, setCursorVariant] = useState<"default" | "pointer">(
    "default"
  );

  const springX = useSpring(mouseX, {
    stiffness: 4000,
    damping: 40,
    mass: 0.1,
  });

  const springY = useSpring(mouseY, {
    stiffness: 1200,
    damping: 40,
    mass: 0.1,
  });

  useEffect(() => {
    const moveCursor = (e: MouseEvent) => {
      mouseX.set(e.clientX - 5);
      mouseY.set(e.clientY - 5);

      const target = e.target as HTMLElement | null;

      if (!target) {
        setCursorVariant("default");
        return;
      }

      const clickableElement = target.closest(CLICKABLE_SELECTOR);
      const computedCursor = window.getComputedStyle(target).cursor;

      if (clickableElement || computedCursor === "pointer") {
        setCursorVariant("pointer");
      } 
      else {
        setCursorVariant("default");
      }
    };

    window.addEventListener("mousemove", moveCursor);

    return () => {
      window.removeEventListener("mousemove", moveCursor);
    };
  }, [mouseX, mouseY]);

  const variants = {
    default: {
      scale: 1,
      opacity: 1,
      backgroundColor: "var(--primary-color)",
      border: "0px solid transparent",
    },
    pointer: {
      scale: 2,
      opacity: 0.9,
      backgroundColor: "rgba(var(--primary-color-rgb), 0.15)",
      border: "2px solid rgba(var(--primary-color-rgb), 1)",
    },
  }

  return (
    <motion.div
      className="fixed left-0 top-0 pointer-events-none z-2147483647 rounded-full"
      style={{
        width: "10px",
        height: "10px",
        background: "var(--primary-color)",
        backdropFilter: "blur(8px)",
        boxShadow:
          cursorVariant === "pointer"
            ? "0 0 18px rgba(var(--primary-color-rgb), 0.8)"
            : "0 0 8px rgba(var(--tertiary-color-rgb),0.8)",
        x: springX,
        y: springY,
      }}
      variants={variants}
      animate={cursorVariant}
      transition={{
        type: "spring",
        stiffness: 500,
        damping: 30,
      }}
    />
  );
};

export default CustomCursor;