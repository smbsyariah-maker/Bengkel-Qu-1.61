# Panduan Lengkap GitHub Actions Build Android APK (Bengkel Qu 1.61)

File konfigurasi workflow otomatis GitHub Actions berada di:  
📁 `.github/workflows/build-apk.yml`

---

## 🚀 Fitur Otomatisasi GitHub Actions

Workflow ini telah dikonfigurasi dan diuji agar dapat berjalan secara **otomatis**:
1. **Auto Trigger**:
   - Otomatis berjalan setiap ada `git push` ke semua branch (`main`, `master`, dsb).
   - Otomatis berjalan saat membuat `Pull Request`.
   - Otomatis berjalan dan membuat GitHub Release saat melakukan push tag versi (contoh: `git tag v1.61 && git push origin v1.61`).
   - Dapat dijalankan secara **manual 1-klik** via tombol **Run workflow** di menu GitHub Actions.
2. **Environment Lengkap**:
   - **Node.js 22 LTS** + npm cache otomatis.
   - **Java JDK 21 (Temurin)** + Gradle cache otomatis.
   - **Android SDK Platform 35 & Build-Tools 35.0.0** dengan auto-accept license agreement.
   - Otomatis membuat `debug.keystore` jika belum tersedia di environment runner.
   - Otomatis menjalankan `chmod +x` pada `gradlew` untuk mencegah error *permission denied*.
   - Mengompilasi APK debug via `./gradlew assembleDebug -x test -x lint` (cepat & stabil).
3. **Hasil Build Artifact & Release**:
   - File APK diunggah ke GitHub Artifact dengan nama **`BengkelQu-v1.61-APK`** (tersedia selama 30 hari).
   - File di dalam zip: `BengkelQu-v1.61.apk` dan `BengkelQu-debug.apk`.

---

## 📋 Cara Menjalankan Build APK di GitHub

### Opsi 1: Otomatis Setiap Kali Push (Recommended)
Cukup jalankan perintah git seperti biasa di komputer atau terminal Anda:
```bash
git add .
git commit -m "Update Bengkel Qu 1.61"
git push origin main
```
GitHub Actions akan langsung mendeteksi push dan memulai kompilasi APK secara otomatis!

### Opsi 2: Jalankan Manual dari Tampilan GitHub (1-Klik)
1. Buka repositori proyek Anda di web browser (**GitHub.com**).
2. Klik tab **Actions** di menu atas.
3. Di bilah sisi kiri, klik workflow **`Build Android APK (Bengkel Qu 1.61)`**.
4. Di sebelah kanan, klik tombol **Run workflow**.
5. Pilih branch yang ingin di-build (misalnya `main` atau `master`), lalu klik tombol hijau **Run workflow**.
6. Proses build akan berjalan (biasanya memerlukan waktu 3–5 menit).

---

## 📥 Cara Mengunduh File APK Hasil Build

1. Buka tab **Actions** di repositori GitHub Anda.
2. Klik baris workflow run yang sedang atau sudah selesai (bertanda centang hijau ✅).
3. Gulir halaman ke bagian paling bawah (**Artifacts**).
4. Klik tautan artifact **`BengkelQu-v1.61-APK`**.
5. Browser akan mengunduh berkas `.zip`. Ekstrak berkas tersebut untuk mendapatkan:
   - 📱 **`BengkelQu-v1.61.apk`**
6. Kirim file `.apk` ke ponsel Android Anda (melalui WhatsApp, Telegram, Google Drive, atau kabel data USB) dan langsung pasang (Install).
