iPay

iPay adalah aplikasi dompet digital/payment sederhana dengan arsitektur full-stack yang menggunakan satu backend Laravel dan dua frontend:

Laravel — REST API + database MySQL

React + TypeScript — aplikasi web

Flutter + Dart — aplikasi mobile Android

Backend API dipakai bersama oleh React dan Flutter sehingga fitur dan alur transaksi dapat dibuat konsisten di kedua client.

Daftar Isi

Gambaran Project

Struktur Project

Tech Stack

Fitur

Persyaratan

Instalasi

Konfigurasi Backend

Menjalankan Backend

Menjalankan React

Menjalankan Flutter Android

Menjalankan Semua Sekaligus

Akun Demo

API Endpoint

Alur Pembayaran

QR Payment

React vs Flutter

Troubleshooting

Testing & Verification

Catatan Development

TODO / Improvement

Git Workflow

Gambaran Project

iPay menyediakan fungsi utama dompet digital seperti:

Registrasi dan login

Wallet/saldo

Top Up

Transfer antar pengguna

Payment Request / tagihan

Bayar Tagihan

Bayar Langsung

QR Saya dan Scan QR

Riwayat transaksi

Detail transaksi

Profil dan perubahan PIN

Simulasi sumber pembayaran DANA, GoPay, BCA, dan Saldo iPay

Prinsip arsitektur:

                    ┌─────────────────┐
                    │  Laravel API    │
                    │   Port : 8000   │
                    └────────┬────────┘
                             │
                ┌────────────┴────────────┐
                │                         │
        ┌───────▼────────┐       ┌────────▼───────┐
        │ React Web      │       │ Flutter Android │
        │ Port : 5173    │       │ USB / LAN       │
        └────────────────┘       └─────────────────┘

React dan Flutter menggunakan backend yang sama. React tetap dibuat sebagai web UI, sedangkan Flutter sebagai mobile UI. Fitur dan flow keduanya ditujukan agar tetap sama.

Struktur Project

ipay/
├── backend/                 # Laravel REST API + MySQL integration
├── frontend/                # React + TypeScript web application
├── ipay_flutter/            # Flutter Android application
└── README.md

backend/

Berisi:

Laravel application

Authentication

Wallet

Transactions

Payments

Database migrations/models

API routes

frontend/

Berisi:

React + TypeScript

Web dashboard

Authentication pages

Wallet/payment pages

Transaction history

Profile

QR features

API client

ipay_flutter/

Berisi:

Flutter Android application

Provider state management

GoRouter navigation

Dio API client

Secure token storage

QR generation/scanning

Mobile screens dan reusable widgets

Tech Stack

Backend

PHP

Laravel 12

Laravel Sanctum

MySQL

REST API

React Web

React

TypeScript

Vite

Axios

React Router

CSS

Plus Jakarta Sans

Flutter

Flutter / Dart

Dio

Provider

GoRouter

flutter_secure_storage

mobile_scanner

qr_flutter

intl

google_fonts

Fitur

Authentication

Register

Login

Logout

Login menggunakan email / nomor HP / iPay ID

PIN 6 digit

Get current user

Edit profile

Change PIN

Wallet

Melihat saldo

Menyembunyikan/menampilkan saldo

Top Up

Riwayat Top Up

Payment methods

Simulasi DANA

Simulasi GoPay

Simulasi BCA

Saldo iPay

Transfer

Transfer menggunakan iPay ID

Cek user tujuan

Validasi saldo

Validasi PIN

Pencegahan transfer ke akun sendiri

Detail transaksi

Payment Request / Tagihan

Membuat payment request

Nominal

Deskripsi/catatan

Incoming payment requests

Outgoing payment requests

Status pending/accepted/rejected

Membayar tagihan

Menolak tagihan

Membatalkan request

Bayar Langsung

Flow:

iPay ID
   ↓
Cek User
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
Bukti / hasil transaksi

Bayar Tagihan

Flow:

Daftar Tagihan
   ↓
Pilih Tagihan
   ↓
Detail
   ↓
Pilih Sumber Dana
   ↓
Validasi Saldo
   ↓
PIN
   ↓
Bayar
   ↓
Bukti Pembayaran

QR

My QR

Generate QR berdasarkan iPay ID

Scan QR menggunakan kamera

Fallback input iPay ID secara manual

Lanjut ke flow pembayaran

History

Riwayat transaksi

Filter transaksi

Detail transaksi

Status transaksi

Bukti/receipt

Persyaratan

Pastikan environment development memiliki:

Git

PHP

Composer

MySQL

Node.js + npm

Flutter SDK

Android SDK

ADB untuk testing menggunakan HP Android

Untuk Flutter Android melalui USB, USB Debugging harus aktif dan device harus muncul pada:

adb devices

Instalasi

Clone repository:

git clone https://github.com/khusaery01/iPay.git
cd iPay

Konfigurasi Backend

Masuk ke backend:

cd backend

Install dependency:

composer install

Buat file environment dari .env.example jika diperlukan:

cp .env.example .env

Pada Windows PowerShell dapat menggunakan:

Copy-Item .env.example .env

Generate application key:

php artisan key:generate

Atur koneksi MySQL pada .env.

Contoh:

DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=ipay_db
DB_USERNAME=root
DB_PASSWORD=

Jalankan migration/seeder sesuai kondisi database/project yang digunakan.

Jangan memasukkan password database, token, atau secret production ke repository.

Menjalankan Backend

Dari folder backend:

php artisan serve --host=0.0.0.0 --port=8000

Backend/API berjalan pada:

http://127.0.0.1:8000

API:

http://127.0.0.1:8000/api

Port 8000 digunakan oleh Laravel.

Menjalankan React

Buka terminal baru:

cd frontend
npm install

Jalankan development server:

npm run dev -- --host 0.0.0.0 --port=5173

React berjalan pada:

http://localhost:5173

atau dari komputer lain di jaringan:

http://IP-KOMPUTER:5173

Penting

Jangan menjalankan React pada port 8000, karena port 8000 digunakan Laravel.

Laravel = 8000
React   = 5173

Konfigurasi API React menggunakan environment variable lokal seperti:

VITE_API_URL=http://IP-KOMPUTER:8000/api

File environment lokal seperti frontend/.env jangan di-commit jika memang berisi konfigurasi lokal.

Menjalankan Flutter Android

Masuk ke project Flutter:

cd ipay_flutter
flutter pub get

Cek device:

adb devices

Jika HP terdeteksi, aktifkan reverse port:

adb reverse tcp:8000 tcp:8000

Kemudian jalankan:

flutter run

Flutter melalui USB + ADB Reverse

Untuk mode USB, Flutter dapat diarahkan ke:

http://127.0.0.1:8000/api

adb reverse membuat port 8000 pada Android diteruskan ke port 8000 pada komputer development.

Cek reverse port:

adb reverse --list

Menjalankan Semua Sekaligus

Terminal 1 — Laravel

cd D:\project\ipay\backend
php artisan serve --host=0.0.0.0 --port=8000

Terminal 2 — React

cd D:\project\ipay\frontend
npm run dev -- --host 0.0.0.0 --port=5173

Terminal 3 — Flutter

Jika menggunakan HP Android melalui USB:

cd D:\project\ipay\ipay_flutter
adb devices
adb reverse tcp:8000 tcp:8000
flutter run

Jadi workflow development utama:

Laravel  → :8000
React    → :5173
Flutter  → HP Android

Akun Demo

Akun development/demo yang digunakan pada project:

User

Email

iPay ID

PIN

Yanuar

yanuar@ipay.test

IPY0000001

123456

Budi

budi@ipay.test

IPY0000002

123456

Citra

citra@ipay.test

IPY0000003

123456

Akun di atas digunakan untuk development/testing. Jangan gunakan kredensial demo untuk production.

API Endpoint

Semua endpoint berada di bawah prefix:

/api

Authentication

POST /api/auth/login
POST /api/auth/register
POST /api/auth/logout
GET  /api/auth/me
PUT  /api/auth/profile
PUT  /api/auth/pin

Wallet

GET  /api/wallet
POST /api/wallet/topup
GET  /api/wallet/topup/history
GET  /api/wallet/methods

Transactions

GET  /api/transactions
POST /api/transactions/transfer
GET  /api/transactions/check-user/{ipay_id}
GET  /api/transactions/{code}

Payments

POST /api/payments/request
GET  /api/payments/incoming
GET  /api/payments/outgoing
POST /api/payments/{id}/pay
POST /api/payments/pay-direct
POST /api/payments/{id}/reject
POST /api/payments/{id}/cancel

Endpoint protected menggunakan autentikasi Bearer Token sesuai implementasi API.

Alur Pembayaran

Pay Direct

Pay Direct digunakan untuk melakukan pembayaran langsung ke user berdasarkan iPay ID.

Masukkan iPay ID
       ↓
Check User
       ↓
Masukkan nominal
       ↓
Masukkan deskripsi
       ↓
Pilih sumber dana
       ↓
PIN 6 digit
       ↓
POST /api/payments/pay-direct
       ↓
Transaksi berhasil

Pay Bills

Bayar Tagihan menggunakan payment request yang masuk:

GET /api/payments/incoming
       ↓
Pilih tagihan
       ↓
Lihat detail
       ↓
Validasi saldo
       ↓
Pilih sumber dana
       ↓
PIN
       ↓
POST /api/payments/{id}/pay
       ↓
Saldo dan status transaksi diperbarui

Request Payment

Pilih user yang diminta membayar
       ↓
Masukkan nominal
       ↓
Masukkan deskripsi/catatan
       ↓
POST /api/payments/request
       ↓
Payment request dibuat

QR Payment

QR iPay digunakan untuk merepresentasikan iPay ID.

Flutter menyediakan:

QR Saya

Scan QR menggunakan kamera

Input iPay ID manual sebagai fallback

QR kemudian dapat diteruskan ke flow pembayaran yang sesuai.

React vs Flutter

Kedua frontend menggunakan backend API yang sama.

Flutter

Flutter merupakan frontend mobile Android:

mobile-first

navigation khusus mobile

bottom navigation

dialog/screen mobile

QR camera scanning

layout yang disesuaikan dengan layar HP

React

React merupakan frontend web:

web-first

desktop/laptop friendly

responsive

sidebar/navbar web

card/table/form yang sesuai dengan website

responsive untuk ukuran layar lebih kecil

Prinsip penting

Fitur dan flow harus sama, tetapi tampilan tidak harus sama.

Flutter
= Mobile UI + fitur lengkap

React
= Web UI + fitur lengkap

React tidak perlu dibuat seperti aplikasi Flutter. React harus tetap terasa sebagai website modern.

Troubleshooting

Laravel tidak dapat dijalankan

Pastikan port 8000 tidak sedang digunakan.

Jalankan:

php artisan serve --host=0.0.0.0 --port=8000

React tidak dapat mengakses API

Periksa:

Laravel sedang berjalan.

API berada di port 8000.

VITE_API_URL menunjuk ke URL API yang benar.

CORS Laravel mengizinkan origin React.

Browser tidak sedang menggunakan konfigurasi environment lama.

Setelah mengubah environment, restart Vite.

Flutter HP tidak dapat login

Periksa:

adb devices

Pastikan HP muncul sebagai device.

Kemudian:

adb reverse tcp:8000 tcp:8000

Cek:

adb reverse --list

Pastikan Flutter menggunakan API:

http://127.0.0.1:8000/api

Kemudian jalankan kembali:

flutter run

Port React dan Laravel bentrok

Gunakan:

Laravel = 8000
React   = 5173

Jangan menjalankan React menggunakan port 8000.

Database tidak tersambung

Periksa .env Laravel:

DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=ipay_db
DB_USERNAME=root
DB_PASSWORD=

Pastikan MySQL aktif dan database tersedia.

Testing & Verification

React

Build production:

cd frontend
npm run build

Flutter

Analisis project:

cd ipay_flutter
flutter analyze

Jalankan test:

flutter test

Build APK debug:

flutter build apk --debug

APK debug akan berada di:

ipay_flutter/build/app/outputs/flutter-apk/app-debug.apk

Device Android

Cek device:

adb devices

Cek reverse:

adb reverse --list

Catatan Development

Backend adalah sumber API bersama

Jangan membuat logic transaksi berbeda antara React dan Flutter jika backend sudah menyediakan endpoint yang sama.

Jika API contract berubah:

Backend
   ↓
React harus disesuaikan
Flutter harus disesuaikan

Environment

Jangan commit file environment lokal yang mengandung konfigurasi sensitif.

Contoh:

frontend/.env

Pastikan file tersebut tetap sesuai .gitignore project.

PIN dan Token

Jangan menyimpan:

password production

token production

secret key

credential database production

di source code atau README.

TODO / Improvement

Project sudah memiliki fitur utama, tetapi UI React masih dapat dirapikan.

Checklist improvement:

React UI

Rapikan Dashboard spacing dan ukuran card.

Rapikan Sidebar/Navbar.

Konsistensikan active navigation.

Rapikan halaman Bayar Tagihan.

Rapikan card/list tagihan.

Rapikan halaman Bayar Langsung.

Rapikan form Top Up.

Rapikan halaman History.

Rapikan tabel dan filter History.

Rapikan Profile.

Konsistensikan border radius.

Konsistensikan spacing.

Konsistensikan typography.

Konsistensikan status badge.

Rapikan loading state.

Rapikan empty state.

Rapikan error state.

Rapikan dialog/modal PIN.

Pastikan responsive pada desktop, tablet, dan mobile web.

Prinsip UI

React tidak perlu dibuat identik dengan Flutter.

Yang harus identik:

fitur

data

flow

validasi

hasil transaksi

Yang boleh berbeda:

layout

navigation

card arrangement

tabel

sidebar

modal/drawer

responsive behavior

Git Workflow

Cek perubahan:

git status

Tambahkan source code:

git add backend frontend ipay_flutter README.md

Periksa staged files:

git status

Commit:

git commit -m "Update iPay project"

Push:

git push origin main

Penting

Jangan menambahkan file lokal yang berisi credential atau environment rahasia.

Contoh:

frontend/.env

Repository

GitHub:

https://github.com/khusaery01/iPay

Status Project

iPay saat ini terdiri dari:

Bagian

Status

Laravel API

Implemented

MySQL

Implemented

Authentication

Implemented

Wallet

Implemented

Top Up

Implemented

Transfer

Implemented

Payment Request

Implemented

Pay Bills

Implemented

Pay Direct

Implemented

QR

Implemented

Transaction History

Implemented

Flutter Android

Implemented

React Web

Implemented

React UI polishing

Ongoing

Development Philosophy

iPay menggunakan satu backend dengan dua client:

                    iPay API
                       │
             ┌─────────┴─────────┐
             │                   │
          React                Flutter
           Web                 Android

Satu backend, dua pengalaman pengguna.

Flutter berfokus pada pengalaman mobile.

React berfokus pada pengalaman web.

Keduanya tetap menggunakan data, endpoint, dan business flow iPay yang sama.
