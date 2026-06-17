// Types
import type { PoliceStationResponse } from "../types/response";

export const mockPoliceStations: PoliceStationResponse = {
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
      "id": 1,
      "province_name": "Bangkok",
      "station_name": "Example",
      "address": "123 Phahonyothin Rd, Chatuchak",
      "phone": "+66812345678",
      "fax": "+66212345678",
      "visible": true,
      "active": true,
      "notes": "Example description",
      "province_code": "Bangkok",
      "district_code": "Chatuchak"
    }
  ]
}