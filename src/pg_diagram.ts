// Parity Game -- no information about how to visualize it
export module PG {
  export enum Player {
    Odd,
    Even,
  }

  export class Node {
    priority: number;
    id: number;
    player: PG.Player;
  }

  export class Link {
    source: Node;
    target: Node;
  }

  export class ParityGame {
    nodes: Node[] = [];
    links: Link[] = [];
  }

  export class DNode extends Node {
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
