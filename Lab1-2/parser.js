const readline = require('readline-promise').default;
const fs = require('fs');

fs.writeFile("ham.txt", "", (err) => {
    if(err) {
        throw err;
    } else {
        fs.writeFile("spam.txt", "", (err) => {
            if(err) {
                throw err;
            } else {
                loadCsv();
            }
        });
    }
});

function loadCsv() {
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
    
        // check if spam/ham
        if (line[0] == "h") {
            line = line.substring(3, line.length);
            fs.appendFile("ham.txt", line + "\n", () => {
                console.log(line);
            });
        } else if (line[0] == "s") {
            line = line.substring(4, line.length);  
            fs.appendFile("spam.txt", line + "\n", () => {
                console.log(line);
            });
        }
    });
}