// Usage: node scripts/pace.mjs --self-test
//
// The pace gate. The script plans at a fixed spoken rate (`04-script.md`: "~2.5 words/s", 2.1 since
// 0.14.0); a take that reads slower stretches every scene, and the CTA slides with them, out of the part
// of the runtime where viewers still are. On HKR-261019-Y6VQ a 1.94 words/s take turned a 75 s plan into
// 91.8 s and moved the keyword ask from about 58 s to 81 s — where the retention curve had about 8 % of
// viewers left. Nothing else in the build notices: every beat is still in sync, the video is just long.
export const MAX_PACE_DRIFT = 0.08;

// paced: [{ id, actual, est }] — scene seconds against the seconds the plan expected.
// wordCount: spoken words in the script. sceneCount: scenes, for the lead-in/tail pads.
// wps: the rate the script planned at. pad: TIME.leadIn + TIME.tail.
// Returns { rate, drift, render, worst, fail, message }.
export const paceAudit = ({ paced, wordCount, sceneCount, wps, pad }) => {
  const speech = paced.reduce((t, p) => t + p.actual, 0);
  const rate = speech ? wordCount / speech : 0;
  const planned = wordCount / wps;
  const drift = planned ? speech / planned - 1 : 0;
  const render = speech + sceneCount * pad;
  const worst = [...paced].sort((a, b) => b.actual / b.est - a.actual / a.est).slice(0, 3);
  const message = `pace: ${rate.toFixed(2)} words/s, ${drift >= 0 ? "+" : ""}${(drift * 100).toFixed(0)} % against the ${wps} w/s plan; render about ${render.toFixed(1)} s`;
  const fail = drift <= MAX_PACE_DRIFT ? [] : [
    `FAIL pace: ${rate.toFixed(2)} spoken words/s against the ${wps} the script planned.`,
    `  voice ${speech.toFixed(1)} s for ${wordCount} words = ${(drift * 100).toFixed(0)} % over the ${planned.toFixed(1)} s plan;`,
    `  with the scene pads the render becomes ${render.toFixed(1)} s, and every scene lands that much later.`,
    `  worst scenes (actual/planned): ${worst.map((p) => `${p.id} ${p.actual.toFixed(1)}/${p.est.toFixed(1)} s`).join(", ")}`,
    "  fix before building motion: npm run trim (cut the pauses), regenerate at speed about 1.1, or re-time the beats in 06-motion-<id>.md. --allow-drift overrides.",
  ];
  return { rate, drift, render, worst, fail, message };
};

// Self-test: node scripts/pace.mjs --self-test
export const selfTest = () => {
  const scenes = (secs) => secs.map((s, i) => ({ id: `0${i + 1}`, actual: s, est: s }));
  // The reel this gate was written from: 161 words in 82.8 s of voice, at a plan of 2.5 words/s.
  const real = paceAudit({ paced: scenes([8.52, 8.9, 5.82, 8.52, 8.23, 11.98, 8.64, 8.74, 13.47]), wordCount: 161, sceneCount: 9, wps: 2.5, pad: 1 });
  const ok = [
    Math.abs(real.rate - 1.95) < 0.02,
    Math.abs(real.drift - 0.286) < 0.01,
    Math.abs(real.render - 91.8) < 0.3,
    real.fail.length === 5 && real.fail[0].includes("FAIL pace"),
    real.worst[0].id === "01",                       // every scene drifts alike at one pace
    paceAudit({ paced: scenes([30]), wordCount: 75, sceneCount: 1, wps: 2.5, pad: 1 }).fail.length === 0, // exactly on plan
    paceAudit({ paced: scenes([32.3]), wordCount: 75, sceneCount: 1, wps: 2.5, pad: 1 }).fail.length === 0, // +7.7 %, inside 8 %
    paceAudit({ paced: scenes([32.5]), wordCount: 75, sceneCount: 1, wps: 2.5, pad: 1 }).fail.length === 5, // +8.3 %, over
    paceAudit({ paced: [], wordCount: 0, sceneCount: 0, wps: 2.5, pad: 1 }).rate === 0,
  ];
  if (ok.includes(false)) throw new Error(`pace self-test failed: ${JSON.stringify({ ok, real })}`);
  console.log("pace self-test ok");
  return ok;
};

if (process.argv[1]?.endsWith("pace.mjs") && process.argv.includes("--self-test")) selfTest();
