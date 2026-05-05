# คุ้มมั้ย (Koom-Mai) — Price Compare

> เว็บแอปเปรียบเทียบราคาต่อหน่วย ตอบคำถาม "ซื้ออันไหนคุ้มกว่า?" — สร้างด้วย Next.js, Tailwind CSS และ deploy บน GitHub Pages ฟรี

**🌐 Live demo: [https://krizad.github.io/koom-mai/](https://krizad.github.io/koom-mai/)**

[![Deploy to GitHub Pages](https://github.com/krizad/koom-mai/actions/workflows/deploy.yml/badge.svg)](https://github.com/krizad/koom-mai/actions/workflows/deploy.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

## ฟีเจอร์

- **เปรียบเทียบราคาต่อหน่วย** — เพิ่มสินค้าได้หลายรายการ ระบบจะคำนวณและไฮไลต์ตัวที่คุ้มที่สุดให้อัตโนมัติ
- **รองรับหลายหน่วยวัด** — น้ำหนัก, ปริมาตร, ความยาว, จำนวนชิ้น พร้อม unit conversion ครบ
- **บอกเปอร์เซ็นต์ประหยัด** — แสดงว่าตัวเลือกที่ดีที่สุดประหยัดได้กี่ % เมื่อเทียบกับตัวแพงสุด
- **บันทึกการเปรียบเทียบ** — save/load ประวัติการเปรียบเทียบในเครื่อง (localStorage)
- **ใช้งานออฟไลน์ได้** — เป็น static site ไม่ต้องพึ่ง backend
- **ภาษาไทย** — UI ทั้งหมดเป็นภาษาไทย

## Tech Stack

| Layer | Technology |
| --- | --- |
| Framework | [Next.js 16](https://nextjs.org/) (App Router, static export) |
| Language | TypeScript |
| Styling | Tailwind CSS v4 |
| Icons | [Lucide React](https://lucide.dev/) |
| Hosting | GitHub Pages |
| CI/CD | GitHub Actions |

## เริ่มใช้งาน (Local Development)

**Prerequisites:** Node.js ≥ 18

```bash
# clone repo
git clone https://github.com/krizad/koom-mai.git
cd koom-mai

# ติดตั้ง dependencies
npm install

# รัน dev server
npm run dev
```

จากนั้นเปิด [http://localhost:3000](http://localhost:3000)

## Build & Preview

```bash
# build เป็น static site
npm run build

# ดูตัวอย่างใน browser (ต้องติดตั้ง serve ก่อน)
npx serve out
```

ไฟล์ที่พร้อม deploy จะอยู่ในโฟลเดอร์ `out/`

## Deploy to GitHub Pages

โปรเจกต์นี้ตั้งค่าสำหรับ GitHub Pages ไว้ครบแล้ว:

- export เป็น static site อัตโนมัติ
- ตั้ง `basePath` / `assetPrefix` ตามชื่อ repo ตอน build บน GitHub Actions
- ปิด Jekyll ให้โฟลเดอร์ `_next` ถูกเสิร์ฟตามปกติ

### ขั้นตอน

1. Fork หรือ push repo ขึ้น GitHub
2. ไปที่ **Settings → Pages**
3. เลือก **Source: GitHub Actions**
4. Push ขึ้น branch `main`

Workflow ใน `.github/workflows/deploy.yml` จะ build และ deploy ให้อัตโนมัติ

## โครงสร้างโปรเจกต์

```text
koom-mai/
├── src/app/
│   ├── page.tsx        # หน้าหลัก (UI + logic ทั้งหมด)
│   ├── layout.tsx      # Root layout
│   └── globals.css     # Global styles
├── public/             # Static assets
├── .github/workflows/
│   └── deploy.yml      # GitHub Actions deploy workflow
├── next.config.js      # Next.js config (static export + basePath)
└── package.json
```

## Contributing

ยินดีรับ PR และ Issue ทุกประเภท! ดูรายละเอียดที่ [CONTRIBUTING.md](CONTRIBUTING.md)

## License

[MIT](LICENSE) © [krizad](https://github.com/krizad)
