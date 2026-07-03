// Material UI
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import IconButton from '@mui/material/IconButton';
import Divider from '@mui/material/Divider';
import CloseIcon from '@mui/icons-material/Close';

type Props = {
  open: boolean;
  handleClose: () => void;
  dialogTitle: string;
  children: React.ReactNode;
}

const DetailsDialog = ({ open, handleClose, dialogTitle, children }: Props) => {
  return (
    <Dialog 
      open={open} 
      fullWidth 
      maxWidth={false}
      slotProps={{
        root: {
          sx: {
            zIndex: 99999,
          },
        },
        paper: {
          sx: {
            width: "450px",
            borderRadius: "8px",
            backgroundColor: "var(--tertiary-color)",
            border: "1px solid rgba(var(--primary-color-rgb), 0.35)",
          },
        }
      }}
    >
      <DialogTitle
        sx={{
          py: 0,
          px: 2,
          color: "var(--primary-color)",
        }}
      >
        <div className='flex flex-col'>
          <div className='flex justify-between items-center'>
            <span>{dialogTitle}</span>
            <IconButton>
              <CloseIcon 
                onClick={handleClose} 
                sx={{ 
                  color: "var(--primary-color)", 
                  mr: "-10px",
                  ":hover": {
                    scale: 1.1,
                  }
                }} 
              />
            </IconButton>
          </div>
          <Divider orientation='horizontal' sx={{ width: "100%", borderColor: "rgba(var(--primary-color-rgb), 0.35)" }} />
        </div>
      </DialogTitle>
      <DialogContent
        sx={{
          backgroundColor: "var(--tertiary-color)",
        }}
      >
        {children}
      </DialogContent>
    </Dialog>
  )
}

export default DetailsDialog;