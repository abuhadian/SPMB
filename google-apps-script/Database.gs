/**
 * ============================================================================
 * SPMB SMP NEGERI 1 SEGAH - GOOGLE APPS SCRIPT BACKEND
 * File: Database.gs
 * Fungsi: Inisialisasi struktur sheet, seeding demo data, dan query helpers
 * ============================================================================
 */

/**
 * Mengambil objek Sheet berdasarkan nama
 */
function getSheet(sheetName) {
  const ss = getSpreadsheet();
  let sheet = ss.getSheetByName(sheetName);
  if (!sheet) {
    sheet = ss.insertSheet(sheetName);
  }
  return sheet;
}

/**
 * Setup Database Otomatis:
 * Membuat semua 8 sheet beserta header kolomnya sesuai spesifikasi README.md
 */
function setupDatabase() {
  const ss = getSpreadsheet();

  const schemas = {
    [SHEET_NAMES.PELAKSANAAN]: [
      "ID", "Tahun", "Nama Sekolah", "Status Pendaftaran", "Tanggal Mulai",
      "Tanggal Selesai", "Kuota", "Jalur", "Pengumuman", "Keterangan"
    ],
    [SHEET_NAMES.PENDAFTAR]: [
      "ID", "Nomor Pendaftaran", "Timestamp", "Tahun", "NISN", "NIK",
      "Nama Lengkap", "Nama Panggilan", "Jenis Kelamin", "Tempat Lahir",
      "Tanggal Lahir", "Agama", "Nomor KK", "Alamat", "RT", "RW", "Desa",
      "Kecamatan", "Kabupaten", "Provinsi", "Kode Pos", "No HP", "Email",
      "Nama SD/MI", "NPSN Sekolah Asal", "Tahun Lulus", "Jalur",
      "Status Verifikasi", "Status Seleksi", "Status Kelulusan",
      "Catatan Admin", "Tanggal Update"
    ],
    [SHEET_NAMES.ORANG_TUA]: [
      "ID", "Nomor Pendaftaran", "NIK Ayah", "Nama Ayah", "Pendidikan Ayah",
      "Pekerjaan Ayah", "Penghasilan Ayah", "HP Ayah", "NIK Ibu", "Nama Ibu",
      "Pendidikan Ibu", "Pekerjaan Ibu", "Penghasilan Ibu", "HP Ibu",
      "Nama Wali", "Hubungan Wali", "Pekerjaan Wali", "HP Wali"
    ],
    [SHEET_NAMES.PRESTASI]: [
      "ID", "Nomor Pendaftaran", "Jenis Prestasi", "Tingkat", "Nama Prestasi",
      "Tahun", "Penyelenggara", "Keterangan"
    ],
    [SHEET_NAMES.DOKUMEN]: [
      "ID", "Nomor Pendaftaran", "KK", "Akta", "Ijazah/SKL", "Dokumen Lain", "Timestamp"
    ],
    [SHEET_NAMES.NILAI_RAPOR]: [
      "ID", "Nomor Pendaftaran", "NISN", "Nama", "Semester", "Mata Pelajaran",
      "Nilai", "Tahun Pelajaran"
    ],
    [SHEET_NAMES.PENGUMUMAN]: [
      "ID", "Judul", "Isi", "Tanggal", "Status", "Link"
    ],
    [SHEET_NAMES.ADMIN]: [
      "ID", "Username", "Password", "Nama", "Role", "Status"
    ]
  };

  for (let sheetName in schemas) {
    let sheet = ss.getSheetByName(sheetName);
    if (!sheet) {
      sheet = ss.insertSheet(sheetName);
    }
    
    // Cek apakah baris 1 kosong
    if (sheet.getLastRow() === 0) {
      const headers = schemas[sheetName];
      sheet.appendRow(headers);
      
      // Styling Header Sheet
      const headerRange = sheet.getRange(1, 1, 1, headers.length);
      headerRange.setBackground("#1d4ed8");
      headerRange.setFontColor("#ffffff");
      headerRange.setFontWeight("bold");
      headerRange.setHorizontalAlignment("center");
      sheet.setFrozenRows(1);
    }
  }

  // Cek dan buat admin default jika sheet ADMIN masih kosong datanya
  const adminSheet = getSheet(SHEET_NAMES.ADMIN);
  if (adminSheet.getLastRow() <= 1) {
    const defaultPasswordHash = hashPassword("admin123");
    adminSheet.appendRow([
      "ADM-001",
      "admin",
      defaultPasswordHash,
      "Administrator SPMB SMPN 1 Segah",
      "Super Admin",
      "Aktif"
    ]);
  }

  // Cek dan buat baris pelaksanaan default jika sheet PELAKSANAAN kosong
  const pelSheet = getSheet(SHEET_NAMES.PELAKSANAAN);
  if (pelSheet.getLastRow() <= 1) {
    pelSheet.appendRow([
      "PEL-2026",
      DEFAULT_CONFIG.TAHUN,
      DEFAULT_CONFIG.NAMA_SEKOLAH,
      DEFAULT_CONFIG.STATUS_PENDAFTARAN,
      DEFAULT_CONFIG.TANGGAL_MULAI,
      DEFAULT_CONFIG.TANGGAL_SELESAI,
      DEFAULT_CONFIG.KUOTA_TOTAL,
      DEFAULT_CONFIG.JALUR,
      "Pengumuman hasil SPMB dijadwalkan pada tanggal 30 Juni 2026.",
      "Tahun Pelajaran 2026/2027"
    ]);
  }

  Logger.log("Setup Database berhasil diselesaikan.");
  return { success: true, message: "Database dan semua sheet berhasil dibuat!" };
}

/**
 * Mengisi Data Dummy / Demo untuk Pengujian Awal
 */
function seedDemoData() {
  setupDatabase();

  const pendaftarSheet = getSheet(SHEET_NAMES.PENDAFTAR);
  const ortuSheet = getSheet(SHEET_NAMES.ORANG_TUA);
  const dokSheet = getSheet(SHEET_NAMES.DOKUMEN);
  const pengumumanSheet = getSheet(SHEET_NAMES.PENGUMUMAN);

  // Jika sudah ada data, jangan timpa
  if (pendaftarSheet.getLastRow() > 1) {
    return { success: true, message: "Data pendaftar sudah ada, skip demo seed." };
  }

  const demoApplicants = [
    {
      id: "PND-0001",
      noPendaftaran: "SPMB-2026-0001",
      timestamp: "2026-06-02 09:15:00",
      tahun: "2026",
      nisn: "0091234567",
      nik: "6403011204090001",
      nama: "Ahmad Rizky Pratama",
      panggilan: "Rizky",
      jk: "Laki-laki",
      tmpLahir: "Segah",
      tglLahir: "2013-05-12",
      agama: "Islam",
      noKk: "6403012005080002",
      alamat: "Jl. Poros Segah RT 02",
      rt: "02",
      rw: "01",
      desa: "Tepian Buah",
      kec: "Segah",
      kab: "Berau",
      prov: "Kalimantan Timur",
      kodepos: "77353",
      hp: "081234567890",
      email: "rizky.pratama@gmail.com",
      sd: "SD Negeri 001 Segah",
      npsn: "30401234",
      thnLulus: "2026",
      jalur: "Domisili",
      statusVerif: "Terverifikasi",
      statusSeleksi: "Memenuhi Syarat",
      statusLulus: "Lulus",
      catatan: "Berkas lengkap dan sesuai.",
      update: "2026-06-03 11:00:00"
    },
    {
      id: "PND-0002",
      noPendaftaran: "SPMB-2026-0002",
      timestamp: "2026-06-02 10:30:00",
      tahun: "2026",
      nisn: "0098765432",
      nik: "6403015408090002",
      nama: "Siti Nurhaliza",
      panggilan: "Siti",
      jk: "Perempuan",
      tmpLahir: "Tanjung Redeb",
      tglLahir: "2013-08-24",
      agama: "Islam",
      noKk: "6403012106090003",
      alamat: "Jl. Trans Segah RT 05",
      rt: "05",
      rw: "02",
      desa: "Gunung Sari",
      kec: "Segah",
      kab: "Berau",
      prov: "Kalimantan Timur",
      kodepos: "77353",
      hp: "081398765432",
      email: "siti.nur@gmail.com",
      sd: "SD Negeri 002 Segah",
      npsn: "30401235",
      thnLulus: "2026",
      jalur: "Prestasi",
      statusVerif: "Terverifikasi",
      statusSeleksi: "Memenuhi Syarat",
      statusLulus: "Lulus",
      catatan: "Juara 1 OSN Matematika Tingkat Kabupaten.",
      update: "2026-06-04 14:20:00"
    },
    {
      id: "PND-0003",
      noPendaftaran: "SPMB-2026-0003",
      timestamp: "2026-06-03 14:00:00",
      tahun: "2026",
      nisn: "0093456789",
      nik: "6403011802090003",
      nama: "Budi Santoso",
      panggilan: "Budi",
      jk: "Laki-laki",
      tmpLahir: "Berau",
      tglLahir: "2013-02-18",
      agama: "Kristen",
      noKk: "6403012207100004",
      alamat: "Jl. Usaha Bersama RT 01",
      rt: "01",
      rw: "01",
      desa: "Harapan Jaya",
      kec: "Segah",
      kab: "Berau",
      prov: "Kalimantan Timur",
      kodepos: "77353",
      hp: "085245678123",
      email: "budi.santoso@yahoo.com",
      sd: "SD Negeri 003 Segah",
      npsn: "30401236",
      thnLulus: "2026",
      jalur: "Afirmasi",
      statusVerif: "Menunggu Verifikasi",
      statusSeleksi: "Dalam Proses",
      statusLulus: "Dalam Proses",
      catatan: "Menunggu pengecekan fisik berkas KIP.",
      update: "2026-06-03 14:00:00"
    },
    {
      id: "PND-0004",
      noPendaftaran: "SPMB-2026-0004",
      timestamp: "2026-06-04 11:20:00",
      tahun: "2026",
      nisn: "0095678901",
      nik: "6403016109090004",
      nama: "Dewi Lestari",
      panggilan: "Dewi",
      jk: "Perempuan",
      tmpLahir: "Segah",
      tglLahir: "2013-09-21",
      agama: "Islam",
      noKk: "6403012308110005",
      alamat: "Jl. Melati RT 03",
      rt: "03",
      rw: "01",
      desa: "Pandis Batu",
      kec: "Segah",
      kab: "Berau",
      prov: "Kalimantan Timur",
      kodepos: "77353",
      hp: "082156789012",
      email: "dewi.lestari@gmail.com",
      sd: "SD Negeri 001 Segah",
      npsn: "30401234",
      thnLulus: "2026",
      jalur: "Domisili",
      statusVerif: "Perlu Perbaikan",
      statusSeleksi: "Belum Memenuhi",
      statusLulus: "Dalam Proses",
      catatan: "Foto Kartu Keluarga buram dan tidak terbaca. Harap upload ulang scan KK yang jelas.",
      update: "2026-06-05 09:30:00"
    }
  ];

  demoApplicants.forEach(function(d) {
    pendaftarSheet.appendRow([
      d.id, d.noPendaftaran, d.timestamp, d.tahun, d.nisn, d.nik,
      d.nama, d.panggilan, d.jk, d.tmpLahir, d.tglLahir, d.agama,
      d.noKk, d.alamat, d.rt, d.rw, d.desa, d.kec, d.kab, d.prov,
      d.kodepos, d.hp, d.email, d.sd, d.npsn, d.thnLulus, d.jalur,
      d.statusVerif, d.statusSeleksi, d.statusLulus, d.catatan, d.update
    ]);

    ortuSheet.appendRow([
      "ORT-" + d.id.replace("PND-", ""),
      d.noPendaftaran,
      "6403010101750001", "Ayah " + d.nama, "SMA / Sederajat", "Petani / Pekebun", "Rp 2.000.000 - Rp 3.500.000", d.hp,
      "6403014101800001", "Ibu " + d.nama, "SMP / Sederajat", "Ibu Rumah Tangga", "< Rp 1.000.000", d.hp,
      "-", "-", "-", "-"
    ]);

    dokSheet.appendRow([
      "DOK-" + d.id.replace("PND-", ""),
      d.noPendaftaran,
      "https://drive.google.com/sample_kk.pdf",
      "https://drive.google.com/sample_akta.pdf",
      "https://drive.google.com/sample_skl.pdf",
      "",
      d.timestamp
    ]);
  });

  // Seed Pengumuman
  pengumumanSheet.appendRow([
    "PGM-001",
    "Jadwal Verifikasi Berkas Fisik Calon Murid Baru 2026",
    "Diberitahukan kepada seluruh calon murid baru jalur Domisili dan Afirmasi yang telah mendaftar secara daring untuk membawa berkas asli (KK, Akta Kelahiran, dan SKL) ke Sekretariat SPMB SMPN 1 Segah pada jam kerja (08.00 - 13.00 WITA).",
    "2026-06-01",
    "Publik",
    ""
  ]);
  pengumumanSheet.appendRow([
    "PGM-002",
    "Informasi Kuota dan Daya Tampung Tiap Jalur SPMB 2026",
    "Total kuota penerimaan murid baru SMP Negeri 1 Segah Tahun Ajaran 2026/2027 adalah 200 murid yang terbagi dalam 4 jalur penerimaan: Zonasi/Domisili (60%), Afirmasi (15%), Prestasi (20%), dan Perpindahan Tugas Orang Tua (5%).",
    "2026-05-25",
    "Publik",
    ""
  ]);

  return { success: true, message: "Demo data berhasil ditambahkan ke database!" };
}

/**
 * Konversi Sheet menjadi Array of Objects (baris 1 sebagai nama properti / key)
 */
function sheetToObjects(sheet) {
  const lastRow = sheet.getLastRow();
  const lastCol = sheet.getLastColumn();
  if (lastRow <= 1 || lastCol === 0) return [];

  const values = sheet.getRange(1, 1, lastRow, lastCol).getValues();
  const headers = values[0];
  const results = [];

  for (let i = 1; i < values.length; i++) {
    const row = values[i];
    const obj = {};
    let hasData = false;
    for (let j = 0; j < headers.length; j++) {
      let key = String(headers[j]).trim();
      let val = row[j];
      if (val instanceof Date) {
        val = Utilities.formatDate(val, "Asia/Makassar", "yyyy-MM-dd HH:mm:ss");
      }
      obj[key] = val;
      if (val !== "" && val !== null && val !== undefined) hasData = true;
    }
    if (hasData) results.push(obj);
  }
  return results;
}
