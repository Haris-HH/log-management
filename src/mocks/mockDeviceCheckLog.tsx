// Types
import type { 
  DeviceCheckLogResponse,
} from "../types/response";


export const mockDeviceCheckLog: DeviceCheckLogResponse = {
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
      "log_id": 1,
      "log_timestamp": "2025-01-15T10:30:00Z",
      "device_id": "550e8400-e29b-41d4-a716-446655440000",
      "device_ip": "10.0.0.1",
      "device_status_code": "active",
      "alive": true,
      "response_ms": 0,
      "packet_loss": 0,
      "check_type": "default",
      "error_message": "string",
      "checked_by": "string"
    }
  ]
}