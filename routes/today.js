var express = require('express');
var moment = require('moment');
var router = express.Router();
const XMLHttpRequest = require("xhr2")
const xml2js = require('xml2js')


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

router.get('/', async function (req, res, next) {
  var now = moment()
  var url = `YOUR API ENDPOINT`;
  const xml = await getData(url);
  const data = await parseXML(xml);
  var obj = createObject(data);
  res.json(createJson(obj));
});


function createObject(json){
  var obj = {}; //create an empty object 
  obj.name = json.Statistics.$.Name; 
  obj.numOutputs = json.Statistics.$.NumOutputs; 
  obj.outputs = json.Statistics.$.Outputs;
  obj.data = []; //create an empty array
  json.Statistics.S.forEach(function(item){ 
    var data = {}; 
    data.time = moment(item.$.T, "YYYY-MM-DD HH:mm:ss").toDate(); 
    data.value = item.$.V; 
    data.value2 = item.$.V2; 
    obj.data.push(data); 
  });
  return obj; 
}

function createJson(obj){
  var json = {}; 
  json.name = obj.name; 
  json.numOutputs = obj.numOutputs; 
  json.outputs = obj.outputs;
  json.data = []; 
  obj.data.forEach(function(item){ 
    var data = {};
    data.time = moment(item.time).format("YYYY-MM-DD HH:mm:ss"); 
    data.value = item.value; 
    data.value2 = item.value2; 
    json.data.push(data); 
  });
  return json; //return the json
}

module.exports = router;

