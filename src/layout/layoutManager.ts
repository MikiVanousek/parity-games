import { colaLayout } from "./colaLayout";
import { randomLayout } from "./randomLayout";
import { gridLayout } from "./gridLayout";
import { breadthfirstLayout } from "./breadthfirstLayout";

// a class representing a group (subgraoh) of nodes, to manage its state and behavior
class Group {
  public id: string;
  public nodes: cytoscape.NodeCollection;
  public locked: boolean;

  constructor(id: string, nodes: cytoscape.NodeCollection) {
    this.id = id;
    this.nodes = nodes;
    this.locked = false;
  }

  public lock() {
    this.locked = true;
  }

  public unlock() {
    this.locked = false;
  }
}

class LayoutManager {
  private cy: cytoscape.Core;
  private lockedGroups: Array<{ leaves: string[] }> = [];
  private groups: Group[] = [];
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

  private calculateBoundingBoxConstraints() {
    const constraints = [];

    this.lockedGroups.forEach((group) => {
      const positions = group.leaves.map((id) =>
        this.cy.getElementById(id).renderedPosition()
      );
      // Calculate the bounding box of the group
      const minX = Math.min(...positions.map((pos) => pos.x));
      const maxX = Math.max(...positions.map((pos) => pos.x));
      const minY = Math.min(...positions.map((pos) => pos.y));
      const maxY = Math.max(...positions.map((pos) => pos.y));

      const padding = 10;

      constraints.push(
        {
          left: minX - padding,
          right: maxX + padding,
          top: minY - padding,
          bottom: maxY + padding,
          type: "alignment",
          axis: "x",
          offsets: group.leaves.map((id) => ({ node: id, offset: 0 })),
        },
        {
          left: minX - padding,
          right: maxX + padding,
          top: minY - padding,
          bottom: maxY + padding,
          type: "alignment",
          axis: "y",
          offsets: group.leaves.map((id) => ({ node: id, offset: 0 })),
        }
      );
    });

    return constraints;
  }

  public runLayout() {
    if (this.isEnabled) {
      this.runOnce();
    }
  }

  public runOnce() {
    // this.cy.layout(this.currentLayout).run();
    const boundingBoxConstraints = this.calculateBoundingBoxConstraints();

    // lock the nodes in the groups to keep their positions
    this.groups.forEach((group) => {
      group.nodes.forEach((node) => {
        node.lock();
      });
    });

    const layout = this.cy.makeLayout({
      ...this.currentLayout,
      constraints: this.groups.flatMap((group) =>
        group.nodes.map((node) => ({
          type: "position",
          node: node.id(),
          position: node.position(), // Keep the current position
        }))
      ),
    });
    layout.run();

    // unlock the nodes in the groups
    this.groups.forEach((group) => {
      group.nodes.forEach((node) => {
        node.unlock();
      });
    });
  }

  public getCurrentLayoutOptions() {
    return this.currentLayout;
  }

  public groupNodes(nodes: cytoscape.NodeCollection) {
    const groupId = `group_${+new Date()}`; // Example unique ID using timestamp

    this.cy.add({
      group: "nodes",
      data: { id: groupId, label: "" },
    });

    // Set the parent attribute of the nodes to the new group ID
    nodes.forEach((node) => {
      node.move({ parent: groupId });
      node.ungrabify();
    });

    this.groups.push(new Group(groupId, nodes));
    return groupId;
  }

  public ungroupNodes(groupId: string) {
    const groupNode = this.cy.getElementById(groupId);
    this.cy
      .nodes()
      .filter((node) => node.parent() === groupNode)
      .grabify();
    let children = groupNode.children();
    children.move({ parent: null });
    groupNode.remove();

    // remove from groups
    this.groups = this.groups.filter((group) => group.id !== groupId);
    return children;
  }
}

export default LayoutManager;
