import { examplePg } from "../board/ExamplePG";
import { PGParser } from "../board/PGParser";
import { Trace } from "../board/Trace";
import { getPGName, setPGName } from "../ui/PGNameEditing";
import { resetBoardVisuals } from "./exportImport";
import { set, get } from "idb-keyval";

export function saveState() {
  if (!window.cy) return;

  const elements = window.cy.json().elements;
  const layoutOptions = window.layoutManager.getCurrentLayoutOptions();
  const currentStepIndex = window.traceManager
    ? window.traceManager.getStep()
    : 0;
  const trace = window.traceManager ? window.traceManager.getTrace() : [];
  const pgName = getPGName();

  const zoom = window.cy.zoom();
  const pan = window.cy.pan();
  let state = {
    elements,
    layoutOptions,
    currentStepIndex,
    trace,
    zoom,
    pan,
    pgName,
  };

  localStorage.setItem("graphState", JSON.stringify(state));
  set("graphState", JSON.stringify(state));
}

export async function loadState() {
  let savedState = localStorage.getItem("graphState");
  if (!savedState) {
    savedState = await get("graphState");
  }
  if (!savedState) {
    resetBoardVisuals(window.cy, examplePg, window.layoutManager);
    return;
  }

  const {
    elements,
    layoutOptions,
    currentStepIndex,
    trace,
    zoom,
    pan,
    pgName,
  } = JSON.parse(savedState);
  window.cy.zoom(zoom);
  window.cy.pan(pan);

  // set the name of the parity game in the window object
  setPGName(pgName);

  if (window.cy) {
    window.cy.json({ elements }); // Restore elements
    if (trace) {
      let t = new Trace(trace);
      window.traceManager.setTrace(t);
    }

    if (window.traceManager && currentStepIndex !== undefined) {
      window.traceManager.setStep(currentStepIndex); // Restore the current step
    }
  }
}
