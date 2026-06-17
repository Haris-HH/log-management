import { useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { useSelector } from 'react-redux';

// Components
import Navbar from "./Navbar";
import DockDrawer from "../components/dock-drawer/DockDrawer";
import Watermark from "../components/watermark/WaterMark";

// Assets
import backgroundVideo from "../assets/video/background_video.mp4";

// i18n
import { useTranslation } from "react-i18next";

// Store
import type { RootState } from "../store/store";

const MainLayout = () => {
  // i18n
  const { i18n } = useTranslation();

  // State
  const [open, setOpen] = useState(false);

  const location = useLocation();

  const { user } = useSelector((state: RootState) => state.authUser);

  const hashPid = user?.hash_id || "NO HASH ID";
  const nsbOu = i18n.language === "th" ? user?.agency.ou_abbr_th || "-" : user?.agency.ou_abbr_en || "-";

  return (
    <div className="relative min-h-screen overflow-hidden">
      <Navbar />

      <Watermark text={nsbOu} hashPid={hashPid} />
      
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
            backgroundColor: "rgba(var(--tertiary-color-rgb),0.8)",
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