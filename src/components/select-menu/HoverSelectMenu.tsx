import { useRef, useState } from "react";

// Material UI
import Typography from "@mui/material/Typography";
import Popper from "@mui/material/Popper";
import Grow from "@mui/material/Grow";
import Paper from "@mui/material/Paper";
import MenuList from "@mui/material/MenuList";
import MenuItem from "@mui/material/MenuItem";

type HoverSelectMenuProps<T> = {
  icon: React.ReactNode;
  selectedItem: T;
  items: T[];
  getLabel: (item: T) => string;
  getKey: (item: T) => string;
  onSelect: (item: T) => void;
  renderItemPrefix?: (item: T, selected: boolean) => React.ReactNode;
  selectedColor?: string;
  className?: string;
};

function HoverSelectMenu<T>({
  icon,
  selectedItem,
  items,
  getLabel,
  getKey,
  onSelect,
  renderItemPrefix,
  selectedColor = "var(--primary-color)",
  className = "",
}: HoverSelectMenuProps<T>) {
  const [openMenu, setOpenMenu] = useState(false);
  const anchorRef = useRef<HTMLDivElement>(null);

  return (
    <div
      className={`relative ${className}`}
      onMouseEnter={() => setOpenMenu(true)}
      onMouseLeave={() => setOpenMenu(false)}
    >
      <div
        ref={anchorRef}
        className="flex gap-1 items-center opacity-80 hover:opacity-100 cursor-pointer transition-all duration-200"
      >
        {icon}

        <Typography
          variant="body1"
          sx={{
            fontSize: "0.8rem",
            color: selectedColor,
            fontWeight: 700,
          }}
        >
          {getLabel(selectedItem)}
        </Typography>
      </div>

      <Popper
        open={openMenu}
        anchorEl={anchorRef.current}
        placement="bottom-start"
        transition
        sx={{ zIndex: 9999 }}
      >
        {({ TransitionProps }) => (
          <Grow {...TransitionProps}>
            <Paper
              elevation={0}
              sx={{
                mt: 1,
                minWidth: 150,
                borderRadius: "16px",
                overflow: "hidden",
                backgroundColor: "rgba(var(--tertiary-color-rgb),0.95)",
                boxShadow: "0px 10px 30px rgba(var(--secondary-color-rgb),0.18)",
                p: 1,
              }}
            >
              <MenuList dense sx={{ p: 0 }}>
                {items.map((item) => {
                  const isSelected =
                    getKey(selectedItem) === getKey(item);

                  return (
                    <MenuItem
                      key={getKey(item)}
                      onClick={() => onSelect(item)}
                      sx={{
                        borderRadius: "12px",
                        mb: 0.5,
                        px: 1,
                        py: 0.8,
                        transition: "all 0.2s ease",
                        border: isSelected
                          ? `1px solid ${selectedColor}`
                          : "1px solid transparent",
                        backgroundColor: isSelected
                          ? `${selectedColor}22`
                          : "transparent",
                      }}
                    >
                      <div className="flex items-center gap-2 w-full">
                        {renderItemPrefix?.(item, isSelected)}

                        <Typography
                          variant="body2"
                          sx={{
                            color: isSelected
                              ? selectedColor
                              : "var(--text-color)",
                            fontSize: "0.82rem",
                            fontWeight: isSelected ? 700 : 400,
                          }}
                        >
                          {getLabel(item)}
                        </Typography>
                      </div>
                    </MenuItem>
                  );
                })}
              </MenuList>
            </Paper>
          </Grow>
        )}
      </Popper>
    </div>
  );
}

export default HoverSelectMenu;