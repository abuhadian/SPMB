/**
 * KONFIGURASI APLIKASI SPMB SMP NEGERI 1 SEGAH
 * 
 * Panduan Pengaturan:
 * 1. Atur data sekolah pada SCHOOL_CONFIG.
 * 2. Masukkan URL Web App Google Apps Script ke API_URL setelah dideploy.
 * 3. Jika API_URL masih kosong (""), aplikasi otomatis beralih ke Mode Demo (LocalStorage)
 *    sehingga seluruh fitur (Pendaftaran, Cek Status, Dashboard Admin, Import/Export)
 *    dapat diuji coba langsung di browser tanpa backend!
 */

const SCHOOL_CONFIG = {
  name: "SMP Negeri 1 Segah",
  shortName: "SMPN 1 Segah",
  title: "SPMB SMP Negeri 1 Segah",
  tagline: "Unggul dalam Prestasi, Santun dalam Berperilaku, dan Berwawasan Lingkungan",
  year: "2026",
  academicYear: "2026/2027",
  npsn: "30401567",
  address: "Jl. Poros Segah, RT 04, Kec. Segah, Kab. Berau, Kalimantan Timur 77353",
  phone: "0812-5555-6789",
  email: "smpn1segah.berau@gmail.com",
  website: "https://smpn1segah.sch.id",
  logo: "assets/logo.svg",
  
  // Jalur pendaftaran default
  jalur: [
    { id: "domisili", nama: "Zonasi / Domisili", kuota: 120, deskripsi: "Untuk calon murid yang bertempat tinggal di wilayah zonasi yang telah ditetapkan." },
    { id: "afirmasi", nama: "Afirmasi", kuota: 30, deskripsi: "Untuk calon murid dari keluarga ekonomi tidak mampu (KIP/PKH) dan penyandang disabilitas." },
    { id: "prestasi", nama: "Prestasi", kuota: 40, deskripsi: "Untuk calon murid yang memiliki prestasi akademik maupun non-akademik berjenjang." },
    { id: "mutasi", nama: "Perpindahan Tugas Orang Tua / Wali", kuota: 10, deskripsi: "Untuk calon murid yang berpindah domisili mengikuti penugasan orang tua/wali." }
  ],
  
  // Jadwal penting SPMB
  jadwal: [
    { kegiatan: "Sosialisasi SPMB", tanggal: "01 Mei - 20 Mei 2026", status: "Selesai" },
    { kegiatan: "Pendaftaran Online", tanggal: "01 Juni - 20 Juni 2026", status: "Aktif" },
    { kegiatan: "Verifikasi Berkas & Dokumen", tanggal: "05 Juni - 25 Juni 2026", status: "Mendatang" },
    { kegiatan: "Rapat Pleno & Penetapan Seleksi", tanggal: "27 Juni 2026", status: "Mendatang" },
    { kegiatan: "Pengumuman Hasil Seleksi", tanggal: "30 Juni 2026", status: "Mendatang" },
    { kegiatan: "Daftar Ulang Murid Baru", tanggal: "01 Juli - 05 Juli 2026", status: "Mendatang" }
  ],
  
  // Kuota total
  totalKuota: 200,
  
  // Status SPMB: 'buka', 'tutup', 'persiapan'
  statusPendaftaran: "buka"
};

// URL Web App Google Apps Script setelah deploy (misal: "https://script.google.com/macros/s/AKfycbz8W045hN8Zm9mFQMlC3lY5BdZiB6DRd7QLIhfu0J2IuzX3jJnaE8P30WDk49rzjrSR/exec")
// KOSONGKAN ("") untuk mengaktifkan MODE DEMO otomatis (LocalStorage)
const API_URL = "";

// Konfigurasi Tambahan
const APP_CONFIG = {
  appName: "SPMB SMP Negeri 1 Segah",
  version: "1.0.0",
  demoMode: !API_URL || API_URL === "https://script.google.com/macros/s/AKfycbz8W045hN8Zm9mFQMlC3lY5BdZiB6DRd7QLIhfu0J2IuzX3jJnaE8P30WDk49rzjrSR/exec" || API_URL.trim() === "",
  maxUploadSizeBytes: 2 * 1024 * 1024, // 2MB
  allowedFileExtensions: ["pdf", "jpg", "jpeg", "png"]
};
