export function updateGraphFileName(name: string) {
  const fileNameDisplay = document.getElementById("file-name-display");
  if (fileNameDisplay) {
    fileNameDisplay.textContent = "File: " + name;
    fileNameDisplay.title = name;
  }
}
