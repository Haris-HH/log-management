import { useState, useCallback, useEffect } from 'react'
import { Map as LeafletMap } from 'leaflet';
import dayjs from "dayjs";

// Material UI
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';

// Components
import DatePickerBuddhist from "../../components/date-picker-buddhist/DatePickerBuddhist";
import BaseMap from '../base-map/BaseMap';

// Icons
import SearchIcon from "../../assets/svg/search.svg?react";
import ClearIcon from "../../assets/svg/clear.svg?react";

// Hooks
import { useMapSearch } from "../../hooks/useOpenStreetMapSearch";

// i18n
import { useTranslation } from 'react-i18next';

interface FormData {
  start_date_time: Date | null;
  end_date_time: Date | null;
}

type Props = {
  open: boolean;
  handleClose: () => void;
  dialogTitle: string;
  data: any[];
  start_date_time: Date | null;
  end_date_time: Date | null;
  onSearch: (start_date_time: Date | null, end_date_time: Date | null) => void;
}

const LocationUsage = ({ 
  open, 
  handleClose,
  dialogTitle, 
  data, 
  onSearch,
  start_date_time,
  end_date_time,
}: Props) => {

  // Data
  const [map, setMap] = useState<LeafletMap | null>(null);

  // Form Data
  const [formData, setFormData] = useState<FormData>({
    start_date_time: start_date_time,
    end_date_time: end_date_time,
  });

  // i18n
  const { t } = useTranslation();

  const { 
    searchPlaceWithList, 
    clearSearchPlaces,
  } = useMapSearch(map);

  useEffect(() => {
    if (map) {
      clearSearchPlaces();
      const updateData = data.map((item) => ({
        location: `${item.latitude}, ${item.longitude}`,
        name: `${item.latitude}, ${item.longitude}`,
      }));
      searchPlaceWithList(updateData, "#FDCC0A", true);
    }
  }, [data, map])

  const handleDateTimeChange = (
    key: "start_date_time" | "end_date_time",
    value: Date | null
  ) => {
    setFormData((prev) => {
      const newData = {
        ...prev,
        [key]: value,
      };

      if (!value) return newData;

      if (
        key === "start_date_time" &&
        newData.end_date_time &&
        dayjs(value).isAfter(dayjs(newData.end_date_time))
      ) {
        newData.end_date_time = value;
      }

      if (
        key === "end_date_time" &&
        newData.start_date_time &&
        dayjs(value).isBefore(dayjs(newData.start_date_time))
      ) {
        newData.start_date_time = value;
      }

      return newData;
    });
  };

  const handleMapLoad = useCallback((mapInstance: LeafletMap | null) => {
    setMap(mapInstance)
  }, []);

  const handleClear = () => {
    setFormData({
      start_date_time: dayjs().toDate(),
      end_date_time: dayjs().toDate(),
    });
  }

  const handleSearch = () => {
    if (onSearch) {
      onSearch(formData.start_date_time, formData.end_date_time);
    }
  }

  return (
    <Dialog 
      open={open} 
      fullWidth 
      maxWidth="lg"
      slotProps={{
        root: {
          sx: {
            zIndex: 99999,
          },
        },
        paper: {
          sx: {
            backgroundColor: "var(--tertiary-color)",
            border: "1px solid rgba(var(--primary-color-rgb), 0.35)",
            boxShadow: "2px 2px 2px rgba(0, 0, 0, 0.2)",
            borderRadius: "5px",
          },
        }
      }}
    >
      <DialogTitle
        sx={{
          color: "var(--primary-color)",
          fontWeight: "bold",
        }}
      >
        <div className='flex flex-col'>
          <span className='text-xl'>{dialogTitle}</span>
          <Divider orientation='horizontal' sx={{ width: "100%", borderColor: "rgba(var(--primary-color-rgb), 0.35)" }} />
        </div>
      </DialogTitle>
      <DialogContent>
        <Box className="flex flex-col gap-4">
          <Box 
            className="grid grid-cols-[repeat(2,1fr)_200px] border border-(--primary-color) rounded-[10px] p-4 gap-2"
            sx={{
              boxShadow: "0px 2px 8px rgba(var(--tertiary-color-rgb),0.1)"
            }}
          >
            <DatePickerBuddhist
              value={formData.start_date_time}
              sx={{
                marginTop: "5px",
                borderRadius: "5px",
                backgroundColor: "white",
                "& .MuiTextField-root": {
                  height: "fit-content",
                },
                "& .MuiOutlinedInput-input": {
                  fontSize: 14,
                },
              }}
              className="w-full"
              id="start-date-time"
              onChange={(value) =>
                handleDateTimeChange("start_date_time", value)
              }
              label={t('component.start-date')}
              labelFontSize="14px"
            />

            <DatePickerBuddhist
              value={formData.end_date_time}
              sx={{
                marginTop: "5px",
                borderRadius: "5px",
                backgroundColor: "white",
                "& .MuiTextField-root": {
                  height: "fit-content",
                },
                "& .MuiOutlinedInput-input": {
                  fontSize: 14,
                },
              }}
              className="w-full"
              id="end-date-time"
              onChange={(value) =>
                handleDateTimeChange("end_date_time", value)
              }
              label={t('component.end-date')}
              labelFontSize="14px"
            />

            <Box className="flex gap-2 items-end">
              <Button 
                variant="contained" 
                startIcon={<SearchIcon fill='var(--tertiary-color)' className="h-4 w-4" />} 
                sx={{ 
                  color: "var(--tertiary-color)",
                  backgroundColor: "var(--primary-color)", 
                  fontSize: "14px", 
                  width: "120px",
                  height: "40px",
                  textTransform: "capitalize",
                  "&:hover": {
                    backgroundColor: "rgba(var(--primary-color-rgb), 0.5)",
                  },
                }}
                onClick={handleSearch}
              >
                {t('button.search')}
              </Button>
              <Button 
                variant="outlined" 
                startIcon={<ClearIcon className="flex h-5 w-5" style={{ color: "var(--primary-color)" }} />} 
                sx={{
                  color: "var(--primary-color)",
                  border: "1px solid var(--primary-color)",
                  backgroundColor: "var(--tertiary-color)",
                  fontSize: "14px",
                  width: "120px",
                  height: "40px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  textTransform: "capitalize",

                  "& .MuiButton-startIcon": {
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    marginRight: "6px",
                    marginLeft: "0",
                    marginTop: "-3px"
                  },

                  "& svg": {
                    display: "block",
                  },

                  "&:hover": {
                    backgroundColor: "rgba(var(--primary-color-rgb), 0.5)",
                  },
                }}
                onClick={handleClear}
              >
                {t('button.clear')}
              </Button>
            </Box>
          </Box>
          <Box className="relative h-[60vh] w-full border border-(--primary-color)">
            <BaseMap 
              onMapLoad={handleMapLoad}
            />
          </Box>
          <Box className="flex justify-end">
            <Button
              variant="contained"
              sx={{
                backgroundColor: "var(--primary-color)",
                color: "var(--tertiary-color)",
              }}
              onClick={handleClose}
            >
              {t('button.cancel')}
            </Button>
          </Box>
        </Box>
      </DialogContent>
    </Dialog>
  )
}

export default LocationUsage;