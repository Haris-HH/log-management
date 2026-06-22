// Types
import type { CameraResponse } from "../types/response";

export const mockCamera: CameraResponse = {
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
      "camera_id": "550e8400-e29b-41d4-a716-446655440000",
      "camera_name": "Example",
      "camera_ip": "10.0.0.1",
      "camera_type": "default",
      "project_id": "550e8400-e29b-41d4-a716-446655440000",
      "center_id": "550e8400-e29b-41d4-a716-446655440000",
      "checkpoint_id": "550e8400-e29b-41d4-a716-446655440000",
      "province_code": "Bangkok",
      "district_code": "Chatuchak",
      "subdistrict_code": "Ladyao",
      "route": "string",
      "address": "123 Phahonyothin Rd, Chatuchak",
      "police_region_id": 1,
      "police_station_id": 1,
      "latitude": 13.756331,
      "longitude": 100.501765,
      "rtsp_live_url": "https://example.com",
      "rtsp_process_url": "https://example.com",
      "stream_encode_id": 1,
      "api_server_url": "https://example.com",
      "live_server_url": "https://example.com",
      "live_stream_url": "https://example.com",
      "detection_area": "string",
      "streaming": true,
      "visible": true,
      "active": true,
      "alive": true,
      "last_online": "2025-01-15T10:30:00Z",
      "last_check": "2025-01-15T10:30:00Z",
      "response_ms": 0,
      "deleted": true,
      "request_delete": true,
      "request_delete_reason": "string",
      "created_at": "2025-01-15T10:30:00Z",
      "updated_at": "2025-01-15T10:30:00Z",
      "deleted_at": "2025-01-15T10:30:00Z"
    }
  ]
}