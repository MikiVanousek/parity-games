import { colaLayout } from "./colaLayout";
import { randomLayout } from "./randomLayout";
import { gridLayout } from "./gridLayout";

class LayoutManager {
  private cy: cytoscape.Core;
  public isEnabled: boolean;
  public currentLayout: any;
  private colaLayoutOptions: any = colaLayout;
  public layouts = {
    "Force directed": colaLayout,
    "Random layout": randomLayout,
    "Grid layout": gridLayout
  }

  constructor(cyInstance: any, defaultLayout?: string) {
    this.cy = cyInstance;
    this.isEnabled = false
    this.currentLayout = this.layouts[defaultLayout] || colaLayout
  }

  public toggleLayout() {
    this.isEnabled = !this.isEnabled;
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

  // Method to enable the layout
  public enableLayout() {
    this.isEnabled = true;
  }

  // Method to disable the layout
  public disableLayout() {
    this.isEnabled = false;
  }
}

export default LayoutManager;
