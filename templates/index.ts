import { registerTemplate } from "@/lib/motion/registry";
import { textRevealTemplate } from "./text/textReveal";
import { wordPopTemplate } from "./text/wordPop";
import { wordHighlightTemplate } from "./text/wordHighlight";
import { typewriterTemplate } from "./text/typewriter";
import { textSlamTemplate } from "./text/textSlam";
import { textShakeTemplate } from "./text/textShake";
import { textWipeTemplate } from "./text/textWipe";
import { textGlitchTemplate } from "./text/textGlitch";
import { markerHighlightTemplate } from "./text/markerHighlight";
import { textMatchCutTemplate } from "./editorial/textMatchCut";
import { animatedArrowTemplate } from "./callouts/animatedArrow";
import { circleHighlightTemplate } from "./callouts/circleHighlight";
import { numberCounterTemplate } from "./data/numberCounter";
import { progressBarTemplate } from "./data/progressBar";
import { audioVisualizerTemplate } from "./audio/audioVisualizer";

// Adding a template = write the file, import it, register it here. Nothing
// else (router, preview engine, export system, search, filters, timeline)
// needs to change (spec §75).
let registered = false;
export function registerAllTemplates() {
  if (registered) return;
  registerTemplate(textRevealTemplate);
  registerTemplate(wordPopTemplate);
  registerTemplate(wordHighlightTemplate);
  registerTemplate(typewriterTemplate);
  registerTemplate(textSlamTemplate);
  registerTemplate(textShakeTemplate);
  registerTemplate(textWipeTemplate);
  registerTemplate(textGlitchTemplate);
  registerTemplate(markerHighlightTemplate);
  registerTemplate(textMatchCutTemplate);
  registerTemplate(animatedArrowTemplate);
  registerTemplate(circleHighlightTemplate);
  registerTemplate(numberCounterTemplate);
  registerTemplate(progressBarTemplate);
  registerTemplate(audioVisualizerTemplate);
  registered = true;
}
