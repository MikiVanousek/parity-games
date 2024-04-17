import { showToast } from "../ui/toast";
import { assert } from "../assert";
import { Trace } from "../board/Trace";
import { PGParser } from "../board/PGParser";
import { resetBoardVisuals } from "./exportImport";
import { refreshNodeLabels } from "../ui/other";

export class TraceManager {
  cy: any;
  private trace?: Trace;
  private step?: number;
  private colors: string[] = [
    "#FF0000",
    "#00FF00",
    "#0000FF",
    "#FFFF00",
    "#FF00FF",
    "#00FFFF",
    "#000000",
    "#FFFFFF",
    "#FFA07A",
    "#20B2AA",
    "#778899",
    "#B0C4DE",
    "#FFFFE0",
    "#00FA9A",
    "#6A5ACD",
    "#FFD700",
    "#1E90FF",
    "#F08080",
    "#32CD32",
    "#8A2BE2",
    "#FF4500",
    "#2E8B57",
    "#DAA520",
    "#98FB98",
  ];
  private listElement: HTMLElement;
  private controlElement: HTMLElement;
  private setsEnabled?: Map<string, boolean>;
  private intervalID = null;
  private playStopButton: HTMLElement;
  private playStopIcon: Element;
  private stepSlider: HTMLInputElement;

  constructor(cy: any) {
    this.cy = cy;

    this.listElement = document.getElementById("color-legend");
    this.listElement.parentElement.hidden = true;
    this.controlElement = document.getElementById("trace_controls");
    this.controlElement.hidden = true;
    this.controlElement.style.display = "none";

    this.playStopButton = document.getElementById("playAction");
    this.playStopIcon = document.getElementById("playAction").children[0];
    this.playStopButton.dataset.playing = "false";
    this.playStopIcon.classList.add("fa-play");
    this.playStopButton.addEventListener("click", this.togglePlay.bind(this));
    this.stepSlider = document.getElementById(
      "traceSlider"
    ) as HTMLInputElement;
    this.stepSlider.addEventListener("input", (e) => {
      this.setStep(parseInt(this.stepSlider.value));
    });

    document
      .getElementById("nextStepAction")
      .addEventListener("click", this.nextStep.bind(this));
    document
      .getElementById("lastStepAction")
      .addEventListener("click", this.prevStep.bind(this));
    document
      .getElementById("skipToBeginningAction")
      .addEventListener("click", this.goToFirstStep.bind(this));
    document
      .getElementById("skipToEndAction")
      .addEventListener("click", this.goToLastStep.bind(this));
    document
      .getElementById("closeButton")
      .addEventListener("click", this.removeTrace.bind(this));

    const fileInput = document.getElementById("fileInput");
    fileInput.addEventListener("change", (e) => {
      console.log("fileInput changed");

      const target = e.target as HTMLInputElement;
      window.traceManager.handleTraceFileSelect(e);

      // Reset the file input value
      if (target && target.value) {
        target.value = '';
      }

    });

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
      t = new Trace(JSON.parse(fileContent.toString()));
    } catch (error) {
      showToast({
        message: "This file does not contain a valid trace.",
        variant: "danger",
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
        message:
          "This trace has internal discrepancies: Its steps do not fit its parity game. More detail in the console.",
        variant: "danger",
        duration: 4000,
      });
      return;
    }

    // Compare just the nodes and links, nextNodeId is irrelevant
    const pg = PGParser.cyToPg(this.cy);
    if (!t.parity_game.sameAs(pg)) {
      console.log("This trace does not fit the current parity game.");
      const conf = window.confirm(
        "The trace you are importing was not made for the parity game you are editing. Should we replace your parity game? Unsaved changes will be lost!"
      );
      if (!conf) {
        return;
      }
      resetBoardVisuals(this.cy, t.parity_game, window.layoutManager);
    }

    this.trace = t;
    this.setsEnabled = new Map<string, boolean>();
    for (const setName of this.trace.uniqueSetNames()) {
      this.setsEnabled.set(setName, true);
    }

    this.listElement.parentElement.hidden = false;
    this.controlElement.hidden = false;
    this.controlElement.style.display = "flex";
    this.stepSlider.setAttribute(
      "max",
      (this.trace.steps.length - 1).toString()
    );
    this.setStep(0);
  }

  removeTrace() {
    this.listElement.parentElement.hidden = true;
    this.controlElement.hidden = true;
    this.controlElement.style.display = "none";

    delete this.trace;
    delete this.step;
    delete this.setsEnabled;
    this.resetColor();

    for (const n of this.cy.nodes()) {
      if (!n.isParent()) {
        n.data("traceLabel", "");
      }
    }
    refreshNodeLabels();
  }

  setStep(i) {
    assert(this.trace != undefined);

    this.step = i;
    this.stepSlider.value = i.toString();
    this.listElement.innerHTML = "";
    const traceStep = this.trace.steps[i];

    traceStep.node_sets.forEach((node_set, index) => {
      const setId = Array.from(this.setsEnabled.keys()).indexOf(node_set.name);
      const color = this.colors[setId % this.colors.length];
      this.addListItem(this.listElement, node_set.name, color);
    });

    traceStep.link_sets.forEach((link_set, index) => {
      const setId = Array.from(this.setsEnabled.keys()).indexOf(link_set.name);
      const color = this.colors[setId % this.colors.length];
      this.addListItem(this.listElement, link_set.name, color);
    });
    for (const n of this.cy.nodes()) {
      if (n.isParent()) {
        continue;
      }
      const traceLabel = traceStep.node_labels[parseInt(n.id())];
      if (traceLabel) {
        n.data("traceLabel", traceStep.node_labels[parseInt(n.id())]);
      } else {
        n.data("traceLabel", "");
      }
    }
    refreshNodeLabels();

    this.refreshColor();
  }

  getStep() {
    return this.step;
  }

  refreshColor() {
    assert(this.trace !== undefined);
    this.resetColor();
    for (const node_set of this.trace.steps[this.step].node_sets) {
      const setId = Array.from(this.setsEnabled.keys()).indexOf(node_set.name);
      const color = this.colors[setId % this.colors.length];
      if (this.setsEnabled.get(node_set.name)) {
        for (const nid of node_set.node_ids) {
          this.colorNode(nid, color);
        }
      }
    }
    for (const link_set of this.trace.steps[this.step].link_sets) {
      const setId = Array.from(this.setsEnabled.keys()).indexOf(link_set.name);
      const color = this.colors[setId % this.colors.length];
      if (this.setsEnabled.get(link_set.name)) {
        for (const [source, target] of link_set.link_source_target_ids) {
          this.colorLink(source, target, color);
        }
      }
    }
  }

  nextStep() {
    assert(this.trace !== undefined);
    if (this.step < this.trace.steps.length - 1) {
      this.setStep(this.step + 1);
    } else {
      showToast({
        message: "This is the last step!",
        variant: "warning",
      });
    }
  }

  prevStep() {
    assert(this.trace !== undefined);
    if (this.step > 0) {
      this.setStep(this.step - 1);
    } else {
      showToast({
        message: "This is the first step!",
        variant: "warning",
      });
    }
  }

  colorNode(nodeId: number, color: string) {
    this.cy.getElementById(nodeId).data("background_color", color);
  }

  colorLink(source: number, target: number, color: string) {
    this.cy.getElementById(source + "," + target).data("line_color", color);
  }

  resetColor() {
    for (const n of this.cy.$("node")) {
      delete n.data().background_color;
    }
    for (const l of this.cy.$("edge")) {
      delete l.data().line_color;
    }
    this.cy.style().update();
  }

  goToFirstStep() {
    this.setStep(0);
  }

  goToLastStep() {
    this.setStep(this.trace.steps.length - 1);
  }

  isLastStep() {
    return this.step === this.trace.steps.length - 1;
  }

  play() {
    this.playStopButton.dataset.playing = "true";
    this.playStopIcon.classList.remove("fa-play");
    this.playStopIcon.classList.add("fa-pause");

    // get the current factor
    const factor = document.getElementById("speedInput") as HTMLSelectElement;
    const speedFactor = parseFloat(factor.value);

    // if speedFactor is 0, stop the play
    // check the validity of the speedFactor

    const interval = 800 / speedFactor;

    this.intervalID = setInterval(() => {
      if (this.isLastStep()) {
        this.stop();
        return;
      }
      this.nextStep();
    }, interval);
  }
  togglePlay() {
    const isPlaying = this.playStopButton.dataset.playing === "true";

    if (!isPlaying) {
      const factor = document.getElementById("speedInput") as HTMLSelectElement;
      const speedFactor = parseFloat(factor.value);
      // if speedFactor is 0, stop the play
      if (speedFactor === 0) {
        showToast({
          message: "Speed factor cannot be 0",
          variant: "danger",
        });
        return;
      }
      if (isNaN(speedFactor) || speedFactor < 0) {
        showToast({
          message: "Invalid speed factor",
          variant: "danger",
        });
        return;
      }

      // If not playing, start play
      this.play(); // Call the play method
    } else {
      this.stop();
    }
  }

  stop() {
    this.playStopButton.dataset.playing = "false";
    this.playStopIcon.classList.remove("fa-stop");
    this.playStopIcon.classList.add("fa-play");
    if (this.intervalID !== null) {
      clearInterval(this.intervalID);
      this.intervalID = null; // Reset the intervalId
    }
  }

  addListItem(listElement, text, initialColor) {
    const listItem = document.createElement("li");
    listItem.style.display = "flex";
    listItem.style.alignItems = "center";

    const colorLine = document.createElement("div");
    colorLine.classList.add("color-line");
    colorLine.style.backgroundColor = initialColor; // Set initial color
    colorLine.style.borderColor = initialColor; // Set initial color
    colorLine.setAttribute("data-initial-color", initialColor); // Store initial color
    colorLine.style.backgroundColor = this.setsEnabled.get(text)
      ? initialColor
      : "transparent";

    // Update color toggle functionality
    colorLine.addEventListener(
      "click",
      function () {
        const isTransparent =
          colorLine.style.backgroundColor === "transparent" ||
          colorLine.style.backgroundColor === "";

        // Retrieve the initial color from the custom attribute
        const storedColor = colorLine.getAttribute("data-initial-color");
        colorLine.style.backgroundColor = isTransparent
          ? storedColor
          : "transparent";

        if (!isTransparent) {
          this.setsEnabled.set(text, false);
        } else {
          this.setsEnabled.set(text, true);
        }
        this.refreshColor();
      }.bind(this)
    );

    listItem.appendChild(colorLine);

    const textSpan = document.createElement("span");
    textSpan.textContent = text;
    textSpan.style.marginLeft = "15px"; // Ensures padding between the color line and text
    listItem.appendChild(textSpan);

    listElement.appendChild(listItem);
  }

  hasTrace() {
    return this.trace !== undefined;
  }

  getTrace() {
    //set trace to a new trace object
    if (this.trace) {
      return this.trace;
    }
  }
}
