import React from "react";

interface WatermarkProps {
  text: string;
  hashPid: string;
}

const Watermark: React.FC<WatermarkProps> = ({ text, hashPid }) => {
  return (
    <div className="fixed inset-0 z-9999 pointer-events-none overflow-hidden grid grid-cols-6 gap-20 p-10 opacity-20">
      {Array.from({ length: 36 }).map((_, index) => (
        <div key={index} className="flex flex-col justify-center items-center text-(--primary-color) rotate-320"
          style={{
            textShadow: "0px 1px 1px var(--tertiary-color)"
          }}
        >
          <p>{text}</p>
          <p>{hashPid}</p>
        </div>
      ))}
    </div>
  );
};

export default Watermark;