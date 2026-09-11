/**
 * ============================================================================
 * SPMB SMP NEGERI 1 SEGAH - MAIN JAVASCRIPT
 * File: js/main.js
 * Fungsi: Navigasi mobile, toast notifications, modal helper, data injection
 * ============================================================================
 */

document.addEventListener("DOMContentLoaded", function() {
  initNavbar();
  injectSchoolInfo();
  initModals();
});

/**
 * Inisialisasi Mobile Navigation Drawer & Hamburger Menu
 */
function initNavbar() {
  const toggleBtn = document.querySelector(".nav-toggle");
  const navMenu = document.querySelector(".nav-menu");

  if (toggleBtn && navMenu) {
    toggleBtn.addEventListener("click", function(e) {
      e.stopPropagation();
      navMenu.classList.toggle("show");
      const icon = toggleBtn.querySelector("i");
      if (icon) {
        if (navMenu.classList.contains("show")) {
          icon.classList.remove("fa-bars");
          icon.classList.add("fa-times");
        } else {
          icon.classList.remove("fa-times");
          icon.classList.add("fa-bars");
        }
      }
    });

    // Tutup menu jika klik di luar navbar
    document.addEventListener("click", function(e) {
      if (!navMenu.contains(e.target) && !toggleBtn.contains(e.target)) {
        navMenu.classList.remove("show");
        const icon = toggleBtn.querySelector("i");
        if (icon) {
          icon.classList.remove("fa-times");
          icon.classList.add("fa-bars");
        }
      }
    });

    // Tutup menu saat link diklik
    navMenu.querySelectorAll(".nav-link").forEach(link => {
      link.addEventListener("click", () => {
        navMenu.classList.remove("show");
      });
    });
  }

  // Highlight menu yang aktif berdasarkan halaman saat ini
  const currentPath = window.location.pathname.split("/").pop() || "index.html";
  document.querySelectorAll(".nav-link").forEach(link => {
    const href = link.getAttribute("href");
    if (href && (href === currentPath || (currentPath === "" && href === "index.html"))) {
      link.classList.add("active");
    } else {
      link.classList.remove("active");
    }
  });
}

/**
 * Sisipkan konfigurasi sekolah ke dalam placeholder HTML
 */
function injectSchoolInfo() {
  if (typeof SCHOOL_CONFIG === "undefined") return;

  try {
    const saved = localStorage.getItem("spmb_smpn1_segah_settings");
    if (saved) {
      const cfg = JSON.parse(saved);
      if (cfg.tahunPelajaran) SCHOOL_CONFIG.academicYear = cfg.tahunPelajaran;
      if (cfg.tahun) SCHOOL_CONFIG.year = cfg.tahun;
      if (cfg.namaSekolah) SCHOOL_CONFIG.name = cfg.namaSekolah;
      if (cfg.alamatSekolah) SCHOOL_CONFIG.address = cfg.alamatSekolah;
      if (cfg.statusPendaftaran) SCHOOL_CONFIG.statusPendaftaran = cfg.statusPendaftaran;
      if (cfg.kuotaTotal) SCHOOL_CONFIG.totalKuota = parseInt(cfg.kuotaTotal, 10);
    }
  } catch (e) {}

  document.querySelectorAll("[data-school-name]").forEach(el => {
    el.textContent = SCHOOL_CONFIG.name;
  });

  document.querySelectorAll("[data-school-short]").forEach(el => {
    el.textContent = SCHOOL_CONFIG.shortName;
  });

  document.querySelectorAll("[data-school-year]").forEach(el => {
    el.textContent = SCHOOL_CONFIG.year;
  });

  document.querySelectorAll("[data-school-academic-year]").forEach(el => {
    el.textContent = SCHOOL_CONFIG.academicYear;
  });

  document.querySelectorAll("[data-school-address]").forEach(el => {
    el.textContent = SCHOOL_CONFIG.address;
  });

  document.querySelectorAll("[data-school-phone]").forEach(el => {
    el.textContent = SCHOOL_CONFIG.phone || "0812-5555-6789";
  });

  document.querySelectorAll("[data-school-email]").forEach(el => {
    el.textContent = SCHOOL_CONFIG.email || "smpn1segah.berau@gmail.com";
  });
}

/**
 * Toast Notification System
 * type: 'success' | 'danger' | 'warning' | 'info'
 */
function showToast(title, message, type = "info", duration = 4500) {
  let container = document.querySelector(".toast-container");
  if (!container) {
    container = document.createElement("div");
    container.className = "toast-container";
    document.body.appendChild(container);
  }

  const icons = {
    success: "fa-check-circle",
    danger: "fa-exclamation-circle",
    warning: "fa-exclamation-triangle",
    info: "fa-info-circle"
  };

  const toast = document.createElement("div");
  toast.className = `toast toast-${type}`;
  toast.innerHTML = `
    <i class="fas ${icons[type] || icons.info} toast-icon"></i>
    <div class="toast-content">
      <div class="toast-title">${escapeHTML(title)}</div>
      <div class="toast-message">${escapeHTML(message)}</div>
    </div>
    <button type="button" class="toast-close" aria-label="Tutup">&times;</button>
  `;

  const closeBtn = toast.querySelector(".toast-close");
  closeBtn.addEventListener("click", () => removeToast(toast));

  container.appendChild(toast);

  const timer = setTimeout(() => {
    removeToast(toast);
  }, duration);

  function removeToast(el) {
    clearTimeout(timer);
    el.style.opacity = "0";
    el.style.transform = "translateX(50px)";
    setTimeout(() => {
      if (el.parentNode) el.parentNode.removeChild(el);
    }, 250);
  }
}

/**
 * Modal Management Utility
 */
function initModals() {
  // Tutup modal jika tombol close atau backdrop diklik
  document.addEventListener("click", function(e) {
    if (e.target.matches("[data-modal-close]") || e.target.closest("[data-modal-close]")) {
      const modal = e.target.closest(".modal-backdrop");
      if (modal) closeModal(modal.id);
    } else if (e.target.classList.contains("modal-backdrop")) {
      closeModal(e.target.id);
    }
  });

  // Tutup modal dengan tombol Escape (ESC)
  document.addEventListener("keydown", function(e) {
    if (e.key === "Escape") {
      document.querySelectorAll(".modal-backdrop.active").forEach(m => {
        closeModal(m.id);
      });
    }
  });
}

function openModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.classList.add("active");
    document.body.style.overflow = "hidden";
  }
}

function closeModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.classList.remove("active");
    // Pulihkan scroll jika tidak ada modal lain yang aktif
    if (!document.querySelector(".modal-backdrop.active")) {
      document.body.style.overflow = "";
    }
  }
}

/**
 * Helper Format Badge Status
 */
function getStatusBadgeHTML(status, category = "verifikasi") {
  if (!status) return `<span class="badge badge-warning">Menunggu</span>`;
  const s = String(status).trim();

  if (s === "Terverifikasi" || s === "Lulus" || s === "Memenuhi Syarat" || s === "Valid") {
    return `<span class="badge badge-success"><i class="fas fa-check-circle"></i> ${s}</span>`;
  }
  if (s === "Tidak Lulus" || s === "Ditolak" || s === "Tidak Valid") {
    return `<span class="badge badge-danger"><i class="fas fa-times-circle"></i> ${s}</span>`;
  }
  if (s === "Perlu Perbaikan") {
    return `<span class="badge badge-perbaikan"><i class="fas fa-wrench"></i> ${s}</span>`;
  }
  return `<span class="badge badge-warning"><i class="fas fa-clock"></i> ${s}</span>`;
}

/**
 * Sanitasi String HTML untuk mencegah XSS
 */
function escapeHTML(str) {
  if (str === null || str === undefined) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
