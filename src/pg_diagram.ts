import { number } from "yargs";

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
            this.priority = priority
            this.id = id
            this.player = player
        }
    }

    export class Link {
        source: Node;
        target: Node;
    }

    export class ParityGame {
        nodes: Node[] = [];
        adjList: Map<Node, Set<Node>> = new Map()
        links: Link[] = [];
        auto_id: number = 0

        addNode(priority: number, player: Player): number {
            var node = new Node(priority, this.get_id(), player)
            this.nodes.push(node)
            this.adjList.set(node, new Set())
            return node.id
        }

        get_id() {
            return this.auto_id++
        }

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
        x: number
        y: number
    }


    export class PGDBoard {
        nodes: DNode[] = []
        links: DLink[] = []

        constructor(pg: ParityGame) {
            throw new Error("Not implemented!")
        }
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
