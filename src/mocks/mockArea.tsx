// Types
import type { AreaResponse } from "../types/response";

export const mockArea: AreaResponse = {
  "endpoint": "/api/v0/masterdata/police-regions/get?page=1&limit=10&orderBy=id.asc",
  "statusCode": 200,
  "status": "Successful",
  "success": true,
  "message": "OK",
  "pagination": {
    "page": 1,
    "maxPage": 1,
    "limit": 10,
    "count": 10,
    "countAll": 10
  },
  "data": [
    {
      "id": 0,
      "title_en": "Metropolitan Police Bureau",
      "title_th": "กองบัญชาการตำรวจนครบาล (บช.น.)",
      "active": true,
      "visible": true
    },
    {
      "id": 1,
      "title_en": "Provincial Police Region 1",
      "title_th": "ตำรวจภูธร ภาค 1 (ภ.1)",
      "active": true,
      "visible": true
    },
    {
      "id": 2,
      "title_en": "Provincial Police Region 2",
      "title_th": "ตำรวจภูธร ภาค 2 (ภ.2)",
      "active": true,
      "visible": true
    },
    {
      "id": 3,
      "title_en": "Provincial Police Region 3",
      "title_th": "ตำรวจภูธร ภาค 3 (ภ.3)",
      "active": true,
      "visible": true
    },
    {
      "id": 4,
      "title_en": "Provincial Police Region 4",
      "title_th": "ตำรวจภูธร ภาค 4 (ภ.4)",
      "active": true,
      "visible": true
    },
    {
      "id": 5,
      "title_en": "Provincial Police Region 5",
      "title_th": "ตำรวจภูธร ภาค 5 (ภ.5)",
      "active": true,
      "visible": true
    },
    {
      "id": 6,
      "title_en": "Provincial Police Region 6",
      "title_th": "ตำรวจภูธร ภาค 6 (ภ.6)",
      "active": true,
      "visible": true
    },
    {
      "id": 7,
      "title_en": "Provincial Police Region 7",
      "title_th": "ตำรวจภูธร ภาค 7 (ภ.7)",
      "active": true,
      "visible": true
    },
    {
      "id": 8,
      "title_en": "Provincial Police Region 8",
      "title_th": "ตำรวจภูธร ภาค 8 (ภ.8)",
      "active": true,
      "visible": true
    },
    {
      "id": 9,
      "title_en": "Provincial Police Region 9",
      "title_th": "ตำรวจภูธร ภาค 9 (ภ.9)",
      "active": true,
      "visible": true
    }
  ]
}