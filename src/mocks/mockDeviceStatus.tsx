// Types
import type { DeviceStatusResponse } from "../types/response";

export const mockDeviceStatus: DeviceStatusResponse = {
  "endpoint": "/api/v0/masterdata/device-statuses/get?page=1&limit=10&orderBy=status_code.asc&groupBy=status_code",
  "statusCode": 200,
  "status": "Successful",
  "success": true,
  "message": "OK",
  "pagination": {
    "page": 1,
    "maxPage": 1,
    "limit": 10,
    "count": 5,
    "countAll": 5
  },
  "data": [
    {
      "id": 1,
      "status_code": "online",
      "status_en": "Online",
      "status_th": "เชื่อมต่อ",
      "details_en": "Device is reachable and operating normally",
      "details_th": "อุปกรณ์เชื่อมต่อและทำงานปกติ",
      "visible": true,
      "active": true,
      "total": 1
    },
    {
      "id": 4,
      "status_code": "suspended",
      "status_en": "Suspended",
      "status_th": "ระงับการใช้งาน",
      "details_en": "Device has been suspended and is not in service",
      "details_th": "อุปกรณ์ถูกระงับการใช้งานและไม่ให้บริการ",
      "visible": true,
      "active": true,
      "total": 1
    },
    {
      "id": 3,
      "status_code": "maintenance",
      "status_en": "Maintenance",
      "status_th": "กำลังปรับปรุง",
      "details_en": "Device is temporarily taken offline for maintenance",
      "details_th": "อุปกรณ์ถูกระงับชั่วคราวเพื่อการบำรุงรักษา",
      "visible": true,
      "active": true,
      "total": 1
    },
    {
      "id": 2,
      "status_code": "connecting",
      "status_en": "Connecting",
      "status_th": "กำลังเชื่อมต่อ",
      "details_en": "Device is attempting to establish a connection",
      "details_th": "อุปกรณ์กำลังพยายามเชื่อมต่อ",
      "visible": true,
      "active": true,
      "total": 1
    },
    {
      "id": 0,
      "status_code": "offline",
      "status_en": "Offline",
      "status_th": "ไม่เชื่อมต่อ",
      "details_en": "Device is not reachable or powered off",
      "details_th": "อุปกรณ์ไม่สามารถเชื่อมต่อได้หรือปิดอยู่",
      "visible": true,
      "active": true,
      "total": 1
    }
  ]
}