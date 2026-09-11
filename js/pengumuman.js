/**
 * ============================================================================
 * SPMB SMP NEGERI 1 SEGAH - PENGUMUMAN & HASIL KELULUSAN JAVASCRIPT
 * File: js/pengumuman.js
 * ============================================================================
 */

document.addEventListener("DOMContentLoaded", function() {
  loadAnnouncements();
  initGraduationChecker();
});

/**
 * Muat Daftar Pengumuman Publik
 */
async function loadAnnouncements() {
  const loading = document.getElementById("loadingAnnouncements");
  const list = document.getElementById("announcementsList");
  const empty = document.getElementById("emptyAnnouncements");

  try {
    const res = await ApiService.get("getAnnouncements");
    loading.style.display = "none";

    if (res.success && res.data && res.data.length > 0) {
      list.innerHTML = "";
      res.data.forEach(item => {
        const card = document.createElement("div");
        card.className = "card";
        card.style.borderLeft = "4px solid var(--primary)";
        card.innerHTML = `
          <div style="display: flex; justify-content: space-between; align-items: flex-start; gap: 1rem; margin-bottom: 0.75rem;">
            <h4 style="font-size: 1.15rem; color: #0f172a; margin: 0; line-height: 1.35;">${escapeHTML(item.judul)}</h4>
            <span class="badge badge-primary" style="white-space: nowrap;"><i class="fas fa-calendar-alt"></i> ${escapeHTML(item.tanggal)}</span>
          </div>
          <p style="color: #475569; font-size: 0.95rem; line-height: 1.6; margin-bottom: 0.75rem;">
            ${escapeHTML(item.isi)}
          </p>
          ${item.link ? `<a href="${encodeURI(item.link)}" target="_blank" rel="noopener noreferrer" class="btn btn-secondary btn-sm"><i class="fas fa-external-link-alt"></i> Unduh Lampiran / Buka Tautan</a>` : ""}
        `;
        list.appendChild(card);
      });
    } else {
      empty.style.display = "block";
    }
  } catch (err) {
    loading.style.display = "none";
    empty.style.display = "block";
    console.error("Error load announcements:", err);
  }
}

/**
 * Inisialisasi Pengecekan Hasil Kelulusan Murid Baru
 */
function initGraduationChecker() {
  const form = document.getElementById("formCekKelulusan");
  if (!form) return;

  form.addEventListener("submit", async function(e) {
    e.preventDefault();
    const noInput = document.getElementById("lulusNoPendaftaran");
    const no = noInput.value.trim();
    const errorEl = document.getElementById("errorLulusNo");
    const loading = document.getElementById("loadingKelulusan");
    const box = document.getElementById("boxHasilKelulusan");
    const btn = document.getElementById("btnCekKelulusan");

    errorEl.textContent = "";
    if (!no) {
      errorEl.textContent = "Nomor pendaftaran wajib diisi.";
      return;
    }

    loading.style.display = "flex";
    box.style.display = "none";
    btn.disabled = true;

    try {
      const res = await ApiService.get("checkGraduation", { noPendaftaran: no });
      loading.style.display = "none";
      btn.disabled = false;

      if (res.success && res.data) {
        displayGraduationResult(res.data);
      } else {
        showToast("Hasil Pengecekan", res.message || "Nomor pendaftaran tidak ditemukan.", "danger");
      }
    } catch (err) {
      loading.style.display = "none";
      btn.disabled = false;
      showToast("Gangguan Jaringan", "Gagal menghubungi server SPMB.", "danger");
    }
  });
}

/**
 * Render Tampilan Hasil Kelulusan Sesuai Spesifikasi README.md
 */
function displayGraduationResult(data) {
  const box = document.getElementById("boxHasilKelulusan");
  box.style.display = "block";

  const isLulus = data.statusKelulusan === "Lulus";
  const isGagal = data.statusKelulusan === "Tidak Lulus";

  let statusHtml = "";
  let messageHtml = "";
  let bannerClass = "";

  if (isLulus) {
    bannerClass = "alert alert-success";
    statusHtml = `<div style="font-size: 1.6rem; font-weight: 800; color: #065f46; letter-spacing: 0.05em; margin: 0.5rem 0;">LULUS</div>`;
    messageHtml = `<p style="font-size: 0.95rem; margin-top: 0.5rem;"><strong>Selamat, Anda dinyatakan LULUS sebagai murid baru SMP Negeri 1 Segah Tahun Ajaran 2026/2027.</strong></p>
    <div style="background: #ffffff; border: 1px solid var(--success-border); border-radius: var(--radius-sm); padding: 0.85rem; margin-top: 0.75rem; font-size: 0.85rem; color: #065f46;">
      <strong>Langkah Selanjutnya (Daftar Ulang):</strong>
      <ol style="margin-left: 1.25rem; margin-top: 0.35rem;">
        <li>Cetak Lembar Bukti Kelulusan / Pendaftaran.</li>
        <li>Bawa dokumen asli ke SMPN 1 Segah pada tanggal 01 - 05 Juli 2026.</li>
      </ol>
    </div>`;
  } else if (isGagal) {
    bannerClass = "alert alert-danger";
    statusHtml = `<div style="font-size: 1.6rem; font-weight: 800; color: #991b1b; letter-spacing: 0.05em; margin: 0.5rem 0;">TIDAK LULUS</div>`;
    messageHtml = `<p style="font-size: 0.95rem; margin-top: 0.5rem;">Terima kasih telah mengikuti proses SPMB SMP Negeri 1 Segah.</p>`;
  } else {
    bannerClass = "alert alert-info";
    statusHtml = `<div style="font-size: 1.3rem; font-weight: 800; color: #0369a1; margin: 0.5rem 0;">DALAM PROSES PENETAPAN</div>`;
    messageHtml = `<p style="font-size: 0.95rem; margin-top: 0.5rem;">Hasil kelulusan masih dalam proses rapat pleno panitia dan akan diumumkan resmi pada 30 Juni 2026.</p>`;
  }

  box.innerHTML = `
    <div class="${bannerClass}" style="flex-direction: column; text-align: center; padding: 1.5rem 1.25rem;">
      <span style="font-size: 0.8rem; font-weight: 700; text-transform: uppercase;">Status Seleksi Akhir</span>
      ${statusHtml}
      <div style="border-top: 1px solid rgba(0,0,0,0.1); width: 100%; margin: 0.75rem 0; padding-top: 0.75rem;">
        <table style="width: 100%; font-size: 0.875rem; text-align: left; margin: 0 auto;">
          <tr>
            <td style="width: 45%; color: var(--text-muted);">Nomor Pendaftaran:</td>
            <td style="font-weight: 700; color: #0f172a;">${escapeHTML(data.nomorPendaftaran)}</td>
          </tr>
          <tr>
            <td style="color: var(--text-muted);">Nama Lengkap:</td>
            <td style="font-weight: 700; color: #0f172a;">${escapeHTML(data.namaLengkap)}</td>
          </tr>
          <tr>
            <td style="color: var(--text-muted);">Jalur Masuk:</td>
            <td style="font-weight: 700; color: #0f172a;">${escapeHTML(data.jalur)}</td>
          </tr>
        </table>
      </div>
      ${messageHtml}
    </div>
  `;
}
