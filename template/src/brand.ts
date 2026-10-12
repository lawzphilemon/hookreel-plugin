import { getAvailableFonts } from "@remotion/google-fonts";
import { continueRender, delayRender, Easing } from "remotion";
import brandJson from "../brand.json";
import type { Brand } from "./schema";

// Everything visual comes from brand.json, written by /hookreel:build from the context profile.
export const BRAND = brandJson as Brand;
export const C = BRAND.colors;
export const RADIUS = { card: BRAND.radius?.card ?? 28, pill: BRAND.radius?.pill ?? 999 };

export const FPS = 30;
export const ENTER = Math.round(((BRAND.motion?.entranceMs ?? 360) / 1000) * FPS);
export const easeOut = Easing.bezier(0.16, 1, 0.3, 1);

export const sans = `"${BRAND.fonts.sans}", sans-serif`;
export const mono = `"${BRAND.fonts.mono}", monospace`;

// Load the brand's Google Fonts by name, holding the render until they are ready.
const WEIGHTS = ["400", "500", "600", "700", "800"];
const loadGoogleFont = (family: string) => {
  const entry = getAvailableFonts().find((f) => f.fontFamily === family);
  if (!entry) {
    console.warn(`Font "${family}" is not on Google Fonts; falling back to the system font.`);
    return;
  }
  const handle = delayRender(`Loading font ${family}`);
  entry
    .load()
    .then((font) => {
      const available = Object.keys(font.getInfo().fonts.normal ?? {});
      const weights = WEIGHTS.filter((w) => available.includes(w));
      return font.loadFont("normal", { weights: weights.length ? weights : undefined, subsets: ["latin"] }).waitUntilDone();
    })
    .then(() => continueRender(handle))
    .catch((err) => {
      console.warn(`Could not load font ${family}`, err);
      continueRender(handle);
    });
};

loadGoogleFont(BRAND.fonts.sans);
if (BRAND.fonts.mono !== BRAND.fonts.sans) loadGoogleFont(BRAND.fonts.mono);

// Logo recolouring for one-colour logos.
export const logoFilter =
  BRAND.logoTreatment === "white"
    ? "brightness(0) invert(1)"
    : BRAND.logoTreatment === "black"
      ? "brightness(0)"
      : undefined;
