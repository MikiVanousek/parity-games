// Parity Game -- no information about how to visualize it
export module PG {
  export enum Player {
    Odd = 1,
    Even = 0,
  }

  export class Node {
    priority: number;
    id: number;
    player: PG.Player;
    label: string;

    constructor(priority: number, id: number, player: PG.Player) {
      this.priority = priority;
      this.id = id;
      this.player = player;
    }
  }

  export class Link {
    source: Node;
    target: Node;
  }

  export class ParityGame {
    nodes: Node[] = [];
    adjList: Map<Node, Set<Node>> = new Map();
    links: Link[] = [];
    name: string = "Parity Game";
    maxNodeId: number = 0;

    loadFromFile(fileContent: string): void {
      const lines = fileContent.split("\n");
      lines.forEach((line) => {
        if (line.trim() && line.startsWith("parity")) {
          this.name = line;
        }
        if (line.trim() && !line.startsWith("parity")) {
          const parts = line.split(" ");
          const nodeId = parseInt(parts[0]);
          const priority = parseInt(parts[1]);
          const player = parseInt(parts[2]) === 1 ? Player.Odd : Player.Even;
          const edges = parts[3]
            .split(",")
            .map((id) => parseInt(id))
            .filter((id) => !isNaN(id));

          // Add node
          const newNodeId = this.addNode(priority, player, nodeId);
          const newNode = this.nodes.find((node) => node.id === newNodeId);

          edges.forEach((targetId) => {
            const targetNode = this.nodes.find((node) => node.id === targetId);
            if (newNode && targetNode) {
              this.addLink(newNode, targetNode);
            }
          });
        }
      });
    }

    addLink(source: Node, target: Node): void {
      const link = new Link();
      link.source = source;
      link.target = target;
      this.links.push(link);

      let adjSet = this.adjList.get(source);
      if (!adjSet) {
        adjSet = new Set<Node>();
        this.adjList.set(source, adjSet);
      }
      adjSet.add(target);
    }

    addNode(priority: number, player: Player, id?: number): number {
      if (id === undefined || id <= this.maxNodeId) {
        // If no ID is provided or the provided ID is not higher than the current max
        id = this.maxNodeId + 1; // Assign the next available ID
      } else {
        this.maxNodeId = id; // Update maxNodeId if the provided ID is higher
      }

      const node = new Node(priority, id, player);
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
