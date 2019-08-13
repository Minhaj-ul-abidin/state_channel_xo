'use strict'

var contractData = require('./Contract/contr.js')
var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var Web3 = require('web3');

var web3 = new Web3(new Web3.providers.WebsocketProvider(
    'http://localhost:8545'
));

console.log('PLEASE MAKE SURE THAT YOU HAVE STARTED Ganache-cli IF YOU WANT TO USE IT!!!');

var accounts = [];
var hostAcc = ''; 
var clientAcc = '';
var contractAddress = '';
var contractInstance = {};


app.get('/', function(req,res){
    res.sendfile('index.html');
});

var _socket = {};

var stdin = process.openStdin();
stdin.addListener("data", async (d)=>{

    await sendSignedMsg(d);
    

});

io.on('connection', async (socket)=>{

    await setmyAcc();
    await deployContract(10)
    //await setClientAcc(); <---
    

    console.log('\n\nAccounts are:--->\n',accounts);
    console.log('\n\nHost account is:--->\n',hostAcc);

    _socket = socket

    // Handshake
    // Send Game contract address as a socket emit event
    await handshake()
    

    // /Handshake

    var address = socket.handshake.address;
    var port = socket.request.connection.remotePort
    console.log( address + ':' + port + ' has connected!');

    socket.on('clientMsg',(msgData)=>{
        // validate first
        if(!authenticate(msgData, clientAcc)){
            return;
        }
        console.log('Client entered : ' + msgData.text)
    });

    socket.on('disconnect', ()=>{
        console.log( address + ':' + port + ' has disconnected!');
    })

});

http.listen(3000, ()=>{
    console.log('Listening on port :3000');
})

//-----------------------------------------------

async function setmyAcc(){
    await web3.eth.getAccounts()
    .then((acc)=>{
        accounts = acc;
        hostAcc = accounts[0];
    })
    .catch(console.log)
}

async function setClientAcc(){

    await contractInstance.methods.getchallenger()
    .call({
        from: hostAcc
    }).
    then((result)=>{
        clientAcc = result[1];
        console.log('Challenger Id is: '+ result[0] +'\nChallenger Acc is: '+ result[1] +'\nChallenger escrow is: '+ result[2]);
    })
    .catch(console.log);

}

async function handshake(){
    await _socket.emit('contract',{
        msg: 'Game Contract address is'+contractAddress,
        contractAdd: contractAddress
    });

    await _socket.on('challengeSet', async (msg)=>{
        console.log(msg);
        await setClientAcc();
    });

    await _socket.emit('Handshaken', 'Handshake complete!');
    console.log('Handshake complete!');
}

function authenticate(signedMsg, address){
    /**
     * It should make sure the signee of the 'signedMsg' is the 'address' given in argument
     * 
     * signedMsg {
     *      text: text
     *      signature: web3.eth.sign(text)
     * }
     */
    var signee = web3.eth.accounts.recover(signedMsg.text, signedMsg.signature);

    if(address == signee){
        return true;
    }
    else{
        return false;
    }
}

async function deployContract(escrowValue){

    // Don't redeploy contract is already exists
    /*if(contractAddress != ''){
        return;
    }*/

    contractInstance = new web3.eth.Contract(contractData.abi);
    var contractAdd = await contractInstance.deploy({data: contractData.bytecode.object, arguments: ['abc']})
    .send({
        from: accounts[0],
        gas: 1500000,
        gasPrice: '300',
        value: escrowValue
    })
    .then((res)=>{
        console.log('\n\nGame Contract address is:--->\n',res.options.address);
        return res.options.address;
    })
    .catch(console.log);

    contractAddress = contractAdd;
    
    contractInstance = new web3.eth.Contract(contractData.abi, contractAddress);
    
}

function validMove(){
    /**
     * It should check if the move is actually a valid move
     */
}

async function sendSignedMsg(rawMsg){
    /**
     * Get some message, sign it and bundle it up together for sending
     * Returns: ready to send 'Object' message with text and sign - 'signedMsg'
     */
    let text = rawMsg.toString().trim()

    let signature = await web3.eth.sign(text, hostAcc)
        .then((sign)=>{
            return sign;
        })
        .catch(console.log)

    let msgData = {
        text: text,
        signature: signature
    }

    _socket.emit('hostMsg', msgData);
    console.log('Host entered : ' + text);
    console.log('Sign : ' + signature);
}

// -- Move to new file - common for both players

function translateMoveToGameState(){
    /**
     * take the raw console input and translate it, if possible, to a game state - the new one, for proposing to opponent
     */
    return newGameState;
}

function checkValidMove(){
    /**
     * check if the move is valid or not
     */
}

function proposeMove(){
    /**
     * propose the move to opponent and await confirmation
     * if confirmed, update
     * if not confirmed, maybe greifing
     */

}