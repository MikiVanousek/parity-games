import { showToast } from "../ui/toast";
import { assert } from "../assert";
import { Trace } from "../board/Trace";
import { ParityGame } from "../board/ParityGame";
import { example_pg, trace_example } from "../board/ExamplePG";

export class PGManager {
  cy: any;
  trace?: Trace;
  private step?: number;
  pg: ParityGame;
  colors: string[] = ["#FF0000", "#00FF00", "#0000FF", "#FFFF00", "#FF00FF", "#00FFFF", "#000000", "#FFFFFF"]
  listElement: HTMLElement;
  controllElement: HTMLElement;
  setsEnabled?: Map<string, boolean>;


  constructor(cy: any, pg: ParityGame = example_pg) {
    this.cy = cy;
    this.pg = pg;
    cy.add(this.pg.getElementDefinition());

    let n = this.cy.getElementById("3")
    console.log(n)
    n.addClass("red")
    cy.style().update();

    this.listElement = document.getElementById('color-legend');
    this.listElement.hidden = true;
    this.controllElement = document.getElementById('trace_controll');

    this.setTrace(trace_example);
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
      this.setTrace(new Trace(JSON.parse(fileContent.toString())));
    } catch (error) {
      showToast({
        message: "This file is not a valid trace file.",
        variant: "danger", // "danger" | "warning" | "info"
      });
      console.error("Error importing trace:", error);
      return;
    }
  }

  setTrace(t: Trace) {
    this.trace = t;
    this.setsEnabled = new Map<string, boolean>()
    for (const setName of this.trace.uniqueSetNames()) {
      this.setsEnabled.set(setName, true);
    }

    this.listElement.hidden = false;
    this.setStep(0);
  }

  setStep(i) {
    assert(this.trace != undefined);

    this.listElement.innerHTML = '';
    this.step = i;
    const traceStep = this.trace.steps[i];

    traceStep.node_sets.forEach((node_set, index) => {
    });

    // traceStep.link_sets.forEach((link, index) => {
    //   (this.listElement, link, `#4CAF50`);
    // });

    this.resetColor()
    for (let [i, node_set] of traceStep.node_sets.entries()) {
      if (this.setsEnabled.get(node_set.name)) {
        const setId = Array.from(this.setsEnabled.keys()).indexOf(node_set.name)
        let color = this.colors[setId % this.colors.length]
        this.addListItem(this.listElement, node_set.name, color);

        for (const nid of node_set.node_ids) {
          this.colorNode(nid, color)
        }
      }
    }
  }

  refresh() {
    this.setStep(this.step)
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


  goToFirstStep() {
    this.setStep(0)
  }

  goToLastStep() {
    this.setStep(this.trace.steps.length - 1)
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

      if (isTransparent) {
        this.setsEnabled.set(text, false)
      } else {
        this.setsEnabled.set(text, true)
      }

      this.refresh()

    }.bind(this));

    listItem.appendChild(colorLine);

    const textSpan = document.createElement('span');
    textSpan.textContent = text;
    textSpan.style.marginLeft = '15px'; // Ensures padding between the color line and text
    listItem.appendChild(textSpan);

    listElement.appendChild(listItem);
  }
}
