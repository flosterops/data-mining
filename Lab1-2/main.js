const { app, BrowserWindow, Menu, dialog, ipcMain } = require("electron");
const readline = require('readline-promise').default;
const fs = require('fs');
const strToArr = require('str-to-arr');
const lancasterStemmer = require("lancaster-stemmer");

let fileArray = [];

let spamWords = [];
let hamWords = [];

let dictionary = [ " ", "ham", "spam", "but", "so", "hi", "bye", "a", "an", "the", "i", "to" ];

let window = null;

let poleWindow = null;

let menu = Menu.buildFromTemplate([
    { label: "File", submenu: [
        { label: "Add files", click: () => {
            dialog.showOpenDialog(window, {
                properties: [ "openFile", "multiSelections" ]
            }, (filePaths) => {
                for(let i = 0; i < filePaths.length; i++) {
                    addFile(filePaths[i]);
                }
            })
        } },
        { label: "Add folder", click: () => {
            dialog.showOpenDialog(window, {
                properties: [ "openDirectory" ]
            }, (filePaths) => {
                fs.readdir(filePaths[0], (err, files) => {
                    files.forEach(file => {
                        file = filePaths[0] + "/" + file;
                        addFile(file);
                    });
                });
            })
        } },
        { label: "Remove all", click: () => {
            fileArray = [];
            window.webContents.send("clearFiles");
        } },
        { type: "separator" },
        { label: "Debug", click: () => {
            window.webContents.openDevTools();
        } },
        { type: "separator" },
        { label: "Exit", click: () => {
            app.quit();
        } }
    ] },
    { label: "Stats", submenu: [
        { label: "Count words", click: () => {
            let arr = [ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
            for(let i = 0; i < hamWords.length; i++) {
                if(hamWords[i].length <= 10) {
                    arr[hamWords[i].length - 1]++;
                } else {
                    arr[9]++;
                }
            }
            window.webContents.send("setHamWordCount", arr, hamWords.length);

            let arr2 = [ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
            for(let i = 0; i < spamWords.length; i++) {
                if(spamWords[i].length <= 10) {
                    arr2[spamWords[i].length - 1]++;
                } else {
                    arr2[9]++;
                }
            }
            window.webContents.send("setSpamWordCount", arr2, spamWords.length);
        } }, 
        { label: "Count messages", click: () => {
            let sum = 0;
            for(let i = 0; i < fileArray.length; i++) {
                if(fileArray[i].type == "ham") {
                    sum += fileArray[i].len;
                }
            }
            window.webContents.send("setAvHamMesCount", sum / fileArray.length);

            sum = 0;
            for(let i = 0; i < fileArray.length; i++) {
                if(fileArray[i].type == "spam") {
                    sum += fileArray[i].len;
                }
            }
            window.webContents.send("setAvSpamMesCount", sum / fileArray.length);
        } },
        { label: "Top 20", click: () => {
            //spam
            let tmp1 = spamWords.reduce(function(acc, el) {
                acc[el] = (acc[el] || 0) + 1;
                return acc;
            }, {});

            tmp1 = Object.entries(tmp1);
            let wordsRate1 = [];
            for(let i = 0; i < tmp1.length; i++) {
                if(tmp1[i][0].length > 0) {
                    wordsRate1.push({ count: tmp1[i][1], name: tmp1[i][0] });
                }
            }

            wordsRate1.sort(compareFunc);

            toFinFile("spam.json", wordsRate1);

            window.webContents.send("spamTop20", wordsRate1.slice(0, 20));

            //ham
            let tmp2 = hamWords.reduce(function(acc, el) {
                acc[el] = (acc[el] || 0) + 1;
                return acc;
            }, {});

            tmp2 = Object.entries(tmp2);
            let wordsRate2 = [];
            for(let i = 0; i < tmp2.length; i++) {
                if(tmp2[i][0].length > 0) {
                    wordsRate2.push({ count: tmp2[i][1], name: tmp2[i][0] });
                }
            }

            wordsRate2.sort(compareFunc);

            toFinFile("ham.json", wordsRate2);

            window.webContents.send("hamTop20", wordsRate2.slice(0, 20));
        } }
    ] },
    { label: "Lab-2", click: () => {
        poleWindow = new BrowserWindow({
            modal: true,
            parent: window,
            title: "Lab-2",
            webPreferences: {
                nodeIntegration: true
            },
            width: 320,
            height: 640
        });

        poleWindow.loadFile("pole.html");
    } }
]);

function toFinFile(fileName, array) {
    fs.writeFile("fin/" + fileName, JSON.stringify(array), (err) => {
        if(err) {
            throw err;
        } else {
            
        }
    });
}

function compareFunc(a, b) {
    if (a.count > b.count) {
      return -1;
    }
    if (a.count < b.count) {
      return 1;
    }
    // a должно быть равным b
    return 0;
  }

app.on("ready", () => {
    window = new BrowserWindow({
        show: false,
        webPreferences: {
            nodeIntegration: true
        },
        width: 1280,
        height: 720
    });

    window.setMenu(menu);

    window.loadFile("index.html");

    window.on("ready-to-show", () => {
        window.show();
    });
});

function addFile(filePath) {
    fs.readFile(filePath, (err, data) => {
        if(err) {
            throw err;
        } else {
            let len = data.toString().length;
            if(filePath.indexOf(".csv") != -1) {
                fileArray.push({ path: filePath, type: "csv", len: len });
                window.webContents.send("addFile", filePath, "csv", fileArray.length - 1);
            } else if(filePath.indexOf(".txt") != -1) {
                if(filePath.indexOf("ham") != -1) {
                    fileArray.push({ path: filePath, type: "ham", len: len });
                    window.webContents.send("addFile", filePath, "ham", fileArray.length - 1);
                } else if(filePath.indexOf("spam") != -1) {
                    fileArray.push({ path: filePath, type: "spam", len: len });
                    window.webContents.send("addFile", filePath, "spam", fileArray.length - 1);
                }
            }
        }
    });
}

function parseFile(fileName, fileType) {
    window.webContents.send("clearAreas");

    let rlp = readline.createInterface({
        terminal: false,
        input: fs.createReadStream(fileName)
    });
    
    rlp.forEach((line, index) => {
        line = line.toLowerCase();
            
        // remove links
        let i = line.indexOf("http");
        if(i != -1) {
            let j = i;
            while(line[j] != " " && line[j] != "." && line[j] != "\n") {
                j++;
            }
            line = line.substring(0, i) + line.substring(j, line.length);
        }
    
        // remove symbols
        line = line.replace(/[^a-z\s]/g, ' ');

        // stemming && stop words
        let words = strToArr(line);
        for(let i = 0; i < words.length; i++) {
            words[i] = lancasterStemmer(words[i]);
            for(let j = 0; j < dictionary.length; j++) {
                if(words[i] == dictionary[j]) {
                    words.splice(i, 1);
                }
            }
        }
    
        if(fileType == "csv") {
            if (line[0] == "h") {
                hamWords = hamWords.concat(words);
                // window.webContents.send("addToHam", words);
            } else if (line[0] == "s") {
                spamWords = spamWords.concat(words);
                // window.webContents.send("addToSpam", words);
            }
        } else if(fileType == "ham") {
            hamWords = hamWords.concat(words);
            // window.webContents.send("addToHam", words);
        } else if(fileType == "spam") {
            spamWords = spamWords.concat(words);
            // window.webContents.send("addToSpam", words);
        }
    });    
} 

ipcMain.on("parseFile", (event, index) => {
    parseFile(fileArray[index].path, fileArray[index].type);
});