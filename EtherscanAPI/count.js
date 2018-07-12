const rp = require('request-promise')
const fs = require('fs-extra')

let accounts = new Set();
let heldAccounts = new Map();
let holdAccounts = new Map();

let contractDeploy = 4165158;
let fromBlock = 4570657
let toBlock = 4570584
const agtAddress = "0xed1eba8b87cd7e04e9389f65f7aeca750c85a010";
// let toBlock = 'latest'
const snapshotOpts = {
  uri: 'https://api.etherscan.io/api',
  qs: {
    module: 'proxy',
    action: 'eth_blockNumber',
    apikey: 'RJUYFCNTU9PCZYRQU49BRDPAD1AE8H6JT1',
  },
  json: true,
}

async function fetchLogs(opts) {
  let res = await rp.get(opts);
  return res.result;
}

async function count() {
  let snapshot = Number.parseInt(await fetchLogs(snapshotOpts));
  console.log("snapshot", snapshot);
  let interval = 10000;
  let opts;
  while (fromBlock < snapshot) {
    if (fromBlock >= 5510657 && fromBlock < 5520657) {
      interval = 1000;
    }
    else if(fromBlock >= 5540657)
      interval = 1000;
    // else if(fromBlock >= 4700584 && fromBlock < 4710584) {
    //   interval = 1000;
    // }
    // else if(fromBlock >= 4810584 && fromBlock < 4826584) {
    //   interval = 2000;
    // }
    else interval = 10000;
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
        address: agtAddress,
        topic0: '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef',
        apikey: 'DTXTXHA7MVZNP4EJBR3IF2IRAFBAETYPJY',
      },
      json: true,
    }
    console.log(`Block:${fromBlock}--${toBlock}`);
    let logs = Array.from(await fetchLogs(opts))
    console.log("logs.length:", logs.length);
    if (logs.length >= 1000) {
      throw 'logs loss';
    }
    // console.log(logs)
    logs.forEach(log => {
      accounts.add(xAddress(log.topics[1]))
      accounts.add(xAddress(log.topics[2]))
    })
    console.log("accounts.size:", accounts.size)
    fromBlock = toBlock
  }

  fs.outputFileSync('./accounts.json', Array.from(accounts));

  // let promises = [];
  // let accounts = fs.readFileSync("./accounts.json").toString().split(",");
  // for (let address of accounts) {
  //   // console.log("address", address);
  //   opts = {
  //     uri: 'https://api.etherscan.io/api',
  //     qs: {
  //       module: 'account',
  //       action: 'tokenbalance',
  //       contractaddress: '0xed1eba8b87cd7e04e9389f65f7aeca750c85a010',
  //       address,
  //       tag: 'latest',
  //       apikey: 'RJUYFCNTU9PCZYRQU49BRDPAD1AE8H6JT1',
  //     },
  //     json: true,
  //   }

  //   // promises.push(fetchLogs(opts));
  //   let balance = await fetchLogs(opts);
  //   balance *= 1e-18;
  //   console.log(`account:${address},balance:${balance}`)
  //   if (balance > 0) {
  //     holdAccounts.set(address, balance);
  //     if(address == "0x943dcf00f32ed8efcfd7f33145a61496af00ee5d") {
  //       let heldfile = `./held--${snapshot}.json`
  //       let holdfile = `./hold--${snapshot}.json`
  //       fs.outputJsonSync(holdfile, strMapToObj(holdAccounts));
  //       fs.outputJsonSync(heldfile, strMapToObj(heldAccounts));
  //     }
  //   } else {
  //     heldAccounts.set(address, balance);
  //   }
  // }

  // Promise.all(promises).then(values => {
  //   let addresses = Array.from(accounts);
  //   console.log(addresses.length+'--'+values.length);
  //   for (let i=0;i<addresses.length;i++) {
  //     console.log(`account:${addresses[i]},balance:${values[i]}`)
  //     if (values[i] > 0) {
  //       holdAccounts.set(addresses[i], values[i]);
  //     } else {
  //       heldAccounts.set(addresses[i], values[i]);
  //     }
  //   }
  //   console.log("=================")
  //   console.log("accout:", accounts.size);
  //   console.log("holders:", holdAccounts.size);
  //   console.log("balanceAcount:", holdAccounts.size + heldAccounts.size);
    

  // })
  // let heldfile = `./held--${snapshot}.json`
  // let holdfile = `./hold--${snapshot}.json`
  // let todofile = `../todo.json`
  // fs.outputJsonSync(holdfile, strMapToObj(holdAccounts));
  // fs.outputJsonSync(todofile, strMapToObj(holdAccounts));
  // fs.outputJsonSync(heldfile, strMapToObj(heldAccounts));
}

function xAddress(a) {
  return '0x' + a.slice(-40)
}

function bulkObj2csv(objs, fields) {
  const header = fields.join(',')
  const rows = [header]
  objs.forEach((obj) => {
    const row = fields
      .map(f => obj[f])
      .join(',')
    rows.push(row)
  })
}

function strMapToObj(strMap) {
  let obj = Object.create(null);
  for (let [k,v] of strMap) {
      obj[k] = v;
  }
  return obj;
}
function objToStrMap(obj) {
  let strMap = new Map();
  for (let k of Object.keys(obj)) {
      strMap.set(k, obj[k]);
  }
  return strMap;
}

count()