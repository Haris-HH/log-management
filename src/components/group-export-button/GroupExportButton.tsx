// Material UI
import IconButton from "@mui/material/IconButton";

// Icons
import ExportExcelIcon from "../../assets/icons/export-excel.png";
import ExportPdfIcon from "../../assets/icons/export-pdf.png";

type Props = {
  handleExportExcel: () => void;
  handleExportPdf: () => void;
}

const GroupExportButton = ({
  handleExportExcel,
  handleExportPdf,
}: Props) => {
  return (
    <>
      <IconButton 
        sx={{ 
          border: "1px solid var(--primary-color)", 
          width: "40px", 
          height: "40px", 
          borderRadius: "5px",
          "&:hover": {
            backgroundColor: "rgba(var(--primary-color-rgb), 0.5)",
          },
        }}
        onClick={handleExportPdf}
      >
        <img src={ExportPdfIcon} alt="Export PDF" className="h-6 w-6" />
      </IconButton>
      <IconButton 
        sx={{ 
          border: "1px solid var(--primary-color)", 
          width: "40px", 
          height: "40px", 
          borderRadius: "5px",
          "&:hover": {
            backgroundColor: "rgba(var(--primary-color-rgb), 0.5)",
          },
        }}
        onClick={handleExportExcel}
      >
        <img src={ExportExcelIcon} alt="Export CSV" className="h-6 w-6" />
      </IconButton>
    </>
  )
};

export default GroupExportButton;