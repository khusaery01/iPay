![Laravel](https://img.shields.io/badge/Laravel-12.x-FF2D20?style=for-the-badge&logo=laravel&logoColor=white)
![React](https://img.shields.io/badge/React-TypeScript-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![Flutter](https://img.shields.io/badge/Flutter-3.x-02569B?style=for-the-badge&logo=flutter&logoColor=white)
![MySQL](https://img.shields.io/badge/MySQL-8.0-4479A1?style=for-the-badge&logo=mysql&logoColor=white)
![Sanctum](https://img.shields.io/badge/Laravel-Sanctum-FF2D20?style=for-the-badge&logo=laravel&logoColor=white)

# 💳 iPay — Digital Wallet & Payment System

Aplikasi dompet digital dan payment sederhana berbasis **full-stack** dengan satu Laravel REST API dan dua frontend:

- 🌐 **React + TypeScript** — Web Application
- 📱 **Flutter + Dart** — Android Application
- ⚙️ **Laravel** — REST API + MySQL

React dan Flutter menggunakan backend API yang sama sehingga fitur, data, validasi, dan business flow dapat dibuat konsisten pada kedua platform.

> **One Backend, Two Clients**
>
> React berfokus pada pengalaman web, sedangkan Flutter berfokus pada pengalaman mobile Android.

---

## 📁 Struktur Project

```text
ipay/
├── backend/                    # Laravel REST API + MySQL
│   ├── app/
│   │   ├── Http/
│   │   └── Models/
│   ├── database/
│   │   ├── migrations/
│   │   └── seeders/
│   ├── routes/
│   ├── config/
│   └── ...
│
├── frontend/                   # React + TypeScript Web App
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   └── ...
│   ├── public/
│   ├── package.json
│   └── ...
│
├── ipay_flutter/               # Flutter Android App
│   ├── lib/
│   │   ├── core/
│   │   ├── models/
│   │   ├── providers/
│   │   ├── routes/
│   │   ├── screens/
│   │   ├── services/
│   │   └── widgets/
│   ├── android/
│   ├── test/
│   └── pubspec.yaml
│
├── .gitignore
└── README.md
```

---

## ✨ Fitur

### 🌐 React Web

| Fitur | Deskripsi |
|---|---|
| 🔐 Login & Register | Autentikasi menggunakan email, nomor HP, atau iPay ID |
| 🏠 Dashboard | Melihat saldo dan ringkasan aktivitas |
| 💰 Wallet | Menampilkan dan menyembunyikan saldo |
| 💵 Top Up | Top up menggunakan sumber pembayaran simulasi |
| 💸 Transfer | Transfer saldo menggunakan iPay ID |
| ⚡ Bayar Langsung | Pembayaran langsung ke user berdasarkan iPay ID |
| 🧾 Bayar Tagihan | Membayar payment request yang masuk |
| 📩 Request Payment | Membuat permintaan pembayaran |
| 📱 QR | Generate dan menggunakan QR iPay |
| 📊 History | Riwayat dan detail transaksi |
| 👤 Profile | Edit profile dan perubahan PIN |

### 📱 Flutter Android

| Fitur | Deskripsi |
|---|---|
| 🔐 Login & Register | Autentikasi dengan PIN 6 digit |
| 🏠 Dashboard | Saldo dan quick actions |
| 💰 Wallet | Saldo dan aktivitas wallet |
| 💵 Top Up | Simulasi top up |
| 💸 Transfer | Transfer antar pengguna |
| ⚡ Bayar Langsung | Pembayaran langsung menggunakan iPay ID |
| 🧾 Bayar Tagihan | Pembayaran payment request |
| 📩 Request Payment | Membuat payment request |
| 📱 My QR | Generate QR berdasarkan iPay ID |
| 📷 Scan QR | Scan QR menggunakan kamera |
| 📊 History | Riwayat dan detail transaksi |
| 👤 Profile | Edit profile dan change PIN |

### ⚙️ Backend API

- Authentication menggunakan **Laravel Sanctum**
- User management
- Wallet management
- Top Up
- Transfer
- Payment Request
- Pay Bills
- Pay Direct
- Transaction History
- QR payment support
- PIN validation
- Balance validation
- Transaction validation
- Payment status management

---

## 🛠️ Teknologi

| Layer | Stack |
|---|---|
| 🌐 Web | React, TypeScript, Vite |
| 📱 Mobile | Flutter, Dart |
| ⚙️ Backend | Laravel 12, PHP |
| 🔐 Authentication | Laravel Sanctum |
| 🗄️ Database | MySQL |
| 🌐 HTTP Client | Axios, Dio |
| 🧭 Web Routing | React Router |
| 🧭 Mobile Routing | GoRouter |
| 📦 Mobile State | Provider |
| 🔒 Token Storage | flutter_secure_storage |
| 📷 QR Scanner | mobile_scanner |
| 🔳 QR Generator | qr_flutter |
| 🎨 Typography | Plus Jakarta Sans, Google Fonts |

---

# 🚀 Cara Menjalankan

## Prerequisites

Pastikan sudah terinstall:

- Git
- PHP
- Composer
- MySQL
- Node.js
- npm
- Flutter SDK
- Android SDK
- ADB

Untuk testing Flutter menggunakan HP Android, aktifkan **USB Debugging** terlebih dahulu.

Cek device:

```bash
adb devices
```

---

## 1. Clone Repository

```bash
git clone https://github.com/khusaery01/iPay.git
cd iPay
```

---

## 2. Backend — Laravel

Masuk ke folder backend:

```bash
cd backend
```

Install dependency:

```bash
composer install
```

Buat file environment.

### Windows PowerShell

```powershell
Copy-Item .env.example .env
```

Generate application key:

```bash
php artisan key:generate
```

Atur konfigurasi database pada `.env`:

```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=ipay_db
DB_USERNAME=root
DB_PASSWORD=
```

Jalankan migration/seeder sesuai kondisi database project.

Kemudian jalankan Laravel:

```bash
php artisan serve --host=0.0.0.0 --port=8000
```

Backend API:

```text
http://127.0.0.1:8000/api
```

---

## 3. React Web

Buka terminal baru:

```bash
cd frontend
```

Install dependency:

```bash
npm install
```

Buat file:

```text
frontend/.env
```

Untuk development pada komputer yang sama:

```env
VITE_API_URL=http://localhost:8000/api
```

Untuk akses melalui jaringan LAN:

```env
VITE_API_URL=http://IP-KOMPUTER:8000/api
```

Jalankan React:

```bash
npm run dev -- --host 0.0.0.0 --port=5173
```

React Web:

```text
http://localhost:5173
```

> **Important:** React menggunakan port `5173`, sedangkan Laravel menggunakan port `8000`.

```text
Laravel → :8000
React   → :5173
```

---

## 4. Flutter Android

Masuk ke project Flutter:

```bash
cd ipay_flutter
```

Install packages:

```bash
flutter pub get
```

Cek device:

```bash
adb devices
```

Jika menggunakan HP Android melalui USB:

```bash
adb reverse tcp:8000 tcp:8000
```

Kemudian jalankan:

```bash
flutter run
```

Cek reverse port:

```bash
adb reverse --list
```

Untuk USB + ADB Reverse, API Flutter menggunakan:

```text
http://127.0.0.1:8000/api
```

---

# 🖥️📱 Menjalankan Semua

### Terminal 1 — Laravel

```powershell
cd D:\project\ipay\backend
php artisan serve --host=0.0.0.0 --port=8000
```

### Terminal 2 — React

```powershell
cd D:\project\ipay\frontend
npm run dev -- --host 0.0.0.0 --port=5173
```

### Terminal 3 — Flutter

```powershell
cd D:\project\ipay\ipay_flutter
adb devices
adb reverse tcp:8000 tcp:8000
flutter run
```

Development architecture:

```text
                 ┌────────────────────┐
                 │    Laravel API     │
                 │       :8000        │
                 └─────────┬──────────┘
                           │
              ┌────────────┴────────────┐
              │                         │
       ┌──────▼───────┐         ┌───────▼────────┐
       │  React Web   │         │ Flutter Android │
       │    :5173     │         │   USB / LAN    │
       └──────────────┘         └────────────────┘
```

---

# 🔑 Akun Demo

Akun development/testing:

| User | Email | iPay ID | PIN |
|---|---|---|---|
| Yanuar | `yanuar@ipay.test` | `IPY0000001` | `123456` |
| Budi | `budi@ipay.test` | `IPY0000002` | `123456` |
| Citra | `citra@ipay.test` | `IPY0000003` | `123456` |

> Akun tersebut digunakan untuk development/testing dan tidak ditujukan untuk production.

---

# 🔌 API Endpoint

Semua endpoint menggunakan prefix:

```text
/api
```

## 🔐 Authentication

| Method | Endpoint |
|---|---|
| POST | `/api/auth/login` |
| POST | `/api/auth/register` |
| POST | `/api/auth/logout` |
| GET | `/api/auth/me` |
| PUT | `/api/auth/profile` |
| PUT | `/api/auth/pin` |

## 💰 Wallet

| Method | Endpoint |
|---|---|
| GET | `/api/wallet` |
| POST | `/api/wallet/topup` |
| GET | `/api/wallet/topup/history` |
| GET | `/api/wallet/methods` |

## 💸 Transactions

| Method | Endpoint |
|---|---|
| GET | `/api/transactions` |
| POST | `/api/transactions/transfer` |
| GET | `/api/transactions/check-user/{ipay_id}` |
| GET | `/api/transactions/{code}` |

## 🧾 Payments

| Method | Endpoint |
|---|---|
| POST | `/api/payments/request` |
| GET | `/api/payments/incoming` |
| GET | `/api/payments/outgoing` |
| POST | `/api/payments/{id}/pay` |
| POST | `/api/payments/pay-direct` |
| POST | `/api/payments/{id}/reject` |
| POST | `/api/payments/{id}/cancel` |

Endpoint yang membutuhkan authentication menggunakan **Bearer Token**.

---

# 💸 Alur Pembayaran

## ⚡ Bayar Langsung

```text
iPay ID
   ↓
Check User
   ↓
Nominal
   ↓
Deskripsi
   ↓
Sumber Dana
   ↓
PIN
   ↓
Pembayaran
   ↓
Transaksi Berhasil
```

Endpoint:

```text
POST /api/payments/pay-direct
```

---

## 🧾 Bayar Tagihan

```text
Daftar Tagihan
      ↓
Pilih Tagihan
      ↓
Detail
      ↓
Validasi Saldo
      ↓
Sumber Dana
      ↓
PIN
      ↓
Bayar
      ↓
Transaksi Berhasil
```

Endpoint:

```text
POST /api/payments/{id}/pay
```

---

## 📩 Request Payment

```text
Pilih User
    ↓
Nominal
    ↓
Deskripsi
    ↓
Request Payment
    ↓
Payment Request Dibuat
```

Endpoint:

```text
POST /api/payments/request
```

---

# 📱 QR Payment

iPay menyediakan fitur QR berdasarkan **iPay ID**.

### Flutter

- My QR
- Generate QR
- Scan QR dengan kamera
- Manual iPay ID fallback

Contoh QR:

```text
ipay://pay?id=IPY0000001&name=Yanuar+Pratama
```

QR dapat digunakan untuk melanjutkan ke flow pembayaran.

---

# 🖥️ React vs 📱 Flutter

Kedua frontend menggunakan backend yang sama, tetapi UI disesuaikan dengan platform.

| React Web | Flutter Android |
|---|---|
| Web-first | Mobile-first |
| Desktop/laptop | Smartphone |
| Sidebar / Navbar | Bottom Navigation |
| Card & Table | Card & List |
| Web Form | Mobile Form |
| Responsive Web | Mobile Layout |
| Browser | Android App |

### Prinsip Utama

**Harus sama:**

- Fitur
- Data
- Flow
- Validasi
- Business logic
- Hasil transaksi

**Boleh berbeda:**

- Layout
- Navigation
- Card arrangement
- Table
- Sidebar
- Modal / Drawer
- Responsive behavior

> React tidak dibuat sebagai copy dari Flutter. React tetap dirancang sebagai **modern web application**.

---

# 🧪 Testing & Verification

## React

Build production:

```bash
cd frontend
npm run build
```

## Flutter

Analyze:

```bash
cd ipay_flutter
flutter analyze
```

Run tests:

```bash
flutter test
```

Build APK:

```bash
flutter build apk --debug
```

APK:

```text
ipay_flutter/build/app/outputs/flutter-apk/app-debug.apk
```

## Android Device

Cek device:

```bash
adb devices
```

Cek reverse port:

```bash
adb reverse --list
```

---

# 🐛 Troubleshooting

### Laravel tidak berjalan

Pastikan port `8000` tidak sedang digunakan.

```bash
php artisan serve --host=0.0.0.0 --port=8000
```

### React tidak dapat mengakses API

Periksa:

- Laravel sudah berjalan
- API menggunakan port `8000`
- `VITE_API_URL` benar
- CORS Laravel mengizinkan origin React
- Restart Vite setelah mengubah `.env`

### Flutter tidak dapat login

Cek:

```bash
adb devices
```

Kemudian:

```bash
adb reverse tcp:8000 tcp:8000
```

Cek:

```bash
adb reverse --list
```

Pastikan API Flutter:

```text
http://127.0.0.1:8000/api
```

### Database tidak tersambung

Periksa `.env` Laravel:

```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=ipay_db
DB_USERNAME=root
DB_PASSWORD=
```

Pastikan MySQL aktif dan database tersedia.

---

# 🔒 Environment & Security

Jangan commit file environment lokal:

```text
frontend/.env
backend/.env
```

Jangan menyimpan di repository:

- Password production
- Token production
- Secret key
- Credential database production

Pastikan konfigurasi lokal tetap berada di `.gitignore`.

---

# 📊 Status Project

| Component | Status |
|---|---|
| Laravel REST API | ✅ Implemented |
| MySQL | ✅ Implemented |
| Authentication | ✅ Implemented |
| Wallet | ✅ Implemented |
| Top Up | ✅ Implemented |
| Transfer | ✅ Implemented |
| Payment Request | ✅ Implemented |
| Pay Bills | ✅ Implemented |
| Pay Direct | ✅ Implemented |
| QR Payment | ✅ Implemented |
| Transaction History | ✅ Implemented |
| Flutter Android | ✅ Implemented |
| React Web | ✅ Implemented |
| React UI Polishing | 🚧 Ongoing |

---

# 🚧 Future Improvements

### React Web

- [ ] Dashboard UI polishing
- [ ] Sidebar/Navbar refinement
- [ ] Consistent spacing
- [ ] Consistent typography
- [ ] History table refinement
- [ ] Payment card refinement
- [ ] Profile UI refinement
- [ ] Loading states
- [ ] Empty states
- [ ] Error states
- [ ] PIN modal refinement
- [ ] Responsive desktop/tablet/mobile web

### General

- [ ] Additional payment methods
- [ ] Production payment gateway integration
- [ ] Additional security hardening
- [ ] More automated tests

---

# 🔀 Git Workflow

Cek perubahan:

```bash
git status
```

Tambahkan perubahan:

```bash
git add backend frontend ipay_flutter README.md
```

Commit:

```bash
git commit -m "Update iPay project"
```

Push:

```bash
git push origin main
```

> Jangan menggunakan `git add .` secara sembarangan jika terdapat file `.env` lokal yang belum masuk `.gitignore`.

---

# 👨‍💻 Author

**Muhammad Yanuar Khusaeri**

iPay dibuat sebagai project pembelajaran dan pengembangan aplikasi **Digital Wallet & Payment System** dengan arsitektur full-stack.

---

## 🔗 Repository

**GitHub:**  
https://github.com/khusaery01/iPay

---

<div align="center">

### 💳 iPay

**One Backend · Two Clients · One Payment Experience**

Laravel REST API · React Web · Flutter Android

</div>
