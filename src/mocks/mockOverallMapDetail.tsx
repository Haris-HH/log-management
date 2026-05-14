// Types
import type { OverallMapDetail } from "../types/common";

export const mockOverallMapDetail: OverallMapDetail[] = [
  ...Array.from({ length: 20 }).map((_, i) => {
    const statusOptions = [
      { id: 1, name: "ปิดการใช้งาน" },
      { id: 2, name: "เครือข่ายขัดข้อง" },
      { id: 3, name: "อุปกรณ์ขัดข้อง" },
      { id: 4, name: "สถานะปกติ" },
    ];

    const randomStatus = statusOptions[i % statusOptions.length];

    const cameraCount = Math.floor(Math.random() * 5) + 1;

    return {
      checkpoint_uid: `CHK-${i + 1}`,
      checkpoint_name: `จุดตรวจที่ ${i + 1}`,
      latitude: 13.7 + Math.random() * 0.5,
      longitude: 100.4 + Math.random() * 0.5,
      status_id: randomStatus.id,
      status_name: randomStatus.name,

      area_structure: [
        {
          area_id: (i % 5) + 1,
          area_name: `พื้นที่ ${(i % 5) + 1}`,
        },
        {
          area_id: ((i + 1) % 5) + 1,
          area_name: `พื้นที่ ${((i + 1) % 5) + 1}`,
        },
      ],

      camera_list: Array.from({ length: cameraCount }).map((__, camIdx) => {
        const camStatus =
          statusOptions[Math.floor(Math.random() * statusOptions.length)];

        return {
          camera_uid: `CAM-${i + 1}-${camIdx + 1}`,
          camera_name: `กล้อง ${i + 1}-${camIdx + 1}`,
          status_id: camStatus.id,
          status_name: camStatus.name,
          route: `Route ${Math.floor(Math.random() * 4) + 1}`,
          lane: Math.floor(Math.random() * 2),
        };
      }),
    };
  }),
];