# Struktur Script & Carousel

Aturan rumah (berlaku untuk semua struktur, diambil dari pola prompt aslinya):
- Bahasa percakapan Indonesia, **aku/kamu** (kecuali user minta gue/lo atau formal).
- Carousel: total **138–155 kata** di seluruh slide. Hook slide 1 maks 10 kata. Slide isi 2–3 kalimat.
- Video: 1 menit ≈ 130 kata. Kalimat pendek (≤10 kata) supaya enak diucapkan.
- Hindari kata "soal" dan "straightforward" (ciri khas tulisan AI di pack ini).
- CTA terakhir harus **meng-echo hook** slide 1 — pembaca merasa "loop"-nya tertutup.
- Setiap draft ditutup dengan hitungan kata, supaya user bisa cek batasnya.

## Daftar isi
1. Carousel umum — Hook · Foreshadow · Isi · CTA
2. Personal Struggle — 8 slide
3. Kontra-Intuitif — 6 slide
4. Before-After-Bridge
5. Soft selling
6. Iklan carousel & iklan video
7. Talking head / avatar AI
8. ATM & Remix
9. Format output
10. Review script sebelum posting

---

## 1. Carousel umum (H-F-I-C)
| Slide | Peran | Aturan |
|---|---|---|
| 1 | Hook | ≤10 kata, memancing penasaran, tanpa tanda tanya di akhir kalau bisa |
| 2 | Foreshadow | 1–2 kalimat: preview manfaat kalau terus scroll, tanpa membocorkan isi |
| 3…N-1 | Isi | 1 poin per slide, 2–3 kalimat. Pakai F.A.C.E / "So What?" (lihat hook-frameworks §9) supaya ada makna, bukan cuma info |
| N | CTA | ajakan spesifik yang nyambung ke hook |

Variasi foreshadow (slide 2) — buat 3–5 opsi kalau user minta pilihan: preview manfaat, janji "poin terakhir paling penting", atau "kebanyakan orang berhenti di poin 2".

## 2. Personal Struggle — 8 slide
1 Hook: kondisi buruk masa lalu **dengan angka spesifik** → 2 Agitasi: perbesar rasa sakit → 3 Titik balik: satu hal yang berubah → 4 Insight: pelajaran utama → 5 Solusi: cara konkret yang ditemukan → 6 Detail metode/produk → 7 Bukti: hasil setelah menerapkan → 8 CTA yang echo slide 1.
Cocok untuk: Rabu (Carousel Personal Story, MOFU) di kalender. Gunakan Non-Expert Authority (hook-frameworks §10).

## 3. Kontra-Intuitif — 6 slide
1 Provokasi: lawan asumsi umum → 2 Agitasi pain: kenapa cara umum justru salah → 3 Mekanisme: kenapa yang kontra itu benar → 4 Demo/contoh konkret → 5 Proof: data/testimoni/pengalaman → 6 CTA yang echo provokasi.
Pakai pola Twist (hook-frameworks §7) untuk slide 1.

## 4. Before-After-Bridge
Before (kondisi buruk audiens, spesifik) → After (kondisi ideal, pakai angka kalau bisa) → Bridge (metode penghubung) → CTA. Carousel 138–155 kata, video 130–200 kata.

## 5. Soft selling
Nilai edukasi murni dulu → di tengah sisipkan pengalaman pribadi yang terhubung ke produk → di akhir produk muncul sebagai solusi natural, bukan tujuan konten. Ingat rasio 80:20 (80% konten bernilai, 20% promosi).

## 6. Iklan
**Iklan carousel:** Slide 1 masalah spesifik → slide tengah: agitasi, mekanisme solusi, bukti/testimoni → slide akhir CTA dengan urgensi (yang jujur, bukan palsu). 138–155 kata.
**Iklan video:** dua format, jangan lebih panjang. **15 dtk (audiens hangat/retargeting, maks 19 dtk):** hook → 3 manfaat → CTA langsung. **30 dtk (audiens dingin, maks 40 dtk):** hook (0–3 dtk, harus jalan tanpa suara) → masalah (selesai sekitar dtk 8) → solusi yang sudah dicoba dan kenapa gagal → produk muncul sebagai jawaban → 3 manfaat → CTA ringan. Ganti visual tiap ≤3 dtk. Untuk segmen baru, cukup tulis ulang hook, masalah dan solusi yang gagal. Detail: bagian Ad mode di skill `hookreel-rules`.
**Headline iklan:** 15 variasi = 5 pain point + 5 hasil/transformasi + 5 rasa penasaran, maks 10 kata.
**Primary text Meta Ads:** 3 variasi — PAS, AIDA, storytelling singkat; maks 150 kata.
**Retargeting:** akui mereka sudah kenal produk, beri alasan BARU untuk beli sekarang, pakai social proof/urgensi baru.

## 7. Talking head / avatar AI (HeyGen dsb.)
Hook (5 dtk) → jembatan ke masalah (10 dtk) → poin 1 → poin 2 → poin 3 → CTA. Kalimat ≤10 kata, hindari tanda seru berlebihan dan singkatan yang sulit dibaca mesin. Hitung kata sesuai durasi (≈130/menit).
Untuk video yang direkam sendiri, tambahkan kolom **visual/B-roll** dan **teks layar** di samping naskah.

## 8. ATM & Remix
**ATM (Amati-Tiru-Modifikasi):** dari script orang lain → identifikasi struktur & formula → pertahankan struktur → ganti topik, contoh, sudut pandang. Hasil harus original; jangan menyalin kalimat.
**Remix konten lama:** cari elemen terkuat → buat 3 versi: Personal Story, Data/Angka, Kontra-Intuitif → ganti hook & struktur, inti pesan sama.

## 9. Format output
Carousel:
```
SLIDE 1 — HOOK
<teks>
SLIDE 2 — FORESHADOW
<teks>
...
SLIDE N — CTA
<teks>
---
Caption: <2 baris pertama = hook kedua, lalu 2–4 kalimat, CTA, 3–5 hashtag relevan>
Total kata slide: <angka>
```
Video: tabel 3 kolom `Detik | Naskah (diucapkan) | Visual / teks layar`.

## 10. Review script sebelum posting
Nilai 5 hal: kekuatan hook (pakai rubrik hook-frameworks §12) · kejelasan alur · kekuatan CTA · tone natural/tidak kaku · lalu SELALU berikan versi perbaikannya, bukan cuma komentar.
