// Deteksi himpunanId otomatis dari nama file HTML (universal untuk semua jurusan)
// Contoh: SistemInformasi.html → 'sistem-informasi', Vokasi.html → 'vokasi'
let himpunanId = window.location.pathname.split('/').pop().replace('.html', '').toLowerCase().replace(/\s+/g, '-'); // Hilangkan spasi, lowercase
if (!himpunanId || himpunanId === 'index') himpunanId = 'default'; // Fallback jika kosong

// Mapping nama jurusan readable untuk alert (sesuaikan jika nama file beda)
const jurusanNames = {
    'sistem-informasi': 'Sistem Informasi',
    'teknologi-informasi': 'Teknologi Informasi',
    'pariwisata': 'Pariwisata',
    'manajemen': 'Manajemen',
    'akuntansi': 'Akuntansi',
    'bio-kewirausahaan': 'BioKewirausahaan',
    'vokasi': 'Vokasi'
};
const jurusanName = jurusanNames[himpunanId] || himpunanId.charAt(0).toUpperCase() + himpunanId.slice(1).replace('-', ' ');

console.log("🔄 Himpunan saat ini (dari file):", himpunanId, "-", jurusanName);

// Fungsi untuk update suara (cocok dengan onclick di HTML)
// ...existing code...
// Dapatkan daftar paslon yang ada di DOM secara dinamis (mis. ["paslon1","paslon2"])
function getPaslonIds() {
    const sahElems = Array.from(document.querySelectorAll('[id$="-sah"]'));
    const paslonSet = new Set();
    sahElems.forEach(el => {
        const m = el.id.match(/^(paslon\d+)-sah$/);
        if (m) paslonSet.add(m[1]);
    });
    return Array.from(paslonSet).sort((a,b) => {
        // Urut berdasarkan angka paslon
        const na = parseInt(a.replace('paslon','')) || 0;
        const nb = parseInt(b.replace('paslon','')) || 0;
        return na - nb;
    });
}

// Fungsi untuk update suara (cocok dengan onclick di HTML)
function updateCount(id, change) {
    const counter = document.getElementById(id);
    if (!counter) return; // Aman jika elemen tidak ada

    let current = parseInt(counter.textContent) || 0;
    current = Math.max(0, current + change); // Tidak boleh negatif
    counter.textContent = current;

    // Update total per paslon (jika id mengandung 'sah' atau 'tidak-sah')
    const paslon = id.split("-")[0]; // e.g., 'paslon1'
    if (paslon && document.getElementById(`${paslon}-sah`)) {
        updateTotal(paslon);
    }
    updateRekap();
}

// Hitung total untuk setiap paslon (sah + tidak sah)
function updateTotal(paslon) {
    const sahElem = document.getElementById(`${paslon}-sah`);
    const tidakSahElem = document.getElementById(`${paslon}-tidak-sah`);
    const totalElem = document.getElementById(`${paslon}-total`);
    const sah = sahElem ? (parseInt(sahElem.textContent) || 0) : 0;
    const tidakSah = tidakSahElem ? (parseInt(tidakSahElem.textContent) || 0) : 0;
    const total = sah + tidakSah;
    if (totalElem) totalElem.textContent = total;
}

// Hitung total keseluruhan (sum semua paslon)
function updateRekap() {
    let totalSah = 0;
    let totalTidakSah = 0;
    const paslonIds = getPaslonIds();

    paslonIds.forEach(paslon => {
        const sahElem = document.getElementById(`${paslon}-sah`);
        const tidakSahElem = document.getElementById(`${paslon}-tidak-sah`);
        totalSah += sahElem ? (parseInt(sahElem.textContent) || 0) : 0;
        totalTidakSah += tidakSahElem ? (parseInt(tidakSahElem.textContent) || 0) : 0;
    });

    const totalSahElem = document.getElementById("total-sah");
    const totalTidakSahElem = document.getElementById("total-tidak-sah");
    const keseluruhanElem = document.getElementById("total-keseluruhan");

    if (totalSahElem) totalSahElem.textContent = totalSah;
    if (totalTidakSahElem) totalTidakSahElem.textContent = totalTidakSah;
    if (keseluruhanElem) keseluruhanElem.textContent = totalSah + totalTidakSah;
}

// Fungsi helper: Reset semua counter ke 0 (untuk bersihkan tampilan saat load)
function resetCountersToZero() {
    console.log("🧹 Reset counter ke 0 untuk", jurusanName);
    const paslonIds = getPaslonIds();
    if (paslonIds.length === 0) {
        // fallback ke 3 jika tidak terdeteksi (keamanan)
        ['paslon1','paslon2','paslon3'].forEach(p => {
            const sah = document.getElementById(`${p}-sah`);
            const tidak = document.getElementById(`${p}-tidak-sah`);
            const total = document.getElementById(`${p}-total`);
            if (sah) sah.textContent = '0';
            if (tidak) tidak.textContent = '0';
            if (total) total.textContent = '0';
        });
    } else {
        paslonIds.forEach(paslon => {
            const sah = document.getElementById(`${paslon}-sah`);
            const tidak = document.getElementById(`${paslon}-tidak-sah`);
            const total = document.getElementById(`${paslon}-total`);
            if (sah) sah.textContent = '0';
            if (tidak) tidak.textContent = '0';
            if (total) total.textContent = '0';
        });
    }

    const totalSahElem = document.getElementById("total-sah");
    const totalTidakSahElem = document.getElementById("total-tidak-sah");
    const keseluruhanElem = document.getElementById("total-keseluruhan");
    if (totalSahElem) totalSahElem.textContent = '0';
    if (totalTidakSahElem) totalTidakSahElem.textContent = '0';
    if (keseluruhanElem) keseluruhanElem.textContent = '0';
    updateRekap(); // Pastikan konsisten
}

// Load data dari localStorage (dipanggil saat DOM ready)
function loadData() {
    console.log("📂 Memuat data untuk", jurusanName, "(ID:", himpunanId, ")");

    // SELALU reset ke 0 dulu (hindari carry-over dari sesi sebelumnya atau cache)
    resetCountersToZero();

    const savedData = localStorage.getItem(`suara-data-${himpunanId}`);
    if (savedData) {
        try {
            const data = JSON.parse(savedData);
            console.log(`📊 Data DIMUAT untuk ${jurusanName}:`, data);

            const paslonIds = getPaslonIds();
            // Load per paslon (hanya yang ada di DOM)
            paslonIds.forEach(paslon => {
                if (data[paslon]) {
                    const sahElem = document.getElementById(`${paslon}-sah`);
                    const tidakElem = document.getElementById(`${paslon}-tidak-sah`);
                    const totalElem = document.getElementById(`${paslon}-total`);
                    if (sahElem) sahElem.textContent = data[paslon].sah || '0';
                    if (tidakElem) tidakElem.textContent = data[paslon].tidakSah || '0';
                    if (totalElem) totalElem.textContent = data[paslon].total || '0';
                }
            });

            // Load rekap jika ada
            if (data.totalKeseluruhan) {
                const totalSahElem = document.getElementById("total-sah");
                const totalTidakSahElem = document.getElementById("total-tidak-sah");
                const keseluruhanElem = document.getElementById("total-keseluruhan");
                if (totalSahElem) totalSahElem.textContent = data.totalKeseluruhan.sah || '0';
                if (totalTidakSahElem) totalTidakSahElem.textContent = data.totalKeseluruhan.tidakSah || '0';
                if (keseluruhanElem) keseluruhanElem.textContent = data.totalKeseluruhan.keseluruhan || '0';
            }

            updateRekap(); // Konsistensi
            console.log(`✅ Load selesai. Total: ${document.getElementById("total-keseluruhan")?.textContent || 0}`);
        } catch (error) {
            console.error("❌ Error parsing data:", error);
            // Tetap di 0
        }
    } else {
        console.log(`📊 Tidak ada data untuk ${jurusanName}. Tetap di 0.`);
    }
}

// Save data ke localStorage
function saveData() {
    console.log("💾 Menyimpan data untuk", jurusanName);

    const data = {};
    const paslonIds = getPaslonIds();
    if (paslonIds.length === 0) {
        // fallback: coba paslon1..3
        ['paslon1','paslon2','paslon3'].forEach(paslon => {
            const sah = document.getElementById(`${paslon}-sah`);
            const tidak = document.getElementById(`${paslon}-tidak-sah`);
            const total = document.getElementById(`${paslon}-total`);
            data[paslon] = {
                sah: sah ? sah.textContent : '0',
                tidakSah: tidak ? tidak.textContent : '0',
                total: total ? total.textContent : '0'
            };
        });
    } else {
        paslonIds.forEach(paslon => {
            const sah = document.getElementById(`${paslon}-sah`);
            const tidak = document.getElementById(`${paslon}-tidak-sah`);
            const total = document.getElementById(`${paslon}-total`);
            data[paslon] = {
                sah: sah ? sah.textContent : '0',
                tidakSah: tidak ? tidak.textContent : '0',
                total: total ? total.textContent : '0'
            };
        });
    }

    data.totalKeseluruhan = {
        sah: document.getElementById("total-sah") ? document.getElementById("total-sah").textContent : '0',
        tidakSah: document.getElementById("total-tidak-sah") ? document.getElementById("total-tidak-sah").textContent : '0',
        keseluruhan: document.getElementById("total-keseluruhan") ? document.getElementById("total-keseluruhan").textContent : '0'
    };

    localStorage.setItem(`suara-data-${himpunanId}`, JSON.stringify(data));
    const total = data.totalKeseluruhan.keseluruhan;
    console.log(`📊 Data DISIMPAN untuk ${jurusanName}: Total ${total}`);
    alert(`Data suara untuk ${jurusanName} berhasil disimpan! (Total: ${total})`);
}
// ...existing code...

// Event Listeners
document.addEventListener("DOMContentLoaded", () => {
    console.log("🚀 DOM loaded. Memulai loadData untuk", jurusanName);
    loadData();

    // Event untuk tombol save
    const saveBtn = document.getElementById("saveBtn");
    if (saveBtn) {
        saveBtn.addEventListener("click", saveData);
    } else {
        console.warn("⚠️ Tombol #saveBtn tidak ditemukan.");
    }
});

document.querySelectorAll(".jurusan-btn").forEach(btn => {
  btn.addEventListener("click", e => {
    e.preventDefault(); // cegah langsung redirect
    const targetUrl = btn.getAttribute("href");

    animateLogoFullscreen(() => {
      window.location.href = targetUrl; // pindah setelah animasi selesai
    });
  });
});

function animateLogoFullscreen(callback) {
  const logoSrc = document.getElementById("logo-img").src;

  const overlay = document.createElement("img");
  overlay.src = logoSrc;
  overlay.classList.add("logo-overlay");
  document.body.appendChild(overlay);

  // Step 1: Grow + rotate
  setTimeout(() => {
    overlay.classList.add("grow");
  }, 50);

  // Step 2: Shrink kembali
  setTimeout(() => {
    overlay.classList.remove("grow");
    overlay.classList.add("shrink");
  }, 1200);

  // Step 3: Hapus overlay & redirect
  setTimeout(() => {
    overlay.remove();
    if (callback) callback();
  }, 2200);
}

