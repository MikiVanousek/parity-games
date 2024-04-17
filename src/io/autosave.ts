import { examplePg } from "../board/ExamplePG";
import { Trace } from "../board/Trace";
import { getPGName, setPGName } from "../ui/PGNameEditing";
import { resetBoardVisuals } from "./exportImport";

export function saveState() {
  if (!window.cy) return;

  const elements = window.cy.json().elements;
  const layoutName = window.layoutManager.getCurrentLayoutOptions();
  const currentStepIndex = window.traceManager ? window.traceManager.getStep() : 0;
  const trace = window.traceManager ? window.traceManager.getTrace() : [];
  const pgName = getPGName();

  const zoom = window.cy.zoom();
  const pan = window.cy.pan();
  const state = {
    elements,
    layoutName,
    currentStepIndex,
    trace,
    zoom,
    pan,
    pgName,
  };

  localStorage.setItem('graphState', JSON.stringify(state));
}


export function loadState() {
  const savedState = localStorage.getItem('graphState');
  if (!savedState) {
    resetBoardVisuals(window.cy, examplePg, window.layoutManager)
    return;
  }

  const { elements, layoutName, currentStepIndex, trace, zoom, pan, pgName } = JSON.parse(savedState);
  window.cy.zoom(zoom);
  window.cy.pan(pan);

  window.layoutManager.changeLayout(layoutName)
  setPGName(pgName);


  if (window.cy) {
    window.cy.json({ elements }); // Restore elements
    if (trace) {
      const t = new Trace((trace));
      window.traceManager.setTrace(t);
    }

    if (window.traceManager && currentStepIndex !== undefined) {
      window.traceManager.setStep(currentStepIndex); // Restore the current step
    }
  }
}
