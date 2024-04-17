import { ParityGame } from "../board/ParityGame";
import { ZielonkaAlgorithm } from "./zielonka";

export const algos = {
  zielonka: {
    name: "Zielonka's Algorithm",
    description: "This is Zielonka's algorithm",
    run: (pg: ParityGame) => {
      let alg = new ZielonkaAlgorithm(pg);
      return alg.solve();
    },
  },
};
