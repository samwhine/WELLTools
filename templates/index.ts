import { registerTemplate } from "@/lib/motion/registry";
import { textRevealTemplate } from "./text/textReveal";
import { wordPopTemplate } from "./text/wordPop";
import { wordHighlightTemplate } from "./text/wordHighlight";
import { typewriterTemplate } from "./text/typewriter";
import { numberCounterTemplate } from "./data/numberCounter";

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
  registerTemplate(numberCounterTemplate);
  registered = true;
}
