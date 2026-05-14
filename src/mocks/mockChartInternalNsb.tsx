// Types
import type { AgencyColumn, AgencyChartData, AgencyChartDataGroup } from "../types/common";

export const mockChartInternalNsbColumn: AgencyColumn[] = [
  { key: "nsb_hq_support", label: "บก.ขส.บช.ปส." },
  { key: "nsb_1", label: "บก.ปส.1" },
  { key: "nsb_2", label: "บก.ปส.2" },
  { key: "nsb_3", label: "บก.ปส.3" },
  { key: "nsb_4", label: "บก.ปส.4" },
  { key: "nsb_special_ops", label: "บก.สกส.บช.ปส." },
  { key: "unknown", label: "ไม่ระบุ" },
];

const createMockData = (): AgencyChartData[] =>
  mockChartInternalNsbColumn.map(col => ({
    key: col.key,
    value: Math.floor(Math.random() * 1000),
  }));

export const mockChartInternalNsbDataGroup: AgencyChartDataGroup[] = [
  {
    month_year: "2026-02",
    month: 2,
    data: createMockData()
  },
  {
    month_year: "2026-03",
    month: 3,
    data: createMockData()
  },
  {
    month_year: "2026-04",
    month: 4,
    data: createMockData()
  },
]