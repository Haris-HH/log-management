// Types
import type { LprSearchLogResponse } from "../types/response";

export const mockLprSearchLog: LprSearchLogResponse = {
  "endpoint": "/api/v0/log-management/access-logs/get?page=1&limit=10&orderBy=log_id.asc",
  "statusCode": 200,
  "status": "Successful",
  "success": true,
  "message": "OK",
  "pagination": {
    "page": 1,
    "maxPage": 5,
    "limit": "10",
    "count": 10,
    "countAll": 50
  },
  "data": [
    {
      "log_id": 1,
      "log_timestamp": "2025-01-15T10:30:00Z",
      "user_id": "550e8400-e29b-41d4-a716-446655440000",
      "idcard": "1234567890123",
      "service_channel": "string",
      "device_platform": "string",
      "ou_code": "CODE001",
      "bh_code": "CODE001",
      "bk_code": "CODE001",
      "org_code": "CODE001",
      "request_ip": "10.0.0.1",
      "location_webui": {
        lat: 13.7563,
        lng: 100.5018
      },
      "location_api": {
        ip: "test",
        _private: true,
        country_code: "TH",
      },
      "user_agent": "string",
      "user_os": "string",
      "plate_prefix": "string",
      "plate_number": "1กข 1234",
      "region_code": "CODE001",
      "search_result": "example"
    }
  ]
};