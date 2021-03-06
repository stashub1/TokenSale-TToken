import React, {useState, useEffect, setState} from 'react';

import Container from "./Components/Container";
import Web3 from 'web3';
import logo from './logo.svg';
import './App.css';
import Token from "./abis/TToken.json";
import TokenSale from "./abis/TokenSale.json"

function App() {

 const [yourAddress, setYourAddress] = useState("");
 const [isLoading, setIsLoading] = useState(true);
 const [tokenPrice, setTokenPrice] = useState("");
 const [tokensSold, setTokensSold] = useState("");
 const [tokensAvailable, setTokensAvailable] = useState("");
 const [progressPercent, setProgressPercent] = useState("");
 const [yourBalance, setYourBalance] = useState("0");
 const [numberOfTokensToBuy, setNumberOfTokensToBuy] = useState("0");
 const [tokenSaleContract, setTokenSaleContract] = useState("");
 const [tokenContract, setTokenContract] = useState("");


 let web3;

 useEffect(() => {

    async function loadWeb3Call()  {
      await loadWeb3();
      await loadBlockchainData();
    }
    
    console.log('useEffect Called...');
    loadWeb3Call();
    setIsLoading(false);
 
  }, [] );


 async function buyTokens(event) {
    let web3 = window.web3;
    event.preventDefault();
    console.log("Buy tokens");

    let amountOfTokens = numberOfTokensToBuy;
    console.log("tokenSaleContract", tokenSaleContract);
    if(tokenSaleContract) {
      console.log("BuyTokens yourAddress", yourAddress);
      let countedValue = amountOfTokens * tokenPrice;
      console.log("countedValue", countedValue);
      await tokenSaleContract.methods.buyTokens(amountOfTokens).send({
        from : yourAddress,
        value : web3.utils.toWei(String(countedValue)),
        gas : 500000
      })
    }
 }

 async function getEvents() {
    const events = await tokenSaleContract.getPastEvents(
        "Sell",
         {
          filter : {id : "log_cfc0386f"},
          fromBlock : 0, 
          toBlock : "latest"
        }
    )
    console.log("getPastEvents", events);
 }

 async function listenEvents(contract) {
    console.log("listenEvents contract" , contract);
    if(contract) {
        await contract.events.Sell({}, 
        function(error, event) {
          console.log("Event", event); 
         })
        .on("connected", function(subscriptionId){
            console.log(subscriptionId);
        })
        .on('data', function(event){
            console.log("Event triggered", event); // same results as the optional callback above
            window.location.reload(false);
        })
        .on('changed', function(event){
            console.log("Event changed", event); // same results as the optional callback above

        })
        .on('error', function(error, receipt) { // If the transaction was rejected by the network with a receipt, the second parameter will be the receipt.
            console.log("Event error", error); // same results as the optional callback above
         })
      }
  }

 async function onNumberChange(value) {
    setNumberOfTokensToBuy(value);  
 }

 const loadWeb3 = async () => {
    console.log("loadWeb3");
    if (window.ethereum) {
      console.log("window.ethereum");
      window.web3 = new Web3(window.ethereum);
      await window.ethereum.enable();
    }
    else if (window.web3) {
      console.log("window.web3"); 
      window.web3 = new Web3(window.web3.currentProvider);
    }
    else {
      console.log("web3 alert"); 
      window.alert('Non-Ethereum brows  er detected. You should consider trying MetaMask!');
    }
    console.log("web3 accounts", await window.web3.eth.getAccounts());
  }

  async function loadBlockchainData()  {
    console.log("loadBlockchainData");
    web3 = window.web3;

    const accounts = await web3.eth.getAccounts();
    let userAccount = accounts[0];
    console.log("your address",  userAccount);
    setYourAddress(userAccount);
    console.log("your address after set", userAccount);

    //this.setState({ account: accounts[0] })
    //this.setState({ ethBalance })
    const networkId =  await web3.eth.net.getId()
    console.log("Network: ", networkId);

    const tokenSaleData = TokenSale.networks[networkId];
    let tokenSold;
    let tokenSaleContractAdr;
    if(tokenSaleData) {
        const tokenSaleAddress = tokenSaleData.address;
        tokenSaleContractAdr = tokenSaleAddress;
        console.log("TokenSale Address", tokenSaleAddress);
        
        const tokenSaleContract = await new web3.eth.Contract(TokenSale.abi, tokenSaleAddress);
        setTokenSaleContract(tokenSaleContract)
        let tokenPricenWei = await tokenSaleContract.methods.tokenPrice().call();
        let tokenPiceInEth =  await web3.utils.fromWei(tokenPricenWei, "Ether");
        setTokenPrice(tokenPiceInEth);

        tokenSold = await tokenSaleContract.methods.tokensSold().call();
        setTokensSold(tokenSold);

        
    }
    const tokenData = Token.networks[networkId];
    if(tokenData) {
        let tokenAddress = tokenData.address;
        console.log("Token Address", tokenAddress);
        const tokenContract = await new web3.eth.Contract(Token.abi, tokenAddress);
        setTokenContract(tokenContract);                                        
        console.log("Your Address", userAccount);
        let balanceWei = await tokenContract.methods.balanceOf(
                                        userAccount).call();
        console.log("Balance", balanceWei);
        setYourBalance(balanceWei);

        var tokensAvailable = await tokenContract.methods.balanceOf(tokenSaleContractAdr).call();
        console.log("TokensAvailable", tokensAvailable);
        setTokensAvailable(tokensAvailable);

        let progressPercent = (Math.ceil(tokensSold) / tokensAvailable) * 100;
        setProgressPercent(progressPercent);
        listenEvents(tokenSaleContract);
    }
  }

  return (
    <div className="root">
         <Container 
            yourAddress={yourAddress}
            isLoading={isLoading}
            tokenPrice = {tokenPrice}
            tokensSold = {tokensSold}
            tokensAvailable = {tokensAvailable}
            progressPercent = {progressPercent}
            yourBalance = {yourBalance}
            onNumberChange = {onNumberChange}
            numberOfTokensToBuy = {numberOfTokensToBuy}
            buyTokens= {buyTokens}
            getEvents = {getEvents}
         />
    </div>
  );
}

export default App;
