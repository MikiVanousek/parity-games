import { ParityGame } from "../pg/ParityGame";
import { Node, Player } from "../pg/Node";
import { NodeSet, Trace, TraceStep } from "../trace/Trace";

console.log("hello");

export class ParityGameSolution {
  even: Node[];
  odd: Node[];
}

export class ZielonkaAlgorithm {
  private gameGraph: ParityGame;
  private attractors: NodeSet[] = [];
  private solutions: NodeSet[] = [];

  constructor(gameGraph: ParityGame) {
    this.gameGraph = gameGraph;
  }

  solve(): ParityGameSolution & { trace: Trace } {
    let trace: Trace = new Trace({
      parity_game: this.gameGraph,
      algorithm_name: "Zielonka's Algorithm",
      steps: [],
    });
    const result = this.zielonkaRecursive(this.gameGraph, trace);
    trace.addStep([
      new NodeSet({
        name: "Winning Even",
        node_ids: result.even.map((node) => node.id),
      }),
      new NodeSet({
        name: "Winning Odd",
        node_ids: result.odd.map((node) => node.id),
      }),
    ]);
    console.log("Result: " + result.even);
    console.log("Result: " + result.odd);
    return { ...result, trace };
  }

  public zielonkaRecursive(
    subgraph: ParityGame,
    trace: Trace
  ): { even: Node[]; odd: Node[] } {
    // Base case: if the game is empty
    if (subgraph.isEmpty()) {
      return { even: [], odd: [] }; // empty game
    }

    // Find the highest priority and determine the player (even or odd)
    const maxPriority = subgraph.getMaxPriority();
    const alpha = maxPriority % 2 === 0 ? Player.Even : Player.Odd; // winner of highest priority
    const Z = subgraph.getNodesWithPriority(maxPriority); // vertices of highest priority
    trace.addStep([
      new NodeSet({
        name: "Winners of highest priority",
        node_ids: Z.map((node) => node.id),
      }),
    ]);
    const A = subgraph.attractorSet(Z, alpha); // attracted to highest priority
    this.attractors.push(
      new NodeSet({
        name:
          "Attractor set " +
          this.attractors.length +
          "  (" +
          (alpha === Player.Even ? "Even" : "Odd") +
          ")",
        node_ids: A.map((node) => node.id),
      })
    );
    trace.addStep([...this.attractors]);

    // Recursive solution on the subgame excluding the attractor set A
    let subgraphCopy = subgraph.deepCopy();
    console.log("Hello: " + subgraphCopy.getNodes().length);
    let subgraphRemoved = subgraph.deepCopy().removeNodes(A);
    console.log("Hello 2: " + subgraphRemoved.getNodes().length);
    const { even: W_even, odd: W_odd } = this.zielonkaRecursive(
      subgraphRemoved,
      trace
    );
    let step2 = [
      new NodeSet({
        name:
          "Attractor set " +
          this.attractors.length +
          "  (" +
          (alpha === Player.Even ? "Even" : "Odd") +
          ")",
        node_ids: A.map((node) => node.id),
      }),
      new NodeSet({
        name:
          "Subgraph Copy" +
          (subgraphCopy.getNodes().length === 0
            ? " - EMPTY"
            : " - " + subgraphCopy.getNodes().length + " nodes"),
        node_ids: subgraphCopy.getNodes().map((node) => node.id),
      }),
      new NodeSet({
        name:
          "Subgraph Removed" +
          (subgraphRemoved.getNodes().length === 0
            ? " - EMPTY"
            : " - " + subgraphRemoved.getNodes().length + " nodes"),
        node_ids: subgraphRemoved.getNodes().map((node) => node.id),
      }),
      new NodeSet({
        name:
          "Subgraph Winner (Even" + (W_even.length === 0 ? " - EMPTY)" : ")"),
        node_ids: W_even.map((node) => node.id),
      }),
      new NodeSet({
        name: "Subgraph Winner (Odd" + (W_odd.length === 0 ? " - EMPTY)" : ")"),
        node_ids: W_odd.map((node) => node.id),
      }),
    ];
    trace.addStep([...step2]);

    // Compute the attractor set for the opponent in the solution of the subgame
    const W_opponent = alpha === Player.Even ? W_odd : W_even;
    const B = subgraphCopy.attractorSet(
      W_opponent,
      alpha === Player.Even ? Player.Odd : Player.Even
    );
    step2.push(
      new NodeSet({
        name:
          "Opponent Attractor set " +
          this.attractors.length +
          " (" +
          (alpha === Player.Even ? "Odd" : "Even") +
          (B.length === 0 ? " - EMPTY" : "") +
          ")",
        node_ids: B.map((node) => node.id),
      })
    );
    trace.addStep([...step2]);

    // Check if opponent attracts any nodes
    if (B.length === W_opponent.length) {
      // If opponent cannot attract any more nodes beyond what they already have
      if (alpha === Player.Even) {
        return { even: W_even.concat(A), odd: W_odd }; // A is won by alpha
      } else {
        return { even: W_even, odd: W_odd.concat(A) }; // A is won by alpha
      }
    } else {
      // Recompute remainder if opponent can attract nodes
      this.attractors = [];
      const { even: W_even_remainder, odd: W_odd_remainder } =
        this.zielonkaRecursive(subgraphCopy.removeNodes(B), trace);
      if (alpha === Player.Even) {
        return { even: W_even_remainder, odd: W_odd_remainder.concat(B) }; // B is won by alpha hat (Player.Odd)
      } else {
        return { even: W_even_remainder.concat(B), odd: W_odd_remainder }; // B is won by alpha hat (Player.Even)
      }
    }
  }

  // Function to compare two arrays of nodes
  private areNodeSetsEqual(set1: Node[], set2: Node[]): boolean {
    const ids1 = set1.map((node) => node.id).sort();
    const ids2 = set2.map((node) => node.id).sort();
    return (
      ids1.length === ids2.length &&
      ids1.every((value, index) => value === ids2[index])
    );
  }
}
