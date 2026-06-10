// Types
import type { TopUsersResponse } from "../types/response";

export const mockTopInternalUsers: TopUsersResponse = {
  "endpoint": "/api/v0/log-management/access-logs/statistics/user-max-access",
  "statusCode": 200,
  "status": "Successful",
  "success": true,
  "message": "OK",
  "pagination": {
    "page": 1,
    "maxPage": 0,
    "limit": 25,
    "count": 0,
    "countAll": 0
  },
  data: [
    {
      rank: 1,
      user_id: "e0decedf-1234-5678-abcd-000000000001",
      username: "somchai",
      ou_code: "00",
      org_code: "00010001",
      months: {
        "2025-11": 500,
        "2025-12": 750,
        "2026-01": 1200,
      },
      total: 2450,
    },
  ],
};

export const mockTopExternalUsers: TopUsersResponse = {
  "endpoint": "/api/v0/log-management/access-logs/statistics/user-max-access",
  "statusCode": 200,
  "status": "Successful",
  "success": true,
  "message": "OK",
  "pagination": {
    "page": 1,
    "maxPage": 0,
    "limit": 25,
    "count": 0,
    "countAll": 0
  },
  data: [
    {
      rank: 1,
      user_id: "e0decedf-1234-5678-abcd-000000000002",
      username: "external_user",
      ou_code: "99",
      org_code: "99010001",
      months: {
        "2025-11": 900,
        "2025-12": 1100,
        "2026-01": 1500,
      },
      total: 3500,
    },
  ],
};