import { examplePg } from "../board/ExamplePG";
import { PGParser } from "../board/PGParser";
import { Trace } from "../board/Trace";
import { resetBoardVisuals } from "./exportImport";

export function saveState() {
  if (!window.cy) return;

  const elements = window.cy.json().elements;
  const layoutOptions = window.layoutManager.getCurrentLayoutOptions();
  const currentStepIndex = window.traceManager ? window.traceManager.getStep() : 0;
  const trace = window.traceManager ? window.traceManager.getTrace() : [];

  const zoom = window.cy.zoom();
  const pan = window.cy.pan();
  let state = {
    elements,
    layoutOptions,
    currentStepIndex,
    trace,
    zoom,
    pan,
  };

  localStorage.setItem('graphState', JSON.stringify(state));
}


export function loadState() {
  const savedState = localStorage.getItem('graphState');
  if (!savedState) {
    resetBoardVisuals(window.cy, examplePg, window.layoutManager)
    return;
  }

  const { elements, layoutOptions, currentStepIndex, trace, zoom, pan } = JSON.parse(savedState);
  window.cy.zoom(zoom);
  window.cy.pan(pan);
  if (window.cy) {
    window.cy.json({ elements }); // Restore elements
    if (trace) {
      let t = new Trace((trace));
      window.traceManager.setTrace(t);
    }

    if (window.traceManager && currentStepIndex !== undefined) {
      window.traceManager.setStep(currentStepIndex); // Restore the current step
    }
  }
}
