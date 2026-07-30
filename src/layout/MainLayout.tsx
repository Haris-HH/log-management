import { useState } from "react";
import { Outlet } from "react-router-dom";
import { useSelector } from 'react-redux';

// Components
import Navbar from "./Navbar";
import DockDrawer from "../components/dock-drawer/DockDrawer";
import NavSidebar from "../components/nav-sidebar/NavSidebar";
import Watermark from "../components/watermark/WaterMark";

// Assets
import backgroundVideo from "../assets/video/background_video.mp4";

// i18n
import { useTranslation } from "react-i18next";

// Hooks
import { useNavLayout } from "../hooks/useNavPosition";
import { useReducedMotion } from "../hooks/useReducedMotion";

// Constants
import { transitionOf } from "../constants/motion";

// Store
import type { RootState } from "../store/store";

const MainLayout = () => {
  // i18n
  const { i18n } = useTranslation();

  // State
  const [open, setOpen] = useState(false);

  const { navPosition, showNav, isSidebarPosition, isWideViewport, sidebarOffset } =
    useNavLayout();

  const prefersReducedMotion = useReducedMotion();

  const { user } = useSelector((state: RootState) => state.authUser);

  const hashPid = user?.hash_id || "NO HASH ID";
  const nsbOu = i18n.language === "th" ? user?.agency?.ou_abbr_th || "-" : user?.agency?.ou_abbr_en || "-";

  /*
    `top` renders inline in the Navbar, but there is no room for that beside the
    branding on a phone, so it borrows the drawer at mobile widths.
  */
  const useDrawerNav =
    isSidebarPosition || (!isWideViewport && navPosition === "top");

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
          /*
            A pinned sidebar reserves space rather than covering the page, so the
            content is inset on whichever side it is anchored to. The transition
            matches the navbar's so the layout shifts as one.
          */
          marginLeft: navPosition === "left" ? sidebarOffset : 0,
          marginRight: navPosition === "right" ? sidebarOffset : 0,
          transition: transitionOf(["margin"], "base", "movement"),
        }}
      >
        {/*
          Background Video

          วิดีโอที่เล่นวนอยู่เบื้องหลังทุกหน้าคือการเคลื่อนไหวถาวรที่ผู้ใช้หยุด
          ไม่ได้ และยังต้องถอดรหัสวิดีโอตลอดเวลา เมื่อผู้ใช้ขอลดการเคลื่อนไหวจึง
          หยุดที่เฟรมแรกแทน (ยังคงภาพพื้นหลังไว้ ไม่ได้ตัดทิ้งจนหน้าจอโล่ง)
        */}
        <video
          autoPlay={!prefersReducedMotion}
          loop={!prefersReducedMotion}
          muted
          playsInline
          aria-hidden="true"
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
            backgroundColor: "rgba(var(--tertiary-color-rgb),0.85)",
            zIndex: -1,
          }}
        />

        {/* Page Content */}
        <div className="relative h-full w-full">
          <Outlet />
        </div>
      </main>
      
      {/* Navigation — one shape per position; `top` lives in the Navbar itself. */}
      {showNav && useDrawerNav && <NavSidebar />}

      {showNav && navPosition === "bottom" && (
        <DockDrawer open={open} setOpen={setOpen} />
      )}
    </div>
  );
};

export default MainLayout;