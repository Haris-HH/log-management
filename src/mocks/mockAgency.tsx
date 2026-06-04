// Types
import type { NsbOuResponse } from "../types/response";

export const mockAgency: NsbOuResponse = {
  "endpoint": "/api/v0/masterdata/nsb-ou/get?page=1&limit=10&orderBy=ou_code.asc",
  "statusCode": 200,
  "status": "Successful",
  "success": true,
  "message": "OK",
  "pagination": {
    "page": 1,
    "maxPage": 1,
    "limit": "10",
    "count": 8,
    "countAll": 8
  },
  "data": [
    {
      "ou_code": "00",
      "ou_codename": "police",
      "ou_abbr_en": "RTP",
      "ou_abbr_th": "ตร.",
      "ou_name_en": "Royal Thai Police",
      "ou_name_th": "สํานักงานตํารวจแห่งชาติ",
      "notes": "ทุกกองบัญชาการ"
    },
    {
      "ou_code": "01",
      "ou_codename": "rta",
      "ou_abbr_en": "RTA",
      "ou_abbr_th": "ทบ.",
      "ou_name_en": "Royal Thai Army",
      "ou_name_th": "กองบัญชาการกองทัพบก",
      "notes": "ภาค 1 - 9"
    },
    {
      "ou_code": "02",
      "ou_codename": "navy",
      "ou_abbr_en": "RTN",
      "ou_abbr_th": "ทร.",
      "ou_name_en": "Royal Thai NAVY",
      "ou_name_th": "กองบัญชาการกองทัพเรือ",
      "notes": "ภาค 1 - 9"
    },
    {
      "ou_code": "03",
      "ou_codename": "rtaf",
      "ou_abbr_en": "RTAF",
      "ou_abbr_th": "ทอ.",
      "ou_name_en": "Royal Thai Air Force",
      "ou_name_th": "กองบัญชาการกองทัพอากาศ",
      "notes": "ภาค 1 - 9"
    },
    {
      "ou_code": "04",
      "ou_codename": "coj",
      "ou_abbr_en": "COJ",
      "ou_abbr_th": "ยธ.",
      "ou_name_en": "Court of Justice",
      "ou_name_th": "ศาลยุติธรรม",
      "notes": "ภาค 1 - 9"
    },
    {
      "ou_code": "05",
      "ou_codename": "oncb",
      "ou_abbr_en": "ONCB",
      "ou_abbr_th": "ปปส.",
      "ou_name_en": "Office of the Narcotics Control Board",
      "ou_name_th": "สำนักงานคณะกรรมการป้องกันและปราบปรามยาเสพติด",
      "notes": "ภาค 1 - 9"
    },
    {
      "ou_code": "06",
      "ou_codename": "dsi",
      "ou_abbr_en": "DSI",
      "ou_abbr_th": "กสพ.",
      "ou_name_en": "Department of Special Investigation",
      "ou_name_th": "กรมสอบสวนคดีพิเศษ",
      "notes": "ภาค 1 - 9"
    },
    {
      "ou_code": "07",
      "ou_codename": "partnership",
      "ou_abbr_en": "Partnership",
      "ou_abbr_th": "คู่สัญญา",
      "ou_name_en": "Partnership",
      "ou_name_th": "ความร่วมมือ คู่สัญญา",
      "notes": "ภาค 1 - 9"
    }
  ]
}