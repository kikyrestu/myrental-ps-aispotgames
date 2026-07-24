# Sistem Manajemen Rental PS — Fase 1 & 2

Implementasi Fase 1 (MVP) + Fase 2 (timer & notifikasi) dari
`implementation_plan.md`. Stack: PHP Native (REST API) + React (Vite) + MySQL.

Backend sudah ditest end-to-end (login, role-based access, siklus sesi,
kalkulasi harga paket & custom duration, transaksi otomatis). Frontend sudah
ditest production build bersih.

## Yang sudah jalan

**Fase 1**
- Login/logout berbasis session (admin & kasir), role-based access control
- CRUD unit + ubah status manual (kosong/dipakai/maintenance)
- Mulai sesi (paket atau durasi custom) dengan proteksi row-lock biar unit
  gak ke-double-booking
- Extend & cancel sesi
- Selesaikan sesi → hitung otomatis (harga paket + kelebihan waktu, atau
  tarif per jam × durasi buat custom) → catat transaksi otomatis
- Halaman log transaksi harian

**Fase 2**
- Dashboard unit dengan polling tiap 4 detik + countdown timer per sesi
  (`SessionTimer.jsx`, update tiap detik di browser, warna berubah:
  biru tenang → kuning <15 menit → merah <5 menit)
- `AlertBanner.jsx` — banner di atas dashboard, list semua sesi yang sisa
  waktunya ≤5 menit atau udah habis (fallback visual kalau speaker mati)
- `useTimerAnnouncement.js` — voice announcement via Web Speech API bawaan
  browser di threshold 15/10/5/1 menit, plus "waktu habis". Toggle
  nyala/mati ada di tombol 🔊 di header dashboard (disimpan di
  `localStorage`, per-device — jadi tiap komputer kasir bisa beda setting)

## Penyesuaian dari plan awal (baca sebelum protes bug 😄)

1. **`rental_ps_schema.sql` didesain ulang** — file yang direfer di plan gak
   ikut ke-upload, jadi skema 13 tabel di `database/rental_ps_schema.sql`
   ini saya desain sendiri berdasarkan deskripsi modul di plan. Cek lagi
   nama kolom/tipe data kalau kalian punya skema lain yang harus dipakai.
2. **`models/Package.php` + `controllers/PackageController.php` ditambah** —
   gak ada di daftar awal, tapi perlu buat baca harga/durasi paket pas mulai
   sesi & buat dropdown di form kasir.
3. **`GET /api/auth/me`** ditambah — dipakai frontend buat cek session yang
   masih aktif pas app pertama dibuka (biar gak logout tiap refresh).
4. **`GET /api/packages`** ditambah — read-only, dipakai `SessionForm`.
5. `helpers/ResponseHelper.php` dan `core/Response.php` dipisah: `Response`
   itu HTTP-level (status + JSON encode), `ResponseHelper` itu convenience
   wrapper (`success()`/`error()`/`validationError()`) yang dipakai di semua
   controller biar bentuk JSON konsisten.
6. **Voice announcement pakai Web Speech API browser**, bukan library
   eksternal — suara keluar dari output audio default OS. Buat ke speaker
   Bluetooth, tinggal pastiin speaker itu jadi default output device di
   komputer/tablet kasir (di level OS, bukan di app ini).
7. `components/dashboard/AlertBanner.jsx` bukan bagian dari daftar folder
   awal di plan, tapi "Alert 5 menit di dashboard" ada di deskripsi Fase 2 —
   jadi saya bikin sebagai komponen baru di folder yang sama.

## Belum dikerjain (nyusul di fase berikutnya, sesuai plan)

- **Fase 3:** kode promo/diskon, shift & kas kasir (`ShiftPanel.jsx`, tabel
  `shifts` udah ada di skema tapi belum ada endpoint/model), kategori
  pengeluaran, laporan harian/bulanan + export
- **Fase 4:** membership & poin, display tablet kedua per unit,
  produk/inventory, audit log lengkap

Semua tabel buat fase-fase itu (promos, members, shifts, expenses, products,
audit_logs, dst) udah ada di skema database, tinggal bikin model/controller/
halaman-nya pas fase-nya jalan.

## Setup

### Database
```bash
mysql -u root -p -e "CREATE DATABASE rental_ps CHARACTER SET utf8mb4"
mysql -u root -p rental_ps < database/rental_ps_schema.sql
```
Login default: `admin` / `admin123` — **ganti passwordnya setelah login pertama.**

### Backend
```bash
cd backend
cp .env.example .env   # sesuaikan DB_HOST/DB_USER/DB_PASS/CORS_ORIGIN
php -S localhost:8000  # dev server, atau arahkan Nginx/Apache ke folder ini
```
Butuh PHP 8.1+ dengan ekstensi `pdo_mysql`.

### Frontend
```bash
cd frontend
cp .env.example .env   # sesuaikan VITE_API_URL kalau backend gak di :8000
npm install
npm run dev             # dev server di :5173
npm run build            # build production ke /dist
```
Voice announcement butuh browser modern (Chrome/Edge/Firefox terbaru) yang
support Web Speech API — semua browser desktop mainstream udah support.

### Deploy (VPS)
Sesuai section 9 di plan: build frontend jadi static file, serve dari Nginx
atau folder `public` backend; backend jalan via PHP-FPM + Nginx (arahkan
semua request ke `index.php`, `.htaccess` udah disiapin buat Apache — kalau
pakai Nginx butuh `try_files $uri $uri/ /index.php?$query_string;` manual).
