// Usage: node scripts/contrast.mjs <text hex> <background hex> [size px] ...   (npm run contrast -- …)
// WCAG 2 contrast ratio for each text/background pair, e.g.
//   npm run contrast -- "#AE0001" "#1A1110" 160  "#8A7F7B" "#F6EDE6" 28
// Needs 4.5:1 for text under 84 px (supporting text, labels, source lines) and 3:1 for large type
// (84 px and up on the 1080-wide canvas). Exits 1 if any pair fails.
import { fileURLToPath } from "url";

const lum = (hex) => {
  const h = hex.replace("#", "");
  const [r, g, b] = [0, 2, 4].map((i) => parseInt(h.length === 3 ? h[i / 2].repeat(2) : h.slice(i, i + 2), 16) / 255);
  const lin = (c) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
  return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
};
export const ratio = (fg, bg) => {
  const [a, b] = [lum(fg), lum(bg)].sort((x, y) => y - x);
  return (a + 0.05) / (b + 0.05);
};
export const LARGE = 84;

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const args = process.argv.slice(2);
  if (args[0] === "--self-test") {
    if (Math.abs(ratio("#000", "#FFFFFF") - 21) > 0.01 || Math.abs(ratio("#777777", "#FFFFFF") - 4.48) > 0.01) throw new Error("self-test failed");
    console.log("self-test ok");
    process.exit(0);
  }
  if (args.length < 2) {
    console.error('Usage: node scripts/contrast.mjs "#text" "#background" [size px] ...');
    process.exit(1);
  }
  let failed = 0;
  for (let i = 0; i < args.length; ) {
    const [fg, bg] = [args[i], args[i + 1]];
    const size = /^\d+$/.test(args[i + 2] ?? "") ? Number(args[i + 2]) : 0;
    i += size ? 3 : 2;
    const r = ratio(fg, bg), need = size >= LARGE ? 3 : 4.5, ok = r >= need;
    if (!ok) failed++;
    console.log(`${ok ? "pass" : "FAIL"} ${fg} on ${bg}${size ? ` at ${size} px` : ""}: ${r.toFixed(2)}:1 (needs ${need}:1)`);
  }
  process.exit(failed ? 1 : 0);
}
