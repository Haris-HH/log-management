/*
  Motion tokens — จังหวะกลางของทั้งแอป

  ก่อนหน้านี้โปรเจกต์มี duration กระจัดกระจาย 12 ค่า (0.2s ถึง 5s) โดยไม่มี
  มาตรฐาน ทำให้ interaction แบบเดียวกันรู้สึกไม่เหมือนกันในแต่ละหน้า สามระดับนี้
  ครอบคลุมทุก transition ที่ไม่ใช่ ambient animation:

    fast  — ผู้ใช้ต้องรู้สึกว่า "ทันที" (hover, toggle, ปุ่ม)
    base  — การเคลื่อนที่ที่ตามองตามได้ (drawer, panel, การ์ด)
    slow  — องค์ประกอบใหญ่ที่กินพื้นที่จอ (overlay, การเปลี่ยนหน้า)
*/
export const MOTION_DURATION = {
  fast: 150,
  base: 250,
  slow: 400,
} as const;

export const MOTION_EASING = {
  /** การเปลี่ยนสถานะทั่วไป เช่น สี พื้นหลัง เส้นขอบ */
  standard: "ease",
  /** สิ่งที่กำลังปรากฏ — เข้าเร็วแล้วค่อย ๆ นิ่ง ไม่ใช่ ease-in ที่เริ่มช้าตอนที่คนกำลังจ้อง */
  entrance: "cubic-bezier(0.23, 1, 0.32, 1)",
  /** การเคลื่อนที่บนจอ เช่น layout ที่เลื่อนหลบ drawer */
  movement: "cubic-bezier(0.32, 0.72, 0, 1)",
  /** สปริงเบา ๆ มี overshoot สำหรับ dock ที่ต้องการความเด้ง */
  emphasized: "cubic-bezier(0.34, 1.56, 0.64, 1)",
} as const;

/**
 * สร้างสตริง `transition` จากรายชื่อ property ที่ระบุชัดเจน
 *
 * จงใจบังคับให้ส่ง property เป็น array เพื่อไม่ให้เผลอเขียน `transition: all`
 * ซึ่งทำให้เบราว์เซอร์เฝ้าดูทุก property รวมถึงตัวที่กระทบ layout และยัง
 * ทำให้การเปลี่ยนธีม (ซึ่งเปลี่ยนสีผ่าน CSS variable) ค่อย ๆ ไล่สีตามไปด้วย
 */
export const transitionOf = (
  properties: string[],
  duration: keyof typeof MOTION_DURATION = "base",
  easing: keyof typeof MOTION_EASING = "standard"
): string =>
  properties
    .map(
      (property) =>
        `${property} ${MOTION_DURATION[duration]}ms ${MOTION_EASING[easing]}`
    )
    .join(", ");

/**
 * ค่า easing แบบ array สำหรับ prop `ease` ของ framer-motion
 *
 * framer รับ cubic-bezier เป็น array ไม่ใช่สตริง CSS จึงต้องมีคู่ขนานกับ
 * `MOTION_EASING` ไว้ ค่าต้องตรงกันเป๊ะเพื่อให้ของที่ทำด้วย CSS กับที่ทำด้วย
 * framer เคลื่อนเป็นจังหวะเดียวกัน
 */
export const MOTION_EASE_ARRAY = {
  entrance: [0.23, 1, 0.32, 1],
  movement: [0.32, 0.72, 0, 1],
} as const;
