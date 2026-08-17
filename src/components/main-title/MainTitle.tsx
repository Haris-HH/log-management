import { motion } from "framer-motion";

// Material UI
import Typography from "@mui/material/Typography";

// Hooks
import { useReducedMotion } from "../../hooks/useReducedMotion";

type Props = {
  title: string;
};

const MainTitle = ({ title }: Props) => {
  const prefersReducedMotion = useReducedMotion();

  return (
    <Typography
      component="div"
      variant="h6"
      sx={{
        position: "relative",
        display: "inline-block",
        fontSize: "1.4rem",
        fontWeight: "bold",
        color: "var(--theme-accent)",
        textShadow: `5px 3px 5px var(--theme-border-input)`,
        overflow: "hidden",
        width: "fit-content",
      }}
    >
      {/* Title Text */}
      {title}

      {/* Animated Underline */}
      <motion.span
        style={{
          position: "absolute",
          left: 0,
          bottom: "3px",
          height: "3px",
          width: "100%",
          background: "var(--theme-accent)",
          border: "0.25px solid var(--theme-border-input)",
          transformOrigin: "left",
          borderRadius: "999px",
          boxShadow: "0 0 8px var(--theme-accent)",
        }}
        /*
          เส้นใต้นี้วิ่งวนไม่รู้จบและอยู่บนจอทุกหน้า เมื่อผู้ใช้ขอลดการเคลื่อนไหว
          จึงวางเป็นเส้นนิ่งเต็มความกว้างแทน — ยังเห็นเส้นใต้หัวข้อเหมือนเดิม
          แต่ไม่มีอะไรขยับอยู่ข้างข้อมูลตลอดเวลา
        */
        animate={
          prefersReducedMotion
            ? { scaleX: 1, x: "0%" }
            : { scaleX: [0, 1, 0], x: ["0%", "0%", "100%"] }
        }
        transition={
          prefersReducedMotion
            ? { duration: 0 }
            : {
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut",
                times: [0, 0.5, 1],
              }
        }
      />
    </Typography>
  );
};

export default MainTitle;