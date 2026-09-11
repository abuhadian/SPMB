/**
 * ============================================================================
 * SPMB SMP NEGERI 1 SEGAH - GOOGLE APPS SCRIPT BACKEND
 * File: Code.gs
 * Fungsi: Main Router API (doGet dan doPost)
 * ============================================================================
 */

/**
 * Handle HTTP GET Requests
 */
function doGet(e) {
  try {
    const params = (e && e.parameter) ? e.parameter : {};
    const action = params.action || "getConfig";

    switch (action) {
      case "getConfig":
        return jsonResponse(handleGetConfig());

      case "getAnnouncements":
        return jsonResponse(handleGetPublicAnnouncements());

      case "checkStatus":
        return jsonResponse(handleCheckStatus(params.noPendaftaran, params.verifikasi));

      case "checkGraduation":
        return jsonResponse(handleCheckGraduation(params.noPendaftaran));

      case "getStats":
        return jsonResponse(handleGetDashboardStatistics());

      case "setupDatabase":
        return jsonResponse(setupDatabase());

      case "seedDemoData":
        return jsonResponse(seedDemoData());

      default:
        return jsonResponse({
          success: false,
          message: "Action '" + action + "' tidak dikenali pada GET."
        });
    }
  } catch (err) {
    Logger.log("Error doGet: " + err.message);
    return jsonResponse({
      success: false,
      message: "Terjadi kesalahan server: " + err.message
    });
  }
}

/**
 * Handle HTTP POST Requests
 */
function doPost(e) {
  try {
    let payload = {};
    if (e && e.postData && e.postData.contents) {
      try {
        payload = JSON.parse(e.postData.contents);
      } catch (parseErr) {
        payload = e.parameter || {};
      }
    } else if (e && e.parameter) {
      payload = e.parameter;
    }

    const action = payload.action || (e && e.parameter ? e.parameter.action : "");

    // 1. Endpoint Publik (Tanpa Autentikasi)
    if (action === "register") {
      return jsonResponse(handleSaveRegistration(payload.data || payload));
    }

    if (action === "uploadDocument") {
      return jsonResponse(handleUploadDocument(payload.data || payload));
    }

    if (action === "adminLogin") {
      return jsonResponse(handleAdminLogin(payload.username, payload.password));
    }

    // 2. Endpoint Khusus Admin (Memerlukan Token Autentikasi)
    const token = payload.token || (e && e.parameter ? e.parameter.token : "");
    const auth = authenticateAdmin(token);
    if (!auth.authorized) {
      return jsonResponse({
        success: false,
        authorized: false,
        message: "Akses ditolak: " + (auth.message || "Token admin tidak valid atau telah kadaluarsa.")
      });
    }

    switch (action) {
      case "adminGetDashboard":
        return jsonResponse(handleGetDashboardStatistics());

      case "adminGetApplicants":
        return jsonResponse(handleAdminGetApplicants(payload.filters || {}));

      case "adminUpdateStatus":
        return jsonResponse(handleUpdateApplicantStatus(payload.data || payload));

      case "adminRunSelection":
        return jsonResponse(handleRunSelection(payload.data || payload));

      case "adminSaveAnnouncement":
        return jsonResponse(handleSaveAnnouncement(payload.data || payload));

      case "adminDeleteAnnouncement":
        return jsonResponse(handleDeleteAnnouncement(payload.id));

      case "adminImportApplicants":
        return jsonResponse(handleImportApplicantsCSV(payload.csv));

      case "adminImportRaport":
        return jsonResponse(handleImportRaportCSV(payload.csv));

      case "adminUpdateConfig":
        return jsonResponse(handleAdminUpdateConfig(payload.data || payload));

      default:
        return jsonResponse({
          success: false,
          message: "Action POST '" + action + "' tidak dikenali."
        });
    }

  } catch (err) {
    Logger.log("Error doPost: " + err.message);
    return jsonResponse({
      success: false,
      message: "Terjadi kesalahan internal server: " + err.message
    });
  }
}
