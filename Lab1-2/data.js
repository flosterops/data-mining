const readline = require('readline-promise').default;
const fs = require('fs');

let ham = [];
let spam = [];

let rlp = readline.createInterface({
    terminal: false,
    input: fs.createReadStream("data.csv")
});

rlp.forEach((line, index) => {
    line = line.toLowerCase();
    line = line.replace("-", " ");
    line = line.replace("  ", " ");

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
    line = line.replace(/[^a-z\s]/g, '');

    // remove spam/ham
    if (line[0] == "h") {
        line = line.substring(3, line.length);
        ham.push(line);
    } else if (line[0] == "s") {
        line = line.substring(4, line.length);  
        spam.push(line);   
    }

    console.log(line);
});

  