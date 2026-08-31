import { useState, useMemo } from "react";

// Material UI
import Pagination from '@mui/material/Pagination';
import Stack from '@mui/material/Stack';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import Button from '@mui/material/Button';
import Menu from "@mui/material/Menu";
import Checkbox from "@mui/material/Checkbox";
import ListItemText from "@mui/material/ListItemText";
import type { SelectChangeEvent } from '@mui/material/Select';

// Icons
import ColumnIcon from "../../assets/svg/column.svg?react";

// i18n
import { useTranslation } from 'react-i18next';

interface PaginationProps {
  page: number;
  onChange: (event: React.ChangeEvent<unknown>, value: number) => void;
  rowsPerPage: number;
  rowsPerPageOptions: number[];
  handleRowsPerPageChange: (event: SelectChangeEvent) => void;
  totalPages: number;
  totalItems: number;
  totalUsage: number;
  isShowColumn?: boolean;
  columnOptions?: { key: string; label: string; checked: boolean }[];
  onToggleColumn?: (key: string) => void;
}

const PaginationComponent: React.FC<PaginationProps> = ({
  page,
  onChange,
  rowsPerPage,
  rowsPerPageOptions,
  handleRowsPerPageChange,
  totalPages,
  totalItems,
  totalUsage,
  isShowColumn = false,
  columnOptions = [],
  onToggleColumn,
}) => {
  // i18n
  const { t } = useTranslation();

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const openMenu = Boolean(anchorEl);

  const handleOpenMenu = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleCloseMenu = () => {
    setAnchorEl(null);
  };

  const handleToggleColumn = (key: string) => {
    if (onToggleColumn) {
      onToggleColumn(key);
    }
  };

  const hasUnchecked = useMemo(
    () => columnOptions.some((col) => !col.checked),
    [columnOptions]
  );

  return (
    <div className='flex [@media(max-width:1500px)]:flex-col items-center justify-between w-full'>
      {
        !isShowColumn && (
          <p className="text-(--theme-accent) text-[16px] font-semibold">{`${t('text.all')} ${totalItems?.toLocaleString()} ${t('text.list')} : ${t('text.total')} ${totalUsage?.toLocaleString()} ${t('text.time')}`}</p>
        )
      }
      {
        isShowColumn && (
          <div className='flex [@media(max-width:1500px)]:flex-col gap-2 items-center justify-center'>
            <Button
              variant="contained"
              startIcon={
                <ColumnIcon
                  className="h-4.25 w-4.25 mr-1.2"
                  stroke={
                    openMenu
                      ? "var(--theme-accent)"
                      : hasUnchecked
                      ? "var(--has-filter-color)"
                      : "var(--theme-accent)"
                  }
                />
              }
              onClick={handleOpenMenu}
              sx={{
                backgroundColor: openMenu
                  ? "rgba(var(--theme-accent-rgb),0.2)"
                  : hasUnchecked
                  ? "var(--has-filter-bg-color)"
                  : "var(--theme-border-input)",

                color: openMenu
                  ? "var(--theme-accent)"
                  : hasUnchecked
                  ? "var(--has-filter-color)"
                  : "var(--theme-accent)",

                border: openMenu
                  ? "1px solid var(--theme-accent)"
                  : hasUnchecked
                  ? "1px solid var(--has-filter-bg-color)"
                  : "1px solid var(--theme-accent)",

                fontSize: "14px",
                width: "120px",
                height: "35px",
                boxShadow: "none",
              }}
            >
              {t('text.column')}
            </Button>
            <Menu
              anchorEl={anchorEl}
              open={openMenu}
              onClose={handleCloseMenu}
              anchorOrigin={{
                vertical: "bottom",
                horizontal: "left",
              }}
              transformOrigin={{
                vertical: "top",
                horizontal: "left",
              }}
              sx={{
                "& .MuiList-root": {
                  backgroundColor: "var(--theme-border-input)",
                  border: "1px solid var(--theme-accent)",
                },
                "& .MuiMenuItem-root": {
                  p: "1px 8px",
                  backgroundColor: "var(--theme-border-input)",
                  color: "var(--theme-accent)",
                },
                "& .MuiTypography-root": {
                  fontSize: "14px"
                },
                "& .MuiSvgIcon-root": {
                  fontSize: 20,
                  backgroundColor: "var(--theme-border-input)",
                  color: "var(--theme-accent)",
                },
              }}
            >
              {columnOptions.map((col) => (
                <MenuItem
                  key={col.key}
                  onClick={() => handleToggleColumn(col.key)}
                >
                  <Checkbox checked={col.checked} />
                  <ListItemText primary={col.label} />
                </MenuItem>
              ))}
            </Menu>
            <Select
              id="row-per-page-select"
              value={rowsPerPage.toString()}
              onChange={handleRowsPerPageChange}
              className="h-8.75 min-w-25 w-25"
              sx={{
                backgroundColor: "var(--theme-border-input)",
                color: "var(--theme-accent)",
                border: "1px solid var(--theme-accent)",
                "& .MuiSvgIcon-root": {
                  color: "var(--theme-accent)",
                },
                width: "120px",
                height: "35px",
              }}
              MenuProps={{
                slotProps: {
                  paper: {
                    sx: {
                      backgroundColor: "var(--theme-border-input)",
                      border: "1px solid var(--theme-accent)",

                      "& .MuiMenuItem-root": {
                        color: "var(--theme-accent)",
                        backgroundColor: "var(--theme-border-input)",

                        "&:hover": {
                          backgroundColor: "rgba(var(--theme-accent-rgb),0.15)",
                        },

                        "&.Mui-selected": {
                          color: "var(--theme-border-input)",
                          backgroundColor: "var(--theme-accent) !important",
                        },

                        "&.Mui-selected:hover": {
                          backgroundColor:
                            "rgba(var(--theme-accent-rgb),0.8) !important",
                        },
                      },
                    },
                  },
                },
              }}
                size="medium"
              >
                {rowsPerPageOptions.map((option) => (
                  <MenuItem key={option} value={option}>
                    {option}
                  </MenuItem>
                ))}
            </Select>
          </div>
        )
      }
      <div className='flex [@media(max-width:1500px)]:flex-col justify-center items-center gap-4'>
        {
          !isShowColumn && (
            <div className="flex items-center gap-4">
              <p className="text-(--theme-accent) text-[16px] font-medium">{t("text.number-of-item")}</p>
              <Select
                id="row-per-page-select"
                value={rowsPerPage.toString()}
                onChange={handleRowsPerPageChange}
                className="h-8.75 min-w-25 w-25"
                size="medium"
                sx={{
                  backgroundColor: "var(--theme-border-input)",
                  color: "var(--theme-accent)",
                  border: "1px solid var(--theme-accent)",
                  "& .MuiSvgIcon-root": {
                    color: "var(--theme-accent)",
                  },
                }}
                MenuProps={{
                  slotProps: {
                    paper: {
                      sx: {
                        backgroundColor: "var(--theme-border-input)",
                        border: "1px solid var(--theme-accent)",

                        "& .MuiMenuItem-root": {
                          color: "var(--theme-accent)",
                          backgroundColor: "var(--theme-border-input)",

                          "&:hover": {
                            backgroundColor: "rgba(var(--theme-accent-rgb),0.15)",
                          },

                          "&.Mui-selected": {
                            color: "var(--theme-border-input)",
                            backgroundColor: "var(--theme-accent) !important",
                          },

                          "&.Mui-selected:hover": {
                            backgroundColor:
                              "rgba(var(--theme-accent-rgb),0.8) !important",
                          },
                        },
                      },
                    },
                  },
                }}
              >
                {rowsPerPageOptions.map((option) => (
                  <MenuItem key={option} value={option}>
                    {option}
                  </MenuItem>
                ))}
              </Select>
            </div>
          )
        }
        <p className="text-(--theme-accent) text-[16px] font-medium">{`${(page - 1) * rowsPerPage + 1}-${Math.min(page * rowsPerPage, totalPages * rowsPerPage)} จาก ${totalItems} รายการ`}</p>
        <Stack spacing={2}>
          <Pagination
            sx={{
              display: 'flex',
              justifyContent: 'end',
              "& .MuiPaginationItem-page": {
                color: "var(--theme-border-input)",
                backgroundColor: "rgba(var(--theme-accent-rgb),0.4)",
              },
              "& .MuiPaginationItem-page:hover": {
                backgroundColor: "rgba(var(--theme-accent-rgb),0.7)",
                color: "var(--theme-border-input)",
              },
              "& .MuiPaginationItem-previousNext": {
                color: "var(--theme-border-input)",
                backgroundColor: "rgba(var(--theme-accent-rgb),0.7)",
                border: "1px solid var(--theme-accent)",
              },
              "& .MuiPaginationItem-ellipsis": {
                color: "var(--theme-accent)",
              },
              "& .MuiPaginationItem-page.Mui-selected": {
                backgroundColor: "var(--theme-accent)",
                color: "var(--theme-border-input)",
              },
            }}
            count={totalPages}
            variant="outlined"
            shape="rounded"
            page={page}
            onChange={onChange}
          />
        </Stack>
      </div>
    </div>
  );
};

export default PaginationComponent;