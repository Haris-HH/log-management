import React, { useEffect, useMemo, useState } from "react";

// Material UI
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import Autocomplete, { createFilterOptions } from "@mui/material/Autocomplete";

// i18n
import { useTranslation } from "react-i18next";

export type OptionType = {
  value: string;
  label: string;
  inputValue?: string;
  [key: string]: any;
};

type AutoCompleteValue = OptionType | string | null;

type AutoCompleteProps = {
  id?: string;
  value: string | null;
  inputValue?: string;
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
  helperText?: string;
  register?: any;
  freeSolo?: boolean;
};

const filter = createFilterOptions<OptionType>();

const AutoComplete: React.FC<AutoCompleteProps> = ({
  id,
  value,
  inputValue: controlledInputValue,
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
  helperText,
  required = false,
  register,
  freeSolo = false,
  ...props
}) => {
  const { t } = useTranslation();

  const [innerInputValue, setInnerInputValue] = useState("");

  const inputValue = controlledInputValue ?? innerInputValue;

  const selectedValue = useMemo<AutoCompleteValue>(() => {
    if (!value) return null;

    const matched = options.find(
      (option) => String(option.value) === String(value)
    );

    return matched ?? (freeSolo ? String(value) : null);
  }, [options, value, freeSolo]);

  useEffect(() => {
    if (controlledInputValue !== undefined) return;

    if (!value) {
      setInnerInputValue("");
      return;
    }

    const matched = options.find(
      (option) => String(option.value) === String(value)
    );

    setInnerInputValue(matched?.label ?? String(value));
  }, [value, options, controlledInputValue]);

  const handleSelectionChange = (
    event: React.SyntheticEvent<Element, Event>,
    newValue: AutoCompleteValue
  ) => {
    let formattedValue: OptionType | null = null;

    if (typeof newValue === "string") {
      formattedValue = {
        value: newValue.trim(),
        label: newValue.trim(),
      };
    } else if (newValue?.inputValue) {
      formattedValue = {
        value: newValue.inputValue.trim(),
        label: newValue.inputValue.trim(),
      };
    } else {
      formattedValue = newValue;
    }

    onChange(event, formattedValue);

    register?.onChange({
      target: {
        name: register.name,
        value: formattedValue?.value ?? "",
      },
    });
  };

  const handleInputChange = (
    event: React.SyntheticEvent<Element, Event>,
    newInputValue: string,
    reason: string
  ) => {
    if (reason === "reset") return;

    if (controlledInputValue === undefined) {
      setInnerInputValue(newInputValue);
    }

    onInputChange?.(event, newInputValue);

    if (freeSolo) {
      register?.onChange({
        target: {
          name: register.name,
          value: newInputValue,
        },
      });
    }

    if (freeSolo && newInputValue === "") {
      onChange(event, null);
    }
  };

  const renderHighlightedText = (label: string, searchValue: string) => {
    if (!searchValue) return label;

    const index = label.toLowerCase().indexOf(searchValue.toLowerCase());
    if (index === -1) return label;

    return (
      <>
        {label.slice(0, index)}
        <b className="font-extrabold">
          {label.slice(index, index + searchValue.length)}
        </b>
        <span className="font-light">
          {label.slice(index + searchValue.length)}
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

      {
        freeSolo ? (
          <Autocomplete<OptionType, false, false, boolean>
            id={id}
            disablePortal={false}
            freeSolo={freeSolo}
            value={selectedValue}
            inputValue={inputValue}
            onChange={handleSelectionChange}
            onInputChange={handleInputChange}
            options={options}
            getOptionLabel={(option) => {
              if (typeof option === "string") return option;
              return option.inputValue ?? option.label ?? "";
            }}
            isOptionEqualToValue={(option, selected) => {
              if (typeof selected === "string") {
                return (
                  String(option.value) === selected ||
                  option.label === selected
                );
              }

              return String(option.value) === String(selected.value);
            }}
            noOptionsText={t("text.data-not-found")}
            filterOptions={(optionList, params) => {
              const searchValue = params.inputValue.trim().toLowerCase();

              const filtered = optionList.filter((option) =>
                option.label.toLowerCase().includes(searchValue)
              );

              const exists = optionList.some(
                (option) => option.label.toLowerCase() === searchValue
              );

              if (freeSolo && searchValue !== "" && !exists) {
                return [
                  {
                    value: params.inputValue.trim(),
                    label: `${t("button.add")} "${params.inputValue.trim()}"`,
                    inputValue: params.inputValue.trim(),
                  },
                ];
              }

              return filtered;
            }}
            disabled={disabled}
            title={title || ""}
            sx={{
              "& .MuiOutlinedInput-root": {
                borderRadius: "5px",

                "& fieldset": {
                  borderColor: "var(--primary-color)",
                },

                "&.Mui-error fieldset": {
                  borderColor: "#d32f2f",
                  borderWidth: "2px",
                },

                "&:hover fieldset": {
                  borderColor: "var(--primary-color)",
                },

                "&.Mui-focused fieldset": {
                  borderColor: "var(--primary-color)",
                },
              },

              backgroundColor: "var(--tertiary-color)",

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
                color: "var(--primary-color)",
              },

              "& .MuiSvgIcon-root": {
                color: "var(--primary-color)",
              },

              "& .MuiOutlinedInput-root.Mui-disabled": {
                backgroundColor: "rgba(var(--primary-color-rgb), 0.05) !important",
                cursor: "not-allowed",

                "& fieldset": {
                  borderColor: "rgba(var(--primary-color-rgb), 0.7) !important",
                },
              },

              "& .MuiInputBase-input.Mui-disabled": {
                color: "rgba(var(--primary-color-rgb), 0.7) !important",
                WebkitTextFillColor: "rgba(var(--primary-color-rgb), 0.7) !important",
                backgroundColor: "rgba(var(--primary-color-rgb), 0.05) !important",
                cursor: "not-allowed",
              },

              "& .MuiInputBase-root.Mui-disabled": {
                color: "var(--primary-color) !important",
              },

              ...sx,
            }}
            renderInput={(params) => (
              <TextField
                {...params}
                error={error}
                helperText={helperText}
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
                  
                  "& .MuiOutlinedInput-root": {
                    border: "1px solid var(--primary-color)",
                    borderRadius: "5px",
                  },

                  "& .MuiOutlinedInput-notchedOutline": {
                    border: "none !important",
                  },

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
        ) : (
          <Autocomplete<OptionType, false, false, false>
            id={id}
            disablePortal={false}
            value={selectedValue as OptionType | null}
            onChange={handleSelectionChange}
            onInputChange={handleInputChange}
            options={options}
            getOptionLabel={(option) => option.label ?? ""}
            isOptionEqualToValue={(option, selected) =>
              String(option.value) === String(selected.value)
            }
            noOptionsText={t("text.data-not-found")}
            filterOptions={(optionList, params) =>
              optionList.filter((option) =>
                option.label.toLowerCase().includes(params.inputValue.toLowerCase())
              )
            }
            disabled={disabled}
            title={title || ""}
            sx={{
              "& .MuiOutlinedInput-root": {
                borderRadius: "5px",

                "& fieldset": {
                  borderColor: "var(--primary-color)",
                },

                "&.Mui-error fieldset": {
                  borderColor: "#d32f2f",
                  borderWidth: "1px",
                },

                "&:hover fieldset": {
                  borderColor: "var(--primary-color)",
                },

                "&.Mui-focused fieldset": {
                  borderColor: "var(--primary-color)",
                },
              },

              backgroundColor: "var(--tertiary-color)",

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
                color: "var(--primary-color)",
              },

              "& .MuiSvgIcon-root": {
                color: "var(--primary-color)",
              },

              "& .MuiOutlinedInput-root.Mui-disabled": {
                backgroundColor: "rgba(var(--primary-color-rgb), 0.05) !important",
                cursor: "not-allowed",

                "& fieldset": {
                  borderColor: "rgba(var(--primary-color-rgb), 0.7) !important",
                },
              },

              "& .MuiInputBase-input.Mui-disabled": {
                color: "rgba(var(--primary-color-rgb), 0.7) !important",
                WebkitTextFillColor: "rgba(var(--primary-color-rgb), 0.7) !important",
                backgroundColor: "rgba(var(--primary-color-rgb), 0.05) !important",
                cursor: "not-allowed",
              },

              "& .MuiInputBase-root.Mui-disabled": {
                color: "var(--primary-color) !important",
              },

              ...sx,
            }}
            renderInput={(params) => (
              <TextField
                {...params}
                error={error}
                helperText={helperText}
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
        )
      }
    </div>
  );
};

export default AutoComplete;