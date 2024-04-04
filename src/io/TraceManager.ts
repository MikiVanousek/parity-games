import { showToast } from "../ui/toast";
import { assert } from "../assert";
import { Trace } from "../board/Trace";
import { ParityGame } from "../board/ParityGame";
import { examplePg, exampleTrace } from "../board/ExamplePG";
import { deepEquals } from "./deepEquals";
import { PGParser } from "../board/PGParser";

export class TraceManager {
  cy: any;
  trace?: Trace;
  private step?: number;
  colors: string[] = ["#FF0000", "#00FF00", "#0000FF", "#FFFF00", "#FF00FF", "#00FFFF", "#000000", "#FFFFFF"]
  listElement: HTMLElement;
  controlElement: HTMLElement;
  setsEnabled?: Map<string, boolean>;
  intervalID = null;

  constructor(cy: any) {
    this.cy = cy;

    this.listElement = document.getElementById('color-legend');
    this.listElement.hidden = true;
    this.controlElement = document.getElementById('trace_controls');
    this.controlElement.hidden = true;
    this.controlElement.style.display = 'none'
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
    let t = undefined;
    try {
      t = new Trace(JSON.parse(fileContent.toString()))
    } catch (error) {
      showToast({
        message: "This file does not contain a valid trace.",
        variant: "danger", // "danger" | "warning" | "info"
      });
      console.error("Error importing trace:", error);
      return;
    }
    this.setTrace(t);
  }

  setTrace(t: Trace) {
    console.log("Setting trace", t);
    if (!t.validate()) {
      showToast({
        message: "This trace has internal discrepancies: Its steps do not fit its parity game. More detail in the console.",
        variant: "danger",
        duration: 4000,
      })
      return;
    }

    // Compare just the nodes and links, nextNodeId is irrelevant
    const pg = PGParser.cyToPg(this.cy);
    if (!t.parity_game.equals(pg)) {
      showToast({
        message: "This trace does not fit the current parity game.",
        variant: "danger",
        duration: 4000,
      })
      console.log("This trace does not fit the current parity game.");
      return;
    }

    this.trace = t;
    this.setsEnabled = new Map<string, boolean>()
    for (const setName of this.trace.uniqueSetNames()) {
      this.setsEnabled.set(setName, true);
    }

    this.listElement.hidden = false;
    this.controlElement.hidden = false;
    this.controlElement.style.display = 'flex'
    this.setStep(0);
  }

  removeTrace() {
    this.listElement.hidden = true;
    this.controlElement.hidden = true;
    this.controlElement.style.display = 'none';

    delete this.trace;
    delete this.step;
    delete this.setsEnabled;
    this.resetColor();
  }

  setStep(i) {
    assert(this.trace != undefined);

    this.step = i;
    this.listElement.innerHTML = '';
    const traceStep = this.trace.steps[i];

    traceStep.node_sets.forEach((node_set, index) => {
      const setId = Array.from(this.setsEnabled.keys()).indexOf(node_set.name)
      let color = this.colors[setId % this.colors.length]
      this.addListItem(this.listElement, node_set.name, color);
    });

    traceStep.link_sets.forEach((link_set, index) => {
      const setId = Array.from(this.setsEnabled.keys()).indexOf(link_set.name)
      let color = this.colors[setId % this.colors.length]
      this.addListItem(this.listElement, link_set.name, color);
    });

    this.refreshColor();
    this.updateTraceStepDisplay();
  }

  getStep() {
    return this.step;
  }

  refreshColor() {
    assert(this.trace !== undefined)
    this.resetColor()
    for (let [i, node_set] of this.trace.steps[this.step].node_sets.entries()) {
      const setId = Array.from(this.setsEnabled.keys()).indexOf(node_set.name)
      let color = this.colors[setId % this.colors.length]
      if (this.setsEnabled.get(node_set.name)) {
        for (const nid of node_set.node_ids) {
          this.colorNode(nid, color)
        }
      }
    }
    for (let [i, link_set] of this.trace.steps[this.step].link_sets.entries()) {
      const setId = Array.from(this.setsEnabled.keys()).indexOf(link_set.name)
      let color = this.colors[setId % this.colors.length]
      if (this.setsEnabled.get(link_set.name)) {
        for (const [source, target] of link_set.link_source_target_ids) {
          this.colorLink(source, target, color)
        }
      }
    }
  }

  nextStep() {
    assert(this.trace !== undefined)
    if (this.step < this.trace.steps.length - 1) {
      this.setStep(this.step + 1);
      this.updateTraceStepDisplay();
    } else {
      showToast({
        message: "This is the last step!",
        variant: "warning"
      })
    }
  }

  prevStep() {
    assert(this.trace !== undefined)
    if (this.step > 0) {
      this.setStep(this.step - 1);
      this.updateTraceStepDisplay();
    } else {
      showToast({
        message: "This is the first step!",
        variant: "warning"
      })
    }
  }

  colorNode(nodeId: number, color: string) {
    this.cy.getElementById(nodeId).data('background_color', color)
  }

  colorLink(source: number, target: number, color: string) {
    this.cy.getElementById(source + "," + target).data('line_color', color)
  }

  resetColor() {
    for (let n of this.cy.$("node")) {
      delete n.data().background_color
    }
    for (let l of this.cy.$("edge")) {
      delete l.data().line_color
    }
    this.cy.style().update();
  }

  goToFirstStep() {
    this.setStep(0)
  }

  goToLastStep() {
    this.setStep(this.trace.steps.length - 1)
  }

  isLastStep() {
    return this.step === this.trace.steps.length - 1;
  }

  play() {
    this.stop()

    // get the current factor
    const factor = document.getElementById('speedInput') as HTMLSelectElement;
    const speedFactor = parseFloat(factor.value);

    // if speedFactor is 0, stop the play
    if (speedFactor === 0) {
      this.stop();
      return;
    }

    // check the validity of the speedFactor
    if (isNaN(speedFactor) || speedFactor < 0) {
      showToast({
        message: "Invalid speed factor",
        variant: "danger"
      });
      return;
    }

    const interval = 2000 / speedFactor;

    this.intervalID = setInterval(() => {
      if (this.isLastStep()) {
        this.stop();
        return;
      }
      this.nextStep();
    }, interval);

  }

  stop() {
    if (this.intervalID !== null) {
      clearInterval(this.intervalID);
      this.intervalID = null; // Reset the intervalId
    }
  }

  close() {
    this.removeTrace();
  }

  addListItem(listElement, text, initialColor) {
    const listItem = document.createElement('li');
    listItem.style.display = 'flex';
    listItem.style.alignItems = 'center';

    const colorLine = document.createElement('div');
    colorLine.classList.add('color-line');
    colorLine.style.backgroundColor = initialColor; // Set initial color
    colorLine.setAttribute('data-initial-color', initialColor); // Store initial color

    // Update color toggle functionality
    colorLine.addEventListener('click', function () {
      const isTransparent = colorLine.style.backgroundColor === 'transparent' || colorLine.style.backgroundColor === '';

      // Retrieve the initial color from the custom attribute
      const storedColor = colorLine.getAttribute('data-initial-color');
      colorLine.style.backgroundColor = isTransparent ? storedColor : 'transparent';

      if (!isTransparent) {
        this.setsEnabled.set(text, false)
      } else {
        this.setsEnabled.set(text, true)
      }
      this.refreshColor()

    }.bind(this))

    listItem.appendChild(colorLine);

    const textSpan = document.createElement('span');
    textSpan.textContent = text;
    textSpan.style.marginLeft = '15px'; // Ensures padding between the color line and text
    listItem.appendChild(textSpan);

    listElement.appendChild(listItem);
  }

  hasTrace() {
    return this.trace !== undefined;
  }
  updateTraceStepDisplay() {
    const stepDisplay = document.getElementById('traceStepDisplay');
    if (stepDisplay) {
      stepDisplay.textContent = `Step: ${this.step + 1} / ${this.trace.steps.length}`;
    }
  }

  getTrace() {
    //set trace to a new trace object
    if (this.trace) {
      return this.trace;
    }
  }
}
