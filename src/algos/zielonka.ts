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
    let trace: Trace = new Trace(this.gameGraph, "Zielonka's Algorithm");
    const result = this.zielonkaRecursive(this.gameGraph, trace);
    return { ...result, trace };
  }

  private zielonkaRecursive(
    subgraph: ParityGame,
    trace: Trace
  ): ParityGameSolution {
    trace.addStep([new NodeSet("Test Set", [0, 1])]);

    return new ParityGameSolution();
  }
}
