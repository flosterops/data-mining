const stats = require('simple-statistics');
const KMeans = require('shaman').KMeans;
const dataForge = require('data-forge');
require('data-forge-fs');
// const config = require('./config');
const plotly = require('plotly')('username','apiKey');
const opn = require('opn');

// reading base file and put dataframe on df variable
const df = dataForge.readFileSync('iris.csv').parseCSV();

// create a subset and converting all values to float
const subset = df.subset(["sepallength", "sepalwidth","petallength", "petalwidth"]).select(function (row) {
    return {
       sepallength: parseFloat(row.sepallength),
       sepalwidth: parseFloat(row.sepalwidth),
       petallength: parseFloat(row.petallength),
       petalwidth: parseFloat(row.petalwidth)
    };
 });

/**
 * Summary function return the overview about the data serie
 * @param data array
 */
function summary(column) {
    return {
       min: stats.min(column),
       max: stats.max(column),
       sum: stats.sum(column),
       median: stats.median(column),
       mode: stats.mode(column),
       mean: stats.mean(column),
       variance: stats.variance(column),
       stdDeviation: stats.standardDeviation(column),
       quantile: {
          q1: stats.quantile(column, 0.25),
          q3: stats.quantile(column, 0.75)
       }
    }
 }
 // invoke and show summary function for sepalwidth serie
 console.log('sepallength');
 console.log(summary(subset.getSeries('sepallength').toArray()));
console.log('sepalwidth');
 console.log(summary(subset.getSeries('sepalwidth').toArray()));
console.log('petallength');
 console.log(summary(subset.getSeries('petallength').toArray()));
console.log('petalwidth');
 console.log(summary(subset.getSeries('petalwidth').toArray()));

 // build clustering model
const kmeans = new KMeans(3);
// execute clustering using dataset
kmeans.cluster(subset.toRows(), function (err, clusters, centroids) {
   // show any errors
   console.log(err);
// show the clusters founds
   console.log(clusters);
// show the centroids
   console.log(centroids);

   // dictionary for aux the indexes read
const indexes = {
    sepallength:0,
    sepalwidth:1,
    petallength:2,
    petalwidth:3
}

// build centroids graph model
const centroidTrace = {
    x: centroids.map(function (c){
      return c[indexes["sepallength"]]; // 0 — sepallength
    }),
    y: centroids.map(function (c){
      return c[indexes["petallength"]]; // 2 — petallength
    }),
    mode: 'markers',
    type: 'scatter',
    name: 'Centroids',
    marker: {
      color: '#000000',
      symbol: 'cross',
      size: 10
    }
 };

 // adding centroids data on the plotData array
const plotData = [centroidTrace];
// build clusters graph model
clusters.forEach(function (cluster, index) {
   const trace = {
      x: cluster.map(function (c) {
         return c[indexes["sepallength"]];
      }),
      y: cluster.map(function (c) {
         return c[indexes["petallength"]];
      }),
      jitter: 0.3, 
      mode: 'markers',
      type: 'scatter',
      name: 'Cluster ' + index
   }
   // add cluster graph data on plotData
   plotData.push(trace);
});

// set plotly graph layout
const layout = {
    title: 'Iris Clustering',
    xaxis: {
     title: 'sepallength'
    },
    yaxis: {
     title: 'petallength'
    }
 };
 //set graph options
 var graphOptions = {
    layout: layout, //set layout
    filename: 'Iris-clustering', //set filename
    fileopt: 'overwrite' // if exists just overwrite
 };

 /**
 * Build Plotly graph 
 */
plotly.plot(plotData, graphOptions, function (err, msg) {
    if (!err) {
      // if build without erros show the message and open browser with graph
    console.log(`Success! The plot ${msg.filename} can be found at ${ msg.url}`);
    opn(msg.url);
    process.exit();
    }
   });
 
});