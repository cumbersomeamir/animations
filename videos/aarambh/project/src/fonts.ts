import "@fontsource/inter/latin-500.css";
import "@fontsource/inter/latin-600.css";
import "@fontsource/inter/latin-700.css";
import "@fontsource/inter/latin-800.css";
import "@fontsource/fraunces/latin-600.css";
import "@fontsource/fraunces/latin-700.css";
import { continueRender, delayRender } from "remotion";

// Block rendering until every face used in the film is loaded (no fallback-font frames).
const handle = delayRender("fonts");
const faces = [
  "500 40px Inter",
  "600 40px Inter",
  "700 40px Inter",
  "800 40px Inter",
  "600 40px Fraunces",
  "700 40px Fraunces",
];
Promise.all(faces.map((f) => document.fonts.load(f)))
  .then(() => document.fonts.ready)
  .then(() => continueRender(handle))
  .catch((e) => {
    console.error(e);
    continueRender(handle);
  });
