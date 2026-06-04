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

export interface User {
  user_id: string;
  user_group_id: string;
  service_channel: ServiceChannel[];
  image_url: string | null;
  username: string;
  title: string;
  firstname: string;
  lastname: string;
  idcard: string;
  phone: string;
  email: string | null;
  position: string | null;
  ou_code: string;
  bh_code: string | null;
  bk_code: string | null;
  org_code: string | null;
  account_status: "pending" | "active" | "inactive" | string;
  edit_note: string | null;
  tokens: Tokens;
  permissions: Permissions;
  allowed_checkpoints: any[];
  last_login: string | null;
  last_logout: string | null;
  user_lifetime: string | null;
  account_expire: string | null;
  hash_id: string | null;
  last_login_service: string | null;
  last_logout_service: string | null;
  created_at: string;
  updated_at: string;
}

export interface ServiceChannel {
  all: boolean;
}

export interface Tokens {
  refreshToken: string;
  serviceChannel: string;
}

export interface Permissions {
  lpr_center: Record<string, unknown>;
  api_connect: Record<string, unknown>;
  log_management: Record<string, unknown>;
  ops_management: Record<string, unknown>;
  user_management: Record<string, unknown>;
}

export interface NsbOu {
  ou_code: string;
  ou_codename: string;
  ou_abbr_en: string;
  ou_abbr_th: string;
  ou_name_en: string;
  ou_name_th: string;
  notes: string;
}

export interface NsbBh {
  ou_code: string;
  bh_code: string;
  bh_abbr_en: string | null;
  bh_abbr_th: string;
  bh_name_en: string | null;
  bh_name_th: string;
  notes: string | null;
}

export interface NsbBk {
  ou_code: string;
  bh_code: string;
  bk_code: string;
  bk_abbr_en: string;
  bk_abbr_th: string;
  bk_name_en: string;
  bk_name_th: string;
  notes: string;
}

export interface NsbOrg {
  ou_code: string;
  bh_code: string;
  bk_code: string;
  org_code: string;
  org_abbr_en: string;
  org_abbr_th: string;
  org_name_en: string;
  org_name_th: string;
  quota: number;
  notes: string;
}

export interface Province {
  id: number;
  country_id: number;
  province_code: string;
  name_en: string;
  name_th: string;
  geo_region_id: number;
  police_region_id: number;
  visible: number;
  active: number;
}

export interface District {
  id: number;
  district_code: string;
  name_en: string;
  name_th: string;
  zipcode: string;
  visible: boolean;
  active: boolean;
  remark: string;
  province_code: string;
}

export interface Subdistrict {
  id: number;
  province_id: number;
  district_id: number;
  subdistrict_code: string;
  name_en: string;
  name_th: string;
  zipcode: string;
  visible: boolean;
  active: boolean;
  remark: string;
}

export interface Ou {
  ou_code: string;
  ou_codename: string;
  ou_abbr_en: string;
  ou_abbr_th: string;
  ou_name_en: string;
  ou_name_th: string;
  notes: string;
}

export interface AccessLog {
  log_id: number;
  log_timestamp: string;
  user_id: string;
  idcard?: string;
  title?: string;
  firstname?: string;
  lastname?: string;
  username: string;
  service_channel: string;
  device_platform: string;

  ou_code: string | null;
  ou_name?: string;
  bh_code: string | null;
  bh_name?: string;
  bk_code: string | null;
  bk_name?: string;
  org_code: string | null;
  org_name?: string;

  request_ip: string;

  location_webui: LocationWebUI;
  location_api: LocationApi;

  user_agent: string;
  user_os: string;
  request_result: string;
  access_details: string;
  total?: number;
}

export interface LocationWebUI {
  lat: number;
  lng: number;
}

export interface LocationApi {
  ip: string;
  _private: boolean;
  country_code: string;
}

export interface LprSearchLog {
  log_id: number;
  log_timestamp: string;
  user_id: string;
  idcard?: string;
  title?: string;
  firstname?: string;
  lastname?: string;
  service_channel: string;
  device_platform: string;

  ou_code: string;
  ou_name?: string;
  bh_code: string;
  bh_name?: string;
  bk_code: string;
  bk_name?: string;
  org_code: string;
  org_name?: string;

  request_ip: string;

  location_webui: LocationWebUI;
  location_api: LocationApi;

  user_agent: string;
  user_os: string;

  plate_prefix: string;
  plate_number: string;
  region_code: string;
  search_result: string;
  total?: number;
}

export interface Title {
  id: number;
  title_group: string;
  title_en: string;
  title_th: string;
  title_abbr_en: string;
  title_abbr_th: string;
  visible: boolean;
  active: boolean;
  remark: string;
}