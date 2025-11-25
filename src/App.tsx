import { useState,useEffect } from 'react';

//Helper functions to convert hex color codes to HSL and CSS formats
//and derive different colors
import {hexToHSL,findHSL2,HSLToCss} from './utils/colors';

import './App.css'

//AWS Lambda Api to interact with DynamoDB tables
const AWS_URL = "https://zxxgrnmd48.execute-api.us-east-1.amazonaws.com/Prod";


function App() {
  //States- toggle, overlay color, opacity, show settings flag
  const [isEnabled, setIsEnabled] = useState(true);
  const [overlayColor, setOverlayColor] = useState("#26A69A");
  const [opacity, setOpacity] = useState(0.1);
  const [showSettings, setShowSettings] = useState(false);
  const [loginId, setLoginId] = useState("");

  //init
  useEffect(() => {

    //isEnabled handler
    chrome.storage.local.get({ isEnabled: true }, ({isEnabled}: { isEnabled:boolean }) => {
      setIsEnabled(isEnabled);
    });

    const isEnabledHandler = (
      changes: Record<string,chrome.storage.StorageChange>,
      storageType: string
    ) => {
      if(storageType==='local' && changes.isEnabled){
        setIsEnabled(changes.isEnabled.newValue as boolean);
      }
    };

    //overlayColor handler
    chrome.storage.local.get({ overlayColor: "#26A69A" }, ({overlayColor}: { overlayColor:string }) => {
      setOverlayColor(overlayColor);
    });

    const overlayColorHandler = (
      changes: Record<string,chrome.storage.StorageChange>,
      storageType: string
    ) => {
      if(storageType==='local' && changes.overlayColor){
        setOverlayColor(changes.overlayColor.newValue as string);
      }
    };


    //opacity handler
    chrome.storage.local.get({ opacity: 0.1 }, ({opacity}: { opacity:number }) => {
      setOpacity(opacity);
    });

    const opacityHandler = (
      changes: Record<string,chrome.storage.StorageChange>,
      storageType: string
    ) => {
      if(storageType==='local' && changes.opacity){
        setOpacity(changes.opacity.newValue as number);
      }
    };


    //add all handlers
    chrome.storage.onChanged.addListener(isEnabledHandler);
    chrome.storage.onChanged.addListener(opacityHandler);
    chrome.storage.onChanged.addListener(overlayColorHandler);
    return () => {
      chrome.storage.onChanged.removeListener(isEnabledHandler);
      chrome.storage.onChanged.removeListener(overlayColorHandler);
      chrome.storage.onChanged.removeListener(opacityHandler);
    }
  }, []);

  //save color, opacity, login, to aws DynamoDB table
  async function saveProfile(loginId: string){
    const body = JSON.stringify({ userId: loginId, color: overlayColor, opacity });
    const res = await fetch(`${AWS_URL}/profiles`, {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body
    });
    if(!res.ok){
      throw new Error('Failure to save profile');
    }
  }

  //grab color, opacity, from aws DynamoDB table by login
  async function loadProfile(loginId: string){
    const res = await fetch(`${AWS_URL}/profiles?userId=${encodeURIComponent(loginId)}`);
    if(!res.ok){
      throw new Error('Failure to load profile');
    }
    const profile = await res.json();
    setOverlayColor(profile.color);
    setOpacity(profile.opacity);
    chrome.storage.local.set({overlayColor: profile.color, opacity: profile.opacity});
  }


  //Preset options
  const applyPreset = (color:string) => {
    setOverlayColor(color);
    setOpacity(0.1);
    chrome.storage.local.set({
      overlayColor:color, opacity:0.1
    });
  };

  //Set background color
  useEffect(()=>{
    document.documentElement.style.setProperty('--thumb-color',overlayColor);
    const HSL1 = hexToHSL(overlayColor);
    const HSL2 = findHSL2(HSL1.H,HSL1.S,HSL1.L);
    const color2 = HSLToCss(HSL2,0.1);
    document.documentElement.style.setProperty('--gradient-color1',overlayColor);
    document.documentElement.style.setProperty('--gradient-color2',color2);

  },[overlayColor]);

  //Set opacity number
  useEffect(()=>{
    const opacityRounded = Math.round(opacity*100)/100;
    document.documentElement.style.setProperty('--overlay-opacity',String(opacityRounded));
  },[opacity]);



  //Shows settings page or main page based on showSettings
  return (

  <div className="window">
  
  {showSettings ? (
    <div className="settingsPage">
      <div className="settingsWrap">
      <div className="settingsTitle">Sync Across Devices By Email Or Username</div>
      <div className="loginIdSave">  
        <input type="text" className="loginIdTextBox" placeholder="Email/Username" value={loginId} 
        onChange={(event) => setLoginId(event.target.value)}></input>
      </div>
      <div className="saveBack">
      <button className="settingsBtn" onClick={()=>setShowSettings(false)}>Back</button>
      <button className="settingsBtn" onClick={()=>loadProfile(loginId)}>Load</button>
      <button className="settingsBtn" onClick={()=>saveProfile(loginId)}>Save</button>
      </div>
      </div>
      </div>
  ):(
  <>
  <img className="settings" src="images/settings.png" alt="Settings" onClick={()=>setShowSettings(true)}></img>
  <div className="colorAlphaBox">

  <div className="colorPicker">
  <img src="images/color-wheel-icon.svg.png" id="colorWheel"></img>
  <input type="color" value={overlayColor} id="color" onChange={(e)=>{
    const next = e.target.value;
    setOverlayColor(next);
    chrome.storage.local.set({overlayColor:next});
  }}></input>
  <div id="colorString">{overlayColor}</div>
  </div>

  
  <div className="alphaBox">

  <div className="alphaSlider">
  <input type="range" id="alphaValue" min="0" max="1" step="0.01" value={opacity} onChange={(e)=>{
    const next = Number(e.target.value);
    setOpacity(next);
    chrome.storage.local.set({opacity:next});
  }}></input>
  <div id="alphaText">{Math.round(opacity * 100)}%</div>
  </div>

  <div className="alphaTitle" id="opacity">Opacity</div>

    <div className="flexOptions">
        <input type="button" value="Warm" id="warmButton" className="presetButton" onClick={()=>applyPreset('#FFC107')}></input>
        <input type="button" value="Cool" id="coolButton" className="presetButton" onClick={()=>applyPreset('#42A5F5')}></input>
        <input type="button" value="Read" id="readButton" className="presetButton" onClick={()=>applyPreset('#A98256')}></input>
        <input type="button" value="Mint" id="mintButton" className="presetButton" onClick={()=>applyPreset('#66BB6A')}></input>
    </div>
        
  </div>


  <div className="on-off">
        <label className="switch">
  <input type="checkbox" id="on-off-toggle" checked={isEnabled} onChange={(e)=>{
    const next = e.target.checked;
    setIsEnabled(next);
    chrome.storage.local.set({isEnabled: next});
  }}></input>
  <span className="slider round" id="on-off-slider">
  <span className="slider-text slider-text-on">On</span>
  <span className="slider-text slider-text-off">Off</span>
</span>
</label>

  </div>



  </div>





</>
  )}
  </div>
  )
}

export default App
