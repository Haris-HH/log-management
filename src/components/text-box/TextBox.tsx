import React, { useState } from "react"

// Material UI
import TextField from "@mui/material/TextField";
import InputAdornment from "@mui/material/InputAdornment";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import { Visibility, VisibilityOff } from "@mui/icons-material";

type TextBoxProps = {
  id?: string
  value?: string | number
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void
  onKeyPress?: (event: React.KeyboardEvent<HTMLInputElement>) => void
  onBlur?: (event: React.FocusEvent<HTMLInputElement>) => void
  label: string
  placeholder?: string
  labelFontSize?: string
  sx?: object
  disabled?: boolean
  title?: string
  error?: boolean
  helperText?: string
  variant?: "outlined" | "filled" | "standard"
  required?: boolean
  type?: string
  register?: any;
  isMultiline?: boolean;
  rows?: number;
  autoComplete?: string;
  minHeight?: string;
}

const TextBox: React.FC<TextBoxProps> = ({
  id,
  value,
  onChange,
  onKeyPress,
  label,
  placeholder,
  labelFontSize = "14px",
  sx,
  disabled,
  title,
  error,
  helperText,
  variant = "outlined",
  required = false,
  type = "text",
  register,
  isMultiline = false,
  rows,
  autoComplete,
  minHeight = "30px",
  onBlur,
  ...props
}) => {
  // State
  const [showPassword, setShowPassword] = useState(false);

  const isPasswordType = type === "password";
  const actualType = isPasswordType && showPassword ? "text" : type;

  const handleTogglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  };

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (onChange) {
      onChange(event)
      if (register) {
        register.onChange({
          target: { name: register.name, value: event.target.value || "" },
        });
      }
    }
  }

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (onKeyPress) {
      onKeyPress(event)
    }
  }

  return (
    <div className="flex flex-col w-full">
      <Typography sx={{ fontSize: labelFontSize || undefined, color:'var(--primary-color)' }} variant='subtitle1'>
        {`${label}`}
        {
          required && <span className="text-red-500"> *</span>
        }
      </Typography>
      <TextField
        id={id}
        value={value}
        type={actualType}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        onBlur={onBlur}
        placeholder={placeholder || ""}
        disabled={disabled}
        error={error}
        helperText={helperText}
        variant={variant}
        multiline={isMultiline}
        rows={rows}
        autoComplete={autoComplete ?? (type === "password" ? "current-password" : undefined)}
        sx={{
          borderRadius: "5px",
          backgroundColor: "transparent",

          "& .MuiOutlinedInput-root": {
            backgroundColor: "var(--secondary-color)",
            borderRadius: "5px",

            "& fieldset": {
              borderColor: "var(--primary-color)",
            },

            "&:hover fieldset": {
              borderColor: "var(--primary-color)",
            },

            "&.Mui-focused fieldset": {
              borderColor: "var(--primary-color)",
            },
          },

          "& .MuiInputBase-root": {
            minHeight: minHeight,
            padding: "2px 8px",
            fontSize: labelFontSize,
            color: "var(--primary-color)",
          },

          "& .MuiInputBase-input": {
            height: "25px",
            padding: "0 !important",
            color: "var(--primary-color)",
            backgroundColor: "transparent !important",

            "&:-webkit-autofill": {
              WebkitBoxShadow:
                "0 0 0 1000px var(--secondary-color) inset !important",
              WebkitTextFillColor:
                "var(--primary-color) !important",
              caretColor: "var(--primary-color)",
              transition: "background-color 5000s ease-in-out 0s",
            },

            "&:-webkit-autofill:hover": {
              WebkitBoxShadow:
                "0 0 0 1000px var(--secondary-color) inset !important",
              WebkitTextFillColor:
                "var(--primary-color) !important",
            },

            "&:-webkit-autofill:focus": {
              WebkitBoxShadow:
                "0 0 0 1000px var(--secondary-color) inset !important",
              WebkitTextFillColor:
                "var(--primary-color) !important",
            },
          },

          "& .Mui-disabled": {
            backgroundColor: "#DDD",
          },

          ...sx,
        }}
        slotProps={{
          inputLabel: {
            sx: { 
              fontSize: labelFontSize,
            },
          },
          input: {
            endAdornment: isPasswordType ? (
              <InputAdornment position="end" className="mr-2">
                <IconButton 
                  onClick={handleTogglePasswordVisibility} 
                  edge="end"
                >
                  {showPassword ? <VisibilityOff sx={{ color:"var(--primary-color)" }} /> : <Visibility sx={{ color:"var(--primary-color)" }} />}
                </IconButton>
              </InputAdornment>
            ) : undefined
          },
        }}
        title={title || ""}
        {...props}
      />
    </div>
  )
}

export default TextBox