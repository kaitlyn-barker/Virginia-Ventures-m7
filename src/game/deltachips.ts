// ============================================================================
// deltachips.ts  —  the little "+8 Security" chips that appear on an outcome
// beat, in each meter's color, so a student connects a choice to the score it
// moved. A panel just needs three spans with ids delta-growth / delta-security
// / delta-smarts; this fills the ones that changed and hides the rest.
// ============================================================================

import type { PanelDoc } from "./types";

export interface Deltas {
  growth?: number;
  security?: number;
  smarts?: number;
}

function chip(doc: PanelDoc, id: string, val: number | undefined, label: string) {
  const el = doc.getElementById(id);
  if (!el) return;
  if (!val) {
    el.setProperties({ display: "none" }); // no change for this meter — hide it
    return;
  }
  const sign = val > 0 ? "+" : "";
  el.setProperties({ text: sign + val + " " + label, display: "flex" });
}

export function setDeltaChips(doc: PanelDoc, d: Deltas) {
  chip(doc, "delta-growth", d.growth, "Growth");
  chip(doc, "delta-security", d.security, "Security");
  chip(doc, "delta-smarts", d.smarts, "Smarts");
}
