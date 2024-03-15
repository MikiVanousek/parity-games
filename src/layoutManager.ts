class LayoutManager {
  private cy: cytoscape.Core;
  public isEnabled: boolean;
  private colaLayoutOptions: any;

  constructor(cyInstance: any) {
    this.cy = cyInstance;
    this.isEnabled = true
    this.colaLayoutOptions = {
      name: "cola",
      animate: true,
      ungrabifyWhileSimulating: false,
      fit: true,
      padding: 100,
      boundingBox: undefined,
      nodeDimensionsIncludeLabels: false,
      randomize: false,
      avoidOverlap: true,
      handleDisconnected: true,
      convergenceThreshold: 0.01,
      nodeSpacing: function (node: any) {
        return 10; // Adjusted for demonstration
      },
      flow: undefined,
      alignment: undefined,
      gapInequalities: undefined,
      centerGraph: true,
      edgeLength: undefined,
      edgeSymDiffLength: undefined,
      edgeJaccardLength: undefined,
      unconstrIter: undefined,
      userConstIter: undefined,
      allConstIter: undefined,
      ready: function () {}, // on layoutready
      stop: function () {} // on layoutstop
    };
  }

  public toggleLayout() {
    this.isEnabled = !this.isEnabled;
    if (this.isEnabled) {
      this.runLayout();
    }
  }

  private runLayout() {
    if (this.isEnabled) {
      this.cy.layout(this.colaLayoutOptions).run();
    }
  }

  // Optionally, you can expose a method to run the layout directly
  public runColaLayout() {
    if (this.isEnabled) {
      this.cy.layout(this.colaLayoutOptions).run();
    }
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
