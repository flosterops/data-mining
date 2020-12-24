const { ipcRenderer } = require("electron");
const Chart = require("chart.js");

ipcRenderer.on("addFile", (event, name, type, index) => {
    let li = document.createElement('li');
    li.innerHTML = index + ") " + name;

    let btn = document.createElement('button');
    btn.innerHTML = "Parse [" + type + "]";
    btn.onclick = () => {
        ipcRenderer.send("parseFile", index);
    }

    li.appendChild(btn);

    document.getElementById('files').appendChild(li);
});

ipcRenderer.on("clearFiles", (event) => {
    document.getElementById('files').innerHTML = "";
});

ipcRenderer.on("addToHam", (event, arr) => {
    arr.forEach(line => {
        document.getElementById('ham-area').innerHTML += line + " "; 
    });
    document.getElementById('ham-area').innerHTML += "\n";
});

ipcRenderer.on("addToSpam", (event, arr) => {
    arr.forEach(line => {
        document.getElementById('spam-area').innerHTML += line + " ";
    });
    document.getElementById('spam-area').innerHTML += "\n";
});

ipcRenderer.on("clearAreas", (event) => {
    document.getElementById('ham-area').innerHTML = "";
    document.getElementById('spam-area').innerHTML = "";
});

ipcRenderer.on("setHamWordCount", (event, arr, len) => {
    for(let i = 0; i < arr.length; i++) {
        document.getElementById("ham-count-" + i).innerHTML = arr[i];
    }

    var ctx = document.getElementById('myChart').getContext('2d');
    var myChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: [ 1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
            datasets: [{
                label: 'Word length',
                data: arr
            }]
        }
    });

    let sum = 0;
    for(let i = 0; i < arr.length; i++) {
        sum += (arr[i] * (i + 1));
    }
    
    document.getElementById("av-ham-word-len").innerHTML = sum / len;
});

ipcRenderer.on("setSpamWordCount", (event, arr, len) => {
    for(let i = 0; i < arr.length; i++) {
        document.getElementById("spam-count-" + i).innerHTML = arr[i];
    }

    var ctx = document.getElementById('myChart2').getContext('2d');
    var myChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: [ 1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
            datasets: [{
                label: 'Word length',
                data: arr
            }]
        }
    });

    let sum = 0;
    for(let i = 0; i < arr.length; i++) {
        sum += (arr[i] * (i + 1));
    }
    
    document.getElementById("av-spam-word-len").innerHTML = sum / len;
});

ipcRenderer.on("setAvHamMesCount", (event, count) => {
    document.getElementById("av-ham-mes-len").innerHTML = count;
});

ipcRenderer.on("setAvSpamMesCount", (event, count) => {
    document.getElementById("av-spam-mes-len").innerHTML = count;
});

ipcRenderer.on("spamTop20", (event, arr) => {
    let names = [];
    let counts = [];

    let sum = 0;
    for(let i = 0; i < arr.length; i++) {
        sum += arr[i].count;
    }
    
    for(let i = 0; i < arr.length; i++) {
        names[i] = arr[i].name;
        counts[i] = arr[i].count / sum;
    }

    var ctx = document.getElementById('chartSpamTop20').getContext('2d');
    var myChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: names,
            datasets: [{
                label: 'Top 20 words',
                data: counts
            }]
        }
    });
});

ipcRenderer.on("hamTop20", (event, arr) => {
    let names = [];
    let counts = [];

    let sum = 0;
    for(let i = 0; i < arr.length; i++) {
        sum += arr[i].count;
    }
    
    for(let i = 0; i < arr.length; i++) {
        names[i] = arr[i].name;
        counts[i] = arr[i].count / sum;
    }

    var ctx = document.getElementById('chartHamTop20').getContext('2d');
    var myChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: names,
            datasets: [{
                label: 'Top 20 words',
                data: counts
            }]
        }
    });
});