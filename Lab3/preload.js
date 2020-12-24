const { ipcRenderer } = require("electron");

document.onreadystatechange = () => {
    if(document.readyState == "complete") {
        let arr = [];
        for(let i = 0; i < document.links.length; i++) {
            arr.push(document.links[i].href.toLowerCase());
        }
        ipcRenderer.sendSync("add-page", window.location.href.toLowerCase(), arr);
    }
};