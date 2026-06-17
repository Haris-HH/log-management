import { motion } from "framer-motion";

// Material UI
import Typography from "@mui/material/Typography";

type Props = {
  title: string;
};

const MainTitle = ({ title }: Props) => {
  return (
    <Typography
      component="div"
      variant="h6"
      sx={{
        position: "relative",
        display: "inline-block",
        fontSize: "1.4rem",
        fontWeight: "bold",
        color: "var(--primary-color)",
        textShadow: `5px 3px 5px var(--tertiary-color)`,
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
          background: "var(--primary-color)",
          border: "0.25px solid var(--tertiary-color)",
          transformOrigin: "left",
          borderRadius: "999px",
          boxShadow: "0 0 8px var(--primary-color)",
        }}
        animate={{
          scaleX: [0, 1, 0],
          x: ["0%", "0%", "100%"],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut",
          times: [0, 0.5, 1],
        }}
      />
    </Typography>
  );
};

export default MainTitle;