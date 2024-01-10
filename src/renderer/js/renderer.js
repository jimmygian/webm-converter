// const { ipcRenderer } = require("electron");

// const information = document.getElementById('info');
// information.innerText = `This app is using Chrome (v${versions.chrome()})`

// const func = async () => {
//     const response = await ipcRenderer.ping()
//     console.log(response)
// }

// func()




document.querySelector('#inFolder').addEventListener('click', (event) => {
    event.preventDefault();

    console.log("clickedd!")

    const dirName =  async () => {
        const response = await ipcRenderer.getDir();
        
        if (!response.cancelled) {
            console.log(response);
        } else {
            console.log("cancelled")
        }
    }

    dirName();

})

document.querySelector('#inFile').addEventListener('click', (event) => {
    event.preventDefault();

    console.log("clickedd!")

    const folderName =  async () => {
        const response = await ipcRenderer.getFile();
        
        if (!response.cancelled) {
            console.log(response);
        } else {
            console.log("cancelled")
        }
    }

    folderName();

})