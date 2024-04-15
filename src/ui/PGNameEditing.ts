import { showToast } from "./toast";


function validatePGName(pgName) {
  if (pgName.length === 0) {
    showToast({
      message: "The name of the parity game cannot be empty.",
      variant: "danger",
      duration: 4000,
    });
    return false;
  } else if (pgName.includes('/')) {
    showToast({
      message: "The name of the parity game cannot contain slashes.",
      variant: "danger",
      duration: 4000,
    });
    return false;
  } if (pgName.length > 0) {
    return true;
  }
}

const displayGroupElement = document.getElementById('pgnameDisplayGroup');
const nameElement = document.getElementById('pgnameDisplaySpan');
const editNameButton = document.getElementById('pgnameEdit');


const editGroupElement = document.getElementById('pgnameEditGroup');
const inputElement = document.getElementById('pgnameEditInput') as HTMLTextAreaElement;
const confirmEditButton = document.getElementById('confirmPgnameEdit');
const cancelEditButton = document.getElementById('cancelPgnameEdit');

export function getPGName(): string {
  return nameElement.textContent;
}
export function setPGName(pgName: string): void {
  nameElement.textContent = pgName;
}

export function setupPGNameEditing(): void {
  editGroupElement.hidden = true;
  // if the name is in the window, then update the title
  if (getPGName() == "") {
    setPGName("New Parity Game");
  }
  editNameButton.addEventListener('click', function () {
    console.log('editNameButton clicked');
    editGroupElement.hidden = false;
    displayGroupElement.hidden = true;
    inputElement.value = getPGName();
    inputElement.focus();
    inputElement.select();

    // Define a function to handle keypress event



  });
  confirmEditButton.addEventListener('click', confirmEdit);
  inputElement.addEventListener('blur', confirmEdit);
  inputElement.addEventListener('keypress', function (e) {
    if (e.key === 'Enter') {
      confirmEdit();
      e.preventDefault()
    }
  });

  function confirmEdit() {
    console.log('confirmEdit');
    if (validatePGName(inputElement.value)) {
      setPGName(inputElement.value)
      displayGroupElement.hidden = false;
      editGroupElement.hidden = true;
    } else {
      showToast({
        message: "Invalid parity game name.",
        variant: "danger",
        duration: 4000,
      });
      inputElement.focus();
    }

  }

  cancelEditButton.addEventListener('click', function () {
    displayGroupElement.hidden = false;
    editGroupElement.hidden = true;
  });
}