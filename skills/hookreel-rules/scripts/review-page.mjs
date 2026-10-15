// Usage: node review-page.mjs <file.md> [--cards] [--title "Short title"] [--out page.html]
//        node review-page.mjs --test
// Turns a hookreel markdown file (script, storyboard, publish notes) into one self-contained HTML page
// to publish for review, so the page is generated instead of written out by hand (that costs tokens).
// --cards shows every table row as a card (first column as its title), e.g. the script per scene.
// Covers the markdown hookreel writes: headings, paragraphs, tables, lists, quotes, code, rules.
import fs from "fs";
import path from "path";

const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

const inline = (s) => {
  const codes = [];
  let out = esc(s).replace(/`([^`]+)`/g, (_, c) => `\u0000${codes.push(c) - 1}\u0000`);
  out = out
    .replace(/\[([^\]]+)\]\((https?:[^)\s]+|[^)\s]+)\)/g, '<a href="$2">$1</a>')
    .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
    .replace(/(^|[^\w*])\*([^*\s][^*]*?)\*(?![\w*])/g, "$1<em>$2</em>");
  return out.replace(/\u0000(\d+)\u0000/g, (_, i) => `<code>${codes[i]}</code>`);
};

const cells = (line) => line.trim().replace(/^\||\|$/g, "").split("|").map((c) => c.trim());

export const toHtml = (md, { cards = false } = {}) => {
  const lines = md.replace(/\r\n/g, "\n").split("\n");
  const out = [];
  let para = [];
  const flush = () => {
    if (para.length) out.push(`<p>${inline(para.join(" "))}</p>`);
    para = [];
  };
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (/^```/.test(line)) {
      flush();
      const code = [];
      while (++i < lines.length && !/^```/.test(lines[i])) code.push(lines[i]);
      out.push(`<pre><code>${esc(code.join("\n"))}</code></pre>`);
    } else if (/^#{1,6} /.test(line)) {
      flush();
      const level = line.match(/^#+/)[0].length;
      out.push(`<h${level}>${inline(line.slice(level + 1))}</h${level}>`);
    } else if (/^-{3,}\s*$/.test(line)) {
      flush();
      out.push("<hr>");
    } else if (/^\|/.test(line) && /^\|[\s:|-]+\|\s*$/.test(lines[i + 1] ?? "")) {
      flush();
      const head = cells(line);
      const rows = [];
      for (i += 2; i < lines.length && /^\|/.test(lines[i]); i++) rows.push(cells(lines[i]));
      i--;
      if (cards) {
        out.push('<div class="cards">' + rows.map((r) => `<section class="card"><h4>${inline(r[0] ?? "")}</h4>${head.slice(1).map((h, k) => `<p><span class="label">${inline(h)}</span>${inline(r[k + 1] ?? "")}</p>`).join("")}</section>`).join("") + "</div>");
      } else {
        out.push(`<div class="table"><table><thead><tr>${head.map((h) => `<th>${inline(h)}</th>`).join("")}</tr></thead><tbody>${rows.map((r) => `<tr>${head.map((_, k) => `<td>${inline(r[k] ?? "")}</td>`).join("")}</tr>`).join("")}</tbody></table></div>`);
      }
    } else if (/^\s*([-*]|\d+\.) /.test(line)) {
      flush();
      const ordered = /^\s*\d+\. /.test(line);
      const items = [];
      for (; i < lines.length && /^\s*([-*]|\d+\.) /.test(lines[i]); i++) items.push(lines[i].replace(/^\s*([-*]|\d+\.) /, ""));
      i--;
      const tag = ordered ? "ol" : "ul";
      out.push(`<${tag}>${items.map((x) => `<li>${inline(x)}</li>`).join("")}</${tag}>`);
    } else if (/^> ?/.test(line)) {
      flush();
      const quote = [];
      for (; i < lines.length && /^> ?/.test(lines[i]); i++) quote.push(lines[i].replace(/^> ?/, ""));
      i--;
      out.push(`<blockquote>${inline(quote.join(" "))}</blockquote>`);
    } else if (!line.trim()) {
      flush();
    } else {
      para.push(line.trim());
    }
  }
  flush();
  return out.join("\n");
};

const page = (title, body) => `<!doctype html>
<html lang="id">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(title)}</title>
<style>
:root { --bg: #faf8f5; --text: #1d1b19; --muted: #6b645e; --line: #e4ded7; --card: #ffffff; --accent: #ae0001; --code: #f1ece6; }
@media (prefers-color-scheme: dark) { :root:not([data-theme="light"]) { --bg: #171514; --text: #f2eee9; --muted: #a9a29b; --line: #34302c; --card: #201d1b; --accent: #ff6b5e; --code: #2a2623; } }
:root[data-theme="dark"] { --bg: #171514; --text: #f2eee9; --muted: #a9a29b; --line: #34302c; --card: #201d1b; --accent: #ff6b5e; --code: #2a2623; }
* { box-sizing: border-box; }
body { margin: 0; background: var(--bg); color: var(--text); font: 16px/1.6 system-ui, -apple-system, "Segoe UI", Roboto, sans-serif; }
main { max-width: 1100px; margin: 0 auto; padding: 32px 16px 64px; }
h1 { font-size: 1.8rem; line-height: 1.2; } h2 { margin-top: 2.2rem; border-top: 1px solid var(--line); padding-top: 1.2rem; }
a { color: var(--accent); } em { color: var(--accent); font-style: normal; font-weight: 600; }
code { background: var(--code); padding: 0.1em 0.35em; border-radius: 4px; font-size: 0.9em; }
pre { background: var(--code); padding: 12px; border-radius: 8px; overflow-x: auto; white-space: pre-wrap; } pre code { background: none; padding: 0; }
blockquote { margin: 1rem 0; padding: 0.4rem 1rem; border-left: 3px solid var(--accent); color: var(--muted); }
hr { border: 0; border-top: 1px solid var(--line); margin: 2rem 0; }
.table { overflow-x: auto; margin: 1rem 0; border: 1px solid var(--line); border-radius: 8px; }
table { border-collapse: collapse; width: 100%; font-size: 0.92rem; }
th, td { text-align: left; vertical-align: top; padding: 8px 10px; border-bottom: 1px solid var(--line); }
th { background: var(--card); position: sticky; top: 0; }
.cards { display: grid; gap: 12px; margin: 1rem 0; }
.card { background: var(--card); border: 1px solid var(--line); border-radius: 10px; padding: 14px 16px; }
.card h4 { margin: 0 0 8px; } .card p { margin: 6px 0; } .label { display: block; font-size: 0.78rem; text-transform: uppercase; letter-spacing: 0.06em; color: var(--muted); }
</style>
</head>
<body>
<main>
${body}
</main>
</body>
</html>
`;

if (process.argv[2] === "--test") {
  const check = (ok, what) => { if (!ok) throw new Error(`self-check failed: ${what}`); };
  const html = toHtml("# T\n\nA **b** and *c* with `d<e>`.\n\n| a | b |\n|---|---|\n| 1 | 2 |\n\n- x\n- y\n\n```\n<x>\n```");
  check(html.includes("<h1>T</h1>"), "heading");
  check(html.includes("<strong>b</strong>") && html.includes("<em>c</em>"), "inline");
  check(html.includes("<code>d&lt;e&gt;</code>"), "code escaped");
  check(html.includes("<td>1</td><td>2</td>"), "table");
  check(html.includes("<ul><li>x</li><li>y</li></ul>"), "list");
  check(html.includes("<pre><code>&lt;x&gt;</code></pre>"), "fence");
  check(toHtml("| id | vo |\n|---|---|\n| 01 | Halo |", { cards: true }).includes('<h4>01</h4><p><span class="label">vo</span>Halo</p>'), "cards");
  check(toHtml("Rp100 * 2 * 3").includes("Rp100 * 2 * 3"), "lone asterisks stay");
  console.log("review-page self-check passed");
} else {
  const args = process.argv.slice(2);
  const file = args.find((a) => !a.startsWith("--") && args[args.indexOf(a) - 1] !== "--title" && args[args.indexOf(a) - 1] !== "--out");
  if (!file) {
    console.error('Usage: node review-page.mjs <file.md> [--cards] [--title "Short title"] [--out page.html]');
    process.exit(1);
  }
  const opt = (name) => (args.includes(name) ? args[args.indexOf(name) + 1] : null);
  const md = fs.readFileSync(file, "utf8");
  const title = opt("--title") ?? (md.match(/^# (.+)$/m)?.[1] ?? path.basename(file, ".md"));
  const out = opt("--out") ?? file.replace(/\.md$/, ".html");
  fs.writeFileSync(out, page(title, toHtml(md, { cards: args.includes("--cards") })));
  console.log(`${out}  (${Math.round(fs.statSync(out).size / 1024)} KB)`);
}
