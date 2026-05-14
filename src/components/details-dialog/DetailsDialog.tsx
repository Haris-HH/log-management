// Material UI
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import IconButton from '@mui/material/IconButton';
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
          },
        }
      }}
    >
      <DialogTitle
        sx={{
          backgroundColor: "var(--primary-color)",
          color: "var(--tertiary-color)",
          py: 0,
          px: 2,
        }}
      >
        <div className='flex justify-between items-center'>
          <span>{dialogTitle}</span>
          <IconButton>
            <CloseIcon onClick={handleClose} sx={{ color: "var(--tertiary-color)", mr: "-10px" }} />
          </IconButton>
        </div>
      </DialogTitle>
      <DialogContent
        sx={{
          backgroundColor: "var(--secondary-color)",
          border: "1px solid var(--primary-color)",
        }}
      >
        {children}
      </DialogContent>
    </Dialog>
  )
}

export default DetailsDialog;