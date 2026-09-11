/**
 * ============================================================================
 * SPMB SMP NEGERI 1 SEGAH - GOOGLE APPS SCRIPT BACKEND
 * File: Utils.gs
 * Fungsi: Helper response JSON, security hash, sanitasi, dan formatting
 * ============================================================================
 */

/**
 * Format standar Response JSON untuk API
 */
function jsonResponse(data) {
  return ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

/**
 * Hash password menggunakan algoritma SHA-256
 */
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

/**
 * Membuat session token sederhana untuk Admin yang diverifikasi di server
 */
function createAdminToken(username, role) {
  const payload = {
    username: username,
    role: role,
    exp: new Date().getTime() + (12 * 60 * 60 * 1000) // 12 jam
  };
  const str = Utilities.base64EncodeWebSafe(JSON.stringify(payload));
  const secret = getAuthSecret();
  const signature = Utilities.base64EncodeWebSafe(
    Utilities.computeHmacSha256Signature(str, secret)
  );
  return str + "." + signature;
}

/**
 * Verifikasi validitas token Admin
 */
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
      return { valid: false, message: "Sesi telah berakhir, silakan login kembali" };
    }
    return { valid: true, user: payload };
  } catch (e) {
    return { valid: false, message: "Token korup: " + e.message };
  }
}

/**
 * Bersihkan input string dari karakter berbahaya (XSS / formula injection)
 */
function sanitizeInput(val) {
  if (val === null || val === undefined) return "";
  let str = String(val).trim();
  // Cegah formula injection pada spreadsheet jika diawali =, +, -, @
  if (/^[=\+\-@]/.test(str)) {
    str = "'" + str;
  }
  return str;
}

/**
 * Format tanggal Indonesia (contoh: 15 Juni 2026 10:30)
 */
function formatDateTimeID(date) {
  if (!date) date = new Date();
  if (typeof date === "string") date = new Date(date);
  return Utilities.formatDate(date, "Asia/Makassar", "yyyy-MM-dd HH:mm:ss");
}

/**
 * Sensor data sensitif seperti NIK (contoh: 640301******0001)
 */
function maskNIK(nik) {
  if (!nik) return "-";
  const s = String(nik).trim();
  if (s.length <= 8) return s;
  return s.substring(0, 6) + "******" + s.substring(s.length - 4);
}
