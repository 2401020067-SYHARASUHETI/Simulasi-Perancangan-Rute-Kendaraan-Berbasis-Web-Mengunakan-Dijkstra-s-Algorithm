# 🏙️ Simulasi Pencarian Rute Kendaraan Berbasis Web Menggunakan Dijkstra's Algorithm

<div align="center">

![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)

**Projek Akhir Mata Kuliah | Teknik Informatika**  
Universitas Maritim Raja Ali Haji (UMRAH)  
Fakultas Teknik dan Teknologi Kemaritiman

</div>

---

## 👥 Anggota Tim

| Nama | NIM | Tugas |
|---|---|---|
| Syhara Suheti | 2401020067 | Implementasi algoritma Dijkstra & logika pencarian rute |
| Rydhoi Trimaniel Lase | 2401020061 | Desain antarmuka (UI/UX) & responsivitas tampilan |
| Septi Dwi Anata | 2401020074 | Animasi pergerakan kendaraan |
| Gelia Rahma Nur Minda | 2401020092 | Fitur interaksi pengguna (pilih titik, kontrol simulasi) |
| Nurpaisyah | 2401020063 | Integrasi sistem keseluruhan |

---

## 📋 Deskripsi Projek

**Smart City KOTMOR** adalah aplikasi simulasi pencarian rute kendaraan berbasis web yang mengimplementasikan **Dijkstra's Algorithm** untuk menentukan jalur terpendek dari satu lokasi ke lokasi lain dalam peta kota virtual. Sistem ini menampilkan animasi pergerakan kendaraan secara real-time mengikuti rute hasil kalkulasi algoritma, dilengkapi visualisasi peta kota 2D dengan grafis futuristik bertema *smart city*.

Projek ini dikembangkan sebagai media pembelajaran interaktif yang memvisualisasikan cara kerja algoritma graf — khususnya konsep *shortest path* — dalam konteks nyata seperti navigasi transportasi kota.

---

## 🎯 Tujuan

1. Mengimplementasikan Dijkstra's Algorithm ke dalam sistem berbasis web untuk menyelesaikan permasalahan pencarian rute secara efektif.
2. Menentukan rute terpendek dari titik awal ke titik tujuan berdasarkan perhitungan jarak antar node dalam suatu graf.
3. Menampilkan simulasi pergerakan kendaraan yang mengikuti jalur hasil perhitungan algoritma secara visual.
4. Memahami konsep dasar graf (node sebagai titik, edge sebagai penghubung) dalam sistem pencarian rute.
5. Mengembangkan keterampilan pemrograman berbasis web menggunakan HTML, CSS, dan JavaScript.
6. Mengintegrasikan logika algoritma dengan tampilan sistem sehingga menghasilkan aplikasi yang interaktif.

---

## 🚀 Demo & Cara Menjalankan

### Prasyarat
Tidak diperlukan instalasi atau server backend. Cukup browser modern yang mendukung HTML5 Canvas.

### Langkah Menjalankan
```bash
# Clone atau download repositori ini
git clone https://github.com/<username>/Simulasi-Perancangan-Rute-Kendaraan-Berbasis-Web-Mengunakan-Dijkstra-s-Algorithm.git

# Buka file langsung di browser
# Cukup double-click file index.html
# atau buka via live server (VS Code Extension: Live Server)
```

> ✅ **Tidak memerlukan Node.js, Python, atau backend apapun.** Seluruh logika berjalan di sisi klien (browser).

---

## 🗂️ Struktur Direktori

```
📁 project/
├── index.html      # Halaman utama & struktur UI
├── style.css       # Styling antarmuka (tema neon/futuristik)
├── app.js          # Logika utama: graph, Dijkstra, rendering, animasi
└── README.md       # Dokumentasi projek
```

---

## 🛠️ Teknologi yang Digunakan

| Teknologi | Fungsi |
|---|---|
| **HTML5** | Struktur halaman web & elemen Canvas |
| **CSS3** | Desain antarmuka, tema neon, layout responsif |
| **JavaScript (ES6+)** | Logika algoritma Dijkstra, rendering Canvas, animasi kendaraan, interaksi pengguna |
| **HTML5 Canvas API** | Rendering peta 2D, gedung, jalan, kendaraan, minimap |

---
## 🧮 Algoritma dan Komponen Sistem yang Diimplementasikan

| Algoritma / Komponen | Fungsi | Kontributor |
|----------------------|---------|-------------|
| 🔍 Dijkstra's Algorithm | Menentukan jalur terpendek antar node pada graf berbobot | Syhara Suheti |
| 🗺️ Graph Builder | Membangun struktur graf (nodes, edges, adjacency list) | Syhara Suheti |
| 📍 Closest Node Search | Menentukan node terdekat dari posisi klik pengguna | Syhara Suheti |
| 🚦 Route Generator | Menetapkan dan menghitung rute kendaraan | Syhara Suheti |
| 🎨 User Interface System | Panel navigasi, tombol lokasi, statistik simulasi | Rydhoi Trimaniel Lase |
| 🚗 NPC Vehicle System | Inisialisasi kendaraan NPC dan rute otomatis | Septi Dwi Anata |
| 🎞️ Vehicle Animation Engine | Animasi kendaraan mengikuti jalur hasil Dijkstra | Septi Dwi Anata |
| 🎮 Camera & Interaction System | Zoom, pan, follow camera, pause/resume simulasi | Gelia Rahma Nur Minda |
| 🎲 Random Route Feature | Pengacakan titik awal dan tujuan simulasi | Gelia Rahma Nur Minda |
| 🏙️ Canvas Rendering Engine | Rendering jalan, bangunan, landmark, dan objek kota | Nurpaisyah |
| 🌳 Smart City Object Generator | Pembuatan objek kota virtual | Nurpaisyah |
| 🔄 Main Render Loop | Sinkronisasi dan pembaruan tampilan sistem | Nurpaisyah |

---

## 📂 Struktur Pembagian File

| File | Anggota | Isi |
|------|----------|-----|
| `dijkstra.js` | Syhara Suheti | Struktur graf (*nodes, edges, addNode(), addEdge(), buildGraph()*), implementasi algoritma Dijkstra, helper *closestNode()* dan *setRoute()* |
| `ui.js` | Rydhoi Trimaniel Lase | Array LOCS, *buildLocBtns()*, *buildNPCPanel()*, *updateUI()* dan seluruh komponen antarmuka pengguna |
| `animation.js` | Septi Dwi Anata | *playerCar*, *npcCars*, *initNPCs()*, *moveCarAlongPath()*, *updateAnimation()* dan sistem animasi kendaraan |
| `interaction.js` | Gelia Rahma Nur Minda | Variabel kamera (*cam*, *WORLD*), event mouse/touch, zoom, follow camera, pause/resume, dan fitur acak posisi |
| `render.js` | Nurpaisyah | *Canvas setup*, *buildCityObjects()*, seluruh fungsi *draw()*, *renderLoop()*, dan inisialisasi sistem |
---

## 🔗 Dependensi Antar File

```html
<script src="dijkstra.js"></script>
<script src="ui.js"></script>
<script src="animation.js"></script>
<script src="interaction.js"></script>
<script src="render.js"></script>
```

### 📌 Keterangan
- `dijkstra.js` harus dimuat terlebih dahulu karena berisi struktur graf dan algoritma utama.
- `ui.js` menggunakan data lokasi dan rute dari `dijkstra.js`.
- `animation.js` membutuhkan data rute untuk menggerakkan kendaraan.
- `interaction.js` menghubungkan input pengguna dengan sistem navigasi.
- `render.js` harus dipanggil terakhir karena bergantung pada seluruh modul sebelumnya.
## ⚙️ Fitur Sistem

### 🗺️ Peta Kota Virtual (Smart City KOTMOR)
- Dunia berukuran **2800 × 2800** unit dengan grid jalan 11×11
- **Bundaran tengah** (roundabout) dengan animasi air mancur
- Gedung, taman, area parkir, dan zebra cross yang dirender secara prosedural
- **20 landmark** dengan ikon dan label: Rumah Sakit, Kantor Polisi, Sekolah, Masjid, Pasar, Mall, Bandara, Universitas, dan lainnya

### 🔍 Dijkstra's Algorithm Engine
- Implementasi **Single Source Shortest Path (SSSP)** pada graf berbobot
- Kompleksitas: **O((V + E) log V)**
- Bobot edge dihitung berdasarkan jarak Euclidean antar node
- Visualisasi jalur yang ditemukan dengan animasi glow cyan
- Panel statistik: jumlah node yang dikunjungi, panjang jalur, total jarak

### 🚗 Simulasi Kendaraan
- **Player car** (hijau) bergerak mulus mengikuti jalur terpendek hasil Dijkstra
- **8 NPC cars** bergerak secara independen dengan rute acak menggunakan Dijkstra
- Trail/jejak kendaraan player ditampilkan secara visual
- Animasi *pulse* di sekitar kendaraan saat sedang berjalan

### 🎮 Kontrol Interaktif
- **Klik 1× pada lokasi** → set sebagai titik START
- **Klik 2× pada lokasi** → set sebagai titik TUJUAN
- **Klik pada kanvas** → set rute ke node terdekat dari kursor
- **Drag** → geser (pan) peta
- **Scroll / Zoom button** → zoom in/out (range 0.2× – 5×)
- **Follow Car** → kamera mengikuti player secara otomatis
- **Acak Posisi** → randomisasi start & tujuan
- **Pause/Resume** → hentikan & lanjutkan simulasi

### 🗾 Minimap
- Minimap 155×155 px di sudut kanan bawah
- Menampilkan: jalur aktif (cyan), posisi semua kendaraan, lokasi landmark
- Viewport indicator menunjukkan area peta yang sedang dilihat

---
### 🎲 Fitur Randomisasi Simulasi
- 🎯 **Acak Posisi Start & Tujuan** → Menentukan titik awal dan tujuan secara otomatis untuk menghasilkan rute baru setiap simulasi.
- 🚗 **Random NPC Spawn** → Posisi kendaraan NPC berubah setiap kali aplikasi dijalankan.
- 🔄 **Random Route Generator** → Menghasilkan jalur pencarian baru tanpa perlu memilih lokasi secara manual.
- 🌟 **Challenge Mode** → Pengguna dapat mencoba menebak jalur terpendek sebelum algoritma Dijkstra menghitung hasilnya.
- 🗺️ **Dynamic Simulation** → Setiap percobaan menghasilkan pengalaman navigasi yang berbeda sehingga lebih menarik untuk pembelajaran algoritma graf.

## 🧮 Cara Kerja Algoritma Dijkstra

### Struktur Graf
```
Node  : titik persimpangan/lokasi (± 121 node pada grid 11×11 + 24 node bundaran)
Edge  : jalur jalan yang menghubungkan node
Bobot : jarak Euclidean antar node (Math.hypot)
```

### Pseudocode Implementasi
```javascript
function dijkstra(src, dst) {
  // Inisialisasi jarak semua node = Infinity, kecuali src = 0
  // Gunakan priority queue (array yang di-sort berdasarkan jarak)
  // Iterasi: ambil node dengan jarak terkecil, update tetangga
  // Lacak prev[] untuk rekonstruksi jalur
  // Return: { path, cost, visited }
}
```

### Contoh Perhitungan (dari Proposal)

| Node | Jarak Awal | Setelah A | Setelah C | Setelah B | Final |
|------|-----------|-----------|-----------|-----------|-------|
| A    | 0         | 0         | 0         | 0         | **0** |
| B    | ∞         | 5         | 5         | 5         | **5** |
| C    | ∞         | 3         | 3         | 3         | **3** |
| D    | ∞         | ∞         | ∞         | 9         | **9** |
| E    | ∞         | ∞         | 9         | 9         | **9** |

**Jalur terpendek A → E:**
- Jalur 1: `A → C → E` = 3 + 6 = **9** ✅ (dipilih)
- Jalur 2: `A → B → D → E` = 5 + 4 + 1 = **10** ❌

---

## 🗺️ Daftar Lokasi Landmark

| Ikon | Nama | Ikon | Nama |
|------|------|------|------|
| 🏥 | Rumah Sakit | ✈️ | Bandara |
| 🚔 | Kantor Polisi | 🏨 | Hotel |
| 🏫 | Sekolah | ⚕️ | RS Bethesda |
| 🕌 | Masjid | 🏟️ | Lap. Olahraga |
| 🏪 | Pasar | 🏛️ | Museum |
| 🌳 | Taman Kota | 🚒 | Pemadam Kebakaran |
| 🚉 | Stasiun KA | 📮 | Kantor Pos |
| 🎓 | Universitas | 📚 | Perpustakaan |
| 🛍️ | Mall/Plaza | ⛽ | SPBU |
| 🏦 | Bank | 🏥 | Puskesmas |

---

## 📸 Tampilan Sistem

```
┌─────────────────────────────────────────────────────────────┐
│  🏙️ SMART CITY KOTMOR — DIJKSTRA          Speed | Cost | .. │ ← Top Bar
├──────────────┬──────────────────────────────────────────────┤
│ NAVIGATION   │                                              │
│ ROUTE        │                                              │
│ ─────────    │         CANVAS PETA 2D                       │
│ PILIH LOKASI │         (Jalan, Gedung, Kendaraan)           │
│ [🏥][🚔]..  │                                              │
│ ─────────    │                                   ┌────────┐ │
│ DIJKSTRA     │                                   │MINIMAP │ │
│ ENGINE       │                                   └────────┘ │
└──────────────┴──────────────────────────────────────────────┘
│ Status bar: Rute aktif | NPC: 8 | Petunjuk kontrol          │
└─────────────────────────────────────────────────────────────┘
```

---

## 📌 Batasan Sistem

1. Sistem hanya menggunakan algoritma **Dijkstra** (bukan A* atau Bellman-Ford).
2. Data berupa **simulasi graf prosedural**, bukan data real-time atau peta sungguhan.
3. Sistem berbasis web sederhana **tanpa integrasi API peta** (Google Maps, OpenStreetMap, dll.).
4. **Tidak mempertimbangkan** faktor kemacetan atau kondisi lalu lintas nyata.
5. Bobot edge menggunakan **jarak geometris** (Euclidean), bukan jarak atau waktu tempuh nyata.

---

## 📅 Informasi Projek

| Item | Detail |
|---|---|
| Mata Kuliah | Perancangan Analisis Algoritma  |
| Institusi | Universitas Maritim Raja Ali Haji (UMRAH) |
| Prodi | Teknik Informatika |
| Semester | Genap 2025/2026 |
| Tanggal Proposal | 1 April 2026 |
| Lokasi Pengerjaan | Ice Cream Wedrink Batu 10, Tanjungpinang & Online |
| Dosen Pembimbing | Tekad Matulatan, S.Sos, S.Kom, M.Inf.Tech |
| | Muhamad Fadli, S.Kom, M.Kom |

---

## 📚 Referensi

- Dijkstra, E. W. (1959). *A note on two problems in connexion with graphs*. Numerische Mathematik, 1(1), 269–271.
- Cormen, T. H., et al. (2009). *Introduction to Algorithms* (3rd ed.). MIT Press.
- MDN Web Docs — [Canvas API](https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API)
- GeeksforGeeks — [Dijkstra's Shortest Path Algorithm](https://www.geeksforgeeks.org/dijkstras-shortest-path-algorithm-greedy-algo-7/)

---

<div align="center">
  <sub>&copy; UMRAH 2026</sub>
</div>
