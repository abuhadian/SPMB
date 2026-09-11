/**
 * ============================================================================
 * SPMB SMP NEGERI 1 SEGAH - GOOGLE APPS SCRIPT BACKEND
 * File: Pengumuman.gs
 * Fungsi: Manajemen pengumuman publik dan pengecekan kelulusan calon murid
 * ============================================================================
 */

/**
 * Mengambil daftar pengumuman publik (Status = "Publik")
 */
function handleGetPublicAnnouncements() {
  const sheet = getSheet(SHEET_NAMES.PENGUMUMAN);
  const rows = sheetToObjects(sheet);

  const publicAnnouncements = rows
    .filter(r => r["Status"] === "Publik")
    .map(r => ({
      id: r["ID"],
      judul: r["Judul"],
      isi: r["Isi"],
      tanggal: r["Tanggal"],
      link: r["Link"]
    }));

  return {
    success: true,
    data: publicAnnouncements
  };
}

/**
 * Pengecekan Hasil Kelulusan Murid Baru
 */
function handleCheckGraduation(noPendaftaran) {
  if (!noPendaftaran) {
    return { success: false, message: "Nomor pendaftaran wajib diisi." };
  }

  const sheet = getSheet(SHEET_NAMES.PENDAFTAR);
  const rows = sheetToObjects(sheet);
  const cleanNo = String(noPendaftaran).trim().toUpperCase();

  let student = null;
  for (let i = 0; i < rows.length; i++) {
    if (String(rows[i]["Nomor Pendaftaran"]).trim().toUpperCase() === cleanNo) {
      student = rows[i];
      break;
    }
  }

  if (!student) {
    return {
      success: false,
      message: "Nomor Pendaftaran " + cleanNo + " tidak ditemukan dalam sistem SPMB."
    };
  }

  const statusLulus = student["Status Kelulusan"] || "Dalam Proses";
  let pesan = "";
  if (statusLulus === "Lulus") {
    pesan = "Selamat, Anda dinyatakan LULUS sebagai murid baru SMP Negeri 1 Segah Tahun Ajaran 2026/2027. Silakan segera melakukan daftar ulang sesuai jadwal yang ditentukan.";
  } else if (statusLulus === "Tidak Lulus") {
    pesan = "Terima kasih telah mengikuti proses SPMB SMP Negeri 1 Segah. Jangan berkecil hati dan tetap semangat dalam melanjutkan pendidikan.";
  } else {
    pesan = "Hasil seleksi pendaftaran Anda saat ini masih dalam proses peninjauan oleh Panitia SPMB.";
  }

  return {
    success: true,
    data: {
      nomorPendaftaran: student["Nomor Pendaftaran"],
      namaLengkap: student["Nama Lengkap"],
      jalur: student["Jalur"],
      statusKelulusan: statusLulus,
      pesan: pesan,
      tanggalUpdate: student["Tanggal Update"] || student["Timestamp"]
    }
  };
}

/**
 * Simpan atau Perbarui Pengumuman oleh Admin
 */
function handleSaveAnnouncement(params) {
  if (!params.judul || !params.isi) {
    return { success: false, message: "Judul dan isi pengumuman wajib diisi." };
  }

  const sheet = getSheet(SHEET_NAMES.PENGUMUMAN);
  const now = formatDateTimeID(new Date()).split(" ")[0]; // YYYY-MM-DD

  if (params.id) {
    // Mode Update
    const lastRow = sheet.getLastRow();
    if (lastRow > 1) {
      const ids = sheet.getRange(2, 1, lastRow - 1, 1).getValues();
      for (let i = 0; i < ids.length; i++) {
        if (String(ids[i][0]).trim() === String(params.id).trim()) {
          const rowNum = i + 2;
          sheet.getRange(rowNum, 2).setValue(params.judul);
          sheet.getRange(rowNum, 3).setValue(params.isi);
          sheet.getRange(rowNum, 4).setValue(params.tanggal || now);
          sheet.getRange(rowNum, 5).setValue(params.status || "Publik");
          sheet.getRange(rowNum, 6).setValue(params.link || "");
          return { success: true, message: "Pengumuman berhasil diperbarui." };
        }
      }
    }
  }

  // Mode Tambah Baru
  const newId = "PGM-" + Utilities.getUuid().substring(0, 6).toUpperCase();
  sheet.appendRow([
    newId,
    params.judul,
    params.isi,
    params.tanggal || now,
    params.status || "Publik",
    params.link || ""
  ]);

  return { success: true, message: "Pengumuman baru berhasil dipublikasikan." };
}

/**
 * Hapus Pengumuman oleh Admin
 */
function handleDeleteAnnouncement(id) {
  if (!id) return { success: false, message: "ID Pengumuman tidak ditemukan." };

  const sheet = getSheet(SHEET_NAMES.PENGUMUMAN);
  const lastRow = sheet.getLastRow();
  if (lastRow <= 1) return { success: false, message: "Data pengumuman kosong." };

  const ids = sheet.getRange(2, 1, lastRow - 1, 1).getValues();
  for (let i = 0; i < ids.length; i++) {
    if (String(ids[i][0]).trim() === String(id).trim()) {
      sheet.deleteRow(i + 2);
      return { success: true, message: "Pengumuman berhasil dihapus." };
    }
  }

  return { success: false, message: "Pengumuman tidak ditemukan." };
}
