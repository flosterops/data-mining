const { app, BrowserWindow, ipcMain } = require("electron");
const parseUrl = require("parse-url");
const pageRank = require("pagerank-js");

let pages = [];

let mainWindow = null;

app.on("ready", () => {
    mainWindow = new BrowserWindow({
        width: 1300,
        height: 800,
        webPreferences: {
            nodeIntegration: true
        }
    });

    mainWindow.loadFile("index.html");
    mainWindow.webContents.openDevTools();

    mainWindow.on("close", () => {
        app.quit();
    });
});

ipcMain.on("start", (event, url) => {
    url = url.toLowerCase();
    pages = [];
    domain = parseUrl(url).resource;
    performPage(url);
});

ipcMain.on("add-page", (event, url, links) => {
    pages.push({ url: url, links: links, pathname: parseUrl(url).pathname });

    let end = true;
    for(let i = 0; i < links.length; i++) {
        if(!includes(links[i])) {
            end = false;
            if(domain == parseUrl(links[i]).resource) {
                performPage(links[i]);
            }
        }
    }
    if(end) {
        transformLinks();

        BrowserWindow.getAllWindows().forEach((window) => {
            if(window != mainWindow) {
                window.close();
            }
        });
    }

    // BrowserWindow.fromWebContents(event.sender).close();
    
});

function performPage(url) {
    let pageWindow = new BrowserWindow({
        x: 16, y: 16,
        title: url,
        width: 400, height: 400,
        webPreferences: {
            preload: app.getAppPath() + "/preload.js",
            nodeIntegration: true
        }
    });
    pageWindow.loadURL(url);
}

function includes(url) {
    let pathname = parseUrl(url).pathname;
    let exists = false;
    for(let i = 0; i < pages.length; i++) {
        if(parseUrl(pages[i].url).pathname == pathname) {
            exists = true;
        }
    }
    return exists;
}

function transformLinks() {
    let sites = [];
    for(let i = 0; i < pages.length; i++) {
        let site = {
            name: domain + pages[i].pathname,
            links: []
        };
        for(let j = 0; j < pages[i].links.length; j++) {
            if(parseUrl(pages[i].links[j]).resource == domain) {
                site.links.push(domain + parseUrl(pages[i].links[j]).pathname);
            }
        }
        sites.push(site);
    }
    console.log("sites:");
    console.log(sites);

    let numbers = [];
    for(let i = 0; i < sites.length; i++) {
        numbers.push(sites[i].links);
        for(let j = 0; j < sites[i].links.length; j++) {
            for(let k = 0; k < sites.length; k++) {
                if(numbers[i][j] == sites[k].name) {
                    numbers[i][j] = k;
                }
            }
        }
    }
    console.log("numbers:");
    console.log(numbers);

    calcPagerank(numbers);
    drawGraph(numbers);
}

function calcPagerank(forPg) {
    linkProb = 0.85;
    tolerance = 0.0001; 

    pageRank(forPg, linkProb, tolerance, (err, res) => {
        if (err) throw new Error(err);
        console.log("pageRank:");
        console.log(res);
    });
}

function drawGraph(arr) {
    let toGraph = [];
    for(let i = 0; i < arr.length; i++) {
        for(let j = 0; j < arr[i].length; j++) {
            toGraph.push([ i, arr[i][j] ]);
        }
    }

    let labels = [];
    for(let i = 0; i < pages.length; i++) {
        labels.push(domain + pages[i].pathname);
    }

    mainWindow.webContents.send("draw-graph", toGraph, labels);
}