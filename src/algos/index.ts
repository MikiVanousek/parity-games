import { ParityGame } from "../pg/ParityGame";
import { Trace } from "../trace/Trace";
import { ParityGameSolution, ZielonkaAlgorithm } from "./zielonka";

// If you want to create your won algorithm, make a new file in this folder which and register a run(pg: ParityGame): 
export const algos = {
  zielonka: {
    name: "Zielonka's Algorithm",
    description: "This is Zielonka's algorithm",
    run: (pg: ParityGame): ParityGameSolution & { trace: Trace } => {
      const alg = new ZielonkaAlgorithm(pg);
      return alg.solve();
    },
  },
};
