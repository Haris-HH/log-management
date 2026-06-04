// Types
import type { DistrictResponse } from "../types/response";

export const mockDistrict: DistrictResponse = {
  "endpoint": "api/v0/masterdata/districts/get?page=1&limit=10&orderBy=district_code.asc",
  "statusCode": 200,
  "status": "Successful",
  "success": true,
  "message": "OK",
  "pagination": {
    "page": 1,
    "maxPage": 93,
    "limit": "10",
    "count": 10,
    "countAll": 928
  },
  "data": [
    {
      "id": 374,
      "district_code": "4012",
      "name_en": "Phon",
      "name_th": "พล",
      "zipcode": "40120",
      "visible": true,
      "active": true,
      "remark": "",
      "province_code": "40"
    },
    {
      "id": 1,
      "district_code": "1001",
      "name_en": "Phra Nakhon",
      "name_th": "พระนคร",
      "zipcode": "10200",
      "visible": true,
      "active": true,
      "remark": "-",
      "province_code": "10"
    },
    {
      "id": 2,
      "district_code": "1002",
      "name_en": "Dusit",
      "name_th": "ดุสิต",
      "zipcode": "10300",
      "visible": true,
      "active": true,
      "remark": "",
      "province_code": "10"
    },
    {
      "id": 3,
      "district_code": "1003",
      "name_en": "Nong Chok",
      "name_th": "หนองจอก",
      "zipcode": "10530",
      "visible": true,
      "active": true,
      "remark": "",
      "province_code": "10"
    },
    {
      "id": 4,
      "district_code": "1004",
      "name_en": "Bang Rak",
      "name_th": "บางรัก",
      "zipcode": "10500",
      "visible": true,
      "active": true,
      "remark": "",
      "province_code": "10"
    },
    {
      "id": 5,
      "district_code": "1005",
      "name_en": "Bang Khen",
      "name_th": "บางเขน",
      "zipcode": "10220",
      "visible": true,
      "active": true,
      "remark": "",
      "province_code": "10"
    },
    {
      "id": 6,
      "district_code": "1006",
      "name_en": "Bang Kapi",
      "name_th": "บางกะปิ",
      "zipcode": "10240",
      "visible": true,
      "active": true,
      "remark": "",
      "province_code": "10"
    },
    {
      "id": 7,
      "district_code": "1007",
      "name_en": "Pathum Wan",
      "name_th": "ปทุมวัน",
      "zipcode": "10330",
      "visible": true,
      "active": true,
      "remark": "",
      "province_code": "10"
    },
    {
      "id": 8,
      "district_code": "1008",
      "name_en": "Pom Prap Sattruphai",
      "name_th": "ป้อมปราบศัตรูพ่าย",
      "zipcode": "10100",
      "visible": true,
      "active": true,
      "remark": "",
      "province_code": "10"
    },
    {
      "id": 9,
      "district_code": "1009",
      "name_en": "Phra Khanong",
      "name_th": "พระโขนง",
      "zipcode": "10260",
      "visible": true,
      "active": true,
      "remark": "",
      "province_code": "10"
    }
  ]
}