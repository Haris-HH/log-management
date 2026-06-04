// Types
import type { ProvinceResponse } from "../types/response";

export const mockProvince: ProvinceResponse = {
  "endpoint": "api/v0/masterdata/provinces/get?page=1&limit=10&orderBy=province_code.asc",
  "statusCode": 200,
  "status": "Successful",
  "success": true,
  "message": "OK",
  "pagination": {
    "page": 1,
    "maxPage": 8,
    "limit": "10",
    "count": 10,
    "countAll": 77
  },
  "data": [
    {
      "id": 1,
      "country_id": 196,
      "province_code": "10",
      "name_en": "Bangkok",
      "name_th": "กรุงเทพมหานคร",
      "geo_region_id": 9,
      "police_region_id": 0,
      "visible": 1,
      "active": 1
    },
    {
      "id": 2,
      "country_id": 196,
      "province_code": "11",
      "name_en": "Samut Prakan",
      "name_th": "สมุทรปราการ",
      "geo_region_id": 9,
      "police_region_id": 1,
      "visible": 1,
      "active": 1
    },
    {
      "id": 3,
      "country_id": 196,
      "province_code": "12",
      "name_en": "Nonthaburi",
      "name_th": "นนทบุรี",
      "geo_region_id": 9,
      "police_region_id": 1,
      "visible": 1,
      "active": 1
    },
    {
      "id": 4,
      "country_id": 196,
      "province_code": "13",
      "name_en": "Pathum Thani",
      "name_th": "ปทุมธานี",
      "geo_region_id": 9,
      "police_region_id": 1,
      "visible": 1,
      "active": 1
    },
    {
      "id": 5,
      "country_id": 196,
      "province_code": "14",
      "name_en": "Phra Nakhon Si Ayutthaya",
      "name_th": "พระนครศรีอยุธยา",
      "geo_region_id": 9,
      "police_region_id": 1,
      "visible": 1,
      "active": 1
    },
    {
      "id": 6,
      "country_id": 196,
      "province_code": "15",
      "name_en": "Ang Thong",
      "name_th": "อ่างทอง",
      "geo_region_id": 9,
      "police_region_id": 1,
      "visible": 1,
      "active": 1
    },
    {
      "id": 7,
      "country_id": 196,
      "province_code": "16",
      "name_en": "Lopburi",
      "name_th": "ลพบุรี",
      "geo_region_id": 9,
      "police_region_id": 1,
      "visible": 1,
      "active": 1
    },
    {
      "id": 8,
      "country_id": 196,
      "province_code": "17",
      "name_en": "Sing Buri",
      "name_th": "สิงห์บุรี",
      "geo_region_id": 9,
      "police_region_id": 1,
      "visible": 1,
      "active": 1
    },
    {
      "id": 9,
      "country_id": 196,
      "province_code": "18",
      "name_en": "Chai Nat",
      "name_th": "ชัยนาท",
      "geo_region_id": 9,
      "police_region_id": 1,
      "visible": 1,
      "active": 1
    },
    {
      "id": 10,
      "country_id": 196,
      "province_code": "19",
      "name_en": "Saraburi",
      "name_th": "สระบุรี",
      "geo_region_id": 9,
      "police_region_id": 1,
      "visible": 1,
      "active": 1
    }
  ]
}