# Contributing to Koom-Mai

ขอบคุณที่สนใจมีส่วนร่วมกับโปรเจกต์นี้! 🎉

## วิธีรายงานบั๊ก (Bug Report)

1. ตรวจสอบ [Issues](https://github.com/krizad/koom-mai/issues) ว่ายังไม่มีใครรายงานปัญหาเดียวกัน
2. เปิด Issue ใหม่และระบุ:
   - ขั้นตอนที่ทำให้เกิดบั๊ก
   - พฤติกรรมที่คาดหวัง vs. ที่เกิดขึ้นจริง
   - Browser/OS ที่ใช้

## วิธีเสนอฟีเจอร์ใหม่

เปิด Issue แล้วใช้ prefix `[Feature]` ในหัวข้อ พร้อมอธิบาย use case ให้ชัดเจน

## การส่ง Pull Request

1. Fork repo และ create branch จาก `main`
2. ชื่อ branch แนะนำ: `feat/your-feature`, `fix/your-bug`
3. ตรวจสอบว่า build ผ่านก่อน PR:

   ```bash
   npm run build
   npm run lint
   ```

4. เขียน commit message ให้สื่อความหมาย (ภาษาไทยหรืออังกฤษก็ได้)
5. เปิด PR และอธิบายสิ่งที่เปลี่ยนแปลง

## การตั้งค่าสภาพแวดล้อม

```bash
git clone https://github.com/krizad/koom-mai.git
cd koom-mai
npm install
npm run dev
```

## Code Style

- ใช้ TypeScript เสมอ — ห้าม `any` โดยไม่จำเป็น
- จัดรูปแบบโค้ดตาม ESLint config ที่มีอยู่แล้ว (`npm run lint`)
- ไม่ต้องเพิ่ม comment ที่อธิบายสิ่งที่โค้ดทำอยู่แล้ว

## License

การส่ง PR ถือว่ายินยอมให้ code ของคุณอยู่ภายใต้ [MIT License](LICENSE) ของโปรเจกต์
