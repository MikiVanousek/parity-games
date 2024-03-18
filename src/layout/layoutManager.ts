import { colaLayout } from "./colaLayout";
import { randomLayout } from "./randomLayout";

class LayoutManager {
  private cy: cytoscape.Core;
  public isEnabled: boolean;
  public currentLayout: string;
  private colaLayoutOptions: any;
  private randomLayoutOptions: any;

  constructor(cyInstance: any) {
    this.cy = cyInstance;
    this.isEnabled = true
    this.currentLayout = "cola"
    this.colaLayoutOptions = colaLayout
    this.randomLayoutOptions = randomLayout
  }

  public toggleLayout() {
    this.isEnabled = !this.isEnabled;
    if (this.isEnabled) {
      this.runLayout();
    }
  }

  public changeLayout(layout: string) {
    this.currentLayout = layout;
  }

  public runLayout() {
    if (this.isEnabled) {
      switch (this.currentLayout) {
        case "cola":
          this.runColaLayout();
          break;
        case "random":
          this.runRandomLayout();
          break;
        default:
          this.runColaLayout();
      }
    }
  }

  public runOnce() {
    switch (this.currentLayout) {
      case "cola":
        this.runColaLayout();
        break;
      case "random":
        this.runRandomLayout();
        break;
      default:
        this.runColaLayout();
    }
  }

  // Optionally, you can expose a method to run the layout directly
  public runColaLayout() {
    this.cy.layout(this.colaLayoutOptions).run();
  }

  public runRandomLayout() {
    this.cy.layout(this.randomLayoutOptions).run();
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
