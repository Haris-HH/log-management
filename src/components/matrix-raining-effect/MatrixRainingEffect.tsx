import { useEffect, useRef } from "react";

// Add props type so className is accepted
type MatrixRainingCodeProps = {
  className?: string;
};

const MatrixRainingCode = ({ className = "" }: MatrixRainingCodeProps) => {
  // Properly type canvas ref
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

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

    const draw = () => {
      const secondaryColor = getComputedStyle(document.documentElement)
        .getPropertyValue("--secondary-color-rgb")
        .trim();
      ctx.fillStyle = `rgba(${secondaryColor}, 0.12)`;
      ctx.fillRect(0, 0, width, height);

      const primaryColor = getComputedStyle(document.documentElement)
        .getPropertyValue("--primary-color")
        .trim();

      ctx.fillStyle = primaryColor;
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

      if (!isMobileDevice) {
        window.removeEventListener("resize", handleResize);
      }
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className={`fixed top-0 left-0 z-[-1] ${className}`}
    />
  );
};

export default MatrixRainingCode;