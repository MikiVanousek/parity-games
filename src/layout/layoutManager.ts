import { colaLayout } from "./colaLayout";
import { randomLayout } from "./randomLayout";
import { gridLayout } from "./gridLayout";
import { breadthfirstLayout } from "./breadthfirstLayout";

class LayoutManager {
  private cy: cytoscape.Core;
  private runOnDrag: boolean;
  public currentLayout: any;
  private colaLayoutOptions: any = colaLayout;
  public layouts = {
    "Force directed": colaLayout,
    "Grid layout": gridLayout,
    "Breadth first": breadthfirstLayout,
    "Random for fun": randomLayout,
  };

  constructor(cyInstance: any, defaultLayout?: string) {
    this.cy = cyInstance;
    this.runOnDrag = false;
    this.currentLayout = this.layouts[defaultLayout] || colaLayout;

    let this1 = this;
    document.addEventListener("DOMContentLoaded", function () {
      const layoutSelect = document.getElementById(
        "layout-select"
      ) as HTMLSelectElement;

      // Dynamically populate the layout select dropdown
      for (const layoutName in this1.layouts) {
        if (this1.layouts.hasOwnProperty(layoutName)) {
          const option = document.createElement("option");
          option.value = layoutName;
          option.textContent = layoutName;
          layoutSelect.appendChild(option);
        }
      }
      // This is ugly, but better than broken (Han)
      layoutSelect.value = defaultLayout || "Force directed";
    });

    document
      .getElementById("layout-on-drag")
      .addEventListener("change", function () {
        this1.setRunOnDrag((this as HTMLInputElement).checked);
      });
  }

  public setRunOnDrag(bool: boolean) {
    this.runOnDrag = bool;
    this.onDrag();
  }

  public changeLayout(layout: string) {
    this.currentLayout = this.layouts[layout] || this.colaLayoutOptions;
    if (layout == "Force directed") {
      this.showLayoutOnDragElement();
    } else {
      this.hideLayoutOnDragElement();
    }
  }

  public onDrag() {
    if (this.runOnDrag) {
      this.cy.layout(this.currentLayout).run();
    }
  }

  public runOnce() {
    this.cy.layout(this.currentLayout).run();
  }

  public getCurrentLayoutOptions() {
    return this.currentLayout;
  }

  private hideLayoutOnDragElement() {
    document.getElementById("layout-on-drag-container").style.display = "none";
  }
  private showLayoutOnDragElement() {
    document.getElementById("layout-on-drag-container").style.display = "";
  }
}

export default LayoutManager;
