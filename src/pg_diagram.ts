import { number } from "yargs";

// Parity Game -- no information about how to visualize it
export module PG {
  export enum Player {
    Odd,
    Even,
  }

  export class NodeA {
    priority: number;
    id: number;
    player: PG.Player;

    constructor(priority: number, id: number, player: PG.Player) {
      this.priority = priority;
      this.id = id;
      this.player = player;
    }
  }

  export class Link {
    source: NodeA;
    target: NodeA;
  }

  export class ParityGame {
    nodes: NodeA[] = [];
    adjList: Map<NodeA, Set<NodeA>> = new Map();
    links: Link[] = [];
    auto_id: number = 0;

    addNode(priority: number, player: Player): number {
      var node = new NodeA(priority, this.auto_id, player);
      this.nodes.push(node);
      this.adjList.set(node, new Set());
      this.auto_id++;
      return node.id;
    }
  }

  export class DNode extends NodeA {
    x: number;
    y: number;
  }

  export class DLink extends Link {}

  export class PGDBoard {
    nodes: DNode[] = [];
    links: DLink[] = [];
  }

  export class Trace {
    steps: TraceStep[] = [];
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
