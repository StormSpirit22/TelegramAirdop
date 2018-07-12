const Web3 = require('web3')
const fs = require('fs-extra')
const BN = require('bignumber.js')
var sleep = require('sleep');

const config = require('./config.json');

//https://mainnet.infura.io/oK04aO1YTgBPEYzhcy8G
//https://kovan.infura.io/oK04aO1YTgBPEYzhcy8G
//key: c3975d6a54a6383e035e5568ae54853f73f02701a570645d3b051f6d8ca289bf
//test key: 8015219b1d811f81be53fe683609013295a4b51da169a2bb88746fcd222f2703
//atn:	0x461733c17b0755ca5649b6db08b3e213fcf22546
//test atn: 0x277011E8434Da190d8Dd15B4196c646A82c6113B
/*
{
    "endpoint": "https://kovan.infura.io/oK04aO1YTgBPEYzhcy8G",
    "private_key": "8015219b1d811f81be53fe683609013295a4b51da169a2bb88746fcd222f2703",
    "atn": "0x277011E8434Da190d8Dd15B4196c646A82c6113B"
  }

  {
    "endpoint": "https://mainnet.infura.io/oK04aO1YTgBPEYzhcy8G",
    "private_key": "c3975d6a54a6383e035e5568ae54853f73f02701a570645d3b051f6d8ca289bf",
    "atn": "0x461733c17b0755ca5649b6db08b3e213fcf22546"
  }
  
  
 */
const web3 = new Web3(new Web3.providers.HttpProvider(config.endpoint))

var privateKeyString = config.private_key;
var myAccount = web3.eth.accounts.privateKeyToAccount("0x" + privateKeyString);
var owner = myAccount.address;
web3.eth.accounts.wallet.add(myAccount);
console.log("owner", owner);

let atnAbiJson = JSON.parse(fs.readFileSync("./ATN.abi"))

const atn = new web3.eth.Contract(atnAbiJson, config.atn);

async function run() {

    let todoFile = `./differences.json`;
    let doneFile = `./done.json`;

    // fs.outputFileSync(todoFile, fs.readFileSync('EtherscanAPI/hold--5501911.json').toString());

    let todos = objToStrMap(fs.readJsonSync('todo.json'))
    let dones = objToStrMap(fs.readJsonSync('done.json'))

    // console.log(todos);
    let i = 0;
    let output = '';
    let outputFile = `./output.txt`;

    let error = false;
    let promises = [];
    let tmpNonce = parseInt(fs.readFileSync('./tmpNonce.txt'));
    //231
    console.log("tmpNonce read file", tmpNonce);
    // while(i < todos.length) {
    //   let promises = [];
    //   var nonce = await web3.eth.getTransactionCount(owner);
    //   console.log('nonce', nonce);
    //   while(nonce - tmpNonce != 5) {
    //     nonce = await web3.eth.getTransactionCount(owner);
    //   }

    //   tmpNonce = nonce;
    //   console.log("tmpNonce write file", tmpNonce);
    //   fs.writeFileSync('./tmpNonce.txt', tmpNonce);

    //   for(let index = 0; index < 5; index++) {
    //     let address = todos[i][0];
    //     let value = todos[i][1];
    //     console.log("address", address)
    //     console.log("value", value)
    //     i++;
    //     if(value < 20000 && i < todos.length) {

    //       value = Number.parseFloat(value).toFixed(2);
    //       value = new BN(value);
    //       value = value.mul(1e+18);

    //       console.log('value',value.toNumber()); 
    //       output += 'value ' + value.toNumber() + '\n';

    //       let tx = {};
    //       tx.address = address;
    //       const originalAtn = await atn.methods.balanceOf(address).call() * 1e-18;

    //       console.log(`Address user ${address} original ATN is ${originalAtn}`);
    //       output += (`Address user ${address} original ATN is ${originalAtn}` + '\n');

    //       tx.balance = originalAtn;
    //       const tokenBalance = await atn.methods.balanceOf(owner).call() * 1e-18;

    //       console.log(`Address owner ${owner} tokenBalance is ${tokenBalance}`);
    //       output += (`Address owner ${owner} tokenBalance is ${tokenBalance}` + '\n');
    

    //       promises.push(atn.methods['transfer(address,uint256)'](address, value)
    //         .send({
    //           from: owner,
    //           // gasPrice: 5000000000,
    //           gas: 4700000,
    //           nonce: nonce
    //         }).on('transactionHash', hash => {
    //           console.log("hash:", hash);
    //           output += 'hash: ' + hash + '\n';
    //           tx.hash = hash;
    //         })
    //         .on('receipt', receipt => {
    //           tx.receipt = receipt;
    //         })
    //         .on('error', error => {
    //           console.log('ERROR!\n', error);
    //           output += 'ERROR!\n' + error + '\n';
    //           error = true;
    //         })
    //         .catch(error => {
    //           console.log("CATCH ERROR ", error);
    //           output += 'CATCH ERROR!\n' + error + '\n';
    //           error = true;
    //         }))
    //       }
    //       nonce ++;
    //   }
      
    //   await Promise.all(promises).then( res => {
    //     if(res) {
    //       // console.log("res", res);
    //       let receipt = JSON.stringify(res[0]) + '\n' 
    //       + JSON.stringify(res[1]) + '\n'
    //       + JSON.stringify(res[2]) + '\n' 
    //       + JSON.stringify(res[3]) + '\n' 
    //       + JSON.stringify(res[4]) + '\n' 
    //       output += receipt;
    //     }
        
    //   })
    //   fs.appendFile('./output.txt', output);
    //   output = '';
    // }
    for(let [address, value] of todos) {
        console.log("address", address)
        console.log("value", value)

        var nonce = await web3.eth.getTransactionCount(owner);
        console.log('nonce', nonce);
        output += 'nonce: ' + nonce + '\n';
        while(nonce - tmpNonce != 1) {
          nonce = await web3.eth.getTransactionCount(owner);
        }
        if(value < 20000) {
            tmpNonce = nonce;
            console.log("tmpNonce write file", tmpNonce);
            fs.writeFileSync('./tmpNonce.txt', tmpNonce);

            value = Number.parseFloat(value).toFixed(5);
            value = new BN(value);
            value = value.mul(1e+18);

            console.log('value',value.toNumber()); 
            output += 'value ' + value.toNumber() + '\n';

            let tx = {};
            tx.address = address;
            const originalAtn = await atn.methods.balanceOf(address).call() * 1e-18;

            console.log(`Address user ${address} original ATN is ${originalAtn}`);
            output += (`Address user ${address} original ATN is ${originalAtn}` + '\n');

            tx.balance = originalAtn;
            const tokenBalance = await atn.methods.balanceOf(owner).call() * 1e-18;

            console.log(`Address owner ${owner} tokenBalance is ${tokenBalance}`);
            output += (`Address owner ${owner} tokenBalance is ${tokenBalance}` + '\n');
      

            await atn.methods['transfer(address,uint256)'](address, value)
              .send({
                from: owner,
                gasPrice: 4000000000,
                gas: 4700000,
                nonce: nonce,
              }).on('transactionHash', hash => {
                console.log("hash:", hash);
                output += 'hash: ' + hash + '\n';
                tx.hash = hash;
              })
              .on('receipt', receipt => {
                tx.receipt = receipt;
              })
              .on('error', error => {
                console.log('ERROR!\n', error);
                output += 'ERROR!\n' + error + '\n';
                error = true;
              })
              .catch(error => {
                console.log("CATCH ERROR ", error);
                output += 'CATCH ERROR!\n' + error + '\n';
                error = true;
              })

            if(error == false) {
              const doneBalance = await atn.methods.balanceOf(address).call() * 1e-18;
              tx.balance = doneBalance;
  
              console.log(`Address user ${address} ATN now is ${doneBalance}`); 
              output += (`Address user ${address} ATN now is ${doneBalance}` + '\n');
  
              todos.delete(address);
              dones.set(address, tx);
              fs.appendFile('./tempDone.txt', JSON.stringify(tx) + '\n', function(err) {
                // console.log(err);
              })
            }
            

            fs.appendFile(outputFile, output);

            output = '';
            error = false;
        }
    }
    fs.outputJsonSync(`./newTodo.json`, todos);
    fs.outputJsonSync(`./newDone.json`, dones);
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

run()