import type { LatLngExpression } from 'leaflet';

export interface AgencyUsage {
  id: number;
  agency_id: number;
  agency_name: string;
  usage_count: number;
  bh_id: number;
  bh_name: string;
  bk_id: number;
  bk_name: string
  org_id: number;
  org_name: string;
}

export interface PersonUsage {
  id: number;
  prefix_id: string;
  name: string;
  pid: string;
  agency_id: number;
  agency_name: string;
  usage_count: number;
  bh_id: number;
  bh_name: string;
  bk_id: number;
  bk_name: string
  org_id: number;
  org_name: string;
}

export interface LogUsage {
  id: number;
  prefix_id: string;
  name: string;
  pid: string;
  date_time: string;
  ip_address: string;
  latitude: number;
  longitude: number;
  user_agent: string;
  agency_id: number;
  agency_name: string;
  bh_id: number;
  bh_name: string;
  bk_id: number;
  bk_name: string
  org_id: number;
  org_name: string;
}

export interface SearchLog {
  id: number;
  prefix_id: string;
  name: string;
  pid: string;
  date_time: string;
  ip_address: string;
  latitude: number;
  longitude: number;
  user_agent: string;
  agency_id: number;
  agency_name: string;
  bh_id: number;
  bh_name: string;
  bk_id: number;
  bk_name: string
  org_id: number;
  org_name: string;
  detail: string;
}

export interface AgencyChartDataGroup {
  month_year: string;
  month: number;
  data: AgencyChartData[];
}

export interface AgencyChartData {
  key: string;
  value: number;
}

export interface AgencyColumn {
  key: string;
  label: string;
}

export interface TopUsersType {
  nation_number: string;
  prename_id: number;
  fullname: string;
  first_name: string;
  last_name: string;
  phone: string;
  ad_ou: number;
  usageData: UsageCount[];
}

export interface UsageCount {
  usageMonthYear: string;
  usageCount: number;
}

export interface OverallReportDetail {
  checkpoint_uid: string;
  checkpoint_name: string;
  camera_uid: string;
  camera_name: string;
  station_id: number;
  station_name: string;
  area_id: number;
  area_name: string;
  province_id: number;
  province_name: string;
  project: string;
  status_id: number;
  date_count_error: number;
  date_count_error_percent: number;
  remark: string;
}

export interface OverallReportType {
  police_division: string;
  police_division_name: string;
  total: number;
  normal: number;
  normal_percent: number;
  device: number;
  device_percent: number;
  network: number;
  network_percent: number;
  disable: number;
  disable_percent: number;
  ready: number;
  ready_percent: number;
}

export interface Dropdown {
  code: string;
  name: string;
}

export interface OverallMapDetail {
  checkpoint_uid: string;
  checkpoint_name: string;
  latitude: number;
  longitude: number;
  area_structure: AreaStructure[];
  status_id: number;
  status_name: string;
  camera_list: CameraList[];
  latLng?: LatLngExpression;
}

export interface AreaStructure {
  area_id: number;
  area_name: string;
}

export interface CameraList {
  camera_uid: string;
  camera_name: string;
  status_id: number;
  status_name: string;
  route: string;
  lane: number;
}

export interface OverallCheckpointType {
  id: number;
  data_status: "online" | "offline";
  network_status: "online" | "offline";
  name_display: string;
  police_checkpoint: string;
  police_station: string;
  police_division: string;
  police_division_name: string;
  province: string;
  district: string;
  sub_district: string;
  route: string;
  lane: string;
  project_name: string;
}

export type ColumnOption = {
  key: string;
  label: string;
  checked: boolean;
};

export interface OverallReportChartType {
  date: string;
  total: number;
  normal: number;
  normal_percent: number;
  device: number;
  device_percent: number;
  network: number;
  network_percent: number;
  disable: number;
  disable_percent: number;
}

export interface OverallWeekReportType {
  rows: OverallReportType[];
  charts: OverallReportChartType[];
}