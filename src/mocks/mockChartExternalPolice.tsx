// Types
import type {
  AgencyColumn,
  AgencyChartDataGroup,
} from "../types/common";

export const mockChartExternalPoliceColumn: AgencyColumn[] = [
  { key: "external_0001", label: "กสพ." },
  { key: "external_0002", label: "คู่สัญญา" },
  { key: "external_0003", label: "ทบ." },
  { key: "external_0004", label: "ทร." },
  { key: "external_0005", label: "ปปส." },
  { key: "external_0006", label: "ยธ." },
];

const createMockAccess = () =>
  mockChartExternalPoliceColumn.map((col) => ({
    org_code: col.key,
    count: Math.floor(Math.random() * 1000),
  }));

export const mockChartExternalPoliceDataGroup: AgencyChartDataGroup[] = [
  {
    month: "2026-02",
    access: createMockAccess(),
  },
  {
    month: "2026-03",
    access: createMockAccess(),
  },
  {
    month: "2026-04",
    access: createMockAccess(),
  },
];