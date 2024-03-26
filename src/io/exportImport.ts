import { updateGraphFileName } from "../ui/utils";
import { PGParser } from "../board/PGParser";

export function handleExportGame(cy, pg) {
  const cyState = cy.elements().jsons();
  const game = PGParser.export_pg_format(pg);

  const exportData = {
    cytoscapeState: cyState,
    gameState: game,
  };

  const exportString = JSON.stringify(exportData, null, 2);

  const file = new Blob([exportString], { type: "application/json" });

  const a = document.createElement("a");
  a.href = URL.createObjectURL(file);
  a.download = pg.name + ".json";
  a.click();
}

export function handleImportGame(event, cy) {
  const file = event.target.files[0];

  if (file) {
    updateGraphFileName(file.name);

    const reader = new FileReader();

    reader.onload = function (loadEvent) {
      try {
        const fileContent = loadEvent.target.result as string;
        const importedData = JSON.parse(fileContent);

        cy.elements().remove();
        cy.add(importedData.cytoscapeState);
        cy.fit(cy.elements(), 50);

        var fileName = file.name.replace(/\.[^/.]+$/, "");
        cy.pg = PGParser.import_pg_format(importedData.gameState);
      } catch (error) {
        console.error("Error importing game:", error);
      }
    };

    reader.readAsText(file);
  }
}

export function exportAsPng(cy, pg) {
  const png = cy.png({ full: true });
  const a = document.createElement("a");
  a.href = png;
  a.download = pg.name + ".png";
  a.click();
}

export function handleOinkFileSelect(event, cy, layoutManager, pg) {
  const file = event.target.files[0];

  if (file) {
    updateGraphFileName(file.name);

    const reader = new FileReader();

    reader.onload = function (loadEvent) {
      const fileContent = loadEvent.target.result as string;

      pg = PGParser.import_pg_format(fileContent);
      resetBoardVisuals(cy, pg, layoutManager);
    };

    reader.readAsText(file);
  }
}

function resetBoardVisuals(cy, pg, layoutManager) {
  const elements = pg.getElementDefinition();
  cy.elements().remove(); // Clear the current graph
  cy.add(elements); // Add the new elements
  layoutManager.runOnce();
}
