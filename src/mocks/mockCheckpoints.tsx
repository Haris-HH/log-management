// Types
import type { 
  CheckpointResponse,
} from "../types/response";

export const mockCheckpoint: CheckpointResponse = {
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
      "checkpoint_id": "550e8400-e29b-41d4-a716-446655440000",
      "checkpoint_name": "Example",
      "checkpoint_ip": "10.0.0.1",
      "center_id": "550e8400-e29b-41d4-a716-446655440000",
      "center_ip": "10.0.0.1",
      "project_id": "550e8400-e29b-41d4-a716-446655440000",
      "organization": "string",
      "province_code": "Bangkok",
      "district_code": "Chatuchak",
      "subdistrict_code": "Ladyao",
      "route": "string",
      "address": "123 Phahonyothin Rd, Chatuchak",
      "police_region_id": 1,
      "police_station_id": 1,
      "latitude": 13.756331,
      "longitude": 100.501765,
      "serial_number": "string",
      "license_key": "string",
      "officer_title_id": 1,
      "officer_firstname": "John",
      "officer_lastname": "Doe",
      "officer_position": "string",
      "officer_phone": "+66812345678",
      "visible": true,
      "active": true,
      "deleted": true,
      "alive": true,
      "last_online": "2025-01-15T10:30:00Z",
      "last_check": "2025-01-15T10:30:00Z",
      "response_ms": 12.5,
      "created_at": "2025-01-15T10:30:00Z",
      "updated_at": "2025-01-15T10:30:00Z",
      "deleted_at": "2025-01-15T10:30:00Z"
    }
  ]
}