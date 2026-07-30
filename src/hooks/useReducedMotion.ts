// Material UI
import useMediaQuery from "@mui/material/useMediaQuery";

/**
 * ผู้ใช้เปิด "ลดการเคลื่อนไหว" ไว้ในระบบปฏิบัติการหรือไม่
 *
 * ใช้ `useMediaQuery` ของ MUI ให้เข้ากับที่โปรเจกต์ใช้อยู่แล้ว และเพื่อให้ทั้ง
 * คอมโพเนนต์ที่ใช้ framer-motion และที่ไม่ใช้ (canvas, วิดีโอพื้นหลัง) อ่านค่า
 * จากแหล่งเดียวกัน
 *
 * แนวทางเมื่อค่านี้เป็น true คือ "เบาลง ไม่ใช่ตัดทิ้ง" — ยังคง opacity และการ
 * เปลี่ยนสีที่ช่วยให้เข้าใจสถานะไว้ แต่ตัดการเคลื่อนที่ การหมุน การซูม และ
 * animation ที่วนไม่รู้จบออก ซึ่งเป็นตัวกระตุ้นอาการเวียนศีรษะ
 *
 * ส่วนที่คุมได้ด้วย CSS ล้วน ๆ มี `@media (prefers-reduced-motion: reduce)`
 * ใน `src/index.css` รับไว้อีกชั้นหนึ่ง hook นี้ใช้กับที่ที่ต้องเลือกระหว่าง
 * "ขยับ" กับ "จางเข้า" ซึ่ง CSS แบบครอบทั้งแอปตัดสินใจแทนไม่ได้
 */
export const useReducedMotion = (): boolean =>
  useMediaQuery("(prefers-reduced-motion: reduce)");
