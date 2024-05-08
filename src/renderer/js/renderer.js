console.log("Hello from Renderer - in console")


// SELECTORS
const inputPathEl = document.querySelector("#inputPath");
const outputPathEl = document.querySelector("#outputPath");
const submitForm = document.querySelector(".convertForm");
const outputTextarea = document.querySelector('#output');
const settingsBtn = document.querySelector('#settingsBtn');
const settingsMenu = document.querySelector('#settingsMenu');
const operationSelection = document.querySelector('.operationSelection');
const opTitle = document.querySelector('#opTitle');
const convertBtn = document.querySelector('.convertBtn');

let outputValue = '';

const addTextArr = [
  "CONVERSION STARTED\n", 
  "\nCONVERSION FINISHED", 
  'Received interrupt signal. Stopping ffmpeg process..'
]

// STATE
const state = {
  input: "",
  output: "",
  isFolder: null,
  operationType: "DNxHD",
  operationTitle: "DNxHD Converter"
}
opTitle.innerHTML = state.operationTitle.toUpperCase();

// EVENT HANDLERS

document.querySelector('#inFolderBtn').addEventListener('click', async (event) => {
  event.preventDefault();

  // console.log("Clicked Input Folder Btn.");
  await updatePath("inFolder");
  console.log(state);
  updatePage();
})

document.querySelector('#inFileBtn').addEventListener('click', async (event) => {
  event.preventDefault();

  // console.log("Clicked Input File Btn.");
  await updatePath("inFile");
  console.log(state);
  updatePage();
})

document.querySelector('#outBtn').addEventListener('click', async (event) => {
  event.preventDefault();
  document.querySelector('#outBtn').removeEventListener
  // console.log("Clicked Output Btn.");
  await updatePath("outFolder");
  console.log(state);
  updatePage();
})

submitForm.addEventListener('submit', function handleStartOp(event) {
  event.preventDefault();
  console.log("RAN")

  ipcRenderer.startOperation(state);

  // submitForm.removeEventListener('submit', handleStartOp);
  // submitForm.addEventListener('submit', handleStartOp);
})

settingsBtn.addEventListener('click', (event) => {
  settingsMenu.classList.toggle("hidden");
})

operationSelection.addEventListener('submit', async (event) => {
  event.preventDefault();
  settingsMenu.classList.toggle("hidden");
  
  let selectedOption;
  let selecterOptionTitle;
  const radioInputs = document.querySelectorAll('input[type="radio"][name="operation"]');
  radioInputs.forEach(input => {
    if (input.checked) {
      selectedOption = input.id;
      selecterOptionTitle = input.value;
    }
  })

  if (!selectedOption) {
    selectedOption = state.operationType;
    selecterOptionTitle = state.operationTitle;
    opTitle.innerHTML = selecterOptionTitle.toUpperCase();
  } else {
    state.operationType = selectedOption;
    state.operationTitle = selecterOptionTitle;
    opTitle.innerHTML = selecterOptionTitle.toUpperCase();
  }

  console.log(state);
})

// FUNCTIONS

async function updatePath(type) {
  let response;
  let newState = { ...state };

  try {
    switch (type) {
      case "inFolder":
        response = await ipcRenderer.getDir();
        if (response.path !== undefined) {
          state.isFolder = true;
          state.input = response.path;
        }
        break;
      case "inFile":
        response = await ipcRenderer.getFile();
        if (response.path !== undefined) {
          state.isFolder = false;
          state.input = response.path;
        }
        break;
      case "outFolder":
        response = await ipcRenderer.getDir();
        if (response.path !== undefined) {
          state.output = response.path;
        }
        break;
    }

  } catch (error) {
    console.log("Did not select folder");
  }
}

function updatePage() {
  // function makeSmall(absPath) {
  //     console.log("ABS:", absPath);
  //     const pathSegs = path.sep(absPath);
  //     const smallPathSegs = pathSegs.slice(-3);
  //     const smallPath = path.join(...smallPathSegs);
  //     return smallPath;
  //     }
  //     const smallIn = `.. ${makeSmall(state.input)}`
  //     const smallOut = `.. ${makeSmall(state.output)}`

  inputPathEl.value = state.input;
  outputPathEl.value = state.output;
}


// main.js listeners

ipcRenderer.opStarted((event, data) => {
  console.log("EVENT:\n", event, "\n\n")
  console.log("DATA:\n", data, "\n\n")
})

ipcRenderer.getConsoleMessage((event, consoleMessage) => {
  console.log(consoleMessage.message);

  const newLog = consoleMessage.message;

  if (addTextArr.includes(newLog) || 
      newLog.startsWith("Running conversion for") || 
      newLog.startsWith(`  >>`) ||
      newLog.startsWith("---") ||
      newLog.startsWith("===")
    ) {
    outputValue += newLog + '\n';
    outputTextarea.value = outputValue;
    // scroll to bottom
    outputTextarea.scrollTop = outputTextarea.scrollHeight;
  } else {
    outputTextarea.value = outputValue + newLog + '\n\n';
    // scroll to bottom
    // outputTextarea.scrollTop = outputTextarea.scrollHeight;
  }
})

ipcRenderer.opInProgress((event, bool) => {
  if (bool) {
    convertBtn.innerText = "In Progress..."
    convertBtn.disabled = true;
    convertBtn.classList.add('inProgress')
  } else {
    convertBtn.innerText = "CONVERT"
    convertBtn.disabled = false;
    convertBtn.classList.remove('inProgress')
  }
})