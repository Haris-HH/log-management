import { useState } from "react";
import { Outlet, useLocation } from "react-router-dom";

// Components
import Navbar from "./Navbar";
import DockDrawer from "../components/dock-drawer/DockDrawer";
import Watermark from "../components/watermark/WaterMark";

// Assets
import backgroundVideo from "../assets/video/background_video.mp4";

const MainLayout = () => {
  // State
  const [open, setOpen] = useState(false);

  const location = useLocation();

  return (
    <div className="relative min-h-screen overflow-hidden">
      <Navbar />

      <Watermark text={"คู่สัญญา"} hashPid={"HASH PID"} />
      
      <main
        style={{
          height: "calc(100vh - 64px)",
          position: "relative",
          overflow: "hidden",
          marginTop: "64px",
        }}
      >
        {/* Background Video */}
        <video
          autoPlay
          loop
          muted
          playsInline
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
            zIndex: -2,
          }}
        >
          <source src={backgroundVideo} type="video/mp4" />
        </video>

        {/* Overlay */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundColor: "rgba(var(--secondary-color-rgb),0.35)",
            zIndex: -1,
          }}
        />

        {/* Page Content */}
        <div className="relative h-full w-full">
          <Outlet />
        </div>
      </main>
      
      {/* Dock Drawer */}
      {
        location.pathname !== "/" && (
          <DockDrawer open={open} setOpen={setOpen} />
        )
      }
    </div>
  );
};

export default MainLayout;