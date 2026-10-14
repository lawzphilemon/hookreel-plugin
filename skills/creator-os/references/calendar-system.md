# Sistem Kalender Konten 90 Hari

## Ritme mingguan (5 posting, 2 libur)
| Hari | Format | Funnel | Fungsi |
|---|---|---|---|
| Senin | Carousel Edukasi | TOFU | tarik audiens baru, konten yang di-save/share |
| Selasa | Video / Reels | TOFU | jangkauan, hook kuat 3 detik |
| Rabu | Carousel Personal Story | MOFU | bangun kepercayaan lewat cerita (Personal Struggle, titik balik) |
| Kamis | Video Tutorial / Tips | MOFU | tunjukkan keahlian, "coba sekarang" |
| Jumat | Carousel / Video CTA | BOFU | dorong tindakan: DM, link bio, beli, daftar |
| Sabtu–Minggu | Libur / Opsional | — | tidak wajib; boleh dipakai repost/stories |

Komposisi per minggu: 2 TOFU · 2 MOFU · 1 BOFU. Kalau user hanya sanggup 3x seminggu, pertahankan Senin (TOFU), Rabu (MOFU), Jumat (BOFU).
Kalau user minta platform/jadwal lain, ritme boleh diubah — tapi tetap jaga keseimbangan funnel dan rasio 80:20 (80% bernilai, 20% promosi).

## 3 fase
| Fase | Hari | Fokus | Warna di sheet |
|---|---|---|---|
| Fase 1 | 1–30 | Awareness & Credibility — kenalkan diri, edukasi dasar, cerita awal | biru muda |
| Fase 2 | 31–60 | Engagement & Authority — framework, eksperimen, opini, studi kasus | hijau muda |
| Fase 3 | 61–90 | Conversion & Monetization — offer, testimoni, pricing, follow-up | oranye muda |

Fase ini sejalan dengan Roadmap Monetisasi 90 Hari (monetization.md): Fondasi → Launch → Scale. Kalau user sedang menyiapkan produk, letakkan konten pre-launch di akhir Fase 2 dan launch week di awal Fase 3.

## Kolom wajib per baris
`hari, minggu, fase, fokus_fase, format, tujuan (TOFU/MOFU/BOFU), topik, hook, cta` (+ `tanggal` kalau user memberi tanggal mulai, + `catatan` kosong).

## Aturan isi
- **Topik**: spesifik, bukan kategori. "3 Kesalahan Terbesar Kreator Pemula", bukan "Tips konten".
- **Hook**: kalimat jadi, bukan placeholder. Variasikan kategori hook (lihat hook-frameworks §11) — jangan lebih dari 2 hook berturut-turut dari kategori yang sama.
- **CTA sesuai funnel**:
  - TOFU → save/share/follow ("Simpan post ini sebelum…", "Share ke teman yang…")
  - MOFU → komen/DM kata kunci ("DM aku 'mulai'", "Komen 'funnel' kalau mau…") — ini juga sumber data lead.
  - BOFU → link bio, beli, daftar, konsultasi.
- Seri yang saling terhubung boleh (bagian 1/2/3), tapi jangan lebih dari 3 hari berturut-turut di topik yang sama.
- Topik di Fase 3 harus menyebut offer user yang nyata; kalau user belum punya offer, tanyakan atau arahkan ke workflow Monetisasi dulu.

## Contoh
`calendar-example.csv` berisi 64 baris posting (hari libur dibuang) untuk niche konten kreator / personal branding. Baca 10–15 baris untuk menangkap gaya topik, hook, dan CTA-nya — jangan menyalin isinya untuk niche lain.

## Pengerjaan
- Kalau ada `start_date`, nomor `hari` dihitung dari tanggal itu. Taruh posting di hari kerja sebenarnya (Senin–Jumat) supaya hari libur jatuh di akhir pekan, dan sesuaikan format dengan nama harinya.
- 30 hari = ±22 baris posting; 90 hari = ±64 baris. Untuk 90 hari, susun pilar & arc per fase dulu, minta user setujui, baru isi baris (atau isi langsung kalau user minta cepat).
- Simpan baris sebagai JSON lalu jalankan `scripts/build_calendar.py` → file .xlsx dengan tab Cara Pakai + Kalender, warna fase & funnel, dan kolom Catatan kosong untuk user.
