import { algos } from "../algos";
import { PGParser } from "../board/PGParser";

// populate the algorithm select options
const algoSelect = document.getElementById("algorithm-select");

export function setupAlgorithmSelect() {
  Object.keys(algos).forEach((key) => {
    const option = document.createElement("option");
    option.value = key;
    option.text = algos[key].name;
    algoSelect.appendChild(option);
  });

  const algoStart = document.getElementById("start-algorithm-btn");
  algoStart.addEventListener("click", () => {
    console.log("start algorithm");
    // get the selected algorithm
    const algoSelect = document.getElementById(
      "algorithm-select"
    ) as HTMLSelectElement;
    const selectedAlgorithm = algoSelect.value;

    const res = algos[selectedAlgorithm].run(PGParser.cyToPg(window.cy));

    // Update the trace with the result from the algorithm
    if (res.trace) {
      window.traceManager.setTrace(res.trace);
    }
  });
}