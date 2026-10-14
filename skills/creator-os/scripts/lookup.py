#!/usr/bin/env python3
"""Cari baris di dataset creator-os tanpa memuat seluruh CSV ke konteks.

Dataset:
  hooks     -> references/hook-templates.csv   (no, template, contoh, niche, kategori, format)
  ideas     -> references/monetization-ideas.csv (niche, jenis, nama, target, harga, kesulitan, modal)
  glossary  -> references/glossary.csv         (istilah, kategori, arti, contoh, kenapa_penting)
  calendar  -> references/calendar-example.csv (hari, minggu, fase, fokus_fase, format, tujuan, topik, hook, cta)

Contoh:
  lookup.py hooks --list kategori
  lookup.py hooks --where kategori=kontra --where format=video --n 8 --random
  lookup.py ideas --where niche=keuangan --where kesulitan=mudah
  lookup.py glossary --q retention
Filter --where memakai substring, tidak peka huruf besar/kecil. Kolom 'format' di hooks:
nilai 'Keduanya' ikut cocok saat mencari carousel atau video.
"""
import argparse, csv, random, sys
from pathlib import Path

REF = Path(__file__).resolve().parent.parent / "references"
FILES = {"hooks": "hook-templates.csv", "ideas": "monetization-ideas.csv",
         "glossary": "glossary.csv", "calendar": "calendar-example.csv"}


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("dataset", choices=FILES)
    ap.add_argument("--where", action="append", default=[], metavar="KOLOM=NILAI")
    ap.add_argument("--q", help="kata kunci di semua kolom")
    ap.add_argument("--n", type=int, default=15)
    ap.add_argument("--random", action="store_true")
    ap.add_argument("--list", metavar="KOLOM", help="tampilkan nilai unik + jumlah")
    a = ap.parse_args()

    rows = list(csv.DictReader(open(REF / FILES[a.dataset], encoding="utf-8")))
    if a.list:
        counts = {}
        for r in rows:
            counts[r[a.list]] = counts.get(r[a.list], 0) + 1
        for k, v in sorted(counts.items(), key=lambda x: -x[1]):
            print(f"{v:4d}  {k}")
        return

    for cond in a.where:
        col, val = cond.split("=", 1)
        val = val.lower()
        if col not in rows[0]:
            sys.exit(f"Kolom '{col}' tidak ada. Kolom: {', '.join(rows[0])}")
        def ok(r):
            cell = r[col].lower()
            if a.dataset == "hooks" and col == "format" and cell == "keduanya":
                return True
            return val in cell
        rows = [r for r in rows if ok(r)]
    if a.q:
        q = a.q.lower()
        rows = [r for r in rows if any(q in v.lower() for v in r.values())]

    total = len(rows)
    if a.random:
        random.shuffle(rows)
    rows = rows[: a.n]
    print(f"# {total} cocok, tampil {len(rows)}")
    for r in rows:
        print(" | ".join(f"{k}: {v}" for k, v in r.items() if v))


if __name__ == "__main__":
    main()
