# Koom-Mai

เว็บแอปเปรียบเทียบราคาต่อหน่วย สร้างด้วย Next.js และ export เป็น static site เพื่อ deploy ขึ้น GitHub Pages ได้โดยตรง

## Local development

รัน dev server:

```bash
npm run dev
```

จากนั้นเปิด [http://localhost:3000](http://localhost:3000)

## Deploy to GitHub Pages

โปรเจกต์นี้ตั้งค่าไว้สำหรับ GitHub Pages แล้ว โดยจะ:

- export เป็น static site อัตโนมัติ
- ตั้ง `basePath`/`assetPrefix` ตามชื่อ repo ตอน build บน GitHub Actions
- ปิด Jekyll เพื่อให้โฟลเดอร์ `_next` ถูกเสิร์ฟตามปกติ

### สิ่งที่ต้องตั้งใน GitHub

1. ไปที่ **Settings → Pages**
2. ที่ **Source** เลือก **GitHub Actions**
3. push ขึ้น branch `main`

workflow ใน `.github/workflows/deploy.yml` จะ build และ deploy ให้อัตโนมัติ

## Production build

ทดสอบ static export ในเครื่องได้ด้วย:

```bash
npm run build
```

ไฟล์ที่พร้อม deploy จะอยู่ในโฟลเดอร์ `out/`
