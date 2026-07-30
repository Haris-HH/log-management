import { useEffect, useRef } from "react";

// Hooks
import { useReducedMotion } from "../../hooks/useReducedMotion";

// Add props type so className is accepted
type MatrixRainingCodeProps = {
  className?: string;
};

const MatrixRainingCode = ({ className = "" }: MatrixRainingCodeProps) => {
  // Properly type canvas ref
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);
    let columns = Math.floor(width / 20);

    const characters = "nsblogmanagement";
    const charArray = characters.split("");
    let drops: number[] = [];

    for (let i = 0; i < columns; i++) {
      drops[i] = 1;
    }

    const frameRate = 25;
    let lastFrameTime = Date.now();
    let animationId: number;

    /*
      อ่านสีจาก CSS variable แค่ครั้งเดียว แล้วเก็บไว้

      เดิมเรียก `getComputedStyle()` สองครั้งในทุกเฟรม (25 เฟรม/วินาที = 50
      ครั้ง/วินาที) ซึ่งเป็น forced style recalculation — เบราว์เซอร์ต้องคำนวณ
      style ที่ค้างอยู่ให้เสร็จทันทีก่อนคืนค่า สีเปลี่ยนเฉพาะเวลาสลับธีม จึงใช้
      MutationObserver คอย invalidate cache แทนการอ่านซ้ำทุกเฟรม
    */
    let trailColor = "";
    let textColor = "";

    const readThemeColors = () => {
      const rootStyle = getComputedStyle(document.documentElement);

      trailColor = `rgba(${rootStyle
        .getPropertyValue("--tertiary-color-rgb")
        .trim()}, 0.12)`;
      textColor = rootStyle.getPropertyValue("--primary-color").trim();
    };

    readThemeColors();

    /* `useTheme` เขียน `data-theme` กับ CSS variable ลงบน <html> ตอนสลับธีม */
    const themeObserver = new MutationObserver(readThemeColors);

    themeObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme", "style"],
    });

    const draw = () => {
      ctx.fillStyle = trailColor;
      ctx.fillRect(0, 0, width, height);

      ctx.fillStyle = textColor;
      ctx.font = "15px Noto Sans Thai, sans-serif";

      for (let i = 0; i < drops.length; i++) {
        const text = charArray[Math.floor(Math.random() * charArray.length)];
        ctx.fillText(text, i * 20, drops[i] * 20);

        if (drops[i] * 20 > height && Math.random() > 0.975) {
          drops[i] = 0;
        }

        drops[i]++;
      }
    };

    const animate = () => {
      const currentTime = Date.now();
      const elapsedTime = currentTime - lastFrameTime;

      if (elapsedTime > 1000 / frameRate) {
        draw();
        lastFrameTime = currentTime;
      }

      animationId = requestAnimationFrame(animate);
    };

    /*
      ลดการเคลื่อนไหว: วาดเฟรมนิ่งเฟรมเดียวแล้วจบ ไม่เปิด rAF loop เลย
      ยังเห็นพื้นหลังเป็นตัวอักษรเหมือนเดิม แต่ไม่มีอะไรตกลงมา
    */
    if (prefersReducedMotion) {
      draw();

      return () => {
        themeObserver.disconnect();
      };
    }

    animate();

    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
      columns = Math.floor(width / 20);

      drops = [];
      for (let i = 0; i < columns; i++) {
        drops[i] = 1;
      }
    };

    const isMobileDevice = /Mobi/i.test(window.navigator.userAgent);

    if (!isMobileDevice) {
      window.addEventListener("resize", handleResize);
    }

    return () => {
      cancelAnimationFrame(animationId);
      themeObserver.disconnect();

      if (!isMobileDevice) {
        window.removeEventListener("resize", handleResize);
      }
    };
  }, [prefersReducedMotion]);

  return (
    <canvas
      ref={canvasRef}
      className={`fixed top-0 left-0 z-[-1] ${className}`}
    />
  );
};

export default MatrixRainingCode;