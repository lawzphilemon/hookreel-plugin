# Analisis Performa Konten

## Kolom tracker (format Tracker Performa Konten)
`Tanggal, Platform, Format, Kategori (TOFU/MOFU/BOFU), Topik, Hook, Link, Script Lengkap, Views, Likes, Komentar, Share, Save, Engagement Rate, Catatan`

`scripts/analyze_tracker.py` membaca kolom ini berdasarkan NAMA header (urutan bebas, huruf besar/kecil diabaikan) dari .xlsx (tab "Log Konten" atau tab pertama yang cocok) atau .csv. Kalau header user beda (misal "Reach" bukan "Views"), petakan dulu dengan `--map`.

## Rumus
- **Engagement Rate (ER)** = (Likes + Komentar + Share + Save) ÷ Views × 100. Ini rumus dari tracker aslinya (berbasis views, bukan followers). Sebutkan basisnya saat melapor.
- **Save rate** = Save ÷ Views × 100 → sinyal konten edukasi/referensi bernilai.
- **Share rate** = Share ÷ Views × 100 → sinyal relatable / "ini gue banget" → pendorong reach.
- **Comment rate** → sinyal topik memancing opini atau CTA komen berhasil.

## Aturan waktu data
- Isi data minimal **24 jam** setelah posting (Instagram/TikTok); **48–72 jam** untuk YouTube. Konten yang umurnya kurang dari itu ditandai "belum stabil" dan dikeluarkan dari kesimpulan.
- Minimal ±8–10 konten sebelum menarik pola. Dengan data lebih sedikit, sajikan sebagai "indikasi awal", bukan kesimpulan.
- Bandingkan platform secara terpisah — views TikTok dan YouTube tidak setara.

## Diagnosis konten flop (urut dari yang paling sering)
1. **Hook** — views rendah, ER normal → orang yang berhenti suka, tapi sedikit yang berhenti. Nilai ulang hook dengan rubrik (hook-frameworks §12), beri 3 hook pengganti.
2. **Isi/struktur** — views oke, save & share rendah → hook berhasil, isi tidak memberi nilai/makna. Cek F.A.C.E dan foreshadow.
3. **CTA** — ER oke tapi komentar/DM rendah pada konten MOFU/BOFU → CTA kabur atau tidak nyambung ke hook.
4. **Timing/format** — topik sama perform berbeda di platform/format lain → repurpose ke format pemenang.
5. **Topik** — semua metrik rendah dan konten serupa juga rendah → topik tidak resonan dengan audiens; kembali ke riset pertanyaan audiens.

## Struktur laporan bulanan
1. Ringkasan angka: total konten, total & rata-rata views, rata-rata ER, per platform.
2. **Top 3** konten (urut ER, tampilkan views juga) + kenapa berhasil (hook kategori apa, format apa, trigger apa).
3. **Bottom 3** + diagnosis (pakai urutan di atas).
4. Pola: format, funnel (TOFU/MOFU/BOFU), kategori hook, hari posting yang paling kuat.
5. **Rekomendasi bulan depan** — 3–5 keputusan konkret (misal "naikkan Personal Story jadi 2x/minggu", "remix konten #2 jadi 3 angle"). Kalau user mau, langsung lanjut ke workflow Kalender dengan rekomendasi ini sebagai input.

Catatan kolom: `Catatan` di tracker berisi insight user — baca dan kutip, sering lebih berharga dari angka.

## Patokan untuk brand deal
Brand melihat ER lebih dari jumlah followers (contoh panduan: 10K followers ER 5% lebih menarik daripada 100K followers ER 0,5%). Untuk rate card lihat monetization.md.
