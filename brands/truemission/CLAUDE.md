# Brand context · Truemission (Prudential agency, Indonesia)

Shipped preset for `/hookreel:brief` Step 1. Read it before the interview and skip everything it
answers. It is the brand's fixed law; a project overrides it only in its own `CLAUDE_<CODE>.md`, and
only by adding, never by loosening a compliance rule.

Write in Indonesian unless the brief says otherwise.

## Who this is

- Truemission is an agency of **PT Prudential Life Assurance** (Indonesia). The presenter is
  Lawrence Philemon; the voice is an ElevenLabs clone of his own voice.
- Product explainers for life insurance, in Indonesian, aimed at 25–44 with dollars or rupiah set
  aside for 10+ years, mostly men, overwhelmingly Indonesia.
- The brand is a **seller of a regulated product**: every video is also a regulated communication.

## Voice

- "kamu", and "Sahabat" for the direct address. **Never "Anda".** "kami" for the agency.
- Calm and factual. The confidence comes from the number being written down, not from adjectives.
- Sentence case, no exclamation marks, no emoji, no hype words, no Jaksel slang, no filler.
- Numbers are said the way a person says them ("50 ribu dolar"), and written on screen as the
  currency code with an Indonesian thousands separator ("USD 1.000", never "USD 1,000"). No example
  figure here is a product number: every real figure comes from `02-facts.md`.
- Say the downside out loud in every video: early surrender value, exchange-rate risk, "tetap bisa
  ditolak". Honesty is the conversion mechanism, not the disclaimer.

## Compliance (hard rules, no exceptions)

- A number may appear only if it is in `02-facts.md` with its source, and it carries its source line
  on screen ("Sumber: Prudential Indonesia", or the regulator/LPS/UU where that is the source).
- Every hypothetical, example or illustration carries **"Ilustrasi"** on screen from the frame it
  appears, and the end card repeats the source.
- The only allowed guarantee form is **"dijamin di polis, selama premi dibayar dan polis aktif"**.
  Never "dijamin pasti", never "pasti cair", never "100% aman", never a promised return.
- **"dijamin LPS" belongs to a bank deposit only** (and then with the LPS rate and period). Never
  within two sentences of the insurance product, never as a comparison the product wins by default.
- "bunga" may appear only as "Bukan bunga" (correcting the 7 % misreading) or when quoting a deposit's
  own interest. Never as the product's benefit.
- "tanpa pemeriksaan medis" is always followed by "tetap bisa ditolak".
- Banned claims and words: investasi, keuntungan, imbal hasil, return, cuan, passive income,
  termurah, dijamin untung, bebas risiko.
- End card, always, in this order:
  - "Truemission adalah agen resmi Prudential"
  - "Manfaat sesuai ketentuan polis. Detail di RIPLAY Umum <nama produk>."
  - "PT Prudential Life Assurance berizin dan diawasi OJK."
- The verification path offered to a sceptic is the **RIPLAY** (the official product illustration),
  never an argument. Regulator + document, in one calm paragraph.
- No product price or premium is invented. If a premium appears, it is an approved claim with its
  source, labelled when it is an example.

## Call to action (the shape that measured well, and the fix it needed)

- Pattern: keyword → "Komentar <KEYWORD>, kami kirim RIPLAY resminya lewat DM" → "konsultasi gratis
  lewat WhatsApp" → a pointer to the other video in the series.
- **Offer the DM in the same breath as the comment.** On a money topic the audience acts privately
  (share + save ran 2.66 × like + comment on the best reel), so a public comment as the only door
  excludes the people who want it most.
- **Say what the viewer gets on screen, not only in the voiceover.** "Komentar <KEYWORD>" alone reached
  ~450 people and produced one reply; "RIPLAY lewat DM" was audio-only.
- **Land the ask before 55 % of the runtime**, then repeat it on the end card, and name the save or
  the share once. `npm run retention` fails the build otherwise when `videos/<id>.json` declares
  `cta: { keyword, reward }`.
- Declare it: `"cta": { "keyword": "PROSPER", "reward": "RIPLAY" }`.

## Pacing (measured on this brand's own posted reels)

- Insights on the best performer so far (91.8 s): **half the viewers gone by 2.7 s**, 16 % left at
  20 s, 12 % at 50 s, **8 % at the ask**, average watch time 18 s. Instagram graded the hook "Lower"
  skip rate — the hook was fine; the length was not. Exact counts stay in the studio, not here.
- Therefore: **40–60 s** for a cold feed, the payoff (the number, the guarantee) **inside the first
  10 s**, the mechanism compressed, the caveats ≤ 8 s total, the ask at 40–55 % of the runtime.
- Do not answer a "the CTA is late" problem by trimming: a proportional cut leaves a late ask just
  as late, in percent. Move the scene.
- A slower read re-times everything: the script plans 2.5 words/s, and a 1.94 words/s take turned a
  75 s plan into 91.8 s. `prepare-vo` fails the build on more than 8 % drift.

## Look

- `brand.json`: warm cream paper `#F9F0EC`, ink `#000000`, one red `#AE0001`, muted `#6F6360`;
  Open Sans for headlines and big numbers, Rubik for labels, Instrument Serif italic for one accent
  word per video (see the project's `06-motion` for that choice).
- Flat solid props (coins, paper, policy sheets) with soft long shadows. No gradients on type. No 3D
  except the brand's own private cartoon presenter.
- Source line on every number; "Ilustrasi" pill pinned from frame 1 on illustrated scenes.
- Signature: a 15-year track the numbers land on, reused across a series so the viewer learns the
  chart once.
- Every video ships with the brand's tiled watermark; the tile is a private asset kept in the
  studio's `public/brand/`.

## Bans

- Visuals: the Prudential logo (text only), stock photos, emoji decoration, cash piles, money rain,
  faked real UI or a faked banking app, frightening imagery for a death benefit.
- Sound: `kaching`, `notif-sukses` or any "win" sting on a benefit; booms and impacts; meme sounds;
  anything lifted from a song, film, cartoon or game.
- Files: recordings, music, SFX library files, the watermark tile, the character poses, client facts
  and RIPLAY PDFs are **never** committed to a public repository.
- Posting: the AI-voice label goes on (Instagram "AI info"), auto-captions on, and the caption states
  that the narration is an AI clone of Lawrence's voice.

## Series and naming

- Project code `HKR-YYMMDD-XXXX`; video id `<CODE>-<name>`; the end card lists the other videos in
  the series ("Video lain di profil").
- One video carries one job. A series explains: what it is → how it works → versus the alternative
  the audience already holds (a dollar deposit, a rupiah savings habit) → one use case.

## Not in this repository

The logo, the watermark tile, the 3D presenter poses, recorded takes, the private SFX library, the
RIPLAY PDFs and any customer or price data. Add them inside the studio's `public/` folder, which stays
out of version control.
