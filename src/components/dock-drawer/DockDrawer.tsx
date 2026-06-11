// components/layout/DockDrawer.tsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

// Material UI
import IconButton from "@mui/material/IconButton";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Popper from "@mui/material/Popper";
import Paper from "@mui/material/Paper";
import MenuList from "@mui/material/MenuList";
import MenuItem from "@mui/material/MenuItem";
import Fade from "@mui/material/Fade";

// Icons
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";

// Hooks
import { useDockItems } from "../../hooks/useDockItems";

type DockDrawerProps = {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
};

const DockDrawer = ({ open, setOpen }: DockDrawerProps) => {
  const dockItems = useDockItems();
  const navigate = useNavigate();

  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const [activeSubMenu, setActiveSubMenu] = useState<number | null>(null);

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

  return (
    <Box
      onMouseLeave={() => {
        setOpen(false);
        handleSubMenuClose();
      }}
      sx={{
        position: "fixed",
        bottom: 0,
        left: "50%",
        transform: "translateX(-50%)",
        zIndex: 9998,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      }}
    >
      {/* Drawer Panel */}
      <Box
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
            "linear-gradient(135deg, rgba(var(--tertiary-color-rgb),1), rgba(var(--tertiary-color-rgb),0.8))",
          border: "1px solid rgba(var(--tertiary-color-rgb),0.18)",
          boxShadow:
            "0 8px 32px rgba(var(--secondary-color-rgb),0.35), inset 0 1px 0 rgba(var(--tertiary-color-rgb),0.25)",
          transform: open
            ? "translateY(0) scale(1)"
            : "translateY(120%) scale(0.9)",
          opacity: open ? 1 : 0,
          pointerEvents: open ? "auto" : "none",
          transition: "all 0.35s cubic-bezier(0.34, 1.56, 0.64, 1)",
        }}
      >
        {dockItems.map((item, index) => (
          <Box
            key={index}
            onMouseEnter={(e) => {
              if (item.subMenu?.length) {
                handleSubMenuOpen(e, index);
              } 
              else {
                handleSubMenuClose();
              }
            }}
            onClick={() => {
              if (item.subMenu?.length) {
                handleSubMenuClose();
              } 
              else {
                navigate(item.path);
                setOpen(false);
              }
            }}
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              cursor: "pointer",
              transition: "transform 0.25s ease",
              "&:hover": {
                transform: "translateY(-10px) scale(1.15)",
              },
            }}
          >
            <IconButton
              sx={{
                width: 56,
                height: 56,
                color: "white",
                background:
                  "linear-gradient(135deg, rgba(var(--tertiary-color-rgb),1), rgba(var(--tertiary-color-rgb),0.8))",
                backdropFilter: "blur(10px)",
                border: "1px solid rgba(var(--tertiary-color-rgb),0.15)",
                boxShadow: "0 2px 12px rgba(var(--secondary-color-rgb),0.25)",
              }}
            >
              {item.icon}
            </IconButton>

            <Typography
              variant="caption"
              sx={{
                color: "var(--primary-color)",
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
        sx={{ zIndex: 10000 }}
      >
        {({ TransitionProps }) => (
          <Fade {...TransitionProps} timeout={250}>
            <Paper
              sx={{
                mb: 2,
                borderRadius: "16px",
                backdropFilter: "blur(20px)",
                background:
                  "linear-gradient(135deg, rgba(var(--tertiary-color-rgb),1), rgba(var(--tertiary-color-rgb),0.8))",
                border: "1px solid rgba(var(--tertiary-color-rgb),0.15)",
                minWidth: 180,
                overflow: "hidden",
              }}
            >
              <MenuList>
                {activeSubMenu !== null &&
                  dockItems[activeSubMenu].subMenu?.map((subItem, subIndex) => (
                    <MenuItem
                      key={subIndex}
                      onClick={() => {
                        navigate(subItem.path);
                        setOpen(false);
                        handleSubMenuClose();
                      }}
                      sx={{
                        color: "var(--primary-color)",
                        fontSize: "0.8rem",
                        py: 1.2,
                        px: 2,
                        display: "flex",
                        "&:hover": {
                          backgroundColor:
                            "rgba(var(--primary-color-rgb),0.15)",
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
          background:
            "linear-gradient(135deg, rgba(var(--tertiary-color-rgb),1), rgba(var(--tertiary-color-rgb),0.8))",
          backdropFilter: "blur(20px)",
          borderRadius: "14px 14px 0 0",
          width: "160px",
          height: "15px",
          border: "1px solid rgba(var(--tertiary-color-rgb),0.15)",
        }}
      >
        <KeyboardArrowUpIcon sx={{ color: "var(--primary-color)" }} />
      </IconButton>
    </Box>
  );
};

export default DockDrawer;