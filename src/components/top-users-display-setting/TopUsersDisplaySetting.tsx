import { useState } from 'react'

// Material UI
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import Divider from '@mui/material/Divider';
import Box from '@mui/material/Box';
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";

// Components
import TextBox from "../text-box/TextBox";

// i18n
import { useTranslation } from 'react-i18next';

interface FormData {
  top_internal_use: number;
  top_external_use: number;
}

type Props = {
  open: boolean;
  handleClose: () => void;
  dialogTitle: string;
  onSave: (topInternal: number, topExternal: number) => void;
}

const TopUsersDisplaySetting = ({ open, handleClose, dialogTitle, onSave }: Props) => {

  // Form Data
  const [formData, setFormData] = useState<FormData>({
    top_internal_use: 5000,
    top_external_use: 3000,
  });

  // Data
  const [tempInternal, setTempInternal] = useState(formData.top_internal_use.toLocaleString());
  const [tempExternal, setTempExternal] = useState(formData.top_external_use.toLocaleString());

  // i18n
  const { t } = useTranslation();

  const handleCancel = () => {
    handleClose();
  }

  const handleSave = () => {
    if (onSave) {
      onSave(formData.top_internal_use, formData.top_external_use);
      handleClose();
    }
  }

  return (
    <Dialog 
      open={open} 
      fullWidth 
      maxWidth={false}
      slotProps={{
        root: {
          sx: {
            zIndex: (theme) => theme.zIndex.drawer - 1,
          },
        },
        paper: {
          sx: {
            width: "400px",
            borderRadius: "8px",
            backgroundColor: "var(--theme-border-input)",
            border: "1px solid rgba(var(--theme-accent-rgb),0.35)",
          },
        }
      }}
    >
      <DialogTitle
        sx={{
          color: "var(--theme-accent)",
          py: 1,
          px: 2,
        }}
      >
        <Box className='flex flex-col items-center text-[1.2rem]'>
          <span>{dialogTitle}</span>
          <Divider orientation='horizontal' sx={{ width: "100%", borderColor: "rgba(var(--theme-accent-rgb),0.35)" }} />
        </Box>
      </DialogTitle>
      <DialogContent
        sx={{
          backgroundColor: "var(--theme-border-input)",
        }}
      >
        <Box className="flex flex-col gap-1 px-0.5 pt-3">
          <Typography variant="h6" sx={{ fontSize: "1.2rem", fontWeight: "bold", color: "var(--theme-accent)" }}>
            {t("text.internal-police")}
          </Typography>
          <Box className="grid grid-cols-[1fr_100px] items-center gap-2">
            <Typography variant="subtitle1" sx={{ fontSize: "1rem", color: "var(--theme-accent)" }}>
              {`${t("text.usage-count-more-than")} (${t("text.time")})`}
            </Typography>
            <TextBox
              sx={{ marginTop: "5px", fontSize: "15px" }}
              id="top-internal-use"
              label={""}
              labelFontSize="14px"
              value={tempInternal}
              onChange={(event) => setTempInternal(event.target.value)}
              onBlur={() => {
                const cleaned = tempInternal.replace(/,/g, "");
                const num = Number(cleaned) || 5000;

                setFormData((prev) => ({
                  ...prev,
                  top_internal_use: num,
                }));

                setTempInternal(num.toLocaleString());
              }}
            />
          </Box>
          <Typography variant="h6" sx={{ fontSize: "1.2rem", fontWeight: "bold", color: "var(--theme-accent)" }}>
            {t("text.external-police")}
          </Typography>
          <Box className="grid grid-cols-[1fr_100px] items-center gap-2">
            <Typography variant="subtitle1" sx={{ fontSize: "1rem", color: "var(--theme-accent)" }}>
              {`${t("text.usage-count-more-than")} (${t("text.time")})`}
            </Typography>
            <TextBox
              sx={{ marginTop: "5px", fontSize: "15px" }}
              id="top-external-use"
              label={""}
              labelFontSize="14px"
              value={tempExternal}
              onChange={(event) => setTempExternal(event.target.value)}
              onBlur={() => {
                const cleaned = tempExternal.replace(/,/g, "");
                const num = Number(cleaned) || 3000;

                setFormData((prev) => ({
                  ...prev,
                  top_external_use: num,
                }));

                setTempExternal(num.toLocaleString());
              }}
            />
          </Box>
          <Box className="flex gap-2 items-center justify-center mt-3">
            <Button
              variant="outlined"
              sx={{
                width: 90,
                height: 40,
                backgroundColor: "var(--theme-border-input)",
                color: "var(--theme-accent)",
                border: "1px solid var(--theme-accent)",
                "&:hover": {
                  backgroundColor: "rgba(var(--theme-accent-rgb),0.2)",
                },
                fontWeight: 700,
                textTransform: "capitalize",
              }}
              onClick={handleCancel}
            >
              {t("button.cancel")}
            </Button>
            <Button
              variant="contained"
              sx={{
                width: 90,
                height: 40,
                backgroundColor: "var(--theme-accent)",
                color: "var(--theme-border-input)",
                "&:hover": {
                  backgroundColor: "rgba(var(--theme-accent-rgb),0.8)",
                },
                fontWeight: 700,
                textTransform: "capitalize",
              }}
              onClick={handleSave}
            >
              {t("button.save")}
            </Button>
          </Box>
        </Box>
      </DialogContent>
    </Dialog>
  )
}

export default TopUsersDisplaySetting;