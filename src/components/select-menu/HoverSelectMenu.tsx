import { useRef, useState } from "react";

import Typography from "@mui/material/Typography";
import Popper from "@mui/material/Popper";
import Grow from "@mui/material/Grow";
import Paper from "@mui/material/Paper";
import MenuList from "@mui/material/MenuList";
import MenuItem from "@mui/material/MenuItem";

type HoverSelectMenuGroup<T> = {
  label: string;
  items: T[];
};

type HoverSelectMenuProps<T> = {
  icon: React.ReactNode;
  selectedItem: T;
  items?: T[];
  groups?: HoverSelectMenuGroup<T>[];
  getLabel: (item: T) => string;
  getKey: (item: T) => string;
  onSelect: (item: T) => void;
  renderItemPrefix?: (item: T, selected: boolean) => React.ReactNode;
  selectedColor?: string;
  className?: string;
  /* Drop the trigger's label and leave just the icon, for when the navbar has
     to give its width to something else. The dropdown is unchanged, so the
     current value is still visible the moment the menu opens. */
  iconOnly?: boolean;
};

function HoverSelectMenu<T>({
  icon,
  selectedItem,
  items = [],
  groups,
  getLabel,
  getKey,
  onSelect,
  renderItemPrefix,
  selectedColor = "var(--primary-color)",
  className = "",
  iconOnly = false,
}: HoverSelectMenuProps<T>) {
  const [openMenu, setOpenMenu] = useState(false);
  const [openGroup, setOpenGroup] = useState<string | null>(null);

  const anchorRef = useRef<HTMLDivElement>(null);

  const hasGroups = !!groups?.length;

  const isGroupSelected = (group: HoverSelectMenuGroup<T>) => {
    return group.items.some((item) => getKey(item) === getKey(selectedItem));
  };

  return (
    <div
      className={`relative ${className}`}
      onMouseEnter={() => setOpenMenu(true)}
      onMouseLeave={() => {
        setOpenMenu(false);
        setOpenGroup(null);
      }}
    >
      <div
        ref={anchorRef}
        aria-label={iconOnly ? getLabel(selectedItem) : undefined}
        className="flex gap-1 items-center opacity-80 hover:opacity-100 cursor-pointer transition-opacity duration-150"
      >
        {icon}

        {!iconOnly && (
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
        )}
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
                minWidth: 170,
                borderRadius: "16px",
                overflow: "visible",
                backgroundColor: "var(--tertiary-color)",
                boxShadow: "0 8px 24px rgba(var(--secondary-color-rgb), 0.15)",
                border: "1px solid rgba(var(--secondary-color-rgb), 0.18)",
                p: 1,
              }}
            >
              <MenuList dense sx={{ p: 0 }}>
                {hasGroups
                  ? groups!.map((group) => {
                      const groupSelected = isGroupSelected(group);
                      const groupOpen = openGroup === group.label;

                      return (
                        <MenuItem
                          key={group.label}
                          onMouseEnter={() => setOpenGroup(group.label)}
                          sx={{
                            position: "relative",
                            borderRadius: "12px",
                            mb: 0.5,
                            px: 1,
                            py: 0.8,
                            border: groupSelected
                              ? `1px solid ${selectedColor}`
                              : "1px solid transparent",
                            backgroundColor: groupSelected
                              ? "rgba(var(--primary-color-rgb), 0.1)"
                              : groupOpen
                                ? "rgba(var(--primary-color-rgb), 0.06)"
                                : "transparent",
                          }}
                        >
                          <div className="flex items-center justify-between gap-2 w-full">
                            <Typography
                              variant="body2"
                              sx={{
                                color: groupSelected
                                  ? selectedColor
                                  : "var(--secondary-color)",
                                fontSize: "0.82rem",
                                fontWeight: groupSelected ? 700 : 400,
                              }}
                            >
                              {group.label}
                            </Typography>

                            <Typography
                              variant="body2"
                              sx={{
                                color: groupSelected
                                  ? selectedColor
                                  : "var(--text-color)",
                                fontSize: "0.82rem",
                                fontWeight: groupSelected ? 700 : 400,
                              }}
                            >
                              ›
                            </Typography>
                          </div>

                          {groupOpen && (
                            <Paper
                              elevation={0}
                              sx={{
                                position: "absolute",
                                top: 0,
                                left: "100%",
                                ml: 1,
                                minWidth: 170,
                                borderRadius: "16px",
                                backgroundColor: "var(--tertiary-color)",
                                boxShadow:
                                  "0 8px 24px rgba(var(--secondary-color-rgb), 0.15)",
                                border:
                                  "1px solid rgba(var(--secondary-color-rgb), 0.18)",
                                p: 1,
                              }}
                            >
                              <MenuList dense sx={{ p: 0 }}>
                                {group.items.map((item) => {
                                  const isSelected =
                                    getKey(selectedItem) === getKey(item);

                                  return (
                                    <MenuItem
                                      key={getKey(item)}
                                      onClick={() => {
                                        onSelect(item);
                                        setOpenMenu(false);
                                        setOpenGroup(null);
                                      }}
                                      sx={{
                                        borderRadius: "12px",
                                        mb: 0.5,
                                        px: 1,
                                        py: 0.8,
                                        border: isSelected
                                          ? `1px solid ${selectedColor}`
                                          : "1px solid transparent",
                                        backgroundColor: isSelected
                                          ? "rgba(var(--primary-color-rgb), 0.1)"
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
                                              : "var(--secondary-color)",
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
                          )}
                        </MenuItem>
                      );
                    })
                  : items.map((item) => {
                      const isSelected = getKey(selectedItem) === getKey(item);

                      return (
                        <MenuItem
                          key={getKey(item)}
                          onClick={() => {
                            onSelect(item);
                            setOpenMenu(false);
                          }}
                          sx={{
                            borderRadius: "12px",
                            mb: 0.5,
                            px: 1,
                            py: 0.8,
                            border: isSelected
                              ? `1px solid ${selectedColor}`
                              : "1px solid transparent",
                            backgroundColor: isSelected
                              ? "rgba(var(--primary-color-rgb), 0.1)"
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
                                  : "var(--secondary-color)",
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