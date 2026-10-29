// hookreel kit for HyperFrames scenes: spoken-word times, slow-in fast-out life, focus-in words, springs,
// the shot-size camera, shake, squash, grain and the transition set. Every helper adds tweens to the
// scene's paused GSAP timeline, so every frame is a function of timeline time (frame = f(t)).
// Loaded by the root page (`npm run assemble` writes it); scenes use the global HR.
//
//   const tl = gsap.timeline({ paused: true });
//   const w = (word, n) => HR.at("01-hook", word, n);      // scene second the word is spoken
//   HR.life(tl, "#hook-title", w("deposito"), w("tinggi") + 0.6);
//   HR.camera(tl, "#hook-world", [{ at: 0, s: HR.SHOT.close, x: 540, y: 700, cut: true }, { at: w("tapi"), s: HR.SHOT.wide }]);
//   HR.transition(tl, "#hook-next", "circle", w("tapi"), { x: 540, y: 900 });
//   window.__timelines["s01-hook"] = tl;
(() => {
  const TIME = { leadIn: 0.27, tail: 0.73 }; // keep in step with src/motion.ts TIME
  const SHOT = { wide: 1, medium: 1.45, close: 2.1 };
  const EASE = "power4.out"; // close to cubic-bezier(0.16, 1, 0.3, 1)
  // Spring presets by the element's weight (src/motion.ts SPRING, measured at 30 fps).
  const SPRING = {
    snappy: { duration: 0.3, ease: "power3.out" }, // chips, ticks, small UI
    default: { duration: 0.53, ease: "back.out(1.2)" }, // cards, containers
    heavy: { duration: 0.93, ease: "power2.out" }, // big type, 3D objects, logo lockups
    playful: { duration: 0.6, ease: "back.out(2.6)" }, // mascots and stickers, overshoot meant to be seen
  };

  const norm = (s) => String(s).toLowerCase().normalize("NFKD").replace(/[^\p{L}\p{N}]/gu, "");
  const words = () => window.HR_WORDS || { scenes: {} };

  // Scene second (leadIn included) the n-th occurrence of `word` is spoken in `scene`. Throws on a word the
  // scene does not say, so a typo never lands a beat at 0.
  const at = (scene, word, n = 0) => {
    const s = words().scenes[scene];
    if (!s) throw new Error(`HR.at: no scene ${scene} in words.json`);
    const hits = s.words.filter(([w]) => norm(w) === norm(word));
    if (!hits[n]) throw new Error(`HR.at: "${word}" (#${n}) is not spoken in ${scene}`);
    return TIME.leadIn + Number(hits[n][1]);
  };
  const secs = (scene) => words().scenes[scene].secs + TIME.leadIn + TIME.tail;

  // Element enters slow and firm from `at`, leaves fast, gone at `until`. Symmetric in and out reads mechanical.
  const life = (tl, sel, start, until, o = {}) => {
    const from = { opacity: 0, y: 40, filter: "blur(10px)", ...(o.from || {}) };
    const to = { opacity: 1, y: 0, x: 0, scale: 1, filter: "blur(0px)" };
    tl.fromTo(sel, from, { ...to, duration: o.enter ?? 0.9, ease: EASE }, start);
    if (until != null) tl.to(sel, { opacity: 0, y: -24, filter: "blur(6px)", duration: o.exit ?? 0.45, ease: "power3.in" }, until - (o.exit ?? 0.45));
    return tl;
  };

  // A word that focuses in from a blur, rising a little.
  const word = (tl, sel, start, o = {}) =>
    tl.fromTo(sel, { opacity: 0, filter: "blur(18px)", y: 30, scale: o.from ?? 1.25 }, { opacity: 1, filter: "blur(0px)", y: 0, scale: 1, duration: o.dur ?? 0.45, ease: EASE }, start);

  // Motion with mass: tween `vars` from scene second `start` with a preset's duration and ease.
  const spr = (tl, sel, start, vars, preset = "default") => tl.to(sel, { ...SPRING[preset], ...vars }, start);

  // Run fn(t) on every frame between scene seconds a and b (t = scene second). For values GSAP cannot
  // tween directly; fn must be a pure function of t.
  const drive = (tl, a, b, fn) => {
    const p = { t: a };
    fn(a);
    tl.fromTo(p, { t: a }, { t: b, duration: b - a, ease: "none", onUpdate: () => fn(p.t) }, a);
    return tl;
  };

  // Camera at scene second t (src/motion.ts camAt): smoothstep between shots, a 1 % breath, never shows the world's edge.
  const camAt = (t, shots, W = 1080, H = 1920) => {
    let s = 1, x = W / 2, y = H / 2;
    for (const sh of shots) {
      if (t < sh.at) break;
      const d = sh.dur ?? 0.7;
      const q = sh.cut || d <= 0 ? 1 : Math.min(1, (t - sh.at) / d);
      const p = q * q * (3 - 2 * q);
      s += (sh.s - s) * p;
      x += ((sh.x ?? W / 2) - x) * p;
      y += ((sh.y ?? H / 2) - y) * p;
    }
    s = Math.max(1, s * (1 + 0.01 * Math.sin(t * 0.7)));
    return { s, tx: Math.min(0, Math.max(W - W * s, W / 2 - x * s)), ty: Math.min(0, Math.max(H - H * s, H / 2 - y * s)) };
  };
  // Shot sizes on a world wrapper (background, props, text that belongs to it). Labels and source lines
  // stay outside it. shots: [{ at, s: HR.SHOT.close, x, y, dur, cut }], a frame-sized world.
  const camera = (tl, sel, shots, end) => {
    const el = typeof sel === "string" ? document.querySelector(sel) : sel;
    el.style.transformOrigin = "0 0";
    return drive(tl, 0, end ?? 600, (t) => {
      const { s, tx, ty } = camAt(t, shots);
      el.style.transform = `translate(${tx}px, ${ty}px) scale(${s})`;
    });
  };
  // A shot that frames a box in world pixels so it fills `fill` of the frame (close ≈ 0.7, medium ≈ 0.45).
  const frameOn = (box, fill = 0.45, W = 1080, H = 1920) => ({ s: Math.max(1, Math.min((W * fill) / box.w, (H * fill) / box.h)), x: box.x + box.w / 2, y: box.y + box.h / 2 });

  // Decaying shake after an impact at `start`, gone after 0.45 s.
  const shake = (tl, sel, start, amp = 14) => {
    const el = document.querySelector(sel);
    return drive(tl, start, start + 0.45, (t) => {
      const k = t - start;
      el.style.translate = `${Math.sin(k * 72) * (1 - k / 0.45) * amp}px 0`;
    });
  };
  // Squash and stretch for something that lands at `start`; back to 1 within about 0.33 s.
  const squash = (tl, sel, start) => {
    const el = document.querySelector(sel);
    return drive(tl, start, start + 0.34, (t) => {
      const k = Math.max(0, 1 - (t - start) / 0.33) * Math.cos((t - start) * 27);
      el.style.scale = `${1 + 0.25 * k} ${1 - 0.25 * k}`;
    });
  };

  // Film grain: the .hr-grain layer moves to a new offset 20 times a second (stepped, so it reads as film).
  const grain = (tl, sel, end, opacity = 0.18) => {
    const el = document.querySelector(sel);
    el.style.opacity = opacity;
    return drive(tl, 0, end, (t) => {
      const n = Math.floor(t * 20);
      el.style.transform = `translate(${((n * 37) % 64) - 32}px, ${((n * 53) % 64) - 32}px)`;
    });
  };

  // Transition set: reveals the incoming layer `sel` (above the outgoing one) from scene second `start`.
  //   circle: grows from (x, y) · flood: a colour sweeps up (o.cover: a full-bleed colour layer), then
  //   uncovers the new stage · swipe: slides in from the right · zoom: zooms through from small ·
  //   mask: a soft diagonal wipe · object: o.shape (a giant prop or slab) passes the lens right to left,
  //   the next stage already behind it. Pick a different one per scene change and log it in moves.json.
  const transition = (tl, sel, kind, start, o = {}) => {
    const dur = o.dur ?? 0.45, ease = "power2.inOut";
    const { x = 540, y = 960 } = o;
    if (kind === "circle") return tl.fromTo(sel, { clipPath: `circle(0px at ${x}px ${y}px)` }, { clipPath: `circle(2300px at ${x}px ${y}px)`, duration: dur, ease }, start);
    if (kind === "swipe") return tl.fromTo(sel, { x: 1080 }, { x: 0, duration: dur, ease }, start);
    if (kind === "zoom") return tl.fromTo(sel, { scale: 0.2, opacity: 0, borderRadius: 120 }, { scale: 1, opacity: 1, borderRadius: 0, duration: dur, ease }, start);
    if (kind === "mask") {
      const el = document.querySelector(sel);
      return drive(tl, start, start + dur, (t) => {
        const p = Math.min(1, Math.max(0, (t - start) / dur));
        const m = `linear-gradient(135deg, #000 ${p * 140 - 20}%, transparent ${p * 140}%)`;
        el.style.maskImage = m;
        el.style.webkitMaskImage = m;
      });
    }
    if (kind === "flood") {
      if (o.cover) {
        tl.fromTo(o.cover, { clipPath: "inset(100% 0 0% 0)" }, { clipPath: "inset(0% 0 0% 0)", duration: dur / 2, ease: "power2.in" }, start);
        tl.to(o.cover, { clipPath: "inset(0% 0 100% 0)", duration: dur / 2, ease: EASE }, start + dur / 2);
      }
      return tl.fromTo(sel, { clipPath: "inset(100% 0 0 0)" }, { clipPath: "inset(0% 0 0 0)", duration: dur / 2, ease: EASE }, start + dur / 2);
    }
    if (kind === "object") {
      const OW = 1500;
      if (o.shape) tl.fromTo(o.shape, { x: 1080, rotate: -8 }, { x: -OW, rotate: -8, duration: dur, ease }, start);
      return tl.fromTo(sel, { clipPath: "inset(0 0 0 100%)" }, { clipPath: "inset(0 0 0 0%)", duration: dur, ease }, start);
    }
    throw new Error(`HR.transition: unknown kind ${kind}`);
  };

  window.HR = { TIME, SHOT, EASE, SPRING, at, secs, life, word, spr, drive, camAt, camera, frameOn, shake, squash, grain, transition };
})();
