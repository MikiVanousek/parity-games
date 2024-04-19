import { algos } from "../algos";
import { cyToPg } from "../pg/parityGameParser";

// populate the algorithm select options
const algoSelect = document.getElementById("algorithmSelect");

export function setupAlgorithmSelect() {
  Object.keys(algos).forEach((key) => {
    const option = document.createElement("option");
    option.value = key;
    option.text = algos[key].name;
    algoSelect.appendChild(option);
  });

  const algoStart = document.getElementById("startAlgorithmBtn");
  algoStart.addEventListener("click", () => {
    console.log("start algorithm");
    // get the selected algorithm
    const algoSelect = document.getElementById(
      "algorithmSelect"
    ) as HTMLSelectElement;
    const selectedAlgorithm = algoSelect.value;

    const res = algos[selectedAlgorithm].run(cyToPg(window.cy));

    // Update the trace with the result from the algorithm
    if (res.trace) {
      window.traceManager.setTrace(res.trace);
    }
  });
}