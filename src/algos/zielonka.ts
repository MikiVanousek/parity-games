export type NodeS = string;
export type Priority = number;
export interface GameGraph {
  edges: Map<NodeS, NodeS[]>;
  priorities: Map<NodeS, Priority>;
}

export class ParityGameSolver {
  private gameGraph: GameGraph;

  constructor(gameGraph: GameGraph) {
    this.gameGraph = gameGraph;
  }

  solve(): { even: Set<NodeS>; odd: Set<NodeS> } {
    return this.zielonkaRecursive(this.gameGraph);
  }

  private zielonkaRecursive(subgraph: GameGraph): {
    even: Set<NodeS>;
    odd: Set<NodeS>;
  } {
    if (subgraph.edges.size === 0) {
      return { even: new Set(), odd: new Set() };
    }

    const maxPriority = Math.max(...Array.from(subgraph.priorities.values()));
    const maxPriorityNodes = new Set<NodeS>(
      Array.from(subgraph.priorities.entries())
        .filter(([_, priority]) => priority === maxPriority)
        .map(([node, _]) => node)
    );

    const player = maxPriority % 2 === 0 ? "even" : "odd";
    const opponent = player === "even" ? "odd" : "even";

    const attractor = this.computeAttractor(subgraph, maxPriorityNodes, player);
    const subgame = this.removeNodes(subgraph, attractor);
    const { even, odd } = this.zielonkaRecursive(subgame);

    if (
      (player === "even" && odd.size > 0) ||
      (player === "odd" && even.size > 0)
    ) {
      const opponentWinningRegion = player === "even" ? odd : even;
      const opponentAttractor = this.computeAttractor(
        subgraph,
        opponentWinningRegion,
        opponent
      );
      const finalSubgame = this.removeNodes(subgraph, opponentAttractor);
      const finalResult = this.zielonkaRecursive(finalSubgame);
      return {
        even: new Set([
          ...finalResult.even,
          ...(player === "odd" ? opponentAttractor : []),
        ]),
        odd: new Set([
          ...finalResult.odd,
          ...(player === "even" ? opponentAttractor : []),
        ]),
      };
    } else {
      return {
        even: new Set([...even, ...(player === "even" ? attractor : [])]),
        odd: new Set([...odd, ...(player === "odd" ? attractor : [])]),
      };
    }
  }

  private computeAttractor(
    subgraph: GameGraph,
    targetNodes: Set<NodeS>,
    player: "even" | "odd"
  ): Set<NodeS> {
    let attractor = new Set<NodeS>(targetNodes);
    let toProcess = new Set<NodeS>(targetNodes);

    while (toProcess.size > 0) {
      const newToProcess = new Set<NodeS>();
      subgraph.edges.forEach((successors, node) => {
        if (!attractor.has(node)) {
          const canAttract =
            (player === "even" && subgraph.priorities.get(node)! % 2 === 0) ||
            (player === "odd" && subgraph.priorities.get(node)! % 2 !== 0) ||
            successors.some((successor) => attractor.has(successor));
          if (canAttract) {
            newToProcess.add(node);
            attractor.add(node);
          }
        }
      });
      toProcess = newToProcess;
    }

    return attractor;
  }

  private removeNodes(
    subgraph: GameGraph,
    nodesToRemove: Set<NodeS>
  ): GameGraph {
    const newEdges = new Map<NodeS, NodeS[]>(
      Array.from(subgraph.edges.entries())
        .filter(([node, _]) => !nodesToRemove.has(node))
        .map(([node, successors]) => [
          node,
          successors.filter((successor) => !nodesToRemove.has(successor)),
        ])
    );

    const newPriorities = new Map<NodeS, Priority>(
      Array.from(subgraph.priorities.entries()).filter(
        ([node, _]) => !nodesToRemove.has(node)
      )
    );

    return { edges: newEdges, priorities: newPriorities };
  }
}
