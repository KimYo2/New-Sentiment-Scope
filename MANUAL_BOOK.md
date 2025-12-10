# 📖 BUKU PANDUAN PENGGUNA (USER MANUAL)
**Nama Aplikasi:** SentimentScope  
**Versi:** 1.0.0  
**Pengembang:** Revi Arda Saputra (UNISNU JEPARA)

---

## 📋 Daftar Isi
1.  [Pendahuluan](#1-pendahuluan)
2.  [Persyaratan Sistem](#2-persyaratan-sistem)
3.  [Instalasi & Menjalankan Aplikasi](#3-instalasi--menjalankan-aplikasi)
4.  [Fitur Autentikasi](#4-fitur-autentikasi)
5.  [Panduan Fitur Utama](#5-panduan-fitur-utama)
    *   [Analisis Satuan](#51-analisis-satuan)
    *   [Dashboard Statistik](#52-dashboard-statistik)
    *   [Analisis Social (YouTube)](#53-analisis-social-youtube)
    *   [Analisis Batch (CSV)](#54-analisis-batch-csv)
    *   [Training Model](#55-training-model)
6.  [Troubleshooting](#6-troubleshooting)

---

## 1. Pendahuluan
SentimentScope adalah aplikasi berbasis web yang dirancang untuk menganalisis sentimen publik secara otomatis menggunakan kecerdasan buatan (*Artificial Intelligence*). Aplikasi ini dapat mengklasifikasikan teks menjadi **Positif**, **Negatif**, atau **Netral**.

## 2. Persyaratan Sistem
Sebelum menggunakan aplikasi, pastikan perangkat Anda memenuhi spesifikasi berikut:
*   **Sistem Operasi:** Windows 10/11, macOS, atau Linux.
*   **Browser:** Google Chrome, Microsoft Edge, atau Mozilla Firefox (Terbaru).
*   **Software:** Python 3.9 atau lebih baru.
*   **Koneksi Internet:** Diperlukan untuk instalasi awal dan fitur YouTube Scraping.

---

## 3. Instalasi & Menjalankan Aplikasi
1.  **Buka Folder Aplikasi:** Pastikan Anda sudah mengekstrak folder `sentimentscope`.
2.  **Buka Terminal:** Klik kanan di dalam folder > "Open in Terminal".
3.  **Install Dependensi:** Ketik perintah `pip install -r requirements.txt` lalu tekan Enter.
4.  **Jalankan Server:** Ketik `python app.py` lalu tekan Enter.
5.  **Akses Aplikasi:** Buka browser dan kunjungi `http://localhost:5000`.

---

## 4. Fitur Autentikasi
Untuk mengakses fitur lengkap (seperti Training dan Riwayat), pengguna disarankan untuk login.
1.  **Register:** Klik tombol "Daftar", isi form, dan buat akun baru.
2.  **Login:** Masukkan email dan password yang sudah didaftarkan.
3.  **Logout:** Klik nama profil di pojok kanan atas > "Keluar".

---

## 5. Panduan Fitur Utama

### 5.1. Analisis Satuan
Gunakan fitur ini untuk mengecek satu kalimat teks.
Langkah-langkah:
1.  Pilih tab **Analisis** (ikon kaca pembesar).
2.  Ketik atau tempel teks pada kolom input (min. 10 karakter).
3.  Klik tombol **"Analisis Sekarang"**.
4.  Hasil sentimen akan muncul beserta skor keyakinan (*confidence level*).

### 5.2. Dashboard Statistik
Melihat ringkasan aktivitas analisis.
Langkah-langkah:
1.  Pilih tab **Dashboard**.
2.  Lihat grafik lingkaran untuk proporsi sentimen (Positif/Negatif/Netral).
3.  Lihat *Word Cloud* untuk kata-kata yang paling sering muncul.

### 5.3. Analisis Social (YouTube)
Mengambil komentar netizen dari video YouTube.
Langkah-langkah:
1.  Pilih tab **Social**.
2.  Salin link video YouTube (misal: `https://youtube.com/watch?v=...`).
3.  Tempel pada kolom URL.
4.  Klik **"Analisis Komentar"**.
5.  Sistem akan menampilkan ringkasan sentimen audiens video tersebut.

### 5.4. Analisis Batch (CSV)
Memproses banyak data sekaligus dari file Excel/CSV.
Langkah-langkah:
1.  Siapkan file `.csv` yang memiliki kolom bernama `text` atau `review`.
2.  Pilih tab **Batch**.
3.  Klik area upload atau drag & drop file Anda.
4.  Klik **"Mulai Analisis Batch"**.
5.  Setelah selesai, klik tombol **Download CSV** untuk mengunduh hasil lengkapnya.

### 5.5. Training Model (Fine-Tuning)
Melatih ulang AI agar lebih pintar mengenali data spesifik Anda.
Langkah-langkah:
1.  Siapkan file `training.csv` dengan dua kolom: `text` dan `label` (Isi label: Positif/Negatif/Netral).
2.  Pilih tab **Training**.
3.  Upload file tersebut.
4.  Klik **"Mulai Training"**.
5.  Tunggu proses selesai (durasi bergantung pada spesifikasi komputer).

---

## 6. Troubleshooting
| Kendala | Solusi |
| :--- | :--- |
| **Gagal Upload CSV** | Pastikan format file adalah `.csv` (koma sebagai pemisah) dan UTF-8 encoded. |
| **Server Error** | Cek koneksi internet atau restart aplikasi dengan menutup dan membuka ulang terminal. |
| **Hasil Tidak Akurat** | Lakukan Training ulang dengan data yang lebih relevan. |
