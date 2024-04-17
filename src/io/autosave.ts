import { examplePg } from "../board/exampleParityGame";
import { Trace } from "../board/Trace";
import { getPGName, setPGName } from "../ui/pgNameEditing";
import { renderLabelsAndPriorities } from "../undo-redo/urActionSetup";
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
    resetBoardVisuals(examplePg)
    return;
  }

  const { elements, layoutName, currentStepIndex, trace, zoom, pan, pgName } = JSON.parse(savedState);
  window.cy.zoom(zoom);
  window.cy.pan(pan);

  window.layoutManager.changeLayout(layoutName)
  console.log('layoutName', layoutName)
  setPGName(pgName);


  window.cy.json({ elements }); // Restore elements
  if (trace) {
    const t = new Trace((trace));
    window.traceManager.setTrace(t);
  }

  if (window.traceManager && currentStepIndex !== undefined) {
    window.traceManager.setStep(currentStepIndex); // Restore the current step
  }
  renderLabelsAndPriorities();
}
