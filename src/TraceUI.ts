import { Trace } from './board/Trace';

export function setupTraceUI() {
  console.log("Hello from TraceUI!");
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
        var trace = new Trace(JSON.parse(fileContent.toString()))
        console.log(trace);
      };
      reader.readAsText(file);
    }
  }


  fileInput.addEventListener('change', handleFileSelect);

  function toggleSpeedDropdown(event) {
    document.getElementById("speedDropdown").style.display = 'block';
    event.stopPropagation(); // Prevent the click from being immediately caught by document
  }

  // Function to set speed and hide dropdown
  function setSpeed(speed) {
    console.log("Speed set to:", speed);
    // Implement speed change logic here
    document.getElementById("speedDropdown").style.display = 'none';
  }

  // Clicking outside the dropdown hides it
  document.addEventListener('click', function (event) {
    var speedDropdown = document.getElementById("speedDropdown");
    if (speedDropdown.style.display === 'block') {
      speedDropdown.style.display = 'none';
    }
  });
}