// Material UI
import Pagination from '@mui/material/Pagination';
import Stack from '@mui/material/Stack';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select'
import type { SelectChangeEvent } from '@mui/material/Select'

// Component
import TextBox from '../../components/text-box/TextBox'

// i18n
import { useTranslation } from 'react-i18next';

interface PaginationProps {
  page: number;
  onChange: (event: React.ChangeEvent<unknown>, value: number) => void;
  rowsPerPage: number;
  rowsPerPageOptions: number[];
  handleRowsPerPageChange: (event: SelectChangeEvent) => void;
  totalPages: number;
  pageInput: string;
  handlePageInputKeyDown: (event: React.KeyboardEvent<HTMLInputElement>) => void;
  handlePageInputChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

const PaginationBelowTableComponent: React.FC<PaginationProps> = ({
  page,
  onChange,
  rowsPerPage,
  rowsPerPageOptions,
  handleRowsPerPageChange,
  totalPages,
  pageInput,
  handlePageInputKeyDown,
  handlePageInputChange,
}) => {
  // i18n
  const { t } = useTranslation();

  return (
    <div className='flex [@media(max-width:1500px)]:flex-col items-center justify-between w-full'>
      <div className="flex items-center gap-4">
        <p className="text-(--primary-color) text-[16px]">{t("text.rows-per-page")}</p>
        <Select
          id="row-per-page-select"
          value={rowsPerPage.toString()}
          onChange={handleRowsPerPageChange}
          className="h-8 min-w-25 w-25"
          size="medium"
          sx={{
            backgroundColor: "var(--secondary-color)",
            color: "var(--primary-color)",
            border: "1px solid var(--primary-color)",
            "& .MuiSvgIcon-root": {
              color: "var(--primary-color)",
            },
          }}
          MenuProps={{
            slotProps: {
              paper: {
                sx: {
                  backgroundColor: "var(--tertiary-color)",
                  border: "1px solid var(--primary-color)",

                  "& .MuiMenuItem-root": {
                    color: "var(--primary-color)",
                    backgroundColor: "var(--tertiary-color)",

                    "&:hover": {
                      backgroundColor: "rgba(var(--primary-color-rgb), 0.15)",
                    },

                    "&.Mui-selected": {
                      color: "var(--tertiary-color)",
                      backgroundColor: "var(--primary-color) !important",
                    },

                    "&.Mui-selected:hover": {
                      backgroundColor:
                        "rgba(var(--primary-color-rgb), 0.8) !important",
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
      <div className='flex justify-center items-center'>
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
        <div className="flex items-center gap-x-2 ml-3">
          <p className="text-(--primary-color) text-[16px]">
            {t("text.page")}
          </p>
          <TextBox
            id="input-page"
            label=""
            sx={{
              display: 'flex',
              justifyContent: 'center',
              width: '100px',
            }}
            value={pageInput}
            onKeyDown={handlePageInputKeyDown}
            onChange={handlePageInputChange}
          />
        </div>
      </div>
    </div>
  );
};

export default PaginationBelowTableComponent;