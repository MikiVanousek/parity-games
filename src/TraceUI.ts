import { Trace } from './board/Trace';
import { showToast } from './toast';

export function setupTraceUI() {
  const fileInput = document.getElementById('fileInput');

  function triggerFileInput() {
    fileInput.click();
  }

  function handleFileSelect(event) {
    const files = event.target.files;
    if (files.length > 0) {
      const file = files[0];
      const reader = new FileReader();
      reader.onload = function (e) {
        const fileContent = e.target.result;
        showToast({
          message: "Toasting up!",
          variant: "success" // "danger" | "warning" | "info"
        });
        var trace = new Trace(JSON.parse(fileContent.toString()))
        console.log(trace);
      };
      reader.readAsText(file);
    }
  }


  fileInput.addEventListener('change', handleFileSelect);


}