const fs = require('fs');

let ham = [];
let spam = [];

function go() {
    let text = document.getElementById("textarea").value.toLowerCase();

    document.getElementById("words-label").innerHTML = "";

    let words = text.split(" ");

    for(let w = 0; w < words.length; w++) {
        //spam count
        let bool = false;
        for(let i = 0; i < spam.length; i++) {
            if(spam[i].name == words[w]) {
                words[w] = { "name": words[w], "countSpam": spam[i].count + 1 };
                bool = true;
                break;
            }
        }
        if(!bool) {
            words[w] = { "name": words[w], "countSpam": 1 };
        } 

        //ham count
        bool = false;
        for(let i = 0; i < ham.length; i++) {
            if(ham[i].name == words[w].name) {
                words[w].countHam = ham[i].count + 1;
                bool = true;
                break;
            }
        }
        if(!bool) {
            words[w].countHam = 1;
        } 

        words[w].pSpam = words[w].countSpam / spam.length;
        words[w].pHam = words[w].countHam / ham.length;

        //output
        document.getElementById("words-label").innerHTML += `
            <h3>${words[w].name}</h3>
            countSpam=${words[w].countSpam}/${spam.length} * ${spam.length / (spam.length + ham.length)}<br>
            countHam=${words[w].countHam}/${ham.length} * ${ham.length / (spam.length + ham.length)}<br>
            pSpam=${words[w].pSpam}<br>
            pHam=${words[w].pHam}<br>
        `;
    }

    let resSpam = 1;
    let resHam = 1;
    for(let i = 0; i < words.length; i++) {
        resSpam *= words[i].pSpam;
        resHam *= words[i].pHam;
    }
    resSpam *= spam.length / (spam.length + ham.length);
    resHam *= ham.length / (spam.length + ham.length);

    document.getElementById("results-label").innerHTML = `
        <h2>Results</h2>
        spam=${resSpam}<br>
        ham=${resHam}
    `;

    if(resSpam == resHam) {
        document.getElementById("report-label").innerHTML = `
            <h2>Draw</h2>
        `;
    } else {
        if(resSpam > resHam) {
            document.getElementById("report-label").innerHTML = `
                <h2>Spam!</h2>
            `;
        } else {
            document.getElementById("report-label").innerHTML = `
                <h2>Ham</h2>
            `;
        }
    }

}

function loadSpam() {
    fs.readFile(__dirname + "/fin/spam.json", (err, data) => {
        if(err) {
            throw err;
        } else {
            spam = JSON.parse(data);
        }
    });
}

function loadHam() {
    fs.readFile(__dirname + "/fin/ham.json", (err, data) => {
        if(err) {
            throw err;
        } else {
            ham = JSON.parse(data);
        }
    });
}

function init() {
    loadSpam();
    loadHam();
}

document.onreadystatechange = function() {
    if(document.readyState == "complete") {
        init();
    }
}