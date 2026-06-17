import React from "react";

// Material UI
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import Autocomplete from "@mui/material/Autocomplete";

// i18n
import { useTranslation } from "react-i18next";

export type OptionType = {
  value: any;
  label: string;
  [key: string]: any;
};

type AutoCompleteValue = OptionType | string | null;

type AutoCompleteProps = {
  id?: string;
  value: any;
  onChange: (
    event: React.SyntheticEvent<Element, Event>,
    value: OptionType | null
  ) => void;
  onInputChange?: (
    event: React.SyntheticEvent<Element, Event>,
    value: string
  ) => void;
  options: OptionType[];
  label: string;
  placeholder?: string;
  labelFontSize?: string;
  sx?: object;
  disabled?: boolean;
  required?: boolean;
  title?: string;
  error?: boolean;
  register?: any;
  freeSolo?: boolean;
};

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
  const { t } = useTranslation();

  const selectedValue: AutoCompleteValue = freeSolo
    ? options.find((option) => option.value === value) ?? value ?? ""
    : options.find((option) => option.value === value) ?? null;

  const handleSelectionChange = (
    event: React.SyntheticEvent<Element, Event>,
    newValue: AutoCompleteValue
  ) => {
    const formattedValue: OptionType | null =
      typeof newValue === "string"
        ? {
            value: newValue,
            label: newValue,
          }
        : newValue;

    onChange(event, formattedValue);

    if (register) {
      register.onChange({
        target: {
          name: register.name,
          value: formattedValue?.value ?? "",
        },
      });
    }
  };

  const handleInputChange = (
    event: React.SyntheticEvent<Element, Event>,
    newValue: string
  ) => {
    onInputChange?.(event, newValue);

    if (freeSolo && register) {
      register.onChange({
        target: {
          name: register.name,
          value: newValue,
        },
      });
    }
  };

  const renderHighlightedText = (label: string, inputValue: string) => {
    if (!inputValue) return label;

    const index = label.toLowerCase().indexOf(inputValue.toLowerCase());
    if (index === -1) return label;

    return (
      <>
        {label.slice(0, index)}
        <b className="font-extrabold">
          {label.slice(index, index + inputValue.length)}
        </b>
        <span className="font-light">
          {label.slice(index + inputValue.length)}
        </span>
      </>
    );
  };

  return (
    <div className="flex flex-col w-full">
      <Typography
        sx={{
          fontSize: labelFontSize,
          color: "var(--primary-color)",
        }}
        variant="subtitle1"
      >
        {label}
        {required && <span className="text-red-500"> *</span>}
      </Typography>

      <Autocomplete<OptionType, false, false, boolean>
        id={id}
        disablePortal={false}
        freeSolo={freeSolo}
        value={selectedValue}
        onChange={handleSelectionChange}
        onInputChange={handleInputChange}
        options={options}
        getOptionLabel={(option) =>
          typeof option === "string" ? option : option.label || ""
        }
        isOptionEqualToValue={(option, value) => {
          if (typeof value === "string") return option.label === value;

          return option.value === value.value;
        }}
        noOptionsText={t("text.data-not-found")}
        filterOptions={(options, state) =>
          options.filter((option) =>
            option.label
              .toLowerCase()
              .includes(state.inputValue.toLowerCase())
          )
        }
        disabled={disabled}
        title={title || ""}
        sx={{
          borderRadius: "5px",
          backgroundColor: "var(--tertiary-color)",
          border: "1px solid var(--primary-color)",

          "& .MuiInputBase-root": {
            minHeight: "30px",
            padding: "2px 8px",
            fontSize: labelFontSize,
            color: "var(--primary-color)",
          },

          "& .MuiInputBase-input": {
            height: "25px",
            padding: "0 !important",
            backgroundColor: "var(--tertiary-color) !important",
          },

          "& .MuiSvgIcon-root": {
            color: "var(--primary-color)",
          },

          "& .MuiInputBase-root.Mui-disabled": {
            color: "rgba(var(--primary-color-rgb), 0.5) !important",
            "-webkit-text-fill-color": "rgba(var(--primary-color-rgb), 0.5) !important",
          },

          "& .MuiInputBase-input.Mui-disabled": {
            color: "rgba(var(--primary-color-rgb), 0.5) !important",
            "-webkit-text-fill-color": "rgba(var(--primary-color-rgb), 0.5) !important",
          },

          "& .MuiSvgIcon-root.Mui-disabled": {
            color: "rgba(var(--primary-color-rgb), 0.5) !important",
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
        renderOption={(props, option, { inputValue }) => {
          const { key, ...otherProps } = props;

          return (
            <li {...otherProps} key={key}>
              {renderHighlightedText(option.label, inputValue)}
            </li>
          );
        }}
        slotProps={{
          paper: {
            sx: {
              backgroundColor: "var(--tertiary-color) !important",
              color: "var(--primary-color) !important",
              border: "1px solid var(--primary-color)",

              "& .MuiAutocomplete-listbox": {
                backgroundColor: "var(--tertiary-color) !important",
                padding: 0,
              },

              "& .MuiAutocomplete-option": {
                color: "var(--primary-color) !important",
                backgroundColor: "var(--tertiary-color) !important",
              },

              "& .MuiAutocomplete-option:hover, & .Mui-focused": {
                backgroundColor:
                  "rgba(var(--primary-color-rgb), 0.2) !important",
              },

              "& .MuiAutocomplete-option[aria-selected='true']": {
                backgroundColor: "var(--primary-color) !important",
                color: "var(--tertiary-color) !important",
              },

              "& .MuiAutocomplete-noOptions": {
                color: "var(--primary-color) !important",
                backgroundColor: "var(--tertiary-color) !important",
              },
            },
          },
        }}
        {...props}
      />
    </div>
  );
};

export default AutoComplete;