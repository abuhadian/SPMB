/**
 * ============================================================================
 * SPMB SMP NEGERI 1 SEGAH - GOOGLE APPS SCRIPT BACKEND
 * File: Pendaftaran.gs
 * Fungsi: Logika pendaftaran online, lock service nomor pendaftaran, cek status
 * ============================================================================
 */

/**
 * Menghasilkan Nomor Pendaftaran Unik & Berurutan (Format: SPMB-2026-0001)
 * Menggunakan LockService untuk mencegah race condition / duplikasi nomor
 */
function generateRegistrationNumber(year) {
  if (!year) year = "2026";
  const lock = LockService.getScriptLock();
  try {
    // Tunggu maksimal 15 detik untuk mendapatkan antrean lock
    lock.waitLock(15000);
    
    const sheet = getSheet(SHEET_NAMES.PENDAFTAR);
    const lastRow = sheet.getLastRow();
    let maxNumber = 0;
    
    if (lastRow > 1) {
      // Ambil kolom Nomor Pendaftaran (Kolom B / index 2)
      const regNums = sheet.getRange(2, 2, lastRow - 1, 1).getValues();
      const prefix = "SPMB-" + year + "-";
      
      for (let i = 0; i < regNums.length; i++) {
        const val = String(regNums[i][0]).trim();
        if (val.indexOf(prefix) === 0) {
          const numPart = parseInt(val.replace(prefix, ""), 10);
          if (!isNaN(numPart) && numPart > maxNumber) {
            maxNumber = numPart;
          }
        }
      }
    }
    
    const nextNumber = maxNumber + 1;
    // Format 4 digit: 0001, 0002, dst
    const formattedNum = ("0000" + nextNumber).slice(-4);
    return "SPMB-" + year + "-" + formattedNum;
  } catch (e) {
    throw new Error("Gagal memperoleh antrean pendaftaran: " + e.message);
  } finally {
    lock.releaseLock();
  }
}

/**
 * Simpan Data Pendaftaran Baru
 */
function handleSaveRegistration(data) {
  if (!data) {
    return { success: false, message: "Data pendaftaran kosong" };
  }

  // Validasi Server-Side
  const errors = [];
  
  if (!data.namaLengkap || String(data.namaLengkap).trim() === "") {
    errors.push("Nama lengkap calon murid wajib diisi.");
  }
  
  const nik = String(data.nik || "").replace(/\D/g, "");
  if (nik.length !== 16) {
    errors.push("NIK calon murid harus tepat 16 digit angka.");
  }
  
  if (data.nisn && String(data.nisn).trim() !== "") {
    const nisn = String(data.nisn).replace(/\D/g, "");
    if (nisn.length !== 10) {
      errors.push("NISN harus terdiri dari 10 digit angka jika diisi.");
    }
  }

  if (!data.jenisKelamin) {
    errors.push("Jenis kelamin wajib dipilih.");
  }

  if (!data.tanggalLahir) {
    errors.push("Tanggal lahir wajib diisi.");
  }

  if (!data.jalur) {
    errors.push("Jalur pendaftaran wajib dipilih.");
  }

  if (errors.length > 0) {
    return { success: false, message: "Validasi data gagal", errors: errors };
  }

  const pendaftarSheet = getSheet(SHEET_NAMES.PENDAFTAR);
  const ortuSheet = getSheet(SHEET_NAMES.ORANG_TUA);
  const prestasiSheet = getSheet(SHEET_NAMES.PRESTASI);
  const dokumenSheet = getSheet(SHEET_NAMES.DOKUMEN);

  // Cek duplikasi NIK di sheet PENDAFTAR
  const lastRow = pendaftarSheet.getLastRow();
  if (lastRow > 1) {
    const nikValues = pendaftarSheet.getRange(2, 6, lastRow - 1, 1).getValues(); // Kolom F: NIK
    for (let i = 0; i < nikValues.length; i++) {
      if (String(nikValues[i][0]).trim() === nik) {
        return {
          success: false,
          message: "NIK " + nik + " sudah terdaftar di sistem SPMB! Silakan gunakan menu 'Cek Status Pendaftaran' untuk melihat status pendaftaran Anda."
        };
      }
    }
  }

  const tahun = data.tahun || "2026";
  const noPendaftaran = generateRegistrationNumber(tahun);
  const now = formatDateTimeID(new Date());
  const newId = "PND-" + Utilities.getUuid().substring(0, 8).toUpperCase();

  // 1. Simpan ke sheet PENDAFTAR
  pendaftarSheet.appendRow([
    newId,
    noPendaftaran,
    now,
    tahun,
    sanitizeInput(data.nisn),
    sanitizeInput(nik),
    sanitizeInput(data.namaLengkap),
    sanitizeInput(data.namaPanggilan),
    sanitizeInput(data.jenisKelamin),
    sanitizeInput(data.tempatLahir),
    sanitizeInput(data.tanggalLahir),
    sanitizeInput(data.agama),
    sanitizeInput(data.nomorKk),
    sanitizeInput(data.alamat),
    sanitizeInput(data.rt),
    sanitizeInput(data.rw),
    sanitizeInput(data.desa),
    sanitizeInput(data.kecamatan),
    sanitizeInput(data.kabupaten || "Berau"),
    sanitizeInput(data.provinsi || "Kalimantan Timur"),
    sanitizeInput(data.kodePos),
    sanitizeInput(data.nomorHp),
    sanitizeInput(data.email),
    sanitizeInput(data.namaSd),
    sanitizeInput(data.npsnSd),
    sanitizeInput(data.tahunLulus),
    sanitizeInput(data.jalur),
    "Menunggu Verifikasi",   // Status Verifikasi awal
    "Dalam Proses",          // Status Seleksi awal
    "Dalam Proses",          // Status Kelulusan awal
    "Pendaftaran online berhasil diterima. Menunggu verifikasi berkas oleh panitia.", // Catatan
    now                      // Tanggal update
  ]);

  // 2. Simpan ke sheet ORANG_TUA
  ortuSheet.appendRow([
    "ORT-" + Utilities.getUuid().substring(0, 8).toUpperCase(),
    noPendaftaran,
    sanitizeInput(data.nikAyah),
    sanitizeInput(data.namaAyah),
    sanitizeInput(data.pendidikanAyah),
    sanitizeInput(data.pekerjaanAyah),
    sanitizeInput(data.penghasilanAyah),
    sanitizeInput(data.hpAyah),
    sanitizeInput(data.nikIbu),
    sanitizeInput(data.namaIbu),
    sanitizeInput(data.pendidikanIbu),
    sanitizeInput(data.pekerjaanIbu),
    sanitizeInput(data.penghasilanIbu),
    sanitizeInput(data.hpIbu),
    sanitizeInput(data.namaWali),
    sanitizeInput(data.hubunganWali),
    sanitizeInput(data.pekerjaanWali),
    sanitizeInput(data.hpWali)
  ]);

  // 3. Simpan ke sheet PRESTASI (jika ada)
  if (data.prestasi && Array.isArray(data.prestasi) && data.prestasi.length > 0) {
    data.prestasi.forEach(function(p) {
      if (p.namaPrestasi && p.namaPrestasi.trim() !== "") {
        prestasiSheet.appendRow([
          "PRS-" + Utilities.getUuid().substring(0, 8).toUpperCase(),
          noPendaftaran,
          sanitizeInput(p.jenisPrestasi),
          sanitizeInput(p.tingkat),
          sanitizeInput(p.namaPrestasi),
          sanitizeInput(p.tahun),
          sanitizeInput(p.penyelenggara),
          sanitizeInput(p.keterangan)
        ]);
      }
    });
  }

  // 4. Simpan ke sheet DOKUMEN
  const docs = data.dokumenUrls || {};
  dokumenSheet.appendRow([
    "DOK-" + Utilities.getUuid().substring(0, 8).toUpperCase(),
    noPendaftaran,
    sanitizeInput(docs.kk || ""),
    sanitizeInput(docs.akta || ""),
    sanitizeInput(docs.ijazah || ""),
    sanitizeInput(docs.lain || ""),
    now
  ]);

  return {
    success: true,
    message: "Pendaftaran berhasil disimpan!",
    data: {
      nomorPendaftaran: noPendaftaran,
      namaLengkap: data.namaLengkap,
      jalur: data.jalur,
      nisn: data.nisn || "-",
      tanggalPendaftaran: now
    }
  };
}

/**
 * Cek Status Pendaftaran oleh Siswa / Orang Tua
 * Keamanan: Memerlukan Nomor Pendaftaran + (NISN ATAU Tanggal Lahir)
 * Tidak menampilkan NIK lengkap atau data sensitif lainnya.
 */
function handleCheckStatus(noPendaftaran, verifikasi) {
  if (!noPendaftaran || !verifikasi) {
    return {
      success: false,
      message: "Nomor Pendaftaran dan Verifikasi (NISN / Tanggal Lahir) wajib diisi."
    };
  }

  const sheet = getSheet(SHEET_NAMES.PENDAFTAR);
  const rows = sheetToObjects(sheet);
  
  const searchNo = String(noPendaftaran).trim().toUpperCase();
  const searchVerif = String(verifikasi).trim().replace(/[-\/]/g, ""); // normalisasi tanggal/nisn

  let applicant = null;
  for (let i = 0; i < rows.length; i++) {
    const r = rows[i];
    if (String(r["Nomor Pendaftaran"]).trim().toUpperCase() === searchNo) {
      // Bandingkan NISN atau Tanggal Lahir
      const rNisn = String(r["NISN"] || "").trim();
      const rTgl = String(r["Tanggal Lahir"] || "").trim().replace(/[-\/]/g, "");
      
      if ((rNisn && rNisn === searchVerif) || (rTgl && rTgl === searchVerif) || (r["Tanggal Lahir"] && r["Tanggal Lahir"].indexOf(verifikasi.trim()) !== -1)) {
        applicant = r;
        break;
      }
    }
  }

  if (!applicant) {
    return {
      success: false,
      message: "Data pendaftaran tidak ditemukan! Pastikan Nomor Pendaftaran dan NISN / Tanggal Lahir Anda sudah benar."
    };
  }

  // Kembalikan hanya informasi publik yang aman
  return {
    success: true,
    message: "Data status pendaftaran ditemukan",
    data: {
      nomorPendaftaran: applicant["Nomor Pendaftaran"],
      namaLengkap: applicant["Nama Lengkap"],
      jalur: applicant["Jalur"],
      asalSekolah: applicant["Nama SD/MI"],
      statusVerifikasi: applicant["Status Verifikasi"],
      statusSeleksi: applicant["Status Seleksi"],
      statusKelulusan: applicant["Status Kelulusan"],
      catatanAdmin: applicant["Catatan Admin"] || "Tidak ada catatan.",
      tanggalUpdate: applicant["Tanggal Update"] || applicant["Timestamp"],
      tanggalDaftar: applicant["Timestamp"]
    }
  };
}
