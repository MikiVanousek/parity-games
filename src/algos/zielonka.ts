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
    return { ...result, trace };
  }

  private zielonkaRecursive(
    subgraph: ParityGame,
    trace: Trace
  ): ParityGameSolution {
    trace.addStep([new NodeSet({ name: "Test Set", node_ids: [1, 2] })]);

    return new ParityGameSolution();
  }
}
