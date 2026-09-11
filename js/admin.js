/**
 * ============================================================================
 * SPMB SMP NEGERI 1 SEGAH - ADMIN DASHBOARD JAVASCRIPT
 * File: js/admin.js
 * ============================================================================
 */

let adminUser = null;
let allApplicants = [];
let filteredApplicants = [];
let chartJalur = null;
let chartGender = null;

// Pagination state
let currentPage = 1;
const pageSize = 10;
let sortField = "nomorPendaftaran";
let sortOrder = "desc";

document.addEventListener("DOMContentLoaded", function() {
  checkAdminAuth();
  initSidebar();
  initTabs();
  initFiltersAndSearch();
  initVerificationModal();
  initAnnouncementsAdmin();
  initImportExport();
  initSettingsAdmin();
  loadDashboardData();
  loadApplicantsData();
});

/**
 * 1. Pengecekan Autentikasi Admin
 */
function checkAdminAuth() {
  const session = sessionStorage.getItem("spmb_smpn1_segah_admin_session");
  if (!session) {
    window.location.href = "login.html";
    return;
  }

  try {
    const data = JSON.parse(session);
    adminUser = data.user || data;
    if (!adminUser || (!adminUser.token && !data.token)) {
      window.location.href = "login.html";
      return;
    }
    
    // Tampilkan informasi admin
    const nameEl = document.getElementById("sidebarUserName");
    const roleEl = document.getElementById("sidebarUserRole");
    const avatarEl = document.getElementById("sidebarAvatar");

    if (nameEl) nameEl.textContent = adminUser.nama || adminUser.username || "Admin";
    if (roleEl) roleEl.textContent = adminUser.role || "Panitia SPMB";
    if (avatarEl) avatarEl.textContent = (adminUser.nama || adminUser.username || "A").charAt(0).toUpperCase();

  } catch (e) {
    window.location.href = "login.html";
  }

  // Logout handler
  const btnLogout = document.getElementById("btnLogoutAdmin");
  if (btnLogout) {
    btnLogout.addEventListener("click", function() {
      if (confirm("Apakah Anda yakin ingin keluar dari Dashboard Administrator?")) {
        sessionStorage.removeItem("spmb_smpn1_segah_admin_session");
        window.location.href = "login.html";
      }
    });
  }
}

/**
 * 2. Navigasi Sidebar & Tab Switcher
 */
function initSidebar() {
  const toggleBtn = document.getElementById("sidebarToggle");
  const sidebar = document.getElementById("adminSidebar");

  if (toggleBtn && sidebar) {
    toggleBtn.addEventListener("click", function(e) {
      e.stopPropagation();
      sidebar.classList.toggle("open");
    });

    document.addEventListener("click", function(e) {
      if (!sidebar.contains(e.target) && !toggleBtn.contains(e.target)) {
        sidebar.classList.remove("open");
      }
    });
  }

  const btnRefresh = document.getElementById("btnRefreshData");
  if (btnRefresh) {
    btnRefresh.addEventListener("click", function() {
      loadDashboardData();
      loadApplicantsData();
      showToast("Penyegaran Data", "Data berhasil diperbarui.", "info");
    });
  }

  const btnQuickExport = document.getElementById("btnQuickExport");
  if (btnQuickExport) {
    btnQuickExport.addEventListener("click", exportApplicantsToCSV);
  }
}

function initTabs() {
  document.querySelectorAll(".sidebar-menu .menu-item[data-tab]").forEach(item => {
    item.addEventListener("click", function(e) {
      e.preventDefault();
      const targetTab = this.getAttribute("data-tab");
      switchAdminTab(targetTab);
    });
  });
}

function switchAdminTab(tabName) {
  // Update menu item
  document.querySelectorAll(".sidebar-menu .menu-item").forEach(m => m.classList.remove("active"));
  const activeMenu = document.querySelector(`.sidebar-menu .menu-item[data-tab="${tabName}"]`);
  if (activeMenu) activeMenu.classList.add("active");

  // Update pane
  document.querySelectorAll(".tab-pane").forEach(p => p.classList.remove("active"));
  const targetPane = document.getElementById(`pane-${tabName}`);
  if (targetPane) targetPane.classList.add("active");

  // Update header title
  const titles = {
    dashboard: "Dashboard Statistik SPMB",
    pendaftar: "Kelola Data Pendaftar",
    seleksi: "Proses Seleksi & Kuota",
    dokumen: "Verifikasi Berkas Calon Murid",
    pengumuman: "Kelola Pengumuman SPMB",
    importExport: "Import & Export Basis Data",
    pengaturan: "Pengaturan Pelaksanaan SPMB"
  };
  const titleEl = document.getElementById("pageTitleText");
  if (titleEl) titleEl.textContent = titles[tabName] || "Dashboard Admin";

  // Tutup sidebar mobile jika terbuka
  const sidebar = document.getElementById("adminSidebar");
  if (sidebar) sidebar.classList.remove("open");

  if (tabName === "dokumen") renderDokumenVerifTable();
  if (tabName === "pengumuman") loadAnnouncementsAdmin();
}

/**
 * 3. Memuat Data Statistik Dashboard & Render Grafik Chart.js
 */
async function loadDashboardData() {
  try {
    const res = await ApiService.post("adminGetDashboard", {
      token: (adminUser && adminUser.token) || ""
    });

    if (res.success && res.data) {
      const d = res.data;
      document.getElementById("statTotal").textContent = d.totalPendaftar || 0;
      document.getElementById("statMenunggu").textContent = d.menungguVerifikasi || 0;
      document.getElementById("statTerverifikasi").textContent = d.terverifikasi || 0;
      document.getElementById("statLulus").textContent = d.lulus || 0;
      document.getElementById("statTidakLulus").textContent = d.tidakLulus || 0;
      document.getElementById("statSisaKuota").textContent = d.sisaKuota || 0;

      const badgePendaftar = document.getElementById("badgeTotalPendaftar");
      if (badgePendaftar) badgePendaftar.textContent = d.totalPendaftar || 0;

      renderCharts(d.chartJalur, d.chartGender);
    }
  } catch (err) {
    console.error("Gagal memuat statistik:", err);
  }
}

function renderCharts(jalurData, genderData) {
  // Chart Jalur (Doughnut)
  const ctxJalur = document.getElementById("chartJalurCanvas");
  if (ctxJalur && typeof Chart !== "undefined") {
    if (chartJalur) chartJalur.destroy();

    const jKeys = Object.keys(jalurData || { "Domisili": 0, "Afirmasi": 0, "Prestasi": 0, "Mutasi": 0 });
    const jValues = jKeys.map(k => jalurData[k] || 0);

    chartJalur = new Chart(ctxJalur, {
      type: "doughnut",
      data: {
        labels: jKeys,
        datasets: [{
          data: jValues,
          backgroundColor: ["#1d4ed8", "#0f766e", "#f59e0b", "#7c3aed"],
          borderWidth: 2,
          borderColor: "#ffffff"
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { position: "bottom" }
        }
      }
    });
  }

  // Chart Gender (Bar)
  const ctxGender = document.getElementById("chartGenderCanvas");
  if (ctxGender && typeof Chart !== "undefined") {
    if (chartGender) chartGender.destroy();

    const gKeys = ["Laki-laki", "Perempuan"];
    const gValues = [
      (genderData && genderData["Laki-laki"]) || 0,
      (genderData && genderData["Perempuan"]) || 0
    ];

    chartGender = new Chart(ctxGender, {
      type: "bar",
      data: {
        labels: gKeys,
        datasets: [{
          label: "Jumlah Pendaftar",
          data: gValues,
          backgroundColor: ["#3b82f6", "#ec4899"],
          borderRadius: 6
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false }
        },
        scales: {
          y: { beginAtZero: true, ticks: { precision: 0 } }
        }
      }
    });
  }
}

/**
 * 4. Memuat Data Pendaftar & Filter / Pagination
 */
async function loadApplicantsData() {
  try {
    const res = await ApiService.post("adminGetApplicants", {
      token: (adminUser && adminUser.token) || ""
    });

    if (res.success && res.data) {
      allApplicants = res.data;
      applyFilters();
    }
  } catch (err) {
    console.error("Gagal mengambil data pendaftar:", err);
  }
}

function initFiltersAndSearch() {
  const searchInput = document.getElementById("filterSearch");
  const jalurSelect = document.getElementById("filterJalur");
  const verifSelect = document.getElementById("filterStatusVerif");
  const lulusSelect = document.getElementById("filterStatusLulus");
  const genderSelect = document.getElementById("filterGender");

  if (searchInput) {
    searchInput.addEventListener("input", () => {
      currentPage = 1;
      applyFilters();
    });
  }

  [jalurSelect, verifSelect, lulusSelect, genderSelect].forEach(el => {
    if (el) {
      el.addEventListener("change", () => {
        currentPage = 1;
        applyFilters();
      });
    }
  });

  // Sorting Handler
  document.querySelectorAll(".data-table th.sortable").forEach(th => {
    th.addEventListener("click", function() {
      const field = this.getAttribute("data-sort");
      if (sortField === field) {
        sortOrder = sortOrder === "asc" ? "desc" : "asc";
      } else {
        sortField = field;
        sortOrder = "asc";
      }
      applyFilters();
    });
  });
}

function applyFilters() {
  const q = (document.getElementById("filterSearch")?.value || "").toLowerCase().trim();
  const j = document.getElementById("filterJalur")?.value || "semua";
  const v = document.getElementById("filterStatusVerif")?.value || "semua";
  const l = document.getElementById("filterStatusLulus")?.value || "semua";
  const g = document.getElementById("filterGender")?.value || "semua";

  filteredApplicants = allApplicants.filter(a => {
    const matchQ = !q || 
      (a.namaLengkap || "").toLowerCase().includes(q) ||
      (a.nomorPendaftaran || "").toLowerCase().includes(q) ||
      (a.nisn || "").includes(q) ||
      (a.namaSd || "").toLowerCase().includes(q);

    const matchJ = j === "semua" || (a.jalur || "").toLowerCase() === j.toLowerCase();
    const matchV = v === "semua" || a.statusVerifikasi === v;
    const matchL = l === "semua" || a.statusKelulusan === l;
    const matchG = g === "semua" || a.jenisKelamin === g;

    return matchQ && matchJ && matchV && matchL && matchG;
  });

  // Sort
  filteredApplicants.sort((a, b) => {
    let valA = a[sortField] || "";
    let valB = b[sortField] || "";
    if (typeof valA === "string") valA = valA.toLowerCase();
    if (typeof valB === "string") valB = valB.toLowerCase();

    if (valA < valB) return sortOrder === "asc" ? -1 : 1;
    if (valA > valB) return sortOrder === "asc" ? 1 : -1;
    return 0;
  });

  renderApplicantsTable();
}

function renderApplicantsTable() {
  const tbody = document.getElementById("tbodyPendaftar");
  const emptyState = document.getElementById("tableEmptyState");
  if (!tbody) return;

  tbody.innerHTML = "";

  if (filteredApplicants.length === 0) {
    emptyState.style.display = "block";
    updatePaginationInfo(0, 0, 0);
    return;
  }
  emptyState.style.display = "none";

  const total = filteredApplicants.length;
  const startIdx = (currentPage - 1) * pageSize;
  const endIdx = Math.min(startIdx + pageSize, total);
  const currentItems = filteredApplicants.slice(startIdx, endIdx);

  currentItems.forEach((applicant, idx) => {
    const tr = document.createElement("tr");
    const rowNum = startIdx + idx + 1;

    tr.innerHTML = `
      <td>${rowNum}</td>
      <td><strong>${escapeHTML(applicant.nomorPendaftaran)}</strong></td>
      <td>
        <div style="font-weight: 700; color: #0f172a;">${escapeHTML(applicant.namaLengkap)}</div>
        <small style="color: var(--text-muted);">${escapeHTML(applicant.tempatLahir || "")}, ${escapeHTML(applicant.tanggalLahir || "")}</small>
      </td>
      <td>${escapeHTML(applicant.nisn || "-")}</td>
      <td>${applicant.jenisKelamin === "Laki-laki" ? '<span class="badge badge-primary">L</span>' : '<span class="badge badge-danger">P</span>'}</td>
      <td>${escapeHTML(applicant.namaSd || "-")}</td>
      <td><span class="badge badge-primary">${escapeHTML(applicant.jalur || "-")}</span></td>
      <td>${getStatusBadgeHTML(applicant.statusVerifikasi, "verifikasi")}</td>
      <td>${getStatusBadgeHTML(applicant.statusKelulusan, "kelulusan")}</td>
      <td>
        <div class="action-buttons">
          <button type="button" class="btn btn-secondary btn-sm" onclick="viewApplicantDetail('${escapeHTML(applicant.nomorPendaftaran)}')" title="Lihat Detail">
            <i class="fas fa-eye"></i>
          </button>
          <button type="button" class="btn btn-primary btn-sm" onclick="openVerificationModal('${escapeHTML(applicant.nomorPendaftaran)}')" title="Verifikasi & Catatan">
            <i class="fas fa-edit"></i>
          </button>
        </div>
      </td>
    `;
    tbody.appendChild(tr);
  });

  updatePaginationInfo(startIdx + 1, endIdx, total);
  renderPaginationButtons(total);
}

function updatePaginationInfo(start, end, total) {
  const s = document.getElementById("pageInfoStart");
  const e = document.getElementById("pageInfoEnd");
  const t = document.getElementById("pageInfoTotal");
  if (s) s.textContent = start;
  if (e) e.textContent = end;
  if (t) t.textContent = total;
}

function renderPaginationButtons(totalItems) {
  const container = document.getElementById("paginationControls");
  if (!container) return;
  container.innerHTML = "";

  const totalPages = Math.ceil(totalItems / pageSize) || 1;

  // Prev button
  const prevBtn = document.createElement("button");
  prevBtn.className = "page-btn";
  prevBtn.innerHTML = `<i class="fas fa-chevron-left"></i>`;
  prevBtn.disabled = currentPage === 1;
  prevBtn.addEventListener("click", () => {
    if (currentPage > 1) {
      currentPage--;
      renderApplicantsTable();
    }
  });
  container.appendChild(prevBtn);

  // Page numbers
  for (let i = 1; i <= totalPages; i++) {
    if (i === 1 || i === totalPages || (i >= currentPage - 1 && i <= currentPage + 1)) {
      const pBtn = document.createElement("button");
      pBtn.className = `page-btn ${i === currentPage ? "active" : ""}`;
      pBtn.textContent = i;
      pBtn.addEventListener("click", () => {
        currentPage = i;
        renderApplicantsTable();
      });
      container.appendChild(pBtn);
    }
  }

  // Next button
  const nextBtn = document.createElement("button");
  nextBtn.className = "page-btn";
  nextBtn.innerHTML = `<i class="fas fa-chevron-right"></i>`;
  nextBtn.disabled = currentPage === totalPages;
  nextBtn.addEventListener("click", () => {
    if (currentPage < totalPages) {
      currentPage++;
      renderApplicantsTable();
    }
  });
  container.appendChild(nextBtn);
}

/**
 * 5. Detail Calon Murid Modal
 */
function viewApplicantDetail(noPendaftaran) {
  const student = allApplicants.find(a => a.nomorPendaftaran === noPendaftaran);
  if (!student) return;

  const body = document.getElementById("modalDetailBody");
  const ortu = student.orangTua || {};
  const dok = student.dokumenUrls || {};

  body.innerHTML = `
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.25rem; border-bottom: 1px solid var(--border-color); padding-bottom: 0.75rem;">
      <div>
        <span style="font-size: 0.8rem; color: var(--text-muted); text-transform: uppercase;">Nomor Pendaftaran</span>
        <h3 style="color: var(--primary); margin: 0; font-size: 1.35rem;">${escapeHTML(student.nomorPendaftaran)}</h3>
      </div>
      <div>
        ${getStatusBadgeHTML(student.statusVerifikasi)}
        ${getStatusBadgeHTML(student.statusKelulusan)}
      </div>
    </div>

    <!-- Data Pribadi -->
    <h4 style="font-size: 1rem; color: var(--text-main); margin-bottom: 0.5rem;"><i class="fas fa-user text-primary"></i> Data Calon Murid</h4>
    <table class="schedule-table" style="box-shadow: none; margin-bottom: 1.25rem;">
      <tr><td style="width: 30%; font-weight: 600;">Nama Lengkap</td><td><strong>${escapeHTML(student.namaLengkap)}</strong></td></tr>
      <tr><td style="font-weight: 600;">NIK & NISN</td><td>NIK: ${escapeHTML(student.nik)} | NISN: ${escapeHTML(student.nisn || "-")}</td></tr>
      <tr><td style="font-weight: 600;">Tempat, Tanggal Lahir</td><td>${escapeHTML(student.tempatLahir)}, ${escapeHTML(student.tanggalLahir)}</td></tr>
      <tr><td style="font-weight: 600;">Jenis Kelamin & Agama</td><td>${escapeHTML(student.jenisKelamin)} | ${escapeHTML(student.agama || "-")}</td></tr>
      <tr><td style="font-weight: 600;">Alamat Lengkap</td><td>${escapeHTML(student.alamat)} RT ${escapeHTML(student.rt)}/RW ${escapeHTML(student.rw)}, Desa ${escapeHTML(student.desa)}, Kec. ${escapeHTML(student.kecamatan)}</td></tr>
      <tr><td style="font-weight: 600;">Nomor HP & Email</td><td>HP/WA: ${escapeHTML(student.nomorHp)} | Email: ${escapeHTML(student.email || "-")}</td></tr>
      <tr><td style="font-weight: 600;">Asal Sekolah (SD/MI)</td><td>${escapeHTML(student.namaSd)} (Lulus Tahun ${escapeHTML(student.tahunLulus || "-")})</td></tr>
      <tr><td style="font-weight: 600;">Jalur Pendaftaran</td><td><strong style="color: var(--primary);">${escapeHTML(student.jalur)}</strong></td></tr>
    </table>

    <!-- Data Orang Tua -->
    <h4 style="font-size: 1rem; color: var(--text-main); margin-bottom: 0.5rem;"><i class="fas fa-user-friends text-primary"></i> Data Orang Tua / Wali</h4>
    <table class="schedule-table" style="box-shadow: none; margin-bottom: 1.25rem;">
      <tr><td style="width: 30%; font-weight: 600;">Ayah Kandung</td><td>${escapeHTML(ortu.namaAyah || student.namaAyah || "-")} (${escapeHTML(ortu.pekerjaanAyah || student.pekerjaanAyah || "-")}) - HP: ${escapeHTML(ortu.hpAyah || student.hpAyah || "-")}</td></tr>
      <tr><td style="font-weight: 600;">Ibu Kandung</td><td>${escapeHTML(ortu.namaIbu || student.namaIbu || "-")} (${escapeHTML(ortu.pekerjaanIbu || student.pekerjaanIbu || "-")}) - HP: ${escapeHTML(ortu.hpIbu || student.hpIbu || "-")}</td></tr>
    </table>

    <!-- Dokumen Terlampir -->
    <h4 style="font-size: 1rem; color: var(--text-main); margin-bottom: 0.5rem;"><i class="fas fa-file-pdf text-primary"></i> Dokumen Pendukung Terlampir</h4>
    <div style="display: flex; gap: 0.75rem; flex-wrap: wrap;">
      ${dok.kk ? `<a href="${encodeURI(dok.kk)}" target="_blank" class="btn btn-secondary btn-sm"><i class="fas fa-file-alt"></i> Lihat File KK</a>` : '<span class="badge badge-warning">KK belum ada</span>'}
      ${dok.akta ? `<a href="${encodeURI(dok.akta)}" target="_blank" class="btn btn-secondary btn-sm"><i class="fas fa-file-alt"></i> Lihat File Akta</a>` : '<span class="badge badge-warning">Akta belum ada</span>'}
      ${dok.ijazah ? `<a href="${encodeURI(dok.ijazah)}" target="_blank" class="btn btn-secondary btn-sm"><i class="fas fa-file-alt"></i> Lihat File Ijazah/SKL</a>` : '<span class="badge badge-warning">Ijazah/SKL belum ada</span>'}
      ${dok.lain ? `<a href="${encodeURI(dok.lain)}" target="_blank" class="btn btn-secondary btn-sm"><i class="fas fa-file-alt"></i> Dokumen Lain</a>` : ""}
    </div>

    <!-- Catatan Panitia -->
    <div class="alert alert-info" style="margin-top: 1.25rem;">
      <strong>Catatan Panitia:</strong><br>
      ${escapeHTML(student.catatanAdmin || "Tidak ada catatan.")}
    </div>
  `;

  // Action button cetak bukti
  const btnPrint = document.getElementById("btnModalPrintBukti");
  if (btnPrint) {
    btnPrint.onclick = function() {
      closeModal("modalDetailApplicant");
      window.location.href = `pendaftaran.html?no=${encodeURIComponent(student.nomorPendaftaran)}`;
    };
  }

  openModal("modalDetailApplicant");
}

/**
 * 6. Verifikasi & Catatan Admin Modal
 */
function initVerificationModal() {
  const btnSave = document.getElementById("btnSimpanVerifikasi");
  if (btnSave) {
    btnSave.addEventListener("click", async function() {
      const no = document.getElementById("verifNomorPendaftaran").value;
      const statusVerif = document.getElementById("selectStatusVerifikasi").value;
      const statusLulus = document.getElementById("selectStatusKelulusan").value;
      const catatan = document.getElementById("textCatatanVerifikasi").value.trim();

      btnSave.disabled = true;
      btnSave.innerHTML = `<span class="spinner"></span> Menyimpan...`;

      try {
        const res = await ApiService.post("adminUpdateStatus", {
          nomorPendaftaran: no,
          statusVerifikasi: statusVerif,
          statusKelulusan: statusLulus,
          catatanAdmin: catatan,
          token: (adminUser && adminUser.token) || ""
        });

        btnSave.disabled = false;
        btnSave.innerHTML = `<i class="fas fa-save"></i> Simpan Status`;

        if (res.success) {
          showToast("Berhasil", "Status dan catatan pendaftar berhasil diperbarui!", "success");
          closeModal("modalVerifikasiApplicant");
          loadDashboardData();
          loadApplicantsData();
        } else {
          showToast("Gagal", res.message || "Gagal memperbarui status.", "danger");
        }
      } catch (err) {
        btnSave.disabled = false;
        btnSave.innerHTML = `<i class="fas fa-save"></i> Simpan Status`;
        showToast("Error", "Gagal menghubungi server.", "danger");
      }
    });
  }

  // Tombol eksekusi seleksi otomatis
  const btnSeleksi = document.getElementById("btnJalankanSeleksi");
  if (btnSeleksi) {
    btnSeleksi.addEventListener("click", async function() {
      if (!confirm("Jalankan seleksi otomatis berdasarkan kuota jalur dan status kelengkapan berkas yang Terverifikasi?")) {
        return;
      }

      btnSeleksi.disabled = true;
      btnSeleksi.innerHTML = `<span class="spinner"></span> Menyeleksi...`;

      try {
        const res = await ApiService.post("adminRunSelection", {
          token: (adminUser && adminUser.token) || ""
        });

        btnSeleksi.disabled = false;
        btnSeleksi.innerHTML = `<i class="fas fa-play"></i> Jalankan Seleksi Otomatis`;

        if (res.success) {
          showToast("Seleksi Berhasil", res.message, "success", 6000);
          loadDashboardData();
          loadApplicantsData();
        } else {
          showToast("Seleksi Gagal", res.message || "Gagal memproses seleksi.", "danger");
        }
      } catch (e) {
        btnSeleksi.disabled = false;
        btnSeleksi.innerHTML = `<i class="fas fa-play"></i> Jalankan Seleksi Otomatis`;
        showToast("Error", "Terjadi kesalahan saat memproses seleksi.", "danger");
      }
    });
  }
}

function openVerificationModal(noPendaftaran) {
  const student = allApplicants.find(a => a.nomorPendaftaran === noPendaftaran);
  if (!student) return;

  document.getElementById("verifNomorPendaftaran").value = student.nomorPendaftaran;
  document.getElementById("verifNamaMurid").textContent = student.namaLengkap;
  document.getElementById("verifSubText").textContent = `${student.nomorPendaftaran} | Jalur: ${student.jalur} | Asal: ${student.namaSd || "-"}`;

  document.getElementById("selectStatusVerifikasi").value = student.statusVerifikasi || "Menunggu Verifikasi";
  document.getElementById("selectStatusKelulusan").value = student.statusKelulusan || "Dalam Proses";
  document.getElementById("textCatatanVerifikasi").value = student.catatanAdmin || "";

  openModal("modalVerifikasiApplicant");
}

/**
 * 7. Tabel Verifikasi Berkas Khusus
 */
function renderDokumenVerifTable() {
  const tbody = document.getElementById("tbodyDokumenVerif");
  if (!tbody) return;
  tbody.innerHTML = "";

  const unverified = allApplicants.filter(a => a.statusVerifikasi === "Menunggu Verifikasi" || a.statusVerifikasi === "Perlu Perbaikan");
  
  if (unverified.length === 0) {
    tbody.innerHTML = `<tr><td colspan="7" style="text-align: center; padding: 2rem; color: var(--text-muted);">Semua berkas calon murid saat ini telah terverifikasi!</td></tr>`;
    return;
  }

  unverified.forEach(a => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td><strong>${escapeHTML(a.nomorPendaftaran)}</strong></td>
      <td>${escapeHTML(a.namaLengkap)}</td>
      <td><span class="badge badge-primary">${escapeHTML(a.jalur)}</span></td>
      <td>${getStatusBadgeHTML(a.statusVerifikasi)}</td>
      <td>
        <span class="badge badge-success"><i class="fas fa-file"></i> KK</span>
        <span class="badge badge-success"><i class="fas fa-file"></i> Akta</span>
        <span class="badge badge-success"><i class="fas fa-file"></i> SKL</span>
      </td>
      <td><small style="color: var(--text-muted);">${escapeHTML(a.catatanAdmin || "-")}</small></td>
      <td>
        <button type="button" class="btn btn-primary btn-sm" onclick="openVerificationModal('${escapeHTML(a.nomorPendaftaran)}')">
          <i class="fas fa-check"></i> Verifikasi
        </button>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

/**
 * 8. Pengumuman CRUD Admin
 */
function initAnnouncementsAdmin() {
  const btnSave = document.getElementById("btnSimpanPengumuman");
  if (btnSave) {
    btnSave.addEventListener("click", async function() {
      const id = document.getElementById("inputPengumumanId").value;
      const judul = document.getElementById("inputPengumumanJudul").value.trim();
      const isi = document.getElementById("inputPengumumanIsi").value.trim();
      const link = document.getElementById("inputPengumumanLink").value.trim();

      if (!judul || !isi) {
        showToast("Validasi", "Judul dan isi pengumuman wajib diisi.", "warning");
        return;
      }

      btnSave.disabled = true;
      btnSave.innerHTML = `<span class="spinner"></span> Menyimpan...`;

      try {
        const res = await ApiService.post("adminSaveAnnouncement", {
          data: { id, judul, isi, link, status: "Publik" },
          token: (adminUser && adminUser.token) || ""
        });

        btnSave.disabled = false;
        btnSave.innerHTML = `<i class="fas fa-save"></i> Publikasikan`;

        if (res.success) {
          showToast("Berhasil", "Pengumuman berhasil dipublikasikan!", "success");
          closeModal("modalTambahPengumuman");
          document.getElementById("inputPengumumanId").value = "";
          document.getElementById("inputPengumumanJudul").value = "";
          document.getElementById("inputPengumumanIsi").value = "";
          document.getElementById("inputPengumumanLink").value = "";
          loadAnnouncementsAdmin();
        } else {
          showToast("Gagal", res.message || "Gagal menyimpan pengumuman.", "danger");
        }
      } catch (e) {
        btnSave.disabled = false;
        btnSave.innerHTML = `<i class="fas fa-save"></i> Publikasikan`;
        showToast("Error", "Terjadi kesalahan saat mempublikasikan.", "danger");
      }
    });
  }
}

async function loadAnnouncementsAdmin() {
  const tbody = document.getElementById("tbodyPengumumanAdmin");
  if (!tbody) return;
  tbody.innerHTML = `<tr><td colspan="5" style="text-align: center; padding: 1.5rem;"><span class="spinner spinner-primary"></span> Memuat...</td></tr>`;

  try {
    const res = await ApiService.get("getAnnouncements");
    tbody.innerHTML = "";

    if (res.success && res.data && res.data.length > 0) {
      res.data.forEach(item => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
          <td>${escapeHTML(item.tanggal)}</td>
          <td><strong>${escapeHTML(item.judul)}</strong></td>
          <td><small>${escapeHTML((item.isi || "").substring(0, 80))}...</small></td>
          <td><span class="badge badge-success">Publik</span></td>
          <td style="text-align: center;">
            <button type="button" class="btn btn-danger btn-sm" onclick="deleteAnnouncement('${escapeHTML(item.id)}')" title="Hapus">
              <i class="fas fa-trash"></i>
            </button>
          </td>
        `;
        tbody.appendChild(tr);
      });
    } else {
      tbody.innerHTML = `<tr><td colspan="5" style="text-align: center; color: var(--text-muted); padding: 1.5rem;">Belum ada pengumuman yang dibuat.</td></tr>`;
    }
  } catch (err) {
    tbody.innerHTML = `<tr><td colspan="5" style="text-align: center; color: var(--danger); padding: 1.5rem;">Gagal memuat pengumuman.</td></tr>`;
  }
}

async function deleteAnnouncement(id) {
  if (!confirm("Apakah Anda yakin ingin menghapus pengumuman ini?")) return;

  try {
    const res = await ApiService.post("adminDeleteAnnouncement", {
      id: id,
      token: (adminUser && adminUser.token) || ""
    });
    if (res.success) {
      showToast("Berhasil", "Pengumuman berhasil dihapus.", "success");
      loadAnnouncementsAdmin();
    } else {
      showToast("Gagal", res.message || "Gagal menghapus.", "danger");
    }
  } catch (err) {
    showToast("Error", "Gagal menghubungi server.", "danger");
  }
}

/**
 * 9. Import CSV Calon Murid & Nilai Rapor
 */
function initImportExport() {
  // Download Template Murid
  const btnTplMurid = document.getElementById("btnDownloadTemplateMurid");
  if (btnTplMurid) {
    btnTplMurid.addEventListener("click", function() {
      const header = "NISN,NIK,Nama Lengkap,Jenis Kelamin,Jalur,Tempat Lahir,Tanggal Lahir,Nomor KK,Alamat,Nomor HP,Nama SD,Nama Ayah,Nama Ibu\n";
      const sample = "0091122334,6403011505090005,Muhammad Rizaldi,Laki-laki,Domisili,Segah,2013-05-15,6403012005080005,Jl. Poros Segah RT 02,081234567899,SDN 001 Segah,Bapak Rizaldi,Ibu Rizaldi\n";
      downloadFile("template_import_murid_baru.csv", header + sample);
    });
  }

  // Download Template Nilai Rapor
  const btnTplRaport = document.getElementById("btnDownloadTemplateRaport");
  if (btnTplRaport) {
    btnTplRaport.addEventListener("click", function() {
      const header = "Nomor Pendaftaran,NISN,Nama,Semester,Mata Pelajaran,Nilai,Tahun Pelajaran\n";
      const sample = "SPMB-2026-0001,0091234567,Ahmad Rizky Pratama,Semester 1,Matematika,88,2025/2026\nSPMB-2026-0001,0091234567,Ahmad Rizky Pratama,Semester 1,Bahasa Indonesia,92,2025/2026\n";
      downloadFile("template_import_nilai_rapor.csv", header + sample);
    });
  }

  // File picker pendaftar
  let csvMuridContent = "";
  const inputCsvMurid = document.getElementById("inputCsvMurid");
  const btnProsesMurid = document.getElementById("btnProsesImportMurid");
  const previewMurid = document.getElementById("previewCsvMurid");

  if (inputCsvMurid) {
    inputCsvMurid.addEventListener("change", function() {
      if (!this.files || this.files.length === 0) return;
      const file = this.files[0];
      const reader = new FileReader();
      reader.onload = function(e) {
        csvMuridContent = e.target.result;
        previewMurid.innerHTML = `<i class="fas fa-check-circle text-success"></i> ${file.name} (${(file.size / 1024).toFixed(0)} KB)`;
        btnProsesMurid.disabled = false;
      };
      reader.readAsText(file);
    });
  }

  if (btnProsesMurid) {
    btnProsesMurid.addEventListener("click", async function() {
      if (!csvMuridContent) return;
      btnProsesMurid.disabled = true;
      btnProsesMurid.innerHTML = `<span class="spinner"></span> Mengimpor...`;

      try {
        const res = await ApiService.post("adminImportApplicants", {
          csv: csvMuridContent,
          token: (adminUser && adminUser.token) || ""
        });
        btnProsesMurid.disabled = false;
        btnProsesMurid.innerHTML = `<i class="fas fa-upload"></i> Proses Import Murid`;

        if (res.success) {
          showToast("Import Sukses", res.message, "success", 5000);
          loadDashboardData();
          loadApplicantsData();
          inputCsvMurid.value = "";
          previewMurid.textContent = "";
        } else {
          showToast("Import Gagal", res.message || "Gagal mengimpor data CSV.", "danger");
        }
      } catch (err) {
        btnProsesMurid.disabled = false;
        btnProsesMurid.innerHTML = `<i class="fas fa-upload"></i> Proses Import Murid`;
        showToast("Error", "Gagal menghubungi server.", "danger");
      }
    });
  }

  // File picker nilai rapor
  let csvRaportContent = "";
  const inputCsvRaport = document.getElementById("inputCsvRaport");
  const btnProsesRaport = document.getElementById("btnProsesImportRaport");
  const previewRaport = document.getElementById("previewCsvRaport");

  if (inputCsvRaport) {
    inputCsvRaport.addEventListener("change", function() {
      if (!this.files || this.files.length === 0) return;
      const file = this.files[0];
      const reader = new FileReader();
      reader.onload = function(e) {
        csvRaportContent = e.target.result;
        previewRaport.innerHTML = `<i class="fas fa-check-circle text-success"></i> ${file.name} (${(file.size / 1024).toFixed(0)} KB)`;
        btnProsesRaport.disabled = false;
      };
      reader.readAsText(file);
    });
  }

  if (btnProsesRaport) {
    btnProsesRaport.addEventListener("click", async function() {
      if (!csvRaportContent) return;
      btnProsesRaport.disabled = true;
      btnProsesRaport.innerHTML = `<span class="spinner"></span> Mengimpor Nilai...`;

      try {
        const res = await ApiService.post("adminImportRaport", {
          csv: csvRaportContent,
          token: (adminUser && adminUser.token) || ""
        });
        btnProsesRaport.disabled = false;
        btnProsesRaport.innerHTML = `<i class="fas fa-upload"></i> Proses Import Nilai Rapor`;

        if (res.success) {
          showToast("Import Nilai Berhasil", res.message, "success", 5000);
          inputCsvRaport.value = "";
          previewRaport.textContent = "";
        } else {
          showToast("Import Gagal", res.message || "Gagal mengimpor nilai rapor.", "danger");
        }
      } catch (err) {
        btnProsesRaport.disabled = false;
        btnProsesRaport.innerHTML = `<i class="fas fa-upload"></i> Proses Import Nilai Rapor`;
        showToast("Error", "Gagal menghubungi server.", "danger");
      }
    });
  }

  const btnExportAll = document.getElementById("btnExportAllCsv");
  if (btnExportAll) {
    btnExportAll.addEventListener("click", exportApplicantsToCSV);
  }
}

/**
 * Export Semua Data Pendaftar ke File CSV Kompatibel Excel
 */
function exportApplicantsToCSV() {
  if (!allApplicants || allApplicants.length === 0) {
    showToast("Export Gagal", "Belum ada data pendaftar untuk diekspor.", "warning");
    return;
  }

  const headers = [
    "No. Pendaftaran", "Timestamp", "Nama Lengkap", "NISN", "NIK", "Jenis Kelamin",
    "Tempat Lahir", "Tanggal Lahir", "Agama", "Asal SD", "Jalur", "Status Verifikasi",
    "Status Seleksi", "Status Kelulusan", "Alamat", "Desa", "Kecamatan", "Nomor HP",
    "Nama Ayah", "Nama Ibu", "Catatan Admin"
  ];

  let csvContent = "\uFEFF" + headers.map(h => `"${h}"`).join(",") + "\n";

  allApplicants.forEach(a => {
    const ortu = a.orangTua || {};
    const row = [
      a.nomorPendaftaran || "",
      a.timestamp || "",
      a.namaLengkap || "",
      a.nisn || "",
      a.nik || "",
      a.jenisKelamin || "",
      a.tempatLahir || "",
      a.tanggalLahir || "",
      a.agama || "",
      a.namaSd || "",
      a.jalur || "",
      a.statusVerifikasi || "",
      a.statusSeleksi || "",
      a.statusKelulusan || "",
      a.alamat || "",
      a.desa || "",
      a.kecamatan || "",
      a.nomorHp || "",
      ortu.namaAyah || a.namaAyah || "",
      ortu.namaIbu || a.namaIbu || "",
      a.catatanAdmin || ""
    ];
    csvContent += row.map(val => `"${String(val).replace(/"/g, '""')}"`).join(",") + "\n";
  });

  const filename = `rekap_spmb_smpn1_segah_${new Date().toISOString().substring(0, 10)}.csv`;
  downloadFile(filename, csvContent);
  showToast("Export Selesai", "File rekap data pendaftar berhasil diunduh.", "success");
}

function downloadFile(filename, content) {
  const blob = new Blob([content], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", filename);
  link.style.visibility = "hidden";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * 10. Pengaturan SPMB (Termasuk Pengisian Manual Tahun Pelajaran)
 */
function initSettingsAdmin() {
  const form = document.getElementById("formPengaturanSpmb");
  if (!form) return;

  loadCurrentSettings();

  form.addEventListener("submit", async function(e) {
    e.preventDefault();

    const nama = document.getElementById("settingNamaSekolah")?.value.trim() || SCHOOL_CONFIG.name;
    const tahunPelajaran = document.getElementById("settingTahunPelajaran")?.value.trim();
    const tahunSpmb = document.getElementById("settingTahunSpmb")?.value.trim() || SCHOOL_CONFIG.year;
    const kuota = document.getElementById("settingTotalKuota")?.value || "200";
    const status = document.getElementById("settingStatusSpmb")?.value || "buka";
    const alamat = document.getElementById("settingAlamatSekolah")?.value.trim() || SCHOOL_CONFIG.address;

    if (!tahunPelajaran) {
      showToast("Validasi", "Kolom Tahun Pelajaran wajib diisi manual.", "warning");
      return;
    }

    const btn = document.getElementById("btnSimpanPengaturan");
    const origText = btn ? btn.innerHTML : "";
    if (btn) {
      btn.disabled = true;
      btn.innerHTML = `<span class="spinner"></span> Menyimpan...`;
    }

    const payload = {
      namaSekolah: nama,
      tahunPelajaran: tahunPelajaran,
      tahun: tahunSpmb,
      kuotaTotal: parseInt(kuota, 10) || 200,
      statusPendaftaran: status,
      alamatSekolah: alamat
    };

    try {
      const res = await ApiService.post("adminUpdateConfig", {
        data: payload,
        token: (adminUser && adminUser.token) || ""
      });

      if (btn) {
        btn.disabled = false;
        btn.innerHTML = origText;
      }

      if (res.success) {
        showToast("Pengaturan Disimpan", `Tahun Pelajaran "${tahunPelajaran}" berhasil disimpan!`, "success", 5000);
        
        // Simpan ke localStorage agar tersinkronisasi ke seluruh halaman
        localStorage.setItem("spmb_smpn1_segah_settings", JSON.stringify(payload));
        
        // Update in-memory configuration
        SCHOOL_CONFIG.academicYear = tahunPelajaran;
        SCHOOL_CONFIG.year = tahunSpmb;
        SCHOOL_CONFIG.name = nama;
        SCHOOL_CONFIG.address = alamat;
        SCHOOL_CONFIG.totalKuota = parseInt(kuota, 10) || SCHOOL_CONFIG.totalKuota;
        SCHOOL_CONFIG.statusPendaftaran = status;
        
        // Refresh display text jika ada di halaman
        if (typeof injectSchoolInfo === "function") {
          injectSchoolInfo();
        }
      } else {
        showToast("Gagal", res.message || "Gagal menyimpan konfigurasi.", "danger");
      }
    } catch (err) {
      if (btn) {
        btn.disabled = false;
        btn.innerHTML = origText;
      }
      showToast("Error", "Terjadi gangguan saat menyimpan ke server.", "danger");
    }
  });
}

async function loadCurrentSettings() {
  try {
    const res = await ApiService.get("getConfig");
    if (res.success && res.data) {
      const d = res.data;
      const elNama = document.getElementById("settingNamaSekolah");
      const elTp = document.getElementById("settingTahunPelajaran");
      const elTh = document.getElementById("settingTahunSpmb");
      const elK = document.getElementById("settingTotalKuota");
      const elSt = document.getElementById("settingStatusSpmb");
      const elAlamat = document.getElementById("settingAlamatSekolah");

      if (elNama && d.namaSekolah) elNama.value = d.namaSekolah;
      if (elTp && (d.tahunPelajaran || d.academicYear)) elTp.value = d.tahunPelajaran || d.academicYear;
      if (elTh && d.tahun) elTh.value = d.tahun;
      if (elK && d.kuotaTotal) elK.value = d.kuotaTotal;
      if (elSt && d.statusPendaftaran) elSt.value = d.statusPendaftaran;
      if (elAlamat && d.alamatSekolah) elAlamat.value = d.alamatSekolah;
    }
  } catch (e) {
    console.warn("Gagal memuat setting dari API:", e);
  }
}
