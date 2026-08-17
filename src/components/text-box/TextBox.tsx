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
  onKeyDown?: (event: React.KeyboardEvent<HTMLInputElement>) => void
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
  onKeyDown,
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

  return (
    <div className="flex flex-col w-full">
      <Typography sx={{ fontSize: labelFontSize || undefined, color:'var(--theme-accent)' }} variant='subtitle1'>
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
        onKeyDown={onKeyDown}
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
            backgroundColor: "var(--theme-border-input)",
            borderRadius: "5px",

            "& fieldset": {
              borderColor: "var(--theme-accent)",
            },

            "&:hover fieldset": {
              borderColor: "var(--theme-accent)",
            },

            "&.Mui-focused fieldset": {
              borderColor: "var(--theme-accent)",
            },
          },

          "& .MuiInputBase-root": {
            minHeight: minHeight,
            padding: "2px 8px",
            fontSize: labelFontSize,
            color: "var(--theme-accent)",
          },

          "& .MuiInputBase-input": {
            height: "25px",
            padding: "0 !important",
            color: "var(--theme-accent)",
            backgroundColor: "transparent !important",

            "&:-webkit-autofill": {
              WebkitBoxShadow:
                "0 0 0 1000px var(--theme-border-input) inset !important",
              WebkitTextFillColor:
                "var(--theme-accent) !important",
              caretColor: "var(--theme-accent)",
              transition: "background-color 5000s ease-in-out 0s",
            },

            "&:-webkit-autofill:hover": {
              WebkitBoxShadow:
                "0 0 0 1000px var(--theme-border-input) inset !important",
              WebkitTextFillColor:
                "var(--theme-accent) !important",
            },

            "&:-webkit-autofill:focus": {
              WebkitBoxShadow:
                "0 0 0 1000px var(--theme-border-input) inset !important",
              WebkitTextFillColor:
                "var(--theme-accent) !important",
            },
          },

          "& .Mui-disabled": {
            backgroundColor: "rgba(var(--theme-panel-rgb),0.5)",
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
                  {showPassword ? <VisibilityOff sx={{ color:"var(--theme-accent)" }} /> : <Visibility sx={{ color:"var(--theme-accent)" }} />}
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