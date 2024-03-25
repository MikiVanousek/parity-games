import { Node, Player } from './Node'
import { Link } from './Link'
import { JSONObject } from 'ts-json-object'

export module PG {
  export class ParityGame extends JSONObject {
    @JSONObject.required
    nodes: Node[];
    @JSONObject.required
    links: Link[];
    @JSONObject.required
    name: string;
    @JSONObject.required
    private next_node_id: number;

    // This is not serialized
    @JSONObject.custom((pg: ParityGame, key: string, value: number) => {
      let res = new Map<Node, Set<Node>>();
      pg.nodes.forEach((n) => res.set(n, new Set<Node>()));
      pg.links.forEach((l) => {
        res.get(l.source).add(l.target);
      });
      return res;
    })
    adjList: Map<Node, Set<Node>>;

    constructor(json?: any) {
      super(json)

      // It is impossible (and unnecessary) to serialize the adjList. Instead we build it afterwards.
    }

    static emptyBoard(): ParityGame {

      return new ParityGame({ nodes: [], adjList: new Map<Node, Set<Node>>(), links: [], name: "New Parity Game", next_node_id: 0 });
    }

    addLinkFromNodes(source: Node, target: Node): void {
      this.addLink(new Link({ source, target }));
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
      if (id === undefined || id <= this.next_node_id) {
        // If no ID is provided or the provided ID is not higher than the current max
        id = this.next_node_id + 1; // Assign the next available ID
      } else {
        this.next_node_id = id; // Update maxNodeId if the provided ID is higher
      }

      const node = new Node({ priority: priority, id: id, player: player, label: label });
      if (degree !== undefined) {
        node.setDegree(degree);
      }
      this.nodes.push(node);
      this.adjList.set(node, new Set());

      // Update the maxNodeId to reflect the newly added node's ID
      this.next_node_id = Math.max(this.next_node_id, id);

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
      return this.next_node_id++;
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