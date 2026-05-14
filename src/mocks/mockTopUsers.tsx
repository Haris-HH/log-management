// Types
import type { TopUsersType } from "../types/common";
import type { TopUsersResponse } from "../types/response";

export const mockTopInternalUsersType: TopUsersType[] = [
  {
    nation_number: "3440299987644",
    prename_id: 1,
    fullname: "กิตติเดช ห้าวหาญ",
    first_name: "กิตติเดช",
    last_name: "ห้าวหาญ",
    phone: "0998978576",
    ad_ou: 1,
    usageData: [
      { usageMonthYear: "2026-04", usageCount: 3500 },
      { usageMonthYear: "2026-03", usageCount: 2500 },
      { usageMonthYear: "2026-02", usageCount: 5050 }
    ]
  },
  {
    nation_number: "1440276788123",
    prename_id: 1,
    fullname: "สมศักดิ์ บุญหาญ",
    first_name: "สมศักดิ์",
    last_name: "บุญหาญ",
    phone: "0818000573",
    ad_ou: 1,
    usageData: [
      { usageMonthYear: "2026-04", usageCount: 2450 },
      { usageMonthYear: "2026-03", usageCount: 1750 },
      { usageMonthYear: "2026-02", usageCount: 5000 }
    ]
  }
]

export const mockTopExternalUsersType: TopUsersType[] = [
  {
    nation_number: "3440299987678",
    prename_id: 1,
    fullname: "อดิสร ศิริพจนา",
    first_name: "อดิสร",
    last_name: "ศิริพจนา",
    phone: "0998978876",
    ad_ou: 1,
    usageData: [
      { usageMonthYear: "2026-04", usageCount: 6500 },
      { usageMonthYear: "2026-03", usageCount: 6750 },
      { usageMonthYear: "2026-02", usageCount: 7700 }
    ]
  },
  {
    nation_number: "1440276789998",
    prename_id: 1,
    fullname: "ชาติชาย พงษ์ศรี",
    first_name: "ชาติชาย",
    last_name: "พงษ์ศรี",
    phone: "0998978876",
    ad_ou: 1,
    usageData: [
      { usageMonthYear: "2026-04", usageCount: 5450 },
      { usageMonthYear: "2026-03", usageCount: 6000 },
      { usageMonthYear: "2026-02", usageCount: 7150 }
    ]
  }
]

export const mockTopInternalUsers: TopUsersResponse = {
  messages: "",
  results: mockTopInternalUsersType,
  status: "ok",
  total_matches: 2,
  total: 1
}

export const mockTopExternalUsers: TopUsersResponse = {
  messages: "",
  results: mockTopExternalUsersType,
  status: "ok",
  total_matches: 2,
  total: 1
}