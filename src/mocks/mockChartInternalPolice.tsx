// Types
import type { AgencyColumn, AgencyChartData, AgencyChartDataGroup } from "../types/common";

export const mockChartInternalPoliceColumn: AgencyColumn[] = [
  { key: "bk", label: "บช.ก." },
  { key: "bktcd", label: "บช.ตชด." },
  { key: "bkn", label: "บช.กน." },
  { key: "bknn", label: "บช.น." },
  { key: "bkp", label: "บช.ปส." },
  { key: "bks", label: "บช.ส." },
  { key: "bksot", label: "บช.สอท." },
  { key: "p1", label: "ภ.1" },
  { key: "p2", label: "ภ.2" },
  { key: "p3", label: "ภ.3" },
  { key: "p4", label: "ภ.4" },
  { key: "p5", label: "ภ.5" },
  { key: "p6", label: "ภ.6" },
  { key: "p7", label: "ภ.7" },
  { key: "p8", label: "ภ.8" },
  { key: "p9", label: "ภ.9" },
  { key: "police_commission", label: "สง.ก.ตร." },
  { key: "immigration", label: "สตม." },
  { key: "highway", label: "สทล." },
];

const createMockData = (): AgencyChartData[] =>
  mockChartInternalPoliceColumn.map(col => ({
    key: col.key,
    value: Math.floor(Math.random() * 1000),
  }));

export const mockChartInternalPoliceDataGroup: AgencyChartDataGroup[] = [
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