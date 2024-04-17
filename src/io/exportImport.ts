import { updateGraphFileName } from "../ui/utils";
import { PGParser } from "../board/PGParser";
import { showToast } from "../ui/toast";
import { getPGName, setPGName } from "../ui/PGNameEditing";

export function handleExportGame(cy, name = getPGName()) {
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

export function handleImportGame(event, cy, ur) {
  const file = event.target.files[0];

  if (file) {
    updateGraphFileName(file.name);

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
        ur.reset();
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

export function exportAsPng(cy, name = getPGName()) {
  const png = window.cy.png({ full: true });
  const a = document.createElement("a");
  a.href = png;
  a.download = name + ".png";
  a.click();
}

export function handleOinkFileSelect(event, cy, layoutManager, ur) {
  const file = event.target.files[0];

  if (file) {
    updateGraphFileName(file.name);

    // remove the file extension
    setPGName(file.name.replace(/\.[^/.]+$/, ""));

    const reader = new FileReader();

    reader.onload = function (loadEvent) {
      const fileContent = loadEvent.target.result as string;

      let pg;
      try {
        pg = PGParser.importOinkFormat(fileContent);
        ur.reset();
      } catch (e) {
        console.error("Error importing game:", e);
        showToast({
          title: "Invalid pg file",
          message: "The file you selected is not a valid pg file",
          variant: "danger",
        });
        return;
      }
      resetBoardVisuals(cy, pg, layoutManager);
    };

    reader.readAsText(file);
  }
}

export function saveOinkFile(cy, name = getPGName()) {
  const pg = PGParser.cyToPg(cy);
  const exportString = PGParser.exportOinkFormat(pg);

  const file = new Blob([exportString], { type: "text/plain" });

  const a = document.createElement("a");
  a.href = URL.createObjectURL(file);
  a.download = name + ".pg";
  a.click();
}

export function resetBoardVisuals(cy, pg, layoutManager) {
  const elements = PGParser.pgToCy(pg);
  window.cy.elements().remove(); // Clear the current graph
  window.cy.add(elements); // Add the new elements
  layoutManager.runOnce();
}

export function setupImportExportUI() {

  (window as any).handleExportGame = function () {
    handleExportGame(window.cy);
  };

  (window as any).handleImportGame = function (event) {
    handleImportGame(event, window.cy, window.ur);
  };

  (window as any).handleOinkFileSelect = function (event) {
    handleOinkFileSelect(event, window.cy, window.layoutManager, window.ur);
  };
  (window as any).saveOinkFile = function () {
    saveOinkFile(window.cy);
  };

  (window as any).exportAsPng = function () {
    exportAsPng(window.cy);
  };

  (window as any).changeLayout = function (e: any) {
    window.layoutManager.changeLayout(e.target.value);
    // decheck the layout on layout-on-drag
    const toggle = document.getElementById("layout-on-drag") as HTMLInputElement;
    toggle.checked = false;
    window.layoutManager.setRunOnDrag(false);
  };

  (window as any).runLayout = function () {
    window.ur.do("runLayout", { nodes: window.cy.nodes() });
  };

}