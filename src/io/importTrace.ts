import { showToast } from "../ui/toast";
import { assert } from "../assert";
import { Trace } from "../board/Trace";

export function handleTraceFileSelect(event) {
  const files = event.target.files;
  assert(files.length === 1);
  const file = files[0];
  const reader = new FileReader();
  console.log("e");
  reader.onload = function (e) {
    const fileContent = e.target.result;
    try {
      var trace = new Trace(JSON.parse(fileContent.toString()));
      console.log(trace);
    } catch (error) {
      showToast({
        message: "This file is not a valid trace file.",
        variant: "danger", // "danger" | "warning" | "info"
      });
      console.error("Error importing trace:", error);
      return;
    }
    console.log(trace);
  };
  reader.readAsText(file);
}
