// Types
import type { ProjectResponse } from "../types/response";

export const mockProject: ProjectResponse = {
  "endpoint": "/api/v0/<sector>/<action>",
  "statusCode": 200,
  "status": "Successful",
  "success": true,
  "message": "OK",
  "pagination": {
    "page": 1,
    "maxPage": 22,
    "limit": 10,
    "count": 10,
    "countAll": 211
  },
  "data": [
    {
      "project_id": "6863148a-246b-4c8d-8ae8-adfe171c24a0",
      "customer_id": "eda2c37e-a1f0-44d4-a876-0ac29b5c6710",
      "project_code": "NSB-2026-DM",
      "project_name": "NSB 2026 Demo",
      "subdistrict_code": "100201",
      "district_code": "1002",
      "province_code": "10",
      "police_region_id": 0,
      "police_station_id": 13,
      "description": "NSB 2026 Demo",
      "details": null,
      "notes": null,
      "status": "active",
      "project_start_date": "2026-02-10",
      "project_test_date": "2026-06-10",
      "project_migration_date": "2026-09-02",
      "maintenance_start_date": "2026-09-02",
      "maintenance_expired_date": "2030-09-01",
      "timezone": "Asia/Bangkok",
      "created_at": "2026-06-05T06:15:54.762Z",
      "updated_at": "2026-06-09T10:06:48.925Z"
    }
  ]
}