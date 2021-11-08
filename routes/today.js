var express = require('express');
var moment = require('moment');
var router = express.Router();
const XMLHttpRequest = require("xhr2")
const xml2js = require('xml2js')

//write a function that fetches data from an xml api and returns a promise
// Use a web service to get the data
// Use the xml2js library to parse the xml data
async function getData(url) {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('GET', url);
    xhr.onload = () => {
      if (xhr.status === 200) {
        resolve(xhr.responseText);
      } else {
        reject(new Error(xhr.statusText));
      }
    };
    xhr.onerror = () => reject(new Error('Network error'));
    xhr.send();
  });
}

// Write a function that parses the xml and returns a json based on this example data
//<?xml version="1.0" encoding="utf-8"?>
//<Statistics Name="Consum TOTAL" NumOutputs="2" Outputs="Total consumption (kWh),Power">
//<S T="2021-11-01 00:00:00" V="3404.954" V2="3.000"/>
function parseXML(xml){
  return new Promise((resolve, reject) => {
    xml2js.parseString(xml, (err, result) => {
      if (err) {
        reject(err);
      } else {
        resolve(result);
      }
    });
  });
}

// Write an API endpoint function that fetches data from the xml api and uses the json function to parse it

router.get('/', async function (req, res, next) {
  var now = moment()
  var url = `http://bms:bms2021@5.2.250.5:7878/stats/17a13bf6-0146-fac1-ffff9ef848ef281f.${now.format("YYYYMM")}.xml`;
  const xml = await getData(url);
  const data = await parseXML(xml);
  var obj = createObject(data);
  res.json(createJson(obj));
});


function createObject(json){
  var obj = {}; //create an empty object 
  obj.name = json.Statistics.$.Name; //set the name property to the name of the object
  obj.numOutputs = json.Statistics.$.NumOutputs; //set the numOutputs property to the number of outputs
  obj.outputs = json.Statistics.$.Outputs; //set the outputs property to an array of the outputs
  obj.data = []; //create an empty array
  json.Statistics.S.forEach(function(item){ //loop through the S array
    var data = {}; //create an empty object
    data.time = moment(item.$.T, "YYYY-MM-DD HH:mm:ss").toDate(); //set the time property to the time of the item
    data.value = item.$.V; //set the value property to the value of the item
    data.value2 = item.$.V2; //set the value2 property to the value2 of the item
    obj.data.push(data); //push the data object to the data array
  });
  return obj; //return the object
}

//write a function that will create a json from a javascript object

function createJson(obj){
  var json = {}; //create an empty object
  json.name = obj.name; //set the name property to the name of the object
  json.numOutputs = obj.numOutputs; //set the numOutputs property to the number of outputs
  json.outputs = obj.outputs; //set the outputs property to an array of the outputs
  json.data = []; //create an empty array
  obj.data.forEach(function(item){ //loop through the data array
    var data = {}; //create an empty object
    data.time = moment(item.time).format("YYYY-MM-DD HH:mm:ss"); //set the time property to the time of the item
    data.value = item.value; //set the value property to the value of the item
    data.value2 = item.value2; //set the value2 property to the value2 of the item
    json.data.push(data); //push the data object to the data array
  });
  return json; //return the json
}

module.exports = router;

