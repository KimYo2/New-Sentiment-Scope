# 📖 BUKU PANDUAN PENGGUNA (USER MANUAL)
**Nama Aplikasi:** SentimentScope  
**Versi:** 1.0.0  
**Mata Kuliah:** Interaksi Manusia dan Komputer (IMK)  
**Pengembang:**
*   **Lead:** Revi Arda Saputra
*   **Support:** Danang Yoga Andimas
**Institusi:** UNISNU JEPARA

---

## 📋 Daftar Isi
1.  [Pendahuluan](#1-pendahuluan)
2.  [Persyaratan Sistem](#2-persyaratan-sistem)
3.  [Instalasi & Menjalankan Aplikasi](#3-instalasi--menjalankan-aplikasi)
4.  [Panduan Berdasarkan Persona](#4-panduan-berdasarkan-persona)
    *   [Untuk UMKM / E-Commerce](#41-untuk-umkm--e-commerce)
    *   [Untuk Content Creator](#42-untuk-content-creator)
    *   [Untuk Brand Manager](#43-untuk-brand-manager)
5.  [Fitur Tambahan](#5-fitur-tambahan)
6.  [Troubleshooting](#6-troubleshooting)

---

## 1. Pendahuluan
**SentimentScope** adalah platform analisis sentimen cerdas yang dirancang untuk tiga jenis pengguna: UMKM, Kreator Konten, dan Manajer Brand. Aplikasi ini menggunakan kecerdasan buatan (*Artificial Intelligence*) untuk "membaca" ribuan ulasan atau komentar dalam hitungan detik dan memberikan *insight* yang berguna.

---

## 2. Persyaratan Sistem
*   **Sistem Operasi:** Windows 10/11, macOS, atau Linux.
*   **Browser:** Google Chrome Terbaru (Disarankan).
*   **Software:** Python 3.9 sudah terinstal.
*   **Koneksi Internet:** Diperlukan saat pertama kali membuka aplikasi (download model AI) dan untuk fitur YouTube.

---

## 3. Instalasi & Menjalankan Aplikasi

Aplikasi ini bersifat *portable*, tidak perlu instalasi rumit.
1.  **Ekstrak File:** Klik kanan file `.zip` aplikasi > *Extract Here*.
2.  **Buka Folder:** Masuk ke folder hasil ekstraksi.
3.  **Buka Terminal:** Klik baris alamat folder di atas, ketik `cmd`, lalu Enter.
4.  **Siapkan Lingkungan (Sekali Saja):**
    ```bash
    python -m venv venv
    venv\Scripts\activate
    pip install -r requirements.txt
    ```
5.  **Jalankan Aplikasi:**
    ```bash
    python app.py
    ```
6.  **Mulai:** Buka browser dan ketik `http://localhost:5000`.

---

## 4. Panduan Berdasarkan Persona

Pilih mode yang sesuai dengan kebutuhan Anda di halaman utama:

### 4.1. 🛍️ Untuk UMKM / E-Commerce
*Cocok untuk: Penjual online yang ingin menganalisis ulasan Shopee/Tokopedia dalam jumlah banyak.*

**a. Analisis Per Review (Satuan)**
1.  Masuk ke menu **UMKM**.
2.  Pilih tab **"Analisis Satuan"**.
3.  Ketik ulasan (contoh: *"Barang bagus tapi pengiriman lambat"*).
4.  Klik **Analisis**. Sistem akan memberitahu sentimen per aspek (Produk: Positif, Layanan: Negatif).

**b. Analisis Batch (Banyak File)**
1.  Pilih tab **"Batch Review (CSV)"**.
2.  Upload file Excel/CSV berisi kolom `text` dan `product` (opsional).
3.  Sistem akan otomatis:
    *   Mengelompokkan review berdasarkan nama produk.
    *   Memberikan **Smart Insights**: Rangkuman otomatis apa yang disukai/dibenci pelanggan.
    *   Menampilkan ranking produk terbaik & terburuk.

---

### 4.2. 👤 Untuk Content Creator
*Cocok untuk: YouTuber/Influencer yang ingin memahami respon fans.*

**a. Analisis Komentar YouTube**
1.  Masuk ke menu **Content Creator**.
2.  Pilih tab **"YouTube Comments"**.
3.  Paste link video YouTube Anda.
4.  Klik **Analisis**.
5.  Lihat grafik: Berapa % yang mendukung (Positif) vs menghujat (Negatif).

**b. Word Cloud**
*   Lihat tab **Dashboard** untuk melihat visualisasi kata-kata yang paling sering muncul di kolom komentar Anda.

---

### 4.3. 📱 Untuk Brand Manager
*Cocok untuk: Memantau reputasi brand dan kompetitor.*

**a. Kompetitor Battle (Fitur Baru! 🔥)**
1.  Masuk ke menu **Brand Manager**.
2.  Pilih tab **"Kompetitor (Battle)"**.
3.  Masukkan **Link Video Brand Anda** di kolom kiri (Brand A).
4.  Masukkan **Link Video Kompetitor** di kolom kanan (Brand B).
5.  Klik **"Mulai Pertarungan"**.
6.  Sistem akan menyandingkan data head-to-head dan memberikan **Vonis Pemenang** berdasarkan sentimen publik.

**b. Monitor YouTube**
*   Sama seperti fitur Creator, gunakan ini untuk memantau sentimen video promosi/iklan brand Anda secara spesifik.

---

## 5. Fitur Tambahan

*   **Training Model:** Ingin AI lebih pintar bahasa gaul spesifik toko Anda? Gunakan menu **Settings > Training Center** untuk melatih ulang model dengan data Anda sendiri.
*   **Export PDF/CSV:** Semua hasil analisis bisa diunduh untuk kebutuhan laporan bulanan.

---

## 6. Troubleshooting

| Masalah | Solusi |
| :--- | :--- |
| **Model Error / Download Stuck** | Pastikan internet lancar saat pertama kali run. Coba hapus folder `fine_tuned_model` dan restart app. |
| **File CSV Gagal Upload** | Pastikan format UTF-8 dan header kolom bernama `text` atau `review`. |
| **Tidak Bisa Login** | Default akun admin/password mungkin belum diset. Silakan daftar akun baru. |

---
**Dibuat untuk Tugas Mata Kuliah Interaksi Manusia dan Komputer (IMK) - UNISNU JEPARA**
