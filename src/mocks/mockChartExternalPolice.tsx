// Types
import type { AgencyColumn, AgencyChartData, AgencyChartDataGroup } from "../types/common";

export const mockChartExternalPoliceColumn: AgencyColumn[] = [
  { key: "police_forensic", label: "กสพ." },
  { key: "contract_partner", label: "คู่สัญญา" },
  { key: "army", label: "ทบ." },
  { key: "navy", label: "ทร." },
  { key: "narcotics_control", label: "ปปส." },
  { key: "justice_ministry", label: "ยธ." },
];

const createMockData = (): AgencyChartData[] =>
  mockChartExternalPoliceColumn.map(col => ({
    key: col.key,
    value: Math.floor(Math.random() * 1000),
  }));

export const mockChartExternalPoliceDataGroup: AgencyChartDataGroup[] = [
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