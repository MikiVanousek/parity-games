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
  private runOnDrag: boolean;
  private lockedGroups: Array<{ leaves: string[] }> = [];
  private groups: Group[] = [];
  public currentLayout: any;
  private colaLayoutOptions: any = colaLayout;
  // private layoutNames = {
  //   "Force directed": colaLayout,
  //   "Grid layout": gridLayout,
  //   "Breadth first": breadthfirstLayout,
  //   "Random for fun": randomLayout,
  // };
  private layouts = [
    colaLayout,
    gridLayout,
    breadthfirstLayout,
    randomLayout,
  ];

  constructor(cyInstance: any) {
    this.cy = cyInstance;
    this.runOnDrag = false;
    this.currentLayout = colaLayout;

    const layoutSelect = document.getElementById(
      "layout-select"
    ) as HTMLSelectElement;

    // Dynamically populate the layout select dropdown
    for (const layout in this.layouts) {
      const option = document.createElement("option");
      option.value = layout.name;
      option.textContent = layout.name;
      layoutSelect.appendChild(option);
    }

    document
      .getElementById("layout-on-drag")
      .addEventListener("change", function (e) {
        this.setRunOnDrag(e.target.checked);
      }.bind(this));
  }

  public setRunOnDrag(bool: boolean) {
    this.runOnDrag = bool;
    this.onDrag();
  }

  public changeLayout(layoutName: string) {
    const candidate = this.layouts.find((i) => i.name == layoutName)
    if (!candidate) {
      console.error(`Layout ${layoutName} not found`);
      return
    }
    this.currentLayout = candidate
    if (layoutName == "Force directed") {
      this.showLayoutOnDragElement();
    } else {
      this.hideLayoutOnDragElement();
    }
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

  public onDrag() {
    if (this.runOnDrag) {
      this.runOnce();
    }
  }

  public runOnce() {

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
    return this.currentLayout.name;
  }

  private hideLayoutOnDragElement() {
    document.getElementById("layout-on-drag-container").style.display = "none";
  }
  private showLayoutOnDragElement() {
    document.getElementById("layout-on-drag-container").style.display = "";
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
    const children = groupNode.children();
    children.move({ parent: null });
    groupNode.remove();

    // remove from groups
    this.groups = this.groups.filter((group) => group.id !== groupId);
    return children;
  }
}

export default LayoutManager;
