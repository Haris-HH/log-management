// Types
import type { OverallProblemReportResponse } from "../types/response";

export const mockOverallProblemReport: OverallProblemReportResponse = {
  "endpoint": "https://nsb-core.local/api/v0/ops-management/devices/statistics/problem-report",
  "statusCode": 200,
  "status": "Successful",
  "success": true,
  "message": "OK",
  "report_range": "month",
  "start_date": "2026-06-01",
  "end_date": "2026-06-30",
  "pagination": {
    "page": 1,
    "maxPage": 1,
    "limit": 50,
    "count": 2,
    "countAll": 2
  },
  "data": [
    {
      "seq": "1",
      "device_id": "2",
      "device_name": "LPR-2",
      "checkpoint_id": "3",
      "checkpoint_name": "CoreIT Office",
      "police_station_id": 71,
      "station_name": "สน.วังทองหลาง",
      "police_region_id": 0,
      "police_region": "กองบัญชาการตำรวจนครบาล (บช.น.)",
      "province_code": "10",
      "province_name": "กรุงเทพมหานคร",
      "project_id": "6863148a-246b-4c8d-8ae8-adfe171c24a0",
      "project_name": "NSB 2026 Demo",
      "device_status_code": "online",
      "problem_days": "1",
      "total_days": 30,
      "problem_pct": "3.3",
      "remark": "เชื่อมต่อไม่ได้"
    }
  ]
}