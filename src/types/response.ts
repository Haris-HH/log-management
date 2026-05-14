// Types
import type { 
  AgencyChartDataGroup, 
  AgencyColumn,
  TopUsersType,
  Dropdown, 
  AgencyUsage,
  LogUsage,
  PersonUsage,
  SearchLog,
  OverallCheckpointType,
  OverallReportType,
  OverallReportDetail,
  OverallWeekReportType,
} from "../types/common";

export interface UsageChartResponse {
  data: AgencyChartDataGroup[];
  columns: AgencyColumn[];
}

export interface TopUsersResponse {
  messages: string;
  results: TopUsersType[];
  status: string;
  total_matches: number;
  total: number;
}

export interface DropdownResponse {
  data: Dropdown[];
}

export interface AgencyUsageResponse {
  data: AgencyUsage[];
}

export interface PersonUsageResponse {
  data: PersonUsage[];
}

export interface LogUsageResponse {
  data: LogUsage[];
}

export interface SearchAgencyUsageResponse {
  data: AgencyUsage[];
}

export interface SearchPersonUsageResponse {
  data: PersonUsage[];
}

export interface SearchLogUsageResponse {
  data: SearchLog[];
}

export interface OverallCheckpointResponse {
  data: OverallCheckpointType[];
}

export interface OverallDayReportResponse {
  data: OverallReportType[];
}

export interface OverallLineChartReportResponse {
  data: OverallWeekReportType;
}

export interface OverallReportDetailResponse {
  data: OverallReportDetail[];
}