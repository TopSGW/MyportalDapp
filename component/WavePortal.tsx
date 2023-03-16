import {  ethers } from "ethers";
import { getAddress } from "ethers/lib/utils";
import React, { useEffect, useState } from "react";
import { addEmitHelpers } from "typescript";

import abi from '../utils/WavePortal.json';
const getEthereumObject = () => window.ethereum;



/*
 * This function returns the first linked account found.
 * If there is no account linked, it will return null.
 */
const findMetaMaskAccount = async () => {
  try {
    const ethereum = getEthereumObject();

    /*
    * First make sure we have access to the Ethereum object.
    */
    if (!ethereum) {
      console.error("Make sure you have Metamask!");
      return null;
    }

    console.log("We have the Ethereum object", ethereum);
    const accounts = await ethereum.request({ method: "eth_accounts" });

    if (accounts.length !== 0) {
      const account = accounts[0];
      console.log("Found an authorized account:", account);
      return account;
    } else {
      console.error("No authorized account found");
      return null;
    }
  } catch (error) {
    console.error(error);
    return null;
  }
};

interface WaveType{
  address: string,
  timestamp: Date,
  message: string
}

const initial: WaveType[] = []



const WavePortal = () => {

  const [currentAccount, setCurrentAccount] = useState("");
  const [allWaves, setAllWaves] = useState(initial);
  const [check ,setCheck] = useState(false);
  //const contractAddress = "0xA665012db1C7a7A4B0BFF581D399a1a29220Fe39";
  const contractAddress =  "0xc6b780FF8467a44e4354bF5722FdD6aF12336ad9";
  const contractABI = abi.abi;
  /*
   * The passed callback function will be run when the page loads.
   * More technically, when the App component "mounts".
   */
  const connectWallet = async () => {
    try{
      const ethereum = await getEthereumObject();
      if(!ethereum){
        alert("Install MetaMask");
        return;
      }
      const accounts = await ethereum.request({method : "eth_requestAccounts"});
      console.log("Connected", accounts[0]);
      setCurrentAccount(accounts[0]);
    }catch(err)
    {
      console.error(err);
    }
  }
  const checkIfWalletIsConnected = async () => {
    try {
      const { ethereum } = window;
      if (!ethereum) {
        console.log("Make sure you have metamask!");
        return;
      } else {
        console.log("We have the ethereum object", ethereum);
      }

      const accounts = await ethereum.request({ method: 'eth_accounts' });

      if (accounts.length !== 0) {
        const account = accounts[0];
        console.log("Found an authorized account:", account);
      } else {
        console.log("No authorized account found")
      }
    } catch (error) {
      console.log(error);
    }
  }  
  const getAllWaves = async () =>{
    try{
      const {ethereum} = window;
      
      if(ethereum){
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const wavePortalContract = new ethers.Contract(contractAddress, contractABI , signer);
        console.log("hello here!!");
        const waves:any[] = await wavePortalContract.getAllWaves();

        let wavesCleaned: WaveType[] = [];
        waves.forEach(wave => {
          wavesCleaned.push({
            address: wave.waver,
            timestamp: new Date(wave.timestamp * 1000),
            message: wave.message
          })
        });
        setAllWaves(wavesCleaned);
        wavePortalContract.on("NewWave", (from, timestamp, message) => {    // this is hook
          console.log("NewWave", from, timestamp, message);

          setAllWaves(prevState => [...prevState, {
            address: from,
            timestamp: new Date(timestamp * 1000),
            message: message
          }]);
        });
      }
      else{
        console.log("Ethereum object don't exist");
      }
    }catch(err){
      console.log(err);
    }
  } 

  const wave = async () =>{
    try{
      const {ethereum} = window;
      if(ethereum){
        const provider = new ethers.providers.Web3Provider(ethereum);
        const singer = provider.getSigner();
        const wavePortalContract = new ethers.Contract(contractAddress, contractABI, singer);
        let count = await wavePortalContract.getTotalWaves();
        console.log("Receive wave total count..", count.toNumber());
        const wave_Txt = await wavePortalContract.wave("I am samrtcontract!");
        console.log("Mining..." , wave_Txt.hash);
        await wave_Txt.wait();

        console.log("Mined -- ", wave_Txt.hash);
        count = await wavePortalContract.getTotalWaves();
        console.log("Receive wave total count..", count.toNumber());
      }else{
        console.log("Ethereum object doesn't exit");
      }
    }catch(err)
    {
      console.log(err);
    }
  }
  useEffect(() => {
    checkIfWalletIsConnected();
   }, []);

  return (
    <div className="mainContainer">
      <div className="dataContainer">
        <div className="header">
          👋 Hey there!
        </div>

        <div className="bio">
          I am Farza and I worked on self-driving cars so that's pretty cool
          right? Connect your Ethereum wallet and wave at me!
        </div>

        <button className="waveButton" onClick={wave}>
          Wave
        </button>
        <button className="waveButton" onClick={getAllWaves}>
          View allwave
        </button>
        { !currentAccount && (
          <button className="waveButton" onClick={connectWallet}>
            Connect Wallet
          </button>)
        }
        {allWaves.map((wave, index) => {
          return (
            <div key={index} style={{ backgroundColor: "OldLace", marginTop: "16px", padding: "8px" }}>
              <div>Address: {wave.address}</div>
              <div>Time: {wave.timestamp.toString()}</div>
              <div>Message: {wave.message}</div>
            </div>)
        })}
      </div>
    </div>
  );
};

export default WavePortal;