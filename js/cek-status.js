/**
 * ============================================================================
 * SPMB SMP NEGERI 1 SEGAH - CEK STATUS JAVASCRIPT
 * File: js/cek-status.js
 * ============================================================================
 */

document.addEventListener("DOMContentLoaded", function() {
  initStatusChecker();
  checkUrlParams();
});

let currentLoadedData = null;

function checkUrlParams() {
  const params = new URLSearchParams(window.location.search);
  const no = params.get("no") || params.get("nomor");
  const verif = params.get("verif") || params.get("nisn");

  if (no) {
    document.getElementById("inputNoPendaftaran").value = no;
    if (verif) {
      document.getElementById("inputVerifikasi").value = verif;
      performCheckStatus(no, verif);
    }
  }
}

function initStatusChecker() {
  const form = document.getElementById("formCekStatus");
  if (form) {
    form.addEventListener("submit", function(e) {
      e.preventDefault();
      const no = document.getElementById("inputNoPendaftaran").value.trim();
      const verif = document.getElementById("inputVerifikasi").value.trim();

      document.getElementById("errorNoPendaftaran").textContent = "";
      document.getElementById("errorVerifikasi").textContent = "";

      let isValid = true;
      if (!no) {
        document.getElementById("errorNoPendaftaran").textContent = "Nomor pendaftaran wajib diisi.";
        isValid = false;
      }
      if (!verif) {
        document.getElementById("errorVerifikasi").textContent = "NISN atau Tanggal Lahir wajib diisi.";
        isValid = false;
      }

      if (isValid) {
        performCheckStatus(no, verif);
      }
    });
  }

  const btnCetakUlang = document.getElementById("btnCetakUlangBukti");
  if (btnCetakUlang) {
    btnCetakUlang.addEventListener("click", function() {
      if (currentLoadedData) {
        // Alihkan ke pendaftaran dengan data atau buka dialog cetak
        window.print();
      }
    });
  }
}

async function performCheckStatus(noPendaftaran, verifikasi) {
  const loading = document.getElementById("loadingStatus");
  const resultCard = document.getElementById("resultStatusCard");
  const btnCari = document.getElementById("btnCariStatus");

  loading.style.display = "flex";
  resultCard.style.display = "none";
  btnCari.disabled = true;

  try {
    const res = await ApiService.get("checkStatus", {
      noPendaftaran: noPendaftaran,
      verifikasi: verifikasi
    });

    loading.style.display = "none";
    btnCari.disabled = false;

    if (res.success && res.data) {
      currentLoadedData = res.data;
      displayStatusResult(res.data);
      showToast("Data Ditemukan", "Status pendaftaran Anda berhasil dimuat.", "success");
    } else {
      showToast("Tidak Ditemukan", res.message || "Data pendaftaran tidak cocok.", "danger", 5000);
    }
  } catch (err) {
    loading.style.display = "none";
    btnCari.disabled = false;
    console.error("Error cek status:", err);
    showToast("Gagal Terhubung", "Terjadi gangguan saat mengambil data. Silakan coba kembali.", "danger");
  }
}

function displayStatusResult(data) {
  const resultCard = document.getElementById("resultStatusCard");
  resultCard.style.display = "block";

  document.getElementById("resNamaMurid").textContent = data.namaLengkap;
  document.getElementById("resNoPendaftaran").textContent = data.nomorPendaftaran;
  document.getElementById("resJalur").innerHTML = `<span class="badge badge-primary">${escapeHTML(data.jalur)}</span>`;
  document.getElementById("resAsalSd").textContent = data.asalSekolah || "-";
  document.getElementById("resTanggalUpdate").textContent = data.tanggalUpdate || data.tanggalDaftar || "-";

  // Badges Status
  document.getElementById("resVerifikasiStatus").innerHTML = getStatusBadgeHTML(data.statusVerifikasi, "verifikasi");
  document.getElementById("resSeleksiStatus").innerHTML = getStatusBadgeHTML(data.statusSeleksi, "seleksi");
  document.getElementById("resKelulusanStatus").innerHTML = getStatusBadgeHTML(data.statusKelulusan, "kelulusan");

  // Status Badge Utama
  const badgeContainer = document.getElementById("resStatusBadge");
  badgeContainer.innerHTML = getStatusBadgeHTML(data.statusKelulusan !== "Dalam Proses" ? data.statusKelulusan : data.statusVerifikasi);

  // Catatan Admin
  const catatanBox = document.getElementById("resCatatanBox");
  const catatanText = document.getElementById("resCatatanText");

  if (data.statusVerifikasi === "Perlu Perbaikan") {
    catatanBox.className = "alert alert-warning";
    catatanText.innerHTML = `<strong><i class="fas fa-exclamation-triangle"></i> PERHATIAN:</strong> ${escapeHTML(data.catatanAdmin)}<br><small style="display:block; margin-top:0.4rem;">Silakan datang langsung ke panitia SPMB SMPN 1 Segah membawa berkas asli yang perlu diperbaiki.</small>`;
  } else if (data.statusKelulusan === "Lulus") {
    catatanBox.className = "alert alert-success";
    catatanText.innerHTML = `<strong><i class="fas fa-check-circle"></i> SELAMAT!</strong> Anda dinyatakan Lulus seleksi penerimaan murid baru. Silakan mempersiapkan berkas untuk daftar ulang.`;
  } else {
    catatanBox.className = "alert alert-info";
    catatanText.textContent = data.catatanAdmin || "Tidak ada catatan khusus.";
  }

  window.scrollTo({ top: resultCard.offsetTop - 80, behavior: "smooth" });
}
