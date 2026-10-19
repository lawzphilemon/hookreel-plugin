// Usage: node carousel.mjs <carousel.html> [--out <dir>] [--min-font 24] [--chrome <path>]
//        node carousel.mjs --test
// Renders every <section class="slide" id="slide-NN"> of a carousel HTML to <out>/slide-NN.png at the
// slide's CSS size, then checks each slide in the same browser: PNG size, continuous numbering, smallest
// rendered font, and any element that sticks out of the slide (text cut off). Writes <out>/verification.json
// and exits 1 when a check fails. Uses headless Chrome: --chrome, CHROME_PATH, the Chrome Remotion downloads
// into a studio's node_modules (found from the current folder upwards), or an installed Chrome.
import fs from "fs";
import path from "path";
import { execFileSync } from "child_process";
import { pathToFileURL } from "url";

export const pngSize = (buf) => ({ width: buf.readUInt32BE(16), height: buf.readUInt32BE(20) });

export const splitSlides = (html) => {
  const first = html.search(/<section\b[^>]*class="[^"]*\bslide\b/);
  if (first < 0) throw new Error('no <section class="slide" id="slide-NN"> found');
  const head = html.slice(0, first).replace(/<body[^>]*>\s*$/i, "").replace(/<\/head>\s*$/i, "");
  const slides = [...html.matchAll(/<section\b[^>]*id="slide-(\d+)"[^>]*>[\s\S]*?<\/section>/g)].map((m) => ({ n: m[1], html: m[0] }));
  const css = html.match(/\.slide\s*\{[^}]*\}/)?.[0] ?? "";
  const width = Number(css.match(/[{;]\s*width\s*:\s*(\d+)px/)?.[1] ?? 1080);
  const height = Number(css.match(/[{;]\s*height\s*:\s*(\d+)px/)?.[1] ?? 1350);
  return { head, slides, width, height };
};

// Ids must run 01..N, and a visible "NN / TT" counter, when the slide has one, must match.
export const numberingErrors = (slides) => {
  const total = slides.length;
  const pad = (k) => String(k).padStart(2, "0");
  return slides.flatMap((s, i) => {
    const errs = [];
    if (Number(s.n) !== i + 1) errs.push(`slide id ${s.n} where ${pad(i + 1)} was expected`);
    const shown = s.html.replace(/<[^>]+>/g, " ").match(/\b(\d{1,2})\s*\/\s*(\d{1,2})\b/);
    if (shown && (Number(shown[1]) !== i + 1 || Number(shown[2]) !== total)) errs.push(`slide ${pad(i + 1)} shows ${shown[0]}`);
    return errs;
  });
};

const QA_SCRIPT = (w, h) => `<script>document.fonts.ready.then(() => {
  const slide = document.querySelector(".slide"), box = slide.getBoundingClientRect();
  let minFont = Infinity; const overflow = [];
  for (const el of slide.querySelectorAll("*")) {
    const r = el.getBoundingClientRect();
    if (!r.width || !r.height) continue;
    const text = [...el.childNodes].some((c) => c.nodeType === 3 && c.textContent.trim());
    if (text) minFont = Math.min(minFont, parseFloat(getComputedStyle(el).fontSize));
    const out = r.left < box.left - 0.5 || r.top < box.top - 0.5 || r.right > box.left + ${w} + 0.5 || r.bottom > box.top + ${h} + 0.5;
    const clipped = text && el.scrollHeight > el.clientHeight + 1 && getComputedStyle(el).overflow !== "visible";
    if (out || clipped) overflow.push((el.className || el.tagName.toLowerCase()) + ": " + el.textContent.trim().slice(0, 40));
  }
  document.body.setAttribute("data-qa", JSON.stringify({ minFont, overflow }));
});</script>`;

const findChrome = (flag) => {
  if (flag) return flag;
  if (process.env.CHROME_PATH) return process.env.CHROME_PATH;
  const exe = process.platform === "win32" ? "chrome-headless-shell.exe" : "chrome-headless-shell";
  for (let dir = process.cwd(); ; dir = path.dirname(dir)) {
    const root = path.join(dir, "node_modules", ".remotion", "chrome-headless-shell");
    if (fs.existsSync(root)) {
      const hit = fs.readdirSync(root, { recursive: true }).find((f) => path.basename(f) === exe);
      if (hit) return path.join(root, hit);
    }
    if (path.dirname(dir) === dir) break;
  }
  const installed = [
    "C:/Program Files/Google/Chrome/Application/chrome.exe",
    "C:/Program Files (x86)/Google/Chrome/Application/chrome.exe",
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
    "/usr/bin/google-chrome",
    "/usr/bin/chromium",
  ].find((p) => fs.existsSync(p));
  if (installed) return installed;
  throw new Error("No Chrome found. Run inside a hookreel studio (npx remotion browser ensure), or pass --chrome <path>.");
};

const test = () => {
  const html = `<html><head><style>.slide{width:1080px;height:1350px}</style></head><body>
<section class="slide" id="slide-01"><footer>01 / 02</footer></section>
<section class="slide" id="slide-02"><footer>02 / 02</footer></section></body></html>`;
  const s = splitSlides(html);
  console.assert(s.slides.length === 2 && s.width === 1080 && s.height === 1350, "split");
  console.assert(!s.head.includes("<body") && s.head.includes("<style>"), "head");
  console.assert(numberingErrors(s.slides).length === 0, "numbering ok");
  console.assert(numberingErrors([s.slides[0], { n: "03", html: "<footer>03 / 03</footer>" }]).length === 2, "numbering bad");
  const png = Buffer.alloc(24);
  png.writeUInt32BE(1080, 16);
  png.writeUInt32BE(1350, 20);
  console.assert(pngSize(png).width === 1080 && pngSize(png).height === 1350, "png size");
  console.log("carousel.mjs self-test done (no assertion output above = pass)");
};

const main = () => {
  const args = process.argv.slice(2);
  if (args[0] === "--test") return test();
  const opt = (name, dflt) => (args.includes(name) ? args[args.indexOf(name) + 1] : dflt);
  const file = args[0];
  if (!file || file.startsWith("--")) {
    console.error("Usage: node carousel.mjs <carousel.html> [--out <dir>] [--min-font 24] [--chrome <path>]");
    process.exit(1);
  }
  const outDir = path.resolve(opt("--out", path.dirname(file)));
  const minFontAllowed = Number(opt("--min-font", 24));
  const chrome = findChrome(opt("--chrome"));
  const { head, slides, width, height } = splitSlides(fs.readFileSync(file, "utf8"));
  fs.mkdirSync(outDir, { recursive: true });
  const base = ["--headless", "--disable-gpu", "--hide-scrollbars", "--force-device-scale-factor=1", `--window-size=${width},${height}`, "--virtual-time-budget=8000"];
  const errors = numberingErrors(slides);
  const report = [];
  for (const s of slides) {
    // The temp page sits next to the HTML so relative fonts and images still resolve.
    const tmp = path.join(path.dirname(path.resolve(file)), `.carousel-slide-${s.n}.tmp.html`);
    const page = (extra) => `${head}<style>html,body{margin:0;padding:0;background:transparent}.slide{margin:0!important}</style></head><body>${s.html}${extra}</body></html>`;
    const png = path.join(outDir, `slide-${s.n}.png`);
    try {
      fs.writeFileSync(tmp, page(""));
      execFileSync(chrome, [...base, `--screenshot=${png}`, pathToFileURL(tmp).href], { stdio: "ignore" });
      fs.writeFileSync(tmp, page(QA_SCRIPT(width, height)));
      const dom = execFileSync(chrome, [...base, "--dump-dom", pathToFileURL(tmp).href], { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] });
      const qaAttr = dom.match(/data-qa="([^"]*)"/)?.[1];
      const qa = qaAttr ? JSON.parse(qaAttr.replace(/&quot;/g, '"').replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">")) : null;
      const buf = fs.readFileSync(png);
      const size = pngSize(buf);
      const row = { file: path.basename(png), ...size, bytes: buf.length, minFontPx: qa?.minFont ?? null, overflow: qa?.overflow ?? ["QA script did not run"] };
      if (size.width !== width || size.height !== height) errors.push(`${row.file} is ${size.width}×${size.height}, expected ${width}×${height}`);
      if (row.minFontPx !== null && row.minFontPx < minFontAllowed) errors.push(`${row.file} has text at ${row.minFontPx}px (minimum ${minFontAllowed}px)`);
      for (const o of row.overflow) errors.push(`${row.file} overflow: ${o}`);
      report.push(row);
      console.log(`${png}  ${size.width}×${size.height}  min font ${row.minFontPx}px`);
    } finally {
      fs.rmSync(tmp, { force: true });
    }
  }
  const verification = { checked: new Date().toISOString(), source: path.basename(file), canvas: `${width}×${height}`, slides: report, errors, pass: errors.length === 0 };
  fs.writeFileSync(path.join(outDir, "verification.json"), JSON.stringify(verification, null, 2));
  if (errors.length) {
    console.error(`FAIL\n- ${errors.join("\n- ")}`);
    process.exit(1);
  }
  console.log(`PASS: ${slides.length} slides, verification.json in ${outDir}`);
};

main();
