const fs = require('fs-extra')

let data = fs.readFileSync('./hold--5501911.json').toString().replace(new RegExp('"', 'g'), '')
data = data.substr(1).substr(0, data.length - 3).split(',');
// console.log(data[0])
// console.log(data[data.length - 1]);


let sum = 0;
let map = new Map()
let count = 0;
for(let d of data) {
    // console.log(d);
    let address = d.toString().split(':')[0]
    let value = parseFloat(d.toString().split(':')[1])
    // console.log(`address: ${address}`)
    // console.log(`value: ${value}`)
    if(value <= 20000){
        sum += value
        map.set(address, value);
        count++;
    }
    
    // return;
}
console.log(count);
console.log(sum);
// console.log(strMapToObj(map))
fs.outputJsonSync(`./result.json`, strMapToObj(map));

// console.log(data.length);

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