const fs = require("fs-extra")
const fast_csv = require("fast-csv")

//spider etherscan data
let spiderResults = fs.readFileSync("../Spider/results.csv", "utf8").toString().replace(/"/g, '').split('\n').splice(2);
let length = spiderResults.length;
spiderResults.splice(length - 61, 60)

let spiderMap = new Map();

for(let r of spiderResults) {
    let result = r.split(',');
    // console.log(result);
    if(result != '' && result != null)
        spiderMap.set((result[1].toString()), parseFloat(result[2].toString()));
}

//etherscan api data
let data = fs.readFileSync('./hold--5501911.json').toString().replace(new RegExp('"', 'g'), '')
data = data.substr(1).substr(0, data.length - 3).split(',');

let sum = 0;
let map = new Map()
let count = 0;
for(let d of data) {
    // console.log(d);
    let address = d.toString().split(':')[0]
    let value = parseFloat(d.toString().split(':')[1])
    if(value <= 20000){
        sum += value
        map.set(address, value);
        count++;
    }
}
console.log(count);
console.log(sum);
fs.outputJsonSync(`./result.json`, strMapToObj(map));

//verify Top 1000 hodlers
for (let [k, v] of spiderMap) {
    
    //Do not include our addresses
    if(k != '0x9df597c52f331bf4538eff59aafbcea3464f866d' && k != '0xa2db035270d32cad0405bbb6dbb266f915ac8b2f'){
        if(!map.has(k)) {
            console.log(`Map doesn't have key ${k}, Data is not consistent, verify failed!`);
            return;
        }
        let v2 = map.get(k);
        if(v2 == undefined || (v2 != v && Math.abs(v2 - v) > 0.0001)) {
            console.log(`Map's key ${k}'s value is not ${v} but ${v2}, Data is not consistent, verify failed!`);
            return;
        }
        // console.log(`k is ${k}, v is ${v}, v2 is ${v2}`);

    }
    
}
console.log("Verify Success!")

function objToStrMap(obj) {
    let strMap = new Map();
    for (let k of Object.keys(obj)) {
      strMap.set(k, obj[k]);
    }
    return strMap;
  }


  function strMapToObj(strMap) {
    let obj = Object.create(null);
    for (let [k, v] of strMap) {
      obj[k] = v;
    }
    return obj;
  }