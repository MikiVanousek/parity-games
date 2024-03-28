import { showToast } from "../ui/toast";
import { assert } from "../assert";
import { Trace } from "../board/Trace";
import { ParityGame } from "../board/ParityGame";
import { example_pg } from "../board/ExamplePG";

export class PGManager {
  cy: any;
  private trace?: Trace;
  private step?: number;
  pg: ParityGame;
  colors: string[] = ["#FF0000", "#00FF00", "#0000FF", "#FFFF00", "#FF00FF", "#00FFFF", "#000000", "#FFFFFF"]


  constructor(cy: any, pg: ParityGame = example_pg) {
    this.cy = cy;
    this.pg = pg;
    cy.add(this.pg.getElementDefinition());

    let n = this.cy.getElementById("3")
    console.log(n)
    n.addClass("red")
    cy.style().update();
  }

  handleTraceFileSelect(event) {
    const files = event.target.files;
    assert(files.length === 1);
    const file = files[0];
    const reader = new FileReader();
    reader.onload = this.importTrace.bind(this);
    reader.readAsText(file);
  }

  importTrace(e) {
    const fileContent = e.target.result;
    try {
      this.trace = new Trace(JSON.parse(fileContent.toString()));
    } catch (error) {
      showToast({
        message: "This file is not a valid trace file.",
        variant: "danger", // "danger" | "warning" | "info"
      });
      console.error("Error importing trace:", error);
      return;
    }

    this.setStep(0);
  }

  setStep(i) {
    this.resetColor();
    this.step = i;
    let traceStep = this.trace.steps[i]
    for (let [i, ns] of traceStep.node_sets.entries()) {
      for (const id of ns.node_ids) {
        this.colorNode(id, this.colors[i])
      }
    }
  }
  nextStep() {
    assert(this.trace !== undefined)
    assert(this.step < this.trace.steps.length - 1)
    this.setStep(this.step + 1);
  }
  prevStep() {
    assert(this.trace !== undefined)
    assert(this.step > 0)
    this.setStep(this.step - 1);
  }

  colorNode(nodeId: number, color: string) {
    this.cy.getElementById(nodeId).data('background_color', color)
  }

  resetColor() {
    for (let pgn of this.pg.nodes) {
      delete this.cy.getElementById(pgn.id.toString()).data().background_color
    }
    this.cy.style().update();
  }
}