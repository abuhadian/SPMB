/**
 * ============================================================================
 * SPMB SMP NEGERI 1 SEGAH - API CLIENT & LOCAL FALLBACK MOCK
 * File: js/api.js
 * 
 * Fungsi:
 * - Menghubungkan frontend ke Google Apps Script Web App API
 * - Jika API_URL kosong (Mode Demo), otomatis menyediakan Mock Database
 *   berbasis LocalStorage sehingga seluruh alur (Pendaftaran, Cek Status,
 *   Dashboard Admin, Seleksi, Import/Export) dapat diuji coba seketika!
 * ============================================================================
 */

const ApiService = (function() {
  const isDemo = APP_CONFIG.demoMode;

  // Inisialisasi Database Lokal jika dalam Mode Demo
  const LOCAL_STORAGE_KEYS = {
    APPLICANTS: "spmb_smpn1_segah_applicants",
    ANNOUNCEMENTS: "spmb_smpn1_segah_announcements",
    SETTINGS: "spmb_smpn1_segah_settings",
    ADMIN_SESSION: "spmb_smpn1_segah_admin_session"
  };

  function initDemoData() {
    if (!localStorage.getItem(LOCAL_STORAGE_KEYS.APPLICANTS)) {
      const demoApplicants = [
        {
          id: "PND-0001",
          nomorPendaftaran: "SPMB-2026-0001",
          timestamp: "2026-06-02 08:30:00",
          tahun: "2026",
          nisn: "0091234567",
          nik: "6403011204090001",
          namaLengkap: "Ahmad Rizky Pratama",
          namaPanggilan: "Rizky",
          jenisKelamin: "Laki-laki",
          tempatLahir: "Segah",
          tanggalLahir: "2013-05-12",
          agama: "Islam",
          nomorKk: "6403012005080002",
          alamat: "Jl. Poros Segah RT 02",
          rt: "02",
          rw: "01",
          desa: "Tepian Buah",
          kecamatan: "Segah",
          kabupaten: "Berau",
          provinsi: "Kalimantan Timur",
          kodePos: "77353",
          nomorHp: "081234567890",
          email: "rizky.pratama@gmail.com",
          namaSd: "SD Negeri 001 Segah",
          npsnSd: "30401234",
          tahunLulus: "2026",
          jalur: "Domisili",
          statusVerifikasi: "Terverifikasi",
          statusSeleksi: "Memenuhi Syarat",
          statusKelulusan: "Lulus",
          catatanAdmin: "Berkas lengkap dan sesuai ketentuan domisili.",
          tanggalUpdate: "2026-06-03 10:15:00",
          orangTua: {
            namaAyah: "Supardi Pratama",
            pekerjaanAyah: "Petani / Pekebun",
            hpAyah: "081234567890",
            namaIbu: "Siti Aminah",
            pekerjaanIbu: "Ibu Rumah Tangga",
            hpIbu: "081234567890"
          },
          dokumenUrls: {
            kk: "assets/sample_doc.svg",
            akta: "assets/sample_doc.svg",
            ijazah: "assets/sample_doc.svg"
          }
        },
        {
          id: "PND-0002",
          nomorPendaftaran: "SPMB-2026-0002",
          timestamp: "2026-06-02 09:45:00",
          tahun: "2026",
          nisn: "0098765432",
          nik: "6403015408090002",
          namaLengkap: "Siti Nurhaliza Putri",
          namaPanggilan: "Siti",
          jenisKelamin: "Perempuan",
          tempatLahir: "Tanjung Redeb",
          tanggalLahir: "2013-08-24",
          agama: "Islam",
          nomorKk: "6403012106090003",
          alamat: "Jl. Trans Segah RT 05",
          rt: "05",
          rw: "02",
          desa: "Gunung Sari",
          kecamatan: "Segah",
          kabupaten: "Berau",
          provinsi: "Kalimantan Timur",
          kodePos: "77353",
          nomorHp: "081398765432",
          email: "siti.putri@gmail.com",
          namaSd: "SD Negeri 002 Segah",
          npsnSd: "30401235",
          tahunLulus: "2026",
          jalur: "Prestasi",
          statusVerifikasi: "Terverifikasi",
          statusSeleksi: "Memenuhi Syarat",
          statusKelulusan: "Lulus",
          catatanAdmin: "Sertifikat Juara 1 OSN Matematika Tingkat Kabupaten valid.",
          tanggalUpdate: "2026-06-03 11:30:00",
          orangTua: {
            namaAyah: "M. Yunus",
            pekerjaanAyah: "Wiraswasta",
            hpAyah: "081398765432",
            namaIbu: "Halimah",
            pekerjaanIbu: "PNS / Guru",
            hpIbu: "081398765432"
          },
          dokumenUrls: {
            kk: "assets/sample_doc.svg",
            akta: "assets/sample_doc.svg",
            ijazah: "assets/sample_doc.svg"
          }
        },
        {
          id: "PND-0003",
          nomorPendaftaran: "SPMB-2026-0003",
          timestamp: "2026-06-03 13:10:00",
          tahun: "2026",
          nisn: "0093456789",
          nik: "6403011802090003",
          namaLengkap: "Budi Santoso",
          namaPanggilan: "Budi",
          jenisKelamin: "Laki-laki",
          tempatLahir: "Berau",
          tanggalLahir: "2013-02-18",
          agama: "Kristen",
          nomorKk: "6403012207100004",
          alamat: "Jl. Usaha Bersama RT 01",
          rt: "01",
          rw: "01",
          desa: "Harapan Jaya",
          kecamatan: "Segah",
          kabupaten: "Berau",
          provinsi: "Kalimantan Timur",
          kodePos: "77353",
          nomorHp: "085245678123",
          email: "budi.santoso@yahoo.com",
          namaSd: "SD Negeri 003 Segah",
          npsnSd: "30401236",
          tahunLulus: "2026",
          jalur: "Afirmasi",
          statusVerifikasi: "Menunggu Verifikasi",
          statusSeleksi: "Dalam Proses",
          statusKelulusan: "Dalam Proses",
          catatanAdmin: "Pendaftaran online diterima. Menunggu verifikasi fisik KIP.",
          tanggalUpdate: "2026-06-03 13:10:00",
          orangTua: {
            namaAyah: "Yohanes Santoso",
            pekerjaanAyah: "Buruh Harian",
            hpAyah: "085245678123",
            namaIbu: "Maria Kristina",
            pekerjaanIbu: "Ibu Rumah Tangga",
            hpIbu: "085245678123"
          },
          dokumenUrls: {
            kk: "assets/sample_doc.svg",
            akta: "assets/sample_doc.svg"
          }
        },
        {
          id: "PND-0004",
          nomorPendaftaran: "SPMB-2026-0004",
          timestamp: "2026-06-04 10:20:00",
          tahun: "2026",
          nisn: "0095678901",
          nik: "6403016109090004",
          namaLengkap: "Dewi Lestari",
          namaPanggilan: "Dewi",
          jenisKelamin: "Perempuan",
          tempatLahir: "Segah",
          tanggalLahir: "2013-09-21",
          agama: "Islam",
          nomorKk: "6403012308110005",
          alamat: "Jl. Melati RT 03",
          rt: "03",
          rw: "01",
          desa: "Pandis Batu",
          kecamatan: "Segah",
          kabupaten: "Berau",
          provinsi: "Kalimantan Timur",
          kodePos: "77353",
          nomorHp: "082156789012",
          email: "dewi.lestari@gmail.com",
          namaSd: "SD Negeri 001 Segah",
          npsnSd: "30401234",
          tahunLulus: "2026",
          jalur: "Domisili",
          statusVerifikasi: "Perlu Perbaikan",
          statusSeleksi: "Belum Memenuhi",
          statusKelulusan: "Dalam Proses",
          catatanAdmin: "Scan Kartu Keluarga buram dan tidak terbaca. Harap upload ulang scan dokumen KK asli yang jelas.",
          tanggalUpdate: "2026-06-05 08:30:00",
          orangTua: {
            namaAyah: "Bambang Lestari",
            pekerjaanAyah: "Petani",
            hpAyah: "082156789012",
            namaIbu: "Ratna Sari",
            pekerjaanIbu: "Ibu Rumah Tangga",
            hpIbu: "082156789012"
          },
          dokumenUrls: {
            kk: "assets/sample_doc.svg"
          }
        }
      ];
      localStorage.setItem(LOCAL_STORAGE_KEYS.APPLICANTS, JSON.stringify(demoApplicants));
    }

    if (!localStorage.getItem(LOCAL_STORAGE_KEYS.ANNOUNCEMENTS)) {
      const demoAnnouncements = [
        {
          id: "PGM-001",
          judul: "Jadwal Verifikasi Berkas Fisik Calon Murid Baru SPMB 2026",
          isi: "Diberitahukan kepada seluruh calon murid baru yang telah mendaftar secara daring untuk membawa berkas dokumen asli (KK, Akta Kelahiran, dan Surat Keterangan Lulus) ke Sekretariat SPMB SMP Negeri 1 Segah pada hari kerja pukul 08.00 - 13.00 WITA.",
          tanggal: "2026-06-01",
          status: "Publik",
          link: ""
        },
        {
          id: "PGM-002",
          judul: "Penetapan Kuota dan Daya Tampung Setiap Jalur SPMB 2026",
          isi: "SMP Negeri 1 Segah menerima total 200 murid baru untuk Tahun Pelajaran 2026/2027. Kuota terbagi menjadi: Jalur Domisili (120 kursi), Jalur Prestasi (40 kursi), Jalur Afirmasi (30 kursi), dan Jalur Perpindahan Orang Tua (10 kursi).",
          tanggal: "2026-05-25",
          status: "Publik",
          link: ""
        }
      ];
      localStorage.setItem(LOCAL_STORAGE_KEYS.ANNOUNCEMENTS, JSON.stringify(demoAnnouncements));
    }
  }

  // Panggil inisialisasi jika demo mode
  if (isDemo) {
    initDemoData();
  }

  // ==========================================
  // HTTP FETCH HELPER UNTUK LIVE BACKEND
  // ==========================================
  async function requestApi(action, params = {}, method = "GET") {
    if (isDemo) {
      return executeMockAction(action, params, method);
    }

    try {
      if (method === "GET") {
        const query = new URLSearchParams({ action, ...params }).toString();
        const res = await fetch(`${API_URL}?${query}`);
        if (!res.ok) throw new Error(`HTTP Error: ${res.status}`);
        return await res.json();
      } else {
        const res = await fetch(API_URL, {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: JSON.stringify({ action, ...params })
        });
        if (!res.ok) throw new Error(`HTTP Error: ${res.status}`);
        return await res.json();
      }
    } catch (err) {
      console.warn("API request gagal, beralih sementara ke Mock Local: ", err);
      // Fallback mulus ke mock jika server bermasalah saat pengujian
      return executeMockAction(action, params, method);
    }
  }

  // ==========================================
  // MOCK DATABASE DISPATCHER (OFFLINE/DEMO)
  // ==========================================
  function executeMockAction(action, params) {
    return new Promise((resolve) => {
      setTimeout(() => {
        const applicants = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEYS.APPLICANTS) || "[]");
        const announcements = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEYS.ANNOUNCEMENTS) || "[]");

        switch (action) {
          case "getConfig": {
            const savedSettings = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEYS.SETTINGS) || "{}");
            resolve({
              success: true,
              data: {
                namaSekolah: savedSettings.namaSekolah || SCHOOL_CONFIG.name,
                tahun: savedSettings.tahun || SCHOOL_CONFIG.year,
                tahunPelajaran: savedSettings.tahunPelajaran || SCHOOL_CONFIG.academicYear || "2026/2027",
                statusPendaftaran: savedSettings.statusPendaftaran || SCHOOL_CONFIG.statusPendaftaran,
                kuotaTotal: savedSettings.kuotaTotal || SCHOOL_CONFIG.totalKuota,
                alamatSekolah: savedSettings.alamatSekolah || SCHOOL_CONFIG.address,
                jalur: SCHOOL_CONFIG.jalur
              }
            });
            break;
          }

          case "getAnnouncements":
            resolve({
              success: true,
              data: announcements.filter(a => a.status === "Publik")
            });
            break;

          case "checkStatus": {
            const no = String(params.noPendaftaran || "").trim().toUpperCase();
            const verif = String(params.verifikasi || "").trim().replace(/[-\/]/g, "");
            const found = applicants.find(a => {
              const aNo = String(a.nomorPendaftaran).trim().toUpperCase();
              const aNisn = String(a.nisn || "").trim();
              const aTgl = String(a.tanggalLahir || "").trim().replace(/[-\/]/g, "");
              return aNo === no && (aNisn === verif || aTgl === verif || (a.tanggalLahir && a.tanggalLahir.includes(params.verifikasi)));
            });

            if (found) {
              resolve({
                success: true,
                message: "Data ditemukan",
                data: {
                  nomorPendaftaran: found.nomorPendaftaran,
                  namaLengkap: found.namaLengkap,
                  jalur: found.jalur,
                  asalSekolah: found.namaSd,
                  statusVerifikasi: found.statusVerifikasi,
                  statusSeleksi: found.statusSeleksi,
                  statusKelulusan: found.statusKelulusan,
                  catatanAdmin: found.catatanAdmin || "Tidak ada catatan.",
                  tanggalUpdate: found.tanggalUpdate,
                  tanggalDaftar: found.timestamp
                }
              });
            } else {
              resolve({
                success: false,
                message: "Data pendaftaran tidak ditemukan! Pastikan Nomor Pendaftaran dan NISN atau Tanggal Lahir Anda sudah tepat."
              });
            }
            break;
          }

          case "checkGraduation": {
            const no = String(params.noPendaftaran || "").trim().toUpperCase();
            const found = applicants.find(a => String(a.nomorPendaftaran).trim().toUpperCase() === no);
            if (found) {
              const lulus = found.statusKelulusan || "Dalam Proses";
              let msg = "";
              if (lulus === "Lulus") {
                msg = "Selamat, Anda dinyatakan LULUS sebagai murid baru SMP Negeri 1 Segah Tahun Ajaran 2026/2027. Silakan lengkapi berkas daftar ulang.";
              } else if (lulus === "Tidak Lulus") {
                msg = "Terima kasih telah mengikuti proses seleksi SPMB SMP Negeri 1 Segah.";
              } else {
                msg = "Hasil seleksi Anda saat ini masih dalam proses peninjauan oleh Panitia SPMB.";
              }
              resolve({
                success: true,
                data: {
                  nomorPendaftaran: found.nomorPendaftaran,
                  namaLengkap: found.namaLengkap,
                  jalur: found.jalur,
                  statusKelulusan: lulus,
                  pesan: msg,
                  tanggalUpdate: found.tanggalUpdate
                }
              });
            } else {
              resolve({
                success: false,
                message: `Nomor Pendaftaran ${no} tidak ditemukan.`
              });
            }
            break;
          }

          case "register": {
            const data = params.data || params;
            const nik = String(data.nik || "").replace(/\D/g, "");

            // Cek duplikasi NIK
            if (applicants.some(a => String(a.nik).replace(/\D/g, "") === nik)) {
              resolve({
                success: false,
                message: `NIK ${nik} sudah terdaftar di sistem SPMB! Silakan gunakan menu Cek Status Pendaftaran.`
              });
              return;
            }

            const nextNum = applicants.length + 1;
            const regNo = `SPMB-${SCHOOL_CONFIG.year}-${("0000" + nextNum).slice(-4)}`;
            const now = new Date().toISOString().replace("T", " ").substring(0, 19);

            const newApplicant = {
              id: `PND-${("0000" + nextNum).slice(-4)}`,
              nomorPendaftaran: regNo,
              timestamp: now,
              tahun: SCHOOL_CONFIG.year,
              ...data,
              statusVerifikasi: "Menunggu Verifikasi",
              statusSeleksi: "Dalam Proses",
              statusKelulusan: "Dalam Proses",
              catatanAdmin: "Pendaftaran online berhasil diterima. Menunggu verifikasi berkas oleh panitia.",
              tanggalUpdate: now
            };

            applicants.push(newApplicant);
            localStorage.setItem(LOCAL_STORAGE_KEYS.APPLICANTS, JSON.stringify(applicants));

            resolve({
              success: true,
              message: "Pendaftaran online berhasil disimpan!",
              data: {
                nomorPendaftaran: regNo,
                namaLengkap: data.namaLengkap,
                jalur: data.jalur,
                nisn: data.nisn || "-",
                tanggalPendaftaran: now
              }
            });
            break;
          }

          case "uploadDocument": {
            // Simulasi upload dokumen di client (menghasilkan URL lokal)
            const p = params.data || params;
            resolve({
              success: true,
              message: "Dokumen berhasil diunggah (Simulasi Drive)",
              data: {
                fileId: "FILE-" + Math.random().toString(36).substr(2, 9),
                fileName: p.fileName || "dokumen.pdf",
                fileUrl: p.base64Data || "assets/sample_doc.svg"
              }
            });
            break;
          }

          case "adminLogin": {
            const { username, password } = params;
            if (username === "admin" && (password === "admin123" || password === "admin")) {
              const token = "MOCK_TOKEN_" + Date.now();
              const session = {
                username: "admin",
                nama: "Administrator SPMB SMPN 1 Segah",
                role: "Super Admin",
                token: token
              };
              sessionStorage.setItem(LOCAL_STORAGE_KEYS.ADMIN_SESSION, JSON.stringify(session));
              resolve({
                success: true,
                message: "Login berhasil",
                data: session
              });
            } else {
              resolve({
                success: false,
                message: "Username atau password admin salah! (Default: admin / admin123)"
              });
            }
            break;
          }

          case "adminGetDashboard": {
            let total = applicants.length, menunggu = 0, terverifikasi = 0, perbaikan = 0, lulus = 0, tidakLulus = 0;
            const perJalur = { "Domisili": 0, "Afirmasi": 0, "Prestasi": 0, "Mutasi": 0 };
            const perGender = { "Laki-laki": 0, "Perempuan": 0 };

            applicants.forEach(a => {
              const v = a.statusVerifikasi, k = a.statusKelulusan, j = a.jalur, g = a.jenisKelamin;
              if (v === "Menunggu Verifikasi") menunggu++;
              else if (v === "Terverifikasi") terverifikasi++;
              else if (v === "Perlu Perbaikan") perbaikan++;

              if (k === "Lulus") lulus++;
              else if (k === "Tidak Lulus") tidakLulus++;

              if (perJalur[j] !== undefined) perJalur[j]++;
              else perJalur[j] = 1;

              if (g && g.includes("Laki")) perGender["Laki-laki"]++;
              else if (g && g.includes("Perempuan")) perGender["Perempuan"]++;
            });

            resolve({
              success: true,
              data: {
                totalPendaftar: total,
                menungguVerifikasi: menunggu,
                terverifikasi: terverifikasi,
                perluPerbaikan: perbaikan,
                lulus: lulus,
                tidakLulus: tidakLulus,
                kuotaTotal: SCHOOL_CONFIG.totalKuota,
                sisaKuota: Math.max(0, SCHOOL_CONFIG.totalKuota - lulus),
                chartJalur: perJalur,
                chartGender: perGender,
                chartStatus: {
                  "Menunggu": menunggu,
                  "Terverifikasi": terverifikasi,
                  "Perbaikan": perbaikan,
                  "Lulus": lulus,
                  "Tidak Lulus": tidakLulus
                }
              }
            });
            break;
          }

          case "adminGetApplicants": {
            const filters = params.filters || {};
            let list = [...applicants];

            if (filters.search) {
              const q = filters.search.toLowerCase();
              list = list.filter(a => 
                (a.namaLengkap || "").toLowerCase().includes(q) ||
                (a.nomorPendaftaran || "").toLowerCase().includes(q) ||
                (a.nisn || "").includes(q) ||
                (a.namaSd || "").toLowerCase().includes(q)
              );
            }

            if (filters.jalur && filters.jalur !== "semua") {
              list = list.filter(a => (a.jalur || "").toLowerCase() === filters.jalur.toLowerCase());
            }

            if (filters.statusVerif && filters.statusVerif !== "semua") {
              list = list.filter(a => a.statusVerifikasi === filters.statusVerif);
            }

            if (filters.statusLulus && filters.statusLulus !== "semua") {
              list = list.filter(a => a.statusKelulusan === filters.statusLulus);
            }

            if (filters.gender && filters.gender !== "semua") {
              list = list.filter(a => a.jenisKelamin === filters.gender);
            }

            resolve({
              success: true,
              total: list.length,
              data: list
            });
            break;
          }

          case "adminUpdateStatus": {
            const data = params.data || params;
            const target = applicants.find(a => a.nomorPendaftaran === data.nomorPendaftaran);
            if (target) {
              if (data.statusVerifikasi !== undefined) target.statusVerifikasi = data.statusVerifikasi;
              if (data.statusSeleksi !== undefined) target.statusSeleksi = data.statusSeleksi;
              if (data.statusKelulusan !== undefined) target.statusKelulusan = data.statusKelulusan;
              if (data.catatanAdmin !== undefined) target.catatanAdmin = data.catatanAdmin;
              target.tanggalUpdate = new Date().toISOString().replace("T", " ").substring(0, 19);

              localStorage.setItem(LOCAL_STORAGE_KEYS.APPLICANTS, JSON.stringify(applicants));
              resolve({
                success: true,
                message: `Status pendaftar ${data.nomorPendaftaran} berhasil diubah.`
              });
            } else {
              resolve({ success: false, message: "Pendaftar tidak ditemukan." });
            }
            break;
          }

          case "adminRunSelection": {
            let lulusCount = 0;
            let tidakLulusCount = 0;
            applicants.forEach(a => {
              if (a.statusVerifikasi === "Terverifikasi") {
                a.statusKelulusan = "Lulus";
                a.statusSeleksi = "Memenuhi Syarat";
                a.catatanAdmin = "Dinyatakan LULUS seleksi penerimaan murid baru.";
                lulusCount++;
              } else {
                a.statusKelulusan = "Tidak Lulus";
                a.statusSeleksi = "Belum Memenuhi Syarat";
                tidakLulusCount++;
              }
              a.tanggalUpdate = new Date().toISOString().replace("T", " ").substring(0, 19);
            });
            localStorage.setItem(LOCAL_STORAGE_KEYS.APPLICANTS, JSON.stringify(applicants));
            resolve({
              success: true,
              message: `Seleksi selesai! ${lulusCount} siswa Lulus, ${tidakLulusCount} Tidak Lulus.`,
              data: { lulus: lulusCount, tidakLulus: tidakLulusCount }
            });
            break;
          }

          case "adminSaveAnnouncement": {
            const aData = params.data || params;
            if (aData.id) {
              const idx = announcements.findIndex(x => x.id === aData.id);
              if (idx !== -1) announcements[idx] = { ...announcements[idx], ...aData };
            } else {
              announcements.unshift({
                id: "PGM-" + Date.now().toString().slice(-4),
                judul: aData.judul,
                isi: aData.isi,
                tanggal: aData.tanggal || new Date().toISOString().substring(0, 10),
                status: aData.status || "Publik",
                link: aData.link || ""
              });
            }
            localStorage.setItem(LOCAL_STORAGE_KEYS.ANNOUNCEMENTS, JSON.stringify(announcements));
            resolve({ success: true, message: "Pengumuman berhasil disimpan!" });
            break;
          }

          case "adminDeleteAnnouncement": {
            const filtered = announcements.filter(x => x.id !== params.id);
            localStorage.setItem(LOCAL_STORAGE_KEYS.ANNOUNCEMENTS, JSON.stringify(filtered));
            resolve({ success: true, message: "Pengumuman berhasil dihapus." });
            break;
          }

          case "adminImportApplicants": {
            const csv = params.csv || "";
            const lines = csv.trim().split(/\r\n|\n/);
            let added = 0;
            for (let i = 1; i < lines.length; i++) {
              const line = lines[i].trim();
              if (!line) continue;
              const cols = line.split(",").map(c => c.trim().replace(/^"|"$/g, ""));
              if (cols[1] && cols[2]) {
                const nextNum = applicants.length + 1;
                const regNo = `SPMB-${SCHOOL_CONFIG.year}-${("0000" + nextNum).slice(-4)}`;
                applicants.push({
                  id: `PND-${("0000" + nextNum).slice(-4)}`,
                  nomorPendaftaran: regNo,
                  timestamp: new Date().toISOString().replace("T", " ").substring(0, 19),
                  tahun: SCHOOL_CONFIG.year,
                  nisn: cols[0] || "",
                  nik: cols[1],
                  namaLengkap: cols[2],
                  jenisKelamin: cols[3] || "Laki-laki",
                  jalur: cols[4] || "Domisili",
                  tempatLahir: cols[5] || "Segah",
                  tanggalLahir: cols[6] || "2013-01-01",
                  nomorKk: cols[7] || "",
                  alamat: cols[8] || "Segah",
                  nomorHp: cols[9] || "",
                  namaSd: cols[10] || "SD Negeri",
                  statusVerifikasi: "Menunggu Verifikasi",
                  statusSeleksi: "Dalam Proses",
                  statusKelulusan: "Dalam Proses",
                  catatanAdmin: "Hasil import data CSV.",
                  tanggalUpdate: new Date().toISOString().replace("T", " ").substring(0, 19)
                });
                added++;
              }
            }
            localStorage.setItem(LOCAL_STORAGE_KEYS.APPLICANTS, JSON.stringify(applicants));
            resolve({
              success: true,
              message: `Berhasil mengimpor ${added} calon murid baru.`
            });
            break;
          }

          case "adminUpdateConfig": {
            const data = params.data || params;
            const currentSettings = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEYS.SETTINGS) || "{}");
            const newSettings = { ...currentSettings, ...data };
            localStorage.setItem(LOCAL_STORAGE_KEYS.SETTINGS, JSON.stringify(newSettings));

            if (newSettings.tahunPelajaran) SCHOOL_CONFIG.academicYear = newSettings.tahunPelajaran;
            if (newSettings.tahun) SCHOOL_CONFIG.year = newSettings.tahun;
            if (newSettings.namaSekolah) SCHOOL_CONFIG.name = newSettings.namaSekolah;
            if (newSettings.kuotaTotal) SCHOOL_CONFIG.totalKuota = parseInt(newSettings.kuotaTotal, 10) || SCHOOL_CONFIG.totalKuota;
            if (newSettings.statusPendaftaran) SCHOOL_CONFIG.statusPendaftaran = newSettings.statusPendaftaran;
            if (newSettings.alamatSekolah) SCHOOL_CONFIG.address = newSettings.alamatSekolah;

            resolve({
              success: true,
              message: "Pengaturan pelaksanaan SPMB berhasil disimpan!",
              data: newSettings
            });
            break;
          }

          default:
            resolve({ success: false, message: `Mock Action '${action}' belum diimplementasi.` });
        }
      }, 150); // slight debounce for realism
    });
  }

  return {
    get: (action, params) => requestApi(action, params, "GET"),
    post: (action, payload) => requestApi(action, payload, "POST"),
    isDemo: () => isDemo
  };
})();
