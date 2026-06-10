// Types
import type {
  AgencyColumn,
  AgencyChartDataGroup,
} from "../types/common";

export const mockChartInternalPoliceColumn: AgencyColumn[] = [
  { key: "00010001", label: "บช.ก." },
  { key: "00010002", label: "บช.ตชด." },
  { key: "00010003", label: "บช.กน." },
  { key: "00010004", label: "บช.น." },
  { key: "00010005", label: "บช.ปส." },
  { key: "00010006", label: "บช.ส." },
  { key: "00010007", label: "บช.สอท." },
  { key: "00010008", label: "ภ.1" },
  { key: "00010009", label: "ภ.2" },
  { key: "00010010", label: "ภ.3" },
  { key: "00010011", label: "ภ.4" },
  { key: "00010012", label: "ภ.5" },
  { key: "00010013", label: "ภ.6" },
  { key: "00010014", label: "ภ.7" },
  { key: "00010015", label: "ภ.8" },
  { key: "00010016", label: "ภ.9" },
  { key: "00010017", label: "สง.ก.ตร." },
  { key: "00010018", label: "สตม." },
  { key: "00010019", label: "สทล." },
];

const createMockAccess = () =>
  mockChartInternalPoliceColumn.map((col) => ({
    org_code: col.key,
    count: Math.floor(Math.random() * 1000),
  }));

export const mockChartInternalPoliceDataGroup: AgencyChartDataGroup[] = [
  {
    month: "2026-04",
    access: createMockAccess(),
  },
  {
    month: "2026-05",
    access: createMockAccess(),
  },
  {
    month: "2026-06",
    access: createMockAccess(),
  },
];