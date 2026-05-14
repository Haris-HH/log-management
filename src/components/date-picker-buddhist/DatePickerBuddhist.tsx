import dayjs, { Dayjs } from 'dayjs';
import "dayjs/locale/th";

// Material UI
import Typography from "@mui/material/Typography";
import type { DatePickerProps } from '@mui/x-date-pickers/DatePicker'
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import type { DateTimePickerProps } from '@mui/x-date-pickers/DateTimePicker';
import { LocalizationProvider, DatePicker } from "@mui/x-date-pickers"
import type { DateView, DateOrTimeView } from '@mui/x-date-pickers/models';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';

// Utils
import buddhistEraAdapter from "../../utils/buddhistEraAdapter"

// i18n
import { useTranslation } from 'react-i18next';

type CustomDatePickerProps = Omit<
  DatePickerProps,
  'value' | 'onChange'
> & {
  id?: string
  label?: string
  labelFontSize?: string
  className?: string
  value: Date | null
  onChange: (date: Date | null, context: any) => void
  isWithTime?: boolean
  error?: boolean
  register?: any
  sx?: object
  maxDate?: Dayjs
  slotProps?: any
}

const DatePickerBuddhist: React.FC<CustomDatePickerProps> = ({
  id,
  label,
  labelFontSize = "14px",
  onChange,
  value,
  isWithTime,
  error = false, 
  register,
  sx = {},
  maxDate,
  className,
  ...props
}) => {
  // i18n
  const { t, i18n } = useTranslation();

  const dayjsValue = value ? dayjs(value) : null;

  const dateViews: readonly DateView[] = ["year", "month", "day"];
  const dateTimeViews: readonly DateOrTimeView[] = [
    "year",
    "month",
    "day",
    "hours",
    "minutes",
  ];
  
  const handleDateChange = (date: Dayjs | null, context: any) => {
    if (onChange) {
      onChange(date?.toDate() || null, context);
      if (register) {
        register.onChange({
          target: { name: register.name, value: date?.toDate() || null },
        });
      }
    }
  }

  const textFieldProps = {
    size: 'medium' as 'medium',
    style: { height: '30px', justifyContent: 'center' },
    fullWidth: true,
    inputProps: {
      placeholder: isWithTime ? "DD/MM/YYYY hh:mm" : "DD/MM/YYYY",
    },
    error: error,
    sx: {
      '& .MuiPickersInputBase-root': {
        height: '30px',
        fontSize: labelFontSize,
        backgroundColor: 'var(--secondary-color)',
        color: 'var(--primary-color)',
        border: "1px solid var(--primary-color)",
      },
      '& .MuiOutlinedInput-root': {
        height: '30px',
        borderRadius: '5px',
        backgroundColor: 'var(--secondary-color)',
        '& input': {
          padding: '0 14px',
          height: '30px',
          boxSizing: 'border-box',
        },

        '& fieldset': {
          borderColor: error ? 'red' : 'default',
          borderWidth: '2px',
        },
        '&:hover fieldset': {
          borderColor: error ? 'red' : 'default',
        },
        '&.Mui-focused fieldset': {
          borderColor: error ? 'red' : 'default',
        },
      },
      '& .MuiSvgIcon-root': {
        color: 'var(--primary-color)',
      },
      ...sx,
    }
  }

  const commonProps = {
    value: dayjsValue,
    onChange: handleDateChange,
    slotProps: { 
      ...props.slotProps,
      textField: textFieldProps,
      toolbar: {
        toolbarFormat:
          isWithTime ? "D MMMM HH:mm" : "D MMMM",
      },
      desktopPaper: {
        sx: {
          border: "1px solid var(--primary-color)",
          borderRadius: "2px",

          "& .MuiPickersLayout-root": {
            backgroundColor: "var(--secondary-color)",
            "& .Mui-disabled": {
              color: "rgba(var(--primary-color-rgb), 0.5)",
            },
            "& .Mui-selected": {
              color: "var(--tertiary-color) !important",
              backgroundColor: "var(--primary-color) !important",

              "&:hover": {
                backgroundColor: "rgba(var(--primary-color-rgb), 0.4) !important",
              },
            },
          },

          "& .MuiMonthCalendar-button": {
            color: "var(--primary-color)",
            "&:hover": {
              backgroundColor: "rgba(var(--primary-color-rgb), 0.2)",
              color: "var(--tertiary-color)",
            },
          },

          "& .MuiPickersCalendarHeader-root": {
            color: "var(--primary-color)",
          },

          "& .MuiPickersCalendarHeader-label": {
            color: "var(--primary-color)",
          },

          "& .MuiPickersArrowSwitcher-button": {
            color: "var(--primary-color)",
          },

          "& .MuiDayCalendar-weekDayLabel": {
            color: "var(--primary-color)",
          },

          "& .MuiPickersDay-root": {
            borderRadius: "8px",

            "& .Mui-selected": {
              color: "var(--tertiary-color)",
              backgroundColor: "var(--primary-color)",
              "&:hover": {
                backgroundColor: "rgba(var(--primary-color-rgb), 0.4)",
              },
            },
            
            "&.Mui-disabled": {
              color: "rgba(var(--primary-color-rgb), 0.35) !important",
            },

            "&:hover": {
              backgroundColor: "rgba(var(--primary-color-rgb), 0.2)",
            },
          },

          "& .MuiPickersDay-dayOutsideMonth": {
            color: "rgba(var(--primary-color-rgb), 0.35) !important",
          },

          "& .MuiDayCalendar-weekContainer .MuiButtonBase-root": {
            color: "var(--primary-color)",
          },

          "& .MuiPickerDay-today": {
            border: "1px solid var(--primary-color)",
          },

          "& .MuiButton-root": {
            color: "var(--primary-color)",
          },
          "& .MuiClock-root, & .MuiClockNumber-root": {
            color: "var(--primary-color)",
          },

          "& .MuiClock-pin, & .MuiClockPointer-root": {
            backgroundColor: "var(--primary-color)",
          },
        },
      },
    },
    ...(maxDate && { maxDate }),
    desktopModeMediaQuery: "@media (min-width: 0px)",
  };

  return (
    <div id={id} className={`flex flex-col w-full ${className || ''}`}>
      {label && (
        <Typography
          variant="subtitle1"
          sx={{ fontSize: labelFontSize, color: "var(--primary-color)" }}
        >
          {label}
        </Typography>
      )}
      <LocalizationProvider 
        dateAdapter={i18n.language === "th" ? buddhistEraAdapter : AdapterDayjs} 
        adapterLocale={i18n.language === "th" ? "th" : "en"}
      >
        {!isWithTime ? (
          <DatePicker
            {...props}
            {...commonProps}
            views={props.views ?? dateViews}
            openTo={props.openTo || "day"}
          />
        ) : (
          <DateTimePicker
            {...props as DateTimePickerProps}
            {...commonProps}
            views={dateTimeViews}
            openTo="day"
          />
        )}
      </LocalizationProvider>
    </div>
  )
}

export default DatePickerBuddhist