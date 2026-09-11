# PANDUAN LENGKAP SETUP & DEPLOYMENT SPMB ONLINE
## SMP NEGERI 1 SEGAH (BERAU, KALIMANTAN TIMUR)

Aplikasi web SPMB ini dibangun dengan arsitektur **Serverless** menggunakan:
- **Frontend**: HTML5, CSS3 Modern, Vanilla JavaScript (ringan, tanpa dependensi framework berat, siap di-host di GitHub Pages / hosting statis).
- **Backend**: Google Apps Script (REST API).
- **Database**: Google Sheets (8 Sheet terintegrasi).
- **Penyimpanan Berkas**: Google Drive (Folder khusus unggah KK, Akta, SKL).

---

## 🚀 PENGUJIAN INSTAN (MODE DEMO / OFFLINE)
Aplikasi ini sudah dilengkapi dengan **Mode Demo Otomatis (LocalStorage Mock Database)**.
Anda dapat langsung menguji seluruh sistem tanpa setup Google Apps Script terlebih dahulu:
1. Buka file `index.html` langsung di browser Anda.
2. Coba lakukan pendaftaran online di `pendaftaran.html`.
3. Cek hasil cetak Bukti Pendaftaran (A4) yang dilengkapi QR Code.
4. Buka `cek-status.html` dan cari pendaftar menggunakan nomor pendaftaran (contoh: `SPMB-2026-0001` dengan NISN `0091234567`).
5. Buka `login.html` dan login admin dengan:
   - **Username**: `admin`
   - **Password**: `admin123`
6. Akses seluruh fitur dashboard admin, verifikasi berkas, grafik pendaftar, seleksi otomatis, dan import/export data CSV.

---

## 🛠️ LANGKAH DEPLOYMENT GOOGLE APPS SCRIPT (PRODUKSI)

Ikuti langkah-langkah mudah di bawah ini untuk menghubungkan aplikasi dengan Google Spreadsheet dan Google Drive sekolah Anda:

### 1. Buat Google Spreadsheet Baru
1. Buka [Google Sheets](https://sheets.new) di akun Google sekolah.
2. Beri nama spreadsheet: `DATABASE SPMB SMPN 1 SEGAH 2026`.
3. Salin **Spreadsheet ID** dari URL browser:
   - Contoh URL: `https://docs.google.com/spreadsheets/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/edit`
   - Spreadsheet ID-nya adalah: `1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms`

### 2. Buat Folder Penyimpanan Dokumen di Google Drive
1. Buka [Google Drive](https://drive.google.com).
2. Buat folder baru dengan nama: `SPMB_SMPN1_SEGAH_DOKUMEN`.
3. Buka folder tersebut dan salin **Folder ID** dari URL:
   - Contoh URL: `https://drive.google.com/drive/folders/1aBcDeFgHiJkLmNoPqRsTuVwXyZ`
   - Folder ID-nya adalah: `1aBcDeFgHiJkLmNoPqRsTuVwXyZ`
4. Klik kanan folder > **Share** (Bagikan) > ubah General Access menjadi **Anyone with the link can view** (Siapa saja yang memiliki link dapat melihat).

### 3. Masukkan Kode ke Google Apps Script
1. Pada Google Spreadsheet yang telah dibuat, klik menu **Extensions (Ekstensi)** > **Apps Script**.
2. Anda dapat memilih salah satu cara berikut:
   - **Cara Mudah (1 File Tunggal)**: Buka file `google-apps-script/Code_AllInOne.gs` pada repositori ini, salin seluruh kodenya, lalu tempelkan ke file `Code.gs` di editor Apps Script.
   - **Cara Modular (File Terpisah)**: Buat file `.gs` di editor Apps Script sesuai dengan file di folder `google-apps-script/`:
     - `Config.gs`
     - `Utils.gs`
     - `Database.gs`
     - `Pendaftaran.gs`
     - `Dokumen.gs`
     - `Auth.gs`
     - `Seleksi.gs`
     - `Pengumuman.gs`
     - `Code.gs`

### 4. Atur Script Properties (Konfigurasi Rahasia)
Untuk menjaga keamanan data agar Spreadsheet ID dan Folder ID tidak bocor ke publik:
1. Di editor Apps Script, klik ikon roda gigi ⚙️ **Project Settings** di bilah kiri.
2. Gulir ke bawah ke bagian **Script Properties (Properti Skrip)**.
3. Klik **Add script property** dan tambahkan properti berikut:
   - `SPREADSHEET_ID` = `[ID Spreadsheet Anda dari langkah 1]`
   - `DRIVE_FOLDER_ID` = `[ID Folder Drive Anda dari langkah 2]`
   - `AUTH_SECRET` = `kunci_rahasia_acak_smpn1segah_2026`
4. Klik **Save script properties**.

### 5. Jalankan Inisialisasi Database
1. Kembali ke editor Apps Script (ikon `< >`).
2. Pada dropdown fungsi di bagian atas, pilih fungsi `setupDatabase`.
3. Klik tombol **Run (Jalankan)**.
4. Google akan meminta izin otorisasi (*Review permissions* > Pilih akun Google Anda > *Advanced* > *Go to ... (unsafe)* > *Allow*).
5. Fungsi `setupDatabase()` akan secara otomatis membuat 8 sheet lengkap dengan header kolom berwarna biru:
   - `PELAKSANAAN`
   - `PENDAFTAR`
   - `ORANG_TUA`
   - `PRESTASI`
   - `DOKUMEN`
   - `NILAI_RAPOR`
   - `PENGUMUMAN`
   - `ADMIN` (dengan akun awal: `admin` / `admin123`)
6. (Opsional) Pilih fungsi `seedDemoData` dan klik **Run** jika ingin mengisi beberapa data contoh awal.

### 6. Deploy sebagai Web App
1. Di pojok kanan atas Apps Script, klik tombol biru **Deploy** > **New deployment**.
2. Klik ikon gerigi di sebelah *Select type* > pilih **Web app**.
3. Isi konfigurasi:
   - **Description**: `API SPMB SMPN 1 Segah v1`
   - **Execute as**: `Me (email Anda)`
   - **Who has access**: `Anyone (Siapa saja)` *(Wajib dipilih agar calon murid dapat mendaftar tanpa login Google)*
4. Klik **Deploy**.
5. Salin **Web app URL** yang dihasilkan (format: `https://script.google.com/macros/s/AKfycb.../exec`).

### 7. Hubungkan URL ke Frontend
1. Buka file `js/config.js` di editor Anda.
2. Masukkan URL Web App ke dalam variabel `API_URL`:
   ```javascript
   const API_URL = "https://script.google.com/macros/s/AKfycb.../exec";
   ```
3. Simpan file `js/config.js`.
4. Sistem sekarang secara otomatis beralih dari Mode Demo ke **Live Production Google Apps Script & Google Sheets**!

---

## 🌐 HOSTING FRONTEND (GITHUB PAGES)

Karena frontend hanya terdiri dari file statis HTML, CSS, dan JavaScript tanpa server backend Node/PHP:
1. Upload/Push folder repositori `spmb` ini ke repositori GitHub Anda.
2. Di repositori GitHub, buka tab **Settings** > **Pages**.
3. Pada bagian **Build and deployment**:
   - **Source**: `Deploy from a branch`
   - **Branch**: `main` (atau `master`) / `root`
4. Klik **Save**.
5. Dalam beberapa menit, situs web Anda akan aktif di: `https://username.github.io/spmb/`.

---

## 📁 STRUKTUR BASIS DATA GOOGLE SPREADSHEET

1. **PELAKSANAAN**: Pengaturan tahun, status buka/tutup, kuota total, dan jadwal.
2. **PENDAFTAR**: ID, Nomor Pendaftaran (SPMB-2026-xxxx), NIK, NISN, Nama Lengkap, Jenis Kelamin, Tanggal Lahir, Alamat, Jalur, Status Verifikasi, Status Seleksi, Status Kelulusan, Catatan Panitia.
3. **ORANG_TUA**: Data Ayah, Ibu, dan Wali murid (pekerjaan, kontak, penghasilan).
4. **PRESTASI**: Piagam kejuaraan akademik & non-akademik, tingkat kejuaraan.
5. **DOKUMEN**: URL file Google Drive untuk KK, Akta Kelahiran, Ijazah/SKL, dan dokumen pendukung.
6. **NILAI_RAPOR**: Nilai rapor per semester per mata pelajaran untuk seleksi ranking.
7. **PENGUMUMAN**: Judul, isi, tanggal, status pengumuman sekolah.
8. **ADMIN**: Username, password terenkripsi SHA-256, nama, dan role.
