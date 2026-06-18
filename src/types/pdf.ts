// Types
import type { 
  OverallProblemReport,
  OverallReportType,
  AccessLog,
  LprSearchLog,
  Summary,
} from "./common";

export interface AgencyUsagePdfData {
  agency_id: string;
  agency_name: string;
  bh_id: string;
  bh_name: string;
  bk_id: string;
  bk_name: string;
  start_date: string;
  end_date: string;
  agencyUsage: AccessLog[];
}

export interface PersonUsagePdfData {
  name: string;
  pid_or_water_mark: string;
  agency_id: string;
  agency_name: string;
  bh_id: string;
  bh_name: string;
  bk_id: string;
  bk_name: string;
  org_id: string;
  org_name: string;
  start_date: string;
  end_date: string;
  personUsage: AccessLog[];
}

export interface LogUsagePdfData {
  name: string;
  pid_or_water_mark: string;
  agency_id: string;
  agency_name: string;
  bh_id: string;
  bh_name: string;
  bk_id: string;
  bk_name: string;
  org_id: string;
  org_name: string;
  start_date: string;
  end_date: string;
  logUsage: AccessLog[];
}

export interface SearchAgencyPlatePdfData {
  agency_id: string;
  agency_name: string;
  bh_id: string;
  bh_name: string;
  bk_id: string;
  bk_name: string;
  plate_group: string;
  plate_number: string;
  province_id: string;
  province_name: string;
  start_date: string;
  end_date: string;
  agencyPlate: LprSearchLog[];
}

export interface SearchPersonPlatePdfData {
  name: string;
  pid_or_water_mark: string;
  agency_id: string;
  agency_name: string;
  bh_id: string;
  bh_name: string;
  bk_id: string;
  bk_name: string;
  org_id: string;
  org_name: string;
  plate_group: string;
  plate_number: string;
  province_id: string;
  province_name: string;
  start_date: string;
  end_date: string;
  personPlate: LprSearchLog[];
}

export interface SearchLogPlatePdfData {
  name: string;
  pid_or_water_mark: string;
  agency_id: string;
  agency_name: string;
  bh_id: string;
  bh_name: string;
  bk_id: string;
  bk_name: string;
  org_id: string;
  org_name: string;
  plate_group: string;
  plate_number: string;
  province_id: string;
  province_name: string;
  start_date: string;
  end_date: string;
  logPlate: LprSearchLog[];
}

export interface OverallCheckpointsPdfData {
  checkpoint_name: string,
  camera_name: string,
  station_name: string,
  area_name: string,
  province_name: string,
  district_name: string,
  subdistrict_name: string,
  road: string,
  route: string,
  project: string,
}

export interface OverallReportPdfData {
  title: string;
  date: string;
  area: string;
  province: string;
  project: string;
  overallReport: OverallReportType[];
  summary: Summary | null;
  overallReportDetail: OverallProblemReport[];
}