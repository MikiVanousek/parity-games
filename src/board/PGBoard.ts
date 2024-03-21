import { Node, Player } from './Node'
import { Link } from './Link'

export module PG {
  export class ParityGame {
    nodes: Node[] = [];
    adjList: Map<Node, Set<Node>> = new Map();
    links: Link[] = [];
    name: string = "Parity Game";
    maxNodeId: number = 0;

    emptyBoard() {
      this.nodes = [];
      this.links = [];
      this.adjList = new Map();
      this.maxNodeId = -1;
    }

    loadFromFile(fileContent: string, filename?: string): void {
      this.emptyBoard();
      const lines = fileContent.split("\n");
      let edgeData = []; // Temporary storage for edge data

      // First Pass: Create nodes
      lines.forEach((line) => {
        if (line.trim() && line.startsWith("parity")) {
          this.name = filename || line.split(' ')[1].replace(/;$/, '');
        } else if (line.trim()) {
          const parts = line.split(" ");
          const nodeId = parseInt(parts[0]);
          const priority = parseInt(parts[1]);
          const player = parseInt(parts[2]) === 1 ? Player.Odd : Player.Even;

          const labelPart = parts.slice(4).join(" ");
          const label = labelPart.substring(0, labelPart.length - 2).replace(/"/g, "");

          // Add node (assuming addNode handles duplicates gracefully or that node IDs are unique)
          this.addNode(priority, player, nodeId, label);

          // Store edge data for the second pass
          if (parts[3] !== "") {
            // Check if there are edges
            edgeData.push({
              sourceId: nodeId,
              targets: parts[3].split(",").map((id) => parseInt(id)),
            });
          }
        }
      });

      // Second Pass: Create edges
      edgeData.forEach(({ sourceId, targets }) => {
        const sourceNode = this.nodes.find((node) => node.id === sourceId);
        targets.forEach((targetId) => {
          const targetNode = this.nodes.find((node) => node.id === targetId);
          if (sourceNode && targetNode) {
            this.addLinkFromNodes(sourceNode, targetNode);
          }
        });
      });
    }

    exportToOink(): string {
      let fileContent = `parity ${this.name};\n`;

      // Write nodes in format 0 0 1 2,3 "0"; node player 0 or 1 
      this.nodes.forEach((node) => {
        fileContent += `${node.id} ${node.priority} ${node.player === Player.Even ? "0" : "1"
          } ${[...this.adjList.get(node) || []]
            .map((n) => n.id)
            .join(",")} "${node.label}";\n`;
      });

      return fileContent;
    }

    getElementDefinition() {
      const nodes = this.nodes.map((node) => node.getElementDefinition());
      const links = this.links.map((link) => link.getElementDefinition());

      return [...nodes, ...links];
    }

    addLinkFromNodes(source: Node, target: Node): void {
      this.addLink(new Link(source, target));
    }

    addLink(link: Link): void {
      this.links.push(link);

      let adjSet = this.adjList.get(link.source);
      if (!adjSet) {
        adjSet = new Set<Node>();
        this.adjList.set(link.source, adjSet);
      }
      adjSet.add(link.target);
    }

    addNode(
      priority: number,
      player: Player,
      id?: number,
      label?: string,
      degree?: number,
    ): number {
      if (id === undefined || id <= this.maxNodeId) {
        // If no ID is provided or the provided ID is not higher than the current max
        id = this.maxNodeId + 1; // Assign the next available ID
      } else {
        this.maxNodeId = id; // Update maxNodeId if the provided ID is higher
      }

      const node = new Node(priority, id, player, label);
      if (degree !== undefined) {
        node.setDegree(degree);
      }
      this.nodes.push(node);
      this.adjList.set(node, new Set());

      // Update the maxNodeId to reflect the newly added node's ID
      this.maxNodeId = Math.max(this.maxNodeId, id);

      return node.id;
    }

    // Method to remove a node
    removeNode(nodeId: number): void {
      // Remove the node from the nodes array
      this.nodes = this.nodes.filter((node) => node.id !== nodeId);

      // Remove any links from the adjacency list that involve the node
      this.adjList.forEach((targets, source) => {
        if (source.id === nodeId) {
          // Remove the entire entry if the source is the node to be removed
          this.adjList.delete(source);
        } else {
          // Remove the node from the set of targets if present
          targets.forEach((target) => {
            if (target.id === nodeId) {
              targets.delete(target);
            }
          });
        }
      });

      // Optionally, if you maintain a links array, remove links from there as well
      this.links = this.links.filter(
        (link) => link.source.id !== nodeId && link.target.id !== nodeId,
      );
    }

    // Method to remove a link
    removeLink(sourceId: number, targetId: number): void {
      // Find the source node
      const sourceNode = this.nodes.find((node) => node.id === sourceId);
      if (!sourceNode) return; // Source node not found

      // Get the set of target nodes from the adjacency list for the source node
      const targets = this.adjList.get(sourceNode);
      if (!targets) return; // No targets for source node

      // Find and remove the target node from the set of targets
      const targetNode = [...targets].find((node) => node.id === targetId);
      if (targetNode) {
        targets.delete(targetNode);
      }

      // Optionally, if you maintain a links array, remove the link from there as well
      this.links = this.links.filter(
        (link) => !(link.source.id === sourceId && link.target.id === targetId),
      );
    }

    get_id() {
      return this.maxNodeId++;
    }

    target_neighbors(n: Node): Node[] {
      return this.links.filter((l) => l.source === n).map((l) => l.target);
    }

    source_neighbors(n: Node): Node[] {
      return this.links.filter((l) => l.target === n).map((l) => l.source);
    }
  }

  export class DNode extends Node {
    x: number;
    y: number;
  }

  export class DLink extends Link {
    x: number;
    y: number;
  }

  export class PGDBoard {
    nodes: DNode[] = [];
    links: DLink[] = [];

    constructor(pg: ParityGame) {
      throw new Error("Not implemented!");
    }
  }

  export class TraceStep {
    node_sets: NodeSet[] = [];
    link_sets: LinkSet[] = [];
    node_labels: { [key: number]: string } = {};
  }

  export class NodeSet {
    name: string;
    node_ids: number[];
  }

  export class LinkSet {
    name: string;
    link_source_target_ids: [number, number][];
  }
}

