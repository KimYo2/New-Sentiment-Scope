# 🧠 SentimentScope - Analisis Sentimen Publik Berbasis AI

![SentimentScope Banner](https://img.shields.io/badge/Status-Active-success?style=for-the-badge) ![Python](https://img.shields.io/badge/Python-3.9%2B-blue?style=for-the-badge) ![Flask](https://img.shields.io/badge/Flask-3.0-green?style=for-the-badge) ![License](https://img.shields.io/badge/License-MIT-orange?style=for-the-badge)

**SentimentScope** adalah platform analisis sentimen cerdas yang dirancang untuk memahami opini publik di Indonesia secara mendalam. Dibangun dengan teknologi Deep Learning (**IndoBERT**), aplikasi ini tidak hanya sekadar mengklasifikasikan Positif/Negatif, tetapi memberikan *actionable insights* yang disesuaikan untuk tiga target pengguna utama: **UMKM**, **Content Creator**, dan **Brand Manager**.

---

## 👨‍💻 Pengembang

| Atribut | Detail |
| :--- | :--- |
| **Lead Developer** | **Revi Arda Saputra** |
| **Support Developer** | **Danang Yoga Andimas** |
| **Institusi** | **UNISNU JEPARA** |
| **Mata Kuliah** | **Interaksi Manusia dan Komputer (IMK)** |

---

## ✨ Fitur Utama Berdasarkan Persona

Aplikasi ini memiliki 3 mode utama yang disesuaikan dengan kebutuhan spesifik:

### 1. �️ UMKM / E-Commerce Seller
*Optimalkan produk Anda berdasarkan review pelanggan.*
- **Batch Analysis & Product Grouping:** Upload ribuan review (CSV/Excel), sistem otomatis mengelompokkan sentimen per produk.
- **Smart Insights:** AI merangkum keluhan utama (misal: "packaging rusak") dan pujian (misal: "pengiriman cepat") secara otomatis.
- **Ranking Produk:** Lihat produk mana yang memiliki sentimen terbaik dan terburuk.

### 2. � Content Creator
*Pahami audiens YouTube Anda lebih dalam.*
- **YouTube Comment Scraper:** Analisis ribuan komentar video YouTube hanya dengan paste link.
- **Audience Feedback:** Pahami apakah reaksi netizen positif (dukungan) atau negatif (hujatan) secara instan.
- **Word Cloud:** Visualisasi kata-kata yang paling sering muncul di kolom komentar.

### 3. 📱 Brand Manager
*Monitor reputasi brand di tengah kompetisi.*
- **Competitor Battle (⚔️ Baru):** Bandingkan sentimen Brand Anda vs Kompetitor secara *head-to-head*.
- **Verdict System:** AI memberikan "vonis" siapa yang memenangkan persepsi publik.
- **Reputation Monitoring:** Pantau kesehatan brand secara real-time.

---

## � Fitur Inti (Core Features)

- **Deep Learning Accuracy:** Menggunakan model **IndoBERT** yang telah di-finetune (akurasi ~96%), paham bahasa gaul/slang Indonesia.
- **Real-time Analysis:** Analisis teks satuan dengan hasil instan.
- **Dashboard Visual:** Grafik tren sentimen, statistik ringkasan, dan word cloud interaktif.
- **Modern UI:** Desain antarmuka "Calm & Professional" (Blue/Purple/Teal theme) berbasis **Tailwind CSS**.
- **Secure Auth:** Sistem login/register aman dengan JWT & password hashing.

---

## 🛠️ Teknologi yang Digunakan

- **Backend:** Python, Flask, SQLAlchemy (SQLite), JWT-Extended.
- **AI / ML:** PyTorch, Hugging Face Transformers (IndoBERT).
- **Frontend:** HTML5, Tailwind CSS (via CDN), Vanilla JavaScript, Chart.js.
- **Data Processing:** Pandas, NLTK/Sastrawi (Stopwords).

---

## � Cara Instalasi & Menjalankan

Ikuti panduan lengkap ini untuk menjalankan SentimentScope di komputer lokal Anda:

### 1. Prasyarat Sistem
Pastikan Anda telah menginstal:
- **Python 3.9+** ([Download disini](https://www.python.org/downloads/))
- **Git** (Opsional, untuk clone repo)

### 2. Siapkan Folder Aplikasi
1.  Pastikan Anda sudah memiliki file aplikasi (misalnya: `sentiment_classifier_app.zip`).
2.  **Ekstrak/Unzip** file tersebut ke lokasi yang Anda inginkan (misal: di Desktop atau Documents).
3.  Buka folder hasil ekstraksi tersebut.
4.  Klik pada **Address Bar** di bagian atas folder, ketik `cmd`, lalu tekan **Enter**. Ini akan membuka terminal langsung di lokasi folder.

### 3. Buat Virtual Environment (Disarankan)
Agar sistem komputer Anda tetap bersih, kita buat lingkungan khusus:
```bash
# Windows
python -m venv venv
venv\Scripts\activate
```
*(Jika muncul `(venv)` di kiri baris perintah, berarti berhasil)*

### 4. Instalasi Dependencies
Install semua library yang dibutuhkan:
```bash
pip install -r requirements.txt
```
*Note: Proses ini mungkin memakan waktu beberapa menit karena mengunduh torch dan transformers.*

### 5. Jalankan Aplikasi
```bash
python app.py
```
Tunggu hingga muncul pesan: `Running on http://127.0.0.1:5000`

### 6. Akses Aplikasi
Buka browser (Chrome/Edge) dan kunjungi:
👉 **http://127.0.0.1:5000**

---

## 📂 Struktur Folder Project

```
📂 sentiment_classifier_app/
├── 📂 static/
│   ├── 📂 css/             # style.css
│   └── 📂 js/              # script.js (Logic Frontend)
├── 📂 templates/           # File HTML (Jinja2)
├── 📂 instance/            # Database SQLite (sentiment.db)
├── 📂 fine_tuned_model/    # Model IndoBERT (auto-download/generated)
├── app.py                  # Main Server File (Flask)
├── model_loader.py         # AI Inference Logic
├── scraper.py              # YouTube Scraping Logic
└── requirements.txt        # Daftar Library Python
```

---

## 📝 Catatan Tambahan

- **Login Default:** Silakan register akun baru saat pertama kali membuka aplikasi.
- **First Run:** Saat pertama kali menjalankan analisis, aplikasi akan mendownload model IndoBERT (~400MB) dari HuggingFace. Pastikan internet lancar.
- **Privasi:** Data CSV dan analisis diproses secara lokal dan tersimpan di database SQLite lokal Anda.

---

**© 2024 SentimentScope by Revi Arda Saputra**
*Developed for SCERDAS Project - UNISNU JEPARA*
