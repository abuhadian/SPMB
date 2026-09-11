/**
 * ============================================================================
 * SPMB SMP NEGERI 1 SEGAH - GOOGLE APPS SCRIPT BACKEND
 * File: Seleksi.gs
 * Fungsi: Logika seleksi calon murid, ranking otomatis, statistik dashboard,
 *         dan import CSV calon murid & nilai rapor
 * ============================================================================
 */

/**
 * Mengambil Statistik Dashboard untuk Admin & Publik
 */
function handleGetDashboardStatistics() {
  const pendaftarSheet = getSheet(SHEET_NAMES.PENDAFTAR);
  const rows = sheetToObjects(pendaftarSheet);

  let total = rows.length;
  let menunggu = 0;
  let terverifikasi = 0;
  let perluPerbaikan = 0;
  let lulus = 0;
  let tidakLulus = 0;

  const perJalur = {
    "Domisili": 0,
    "Afirmasi": 0,
    "Prestasi": 0,
    "Mutasi": 0
  };

  const perGender = {
    "Laki-laki": 0,
    "Perempuan": 0
  };

  rows.forEach(function(r) {
    const v = String(r["Status Verifikasi"] || "");
    const k = String(r["Status Kelulusan"] || "");
    const j = String(r["Jalur"] || "");
    const g = String(r["Jenis Kelamin"] || "");

    if (v === "Menunggu Verifikasi") menunggu++;
    else if (v === "Terverifikasi") terverifikasi++;
    else if (v === "Perlu Perbaikan") perluPerbaikan++;

    if (k === "Lulus") lulus++;
    else if (k === "Tidak Lulus") tidakLulus++;

    if (perJalur[j] !== undefined) perJalur[j]++;
    else perJalur[j] = 1;

    if (g.indexOf("Laki") !== -1) perGender["Laki-laki"]++;
    else if (g.indexOf("Perempuan") !== -1) perGender["Perempuan"]++;
  });

  const kuotaTotal = DEFAULT_CONFIG.KUOTA_TOTAL;
  const sisaKuota = Math.max(0, kuotaTotal - lulus);

  return {
    success: true,
    data: {
      totalPendaftar: total,
      menungguVerifikasi: menunggu,
      terverifikasi: terverifikasi,
      perluPerbaikan: perluPerbaikan,
      lulus: lulus,
      tidakLulus: tidakLulus,
      kuotaTotal: kuotaTotal,
      sisaKuota: sisaKuota,
      chartJalur: perJalur,
      chartGender: perGender,
      chartStatus: {
        "Menunggu": menunggu,
        "Terverifikasi": terverifikasi,
        "Perbaikan": perluPerbaikan,
        "Lulus": lulus,
        "Tidak Lulus": tidakLulus
      }
    }
  };
}

/**
 * Mengambil daftar pendaftar lengkap untuk admin (dengan filter & search)
 */
function handleAdminGetApplicants(filters) {
  const pendaftarSheet = getSheet(SHEET_NAMES.PENDAFTAR);
  const rows = sheetToObjects(pendaftarSheet);
  const ortuRows = sheetToObjects(getSheet(SHEET_NAMES.ORANG_TUA));
  const dokRows = sheetToObjects(getSheet(SHEET_NAMES.DOKUMEN));

  // Map untuk join data cepat
  const ortuMap = {};
  ortuRows.forEach(o => { ortuMap[o["Nomor Pendaftaran"]] = o; });

  const dokMap = {};
  dokRows.forEach(d => { dokMap[d["Nomor Pendaftaran"]] = d; });

  let results = rows.map(function(r) {
    const no = r["Nomor Pendaftaran"];
    return {
      ...r,
      orangTua: ortuMap[no] || null,
      dokumen: dokMap[no] || null
    };
  });

  // Filter Search
  if (filters && filters.search) {
    const q = String(filters.search).toLowerCase();
    results = results.filter(function(r) {
      return (
        String(r["Nama Lengkap"] || "").toLowerCase().indexOf(q) !== -1 ||
        String(r["Nomor Pendaftaran"] || "").toLowerCase().indexOf(q) !== -1 ||
        String(r["NISN"] || "").toLowerCase().indexOf(q) !== -1 ||
        String(r["Nama SD/MI"] || "").toLowerCase().indexOf(q) !== -1
      );
    });
  }

  // Filter Jalur
  if (filters && filters.jalur && filters.jalur !== "semua") {
    results = results.filter(r => String(r["Jalur"]).toLowerCase() === filters.jalur.toLowerCase());
  }

  // Filter Status Verifikasi
  if (filters && filters.statusVerif && filters.statusVerif !== "semua") {
    results = results.filter(r => r["Status Verifikasi"] === filters.statusVerif);
  }

  // Filter Status Kelulusan
  if (filters && filters.statusLulus && filters.statusLulus !== "semua") {
    results = results.filter(r => r["Status Kelulusan"] === filters.statusLulus);
  }

  // Filter Jenis Kelamin
  if (filters && filters.gender && filters.gender !== "semua") {
    results = results.filter(r => r["Jenis Kelamin"] === filters.gender);
  }

  return {
    success: true,
    total: results.length,
    data: results
  };
}

/**
 * Update Status Pendaftar (Verifikasi Berkas, Seleksi, dan Kelulusan)
 */
function handleUpdateApplicantStatus(params) {
  if (!params || !params.nomorPendaftaran) {
    return { success: false, message: "Nomor pendaftaran wajib disediakan." };
  }

  const sheet = getSheet(SHEET_NAMES.PENDAFTAR);
  const lastRow = sheet.getLastRow();
  if (lastRow <= 1) {
    return { success: false, message: "Data pendaftar kosong." };
  }

  const values = sheet.getRange(2, 2, lastRow - 1, 1).getValues();
  let targetRow = -1;

  for (let i = 0; i < values.length; i++) {
    if (String(values[i][0]).trim() === String(params.nomorPendaftaran).trim()) {
      targetRow = i + 2;
      break;
    }
  }

  if (targetRow === -1) {
    return { success: false, message: "Pendaftar dengan nomor tersebut tidak ditemukan." };
  }

  // Kolom:
  // 28: Status Verifikasi (Kolom AB)
  // 29: Status Seleksi (Kolom AC)
  // 30: Status Kelulusan (Kolom AD)
  // 31: Catatan Admin (Kolom AE)
  // 32: Tanggal Update (Kolom AF)

  if (params.statusVerifikasi !== undefined) {
    sheet.getRange(targetRow, 28).setValue(params.statusVerifikasi);
  }
  if (params.statusSeleksi !== undefined) {
    sheet.getRange(targetRow, 29).setValue(params.statusSeleksi);
  }
  if (params.statusKelulusan !== undefined) {
    sheet.getRange(targetRow, 30).setValue(params.statusKelulusan);
  }
  if (params.catatanAdmin !== undefined) {
    sheet.getRange(targetRow, 31).setValue(params.catatanAdmin);
  }
  sheet.getRange(targetRow, 32).setValue(formatDateTimeID(new Date()));

  return {
    success: true,
    message: "Status pendaftar " + params.nomorPendaftaran + " berhasil diperbarui."
  };
}

/**
 * Menjalankan Proses Seleksi Otomatis Berdasarkan Kuota Jalur atau Bobot Nilai
 */
function handleRunSelection(params) {
  const pendaftarSheet = getSheet(SHEET_NAMES.PENDAFTAR);
  const rows = sheetToObjects(pendaftarSheet);
  
  if (rows.length === 0) {
    return { success: false, message: "Tidak ada data pendaftar untuk diseleksi." };
  }

  const kuotaPerJalur = params.kuotaJalur || {
    "Domisili": 120,
    "Afirmasi": 30,
    "Prestasi": 40,
    "Mutasi": 10
  };

  let countLulus = 0;
  let countTidakLulus = 0;

  // Kelompokkan pendaftar yang status verifikasinya sudah "Terverifikasi"
  const groupedByJalur = {};
  rows.forEach((r, idx) => {
    const jalur = r["Jalur"] || "Domisili";
    if (!groupedByJalur[jalur]) groupedByJalur[jalur] = [];
    groupedByJalur[jalur].push({ ...r, rowIndex: idx + 2 });
  });

  const now = formatDateTimeID(new Date());

  for (let jalur in groupedByJalur) {
    const list = groupedByJalur[jalur];
    const kuota = kuotaPerJalur[jalur] || 10;

    // Filter yang terverifikasi diutamakan
    list.sort((a, b) => {
      // Yang terverifikasi di atas
      if (a["Status Verifikasi"] === "Terverifikasi" && b["Status Verifikasi"] !== "Terverifikasi") return -1;
      if (a["Status Verifikasi"] !== "Terverifikasi" && b["Status Verifikasi"] === "Terverifikasi") return 1;
      // Urutkan berdasarkan waktu daftar
      return new Date(a["Timestamp"]) - new Date(b["Timestamp"]);
    });

    list.forEach((candidate, i) => {
      const isLulus = candidate["Status Verifikasi"] === "Terverifikasi" && i < kuota;
      const statusLulus = isLulus ? "Lulus" : "Tidak Lulus";
      const statusSeleksi = isLulus ? "Memenuhi Syarat" : "Tidak Memenuhi Kuota";
      const catatan = isLulus 
        ? "Dinyatakan LULUS seleksi jalur " + jalur + "." 
        : "Belum memenuhi kuota jalur " + jalur + ".";

      pendaftarSheet.getRange(candidate.rowIndex, 29).setValue(statusSeleksi);
      pendaftarSheet.getRange(candidate.rowIndex, 30).setValue(statusLulus);
      pendaftarSheet.getRange(candidate.rowIndex, 31).setValue(catatan);
      pendaftarSheet.getRange(candidate.rowIndex, 32).setValue(now);

      if (isLulus) countLulus++;
      else countTidakLulus++;
    });
  }

  return {
    success: true,
    message: "Proses seleksi berhasil dijalankan. " + countLulus + " siswa LULUS, " + countTidakLulus + " TIDAK LULUS.",
    data: { lulus: countLulus, tidakLulus: countTidakLulus }
  };
}

/**
 * Import Pendaftar dari CSV
 */
function handleImportApplicantsCSV(csvString) {
  if (!csvString || typeof csvString !== "string") {
    return { success: false, message: "Data CSV kosong." };
  }

  const lines = csvString.trim().split(/\r\n|\n/);
  if (lines.length <= 1) {
    return { success: false, message: "File CSV tidak memiliki baris data." };
  }

  const headers = lines[0].split(",").map(h => h.trim().replace(/^"|"$/g, ""));
  let successCount = 0;
  let failCount = 0;
  const errors = [];

  const pendaftarSheet = getSheet(SHEET_NAMES.PENDAFTAR);
  const ortuSheet = getSheet(SHEET_NAMES.ORANG_TUA);
  const existingRows = sheetToObjects(pendaftarSheet);
  const existingNiks = new Set(existingRows.map(r => String(r["NIK"]).trim()));

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    // Parser CSV sederhana
    const cols = line.split(",").map(c => c.trim().replace(/^"|"$/g, ""));
    const rowNum = i + 1;

    // Minimal kolom: NISN, NIK, Nama Lengkap, Jenis Kelamin, Jalur
    const nik = cols[1] ? cols[1].replace(/\D/g, "") : "";
    const nama = cols[2] || "";
    const jk = cols[3] || "Laki-laki";
    const jalur = cols[4] || "Domisili";

    if (!nama) {
      failCount++;
      errors.push("Baris " + rowNum + ": Nama Lengkap kosong.");
      continue;
    }

    if (nik.length !== 16) {
      failCount++;
      errors.push("Baris " + rowNum + " (" + nama + "): NIK harus 16 digit angka.");
      continue;
    }

    if (existingNiks.has(nik)) {
      failCount++;
      errors.push("Baris " + rowNum + " (" + nama + "): NIK " + nik + " sudah terdaftar.");
      continue;
    }

    try {
      const now = formatDateTimeID(new Date());
      const noPendaftar = generateRegistrationNumber("2026");
      const id = "PND-" + Utilities.getUuid().substring(0, 8).toUpperCase();

      pendaftarSheet.appendRow([
        id, noPendaftar, now, "2026", cols[0] || "", nik, nama, "",
        jk, cols[5] || "Segah", cols[6] || "2013-01-01", "Islam",
        cols[7] || "", cols[8] || "Segah", "01", "01", "Segah",
        "Segah", "Berau", "Kalimantan Timur", "77353", cols[9] || "",
        "", cols[10] || "SD Negeri", "", "2026", jalur,
        "Menunggu Verifikasi", "Dalam Proses", "Dalam Proses",
        "Hasil import data CSV.", now
      ]);

      ortuSheet.appendRow([
        "ORT-" + id.replace("PND-", ""), noPendaftar,
        "", cols[11] || "Ayah " + nama, "", "", "", "",
        "", cols[12] || "Ibu " + nama, "", "", "", "",
        "-", "-", "-", "-"
      ]);

      existingNiks.add(nik);
      successCount++;
    } catch (e) {
      failCount++;
      errors.push("Baris " + rowNum + ": Gagal menyimpan - " + e.message);
    }
  }

  return {
    success: true,
    message: "Import selesai. Berhasil: " + successCount + ", Gagal: " + failCount,
    data: {
      berhasil: successCount,
      gagal: failCount,
      errors: errors
    }
  };
}

/**
 * Import Nilai Rapor dari CSV
 */
function handleImportRaportCSV(csvString) {
  if (!csvString || typeof csvString !== "string") {
    return { success: false, message: "Data CSV nilai rapor kosong." };
  }

  const lines = csvString.trim().split(/\r\n|\n/);
  if (lines.length <= 1) {
    return { success: false, message: "File CSV tidak memiliki baris data." };
  }

  const sheet = getSheet(SHEET_NAMES.NILAI_RAPOR);
  let successCount = 0;
  let failCount = 0;
  const errors = [];

  // Ambil daftar pendaftar yang sah
  const pendaftarRows = sheetToObjects(getSheet(SHEET_NAMES.PENDAFTAR));
  const validRegNos = new Set(pendaftarRows.map(r => String(r["Nomor Pendaftaran"]).trim()));

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    // Header: Nomor Pendaftaran,NISN,Nama,Semester,Mata Pelajaran,Nilai,Tahun Pelajaran
    const cols = line.split(",").map(c => c.trim().replace(/^"|"$/g, ""));
    const rowNum = i + 1;
    const noPendaftaran = cols[0] || "";
    const nilai = parseFloat(cols[5]);

    if (!validRegNos.has(noPendaftaran)) {
      failCount++;
      errors.push("Baris " + rowNum + ": Nomor Pendaftaran '" + noPendaftaran + "' belum terdaftar di sistem.");
      continue;
    }

    if (isNaN(nilai) || nilai < 0 || nilai > 100) {
      failCount++;
      errors.push("Baris " + rowNum + " (" + noPendaftaran + "): Nilai harus angka antara 0 dan 100.");
      continue;
    }

    sheet.appendRow([
      "RAP-" + Utilities.getUuid().substring(0, 8).toUpperCase(),
      noPendaftaran,
      cols[1] || "",
      cols[2] || "",
      cols[3] || "Semester 1",
      cols[4] || "Rata-rata",
      nilai,
      cols[6] || "2025/2026"
    ]);

    successCount++;
  }

  return {
    success: true,
    message: "Import nilai rapor selesai. Berhasil: " + successCount + ", Gagal: " + failCount,
    data: {
      berhasil: successCount,
      gagal: failCount,
      errors: errors
    }
  };
}
