// Here we define callbacks for the various import/export buttons, inputs, etc.
import { showToast } from "../ui/toast";
import { getPGName, setPGName } from "../ui/pgNameEditing";
import { importOinkFormat, cyToPg, exportOinkFormat, pgToCy } from "../pg/parityGameParser";

export function saveGame(cy, name = getPGName()) {
  const cyState = window.cy.elements().jsons();

  const exportData = {
    cytoscapeState: cyState,
  };

  const exportString = JSON.stringify(exportData, null, 2);

  const file = new Blob([exportString], { type: "application/json" });

  const a = document.createElement("a");
  a.href = URL.createObjectURL(file);
  a.download = name + ".cypg_json";
  a.click();
}

export function handleImportGame(event) {
  const file = event.target.files[0];

  if (file) {
    // remove the file extension
    setPGName(file.name.replace(/\.[^/.]+$/, ""));

    const reader = new FileReader();

    reader.onload = function (loadEvent) {
      try {
        const fileContent = loadEvent.target.result as string;
        const importedData = JSON.parse(fileContent);

        window.cy.elements().remove();
        window.cy.add(importedData.cytoscapeState);
        window.cy.fit(window.cy.elements(), 50);
        window.ur.reset();
      } catch (e) {
        console.error("Error loading game:", e);
        showToast({
          title: "Invalid file",
          message: "The file you selected is not a valid cypg_json file",
          variant: "danger",
        });
      }
    };

    reader.readAsText(file);
  }
}

export function exportAsPng() {
  const png = window.cy.png({ full: true });
  const a = document.createElement("a");
  a.href = png;
  a.download = getPGName() + ".png";
  a.click();
}

export function handleOinkFileSelect(event) {
  const file = event.target.files[0];

  if (file) {
    // remove the file extension
    setPGName(file.name.replace(/\.[^/.]+$/, ""));

    const reader = new FileReader();

    reader.onload = function (loadEvent) {
      const fileContent = loadEvent.target.result as string;

      let pg;
      try {
        pg = importOinkFormat(fileContent);
        window.ur.reset();
      } catch (e) {
        console.error("Error importing game:", e);
        showToast({
          title: "Invalid pg file",
          message: "The file you selected is not a valid pg file",
          variant: "danger",
        });
        return;
      }
      resetBoardVisuals(pg)
    };

    reader.readAsText(file);
  }
}

export function saveOinkFile() {
  const pg = cyToPg(window.cy);
  const exportString = exportOinkFormat(pg);

  const file = new Blob([exportString], { type: "text/plain" });

  const a = document.createElement("a");
  a.href = URL.createObjectURL(file);
  a.download = getPGName() + ".pg";
  a.click();
}

export function resetBoardVisuals(pg) {
  if (window.traceManager.hasTrace()) {
    window.traceManager.removeTrace();
  }
  const elements = pgToCy(pg)
  window.cy.elements().remove(); // Clear the current graph
  window.cy.add(elements); // Add the new elements
  window.layoutManager.setDefaultLayout();
  window.layoutManager.runOnce();
}

export function setupImportExportUI() {
  document.getElementById("oinkExportBtn").addEventListener("click", saveOinkFile);

  document.getElementById("oinkImportInput").addEventListener("change", handleOinkFileSelect);

  document.getElementById("loadFileInput").addEventListener("change", handleImportGame);
  document.getElementById("saveBtn").addEventListener("click", saveGame);

  document.getElementById("exportPngBtn").addEventListener("click", exportAsPng);

}