# 🚗 Simulasi Pencarian Rute Kendaraan Berbasis Web Menggunakan Dijkstra's Algorithm

<div align="center">

![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)

**Projek Akhir Mata Kuliah | Teknik Informatika**  
Universitas Maritim Raja Ali Haji (UMRAH)  
Fakultas Teknik dan Teknologi Kemaritiman

</div>

---

## 📋 Deskripsi Projek

Sistem ini merupakan **simulasi pencarian rute kendaraan berbasis web** yang mengimplementasikan **Dijkstra's Algorithm** untuk menentukan jalur terpendek antar titik lokasi. Sistem menampilkan graf interaktif di mana pengguna dapat memilih titik awal dan tujuan, kemudian menyaksikan animasi kendaraan bergerak mengikuti rute terpendek yang telah dihitung.

Projek ini dikembangkan sebagai penerapan praktis dari konsep **graph theory** dalam ilmu komputer — di mana node merepresentasikan titik lokasi (persimpangan/destinasi) dan edge merepresentasikan jalur penghubung dengan bobot berupa jarak.

---

## 👥 Anggota Kelompok

| Nama | NIM | Tugas |
|------|-----|-------|
| Syhara Suheti | 2401020067 | Implementasi Algoritma Dijkstra & logika pencarian rute |
| Rydhoi Trimaniel Lase | 2401020061 | Perancangan UI/UX antarmuka sistem |
| Septi Dwi Anata | 2401020074 | Pembuatan animasi pergerakan kendaraan |
| Gelia Rahma Nur Minda | 2401020092 | Pengembangan fitur interaksi pengguna |
| Nurpaisyah | 2401020063 | Integrasi seluruh komponen sistem |

---

## 🎯 Tujuan Projek

1. Mengimplementasikan **Dijkstra's Algorithm** ke dalam sistem berbasis web untuk menyelesaikan permasalahan pencarian rute secara efektif.
2. Menentukan **rute terpendek** dari titik awal ke titik tujuan berdasarkan perhitungan jarak antar node dalam suatu graf.
3. Menampilkan **simulasi pergerakan kendaraan** yang mengikuti jalur hasil perhitungan algoritma secara visual.
4. Memahami konsep dasar graf — node sebagai titik dan edge sebagai penghubung — serta penerapannya dalam sistem pencarian rute.
5. Mengembangkan keterampilan dalam **pemrograman berbasis web** menggunakan HTML, CSS, dan JavaScript.
6. Mengintegrasikan logika algoritma dengan tampilan sistem sehingga menghasilkan aplikasi yang interaktif dan mudah dipahami.

---

## ✨ Fitur Sistem

| Fitur | Deskripsi |
|-------|-----------|
| 🗺️ **Tampilan Peta Berbasis Graf** | Peta sederhana berupa graf dengan node (titik lokasi) dan edge (jalur penghubung) berbobot |
| 🔍 **Pencarian Jalur Terpendek Otomatis** | Kalkulasi otomatis rute terpendek menggunakan Dijkstra berdasarkan bobot jarak |
| 🚘 **Animasi Pergerakan Kendaraan** | Visualisasi kendaraan bergerak mengikuti jalur terpendek yang telah ditemukan |
| 🔎 **Fitur Zoom Peta** | Perbesar/perkecil tampilan peta untuk melihat detail jalur secara lebih jelas |
| 🖱️ **Interaksi Pengguna** | Pilih titik awal & tujuan, lihat hasil jalur, ulang simulasi, dan interaksi real-time |

---

## 🗂️ Struktur Folder

```
Simulasi-Pencarian-Rute-Kendaraan/
│
├── index.html          # Halaman utama aplikasi
├── style.css           # Styling dan desain antarmuka
├── script.js           # Logika utama & implementasi Dijkstra
│
├── assets/
│   ├── icons/          # Ikon kendaraan dan marker lokasi
│   └── images/         # Gambar pendukung antarmuka
│
└── README.md           # Dokumentasi projek
```

---

## 🧠 Cara Kerja Sistem

Sistem bekerja berdasarkan alur proses yang terstruktur:

```
┌─────────────────────┐
│ 1. Pilih Titik Awal │
│    dan Tujuan       │
└────────┬────────────┘
         ▼
┌─────────────────────┐
│ 2. Proses Algoritma │
│    Dijkstra         │
└────────┬────────────┘
         ▼
┌─────────────────────┐
│ 3. Tampilkan Jalur  │
│    Terpendek        │
└────────┬────────────┘
         ▼
┌─────────────────────┐
│ 4. Animasi          │
│    Kendaraan        │
└─────────────────────┘
```

---

## 🔢 Penjelasan Algoritma Dijkstra

### Struktur Graf Contoh

```
    A ──5── B
    │       │ \
    3       2   4
    │       │    \
    C ──6── E    D ──1── E
```

**Node:** A, B, C, D, E  
**Bobot (Jarak):**

| Edge | Jarak |
|------|-------|
| A → B | 5 |
| A → C | 3 |
| B → C | 2 |
| B → D | 4 |
| C → E | 6 |
| D → E | 1 |

---

### Langkah Perhitungan (dari A ke E)

**Langkah 1 — Inisialisasi**

| Node | Jarak |
|------|-------|
| A | 0 |
| B | ∞ |
| C | ∞ |
| D | ∞ |
| E | ∞ |

> Node A adalah titik awal → jarak = 0. Semua node lain belum diketahui → ∞

---

**Langkah 2 — Dari Node A**

- A → B = 0 + 5 = **5**
- A → C = 0 + 3 = **3**

| Node | Jarak |
|------|-------|
| A | 0 |
| B | 5 |
| C | 3 ← dipilih (terkecil) |
| D | ∞ |
| E | ∞ |

---

**Langkah 3 — Dari Node C**

- C → E = 3 + 6 = **9**

| Node | Jarak |
|------|-------|
| A | 0 |
| B | 5 ← dipilih berikutnya |
| C | 3 |
| D | ∞ |
| E | 9 |

---

**Langkah 4 — Dari Node B**

- B → D = 5 + 4 = **9**
- B → C = 5 + 2 = 7 → diabaikan (C sudah = 3)

| Node | Jarak |
|------|-------|
| A | 0 |
| B | 5 |
| C | 3 |
| D | 9 |
| E | 9 |

---

**Langkah 5 — Dari Node D**

- D → E = 9 + 1 = 10 → diabaikan (E sudah = 9, karena 10 > 9)

---

### ✅ Hasil Akhir

| Node | Jarak dari A |
|------|-------------|
| A | 0 |
| B | 5 |
| C | 3 |
| D | 9 |
| E | **9** ← tujuan |

**Perbandingan Jalur ke E:**

| Jalur | Total Jarak |
|-------|-------------|
| A → C → E | 3 + 6 = **9** ✅ |
| A → B → D → E | 5 + 4 + 1 = 10 ❌ |

> **Jalur terpendek: A → C → E dengan total jarak 9**

---

## 💻 Teknologi yang Digunakan

| Teknologi | Fungsi |
|-----------|--------|
| **HTML5** | Struktur halaman web — tampilan peta, tombol navigasi, input titik |
| **CSS3** | Styling antarmuka — layout, warna, responsivitas, animasi visual |
| **JavaScript (Vanilla)** | Inti logika sistem — implementasi Dijkstra, manajemen interaksi, animasi kendaraan |

> Sistem dibangun menggunakan **pure HTML/CSS/JavaScript** tanpa framework atau library eksternal, sehingga ringan dan dapat dijalankan langsung di browser tanpa instalasi tambahan.

---

## 🚀 Cara Menjalankan

### Persyaratan
- Web browser modern (Chrome, Firefox, Edge, Safari)
- Tidak memerlukan server atau instalasi tambahan

### Langkah Menjalankan

1. **Clone atau unduh** repository ini:
   ```bash
   git clone https://github.com/username/Simulasi-Pencarian-Rute-Kendaraan.git
   ```

2. **Masuk ke folder projek:**
   ```bash
   cd Simulasi-Pencarian-Rute-Kendaraan
   ```

3. **Buka file `index.html`** di browser:
   - Double-click file `index.html`, atau
   - Gunakan **Live Server** di VS Code untuk pengalaman terbaik

4. **Gunakan sistem:**
   - Pilih **titik awal** dari dropdown
   - Pilih **titik tujuan** dari dropdown
   - Klik tombol **"Cari Rute"**
   - Amati jalur terpendek yang ditampilkan dan animasi kendaraan bergerak

---

## ⚠️ Batasan Sistem

1. Sistem hanya menggunakan **algoritma Dijkstra** (tidak ada A* atau Bellman-Ford).
2. Data yang digunakan berupa **simulasi graf sederhana** — bukan data peta real-time.
3. Sistem **tidak terintegrasi** dengan API peta seperti Google Maps atau OpenStreetMap.
4. **Tidak mempertimbangkan** faktor kemacetan atau kondisi lalu lintas nyata.

---

## 📊 Kompleksitas Algoritma

| Aspek | Nilai |
|-------|-------|
| **Time Complexity** | O((V + E) log V) |
| **Space Complexity** | O(V) |
| **Struktur Data** | Priority Queue (Min-Heap) |

> Di mana **V** = jumlah node (vertex) dan **E** = jumlah edge (sisi)

---

## 📅 Informasi Projek

| Detail | Keterangan |
|--------|-----------|
| **Nama Projek** | Simulasi Pencarian Rute Kendaraan Berbasis Web Menggunakan Dijkstra's Algorithm |
| **Mata Kuliah** | Grafika Komputer / Pemrograman Web |
| **Institusi** | Universitas Maritim Raja Ali Haji (UMRAH) |
| **Program Studi** | Teknik Informatika |
| **Tanggal Pengerjaan** | 1–2 April 2026 |
| **Dosen Pembimbing** | Tekad Matulatan, S.Sos, S.Kom, M.Inf.Tech & Muhamad Fadli, S.Kom, M.Kom |

---

## 📚 Referensi

- Dijkstra, E. W. (1959). *A note on two problems in connexion with graphs.* Numerische Mathematik, 1(1), 269–271.
- Cormen, T. H., et al. (2009). *Introduction to Algorithms* (3rd ed.). MIT Press.
- Sedgewick, R., & Wayne, K. (2011). *Algorithms* (4th ed.). Addison-Wesley.

---

<div align="center">

**Kelompok GGS — Teknik Informatika UMRAH 2024**  
Tanjungpinang, 2026

</div>
