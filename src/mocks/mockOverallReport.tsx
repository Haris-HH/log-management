// Types
import type { OverallReportResponse } from "../types/response";

export const mockOverallReport: OverallReportResponse = {
	"success": true,
	"report_range": "week",
	"period": "2026-01-23/2026-01-29",
	"summary": {
		"total": 1310,
		"online": 982,
		"offline": 211,
		"maintenance": 22,
		"suspended": 15,
		"others": 80,
		"network_offline": 80,
		"device_offline": 80,
		"availability_pct": 80
	},
	"series": [
		{
			"date": "2026-01-23",
			"total": 1305,
			"online": 978,
			"offline": 211,
			"maintenance": 22,
			"suspended": 15,
			"others": 79,
			"network_offline": 80,
			"device_offline": 80,
			"availability_pct": 80
		}
	],
	"pagination": {
		"page": 1,
		"maxPage": 22,
		"limit": 10,
		"count": 10,
		"countAll": 211
	},
	"data": [
		{
			"rank": 1,
			"police_region_id": 1,
			"remark": "Scheduled cable replacement",
			"police_region": {
				"id": 1,
				"title_en": "Metropolitan Police Region",
				"title_th": "กองบัญชาการตำรวจนครบาล",
				"title_abbr_en": "MPB",
				"title_abbr_th": "บช.น.",
				"active": true,
				"visible": true
			},
			"total": 150,
			"online": 120,
			"offline": 20,
			"maintenance": 5,
			"suspended": 2,
			"others": 3,
			"network_offline": 80,
			"device_offline": 80,
			"availability_pct": 80
		}
	]
};