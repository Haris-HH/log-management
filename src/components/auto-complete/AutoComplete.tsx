import React from "react"

// Material UI
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import Autocomplete from "@mui/material/Autocomplete";

// i18n
import { useTranslation } from 'react-i18next';

export type OptionType = {
  value: any
  label: string
  [key: string]: any
}

type AutoCompleteProps = {
  id?: string
  value: any
  onChange: (event: React.SyntheticEvent<Element, Event>, value: OptionType | null) => void
  onInputChange?: (
    event: React.SyntheticEvent<Element, Event> | React.ChangeEvent<{}>,
    value: string
  ) => void
  options: OptionType[]
  label: string
  placeholder?: string
  labelFontSize?: string
  sx?: object
  disabled?: boolean
  required?: boolean
  title?: string
  error?: boolean;
  register?: any;
  freeSolo?: boolean;
}

const AutoComplete: React.FC<AutoCompleteProps> = ({
  id,
  value,
  onChange,
  onInputChange,
  options,
  label,
  placeholder,
  labelFontSize = "14px",
  sx,
  disabled,
  title,
  error = false,
  required = false,
  register, 
  freeSolo = false,
  ...props
}) => {
  // i18n
  const { t } = useTranslation();

  const handleSelectionChange = (event: React.SyntheticEvent, newValue: OptionType | null) => {
    onChange(event, newValue);

    if (register) {
      register.onChange({
        target: { name: register.name, value: newValue || "" },
      });
    }
  };

  const handleInputChange = (
    event: React.SyntheticEvent<Element, Event> | React.ChangeEvent<{}>,
    newValue: string
  ) => {
    if (onInputChange) {
      onInputChange(event, newValue)
    }
    if (register && freeSolo) {
      register.onChange({
        target: { name: register.name, value: newValue },
      })
    }
  }

  const renderHighlightedText = (label: string, inputValue: string) => {
    if (!inputValue) return label;

    const index = label.toLowerCase().indexOf(inputValue.toLowerCase());
    if (index === -1) return label;

    const beforeMatch = label.slice(0, index);
    const match = label.slice(index, index + inputValue.length);
    const afterMatch = label.slice(index + inputValue.length);

    return (
      <>
        {beforeMatch}
        <b className="font-extrabold">{match}</b>
        <span className="font-light">{afterMatch}</span>
      </>
    );
  }

  return (
    <div className={`flex flex-col w-full`}>
      <Typography sx={{ fontSize: labelFontSize || undefined, color:'var(--primary-color)' }} variant='subtitle1'>
        {label}
        {
          required && <span className="text-red-500"> *</span>
        }
      </Typography>
      <Autocomplete
        disablePortal={false}
        freeSolo={freeSolo}
        value={
          freeSolo
            ? value || ""
            : options.find((option) => option.value === value) || null
        }
        onChange={handleSelectionChange}
        onInputChange={handleInputChange}
        options={options}
        getOptionLabel={(option) =>
          typeof option === "string" ? option : option.label || ""
        }
        noOptionsText={t("text.data-not-found")}
        filterOptions={(options, state) =>
          options.filter((option) =>
            option.label.toLowerCase().includes(state.inputValue.toLowerCase())
          )
        }
        sx={{
          borderRadius: "5px",
          backgroundColor: "var(--secondary-color)",
          border: "1px solid var(--primary-color)",
          "& .MuiInputBase-root": {
            minHeight: "30px",
            padding: "2px 8px",
            fontSize: labelFontSize,
            color: "var(--primary-color)",
            "& .MuiInputBase-input": {
              height: "25px",
              padding: "0 !important",
              backgroundColor: "var(--secondary-color) !important",
              "&.Mui-disabled": {
                color: "rgba(var(--primary-color-rgb), 0.5) !important",
                WebkitTextFillColor: "rgba(var(--primary-color-rgb), 0.4) !important",
              },
            },
            "&.Mui-error": {
              "& .MuiOutlinedInput-notchedOutline": {
                borderColor: "#d32f2f",
                borderWidth: "2px"
              }
            },
          },
          "& .MuiSvgIcon-root": {
            color: "var(--primary-color)",
          },
          "& .MuiOutlinedInput-root": {
            "& > div": {
              padding: "3px !important",
              gap: "4px",
              display: "flex",
            }
          },
          ...sx,
        }}
        renderInput={(params) => (
          <TextField
            {...params}
            error={error}
            placeholder={placeholder || ""}
          />
        )}
        disabled={disabled}
        title={title || ""}
        renderOption={(props, option, { inputValue }) => {
          const { key, ...otherProps } = props
          return (
            <li {...otherProps} key={key}>
              {renderHighlightedText(option.label, inputValue)}
            </li>
          )
        }}
        slotProps={{
          paper: {
            sx: {
              backgroundColor: "var(--secondary-color) !important",
              color: "var(--primary-color) !important",
              border: "1px solid var(--primary-color)",

              "& .MuiAutocomplete-listbox": {
                backgroundColor: "var(--secondary-color) !important",
                padding: 0,
              },

              "& .MuiAutocomplete-option": {
                color: "var(--primary-color) !important",
                backgroundColor: "var(--secondary-color) !important",
              },

              "& .MuiAutocomplete-option:hover": {
                backgroundColor: "rgba(var(--primary-color-rgb), 0.2) !important",
              },

              "& .Mui-focused": {
                backgroundColor: "rgba(var(--primary-color-rgb), 0.2) !important",
              },

              "& .MuiAutocomplete-option[aria-selected='true']": {
                backgroundColor: "var(--primary-color) !important",
                color: "var(--tertiary-color) !important",
              },
            },
          },
          popper: {
            sx: {
              "& .MuiPaper-root": {
                backgroundColor: "var(--secondary-color) !important",
              },
            },
          },
        }}
        {...props}
      />
    </div>
  )
}

export default AutoComplete