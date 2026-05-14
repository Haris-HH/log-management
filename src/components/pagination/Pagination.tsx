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
    <div className='flex items-center justify-between w-full'>
      {
        !isShowColumn && (
          <p className="text-(--primary-color) text-[16px] font-semibold">{`${t('text.all')} ${totalItems?.toLocaleString()} ${t('text.list')} : ${t('text.total')} ${totalUsage?.toLocaleString()} ${t('text.time')}`}</p>
        )
      }
      {
        isShowColumn && (
          <div className='flex gap-2 items-center justify-center'>
            <Button
              variant="contained"
              startIcon={
                <ColumnIcon
                  className="h-4.25 w-4.25 mr-1.2"
                  stroke={
                    openMenu
                      ? "var(--primary-color)"
                      : hasUnchecked
                      ? "var(--has-filter-color)"
                      : "var(--primary-color)"
                  }
                />
              }
              onClick={handleOpenMenu}
              sx={{
                backgroundColor: openMenu
                  ? "rgba(var(--primary-color-rgb), 0.2)"
                  : hasUnchecked
                  ? "var(--has-filter-bg-color)"
                  : "var(--secondary-color)",

                color: openMenu
                  ? "var(--primary-color)"
                  : hasUnchecked
                  ? "var(--has-filter-color)"
                  : "var(--primary-color)",

                border: openMenu
                  ? "1px solid var(--primary-color)"
                  : hasUnchecked
                  ? "1px solid var(--has-filter-bg-color)"
                  : "1px solid var(--primary-color)",

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
                  backgroundColor: "var(--secondary-color)",
                  border: "1px solid var(--primary-color)",
                },
                "& .MuiMenuItem-root": {
                  p: "1px 8px",
                  backgroundColor: "var(--secondary-color)",
                  color: "var(--primary-color)",
                },
                "& .MuiTypography-root": {
                  fontSize: "14px"
                },
                "& .MuiSvgIcon-root": {
                  fontSize: 20,
                  backgroundColor: "var(--secondary-color)",
                  color: "var(--primary-color)",
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
                backgroundColor: "var(--secondary-color)",
                color: "var(--primary-color)",
                border: "1px solid var(--primary-color)",
                "& .MuiSvgIcon-root": {
                  color: "var(--primary-color)",
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
      <div className='flex justify-center items-center gap-4'>
        {
          !isShowColumn && (
            <div className="flex items-center gap-4">
              <p className="text-(--primary-color) text-[16px] font-medium">{"จำนวนรายการ"}</p>
              <Select
                id="row-per-page-select"
                value={rowsPerPage.toString()}
                onChange={handleRowsPerPageChange}
                className="h-8.75 min-w-25 w-25"
                size="medium"
                sx={{
                  backgroundColor: "var(--secondary-color)",
                  color: "var(--primary-color)",
                  border: "1px solid var(--primary-color)",
                  "& .MuiSvgIcon-root": {
                    color: "var(--primary-color)",
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
        <p className="text-(--primary-color) text-[16px] font-medium">{`${(page - 1) * rowsPerPage + 1}-${Math.min(page * rowsPerPage, totalPages * rowsPerPage)} จาก ${totalItems} รายการ`}</p>
        <Stack spacing={2}>
          <Pagination
            sx={{
              display: 'flex',
              justifyContent: 'end',
              "& .MuiPaginationItem-page": {
                color: "var(--secondary-color)",
                backgroundColor: "rgba(var(--primary-color-rgb), 0.4)",
              },
              "& .MuiPaginationItem-page:hover": {
                backgroundColor: "rgba(var(--primary-color-rgb), 0.7)",
                color: "var(--tertiary-color)",
              },
              "& .MuiPaginationItem-previousNext": {
                color: "var(--tertiary-color)",
                backgroundColor: "rgba(var(--primary-color-rgb), 0.7)",
                border: "1px solid var(--primary-color)",
              },
              "& .MuiPaginationItem-ellipsis": {
                color: "var(--tertiary-color)",
              },
              "& .MuiPaginationItem-page.Mui-selected": {
                backgroundColor: "var(--primary-color)",
                color: "var(--tertiary-color)",
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