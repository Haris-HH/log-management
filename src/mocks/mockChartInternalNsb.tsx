// Types
import type {
  AgencyColumn,
  AgencyChartDataGroup,
} from "../types/common";

export const mockChartInternalNsbColumn: AgencyColumn[] = [
  { key: "nsb_hq_support", label: "บก.ขส.บช.ปส." },
  { key: "nsb_1", label: "บก.ปส.1" },
  { key: "nsb_2", label: "บก.ปส.2" },
  { key: "nsb_3", label: "บก.ปส.3" },
  { key: "nsb_4", label: "บก.ปส.4" },
  { key: "nsb_special_ops", label: "บก.สกส.บช.ปส." },
  { key: "unknown", label: "ไม่ระบุ" },
];

const createMockData = () =>
  mockChartInternalNsbColumn.map(col => ({
    org_code: col.key,
    count: Math.floor(Math.random() * 1000),
  }));

export const mockChartInternalNsbDataGroup: AgencyChartDataGroup[] = [
  {
    month: "2026-02",
    access: createMockData()
  },
  {
    month: "2026-03",
    access: createMockData()
  },
  {
    month: "2026-04",
    access: createMockData()
  },
]