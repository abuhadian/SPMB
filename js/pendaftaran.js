/**
 * ============================================================================
 * SPMB SMP NEGERI 1 SEGAH - PENDAFTARAN WIZARD & CETAK BUKTI JAVASCRIPT
 * File: js/pendaftaran.js
 * ============================================================================
 */

document.addEventListener("DOMContentLoaded", function() {
  initRegistrationWizard();
  checkUrlParamsForTrack();
  initFileUploadHandlers();
  initAchievementToggle();
});

let currentStep = 1;
const totalSteps = 6;
const uploadedFilesBase64 = {
  kk: null,
  akta: null,
  ijazah: null,
  lain: null
};

/**
 * Cek URL query parameter untuk auto-select jalur (contoh: pendaftaran.html?jalur=prestasi)
 */
function checkUrlParamsForTrack() {
  const urlParams = new URLSearchParams(window.location.search);
  const jalurParam = urlParams.get("jalur");
  if (jalurParam) {
    const selectJalur = document.getElementById("jalurPendaftaran");
    if (selectJalur) {
      for (let i = 0; i < selectJalur.options.length; i++) {
        if (selectJalur.options[i].value.toLowerCase().includes(jalurParam.toLowerCase())) {
          selectJalur.selectedIndex = i;
          break;
        }
      }
    }
  }
}

/**
 * Tampilkan form input detail prestasi jika kategori prestasi dipilih
 */
function initAchievementToggle() {
  const kategoriSelect = document.getElementById("kategoriPrestasi");
  const detailContainer = document.getElementById("prestasiDetailContainer");

  if (kategoriSelect && detailContainer) {
    kategoriSelect.addEventListener("change", function() {
      if (this.value === "Tidak ada") {
        detailContainer.style.display = "none";
      } else {
        detailContainer.style.display = "block";
      }
    });
  }
}

/**
 * Pengelolaan File Upload & Konversi ke Base64
 */
function initFileUploadHandlers() {
  const fileConfigs = [
    { inputId: "fileKk", previewId: "previewKk", errorId: "errorKk", key: "kk" },
    { inputId: "fileAkta", previewId: "previewAkta", errorId: "errorAkta", key: "akta" },
    { inputId: "fileIjazah", previewId: "previewIjazah", errorId: "errorIjazah", key: "ijazah" },
    { inputId: "fileLain", previewId: "previewLain", errorId: "errorLain", key: "lain" }
  ];

  fileConfigs.forEach(cfg => {
    const input = document.getElementById(cfg.inputId);
    const preview = document.getElementById(cfg.previewId);
    const error = document.getElementById(cfg.errorId);

    if (input) {
      input.addEventListener("change", function() {
        if (!this.files || this.files.length === 0) return;
        const file = this.files[0];
        error.textContent = "";

        // Validasi Ukuran (Maks 2MB)
        if (file.size > APP_CONFIG.maxUploadSizeBytes) {
          error.textContent = `Ukuran file (${(file.size / (1024 * 1024)).toFixed(1)} MB) melebihi batas maksimal 2 MB.`;
          this.value = "";
          uploadedFilesBase64[cfg.key] = null;
          preview.textContent = "";
          return;
        }

        // Validasi Ekstensi
        const ext = file.name.split(".").pop().toLowerCase();
        if (!APP_CONFIG.allowedFileExtensions.includes(ext)) {
          error.textContent = `Format .${ext} tidak diizinkan! Hanya diperbolehkan PDF, JPG, JPEG, PNG.`;
          this.value = "";
          uploadedFilesBase64[cfg.key] = null;
          preview.textContent = "";
          return;
        }

        // Baca Base64
        const reader = new FileReader();
        reader.onload = function(e) {
          uploadedFilesBase64[cfg.key] = {
            fileName: file.name,
            mimeType: file.type || "application/octet-stream",
            base64Data: e.target.result
          };
          preview.innerHTML = `<i class="fas fa-check-circle text-success"></i> ${file.name} (${(file.size / 1024).toFixed(0)} KB)`;
        };
        reader.readAsDataURL(file);
      });
    }
  });
}

/**
 * Inisialisasi Wizard Pendaftaran & Navigasi Antar Step
 */
function initRegistrationWizard() {
  const btnPrev = document.getElementById("btnPrevStep");
  const btnNext = document.getElementById("btnNextStep");
  const btnSubmit = document.getElementById("btnSubmitForm");
  const form = document.getElementById("formPendaftaran");

  if (btnPrev) {
    btnPrev.addEventListener("click", () => {
      if (currentStep > 1) {
        goToStep(currentStep - 1);
      }
    });
  }

  if (btnNext) {
    btnNext.addEventListener("click", () => {
      if (validateStep(currentStep)) {
        if (currentStep < totalSteps) {
          goToStep(currentStep + 1);
        }
      }
    });
  }

  if (form) {
    form.addEventListener("submit", handleFormSubmission);
  }
}

/**
 * Berpindah ke Step yang ditentukan
 */
function goToStep(stepNumber) {
  // Update Panes
  document.querySelectorAll(".wizard-step-pane").forEach(pane => {
    pane.classList.remove("active");
  });
  const targetPane = document.querySelector(`[data-step-pane="${stepNumber}"]`);
  if (targetPane) targetPane.classList.add("active");

  // Update Indicator Status
  document.querySelectorAll(".wizard-step-item").forEach(item => {
    const stepIdx = parseInt(item.getAttribute("data-step-indicator"), 10);
    item.classList.remove("active", "completed");
    if (stepIdx === stepNumber) {
      item.classList.add("active");
    } else if (stepIdx < stepNumber) {
      item.classList.add("completed");
    }
  });

  // Update Tombol Navigasi
  const btnPrev = document.getElementById("btnPrevStep");
  const btnNext = document.getElementById("btnNextStep");
  const btnSubmit = document.getElementById("btnSubmitForm");

  if (stepNumber === 1) {
    btnPrev.style.display = "none";
  } else {
    btnPrev.style.display = "inline-flex";
  }

  if (stepNumber === totalSteps) {
    btnNext.style.display = "none";
    btnSubmit.style.display = "inline-flex";
    populateReviewData();
  } else {
    btnNext.style.display = "inline-flex";
    btnSubmit.style.display = "none";
  }

  currentStep = stepNumber;
  window.scrollTo({ top: document.getElementById("registrationContainer").offsetTop - 80, behavior: "smooth" });
}

/**
 * Validasi per Tahap Form
 */
function validateStep(step) {
  let isValid = true;
  clearStepErrors();

  if (step === 1) {
    // Validasi Data Murid
    const nama = document.getElementById("namaLengkap");
    if (!nama.value.trim()) {
      showInputError(nama, "Nama lengkap wajib diisi.");
      isValid = false;
    }

    const nik = document.getElementById("nik");
    const cleanNik = nik.value.replace(/\D/g, "");
    if (cleanNik.length !== 16) {
      showInputError(nik, "NIK wajib 16 digit angka sesuai Kartu Keluarga.");
      isValid = false;
    }

    const nisn = document.getElementById("nisn");
    if (nisn.value.trim()) {
      const cleanNisn = nisn.value.replace(/\D/g, "");
      if (cleanNisn.length !== 10) {
        showInputError(nisn, "NISN harus tepat 10 digit angka.");
        isValid = false;
      }
    }

    const jk = document.getElementById("jenisKelamin");
    if (!jk.value) {
      showInputError(jk, "Silakan pilih jenis kelamin.");
      isValid = false;
    }

    const agama = document.getElementById("agama");
    if (!agama.value) {
      showInputError(agama, "Silakan pilih agama.");
      isValid = false;
    }

    const tempat = document.getElementById("tempatLahir");
    if (!tempat.value.trim()) {
      showInputError(tempat, "Tempat lahir wajib diisi.");
      isValid = false;
    }

    const tgl = document.getElementById("tanggalLahir");
    if (!tgl.value) {
      showInputError(tgl, "Tanggal lahir wajib diisi.");
      isValid = false;
    }

    const noKk = document.getElementById("nomorKk");
    const cleanKk = noKk.value.replace(/\D/g, "");
    if (cleanKk.length !== 16) {
      showInputError(noKk, "Nomor Kartu Keluarga (KK) wajib 16 digit angka.");
      isValid = false;
    }

    const alamat = document.getElementById("alamat");
    if (!alamat.value.trim()) {
      showInputError(alamat, "Alamat tempat tinggal wajib diisi.");
      isValid = false;
    }

    const rt = document.getElementById("rt");
    if (!rt.value.trim()) {
      showInputError(rt, "RT wajib diisi.");
      isValid = false;
    }

    const desa = document.getElementById("desa");
    if (!desa.value.trim()) {
      showInputError(desa, "Desa / Kelurahan wajib diisi.");
      isValid = false;
    }

    const hp = document.getElementById("nomorHp");
    const cleanHp = hp.value.replace(/\D/g, "");
    if (cleanHp.length < 10 || cleanHp.length > 15) {
      showInputError(hp, "Nomor HP / WA aktif minimal 10 digit (contoh: 081234567890).");
      isValid = false;
    }
  } else if (step === 2) {
    // Validasi Asal Sekolah
    const namaSd = document.getElementById("namaSd");
    if (!namaSd.value.trim()) {
      showInputError(namaSd, "Nama SD/MI asal wajib diisi.");
      isValid = false;
    }
  } else if (step === 3) {
    // Validasi Orang Tua
    const namaAyah = document.getElementById("namaAyah");
    if (!namaAyah.value.trim()) {
      showInputError(namaAyah, "Nama ayah wajib diisi.");
      isValid = false;
    }

    const pekAyah = document.getElementById("pekerjaanAyah");
    if (!pekAyah.value.trim()) {
      showInputError(pekAyah, "Pekerjaan ayah wajib diisi.");
      isValid = false;
    }

    const namaIbu = document.getElementById("namaIbu");
    if (!namaIbu.value.trim()) {
      showInputError(namaIbu, "Nama ibu wajib diisi.");
      isValid = false;
    }
  } else if (step === 4) {
    // Validasi Jalur
    const jalur = document.getElementById("jalurPendaftaran");
    if (!jalur.value) {
      showInputError(jalur, "Silakan pilih salah satu jalur pendaftaran.");
      isValid = false;
    }
  } else if (step === 5) {
    // Validasi Dokumen Wajib: KK, Akta, Ijazah/SKL
    const errorKk = document.getElementById("errorKk");
    const errorAkta = document.getElementById("errorAkta");
    const errorIjazah = document.getElementById("errorIjazah");

    if (!uploadedFilesBase64.kk) {
      errorKk.textContent = "Berkas Kartu Keluarga (KK) wajib diunggah.";
      isValid = false;
    }
    if (!uploadedFilesBase64.akta) {
      errorAkta.textContent = "Berkas Akta Kelahiran wajib diunggah.";
      isValid = false;
    }
    if (!uploadedFilesBase64.ijazah) {
      errorIjazah.textContent = "Berkas Ijazah atau Surat Keterangan Lulus (SKL) wajib diunggah.";
      isValid = false;
    }
  }

  if (!isValid) {
    showToast("Validasi Formulir", "Masih terdapat kolom yang belum diisi dengan benar. Mohon periksa kembali.", "warning");
  }

  return isValid;
}

function showInputError(inputEl, msg) {
  inputEl.classList.add("is-invalid");
  const parent = inputEl.closest(".form-group");
  if (parent) {
    const errorSpan = parent.querySelector(".form-error");
    if (errorSpan) errorSpan.textContent = msg;
  }
}

function clearStepErrors() {
  document.querySelectorAll(".form-control.is-invalid").forEach(el => {
    el.classList.remove("is-invalid");
  });
  document.querySelectorAll(".form-error").forEach(el => {
    el.textContent = "";
  });
}

/**
 * Tampilkan Rangkuman Data pada Step 6 (Review)
 */
function populateReviewData() {
  const container = document.getElementById("reviewContentBox");
  if (!container) return;

  const nama = document.getElementById("namaLengkap").value;
  const nik = document.getElementById("nik").value;
  const nisn = document.getElementById("nisn").value || "-";
  const jk = document.getElementById("jenisKelamin").value;
  const ttl = `${document.getElementById("tempatLahir").value}, ${document.getElementById("tanggalLahir").value}`;
  const agama = document.getElementById("agama").value;
  const alamat = `${document.getElementById("alamat").value} RT ${document.getElementById("rt").value}/RW ${document.getElementById("rw").value}, Desa ${document.getElementById("desa").value}, Kec. ${document.getElementById("kecamatan").value}`;
  const hp = document.getElementById("nomorHp").value;
  const sd = document.getElementById("namaSd").value;
  const ayah = document.getElementById("namaAyah").value;
  const ibu = document.getElementById("namaIbu").value;
  const jalur = document.getElementById("jalurPendaftaran").value;
  const katPrestasi = document.getElementById("kategoriPrestasi").value;
  const namaPrestasi = katPrestasi !== "Tidak ada" ? (document.getElementById("namaPrestasi").value || "-") : "Tidak ada";

  container.innerHTML = `
    <table class="schedule-table" style="box-shadow: none;">
      <tbody>
        <tr><td style="width: 30%; font-weight: 700;">Jalur Pendaftaran</td><td style="color: var(--primary); font-weight: 800; font-size: 1.05rem;">${escapeHTML(jalur)}</td></tr>
        <tr><td style="font-weight: 700;">Nama Calon Murid</td><td><strong>${escapeHTML(nama)}</strong></td></tr>
        <tr><td style="font-weight: 700;">NIK & NISN</td><td>NIK: ${escapeHTML(nik)} | NISN: ${escapeHTML(nisn)}</td></tr>
        <tr><td style="font-weight: 700;">Jenis Kelamin & Agama</td><td>${escapeHTML(jk)} | ${escapeHTML(agama)}</td></tr>
        <tr><td style="font-weight: 700;">Tempat, Tanggal Lahir</td><td>${escapeHTML(ttl)}</td></tr>
        <tr><td style="font-weight: 700;">Alamat Tempat Tinggal</td><td>${escapeHTML(alamat)}</td></tr>
        <tr><td style="font-weight: 700;">No. WhatsApp / HP</td><td>${escapeHTML(hp)}</td></tr>
        <tr><td style="font-weight: 700;">Sekolah Asal (SD/MI)</td><td>${escapeHTML(sd)}</td></tr>
        <tr><td style="font-weight: 700;">Nama Orang Tua</td><td>Ayah: ${escapeHTML(ayah)} | Ibu: ${escapeHTML(ibu)}</td></tr>
        <tr><td style="font-weight: 700;">Prestasi Tambahan</td><td>${escapeHTML(katPrestasi)} (${escapeHTML(namaPrestasi)})</td></tr>
        <tr>
          <td style="font-weight: 700;">Dokumen Diunggah</td>
          <td>
            <span class="badge badge-success"><i class="fas fa-file"></i> KK</span>
            <span class="badge badge-success"><i class="fas fa-file"></i> Akta</span>
            <span class="badge badge-success"><i class="fas fa-file"></i> Ijazah/SKL</span>
            ${uploadedFilesBase64.lain ? `<span class="badge badge-info"><i class="fas fa-file"></i> Dokumen Lain</span>` : ""}
          </td>
        </tr>
      </tbody>
    </table>
  `;
}

/**
 * Proses Pengiriman Formulir Pendaftaran (Submit)
 */
async function handleFormSubmission(e) {
  e.preventDefault();

  const checkPernyataan = document.getElementById("checkPernyataan");
  const errorPernyataan = document.getElementById("errorPernyataan");

  if (!checkPernyataan.checked) {
    errorPernyataan.textContent = "Anda wajib menyetujui pernyataan kebenaran data di atas.";
    showToast("Persetujuan", "Harap centang persetujuan kebenaran data.", "warning");
    return;
  }

  const btnSubmit = document.getElementById("btnSubmitForm");
  const origBtnText = btnSubmit.innerHTML;
  btnSubmit.disabled = true;
  btnSubmit.innerHTML = `<span class="spinner"></span> Mengirim data...`;

  try {
    // Siapkan Dokumen URLs (jika direct drive upload atau mock base64)
    const dokumenUrls = {
      kk: uploadedFilesBase64.kk ? uploadedFilesBase64.kk.base64Data : "",
      akta: uploadedFilesBase64.akta ? uploadedFilesBase64.akta.base64Data : "",
      ijazah: uploadedFilesBase64.ijazah ? uploadedFilesBase64.ijazah.base64Data : "",
      lain: uploadedFilesBase64.lain ? uploadedFilesBase64.lain.base64Data : ""
    };

    // Data Prestasi
    const katPrestasi = document.getElementById("kategoriPrestasi").value;
    const listPrestasi = [];
    if (katPrestasi !== "Tidak ada") {
      listPrestasi.push({
        jenisPrestasi: katPrestasi,
        tingkat: document.getElementById("tingkatPrestasi").value,
        namaPrestasi: document.getElementById("namaPrestasi").value,
        tahun: document.getElementById("tahunPrestasi").value,
        penyelenggara: document.getElementById("penyelenggaraPrestasi").value,
        keterangan: "Prestasi yang dilampirkan pendaftar"
      });
    }

    const payload = {
      namaLengkap: document.getElementById("namaLengkap").value.trim(),
      namaPanggilan: document.getElementById("namaPanggilan").value.trim(),
      nik: document.getElementById("nik").value.trim(),
      nisn: document.getElementById("nisn").value.trim(),
      jenisKelamin: document.getElementById("jenisKelamin").value,
      agama: document.getElementById("agama").value,
      tempatLahir: document.getElementById("tempatLahir").value.trim(),
      tanggalLahir: document.getElementById("tanggalLahir").value,
      nomorKk: document.getElementById("nomorKk").value.trim(),
      statusAnak: document.getElementById("statusAnak").value,
      anakKe: document.getElementById("anakKe").value,
      jumlahSaudara: document.getElementById("jumlahSaudara").value,
      alamat: document.getElementById("alamat").value.trim(),
      rt: document.getElementById("rt").value.trim(),
      rw: document.getElementById("rw").value.trim(),
      desa: document.getElementById("desa").value.trim(),
      kecamatan: document.getElementById("kecamatan").value.trim(),
      kabupaten: document.getElementById("kabupaten").value.trim(),
      provinsi: document.getElementById("provinsi").value.trim(),
      kodePos: document.getElementById("kodePos").value.trim(),
      nomorHp: document.getElementById("nomorHp").value.trim(),
      email: document.getElementById("email").value.trim(),
      namaSd: document.getElementById("namaSd").value.trim(),
      npsnSd: document.getElementById("npsnSd").value.trim(),
      tahunLulus: document.getElementById("tahunLulus").value,
      noUjian: document.getElementById("noUjian").value.trim(),
      namaAyah: document.getElementById("namaAyah").value.trim(),
      nikAyah: document.getElementById("nikAyah").value.trim(),
      pendidikanAyah: document.getElementById("pendidikanAyah").value,
      pekerjaanAyah: document.getElementById("pekerjaanAyah").value.trim(),
      penghasilanAyah: document.getElementById("penghasilanAyah").value,
      hpAyah: document.getElementById("hpAyah").value.trim(),
      namaIbu: document.getElementById("namaIbu").value.trim(),
      nikIbu: document.getElementById("nikIbu").value.trim(),
      pendidikanIbu: document.getElementById("pendidikanIbu").value,
      pekerjaanIbu: document.getElementById("pekerjaanIbu").value.trim(),
      penghasilanIbu: document.getElementById("penghasilanIbu").value,
      hpIbu: document.getElementById("hpIbu").value.trim(),
      namaWali: document.getElementById("namaWali").value.trim(),
      hubunganWali: document.getElementById("hubunganWali").value.trim(),
      pekerjaanWali: document.getElementById("pekerjaanWali").value.trim(),
      hpWali: document.getElementById("hpWali").value.trim(),
      jalur: document.getElementById("jalurPendaftaran").value,
      prestasi: listPrestasi,
      dokumenUrls: dokumenUrls
    };

    const res = await ApiService.post("register", payload);

    if (res.success && res.data) {
      showToast("Pendaftaran Berhasil", "Data Anda telah tersimpan dengan nomor " + res.data.nomorPendaftaran, "success", 6000);
      renderBuktiPendaftaran({
        ...payload,
        nomorPendaftaran: res.data.nomorPendaftaran,
        tanggalPendaftaran: res.data.tanggalPendaftaran
      });
    } else {
      showToast("Gagal Mendaftar", res.message || "Terjadi kesalahan saat memproses pendaftaran.", "danger", 6000);
      btnSubmit.disabled = false;
      btnSubmit.innerHTML = origBtnText;
    }
  } catch (err) {
    console.error("Error submission:", err);
    showToast("Kesalahan Jaringan", "Gagal menghubungi server SPMB. Silakan periksa koneksi Anda.", "danger");
    btnSubmit.disabled = false;
    btnSubmit.innerHTML = origBtnText;
  }
}

/**
 * Tampilkan Bukti Pendaftaran Resmi & Render QR Code
 */
function renderBuktiPendaftaran(data) {
  // Sembunyikan form
  document.getElementById("registrationContainer").style.display = "none";
  // Tampilkan container hasil sukses
  document.getElementById("successResultContainer").style.display = "block";
  document.getElementById("printBuktiArea").style.display = "block";

  // Isi data ke bukti pendaftaran
  document.getElementById("buktiNoPendaftaran").textContent = data.nomorPendaftaran;
  document.getElementById("buktiTglDaftar").textContent = data.tanggalPendaftaran;
  document.getElementById("buktiJalur").textContent = data.jalur;
  document.getElementById("buktiNama").textContent = data.namaLengkap;
  document.getElementById("buktiNisn").textContent = data.nisn || "-";
  document.getElementById("buktiJk").textContent = data.jenisKelamin;
  document.getElementById("buktiTtl").textContent = `${data.tempatLahir}, ${data.tanggalLahir}`;
  document.getElementById("buktiAsalSd").textContent = data.namaSd;
  document.getElementById("buktiAlamat").textContent = `${data.alamat} RT ${data.rt}/RW ${data.rw}, ${data.desa}, Kec. ${data.kecamatan}`;
  document.getElementById("buktiOrtu").textContent = `${data.namaAyah} / ${data.namaIbu}`;
  document.getElementById("buktiHp").textContent = data.nomorHp;
  document.getElementById("buktiSigOrtu").textContent = `( ${data.namaAyah || data.namaIbu} )`;

  // Render QR Code untuk cek status
  const qrContainer = document.getElementById("buktiQrCodeContainer");
  qrContainer.innerHTML = "";
  
  // URL untuk verifikasi scan QR
  const baseUrl = window.location.origin + window.location.pathname.replace("pendaftaran.html", "cek-status.html");
  const checkUrl = `${baseUrl}?no=${encodeURIComponent(data.nomorPendaftaran)}&verif=${encodeURIComponent(data.nisn || data.tanggalLahir)}`;

  if (typeof QRCode !== "undefined") {
    new QRCode(qrContainer, {
      text: checkUrl,
      width: 120,
      height: 120,
      colorDark: "#0f172a",
      colorLight: "#ffffff",
      correctLevel: QRCode.CorrectLevel.M
    });
  }

  window.scrollTo({ top: 0, behavior: "smooth" });
}
