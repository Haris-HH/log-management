import dayjs from "dayjs";

// Types
import type { OverallReportType, OverallWeekReportType } from "../types/common";

export const mockOverallDayReport: OverallReportType[] = [
  {
    "police_division": "0",
    "police_division_name": "mobile",
    "total": 20,
    "normal": 9,
    "normal_percent": 45,
    "device": 0,
    "device_percent": 0,
    "network": 10,
    "network_percent": 50,
    "disable": 1,
    "disable_percent": 5,
		"ready": 0,
    "ready_percent": 0
  },
  {
    "police_division": "1",
    "police_division_name": "ภ.1",
    "total": 173,
    "normal": 149,
    "normal_percent": 86.1,
    "device": 14,
    "device_percent": 8.1,
    "network": 0,
    "network_percent": 0,
    "disable": 10,
    "disable_percent": 5.8,
		"ready": 0,
    "ready_percent": 0
  },
  {
    "police_division": "2",
    "police_division_name": "ภ.2",
    "total": 101,
    "normal": 86,
    "normal_percent": 85.1,
    "device": 8,
    "device_percent": 7.9,
    "network": 0,
    "network_percent": 0,
    "disable": 7,
    "disable_percent": 6.9,
		"ready": 0,
    "ready_percent": 0
  },
  {
    "police_division": "3",
    "police_division_name": "ภ.3",
    "total": 116,
    "normal": 92,
    "normal_percent": 79.3,
    "device": 17,
    "device_percent": 14.7,
    "network": 1,
    "network_percent": 0.9,
    "disable": 6,
    "disable_percent": 5.2,
		"ready": 0,
    "ready_percent": 0
  },
  {
    "police_division": "4",
    "police_division_name": "ภ.4",
    "total": 204,
    "normal": 152,
    "normal_percent": 74.5,
    "device": 26,
    "device_percent": 12.7,
    "network": 4,
    "network_percent": 2,
    "disable": 22,
    "disable_percent": 10.8,
		"ready": 0,
    "ready_percent": 0
  },
  {
    "police_division": "5",
    "police_division_name": "ภ.5",
    "total": 238,
    "normal": 184,
    "normal_percent": 77.3,
    "device": 33,
    "device_percent": 13.9,
    "network": 5,
    "network_percent": 2.1,
    "disable": 16,
    "disable_percent": 6.7,
		"ready": 0,
    "ready_percent": 0
  },
  {
    "police_division": "6",
    "police_division_name": "ภ.6",
    "total": 138,
    "normal": 103,
    "normal_percent": 74.6,
    "device": 20,
    "device_percent": 14.5,
    "network": 0,
    "network_percent": 0,
    "disable": 15,
    "disable_percent": 10.9,
		"ready": 0,
    "ready_percent": 0
  },
  {
    "police_division": "7",
    "police_division_name": "ภ.7",
    "total": 207,
    "normal": 171,
    "normal_percent": 82.6,
    "device": 22,
    "device_percent": 10.6,
    "network": 2,
    "network_percent": 1,
    "disable": 12,
    "disable_percent": 5.8,
		"ready": 0,
    "ready_percent": 0
  },
  {
    "police_division": "8",
    "police_division_name": "ภ.8",
    "total": 143,
    "normal": 94,
    "normal_percent": 65.7,
    "device": 39,
    "device_percent": 27.3,
    "network": 3,
    "network_percent": 2.1,
    "disable": 7,
    "disable_percent": 4.9,
		"ready": 0,
    "ready_percent": 0
  },
  {
    "police_division": "9",
    "police_division_name": "ภ.9",
    "total": 157,
    "normal": 113,
    "normal_percent": 72,
    "device": 24,
    "device_percent": 15.3,
    "network": 4,
    "network_percent": 2.5,
    "disable": 16,
    "disable_percent": 10.2,
		"ready": 0,
    "ready_percent": 0
  },
  {
    "police_division": "Total",
    "police_division_name": "รวมทั้งหมด",
    "total": 1497,
    "normal": 1153,
    "normal_percent": 77,
    "device": 203,
    "device_percent": 13.6,
    "network": 29,
    "network_percent": 1.9,
    "disable": 112,
    "disable_percent": 7.5,
		"ready": 0,
    "ready_percent": 0
  }
]

export const mockOverallWeekReport: OverallWeekReportType = {
  "rows": [
		{
			"police_division": "0",
			"police_division_name": "mobile",
			"total": 20,
			"normal": 0,
			"normal_percent": 18.57,
			"device": 0,
			"device_percent": 0,
			"network": 0,
			"network_percent": 1.43,
			"disable": 0,
			"disable_percent": 80,
			"ready": 0,
    	"ready_percent": 0
		},
		{
			"police_division": "1",
			"police_division_name": "ภ.1",
			"total": 173,
			"normal": 0,
			"normal_percent": 71.59,
			"device": 0,
			"device_percent": 18.58,
			"network": 0,
			"network_percent": 2.89,
			"disable": 0,
			"disable_percent": 6.94,
			"ready": 0,
			"ready_percent": 0
		},
		{
			"police_division": "2",
			"police_division_name": "ภ.2",
			"total": 101,
			"normal": 0,
			"normal_percent": 72.56,
			"device": 0,
			"device_percent": 19.52,
			"network": 0,
			"network_percent": 0.99,
			"disable": 0,
			"disable_percent": 6.93,
			"ready": 0,
			"ready_percent": 0
		},
		{
			"police_division": "3",
			"police_division_name": "ภ.3",
			"total": 116,
			"normal": 0,
			"normal_percent": 60.22,
			"device": 0,
			"device_percent": 27.96,
			"network": 0,
			"network_percent": 3.57,
			"disable": 0,
			"disable_percent": 8.25,
			"ready": 0,
    	"ready_percent": 0
		},
		{
			"police_division": "4",
			"police_division_name": "ภ.4",
			"total": 204,
			"normal": 0,
			"normal_percent": 72.9,
			"device": 0,
			"device_percent": 15.69,
			"network": 0,
			"network_percent": 1.61,
			"disable": 0,
			"disable_percent": 9.8,
			"ready": 0,
    	"ready_percent": 0
		},
		{
			"police_division": "5",
			"police_division_name": "ภ.5",
			"total": 238,
			"normal": 0,
			"normal_percent": 75.63,
			"device": 0,
			"device_percent": 17.35,
			"network": 0,
			"network_percent": 1.56,
			"disable": 0,
			"disable_percent": 5.46,
			"ready": 0,
  		"ready_percent": 0
		},
		{
			"police_division": "6",
			"police_division_name": "ภ.6",
			"total": 138,
			"normal": 0,
			"normal_percent": 77.12,
			"device": 0,
			"device_percent": 13.25,
			"network": 0,
			"network_percent": 1.45,
			"disable": 0,
			"disable_percent": 8.18,
			"ready": 0,
    	"ready_percent": 0
		},
		{
			"police_division": "7",
			"police_division_name": "ภ.7",
			"total": 207,
			"normal": 0,
			"normal_percent": 74.33,
			"device": 0,
			"device_percent": 14.49,
			"network": 0,
			"network_percent": 3.11,
			"disable": 0,
			"disable_percent": 8.07,
			"ready": 0,
    	"ready_percent": 0
		},
		{
			"police_division": "8",
			"police_division_name": "ภ.8",
			"total": 143,
			"normal": 0,
			"normal_percent": 63.54,
			"device": 0,
			"device_percent": 29.37,
			"network": 0,
			"network_percent": 1.5,
			"disable": 0,
			"disable_percent": 5.59,
			"ready": 0,
    	"ready_percent": 0
		},
		{
			"police_division": "9",
			"police_division_name": "ภ.9",
			"total": 157,
			"normal": 0,
			"normal_percent": 66.79,
			"device": 0,
			"device_percent": 19.75,
			"network": 0,
			"network_percent": 2.64,
			"disable": 0,
			"disable_percent": 10.83,
			"ready": 0,
    	"ready_percent": 0
		},
		{
			"police_division": "Total",
			"police_division_name": "รวมทั้งหมด",
			"total": 1497,
			"normal": 0,
			"normal_percent": 70.5,
			"device": 0,
			"device_percent": 18.63,
			"network": 0,
			"network_percent": 2.15,
			"disable": 0,
			"disable_percent": 8.72,
			"ready": 0,
    	"ready_percent": 0
		}
	],
	"charts": [
		{
			"date": "2026-03-12",
			"total": 1497,
			"normal": 1067,
			"normal_percent": 71.3,
			"device": 271,
			"device_percent": 18.1,
			"network": 31,
			"network_percent": 2.1,
			"disable": 128,
			"disable_percent": 8.6
		},
		{
			"date": "2026-03-13",
			"total": 1497,
			"normal": 1047,
			"normal_percent": 69.9,
			"device": 287,
			"device_percent": 19.2,
			"network": 32,
			"network_percent": 2.1,
			"disable": 131,
			"disable_percent": 8.8
		},
		{
			"date": "2026-03-14",
			"total": 1497,
			"normal": 1045,
			"normal_percent": 69.8,
			"device": 287,
			"device_percent": 19.2,
			"network": 34,
			"network_percent": 2.3,
			"disable": 131,
			"disable_percent": 8.8
		},
		{
			"date": "2026-03-15",
			"total": 1497,
			"normal": 1047,
			"normal_percent": 69.9,
			"device": 286,
			"device_percent": 19.1,
			"network": 33,
			"network_percent": 2.2,
			"disable": 131,
			"disable_percent": 8.8
		},
		{
			"date": "2026-03-16",
			"total": 1497,
			"normal": 1062,
			"normal_percent": 70.9,
			"device": 273,
			"device_percent": 18.2,
			"network": 31,
			"network_percent": 2.1,
			"disable": 131,
			"disable_percent": 8.8
		},
		{
			"date": "2026-03-17",
			"total": 1497,
			"normal": 1060,
			"normal_percent": 70.8,
			"device": 275,
			"device_percent": 18.4,
			"network": 31,
			"network_percent": 2.1,
			"disable": 131,
			"disable_percent": 8.8
		},
		{
			"date": "2026-03-18",
			"total": 1497,
			"normal": 1060,
			"normal_percent": 70.8,
			"device": 273,
			"device_percent": 18.2,
			"network": 33,
			"network_percent": 2.2,
			"disable": 131,
			"disable_percent": 8.8
		}
	]
}

const TOTAL = 1497;

export const generateMonthCharts = (startDate = "2026-03-01") => {
  return Array.from({ length: 30 }).map((_, i) => {
    const date = dayjs(startDate).add(i, "day");

    const normal = Math.floor(1040 + Math.random() * 40);
    const device = Math.floor(260 + Math.random() * 30);
    const network = Math.floor(30 + Math.random() * 5);

    const disable = TOTAL - normal - device - network;

    const toPercent = (value: number) =>
      Number(((value / TOTAL) * 100).toFixed(1));

    return {
      date: date.format("YYYY-MM-DD"),
      total: TOTAL,

      normal,
      normal_percent: toPercent(normal),

      device,
      device_percent: toPercent(device),

      network,
      network_percent: toPercent(network),

      disable,
      disable_percent: toPercent(disable),
    };
  });
};

export const mockOverallMonthReport: OverallWeekReportType = {
	"rows": [
		{
			"police_division": "0",
			"police_division_name": "mobile",
			"total": 50,
			"normal": 0,
			"normal_percent": 18.57,
			"device": 0,
			"device_percent": 0,
			"network": 0,
			"network_percent": 1.43,
			"disable": 0,
			"disable_percent": 80,
			"ready": 0,
    	"ready_percent": 0
		},
		{
			"police_division": "1",
			"police_division_name": "ภ.1",
			"total": 173,
			"normal": 0,
			"normal_percent": 71.59,
			"device": 0,
			"device_percent": 18.58,
			"network": 0,
			"network_percent": 2.89,
			"disable": 0,
			"disable_percent": 6.94,
			"ready": 0,
			"ready_percent": 0
		},
		{
			"police_division": "2",
			"police_division_name": "ภ.2",
			"total": 101,
			"normal": 0,
			"normal_percent": 72.56,
			"device": 0,
			"device_percent": 19.52,
			"network": 0,
			"network_percent": 0.99,
			"disable": 0,
			"disable_percent": 6.93,
			"ready": 0,
			"ready_percent": 0
		},
		{
			"police_division": "3",
			"police_division_name": "ภ.3",
			"total": 116,
			"normal": 0,
			"normal_percent": 60.22,
			"device": 0,
			"device_percent": 27.96,
			"network": 0,
			"network_percent": 3.57,
			"disable": 0,
			"disable_percent": 8.25,
			"ready": 0,
    	"ready_percent": 0
		},
		{
			"police_division": "4",
			"police_division_name": "ภ.4",
			"total": 204,
			"normal": 0,
			"normal_percent": 72.9,
			"device": 0,
			"device_percent": 15.69,
			"network": 0,
			"network_percent": 1.61,
			"disable": 0,
			"disable_percent": 9.8,
			"ready": 0,
    	"ready_percent": 0
		},
		{
			"police_division": "5",
			"police_division_name": "ภ.5",
			"total": 238,
			"normal": 0,
			"normal_percent": 75.63,
			"device": 0,
			"device_percent": 17.35,
			"network": 0,
			"network_percent": 1.56,
			"disable": 0,
			"disable_percent": 5.46,
			"ready": 0,
  		"ready_percent": 0
		},
		{
			"police_division": "6",
			"police_division_name": "ภ.6",
			"total": 138,
			"normal": 0,
			"normal_percent": 77.12,
			"device": 0,
			"device_percent": 13.25,
			"network": 0,
			"network_percent": 1.45,
			"disable": 0,
			"disable_percent": 8.18,
			"ready": 0,
    	"ready_percent": 0
		},
		{
			"police_division": "7",
			"police_division_name": "ภ.7",
			"total": 207,
			"normal": 0,
			"normal_percent": 74.33,
			"device": 0,
			"device_percent": 14.49,
			"network": 0,
			"network_percent": 3.11,
			"disable": 0,
			"disable_percent": 8.07,
			"ready": 0,
    	"ready_percent": 0
		},
		{
			"police_division": "8",
			"police_division_name": "ภ.8",
			"total": 143,
			"normal": 0,
			"normal_percent": 63.54,
			"device": 0,
			"device_percent": 29.37,
			"network": 0,
			"network_percent": 1.5,
			"disable": 0,
			"disable_percent": 5.59,
			"ready": 0,
    	"ready_percent": 0
		},
		{
			"police_division": "9",
			"police_division_name": "ภ.9",
			"total": 157,
			"normal": 0,
			"normal_percent": 66.79,
			"device": 0,
			"device_percent": 19.75,
			"network": 0,
			"network_percent": 2.64,
			"disable": 0,
			"disable_percent": 10.83,
			"ready": 0,
    	"ready_percent": 0
		},
		{
			"police_division": "Total",
			"police_division_name": "รวมทั้งหมด",
			"total": 1497,
			"normal": 0,
			"normal_percent": 70.5,
			"device": 0,
			"device_percent": 18.63,
			"network": 0,
			"network_percent": 2.15,
			"disable": 0,
			"disable_percent": 8.72,
			"ready": 0,
    	"ready_percent": 0
		}
	],
	"charts": generateMonthCharts("2026-03-01")
}