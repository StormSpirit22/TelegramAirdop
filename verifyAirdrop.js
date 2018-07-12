const rp = require('request-promise')
const fs = require('fs-extra')

async function fetchLogs(opts) {
    let res = await rp.get(opts);
    return res.result;
  }

let fromBlock = 5513057
let toBlock = 5513057

const snapshotOpts = {
    uri: 'https://api.etherscan.io/api',
    qs: {
      module: 'proxy',
      action: 'eth_blockNumber',
      apikey: 'RJUYFCNTU9PCZYRQU49BRDPAD1AE8H6JT1',
    },
    json: true,
  }
  
let sendedMap1 = new Map();
let sendedMap2 = new Map();

async function count() {
    console.log('start');
    let snapshot = Number.parseInt(await fetchLogs(snapshotOpts));
    console.log("snapshot", snapshot);
    let interval = 1000;
    let opts;
    while (fromBlock < snapshot) {
      if(fromBlock >= 5522057 && fromBlock <= 5541000) fromBlock = 5541057;
      if(fromBlock == 5560057) toBlock = snapshot;
      toBlock = fromBlock + interval;
      if (toBlock > snapshot) {
        toBlock = snapshot
      }
      opts = {
        uri: 'https://api.etherscan.io/api',
        qs: {
          module: 'logs',
          action: 'getLogs',
          fromBlock,
          toBlock,
          address: '0x461733c17b0755ca5649b6db08b3e213fcf22546',
          topic0: '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef',
          topic1: '0x000000000000000000000000c968bc1a64dd9fd75c363aee1b420070db967d00',
          apikey: 'DTXTXHA7MVZNP4EJBR3IF2IRAFBAETYPJY',
        },
        json: true,
      }
      opts2 = {
        uri: 'https://api.etherscan.io/api',
        qs: {
          module: 'logs',
          action: 'getLogs',
          fromBlock,
          toBlock,
          address: '0x461733c17b0755ca5649b6db08b3e213fcf22546',
          topic0: '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef',
          topic1: '0x00000000000000000000000029f0991744Bb2F3dFF65968941bFA950456793Ef',
          apikey: 'DTXTXHA7MVZNP4EJBR3IF2IRAFBAETYPJY',
        },
        json: true,
      }
      console.log(`Block:${fromBlock}--${toBlock}`);
      let logs = Array.from(await fetchLogs(opts))
      let logs2 = Array.from(await fetchLogs(opts2))

      console.log("logs.length:", logs.length);
      console.log("logs2.length:", logs2.length);

      if (logs.length >= 1000) {
        throw 'logs loss';
      }
      if(logs.length > 0){
        logs.forEach(log => {
            // console.log("log", log);
            sendedMap1.set(xAddress(log.topics[2]), parseInt(log.data.toString(), 16) * 1e-18)
            // accounts.add(xAddress(log.topics[1]))
            // accounts.add(xAddress(log.topics[2]))
          })
      }
      if(logs2.length > 0) {
        logs2.forEach(log => {
          sendedMap2.set(xAddress(log.topics[2]), parseInt(log.data.toString(), 16) * 1e-18)
        })
      }

    //   console.log("accounts.size:", accounts.size)
      fromBlock = toBlock
    }
    console.log("map1 size", sendedMap1.size);
    console.log("map2 size", sendedMap2.size);

    fs.outputJsonSync(`./map1.json`, strMapToObj(sendedMap1));
    fs.outputJsonSync(`./map2.json`, strMapToObj(sendedMap2));


    let allHolders = objToStrMap(fs.readJsonSync('hold.json'))
    console.log(allHolders.size);

    for(let [k, v] of sendedMap2) {
      sendedMap1.set(k, v);
    }
    console.log(sendedMap1.size);

    let differences = new Map();
    for(let[k, v] of allHolders) {
      if(sendedMap1.has(k)) {
        let value = sendedMap1.get(k);
        if(Number.parseFloat(v).toFixed(2) != Number.parseFloat(value).toFixed(2)) {
          // differences.set(k,v);
          console.log(`Holders' v is ${v}, value is ${value}`);
        }
      }
      else differences.set(k,v);
    }
    console.log(differences.size);
    fs.outputJsonSync(`./differences.json`, strMapToObj(differences));
    // console.log(sendedMap1.size + sendedMap2.size);
    // console.log(allHolders);
    // for(let[address, value] of allHolders) {
      
    // }

    fs.outputJsonSync(`./verify.json`, strMapToObj(sendedMap1));

}


function xAddress(a) {
    return '0x' + a.slice(-40)
}

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

count()
