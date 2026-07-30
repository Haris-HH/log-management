import { useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";

// Material UI
import Box from "@mui/material/Box";

// Hooks
import { useDockItems } from "../hooks/useDockItems";
import { useReducedMotion } from "../hooks/useReducedMotion";

// Constants
import { MOTION_EASE_ARRAY } from "../constants/motion";

const Home = () => {
  const navigate = useNavigate();
  const dockItems = useDockItems();

  const prefersReducedMotion = useReducedMotion();

  // Data
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  /*
    ตำแหน่งเมาส์เก็บใน ref ไม่ใช่ state

    เดิมเก็บใน state แล้ว `onMouseMove` เรียก `setMousePosition` ทุกอีเวนต์ ทำให้
    Home re-render หลายร้อยครั้งต่อวินาทีขณะเลื่อนเมาส์ และยังทำให้เกิดบั๊กด้วย:
    ค่า `pointer` ที่ป้อนให้ `clipPath` เปลี่ยนไปเรื่อย ๆ ระหว่างที่วงกลมกำลัง
    ขยาย จุดศูนย์กลางจึงวิ่งตามเมาส์แทนที่จะอยู่ที่จุดที่เมาส์เข้ามาครั้งแรก และ
    ตอน exit ก็หุบเข้าหาตำแหน่งล่าสุดไม่ใช่ตำแหน่งเดิม

    ตอนนี้จึงบันทึกลง ref (ไม่ re-render) แล้วเขียนลง CSS variable ของการ์ด
    "ครั้งเดียวตอน hover เริ่ม" — จุดศูนย์กลางถูกล็อกไว้ และการขยายวงเป็นงานของ
    CSS transition ล้วน ๆ
  */
  const pointerRef = useRef<Record<number, { x: number; y: number }>>({});
  const cardRefs = useRef<Record<number, HTMLDivElement | null>>({});

  const handleHoverStart = (index: number) => {
    const pointer = pointerRef.current[index] ?? { x: 50, y: 50 };
    const card = cardRefs.current[index];

    if (card) {
      card.style.setProperty("--fill-x", `${pointer.x}%`);
      card.style.setProperty("--fill-y", `${pointer.y}%`);
    }

    setHoveredIndex(index);
  };

  return (
    <section id="home" className="h-full w-full overflow-y-auto">
      <Box className="h-full p-4"
        sx={{
          display: "grid",
          gap: 4,
          gridTemplateColumns: {
            xs: "1fr",
            md: "repeat(2, minmax(0, 1fr))",
            lg: "repeat(3, minmax(0, 1fr))",
          },
        }}
      >
        {dockItems.filter((item) => item.subMenu).map((item, index) => {
          const isHovered = hoveredIndex === index;

          return (
            <motion.div
              key={item.label}
              ref={(node: HTMLDivElement | null) => {
                cardRefs.current[index] = node;
              }}
              onHoverStart={() => handleHoverStart(index)}
              onHoverEnd={() => setHoveredIndex(null)}
              onMouseMove={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();

                pointerRef.current[index] = {
                  x: ((e.clientX - rect.left) / rect.width) * 100,
                  y: ((e.clientY - rect.top) / rect.height) * 100,
                };
              }}
              className="
                menu relative flex cursor-pointer flex-col overflow-hidden
                rounded-2xl border p-6 min-h-70
              "
              style={{
                borderColor: "var(--primary-color)",
                backgroundColor: "rgba(var(--tertiary-color-rgb), 0.8)",
              }}
            >
              {/*
                วงกลมที่แผ่ออกจากจุดที่เมาส์เข้ามา ทำด้วย CSS ทั้งหมด (ดู
                `.menu .menu-fill` ใน src/App.css) จุดศูนย์กลางมาจาก CSS variable
                ที่เขียนไว้ครั้งเดียวตอน hover เริ่ม จึงไม่วิ่งตามเมาส์อีก และเพราะ
                เป็น CSS transition มันจึง retarget กลางทางได้เอง — กวาดเมาส์ผ่าน
                หลายการ์ดติดกันไม่ต้องรอคิวแบบ AnimatePresence mode="wait" เดิม
              */}
              <div
                aria-hidden="true"
                className="menu-fill absolute inset-0 z-0"
                style={{
                  background: "rgba(var(--secondary-color-rgb), 0.1)",
                }}
              />

              {/* Label Container */}
              <motion.div
                className={`
                  relative z-10 flex w-full
                  ${
                    isHovered
                      ? "items-start justify-start"
                      : "flex-1 items-center justify-center"
                  }
                `}
              >
                <motion.h3
                  className="
                    menu-title relative
                    font-bold text-(--primary-color)
                    text-2xl md:text-4xl
                    pb-2
                  "
                >
                  {item.label}
                </motion.h3>
              </motion.div>

              {/* Spacer */}
              {isHovered && <div className="h-8" />}

              {/* Sub-menu */}
              <AnimatePresence>
                {isHovered && item.subMenu && (
                  <motion.div
                    initial={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: 40 }}
                    animate={prefersReducedMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
                    transition={{
                      duration: prefersReducedMotion ? 0.15 : 0.4,
                      ease: MOTION_EASE_ARRAY.entrance,
                    }}
                    className="
                      relative z-10
                      flex flex-col [@media(max-height:780px)]:grid [@media(max-height:700px)]:grid-cols-2 gap-3
                    "
                  >
                    {item.subMenu.map((sub, subIndex) => (
                      <motion.div
                        key={sub.label}
                        initial={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, x: -20 }}
                        animate={prefersReducedMotion ? { opacity: 1 } : { opacity: 1, x: 0 }}
                        transition={{
                          duration: prefersReducedMotion ? 0.15 : 0.35,
                          delay: prefersReducedMotion ? 0 : subIndex * 0.08,
                        }}
                        className="
                          rounded-xl border border-(--primary-color)
                          bg-(--tertiary-bg-color)/10 px-4 py-3
                          backdrop-blur-sm
                          text-(--secondary-color)
                          hover:bg-(--primary-color)
                          hover:text-(--tertiary-color)
                          transition-colors duration-150
                        "
                        onClick={() => navigate(sub.path)}
                      >
                        <span className="text-sm md:text-base font-medium">
                          {sub.label}
                        </span>
                      </motion.div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </Box>
    </section>
  );
};

export default Home;