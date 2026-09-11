/**
 * ============================================================================
 * SPMB SMP NEGERI 1 SEGAH - GOOGLE APPS SCRIPT BACKEND
 * File: Dokumen.gs
 * Fungsi: Upload file dokumen pendaftar ke Google Drive dan integrasi Sheet DOKUMEN
 * ============================================================================
 */

/**
 * Menerima file dalam bentuk Base64 dan menyimpannya ke Google Drive
 */
function handleUploadDocument(params) {
  try {
    if (!params.base64Data || !params.fileName) {
      return { success: false, message: "Data file tidak lengkap." };
    }

    const folder = getDriveFolder();
    
    // Ekstrak base64 content
    let base64 = params.base64Data;
    if (base64.indexOf("base64,") !== -1) {
      base64 = base64.split("base64,")[1];
    }
    
    const decodedBytes = Utilities.base64Decode(base64);
    
    // Periksa batas ukuran file (maks 2MB)
    if (decodedBytes.length > 2.5 * 1024 * 1024) {
      return { success: false, message: "Ukuran file melebihi batas maksimum (2.5 MB)." };
    }

    // Format nama file agar rapi dan mudah diidentifikasi:
    // [NO_PENDAFTARAN]_[JENIS_DOKUMEN]_[NAMA_ASLI]
    const regNo = params.noPendaftaran ? String(params.noPendaftaran).replace(/[^a-zA-Z0-9_-]/g, "") : "TEMP";
    const docType = params.documentType ? String(params.documentType).toUpperCase() : "DOC";
    const cleanFileName = regNo + "_" + docType + "_" + params.fileName.replace(/[^a-zA-Z0-9._-]/g, "_");

    const mimeType = params.mimeType || "application/octet-stream";
    const blob = Utilities.newBlob(decodedBytes, mimeType, cleanFileName);
    
    const file = folder.createFile(blob);
    // Atur izin agar file dapat dilihat oleh siapapun yang memiliki link (view-only)
    file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);

    const fileUrl = file.getUrl();
    const fileId = file.getId();

    // Jika noPendaftaran disediakan, update langsung sheet DOKUMEN
    if (params.noPendaftaran && params.documentType) {
      updateDocumentSheet(params.noPendaftaran, params.documentType, fileUrl);
    }

    return {
      success: true,
      message: "Dokumen berhasil diunggah ke Google Drive.",
      data: {
        fileId: fileId,
        fileName: cleanFileName,
        fileUrl: fileUrl
      }
    };
  } catch (err) {
    Logger.log("Error handleUploadDocument: " + err.message);
    return {
      success: false,
      message: "Gagal mengunggah dokumen: " + err.message
    };
  }
}

/**
 * Update link file pada sheet DOKUMEN
 */
function updateDocumentSheet(noPendaftaran, docType, fileUrl) {
  try {
    const sheet = getSheet(SHEET_NAMES.DOKUMEN);
    const lastRow = sheet.getLastRow();
    if (lastRow <= 1) return;

    // Cari baris berdasarkan Nomor Pendaftaran (Kolom B / index 2)
    const values = sheet.getRange(2, 2, lastRow - 1, 1).getValues();
    let targetRow = -1;
    for (let i = 0; i < values.length; i++) {
      if (String(values[i][0]).trim() === String(noPendaftaran).trim()) {
        targetRow = i + 2; // offset header
        break;
      }
    }

    let colIndex = -1;
    const type = String(docType).toLowerCase();
    if (type === "kk") colIndex = 3;             // Kolom C
    else if (type === "akta") colIndex = 4;       // Kolom D
    else if (type === "ijazah" || type === "skl") colIndex = 5; // Kolom E
    else colIndex = 6;                           // Kolom F (Dokumen Lain)

    if (targetRow !== -1 && colIndex !== -1) {
      sheet.getRange(targetRow, colIndex).setValue(fileUrl);
      sheet.getRange(targetRow, 7).setValue(formatDateTimeID(new Date())); // Kolom G: Timestamp
    }
  } catch (e) {
    Logger.log("Error updateDocumentSheet: " + e.message);
  }
}
