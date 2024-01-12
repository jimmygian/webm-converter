// SELECTORS
const inputPathEl = document.querySelector("#inputPath");
const outputPathEl = document.querySelector("#outputPath");

// STATE
const state = {
    input: "",
    output: "",
    isFolder: null
}


// EVENT HANDLERS

document.querySelector('#inFolderBtn').addEventListener('click', async (event) => {
    event.preventDefault();

    console.log("Clicked Input Folder Btn.");
    await updatePath("inFolder");
    console.log(state);
    updatePage();
})

document.querySelector('#inFileBtn').addEventListener('click', async (event) => {
    event.preventDefault();

    console.log("Clicked Input File Btn.");
    await updatePath("inFile");
    console.log(state);
    updatePage();
})

document.querySelector('#outBtn').addEventListener('click', async (event) => {
    event.preventDefault();

    console.log("Clicked Output Btn.");
    await updatePath("outFolder");
    console.log(state);
    updatePage();
})

document.querySelector(".convertForm").addEventListener('submit', (event) => {
    event.preventDefault();

    ipcRenderer.startOperation(state);

    // // EVALUATE
    // if (state.input === undefined || state.output === undefined) {
    //     console.log("Please select valid inputs/outputs.")
    // } else {
    //     console.log("congrats!")
    //     console.log("This will be submitted\n", state);
    // }
})


// FUNCTIONS

async function updatePath(type) {
    let response;
    let newState = {...state};

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