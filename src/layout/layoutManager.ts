import { colaLayout } from "./colaLayout";
import { randomLayout } from "./randomLayout";
import { gridLayout } from "./gridLayout";
import { breadthfirstLayout } from "./breadthfirstLayout";

class LayoutManager {
  private cy: cytoscape.Core;
  public isEnabled: boolean;
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
    this.isEnabled = false;
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
      layoutSelect.value = defaultLayout;
    });

    document
      .getElementById("layout-on-drag")
      .addEventListener("change", function () {
        this1.toggleLayout((this as HTMLInputElement).checked);
      });
  }

  public toggleLayout(bool: boolean) {
    this.isEnabled = bool;
    if (this.isEnabled) {
      this.runLayout();
    }
  }

  public changeLayout(layout: string) {
    this.currentLayout = this.layouts[layout] || this.colaLayoutOptions;
  }

  public runLayout() {
    if (this.isEnabled) {
      this.cy.layout(this.currentLayout).run();
    }
  }

  public runOnce() {
    this.cy.layout(this.currentLayout).run();
  }
}

export default LayoutManager;
