Buatkan aplikasi web SPMB (Sistem Penerimaan Murid Baru) untuk:



NAMA SEKOLAH:

SMP NEGERI 1 SEGAH



Teknologi yang WAJIB digunakan:

\- Frontend: HTML5

\- Styling: CSS3

\- Interaksi: JavaScript Vanilla

\- Backend: Google Apps Script

\- Database: Google Sheets

\- Tidak menggunakan framework berat seperti React, Vue, Laravel, Node.js, atau PHP.

\- Aplikasi harus dapat di-host menggunakan GitHub Pages/hosting HTML biasa, sedangkan Google Apps Script digunakan sebagai API untuk membaca dan menyimpan data ke Google Sheets.



==================================================

1\. KONSEP APLIKASI

==================================================



Buat aplikasi SPMB yang modern, responsif, profesional, sederhana digunakan oleh calon murid/orang tua dan admin sekolah.



Tema:

\- Identitas sekolah: SMP Negeri 1 Segah

\- Nuansa pendidikan yang profesional

\- Tampilan modern dan bersih

\- Responsive untuk HP, tablet, dan desktop

\- Gunakan Bahasa Indonesia

\- Gunakan font yang mudah dibaca

\- Gunakan ikon seperlunya

\- Navigasi mobile menggunakan hamburger menu

\- Gunakan card, modal, alert, badge, tabel, dan pagination yang modern



Header menampilkan:

"SMP NEGERI 1 SEGAH"

"SPMB - Sistem Penerimaan Murid Baru"



Tambahkan logo sekolah dalam bentuk placeholder yang dapat diganti melalui konfigurasi.



==================================================

2\. HALAMAN PUBLIK

==================================================



Buat halaman utama dengan menu:



1\. Beranda

2\. Informasi SPMB

3\. Persyaratan

4\. Jadwal

5\. Alur Pendaftaran

6\. Pengumuman

7\. Cek Status Pendaftaran

8\. Login Admin



Hero section:



"SPMB SMP NEGERI 1 SEGAH"



Subjudul:

"Selamat Datang di Sistem Penerimaan Murid Baru"



Tombol:

\- "Daftar Sekarang"

\- "Cek Status Pendaftaran"



Tambahkan informasi singkat:

\- Pendaftaran

\- Verifikasi

\- Seleksi

\- Pengumuman

\- Daftar Ulang



==================================================

3\. PENDAFTARAN ONLINE

==================================================



Buat formulir pendaftaran calon murid baru dengan beberapa bagian.



A. DATA CALON MURID



Field:

\- Nomor Pendaftaran (otomatis)

\- NISN

\- NIK

\- Nama Lengkap

\- Nama Panggilan

\- Jenis Kelamin

\- Tempat Lahir

\- Tanggal Lahir

\- Agama

\- Nomor KK

\- Anak ke

\- Jumlah Saudara

\- Status Anak

\- Alamat Lengkap

\- RT

\- RW

\- Desa/Kelurahan

\- Kecamatan

\- Kabupaten

\- Provinsi

\- Kode Pos

\- Nomor HP

\- Email



B. DATA ASAL SEKOLAH



Field:

\- Nama SD/MI

\- NPSN Sekolah Asal

\- Nomor Peserta Ujian/Asesmen jika ada

\- Tahun Lulus

\- Alamat Sekolah Asal



C. DATA ORANG TUA / WALI



Ayah:

\- NIK Ayah

\- Nama Ayah

\- Tempat Lahir

\- Tanggal Lahir

\- Pendidikan

\- Pekerjaan

\- Penghasilan

\- Nomor HP



Ibu:

\- NIK Ibu

\- Nama Ibu

\- Tempat Lahir

\- Tanggal Lahir

\- Pendidikan

\- Pekerjaan

\- Penghasilan

\- Nomor HP



Wali:

\- Nama Wali

\- Hubungan dengan Murid

\- Pekerjaan

\- Nomor HP



D. DATA PRESTASI



Berikan pilihan:

\- Tidak ada

\- Akademik

\- Non Akademik



Jika ada prestasi:

\- Jenis Prestasi

\- Tingkat Prestasi

\- Nama Prestasi

\- Tahun

\- Penyelenggara

\- Keterangan



E. DATA JALUR PENDAFTARAN



Pilihan jalur:

\- Domisili

\- Afirmasi

\- Prestasi

\- Mutasi



Jalur harus dapat dikonfigurasi oleh admin.



F. DOKUMEN



Sediakan input untuk:

\- Kartu Keluarga

\- Akta Kelahiran

\- Ijazah/SKHUN/Surat Keterangan Lulus

\- Dokumen pendukung lainnya



Karena Google Sheets tidak cocok menyimpan file secara langsung, gunakan Google Drive melalui Google Apps Script.



File disimpan di folder Google Drive yang ID folder-nya dapat dikonfigurasi.



Simpan URL file ke Google Sheets.



==================================================

4\. VALIDASI FORM

==================================================



Gunakan JavaScript untuk validasi:



\- Field wajib harus diisi

\- NIK harus 16 digit

\- NISN harus 10 digit jika digunakan

\- Nomor HP harus valid

\- Email harus valid

\- Tanggal lahir harus valid

\- File harus memiliki ekstensi yang diperbolehkan

\- Batasi ukuran file

\- Tampilkan pesan error yang jelas

\- Jangan submit jika terdapat kesalahan



Gunakan validasi client-side dan server-side.



==================================================

5\. NOMOR PENDAFTARAN OTOMATIS

==================================================



Buat nomor pendaftaran otomatis.



Format contoh:



SPMB-2026-0001

SPMB-2026-0002

SPMB-2026-0003



Nomor harus dibuat oleh Google Apps Script agar tidak terjadi duplikasi ketika banyak pengguna melakukan pendaftaran bersamaan.



Gunakan LockService pada Google Apps Script untuk mencegah nomor pendaftaran ganda.



==================================================

6\. GOOGLE SHEETS SEBAGAI DATABASE

==================================================



Buat struktur Google Spreadsheet sebagai berikut:



SHEET:

"PELAKSANAAN"



Kolom:

\- ID

\- Tahun

\- Nama Sekolah

\- Status Pendaftaran

\- Tanggal Mulai

\- Tanggal Selesai

\- Kuota

\- Jalur

\- Pengumuman

\- Keterangan



SHEET:

"PENDAFTAR"



Kolom minimal:



\- ID

\- Nomor Pendaftaran

\- Timestamp

\- Tahun

\- NISN

\- NIK

\- Nama Lengkap

\- Nama Panggilan

\- Jenis Kelamin

\- Tempat Lahir

\- Tanggal Lahir

\- Agama

\- Nomor KK

\- Alamat

\- RT

\- RW

\- Desa

\- Kecamatan

\- Kabupaten

\- Provinsi

\- Kode Pos

\- No HP

\- Email

\- Nama SD/MI

\- NPSN Sekolah Asal

\- Tahun Lulus

\- Jalur

\- Status Verifikasi

\- Status Seleksi

\- Status Kelulusan

\- Catatan Admin

\- Tanggal Update



SHEET:

"ORANG\_TUA"



Kolom:

\- ID

\- Nomor Pendaftaran

\- NIK Ayah

\- Nama Ayah

\- Pendidikan Ayah

\- Pekerjaan Ayah

\- Penghasilan Ayah

\- HP Ayah

\- NIK Ibu

\- Nama Ibu

\- Pendidikan Ibu

\- Pekerjaan Ibu

\- Penghasilan Ibu

\- HP Ibu

\- Nama Wali

\- Hubungan Wali

\- Pekerjaan Wali

\- HP Wali



SHEET:

"PRESTASI"



Kolom:

\- ID

\- Nomor Pendaftaran

\- Jenis Prestasi

\- Tingkat

\- Nama Prestasi

\- Tahun

\- Penyelenggara

\- Keterangan



SHEET:

"DOKUMEN"



Kolom:

\- ID

\- Nomor Pendaftaran

\- KK

\- Akta

\- Ijazah/SKL

\- Dokumen Lain

\- Timestamp



SHEET:

"PENGUMUMAN"



Kolom:

\- ID

\- Judul

\- Isi

\- Tanggal

\- Status

\- Link



SHEET:

"ADMIN"



Kolom:

\- ID

\- Username

\- Password

\- Nama

\- Role

\- Status



Jangan menyimpan password admin dalam bentuk plaintext jika memungkinkan. Gunakan hashing/token/session yang aman sesuai kemampuan Google Apps Script.



==================================================

7\. GOOGLE APPS SCRIPT API

==================================================



Buat kode Google Apps Script lengkap.



File:



Code.gs



dan file HTML frontend jika diperlukan.



API harus mendukung:



GET:

\- mendapatkan konfigurasi SPMB

\- mendapatkan daftar pengumuman

\- cek status pendaftaran

\- mendapatkan statistik publik



POST:

\- menyimpan pendaftaran

\- upload dokumen

\- update data

\- login admin

\- update status pendaftaran

\- membuat pengumuman



Gunakan:



doGet(e)

doPost(e)



Response API harus menggunakan JSON.



Contoh:



{

&#x20; "success": true,

&#x20; "message": "Pendaftaran berhasil",

&#x20; "data": {}

}



Jika gagal:



{

&#x20; "success": false,

&#x20; "message": "Terjadi kesalahan"

}



==================================================

8\. KEAMANAN API

==================================================



Implementasikan keamanan dasar:



\- Validasi semua input di server

\- Jangan percaya validasi JavaScript saja

\- Gunakan LockService

\- Batasi request yang tidak valid

\- Jangan mengembalikan seluruh data siswa ke publik

\- Endpoint cek status hanya boleh mengembalikan data berdasarkan nomor pendaftaran + identitas verifikasi

\- Jangan tampilkan NIK lengkap di halaman publik

\- Jangan tampilkan data pribadi siswa pada pengumuman publik

\- Pisahkan data publik dan data admin

\- Gunakan token/session untuk admin

\- Jangan menaruh Spreadsheet ID, API secret, atau credential sensitif di frontend

\- Simpan konfigurasi sensitif menggunakan PropertiesService



Gunakan:

PropertiesService

LockService

Utilities

SpreadsheetApp

DriveApp



==================================================

9\. CEK STATUS PENDAFTARAN

==================================================



Buat halaman:



"Cek Status Pendaftaran"



Input:

\- Nomor Pendaftaran

\- NISN atau tanggal lahir sebagai verifikasi



Setelah berhasil:



Tampilkan:

\- Nomor Pendaftaran

\- Nama Calon Murid

\- Jalur

\- Status Verifikasi

\- Status Seleksi

\- Status Kelulusan

\- Catatan

\- Waktu update terakhir



Gunakan badge warna:



Menunggu

Terverifikasi

Perlu Perbaikan

Lulus

Tidak Lulus



Jangan menampilkan data sensitif.



==================================================

10\. CETAK BUKTI PENDAFTARAN

==================================================



Setelah pendaftaran berhasil, tampilkan:



"Bukti Pendaftaran"



Isi:

\- Logo sekolah

\- SMP Negeri 1 Segah

\- SPMB

\- Nomor Pendaftaran

\- Nama Calon Murid

\- NISN

\- Jalur

\- Tanggal Pendaftaran

\- QR Code



QR Code berisi URL untuk cek status pendaftaran.



Sediakan tombol:

"Cetak Bukti Pendaftaran"



Gunakan CSS print sehingga hasil cetak rapi pada kertas A4.



==================================================

11\. DASHBOARD ADMIN

==================================================



Buat halaman login admin.



Setelah login, tampilkan dashboard:



Statistik card:



\- Total Pendaftar

\- Menunggu Verifikasi

\- Terverifikasi

\- Lulus

\- Tidak Lulus

\- Kuota

\- Sisa Kuota



Dashboard memiliki grafik:

\- Jumlah pendaftar per jalur

\- Jumlah pendaftar per jenis kelamin

\- Statistik status pendaftaran



Gunakan Chart.js jika diperlukan.



==================================================

12\. MENU ADMIN

==================================================



Sidebar:



Dashboard



Data Pendaftar

\- Semua Pendaftar

\- Menunggu Verifikasi

\- Terverifikasi

\- Perlu Perbaikan

\- Lulus

\- Tidak Lulus



Seleksi

\- Kelola Jalur

\- Kelola Kuota

\- Proses Seleksi

\- Penetapan Kelulusan



Dokumen

\- Verifikasi Dokumen



Pengumuman

\- Tambah Pengumuman

\- Edit Pengumuman

\- Hapus Pengumuman



Pengaturan

\- Tahun SPMB

\- Jadwal

\- Kuota

\- Persyaratan

\- Informasi Sekolah



Laporan

\- Rekap Pendaftar

\- Rekap Jalur

\- Rekap Kelulusan

\- Export Excel/CSV

\- Cetak Laporan



Logout



==================================================

13\. TABEL DATA PENDAFTAR

==================================================



Tampilkan tabel:



No

Nomor Pendaftaran

Nama

NISN

Jenis Kelamin

Asal Sekolah

Jalur

Status Verifikasi

Status Seleksi

Status Kelulusan

Aksi



Aksi:

\- Detail

\- Edit

\- Verifikasi

\- Tolak/Perlu Perbaikan

\- Lulus

\- Tidak Lulus

\- Cetak

\- Lihat Dokumen



Tambahkan:

\- Search

\- Filter jalur

\- Filter status

\- Filter jenis kelamin

\- Pagination

\- Sorting

\- Export CSV



==================================================

14\. VERIFIKASI DOKUMEN

==================================================



Admin dapat melihat dokumen calon murid.



Status dokumen:

\- Belum Diverifikasi

\- Valid

\- Tidak Valid

\- Perlu Perbaikan



Admin dapat memberikan catatan.



Contoh:

"Scan KK kurang jelas, silakan upload ulang."



Ketika dokumen tidak valid, calon murid dapat melihat catatan saat mengecek status.



==================================================

15\. PROSES SELEKSI

==================================================



Buat modul seleksi yang fleksibel.



Admin dapat mengatur:



\- Kuota total

\- Kuota per jalur

\- Bobot nilai/prestasi jika diperlukan

\- Prioritas seleksi



Sediakan mode:



1\. Seleksi Manual

2\. Seleksi berdasarkan ranking



Jika menggunakan ranking, buat konfigurasi kriteria.



Contoh:



Nilai Rapor

Prestasi

Jarak/Domisili

Afirmasi

Kriteria lain



Jangan menetapkan aturan seleksi sekolah secara hard-code. Semua aturan harus mudah diubah admin.



==================================================

16\. PENGUMUMAN KELULUSAN

==================================================



Buat halaman pengumuman.



Admin dapat menentukan:

\- Tanggal pengumuman

\- Status pengumuman

\- Judul

\- Isi



Untuk siswa:



Input:

Nomor Pendaftaran



Hasil:

Nama

Nomor Pendaftaran

Status:



"LULUS"



atau



"TIDAK LULUS"



Jika LULUS:

"Selamat, Anda dinyatakan LULUS sebagai murid baru SMP Negeri 1 Segah."



Jika tidak lulus:

"Terima kasih telah mengikuti proses SPMB SMP Negeri 1 Segah."



==================================================

17\. IMPORT DATA

==================================================



Buat fitur admin:



"Import Data"



Dapat import:

\- CSV

\- Excel jika memungkinkan melalui konversi

\- Data calon murid

\- Data nilai rapor



Minimal dukung CSV dengan format template.



Sediakan tombol:



"Download Template Import"



Template memiliki header yang sesuai dengan struktur database.



Saat import:

\- Validasi kolom

\- Cek data duplikat

\- Tampilkan jumlah berhasil

\- Tampilkan jumlah gagal

\- Tampilkan alasan data gagal

\- Jangan menghapus data lama secara otomatis



==================================================

18\. TEMPLATE NILAI RAPOR

==================================================



Tambahkan fitur:



"Import Nilai Rapor"



Google Sheet:



SHEET "NILAI\_RAPOR"



Kolom:



\- ID

\- Nomor Pendaftaran

\- NISN

\- Nama

\- Semester

\- Mata Pelajaran

\- Nilai

\- Tahun Pelajaran



Buat template CSV:



Nomor Pendaftaran,NISN,Nama,Semester,Mata Pelajaran,Nilai,Tahun Pelajaran



Admin dapat upload CSV nilai rapor.



Validasi:

\- Nilai harus angka

\- Nilai minimum 0

\- Nilai maksimum 100

\- Nomor pendaftaran harus sudah terdaftar



Buat rekap nilai rapor per siswa.



==================================================

19\. EXPORT DATA

==================================================



Admin dapat:

\- Export CSV

\- Cetak tabel

\- Rekap berdasarkan jalur

\- Rekap berdasarkan status

\- Rekap berdasarkan jenis kelamin

\- Rekap berdasarkan sekolah asal



Jika memungkinkan, sediakan export ke Excel melalui format CSV yang kompatibel dengan Excel.



==================================================

20\. KONFIGURASI GOOGLE SHEETS

==================================================



Buat bagian konfigurasi:



const CONFIG = {

&#x20; SPREADSHEET\_ID: "ISI\_ID\_GOOGLE\_SHEET",

&#x20; DRIVE\_FOLDER\_ID: "ISI\_ID\_FOLDER\_GOOGLE\_DRIVE",

&#x20; WEB\_APP\_URL: "ISI\_URL\_GOOGLE\_APPS\_SCRIPT"

};



Namun:



SPREADSHEET\_ID dan DRIVE\_FOLDER\_ID tidak boleh dikirim ke browser/frontend.



Untuk frontend hanya gunakan:



const API\_URL = "ISI\_URL\_WEB\_APP\_GOOGLE\_APPS\_SCRIPT";



Konfigurasi sensitif berada di Google Apps Script PropertiesService.



==================================================

21\. STRUKTUR FILE

==================================================



Buat struktur project:



/spmb-smpn1-segah

│

├── index.html

├── pendaftaran.html

├── cek-status.html

├── pengumuman.html

├── login.html

├── admin.html

│

├── css/

│   ├── style.css

│   ├── responsive.css

│   └── admin.css

│

├── js/

│   ├── config.js

│   ├── api.js

│   ├── main.js

│   ├── pendaftaran.js

│   ├── cek-status.js

│   ├── pengumuman.js

│   └── admin.js

│

└── google-apps-script/

&#x20;   ├── Code.gs

&#x20;   ├── Config.gs

&#x20;   ├── Database.gs

&#x20;   ├── Auth.gs

&#x20;   ├── Pendaftaran.gs

&#x20;   ├── Dokumen.gs

&#x20;   ├── Seleksi.gs

&#x20;   └── Utils.gs



Jika struktur terlalu kompleks untuk contoh awal, buat versi sederhana terlebih dahulu, tetapi tetap pisahkan frontend dan backend dengan jelas.



==================================================

22\. USER EXPERIENCE

==================================================



Gunakan:



\- Loading spinner

\- Toast notification

\- Modal konfirmasi

\- Confirmation sebelum menghapus data

\- Empty state

\- Error state

\- Success state

\- Skeleton/loading saat mengambil data

\- Responsive table

\- Mobile friendly

\- Form multi-step/wizard



Form pendaftaran sebaiknya menggunakan wizard:



Step 1:

Data Calon Murid



Step 2:

Data Orang Tua



Step 3:

Asal Sekolah



Step 4:

Prestasi



Step 5:

Dokumen



Step 6:

Review Data



Step 7:

Submit



Tampilkan progress bar.



==================================================

23\. DATABASE HELPER

==================================================



Buat fungsi Google Apps Script seperti:



getSheet(sheetName)

generateRegistrationNumber()

saveRegistration(data)

saveParent(data)

saveAchievement(data)

saveDocument(data)

getRegistrationByNumber(number)

updateRegistrationStatus(id, status)

getPublicAnnouncement()

getDashboardStatistics()

getApplicants(filters)

verifyDocument()

uploadFile()

checkDuplicate()

validateData()



Semua fungsi harus diberi komentar penjelasan.



==================================================

24\. RESPONSE API

==================================================



Semua response Google Apps Script harus konsisten:



{

&#x20; "success": true,

&#x20; "message": "Data berhasil diproses",

&#x20; "data": {},

&#x20; "timestamp": "..."

}



Error:



{

&#x20; "success": false,

&#x20; "message": "Data tidak valid",

&#x20; "errors": \[]

}



==================================================

25\. GOOGLE APPS SCRIPT DEPLOYMENT

==================================================



Berikan panduan lengkap:



1\. Membuat Google Spreadsheet

2\. Membuat sheet sesuai struktur

3\. Membuka Extensions > Apps Script

4\. Memasukkan Code.gs

5\. Mengatur Script Properties

6\. Membuat folder Google Drive

7\. Mengatur ID folder

8\. Deploy sebagai Web App

9\. Pilih Execute as: Me

10\. Atur akses sesuai kebutuhan

11\. Salin URL Web App

12\. Masukkan URL ke frontend

13\. Test API

14\. Test pendaftaran

15\. Test upload dokumen

16\. Test dashboard admin



==================================================

26\. INITIALIZATION DATABASE

==================================================



Buat fungsi:



setupDatabase()



Fungsi ini otomatis membuat semua sheet yang diperlukan apabila belum ada.



Contoh:



setupDatabase()



akan membuat:



PELAKSANAAN

PENDAFTAR

ORANG\_TUA

PRESTASI

DOKUMEN

NILAI\_RAPOR

PENGUMUMAN

ADMIN



serta otomatis membuat header kolomnya.



==================================================

27\. DEMO DATA

==================================================



Sediakan fungsi:



seedDemoData()



untuk membuat beberapa data contoh agar dashboard dapat langsung diuji.



Jangan gunakan data pribadi nyata.



==================================================

28\. KODE HARUS SIAP DIGUNAKAN

==================================================



Jangan hanya memberikan pseudocode.



Berikan kode lengkap yang dapat langsung digunakan.



Untuk setiap file:

\- tampilkan nama file

\- tampilkan isi kode lengkap

\- jelaskan lokasi file

\- jelaskan fungsi file



Pastikan semua nama fungsi konsisten antara frontend dan Google Apps Script.



Jangan menggunakan fungsi yang tidak didefinisikan.



==================================================

29\. KONFIGURASI MUDAH

==================================================



Buat konfigurasi sekolah terpusat:



const SCHOOL\_CONFIG = {

&#x20; name: "SMP Negeri 1 Segah",

&#x20; shortName: "SMPN 1 Segah",

&#x20; title: "SPMB SMP Negeri 1 Segah",

&#x20; year: "2026",

&#x20; address: "Segah, Berau, Kalimantan Timur",

&#x20; phone: "",

&#x20; email: "",

&#x20; website: "",

&#x20; logo: ""

};



Jadikan mudah diubah tanpa harus mengedit banyak file.



==================================================

30\. OUTPUT YANG SAYA INGINKAN

==================================================



Kerjakan secara bertahap:



TAHAP 1

Buat arsitektur sistem dan struktur Google Sheet.



TAHAP 2

Buat Google Apps Script backend lengkap.



TAHAP 3

Buat frontend HTML + CSS + JavaScript.



TAHAP 4

Hubungkan frontend dengan Google Apps Script API.



TAHAP 5

Buat dashboard admin.



TAHAP 6

Buat upload dokumen ke Google Drive.



TAHAP 7

Buat import CSV calon murid dan nilai rapor.



TAHAP 8

Buat pengumuman kelulusan.



TAHAP 9

Buat fitur cetak bukti pendaftaran.



TAHAP 10

Lakukan pengecekan integrasi seluruh sistem.



Setiap tahap harus menghasilkan kode yang dapat langsung diuji.



Prioritaskan:

1\. Keamanan data siswa

2\. Konsistensi database

3\. Kemudahan penggunaan

4\. Responsif

5\. Kemudahan maintenance

6\. Tidak ada data dummy yang terlihat sebagai data nyata

7\. Tidak ada error JavaScript

8\. Semua API harus memiliki error handling



Jika terdapat bagian yang membutuhkan keputusan teknis, gunakan solusi paling sederhana, aman, dan mudah dipelihara untuk sekolah.



