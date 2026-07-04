// ============================================================================
// phase.ts  —  the master flow (Setup -> Stage 1 -> 2 -> 3 -> Report).
// showPhase sets the running money for the stage that is starting, updates the
// HUD stage label, and shows the one panel registered for that phase while
// hiding the rest. Stages call showPhase(...) as the player finishes each one.
// ============================================================================

import {
  beginStageRecord,
  changeMoney,
  ECON,
  getMoney,
  getScores,
  setMoney,
  setPhase,
} from "./state";
import { hideMoneyRow, setHudStage } from "./hud";
import type { PanelEntity, Phase } from "./types";

// The label shown for each stage on the report's money timeline.
const STAGE_TITLES: Record<number, string> = {
  1: "Growing Up",
  2: "First Paycheck",
  3: "The Big Decision",
};

// Panels that a phase owns outright (Setup's picker, the Report). Stage panels
// are gated by proximity instead, so they are not registered here.
const phasePanels: Partial<Record<Phase, PanelEntity>> = {};

export function registerPhasePanel(phase: Phase, panel: PanelEntity) {
  phasePanels[phase] = panel;
}

export function showPhase(phase: Phase) {
  setPhase(phase);
  setHudStage(phase);

  // The money now CARRIES across stages instead of resetting, so students see
  // their choices add up. Each stage brings new income; a spender who arrives
  // with less genuinely has less to work with.
  if (phase === "setup") {
    setMoney(ECON.STARTING_MONEY); // birthday money — the only hard reset
  } else if (phase === "stage1") {
    // The first week's allowance lands on top of the birthday money. Stage 1's
    // own multi-week loop adds the remaining weeks.
    changeMoney(ECON.ALLOWANCE_PER_WEEK);
    beginStageRecord(1, STAGE_TITLES[1], getMoney());
  } else if (phase === "stage2") {
    changeMoney(ECON.PAYCHECK_STAGE2); // your first paycheck, added to savings
    beginStageRecord(2, STAGE_TITLES[2], getMoney());
  } else if (phase === "stage3") {
    // Years pass. The money you kept safe earned interest and grew — the safer
    // you played (higher Security), the bigger the "years of saving" bonus.
    const carried = getMoney();
    const bonus = Math.round((carried * getScores().security) / 200); // 0..50%
    if (bonus > 0) changeMoney(bonus);
    beginStageRecord(3, STAGE_TITLES[3], getMoney());
  } else {
    hideMoneyRow();
  }

  for (const key in phasePanels) {
    const panel = phasePanels[key as Phase];
    if (panel && panel.object3D) panel.object3D.visible = false;
  }
  const active = phasePanels[phase];
  if (active && active.object3D) active.object3D.visible = true;
  console.log("[PHASE] now in " + phase);
}
