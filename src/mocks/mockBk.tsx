// Types
import type { NsbBkResponse } from "../types/response";

export const mockBk: NsbBkResponse = {
  "endpoint": "/api/v0/masterdata/nsb-bk/get?page=1&limit=10&orderBy=bk_code.asc",
  "statusCode": 200,
  "status": "Successful",
  "success": true,
  "message": "OK",
  "pagination": {
    "page": 1,
    "maxPage": 28,
    "limit": "10",
    "count": 10,
    "countAll": 278
  },
  "data": [
    {
      "ou_code": "00",
      "bh_code": "0001",
      "bk_code": "000100",
      "bk_abbr_en": null,
      "bk_abbr_th": "สลก.ตร.",
      "bk_name_en": null,
      "bk_name_th": "สำนักงานเลขานุการตำรวจแห่งชาติ",
      "notes": null
    },
    {
      "ou_code": "00",
      "bh_code": "0001",
      "bk_code": "000101",
      "bk_abbr_en": null,
      "bk_abbr_th": "ตท.",
      "bk_name_en": null,
      "bk_name_th": "กองการต่างประเทศ",
      "notes": null
    },
    {
      "ou_code": "00",
      "bh_code": "0001",
      "bk_code": "000102",
      "bk_abbr_en": null,
      "bk_abbr_th": "วน.",
      "bk_name_en": null,
      "bk_name_th": "กองวินัย",
      "notes": null
    },
    {
      "ou_code": "00",
      "bh_code": "0001",
      "bk_code": "000103",
      "bk_abbr_en": null,
      "bk_abbr_th": "บ.ตร.",
      "bk_name_en": null,
      "bk_name_th": "กองบินตำรวจ",
      "notes": null
    },
    {
      "ou_code": "00",
      "bh_code": "0001",
      "bk_code": "000104",
      "bk_abbr_en": null,
      "bk_abbr_th": "สท.",
      "bk_name_en": null,
      "bk_name_th": "กองสารนิเทศ",
      "notes": null
    },
    {
      "ou_code": "00",
      "bh_code": "0001",
      "bk_code": "000105",
      "bk_abbr_en": null,
      "bk_abbr_th": "สง.ก.ต.ช.",
      "bk_name_en": null,
      "bk_name_th": "สำนักงานคณะกรรมการนโยบายตำรวจแห่งชาติ",
      "notes": null
    },
    {
      "ou_code": "00",
      "bh_code": "0001",
      "bk_code": "000106",
      "bk_abbr_en": null,
      "bk_abbr_th": "สบร.",
      "bk_name_en": null,
      "bk_name_th": "สถาบันฝึกอบรมระหว่างประเทศว่าด้วยการดำเนินการให้เป็นไปตามกฎหมาย (ILEA)",
      "notes": null
    },
    {
      "ou_code": "00",
      "bh_code": "0002",
      "bk_code": "000200",
      "bk_abbr_en": null,
      "bk_abbr_th": "บก.อก.ภ.1",
      "bk_name_en": null,
      "bk_name_th": "กองบังคับการอำนวยการ ภาค 1",
      "notes": null
    },
    {
      "ou_code": "00",
      "bh_code": "0002",
      "bk_code": "000201",
      "bk_abbr_en": null,
      "bk_abbr_th": "บก.สส.ภ.1",
      "bk_name_en": null,
      "bk_name_th": "กองบังคับการสืบสวนสอบสวน ตำรวจภูธรภาค 1",
      "notes": null
    },
    {
      "ou_code": "00",
      "bh_code": "0002",
      "bk_code": "000202",
      "bk_abbr_en": null,
      "bk_abbr_th": "ศฝร.ภ.1",
      "bk_name_en": null,
      "bk_name_th": "ศูนย์ฝึกอบรมตำรวจภูธรภาค 1",
      "notes": null
    }
  ]
}