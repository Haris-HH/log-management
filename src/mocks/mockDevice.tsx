// Types
import type { 
  DeviceResponse,
} from "../types/response";

export const mockDevice: DeviceResponse = {
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
      "device_id": "550e8400-e29b-41d4-a716-446655440000",
      "device_name": "Example",
      "device_ip": "10.0.0.1",
      "device_mac": "aa:bb:cc:dd:ee:ff",
      "device_category": "general",
      "device_type": "default",
      "brand": "string",
      "model": "string",
      "serial_number": "string",
      "part_number": "string",
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
      "visible": true,
      "active": true,
      "alive": true,
      "device_status_code": "active",
      "device_status_name": "active",
      "maintenance_status_code": "active",
      "last_online": "2025-01-15T10:30:00Z",
      "last_check": "2025-01-15T10:30:00Z",
      "response_ms": 0,
      "deleted": true,
      "request_delete": true,
      "request_delete_reason": "string",
      "created_at": "2025-01-15T10:30:00Z",
      "updated_at": "2025-01-15T10:30:00Z",
      "deleted_at": "2025-01-15T10:30:00Z",
      "lane": "string"
    }
  ]
}