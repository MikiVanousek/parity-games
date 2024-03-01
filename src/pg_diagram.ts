// Parity Game -- no information about how to visualize it
export module PG {
    export enum Player {
        Odd = 1, Even = 0
    }

    export class Node {
        priority: number
        index: number // The index of this node in ParityGame.nodes
        player: PG.Player
        label: string
    }

    export class Link {
        source: Node
        target: Node
    }

    export class ParityGame {
        nodes: Node[] = []
        links: Link[] = []

        target_neighbors(n: Node): Node[] {
            return this.links.filter((l) => l.source === n).map((l) => l.target)
        }

        source_neighbors(n: Node): Node[] {
            return this.links.filter((l) => l.target === n).map((l) => l.source)
        }
    }


    export class DNode extends Node {
        x: number
        y: number
    }

    export class DLink extends Link {
    }

    export class PGDBoard {
        nodes: DNode[] = []
        links: DLink[] = []

        constructor(pg: ParityGame) {
            throw new Error("Not implemented!")
        }
    }

    export class Trace {
        steps: TraceStep[] = []
    }

    export class TraceStep {
        node_sets: NodeSet[] = []
        link_sets: LinkSet[] = []
        node_labels: { [key: number]: string } = {}
    }

    export class NodeSet {
        name: string
        node_ids: number[]
    }

    export class LinkSet {
        name: string
        link_source_target_ids: [number, number][]
    }
}
