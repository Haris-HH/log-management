// Material UI
import IconButton from "@mui/material/IconButton";

// Icons
import ExportExcelIcon from "../../assets/icons/export-excel.png";
import ExportPdfIcon from "../../assets/icons/export-pdf.png";

// Hooks
import { usePermission } from "../../hooks/usePermission";

type Props = {
  /*
    Page this pair of buttons belongs to. Exporting is its own permission axis
    (`prints`), independent of whether the page is read-only, so the check lives
    here rather than being repeated by every page that exports.
  */
  groupKey: string;
  handleExportExcel: () => void;
  handleExportPdf: () => void;
}

const GroupExportButton = ({
  groupKey,
  handleExportExcel,
  handleExportPdf,
}: Props) => {
  const { canPrint } = usePermission(groupKey);

  if (!canPrint) return null;

  return (
    <>
      <IconButton 
        sx={{ 
          border: "1px solid var(--theme-accent)", 
          width: "40px", 
          height: "40px", 
          borderRadius: "5px",
          "&:hover": {
            backgroundColor: "rgba(var(--theme-accent-rgb),0.5)",
          },
        }}
        onClick={handleExportPdf}
      >
        <img src={ExportPdfIcon} alt="Export PDF" className="h-6 w-6" />
      </IconButton>
      <IconButton 
        sx={{ 
          border: "1px solid var(--theme-accent)", 
          width: "40px", 
          height: "40px", 
          borderRadius: "5px",
          "&:hover": {
            backgroundColor: "rgba(var(--theme-accent-rgb),0.5)",
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