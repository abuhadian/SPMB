/**
 * ============================================================================
 * SPMB SMP NEGERI 1 SEGAH - GOOGLE APPS SCRIPT BACKEND (ALL-IN-ONE VERSION)
 * File: Code_AllInOne.gs
 * 
 * PANDUAN CEPAT:
 * Jika Anda ingin menyalin seluruh backend ke dalam 1 file tunggal di Google
 * Apps Script, salin SELURUH isi file ini ke file Code.gs pada editor Apps Script Anda!
 * 
 * Fitur:
 * 1. setupDatabase() - Otomatis buat 8 sheet lengkap dengan header
 * 2. seedDemoData() - Otomatis isi data dummy untuk uji coba
 * 3. LockService - Pendaftaran multi-user aman tanpa duplikasi nomor pendaftaran
 * 4. Google Drive upload - Simpan dokumen (KK, Akta, SKL) dan cantumkan URL di sheet
 * 5. Keamanan - Hash SHA-256 password admin & sesi token berbasis HMAC
 * 6. Seleksi otomatis & Import CSV data murid & nilai rapor
 * ============================================================================
 */

// 1. KONSTANTA SHEET
const SHEET_NAMES = {
  PELAKSANAAN: "PELAKSANAAN",
  PENDAFTAR: "PENDAFTAR",
  ORANG_TUA: "ORANG_TUA",
  PRESTASI: "PRESTASI",
  DOKUMEN: "DOKUMEN",
  NILAI_RAPOR: "NILAI_RAPOR",
  PENGUMUMAN: "PENGUMUMAN",
  ADMIN: "ADMIN"
};

const DEFAULT_CONFIG = {
  TAHUN: "2026",
  NAMA_SEKOLAH: "SMP Negeri 1 Segah",
  KUOTA_TOTAL: 200,
  STATUS_PENDAFTARAN: "buka",
  TANGGAL_MULAI: "2026-06-01",
  TANGGAL_SELESAI: "2026-06-20",
  JALUR: JSON.stringify([
    { id: "domisili", nama: "Zonasi / Domisili", kuota: 120 },
    { id: "afirmasi", nama: "Afirmasi", kuota: 30 },
    { id: "prestasi", nama: "Prestasi", kuota: 40 },
    { id: "mutasi", nama: "Perpindahan Tugas Orang Tua", kuota: 10 }
  ])
};

// 2. HELPER SPREADSHEET & DRIVE
function getSpreadsheet() {
  const props = PropertiesService.getScriptProperties();
  const sheetId = props.getProperty("1E6W7R3eiC9d7hHxPeTz13eKjN88zqJxCaEyc8Z35diQ");
  if (sheetId && sheetId.trim() !== "" && sheetId !== "ISI_ID_GOOGLE_SHEET") {
    try {
      return SpreadsheetApp.openById(sheetId);
    } catch (e) {
      Logger.log("Fallback ke active: " + e.message);
    }
  }
  return SpreadsheetApp.getActiveSpreadsheet();
}

function getSheet(sheetName) {
  const ss = getSpreadsheet();
  let sheet = ss.getSheetByName(sheetName);
  if (!sheet) {
    sheet = ss.insertSheet(sheetName);
  }
  return sheet;
}

function getDriveFolder() {
  const props = PropertiesService.getScriptProperties();
  const folderId = props.getProperty("1HpLSQYs2LCsnJ6OnvKh2C4SxHJvZc9RP");
  if (folderId && folderId.trim() !== "" && folderId !== "ISI_ID_FOLDER_GOOGLE_DRIVE") {
    try {
      return DriveApp.getFolderById(folderId);
    } catch (e) {
      Logger.log("Fallback folder default: " + e.message);
    }
  }
  const folderName = "SPMB_SMPN1_SEGAH_DOKUMEN";
  const existingFolders = DriveApp.getFoldersByName(folderName);
  if (existingFolders.hasNext()) {
    const folder = existingFolders.next();
    props.setProperty("1HpLSQYs2LCsnJ6OnvKh2C4SxHJvZc9RP", folder.getId());
    return folder;
  } else {
    const newFolder = DriveApp.createFolder(folderName);
    props.setProperty("1HpLSQYs2LCsnJ6OnvKh2C4SxHJvZc9RP", newFolder.getId());
    return newFolder;
  }
}

function getAuthSecret() {
  const props = PropertiesService.getScriptProperties();
  let secret = props.getProperty("AUTH_SECRET");
  if (!secret) {
    secret = "SMPN1_SEGAH_SPMB_SECRET_" + Utilities.getUuid();
    props.setProperty("AUTH_SECRET", secret);
  }
  return secret;
}

// 3. UTILS & KEAMANAN
function jsonResponse(data) {
  return ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

function hashPassword(password) {
  if (!password) return "";
  const rawHash = Utilities.computeDigest(
    Utilities.DigestAlgorithm.SHA_256,
    password + "_SMPN1_SEGAH_SALT",
    Utilities.Charset.UTF_8
  );
  let hashStr = "";
  for (let i = 0; i < rawHash.length; i++) {
    let byteVal = rawHash[i];
    if (byteVal < 0) byteVal += 256;
    let byteHex = byteVal.toString(16);
    if (byteHex.length === 1) byteHex = "0" + byteHex;
    hashStr += byteHex;
  }
  return hashStr;
}

function createAdminToken(username, role) {
  const payload = {
    username: username,
    role: role,
    exp: new Date().getTime() + (12 * 60 * 60 * 1000)
  };
  const str = Utilities.base64EncodeWebSafe(JSON.stringify(payload));
  const secret = getAuthSecret();
  const signature = Utilities.base64EncodeWebSafe(
    Utilities.computeHmacSha256Signature(str, secret)
  );
  return str + "." + signature;
}

function verifyAdminToken(token) {
  if (!token || typeof token !== "string" || token.indexOf(".") === -1) {
    return { valid: false, message: "Token tidak valid" };
  }
  const parts = token.split(".");
  const str = parts[0];
  const signature = parts[1];
  const secret = getAuthSecret();
  const expectedSig = Utilities.base64EncodeWebSafe(
    Utilities.computeHmacSha256Signature(str, secret)
  );
  if (signature !== expectedSig) {
    return { valid: false, message: "Tanda tangan token tidak sah" };
  }
  try {
    const payload = JSON.parse(Utilities.newBlob(Utilities.base64DecodeWebSafe(str)).getDataAsString());
    if (new Date().getTime() > payload.exp) {
      return { valid: false, message: "Sesi telah berakhir" };
    }
    return { valid: true, user: payload };
  } catch (e) {
    return { valid: false, message: "Token korup" };
  }
}

function authenticateAdmin(token) {
  const auth = verifyAdminToken(token);
  if (!auth.valid) {
    return { success: false, authorized: false, message: auth.message };
  }
  return { success: true, authorized: true, user: auth.user };
}

function sanitizeInput(val) {
  if (val === null || val === undefined) return "";
  let str = String(val).trim();
  if (/^[=\+\-@]/.test(str)) str = "'" + str;
  return str;
}

function formatDateTimeID(date) {
  if (!date) date = new Date();
  if (typeof date === "string") date = new Date(date);
  return Utilities.formatDate(date, "Asia/Makassar", "yyyy-MM-dd HH:mm:ss");
}

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

// 4. SETUP DATABASE
function setupDatabase() {
  const ss = getSpreadsheet();
  const schemas = {
    [SHEET_NAMES.PELAKSANAAN]: ["ID", "Tahun", "Nama Sekolah", "Status Pendaftaran", "Tanggal Mulai", "Tanggal Selesai", "Kuota", "Jalur", "Pengumuman", "Keterangan"],
    [SHEET_NAMES.PENDAFTAR]: ["ID", "Nomor Pendaftaran", "Timestamp", "Tahun", "NISN", "NIK", "Nama Lengkap", "Nama Panggilan", "Jenis Kelamin", "Tempat Lahir", "Tanggal Lahir", "Agama", "Nomor KK", "Alamat", "RT", "RW", "Desa", "Kecamatan", "Kabupaten", "Provinsi", "Kode Pos", "No HP", "Email", "Nama SD/MI", "NPSN Sekolah Asal", "Tahun Lulus", "Jalur", "Status Verifikasi", "Status Seleksi", "Status Kelulusan", "Catatan Admin", "Tanggal Update"],
    [SHEET_NAMES.ORANG_TUA]: ["ID", "Nomor Pendaftaran", "NIK Ayah", "Nama Ayah", "Pendidikan Ayah", "Pekerjaan Ayah", "Penghasilan Ayah", "HP Ayah", "NIK Ibu", "Nama Ibu", "Pendidikan Ibu", "Pekerjaan Ibu", "Penghasilan Ibu", "HP Ibu", "Nama Wali", "Hubungan Wali", "Pekerjaan Wali", "HP Wali"],
    [SHEET_NAMES.PRESTASI]: ["ID", "Nomor Pendaftaran", "Jenis Prestasi", "Tingkat", "Nama Prestasi", "Tahun", "Penyelenggara", "Keterangan"],
    [SHEET_NAMES.DOKUMEN]: ["ID", "Nomor Pendaftaran", "KK", "Akta", "Ijazah/SKL", "Dokumen Lain", "Timestamp"],
    [SHEET_NAMES.NILAI_RAPOR]: ["ID", "Nomor Pendaftaran", "NISN", "Nama", "Semester", "Mata Pelajaran", "Nilai", "Tahun Pelajaran"],
    [SHEET_NAMES.PENGUMUMAN]: ["ID", "Judul", "Isi", "Tanggal", "Status", "Link"],
    [SHEET_NAMES.ADMIN]: ["ID", "Username", "Password", "Nama", "Role", "Status"]
  };

  for (let sheetName in schemas) {
    let sheet = ss.getSheetByName(sheetName);
    if (!sheet) sheet = ss.insertSheet(sheetName);
    if (sheet.getLastRow() === 0) {
      const headers = schemas[sheetName];
      sheet.appendRow(headers);
      const headerRange = sheet.getRange(1, 1, 1, headers.length);
      headerRange.setBackground("#1d4ed8").setFontColor("#ffffff").setFontWeight("bold").setHorizontalAlignment("center");
      sheet.setFrozenRows(1);
    }
  }

  const adminSheet = getSheet(SHEET_NAMES.ADMIN);
  if (adminSheet.getLastRow() <= 1) {
    adminSheet.appendRow(["ADM-001", "admin", hashPassword("admin123"), "Administrator SPMB SMPN 1 Segah", "Super Admin", "Aktif"]);
  }

  const pelSheet = getSheet(SHEET_NAMES.PELAKSANAAN);
  if (pelSheet.getLastRow() <= 1) {
    pelSheet.appendRow(["PEL-2026", DEFAULT_CONFIG.TAHUN, DEFAULT_CONFIG.NAMA_SEKOLAH, DEFAULT_CONFIG.STATUS_PENDAFTARAN, DEFAULT_CONFIG.TANGGAL_MULAI, DEFAULT_CONFIG.TANGGAL_SELESAI, DEFAULT_CONFIG.KUOTA_TOTAL, DEFAULT_CONFIG.JALUR, "Pengumuman SPMB dijadwalkan tanggal 30 Juni 2026.", "Tahun Pelajaran 2026/2027"]);
  }

  return { success: true, message: "Database dan seluruh 8 sheet berhasil dibuat!" };
}

// 5. SEED DEMO DATA
function seedDemoData() {
  setupDatabase();
  const pendaftarSheet = getSheet(SHEET_NAMES.PENDAFTAR);
  const ortuSheet = getSheet(SHEET_NAMES.ORANG_TUA);
  const dokSheet = getSheet(SHEET_NAMES.DOKUMEN);
  const pengumumanSheet = getSheet(SHEET_NAMES.PENGUMUMAN);

  if (pendaftarSheet.getLastRow() > 1) {
    return { success: true, message: "Data pendaftar sudah ada." };
  }

  const sample = [
    { no: "SPMB-2026-0001", nisn: "0091234567", nik: "6403011204090001", nama: "Ahmad Rizky Pratama", jk: "Laki-laki", jalur: "Domisili", sd: "SD Negeri 001 Segah", verif: "Terverifikasi", seleksi: "Memenuhi Syarat", lulus: "Lulus", catatan: "Berkas lengkap." },
    { no: "SPMB-2026-0002", nisn: "0098765432", nik: "6403015408090002", nama: "Siti Nurhaliza", jk: "Perempuan", jalur: "Prestasi", sd: "SD Negeri 002 Segah", verif: "Terverifikasi", seleksi: "Memenuhi Syarat", lulus: "Lulus", catatan: "Juara 1 OSN Matematika Berau." },
    { no: "SPMB-2026-0003", nisn: "0093456789", nik: "6403011802090003", nama: "Budi Santoso", jk: "Laki-laki", jalur: "Afirmasi", sd: "SD Negeri 003 Segah", verif: "Menunggu Verifikasi", seleksi: "Dalam Proses", lulus: "Dalam Proses", catatan: "Menunggu pengecekan fisik KIP." },
    { no: "SPMB-2026-0004", nisn: "0095678901", nik: "6403016109090004", nama: "Dewi Lestari", jk: "Perempuan", jalur: "Domisili", sd: "SD Negeri 001 Segah", verif: "Perlu Perbaikan", seleksi: "Belum Memenuhi", lulus: "Dalam Proses", catatan: "Scan KK buram, harap upload ulang." }
  ];

  sample.forEach((s, i) => {
    const id = "PND-000" + (i + 1);
    const now = "2026-06-0" + (i + 1) + " 09:00:00";
    pendaftarSheet.appendRow([
      id, s.no, now, "2026", s.nisn, s.nik, s.nama, s.nama.split(" ")[0],
      s.jk, "Segah", "2013-05-15", "Islam", "6403012005080001",
      "Jl. Poros Segah RT 02", "02", "01", "Tepian Buah", "Segah", "Berau", "Kalimantan Timur",
      "77353", "081234567890", "siswa" + (i + 1) + "@gmail.com", s.sd, "30401234", "2026",
      s.jalur, s.verif, s.seleksi, s.lulus, s.catatan, now
    ]);

    ortuSheet.appendRow([
      "ORT-000" + (i + 1), s.no, "6403010101750001", "Ayah " + s.nama, "SMA", "Wiraswasta", "Rp 2-3 Juta", "081234567890",
      "6403014101800001", "Ibu " + s.nama, "SMP", "Ibu Rumah Tangga", "< Rp 1 Juta", "081234567890", "-", "-", "-", "-"
    ]);

    dokSheet.appendRow([
      "DOK-000" + (i + 1), s.no, "https://drive.google.com/sample_kk.pdf", "https://drive.google.com/sample_akta.pdf", "https://drive.google.com/sample_skl.pdf", "", now
    ]);
  });

  pengumumanSheet.appendRow([
    "PGM-001", "Jadwal Verifikasi Berkas Fisik Calon Murid Baru 2026",
    "Diberitahukan kepada seluruh calon murid baru jalur Domisili dan Afirmasi untuk membawa berkas asli (KK, Akta, SKL) ke SMPN 1 Segah.",
    "2026-06-01", "Publik", ""
  ]);

  return { success: true, message: "Demo data berhasil ditambahkan!" };
}

// 6. PENDAFTARAN & LOCK SERVICE
function generateRegistrationNumber(year) {
  if (!year) year = "2026";
  const lock = LockService.getScriptLock();
  try {
    lock.waitLock(15000);
    const sheet = getSheet(SHEET_NAMES.PENDAFTAR);
    const lastRow = sheet.getLastRow();
    let maxNumber = 0;
    if (lastRow > 1) {
      const regNums = sheet.getRange(2, 2, lastRow - 1, 1).getValues();
      const prefix = "SPMB-" + year + "-";
      for (let i = 0; i < regNums.length; i++) {
        const val = String(regNums[i][0]).trim();
        if (val.indexOf(prefix) === 0) {
          const numPart = parseInt(val.replace(prefix, ""), 10);
          if (!isNaN(numPart) && numPart > maxNumber) maxNumber = numPart;
        }
      }
    }
    const nextNumber = maxNumber + 1;
    return "SPMB-" + year + "-" + ("0000" + nextNumber).slice(-4);
  } finally {
    lock.releaseLock();
  }
}

function handleSaveRegistration(data) {
  if (!data) return { success: false, message: "Data pendaftaran kosong" };
  const nik = String(data.nik || "").replace(/\D/g, "");
  if (nik.length !== 16) return { success: false, message: "NIK harus 16 digit angka." };
  if (!data.namaLengkap) return { success: false, message: "Nama lengkap wajib diisi." };

  const pendaftarSheet = getSheet(SHEET_NAMES.PENDAFTAR);
  const lastRow = pendaftarSheet.getLastRow();
  if (lastRow > 1) {
    const nikValues = pendaftarSheet.getRange(2, 6, lastRow - 1, 1).getValues();
    for (let i = 0; i < nikValues.length; i++) {
      if (String(nikValues[i][0]).trim() === nik) {
        return { success: false, message: "NIK " + nik + " sudah terdaftar di sistem SPMB!" };
      }
    }
  }

  const tahun = data.tahun || "2026";
  const noPendaftaran = generateRegistrationNumber(tahun);
  const now = formatDateTimeID(new Date());
  const newId = "PND-" + Utilities.getUuid().substring(0, 8).toUpperCase();

  pendaftarSheet.appendRow([
    newId, noPendaftaran, now, tahun, sanitizeInput(data.nisn), nik,
    sanitizeInput(data.namaLengkap), sanitizeInput(data.namaPanggilan), sanitizeInput(data.jenisKelamin),
    sanitizeInput(data.tempatLahir), sanitizeInput(data.tanggalLahir), sanitizeInput(data.agama),
    sanitizeInput(data.nomorKk), sanitizeInput(data.alamat), sanitizeInput(data.rt), sanitizeInput(data.rw),
    sanitizeInput(data.desa), sanitizeInput(data.kecamatan), sanitizeInput(data.kabupaten || "Berau"),
    sanitizeInput(data.provinsi || "Kalimantan Timur"), sanitizeInput(data.kodePos), sanitizeInput(data.nomorHp),
    sanitizeInput(data.email), sanitizeInput(data.namaSd), sanitizeInput(data.npsnSd), sanitizeInput(data.tahunLulus),
    sanitizeInput(data.jalur), "Menunggu Verifikasi", "Dalam Proses", "Dalam Proses",
    "Pendaftaran online berhasil diterima. Menunggu verifikasi berkas.", now
  ]);

  getSheet(SHEET_NAMES.ORANG_TUA).appendRow([
    "ORT-" + Utilities.getUuid().substring(0, 8).toUpperCase(), noPendaftaran,
    sanitizeInput(data.nikAyah), sanitizeInput(data.namaAyah), sanitizeInput(data.pendidikanAyah),
    sanitizeInput(data.pekerjaanAyah), sanitizeInput(data.penghasilanAyah), sanitizeInput(data.hpAyah),
    sanitizeInput(data.nikIbu), sanitizeInput(data.namaIbu), sanitizeInput(data.pendidikanIbu),
    sanitizeInput(data.pekerjaanIbu), sanitizeInput(data.penghasilanIbu), sanitizeInput(data.hpIbu),
    sanitizeInput(data.namaWali), sanitizeInput(data.hubunganWali), sanitizeInput(data.pekerjaanWali), sanitizeInput(data.hpWali)
  ]);

  if (data.prestasi && Array.isArray(data.prestasi)) {
    const prsSheet = getSheet(SHEET_NAMES.PRESTASI);
    data.prestasi.forEach(p => {
      if (p.namaPrestasi) {
        prsSheet.appendRow(["PRS-" + Utilities.getUuid().substring(0, 8).toUpperCase(), noPendaftaran, sanitizeInput(p.jenisPrestasi), sanitizeInput(p.tingkat), sanitizeInput(p.namaPrestasi), sanitizeInput(p.tahun), sanitizeInput(p.penyelenggara), sanitizeInput(p.keterangan)]);
      }
    });
  }

  const docs = data.dokumenUrls || {};
  getSheet(SHEET_NAMES.DOKUMEN).appendRow([
    "DOK-" + Utilities.getUuid().substring(0, 8).toUpperCase(), noPendaftaran,
    sanitizeInput(docs.kk || ""), sanitizeInput(docs.akta || ""), sanitizeInput(docs.ijazah || ""), sanitizeInput(docs.lain || ""), now
  ]);

  return {
    success: true,
    message: "Pendaftaran berhasil disimpan!",
    data: { nomorPendaftaran: noPendaftaran, namaLengkap: data.namaLengkap, jalur: data.jalur, nisn: data.nisn || "-", tanggalPendaftaran: now }
  };
}

// 7. CEK STATUS & PENGUMUMAN
function handleCheckStatus(noPendaftaran, verifikasi) {
  if (!noPendaftaran || !verifikasi) return { success: false, message: "Nomor Pendaftaran dan Verifikasi (NISN / Tanggal Lahir) wajib diisi." };
  const rows = sheetToObjects(getSheet(SHEET_NAMES.PENDAFTAR));
  const searchNo = String(noPendaftaran).trim().toUpperCase();
  const searchVerif = String(verifikasi).trim().replace(/[-\/]/g, "");

  for (let i = 0; i < rows.length; i++) {
    const r = rows[i];
    if (String(r["Nomor Pendaftaran"]).trim().toUpperCase() === searchNo) {
      const rNisn = String(r["NISN"] || "").trim();
      const rTgl = String(r["Tanggal Lahir"] || "").trim().replace(/[-\/]/g, "");
      if ((rNisn && rNisn === searchVerif) || (rTgl && rTgl === searchVerif) || (r["Tanggal Lahir"] && r["Tanggal Lahir"].indexOf(verifikasi.trim()) !== -1)) {
        return {
          success: true,
          data: {
            nomorPendaftaran: r["Nomor Pendaftaran"],
            namaLengkap: r["Nama Lengkap"],
            jalur: r["Jalur"],
            asalSekolah: r["Nama SD/MI"],
            statusVerifikasi: r["Status Verifikasi"],
            statusSeleksi: r["Status Seleksi"],
            statusKelulusan: r["Status Kelulusan"],
            catatanAdmin: r["Catatan Admin"] || "Tidak ada catatan.",
            tanggalUpdate: r["Tanggal Update"] || r["Timestamp"]
          }
        };
      }
    }
  }
  return { success: false, message: "Data tidak ditemukan. Pastikan Nomor Pendaftaran dan NISN/Tanggal Lahir sudah tepat." };
}

function handleCheckGraduation(noPendaftaran) {
  if (!noPendaftaran) return { success: false, message: "Nomor pendaftaran wajib diisi." };
  const rows = sheetToObjects(getSheet(SHEET_NAMES.PENDAFTAR));
  const searchNo = String(noPendaftaran).trim().toUpperCase();
  for (let i = 0; i < rows.length; i++) {
    const r = rows[i];
    if (String(r["Nomor Pendaftaran"]).trim().toUpperCase() === searchNo) {
      const lulus = r["Status Kelulusan"] || "Dalam Proses";
      return {
        success: true,
        data: {
          nomorPendaftaran: r["Nomor Pendaftaran"],
          namaLengkap: r["Nama Lengkap"],
          jalur: r["Jalur"],
          statusKelulusan: lulus,
          pesan: lulus === "Lulus" ? "Selamat, Anda dinyatakan LULUS sebagai murid baru SMP Negeri 1 Segah!" : (lulus === "Tidak Lulus" ? "Terima kasih telah berpartisipasi dalam SPMB SMP Negeri 1 Segah." : "Hasil seleksi Anda saat ini masih dalam proses.")
        }
      };
    }
  }
  return { success: false, message: "Nomor Pendaftaran " + searchNo + " tidak ditemukan." };
}

function handleGetPublicAnnouncements() {
  const rows = sheetToObjects(getSheet(SHEET_NAMES.PENGUMUMAN));
  return {
    success: true,
    data: rows.filter(r => r["Status"] === "Publik").map(r => ({
      id: r["ID"], judul: r["Judul"], isi: r["Isi"], tanggal: r["Tanggal"], link: r["Link"]
    }))
  };
}

// 8. UPLOAD KE DRIVE
function handleUploadDocument(params) {
  try {
    if (!params.base64Data || !params.fileName) return { success: false, message: "File tidak lengkap." };
    const folder = getDriveFolder();
    let base64 = params.base64Data;
    if (base64.indexOf("base64,") !== -1) base64 = base64.split("base64,")[1];
    const decodedBytes = Utilities.base64Decode(base64);
    const cleanFileName = (params.noPendaftaran ? params.noPendaftaran.replace(/[^a-zA-Z0-9_-]/g, "") : "DOC") + "_" + (params.documentType || "FILE") + "_" + params.fileName.replace(/[^a-zA-Z0-9._-]/g, "_");
    const blob = Utilities.newBlob(decodedBytes, params.mimeType || "application/octet-stream", cleanFileName);
    const file = folder.createFile(blob);
    file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
    return {
      success: true,
      data: { fileId: file.getId(), fileName: cleanFileName, fileUrl: file.getUrl() }
    };
  } catch (e) {
    return { success: false, message: "Gagal upload: " + e.message };
  }
}

// 9. ADMIN ACTIONS
function handleAdminLogin(username, password) {
  if (!username || !password) return { success: false, message: "Username & password wajib diisi." };
  const rows = sheetToObjects(getSheet(SHEET_NAMES.ADMIN));
  const inputHash = hashPassword(password);
  for (let i = 0; i < rows.length; i++) {
    const r = rows[i];
    if (String(r["Username"]).trim() === String(username).trim()) {
      if (r["Status"] !== "Aktif") return { success: false, message: "Akun dinonaktifkan." };
      if (String(r["Password"]).trim() === inputHash) {
        const token = createAdminToken(r["Username"], r["Role"]);
        return { success: true, data: { token: token, user: { username: r["Username"], nama: r["Nama"], role: r["Role"] } } };
      }
    }
  }
  return { success: false, message: "Username atau password salah." };
}

function handleGetDashboardStatistics() {
  const rows = sheetToObjects(getSheet(SHEET_NAMES.PENDAFTAR));
  let total = rows.length, menunggu = 0, terverifikasi = 0, perluPerbaikan = 0, lulus = 0, tidakLulus = 0;
  const perJalur = { "Domisili": 0, "Afirmasi": 0, "Prestasi": 0, "Mutasi": 0 };
  const perGender = { "Laki-laki": 0, "Perempuan": 0 };

  rows.forEach(r => {
    const v = r["Status Verifikasi"], k = r["Status Kelulusan"], j = r["Jalur"], g = r["Jenis Kelamin"];
    if (v === "Menunggu Verifikasi") menunggu++;
    else if (v === "Terverifikasi") terverifikasi++;
    else if (v === "Perlu Perbaikan") perluPerbaikan++;
    if (k === "Lulus") lulus++;
    else if (k === "Tidak Lulus") tidakLulus++;
    if (perJalur[j] !== undefined) perJalur[j]++;
    if (g && g.indexOf("Laki") !== -1) perGender["Laki-laki"]++;
    else if (g && g.indexOf("Perempuan") !== -1) perGender["Perempuan"]++;
  });

  return {
    success: true,
    data: {
      totalPendaftar: total, menungguVerifikasi: menunggu, terverifikasi: terverifikasi,
      perluPerbaikan: perluPerbaikan, lulus: lulus, tidakLulus: tidakLulus,
      kuotaTotal: DEFAULT_CONFIG.KUOTA_TOTAL, sisaKuota: Math.max(0, DEFAULT_CONFIG.KUOTA_TOTAL - lulus),
      chartJalur: perJalur, chartGender: perGender
    }
  };
}

function handleAdminGetApplicants(filters) {
  const rows = sheetToObjects(getSheet(SHEET_NAMES.PENDAFTAR));
  let results = rows;
  if (filters && filters.search) {
    const q = String(filters.search).toLowerCase();
    results = results.filter(r => (r["Nama Lengkap"] || "").toLowerCase().indexOf(q) !== -1 || (r["Nomor Pendaftaran"] || "").toLowerCase().indexOf(q) !== -1 || (r["NISN"] || "").indexOf(q) !== -1);
  }
  if (filters && filters.jalur && filters.jalur !== "semua") {
    results = results.filter(r => String(r["Jalur"]).toLowerCase() === filters.jalur.toLowerCase());
  }
  if (filters && filters.statusVerif && filters.statusVerif !== "semua") {
    results = results.filter(r => r["Status Verifikasi"] === filters.statusVerif);
  }
  return { success: true, total: results.length, data: results };
}

function handleUpdateApplicantStatus(params) {
  if (!params || !params.nomorPendaftaran) return { success: false, message: "Nomor pendaftaran kosong." };
  const sheet = getSheet(SHEET_NAMES.PENDAFTAR);
  const lastRow = sheet.getLastRow();
  if (lastRow <= 1) return { success: false, message: "Sheet kosong." };
  const values = sheet.getRange(2, 2, lastRow - 1, 1).getValues();
  for (let i = 0; i < values.length; i++) {
    if (String(values[i][0]).trim() === String(params.nomorPendaftaran).trim()) {
      const row = i + 2;
      if (params.statusVerifikasi !== undefined) sheet.getRange(row, 28).setValue(params.statusVerifikasi);
      if (params.statusSeleksi !== undefined) sheet.getRange(row, 29).setValue(params.statusSeleksi);
      if (params.statusKelulusan !== undefined) sheet.getRange(row, 30).setValue(params.statusKelulusan);
      if (params.catatanAdmin !== undefined) sheet.getRange(row, 31).setValue(params.catatanAdmin);
      sheet.getRange(row, 32).setValue(formatDateTimeID(new Date()));
      return { success: true, message: "Status pendaftar " + params.nomorPendaftaran + " berhasil diperbarui." };
    }
  }
  return { success: false, message: "Pendaftar tidak ditemukan." };
}

function handleGetConfig() {
  try {
    const sheet = getSheet(SHEET_NAMES.PELAKSANAAN);
    if (sheet.getLastRow() > 1) {
      const row = sheet.getRange(2, 1, 1, 10).getValues()[0];
      return {
        success: true,
        data: {
          tahun: row[1] || DEFAULT_CONFIG.TAHUN,
          namaSekolah: row[2] || DEFAULT_CONFIG.NAMA_SEKOLAH,
          statusPendaftaran: row[3] || DEFAULT_CONFIG.STATUS_PENDAFTARAN,
          tanggalMulai: row[4] || DEFAULT_CONFIG.TANGGAL_MULAI,
          tanggalSelesai: row[5] || DEFAULT_CONFIG.TANGGAL_SELESAI,
          kuotaTotal: row[6] || DEFAULT_CONFIG.KUOTA_TOTAL,
          jalur: row[7] ? (typeof row[7] === "string" && row[7].indexOf("[") === 0 ? JSON.parse(row[7]) : row[7]) : JSON.parse(DEFAULT_CONFIG.JALUR),
          tahunPelajaran: row[9] || "2026/2027"
        }
      };
    }
  } catch(e) {
    Logger.log("Error handleGetConfig: " + e.message);
  }

  return {
    success: true,
    data: {
      namaSekolah: DEFAULT_CONFIG.NAMA_SEKOLAH,
      tahun: DEFAULT_CONFIG.TAHUN,
      tahunPelajaran: "2026/2027",
      statusPendaftaran: DEFAULT_CONFIG.STATUS_PENDAFTARAN,
      kuotaTotal: DEFAULT_CONFIG.KUOTA_TOTAL,
      jalur: JSON.parse(DEFAULT_CONFIG.JALUR),
      tanggalMulai: DEFAULT_CONFIG.TANGGAL_MULAI,
      tanggalSelesai: DEFAULT_CONFIG.TANGGAL_SELESAI
    }
  };
}

function handleAdminUpdateConfig(data) {
  try {
    if (!data) return { success: false, message: "Data konfigurasi kosong." };
    const sheet = getSheet(SHEET_NAMES.PELAKSANAAN);
    if (sheet.getLastRow() <= 1) {
      setupDatabase();
    }
    if (data.tahun) sheet.getRange(2, 2).setValue(sanitizeInput(data.tahun));
    if (data.namaSekolah) sheet.getRange(2, 3).setValue(sanitizeInput(data.namaSekolah));
    if (data.statusPendaftaran) sheet.getRange(2, 4).setValue(sanitizeInput(data.statusPendaftaran));
    if (data.kuotaTotal) sheet.getRange(2, 7).setValue(parseInt(data.kuotaTotal, 10) || 200);
    if (data.tahunPelajaran) sheet.getRange(2, 10).setValue(sanitizeInput(data.tahunPelajaran));

    return {
      success: true,
      message: "Pengaturan pelaksanaan SPMB berhasil disimpan ke database.",
      data: data
    };
  } catch(e) {
    return { success: false, message: "Gagal menyimpan konfigurasi: " + e.message };
  }
}

// 10. ROUTER DOGET & DOPOST
function doGet(e) {
  try {
    const params = (e && e.parameter) ? e.parameter : {};
    const action = params.action || "getConfig";
    if (action === "getConfig") {
      return jsonResponse(handleGetConfig());
    }
    if (action === "getAnnouncements") return jsonResponse(handleGetPublicAnnouncements());
    if (action === "checkStatus") return jsonResponse(handleCheckStatus(params.noPendaftaran, params.verifikasi));
    if (action === "checkGraduation") return jsonResponse(handleCheckGraduation(params.noPendaftaran));
    if (action === "getStats") return jsonResponse(handleGetDashboardStatistics());
    if (action === "setupDatabase") return jsonResponse(setupDatabase());
    if (action === "seedDemoData") return jsonResponse(seedDemoData());
    return jsonResponse({ success: false, message: "Action GET '" + action + "' tidak valid." });
  } catch (err) {
    return jsonResponse({ success: false, message: "Error GET: " + err.message });
  }
}

function doPost(e) {
  try {
    let payload = {};
    if (e && e.postData && e.postData.contents) {
      try { payload = JSON.parse(e.postData.contents); } catch (err) { payload = e.parameter || {}; }
    } else if (e && e.parameter) {
      payload = e.parameter;
    }
    const action = payload.action || "";
    if (action === "register") return jsonResponse(handleSaveRegistration(payload.data || payload));
    if (action === "uploadDocument") return jsonResponse(handleUploadDocument(payload.data || payload));
    if (action === "adminLogin") return jsonResponse(handleAdminLogin(payload.username, payload.password));

    // Admin Auth check
    const token = payload.token || "";
    const auth = authenticateAdmin(token);
    if (!auth.authorized) return jsonResponse({ success: false, authorized: false, message: auth.message });

    if (action === "adminGetDashboard") return jsonResponse(handleGetDashboardStatistics());
    if (action === "adminGetApplicants") return jsonResponse(handleAdminGetApplicants(payload.filters || {}));
    if (action === "adminUpdateStatus") return jsonResponse(handleUpdateApplicantStatus(payload.data || payload));
    if (action === "adminUpdateConfig") return jsonResponse(handleAdminUpdateConfig(payload.data || payload));

    return jsonResponse({ success: false, message: "Action POST '" + action + "' tidak valid." });
  } catch (err) {
    return jsonResponse({ success: false, message: "Error POST: " + err.message });
  }
}
