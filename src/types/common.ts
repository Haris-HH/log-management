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

export interface AgencyAccessItem {
  org_code: string;
  count: number;
}

export interface AgencyChartDataGroup {
  month: string;
  access: AgencyAccessItem[];
}

export interface AgencyColumn {
  key: string;
  label: string;
}

export interface AgencyChartData {
  key: string;
  value: number;
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
  title_id: number;
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
  province_code: string;
  district_code: string;
  subdistrict_code: string;
  name_en: string;
  name_th: string;
  zipcode: string;
  visible: boolean;
  active: boolean;
  remark: string;
}

export interface LprRegion {
  id: number;
  region_code: string;
  name_en: string;
  name_th: string;
  remark: string | null;
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

export interface UsageLog {
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
  details: string;
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

export interface Area {
  id: number;
  title_en: string;
  title_th: string;
  title_abbr_en: string;
  title_abbr_th: string;
  visible: boolean;
  active: boolean;
}

export interface DeviceStatus {
  id: number;
  status_code: string;
  status_en: string;
  status_th: string;
  details_en: string;
  details_th: string;
  visible: boolean;
  active: boolean;
  total: number;
  color?: string;
}

export interface Project {
  project_id: string;
  customer_id: string;
  project_code: string;
  project_name: string;
  subdistrict_code: string;
  district_code: string;
  province_code: string;
  police_region_id: number;
  police_station_id: number;
  description: string;
  details: string | null;
  notes: string | null;
  status: string;
  project_start_date: string;
  project_test_date: string;
  project_migration_date: string;
  maintenance_start_date: string;
  maintenance_expired_date: string;
  timezone: string;
  created_at: string;
  updated_at: string;
}

export interface TopUsers {
  rank: number;
  user_id: string;
  title_id?: number;
  title?: string;
  firstname?: string;
  lastname?: string;
  idcard?: string;
  phone?: string;
  username: string;
  ou_code: string;
  ou_name?: string;
  org_code: string;
  months: Record<string, number>;
  total: number;
}

export interface DeviceCheckLog {
  log_id: number;
  log_timestamp: string;
  device_id: string;
  device_ip: string;
  device_status_code: string;
  alive: boolean;
  response_ms: number;
  packet_loss: number;
  check_type: string;
  error_message: string;
  checked_by: string;
}

export interface Device {
  device_id: string;
  device_name: string;
  device_ip: string;
  device_mac: string;
  device_category: string;
  device_type: string;
  brand: string;
  model: string;
  serial_number: string;
  part_number: string;
  project_id: string;
  project_name?: string;
  center_id: string;
  checkpoint_id: string;
  checkpoint_name?: string;
  province_code: string;
  province_name?: string;
  district_code: string;
  district_name?: string;
  subdistrict_code: string;
  subdistrict_name?: string;
  route: string;
  address: string;
  police_region_id: number;
  police_region_name?: string;
  police_station_id: number;
  police_station_name?: string;
  latitude: number;
  longitude: number;
  visible: boolean;
  active: boolean;
  alive: boolean;
  device_status_id?: number;
  device_status_code: string;
  device_status_name: string;
  maintenance_status_code: string;
  last_online: string;
  last_check: string;
  lane: string;
  response_ms: number;
  deleted: boolean;
  request_delete: boolean;
  request_delete_reason: string;
  created_at: string;
  updated_at: string;
  deleted_at: string;
  latLng?: LatLngExpression;
  total?: number;
}

export interface Checkpoint {
  checkpoint_id: string;
  checkpoint_name: string;
  checkpoint_ip: string;
  center_id: string;
  center_ip: string;
  project_id: string;
  organization: string;
  province_code: string;
  district_code: string;
  subdistrict_code: string;
  route: string;
  address: string;
  police_region_id: number;
  police_station_id: number;
  latitude: number;
  longitude: number;
  serial_number: string;
  license_key: string;
  officer_title_id: number;
  officer_firstname: string;
  officer_lastname: string;
  officer_position: string;
  officer_phone: string;
  visible: boolean;
  active: boolean;
  deleted: boolean;
  alive: boolean;
  last_online: string;
  last_check: string;
  response_ms: number;
  created_at: string;
  updated_at: string;
  deleted_at: string;
}

export interface ChartReportStatistic {
  rank: number;
  police_region_id: number;
  police_region: Area;
  total: number;
  online: number;
  offline: number;
  maintenance: number;
  suspended: number;
  others: number;
}

export interface CameraInCheckpoint {
  checkpoint_id: string;
  checkpoint_name: string;
  province_code: string;
  province_name: string;
  district_code: string;
  district_name: string;
  subdistrict_code: string;
  subdistrict_name: string;
  police_station_id: number;
  police_station_name: string;
  latitude: number;
  longitude: number;
  cameras: Device[];
  latLng?: LatLngExpression;
  total: number;
}

export interface PoliceStation {
  id: number;
  province_name: string;
  station_name: string;
  address: string;
  phone: string;
  fax: string;
  visible: boolean;
  active: boolean;
  notes: string;
  province_code: string;
  district_code: string;
}

export interface OverallReportType {
  rank: number;
  police_region_id: number;
  remark: string;
  police_region: Area | null;
  total: number;
  online: number;
  online_percent?: number;
  offline: number;
  offline_percent?: number;
  maintenance: number;
  maintenance_percent?: number;
  suspended: number;
  suspended_percent?: number;
  others: number;
  others_percent?: number;
  availability_pct: number;
}

export interface Pagination {
  page: number;
  maxPage: number;
  limit: number | string;
  count: number;
  countAll: number;
}

export interface Summary {
  total: number;
  total_percent?: number;
  online: number;
  online_percent?: number;
  offline: number;
  offline_percent?: number;
  maintenance: number;
  maintenance_percent?: number;
  suspended: number;
  suspended_percent?: number;
  others: number;
  others_percent?: number;
  availability_pct: number;
}

export interface Series {
  date: string;
  total: number;
  online: number;
  offline: number;
  maintenance: number;
  suspended: number;
  others: number;
  availability_pct: number;
}

export interface OverallProblemReport {
  seq: string;
  device_id: string;
  device_name: string;
  checkpoint_id: string;
  checkpoint_name: string;
  police_station_id: number;
  station_name: string;
  police_region_id: number;
  police_region: string;
  province_code: string;
  province_name: string;
  project_id: string;
  project_name: string;
  device_status_code: string;
  problem_days: string;
  total_days: number;
  problem_pct: string;
  remark: string;
}