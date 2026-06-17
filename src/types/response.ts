// Types
import type { 
  AgencyChartDataGroup, 
  AgencyColumn,
  Area,
  Dropdown,
  AgencyUsage,
  LogUsage,
  PersonUsage,
  SearchLog,
  OverallCheckpointType,
  OverallReportDetail,
  OverallWeekReportType,
  User,
  NsbOu,
  NsbBh,
  NsbBk,
  NsbOrg,
  Province,
  District,
  Subdistrict,
  AccessLog,
  UsageLog,
  LprSearchLog,
  Title,
  LprRegion,
  DeviceStatus,
  Project,
  TopUsers,
  DeviceCheckLog,
  Device,
  Checkpoint,
  PoliceStation,
  OverallReportType,
  Pagination,
  Summary,
  Series,
  OverallProblemReport,
} from "../types/common";

export interface UsageChartResponse {
  data: AgencyChartDataGroup[];
  columns: AgencyColumn[];
}

export interface DropdownResponse {
  data: Dropdown[];
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

export interface TitleResponse extends BasicResponse<Title[]> {}

export interface AccessLogResponse extends BasicResponse<AccessLog[]> {}

export interface UsageLogResponse extends BasicResponse<UsageLog[]> {}

export interface LprSearchLogResponse extends BasicResponse<LprSearchLog[]> {}

export interface UserResponse extends BasicResponse<User> {}

export interface NsbOuResponse extends BasicResponse<NsbOu[]> {}

export interface NsbBhResponse extends BasicResponse<NsbBh[]> {}

export interface NsbBkResponse extends BasicResponse<NsbBk[]> {}

export interface NsbOrgResponse extends BasicResponse<NsbOrg[]> {}

export interface ProvinceResponse extends BasicResponse<Province[]> {}

export interface DistrictResponse extends BasicResponse<District[]> {}

export interface SubdistrictResponse extends BasicResponse<Subdistrict[]> {}

export interface AreaResponse extends BasicResponse<Area[]> {}

export interface LprRegionResponse extends BasicResponse<LprRegion[]> {}

export interface DeviceStatusResponse extends BasicResponse<DeviceStatus[]> {}

export interface ProjectResponse extends BasicResponse<Project[]> {}

export interface TopUsersResponse extends BasicResponse<TopUsers[]> {}

export interface DeviceCheckLogResponse extends BasicResponse<DeviceCheckLog[]> {}

export interface DeviceResponse extends BasicResponse<Device[]> {}

export interface CheckpointResponse extends BasicResponse<Checkpoint[]> {}

export interface PoliceStationResponse extends BasicResponse<PoliceStation[]> {}

export interface OverallProblemReportResponse extends ProblemReportResponse<OverallProblemReport[]> {}

export interface OverallReportResponse extends ReportResponse<OverallReportType[]> {}

export interface BasicResponse<T> {
  endpoint: string;
  message: string;
  statusCode: number;
  status: string;
  success: boolean;
  pagination?: Pagination;
  data: T;
}

export interface ProblemReportResponse<T> {
  endpoint: string;
  message: string;
  statusCode: number;
  status: string;
  success: boolean;
  pagination?: Pagination;
  report_range?: "day" | "week" | "month";
  start_date?: string;
  end_date?: string;
  data: T;
}

export interface ReportResponse<T> {
  success: boolean;
  pagination?: Pagination;
  report_range: "day" | "week" | "month";
  period: string;
  data: T;
  summary: Summary;
  series: Series[];
}