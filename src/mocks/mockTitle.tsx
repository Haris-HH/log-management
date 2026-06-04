// Types
import type { TitleResponse } from "../types/response";

export const mockTitle: TitleResponse = {
  "endpoint": "/api/v0/masterdata/person-titles/get?page=1&limit=10&orderBy=id.asc",
  "statusCode": 200,
  "status": "Successful",
  "success": true,
  "message": "OK",
  "pagination": {
    "page": 1,
    "maxPage": 8,
    "limit": 10,
    "count": 10,
    "countAll": 75
  },
  "data": [
    {
      "id": 1,
      "title_group": "general",
      "title_en": "Mister",
      "title_th": "นาย",
      "title_abbr_en": "Mr.",
      "title_abbr_th": "นาย",
      "visible": true,
      "active": true,
      "remark": ""
    },
    {
      "id": 2,
      "title_group": "general",
      "title_en": "Miss",
      "title_th": "นางสาว",
      "title_abbr_en": "Miss",
      "title_abbr_th": "น.ส.",
      "visible": true,
      "active": true,
      "remark": ""
    },
    {
      "id": 3,
      "title_group": "general",
      "title_en": "Mrs.",
      "title_th": "นาง",
      "title_abbr_en": "Mrs.",
      "title_abbr_th": "นาง",
      "visible": true,
      "active": true,
      "remark": ""
    },
    {
      "id": 4,
      "title_group": "general",
      "title_en": "Ms.",
      "title_th": "นาง/นางสาว",
      "title_abbr_en": "Ms.",
      "title_abbr_th": "นาง/น.ส.",
      "visible": true,
      "active": true,
      "remark": ""
    },
    {
      "id": 5,
      "title_group": "general",
      "title_en": "Mx.",
      "title_th": "-",
      "title_abbr_en": "Mx.",
      "title_abbr_th": "-",
      "visible": true,
      "active": true,
      "remark": ""
    },
    {
      "id": 6,
      "title_group": "general",
      "title_en": "Master",
      "title_th": "เด็กชาย",
      "title_abbr_en": "Mstr.",
      "title_abbr_th": "ด.ช.",
      "visible": true,
      "active": true,
      "remark": ""
    },
    {
      "id": 7,
      "title_group": "general",
      "title_en": "Miss",
      "title_th": "เด็กหญิง",
      "title_abbr_en": "Miss",
      "title_abbr_th": "ด.ญ.",
      "visible": true,
      "active": true,
      "remark": ""
    },
    {
      "id": 8,
      "title_group": "professional",
      "title_en": "Doctor",
      "title_th": "ด็อกเตอร์",
      "title_abbr_en": "Dr.",
      "title_abbr_th": "ดร.",
      "visible": true,
      "active": true,
      "remark": ""
    },
    {
      "id": 9,
      "title_group": "professional",
      "title_en": "Professor",
      "title_th": "ศาสตราจารย์",
      "title_abbr_en": "Prof.",
      "title_abbr_th": "ศ.",
      "visible": true,
      "active": true,
      "remark": ""
    },
    {
      "id": 10,
      "title_group": "professional",
      "title_en": "Engineer",
      "title_th": "วิศวกร",
      "title_abbr_en": "Eng.",
      "title_abbr_th": "วศ.",
      "visible": true,
      "active": true,
      "remark": ""
    }
  ]
};