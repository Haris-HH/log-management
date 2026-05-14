import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";

// Hooks
import { useDockItems } from "../hooks/useDockItems";

const Home = () => {
  const navigate = useNavigate();
  const dockItems = useDockItems();

  // Data
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [mousePosition, setMousePosition] = useState<Record<number, { x: number; y: number }>>({});

  return (
    <section id="home" className="h-full w-full">
      <div className="grid h-full grid-cols-2 [@media(max-height:780px)]:grid-cols-1 gap-4 p-4">
        {dockItems.filter((item) => item.subMenu).map((item, index) => {
          const isHovered = hoveredIndex === index;
          const pointer = mousePosition[index] || { x: 50, y: 50 };

          return (
            <motion.div
              key={item.label}
              onHoverStart={() => setHoveredIndex(index)}
              onHoverEnd={() => setHoveredIndex(null)}
              onMouseMove={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                const x = ((e.clientX - rect.left) / rect.width) * 100;
                const y = ((e.clientY - rect.top) / rect.height) * 100;

                setMousePosition((prev) => ({
                  ...prev,
                  [index]: { x, y },
                }));
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
              <AnimatePresence mode="wait">
                {isHovered && (
                  <motion.div
                    key={`hover-bg-${index}`}
                    initial={{
                      clipPath: `circle(0% at ${pointer.x}% ${pointer.y}%)`,
                      opacity: 1,
                    }}
                    animate={{
                      clipPath: `circle(150% at ${pointer.x}% ${pointer.y}%)`,
                      opacity: 1,
                    }}
                    exit={{
                      clipPath: `circle(0% at ${pointer.x}% ${pointer.y}%)`,
                      opacity: 1,
                    }}
                    transition={{
                      duration: 0.55,
                      ease: "easeInOut",
                    }}
                    className="absolute inset-0 z-0"
                    style={{
                      background: "rgba(var(--secondary-color-rgb), 0.8)",
                    }}
                  />
                )}
              </AnimatePresence>

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
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                      duration: 0.4,
                      ease: "easeOut",
                    }}
                    className="
                      relative z-10
                      flex flex-col [@media(max-height:780px)]:grid [@media(max-height:700px)]:grid-cols-2 gap-3
                    "
                  >
                    {item.subMenu.map((sub, subIndex) => (
                      <motion.div
                        key={sub.label}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{
                          duration: 0.35,
                          delay: subIndex * 0.08,
                        }}
                        className="
                          rounded-xl border border-(--primary-color)/20
                          bg-white/10 px-4 py-3
                          backdrop-blur-sm
                          hover:bg-(--primary-color)/20
                          transition-all duration-300
                        "
                        onClick={() => navigate(sub.path)}
                      >
                        <span className="text-sm md:text-base font-medium text-white">
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
      </div>
    </section>
  );
};

export default Home;