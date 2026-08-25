import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import IconButton from "@mui/material/IconButton";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Popper from "@mui/material/Popper";
import Paper from "@mui/material/Paper";
import MenuList from "@mui/material/MenuList";
import MenuItem from "@mui/material/MenuItem";
import Fade from "@mui/material/Fade";

import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";

import { useDockItems } from "../../hooks/useDockItems";

// Constants
import { transitionOf } from "../../constants/motion";

type DockDrawerProps = {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
};

const DockDrawer = ({ open, setOpen }: DockDrawerProps) => {
  const dockItems = useDockItems();
  const navigate = useNavigate();

  // Data
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const [activeSubMenu, setActiveSubMenu] = useState<number | null>(null);

  // Ref
  const closeTimerRef = useRef<number | null>(null);

  const clearCloseTimer = () => {
    if (closeTimerRef.current) {
      window.clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
  };

  const startCloseTimer = () => {
    clearCloseTimer();

    closeTimerRef.current = window.setTimeout(() => {
      setOpen(false);
      handleSubMenuClose();
    }, 250);
  };

  /*
    MainLayout unmounts the dock on the home route and whenever the menu moves
    to another edge, either of which can happen while a close timer is still
    pending; without this the callback would still fire against an unmounted
    component.
  */
  useEffect(() => clearCloseTimer, []);

  const handleSubMenuOpen = (
    event: React.MouseEvent<HTMLElement>,
    index: number
  ) => {
    setAnchorEl(event.currentTarget);
    setActiveSubMenu(index);
  };

  const handleSubMenuClose = () => {
    setAnchorEl(null);
    setActiveSubMenu(null);
  };

  const handleCloseDock = () => {
    setOpen(false);
    handleSubMenuClose();
  };

  return (
    <Box
      sx={{
        position: "fixed",
        bottom: 0,
        left: "50%",
        transform: "translateX(-50%)",
        zIndex: 9998,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",

        // Important: outer wrapper will not block other page elements
        pointerEvents: "none",
      }}
    >
      {/* Drawer Panel */}
      <Box
        onMouseEnter={clearCloseTimer}
        onMouseLeave={startCloseTimer}
        sx={{
          mb: 1,
          px: 3,
          py: 2,
          display: "flex",
          gap: 2,
          borderRadius: "24px",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          background:
            "linear-gradient(135deg, rgba(var(--theme-panel-rgb),1), rgba(var(--theme-panel-rgb),0.8))",
          border: "1px solid rgba(var(--theme-panel-rgb),0.18)",
          boxShadow:
            "0 8px 32px rgba(var(--theme-accent-soft-rgb),0.35), inset 0 1px 0 rgba(var(--theme-panel-rgb),0.25)",
          transform: open
            ? "translateY(0) scale(1)"
            : "translateY(120%) scale(0.9)",
          opacity: open ? 1 : 0,
          pointerEvents: open ? "auto" : "none",
          /*
            ระบุ property ให้ชัด แทน `all` — เดิมเบราว์เซอร์เฝ้าดูทุก property
            รวมถึงสีพื้นหลังที่มาจาก CSS variable ทำให้ตอนสลับธีมสีของ dock
            ค่อย ๆ ไล่ 0.35 วินาทีพร้อมเด้ง overshoot แทนที่จะเปลี่ยนทันที
          */
          transition: transitionOf(["transform", "opacity"], "slow", "emphasized"),
        }}
      >
        {dockItems.map((item, index) => (
          <Box
            key={index}
            onMouseEnter={(e) => {
              if (item.subMenu?.length) {
                handleSubMenuOpen(e, index);
              } else {
                handleSubMenuClose();
              }
            }}
            onClick={() => {
              if (item?.subMenu?.length) return;

              if (item?.path) navigate(item.path);
              handleCloseDock();
            }}
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              cursor: "pointer",
              transition: transitionOf(["transform"], "fast"),
              /*
                ครอบด้วย hover: hover เพราะบนจอสัมผัส การแตะจะยิง hover ปลอม
                แล้วค้างอยู่ — ไอคอนจะยกตัวค้างไว้ตลอดหลังแตะ
              */
              "@media (hover: hover) and (pointer: fine)": {
                "&:hover": {
                  transform: "translateY(-4px) scale(1.06)",
                },
              },
            }}
          >
            <IconButton
              sx={{
                width: 56,
                height: 56,
                color: "white",
                background:
                  "linear-gradient(135deg, rgba(var(--theme-panel-rgb),1), rgba(var(--theme-panel-rgb),0.8))",
                backdropFilter: "blur(10px)",
                border: "1px solid rgba(var(--theme-panel-rgb),0.15)",
                boxShadow: "0 2px 12px rgba(var(--theme-accent-soft-rgb),0.25)",
              }}
            >
              {item.icon}
            </IconButton>

            <Typography
              variant="caption"
              sx={{
                color: "var(--theme-accent)",
                mt: 0.8,
                fontSize: "0.8rem",
                textAlign: "center",
                maxWidth: 90,
              }}
            >
              {item.label}
            </Typography>
          </Box>
        ))}
      </Box>

      {/* Submenu Popper */}
      <Popper
        open={activeSubMenu !== null}
        anchorEl={anchorEl}
        placement="top"
        transition
        disablePortal={false}
        sx={{
          zIndex: 10000,
          pointerEvents: "auto",
        }}
      >
        {({ TransitionProps }) => (
          <Fade {...TransitionProps} timeout={250}>
            <Paper
              onMouseEnter={() => {
                clearCloseTimer();
                setOpen(true);
              }}
              onMouseLeave={startCloseTimer}
              sx={{
                mb: 2,
                borderRadius: "16px",
                backdropFilter: "blur(20px)",
                background:
                  "linear-gradient(135deg, rgba(var(--theme-panel-rgb),1), rgba(var(--theme-panel-rgb),0.8))",
                border: "1px solid rgba(var(--theme-panel-rgb),0.15)",
                minWidth: 180,
                overflow: "hidden",
                pointerEvents: "auto",
              }}
            >
              <MenuList>
                {activeSubMenu !== null &&
                  dockItems[activeSubMenu].subMenu?.map((subItem, subIndex) => (
                    <MenuItem
                      key={subIndex}
                      onClick={() => {
                        navigate(subItem.path);
                        handleCloseDock();
                      }}
                      sx={{
                        color: "var(--theme-accent)",
                        fontSize: "0.8rem",
                        py: 1.2,
                        px: 2,
                        "&:hover": {
                          backgroundColor:
                            "rgba(var(--theme-accent-rgb),0.15)",
                        },
                      }}
                    >
                      {subItem.label}
                    </MenuItem>
                  ))}
              </MenuList>
            </Paper>
          </Fade>
        )}
      </Popper>

      {/* Trigger Button */}
      <IconButton
        onMouseEnter={() => setOpen(true)}
        sx={{
          pointerEvents: "auto",

          background:
            "linear-gradient(135deg, rgba(var(--theme-panel-rgb),1), rgba(var(--theme-panel-rgb),0.8))",
          backdropFilter: "blur(20px)",
          borderRadius: "14px 14px 0 0",
          width: "160px",
          height: "15px",
          border: "1px solid rgba(var(--theme-accent-rgb),0.3)",
        }}
      >
        <KeyboardArrowUpIcon sx={{ color: "var(--theme-accent)" }} />
      </IconButton>
    </Box>
  );
};

export default DockDrawer;