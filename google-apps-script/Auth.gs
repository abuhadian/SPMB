/**
 * ============================================================================
 * SPMB SMP NEGERI 1 SEGAH - GOOGLE APPS SCRIPT BACKEND
 * File: Auth.gs
 * Fungsi: Otentikasi admin, verifikasi credential dan manajemen sesi aman
 * ============================================================================
 */

/**
 * Memproses Login Admin
 */
function handleAdminLogin(username, password) {
  if (!username || !password) {
    return { success: false, message: "Username dan password wajib diisi." };
  }

  const sheet = getSheet(SHEET_NAMES.ADMIN);
  const rows = sheetToObjects(sheet);

  const inputUsername = String(username).trim();
  const inputHash = hashPassword(password);

  let adminUser = null;
  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    if (String(row["Username"]).trim() === inputUsername) {
      adminUser = row;
      break;
    }
  }

  if (!adminUser) {
    return { success: false, message: "Username atau password salah." };
  }

  if (adminUser["Status"] !== "Aktif") {
    return { success: false, message: "Akun admin Anda sedang dinonaktifkan." };
  }

  // Bandingkan password hash
  const storedHash = String(adminUser["Password"]).trim();
  if (storedHash !== inputHash) {
    return { success: false, message: "Username atau password salah." };
  }

  // Buat session token aman
  const token = createAdminToken(adminUser["Username"], adminUser["Role"]);

  return {
    success: true,
    message: "Login berhasil. Selamat datang di Dashboard Admin!",
    data: {
      token: token,
      user: {
        username: adminUser["Username"],
        nama: adminUser["Nama"],
        role: adminUser["Role"]
      }
    }
  };
}

/**
 * Middleware untuk memastikan request Admin memiliki token yang valid
 */
function authenticateAdmin(token) {
  const auth = verifyAdminToken(token);
  if (!auth.valid) {
    return { success: false, authorized: false, message: auth.message };
  }
  return { success: true, authorized: true, user: auth.user };
}
