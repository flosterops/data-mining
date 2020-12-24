const { app, BrowserWindow, ipcMain } = require("electron");
const sheetToJson = require('csv-xlsx-to-json');
const   fs = require("fs");

const fi = require('frequent-itemset');
const apriori = require(__dirname + "/Node-Apriori/dist/apriori.js");

let retail = [];

let basket = [];

app.on("ready", () => {
    var filePath = "small.xlsx";
 
    sheetToJson.process(filePath, function(err, result){
        if(err) {
            console.log(err);
        }
    
        retail = result;

        for(let i = 0; i < retail.length; i++) {
            if(basket.length > 0) {
                let exists = false;
                for(let j = 0; j < basket.length; j++) {
                    if(retail[i].InvoiceNo == basket[j].InvoiceNo) {
                        basket[j].Goods.push(retail[i].StockCode);
                        exists = true;
                    }
                }
                if(!exists) {
                    basket.push({
                        InvoiceNo: retail[i].InvoiceNo,
                        Goods: [ retail[i].StockCode ]
                    });
                }
            } else {
                basket.push({
                    InvoiceNo: retail[i].InvoiceNo,
                    Goods: [ retail[i].StockCode ]
                });
            }
        }

        console.log("\n\n=== BASKET ===\n\n");
        console.log(basket);

        let forApriori = [];
        for(let i = 0; i < basket.length; i++) {
            forApriori.push(basket[i].Goods);
            // for(let j = 0; j < basket[i].Goods.length; j++) {
            //     if(j < 3) {
            //         let number = parseInt(basket[i].Goods[j]);
            //         if(!isNaN(number)) {
            //             forApriori[i].push(number);
                        
            //         }
            //     }
            // }
        }

        console.log("\n\n=== FOR APRIORI ===\n\n");
        console.log(forApriori);

        fs.writeFile('my.csv', "", function (err) {
            if (err) throw err;
          });

        for(let i = 0 ; i < forApriori.length; i++) {
            fs.appendFile('my.csv', forApriori[i].toString() + ",\n", function (err) {
                if (err) throw err;
              });
        }

        console.log("\n\n=== APRIORI ===\n\n");
        //console.log(fi(forApriori, 0.5, true));

        // var apriori = new apriori.Apriori(.4);
        // console.log(`Executing Apriori...`);

        // // Returns itemsets 'as soon as possible' through events.
        // apriori.on('data', function (itemset) {
        //     // Do something with the frequent itemset.
        //     var support = itemset.support;
        //     var items = itemset.items;
        //     console.log(`Itemset { ${items.join(',')} } is frequent and have a support of ${support}`);
        // });

        // // Execute Apriori on a given set of transactions.
        // apriori.exec(forApriori)
        //     .then(function (result) {
        //     // Returns both the collection of frequent itemsets and execution time in millisecond.
        //     var frequentItemsets = result.itemsets;
        //     var executionTime = result.executionTime;
        //     console.log(`Finished executing Apriori. ${frequentItemsets.length} frequent itemsets were found in ${executionTime}ms.`);
        // });

        //myself

        var Apriori = require('apriori');
        // new Apriori.Algorithm(0.15, 0.6, false).showAnalysisResultFromFile('my.csv');
        new Apriori.Algorithm(0.15, 0.6, false).analyze();

        console.log("\n\n=== DONE ===\n\n");
    });
});