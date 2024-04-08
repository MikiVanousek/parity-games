import { ParityGame } from "../board/ParityGame";
import { Node, Player } from "../board/Node";
import { NodeSet, Trace, TraceStep } from "../board/Trace";

console.log("hello");

export class ParityGameSolution {
  even: Node[];
  odd: Node[];
}

export class ZielonkaAlgorithm {
  private gameGraph: ParityGame;

  constructor(gameGraph: ParityGame) {
    this.gameGraph = gameGraph;
  }

  solve(): ParityGameSolution & { trace: Trace } {
    console.log(this.gameGraph);
    let trace: Trace = new Trace({
      parity_game: this.gameGraph,
      algorithm_name: "Zielonka's Algorithm",
      steps: [],
    });
    console.log(trace);
    const result = this.zielonkaRecursive(this.gameGraph, trace);
    console.log(trace);
    console.log(result);
    return { ...result, trace };
  }

  private zielonkaRecursive(
    subgraph: ParityGame,
    trace: Trace
  ): ParityGameSolution {
    // Base case: If the subgraph is empty, return empty sets for both players.
    if (subgraph.isEmpty()) {
      return { even: [], odd: [] };
    }

    // Find the highest priority in the subgraph and which player it belongs to.
    const maxPriority = subgraph.getMaxPriority();
    // Winner of highest priority
    const player = maxPriority % 2 === 0 ? Player.Even : Player.Odd;

    // Find the set of nodes with the maximum priority.
    const maxPriorityNodes = subgraph.getNodesWithPriority(maxPriority);
    trace.addStep([
      new NodeSet({
        name: "Winners of highest priority",
        node_ids: maxPriorityNodes.map((node) => node.id),
      }),
    ]);

    // Compute the attractor set for the player with the maximum priority.
    const attractorSet = subgraph.attractorSet(maxPriorityNodes, player);
    trace.addStep([
      new NodeSet({
        name: "Attractor set",
        node_ids: attractorSet.map((node) => node.id),
      }),
    ]);

    // Remove the attractor set from the subgraph to form a new subgame.
    const subgame = subgraph.deepCopy().removeNodes(attractorSet);

    // Recursively solve the subgame.
    const subgameSolution = this.zielonkaRecursive(subgame, trace);

    // If the opponent has no winning strategy in the subgame, the attractor set is part of the current player's winning region.
    if (subgameSolution[player === Player.Even ? "odd" : "even"].length === 0) {
      subgameSolution[player === Player.Even ? "even" : "odd"] =
        subgameSolution[player === Player.Even ? "even" : "odd"].concat(
          attractorSet
        );
      return subgameSolution;
    } else {
      // Otherwise, compute the attractor set for the opponent in the original subgraph.
      const opponentAttractorSet = subgraph.attractorSet(
        subgameSolution[player === Player.Even ? "odd" : "even"],
        player === Player.Even ? Player.Odd : Player.Even
      );

      // Remove the opponent's attractor set from the original subgraph to form another new subgame.
      const finalSubgame = subgraph
        .deepCopy()
        .removeNodes(opponentAttractorSet);

      // Recursively solve this final subgame.
      const finalSolution = this.zielonkaRecursive(finalSubgame, trace);

      // The solution for the current player is the union of the final solution for the player and the opponent's attractor set.
      finalSolution[player === Player.Even ? "even" : "odd"] =
        finalSolution[player === Player.Even ? "even" : "odd"].concat(
          opponentAttractorSet
        );

      return finalSolution;
    }
  }
}
