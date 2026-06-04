// Types
import type { NsbBhResponse } from "../types/response";

export const mockBh: NsbBhResponse = {
  "endpoint": "/api/v0/masterdata/nsb-bh/get?page=1&limit=10&orderBy=bh_code.asc",
  "statusCode": 200,
  "status": "Successful",
  "success": true,
  "message": "OK",
  "pagination": {
    "page": 1,
    "maxPage": 10,
    "limit": "10",
    "count": 10,
    "countAll": 95
  },
  "data": [
    {
      "ou_code": "00",
      "bh_code": "0001",
      "bh_abbr_en": null,
      "bh_abbr_th": "สง.ผบ.ตร.",
      "bh_name_en": null,
      "bh_name_th": "สำนักงานผู้บัญชาการตำรวจแห่งชาติ",
      "notes": null
    },
    {
      "ou_code": "00",
      "bh_code": "0002",
      "bh_abbr_en": null,
      "bh_abbr_th": "ภ.1",
      "bh_name_en": null,
      "bh_name_th": "ตำรวจภูธรภาค 1",
      "notes": null
    },
    {
      "ou_code": "00",
      "bh_code": "0003",
      "bh_abbr_en": null,
      "bh_abbr_th": "ภ.2",
      "bh_name_en": null,
      "bh_name_th": "ตำรวจภูธรภาค 2",
      "notes": null
    },
    {
      "ou_code": "00",
      "bh_code": "0004",
      "bh_abbr_en": null,
      "bh_abbr_th": "ภ.3",
      "bh_name_en": null,
      "bh_name_th": "ตำรวจภูธรภาค 3",
      "notes": null
    },
    {
      "ou_code": "00",
      "bh_code": "0005",
      "bh_abbr_en": null,
      "bh_abbr_th": "ภ.4",
      "bh_name_en": null,
      "bh_name_th": "ตำรวจภูธรภาค 4",
      "notes": null
    },
    {
      "ou_code": "00",
      "bh_code": "0006",
      "bh_abbr_en": null,
      "bh_abbr_th": "ภ.5",
      "bh_name_en": null,
      "bh_name_th": "ตำรวจภูธรภาค 5",
      "notes": null
    },
    {
      "ou_code": "00",
      "bh_code": "0007",
      "bh_abbr_en": null,
      "bh_abbr_th": "ภ.6",
      "bh_name_en": null,
      "bh_name_th": "ตำรวจภูธรภาค 6",
      "notes": null
    },
    {
      "ou_code": "00",
      "bh_code": "0008",
      "bh_abbr_en": null,
      "bh_abbr_th": "ภ.7",
      "bh_name_en": null,
      "bh_name_th": "ตำรวจภูธรภาค 7",
      "notes": null
    },
    {
      "ou_code": "00",
      "bh_code": "0009",
      "bh_abbr_en": null,
      "bh_abbr_th": "ภ.8",
      "bh_name_en": null,
      "bh_name_th": "ตำรวจภูธรภาค 8",
      "notes": null
    },
    {
      "ou_code": "00",
      "bh_code": "0010",
      "bh_abbr_en": null,
      "bh_abbr_th": "ภ.9",
      "bh_name_en": null,
      "bh_name_th": "ตำรวจภูธรภาค 9",
      "notes": null
    }
  ]
}