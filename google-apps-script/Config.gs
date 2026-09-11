/**
 * ============================================================================
 * SPMB SMP NEGERI 1 SEGAH - GOOGLE APPS SCRIPT BACKEND
 * File: Config.gs
 * Fungsi: Pengelolaan konfigurasi, Script Properties, dan konstanta sistem
 * ============================================================================
 */

// Konstanta Nama Sheet Database
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

// Pengaturan Default Sekolah
const DEFAULT_CONFIG = {
  TAHUN: "2026",
  NAMA_SEKOLAH: "SMP Negeri 1 Segah",
  KUOTA_TOTAL: 200,
  STATUS_PENDAFTARAN: "buka", // buka | tutup
  TANGGAL_MULAI: "2026-06-01",
  TANGGAL_SELESAI: "2026-06-20",
  JALUR: JSON.stringify([
    { id: "domisili", nama: "Zonasi / Domisili", kuota: 120 },
    { id: "afirmasi", nama: "Afirmasi", kuota: 30 },
    { id: "prestasi", nama: "Prestasi", kuota: 40 },
    { id: "mutasi", nama: "Perpindahan Tugas Orang Tua", kuota: 10 }
  ])
};

/**
 * Mengambil Property dari PropertiesService secara aman.
 * Jika SPREADSHEET_ID tidak ada di Script Properties, gunakan spreadsheet aktif tempat script terpasang.
 */
function getSpreadsheet() {
  const props = PropertiesService.getScriptProperties();
  const sheetId = props.getProperty("SPREADSHEET_ID");
  
  if (sheetId && sheetId.trim() !== "" && sheetId !== "ISI_ID_GOOGLE_SHEET") {
    try {
      return SpreadsheetApp.openById(sheetId);
    } catch (e) {
      Logger.log("Gagal membuka via SPREADSHEET_ID, fallback ke active: " + e.message);
    }
  }
  
  try {
    return SpreadsheetApp.getActiveSpreadsheet();
  } catch (err) {
    throw new Error("Spreadsheet tidak ditemukan! Pastikan Script Properties 'SPREADSHEET_ID' diatur atau Apps Script dibuka dari Spreadsheet langsung.");
  }
}

/**
 * Mengambil ID Folder Google Drive untuk upload dokumen calon murid
 */
function getDriveFolder() {
  const props = PropertiesService.getScriptProperties();
  const folderId = props.getProperty("DRIVE_FOLDER_ID");
  
  if (folderId && folderId.trim() !== "" && folderId !== "ISI_ID_FOLDER_GOOGLE_DRIVE") {
    try {
      return DriveApp.getFolderById(folderId);
    } catch (e) {
      Logger.log("Folder Drive tidak ditemukan via ID, menggunakan folder default SPMB: " + e.message);
    }
  }
  
  // Buat atau cari folder default "SPMB_SMPN1_SEGAH_DOKUMEN" di Google Drive root jika belum diatur
  const folderName = "SPMB_SMPN1_SEGAH_DOKUMEN";
  const existingFolders = DriveApp.getFoldersByName(folderName);
  if (existingFolders.hasNext()) {
    const folder = existingFolders.next();
    props.setProperty("DRIVE_FOLDER_ID", folder.getId());
    return folder;
  } else {
    const newFolder = DriveApp.createFolder(folderName);
    // Atur izin folder agar file dapat diakses oleh admin/panitia
    props.setProperty("DRIVE_FOLDER_ID", newFolder.getId());
    return newFolder;
  }
}

/**
 * Mengambil Secret Key untuk enkripsi/verifikasi token Admin
 */
function getAuthSecret() {
  const props = PropertiesService.getScriptProperties();
  let secret = props.getProperty("AUTH_SECRET");
  if (!secret) {
    secret = "SMPN1_SEGAH_SPMB_SECRET_" + Utilities.getUuid();
    props.setProperty("AUTH_SECRET", secret);
  }
  return secret;
}

/**
 * Mengambil konfigurasi pelaksanaan SPMB terkini (termasuk Tahun Pelajaran)
 */
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

/**
 * Memperbarui pengaturan pelaksanaan SPMB (Tahun Pelajaran manual, kuota, nama, dll)
 */
function handleAdminUpdateConfig(data) {
  try {
    if (!data) return { success: false, message: "Data konfigurasi kosong." };
    const sheet = getSheet(SHEET_NAMES.PELAKSANAAN);
    if (sheet.getLastRow() <= 1) {
      setupDatabase();
    }
    
    // Baris 2 sheet PELAKSANAAN
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
