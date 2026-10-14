---
name: creator-os
description: Sistem kerja kreator konten Indonesia dari hulu ke hilir — bikin hook, tulis script carousel/video/iklan, susun kalender konten 30–90 hari (TOFU/MOFU/BOFU), analisis performa dari tracker, sampai monetisasi personal brand (pilih model, ide produk digital per niche, pricing, landing page, launch, pilih platform jualan seperti Lynk.id/Scalev/Mayar). Pakai skill ini SETIAP KALI user minta hook, ide konten, script/caption carousel atau Reels/TikTok, kalender atau content plan, evaluasi kenapa konten flop atau laporan performa bulanan, ide produk digital, cara monetize akun/followers, rate card endorse, copy landing page produk digital, atau strategi launch — walaupun user tidak menyebut nama skill ini dan walaupun permintaannya singkat ("bikinin hook buat konten nabung", "kontenku sepi kenapa ya", "aku harus jual apa").
---

# Creator OS

Satu skill untuk seluruh siklus kreator: **Hook → Script → Kalender → Tracking → Monetisasi**. Isinya disarikan dari paket bahan user (150 Template Hook, ebook 10 Menit Jago Bikin Hook, 50 Prompt, Kalender 90 Hari, Tracker Performa, Cheat Sheet Monetisasi, 4 panduan monetisasi & landing page). Semua referensi ada di `references/`, data tabel di CSV, dan tiga script di `scripts/`.

## Prinsip umum (berlaku di semua workflow)
- **Bahasa**: Indonesia percakapan, aku/kamu, kecuali user menulis gue/lo atau minta formal. Ikuti register user.
- **Kerjakan, jangan suruh copy-paste.** Prompt di library adalah resep untuk Claude sendiri. Isi placeholder dari konteks user, jalankan, serahkan hasilnya. Berikan teks prompt hanya kalau user memintanya.
- **Konteks minimum sebelum menulis**: niche, target audiens, platform/format. Kalau sudah ada di percakapan, profil brand (output brandcore/core-context-profile), atau memori — pakai, jangan tanya ulang. Kalau belum ada, tanya maksimal satu pertanyaan, atau tulis dengan asumsi yang disebut terang-terangan.
- **Data bundel adalah titik awal, bukan jawaban.** Template hook dan ide produk diadaptasi ke audiens nyata user; jangan kirim contoh kalimat apa adanya.
- **Selalu beri versi siap pakai.** Kritik/skor tanpa versi perbaikan tidak berguna.
- **Ekosistem skill lain** (pakai kalau tersedia): `signal-copywriting` untuk memoles gaya persuasif, `humanizer-id` sebagai pass terakhir semua teks Indonesia, `page-copy-architect` kalau user mau landing page lengkap dengan SEO, `brandcore`/`core-context-profile` kalau belum ada profil brand.

## Pilih workflow
| User minta… | Workflow | Baca |
|---|---|---|
| hook, opening, judul carousel, kalimat pembuka | A. Hook | `references/hook-frameworks.md` |
| script carousel/video/iklan, caption, review script | B. Script | `references/script-structures.md` (+ hook-frameworks) |
| kalender, content plan, jadwal posting, pilar konten | C. Kalender | `references/calendar-system.md` |
| analisis performa, konten flop, laporan bulanan | D. Analisis | `references/analytics.md` |
| monetize, jual apa, ide produk, pricing, endorse, launch, platform, landing page | E. Monetisasi | `references/monetization.md` (+ lainnya sesuai kebutuhan) |
| arti istilah (CTR, retention, OTO, CPM…) | Kamus | `scripts/lookup.py glossary --q <istilah>` |

Permintaan sering menyambung (mis. "bikin kalender lalu script minggu pertama"). Jalankan berurutan dan teruskan output satu workflow sebagai input berikutnya.

`references/prompt-library.md` (50 prompt) berguna untuk tugas yang tidak tercakup tabel di atas: bio Instagram, template DM calon klien, riset pertanyaan audiens, repurpose 1 konten jadi 5 format, sistem batch produksi, SOP konten, mengatasi creative block. Cari judulnya dengan `grep "^### P" references/prompt-library.md`.

---

## A. Hook
1. Tentukan topik, audiens, format (carousel/video), dan emosi target. Pilih 1–2 trigger dari 8 Human Desire Trigger yang paling cocok.
2. Ambil pola dari bank template: `python scripts/lookup.py hooks --where kategori=<kategori> --where format=<carousel|video> --n 8 --random`. Lihat daftar kategori dengan `--list kategori`.
3. Tulis hook (default 10 variasi), campur minimal 4 kategori berbeda, terapkan Simplify Method (≤10 kata carousel; ≤8 kata/<7 detik video).
4. Untuk video, sertakan ide visual pembuka per hook (Visual Hook).
5. Skor dengan rubrik 0–10 (hook-frameworks §12). Tandai 2–3 terbaik dan jelaskan singkat kenapa.

Format output: tabel `# | Hook | Kategori | Trigger | Skor` (+ kolom `Visual pembuka` untuk video). Untuk ≤3 hook, cukup daftar biasa.

## B. Script
1. Pilih struktur sesuai tujuan: edukasi umum → H-F-I-C; cerita perjalanan → Personal Struggle 8 slide; membantah mitos → Kontra-Intuitif 6 slide; transformasi → Before-After-Bridge; jualan halus → soft selling; iklan → struktur iklan.
2. Kalau hook belum ada, jalankan Workflow A singkat (3 opsi) dan pakai yang skornya tertinggi.
3. Tulis mengikuti aturan rumah: 138–155 kata untuk carousel, CTA meng-echo hook, isi bermakna (F.A.C.E / "So What?").
4. Tutup dengan caption dan hitungan kata. Untuk video: tabel detik / naskah / visual.
5. Review script milik user: nilai 5 aspek, lalu tulis versi perbaikannya.

## C. Kalender
1. Kumpulkan: niche, audiens, durasi (30/60/90 hari), frekuensi, offer yang dijual (kalau ada), tanggal mulai (opsional).
2. Tentukan 3 pilar konten dan arc per fase. Untuk 90 hari, tunjukkan pilar + arc dulu dan minta persetujuan, kecuali user minta langsung jadi.
3. Isi baris mengikuti ritme mingguan dan aturan CTA per funnel (calendar-system.md). Hook harus kalimat jadi dan kategorinya bervariasi.
4. Simpan rencana sebagai JSON (`{"judul", "start_date", "rows": [...]}`) lalu jalankan:
   `python scripts/build_calendar.py rencana.json /mnt/user-data/outputs/<nama>.xlsx`
   (Kalau lingkungan punya skill xlsx, baca SKILL.md-nya dulu sebelum membuat file.)
5. Di chat, ringkas pilar dan 5 konten pertama saja — file berisi sisanya. Tawarkan menulis script untuk minggu pertama.

## D. Analisis
1. Data dari tracker user (.xlsx/.csv) → `python scripts/analyze_tracker.py <file> [--month YYYY-MM] [--map views=<nama kolom>]`. Kalau user menempel data di chat, simpan dulu ke CSV dengan header standar (lihat analytics.md).
2. Baca output, lalu tulis laporan dengan struktur di analytics.md: ringkasan → top 3 & kenapa berhasil → bottom 3 & diagnosis → pola → 3–5 keputusan untuk bulan depan. Kutip kolom Catatan user bila ada.
3. Untuk satu konten flop, pakai urutan diagnosis (hook → isi → CTA → timing/format → topik) dan beri hook/versi pengganti.
4. Kalau user ingin tab laporan di file tracker-nya: `--add-report /mnt/user-data/outputs/<nama>.xlsx`, lalu recalc (`python /mnt/skills/public/xlsx/scripts/recalc.py <file>` bila tersedia) dan pastikan nol error.
5. Tawarkan menyambung ke Workflow C dengan rekomendasi sebagai input.

## E. Monetisasi
Tentukan tahap user lalu baca hanya file yang perlu:
| Tahap | Lakukan | Referensi |
|---|---|---|
| "Aku harus jual apa / model apa?" | 3 pertanyaan pemilihan model (audiens, kespesifikan niche, jam/minggu) → 1 model utama + alasannya | monetization.md §2–3 |
| Ide produk | `python scripts/lookup.py ideas --where niche=<niche> [--where jenis=<jenis>] [--where kesulitan=mudah]` → pilih 3, adaptasi ke audiens user | monetization.md §6 |
| Validasi → naming → isi produk → copy → launch → scale | ikuti urutan kategori prompt 01–06 | product-prompts.md |
| Copy landing page | susun 8 section berurutan (headline → hero → pain → kredibilitas → detail → social proof → FAQ → CTA). Untuk halaman lengkap + SEO, serahkan ke `page-copy-architect` bila ada | landing-page-prompts.md |
| Pilih platform | matriks keputusan; verifikasi harga terbaru lewat web search sebelum dipakai untuk keputusan | platforms.md |
| Rencana 90 hari | roadmap Fondasi → Launch → Scale, selaraskan dengan kalender konten | monetization.md §4 |
| Endorse / rate card | tabel rate card + yang dilihat brand (ER, relevansi, konsistensi) | monetization.md §2 |

Angka harga, komisi, dan rate card adalah estimasi dari sumber — sampaikan sebagai kisaran. Ini panduan bisnis, bukan nasihat keuangan.

---

## Struktur folder
```
creator-os/
├── SKILL.md
├── references/
│   ├── hook-frameworks.md      kerangka hook + rubrik skor
│   ├── hook-templates.csv      150 template hook (kategori, niche, format)
│   ├── script-structures.md    struktur carousel/video/iklan + format output
│   ├── calendar-system.md      ritme mingguan, 3 fase, aturan CTA
│   ├── calendar-example.csv    64 baris contoh kalender
│   ├── analytics.md            rumus ER, diagnosis, struktur laporan
│   ├── monetization.md         4 model, pemilihan, roadmap 90 hari, kesalahan
│   ├── monetization-ideas.csv  180 ide produk/jasa × 18 niche
│   ├── product-prompts.md      60 prompt produk digital (riset → scale)
│   ├── landing-page-prompts.md 51 prompt landing page (8 section)
│   ├── platforms.md            5 platform jualan lokal + matriks keputusan
│   ├── prompt-library.md       50 prompt kreator serba guna
│   └── glossary.csv            140 istilah kreator
└── scripts/
    ├── lookup.py               cari di CSV mana pun (hooks/ideas/glossary/calendar)
    ├── build_calendar.py       JSON → kalender .xlsx berwarna
    └── analyze_tracker.py      tracker → ringkasan markdown (+ tab Laporan Bulanan)
```
