import { colaLayout } from "./colaLayout";
import { randomLayout } from "./randomLayout";

class LayoutManager {
  private cy: cytoscape.Core;
  public isEnabled: boolean;
  private colaLayoutOptions: any;

  constructor(cyInstance: any) {
    this.cy = cyInstance;
    this.isEnabled = true
    this.colaLayoutOptions = colaLayout
  }

  public toggleLayout() {
    this.isEnabled = !this.isEnabled;
    if (this.isEnabled) {
      this.runLayout();
    }
  }

  public runLayout() {
    if (this.isEnabled) {
      this.cy.layout(this.colaLayoutOptions).run();
    }
  }

  // Optionally, you can expose a method to run the layout directly
  public runColaLayout() {
    this.cy.layout(this.colaLayoutOptions).run();
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
