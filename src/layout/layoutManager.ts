import { colaLayout } from "./colaLayout";
import { randomLayout } from "./randomLayout";
import { gridLayout } from "./gridLayout";
import { breadthFirstLayout } from "./breadthfirstLayout";

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


const layoutSelect = document.getElementById("layoutSelect") as HTMLSelectElement;
layoutSelect.addEventListener('click', (e: any) => {
  window.layoutManager.changeLayout(e.target.value);
  // decheck the layout on layoutOnDragCheckbox
  const toggle = document.getElementById("layoutOnDragCheckbox") as HTMLInputElement;
  toggle.checked = false;
  window.layoutManager.setRunOnDrag(false);
});

const layoutOnDragContainer = document.getElementById("layoutOnDragContainer")

class LayoutManager {
  private cy: cytoscape.Core;
  private runOnDrag: boolean;
  private lockedGroups: Array<{ leaves: string[] }> = [];
  private groups: Group[] = [];
  public currentLayout: any;
  private layouts = [
    colaLayout,
    gridLayout,
    breadthFirstLayout,
    randomLayout,
  ];

  constructor(cyInstance: any) {
    this.cy = cyInstance;
    this.runOnDrag = false;
    this.currentLayout = colaLayout;


    // Dynamically populate the layout select dropdown
    for (const lo of this.layouts) {
      const option = document.createElement("option");
      option.value = lo.name;
      option.textContent = lo.displayName;
      layoutSelect.appendChild(option);
    }

    document
      .getElementById("layoutOnDragCheckbox")
      .addEventListener("change", function (e) {
        this.setRunOnDrag(e.target.checked);
      }.bind(this));
    document.getElementById("runLayoutBtn").addEventListener("click", () => window.ur.do("runLayout", { nodes: window.cy.nodes() }))
  }

  public setDefaultLayout() {
    this.currentLayout = colaLayout;
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
    layoutSelect.value = layoutName;
    if (layoutName == colaLayout.name) {
      console.log("showing layout on drag")
      this.showLayoutOnDragElement();
    } else {
      this.hideLayoutOnDragElement();
    }
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
    layoutOnDragContainer.style.display = "none";
  }
  private showLayoutOnDragElement() {
    console.log("showing layout on drag")
    layoutOnDragContainer.style.display = "";
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
