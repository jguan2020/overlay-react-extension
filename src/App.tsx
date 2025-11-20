import {useState, useEffect, useRef} from 'react';
import './App.css';

function hexToRGBA(hex:string, a=1){
    const r = parseInt(hex.substring(1,3),16);
    const g = parseInt(hex.substring(3,5),16);
    const b = parseInt(hex.substring(5,7),16);
    const rgb = 'rgba('+r.toString()+', '+g.toString()+', '+b.toString()+', '+a.toString()+')';
    return rgb;
}

void hexToRGBA;

function hexToHSL(hex:string){
    const r = parseInt(hex.substring(1,3),16);
    const g = parseInt(hex.substring(3,5),16);
    const b = parseInt(hex.substring(5,7),16);
    const R = r/255, G=g/255, B=b/255;
    const max = Math.max(R,G,B);
    const min = Math.min(R,G,B);
    const delta = max-min;
    const L = (max+min)/2;
    const S = (delta==0) ? 0: (delta)/(1-Math.abs(2*L-1));
    var H = 0;
    if(delta!=0){
        if(max==R){
            H = 60*(((G-B)/delta) % 6);
        }
        else if(max==G){
            H = 60*((B-R)/delta+2);
        }
        else{
            H = 60*((R-G)/delta+4);
        }
        if(H<0){
            H+=360;
        }
    }
    H = H % 360;
    return {H:H,S:S,L:L};
}

function clamp(x:number){
    return Math.max(0,Math.min(1,x));
}

function findHSL2(H:number,S:number,L:number){
    const H2 = (H+30) %360;
    var S2 = clamp(S*0.9);
    if(S2<0.08){
        S2 = 0.12;
    }
    const L2 = clamp(L+(L<0.55 ? +0.15:-0.15));
    return {H2:H2, S2:S2, L2:L2};
}

function HSLToCss({H2, S2, L2}:{H2:number;S2:number;L2:number},a:number=1){
    return "hsl("+(Math.round(H2)).toString()+ " "+(Math.round(S2*100)).toString()+"% "+(Math.round(L2*100)).toString()+"% / " + a.toString()+")";
}



function App() {


const [color, setColor] = useState("#ffcc88");
const [opacity, setOpacity] = useState(0.1);
const [isEnabled, setIsEnabled] = useState(true);
const colorInit = useRef(false);
const opacityInit = useRef(false);
const isEnabledInit = useRef(false);

function preset(text:string){
  setColor(text);
  setOpacity(0.1);
}

function toggle(isEnabled:boolean){
  chrome.storage.local.set({isEnabled:isEnabled});
  setIsEnabled(isEnabled);
}


useEffect(()=>{
  chrome.storage.local.get('color',(data: {color:string})=>{
    if(data.color){
      setColor(data.color);
      document.documentElement.style.setProperty('--thumb-color',data.color);
      const HSL1 = hexToHSL(data.color);
      const HSL2 = findHSL2(HSL1.H,HSL1.S,HSL1.L);
      const color2 = HSLToCss(HSL2,0.1);
      document.documentElement.style.setProperty('--gradient-color1',data.color);
      document.documentElement.style.setProperty('--gradient-color2',color2);
    }
    colorInit.current = true;
  });
  chrome.storage.local.get('opacity',(data:{opacity:number})=>{
    if(data.opacity){
      const opacityRounded = Math.round(data.opacity*100)/100;
      setOpacity(opacityRounded);
    }
    else{
      chrome.storage.local.set({
        opacity:0.1
      });
    }
    opacityInit.current = true;
  });

  chrome.storage.local.get('isEnabled',(data:{isEnabled:boolean})=>{
    if(typeof data.isEnabled === 'boolean'){
      setIsEnabled(data.isEnabled);
    }
    isEnabledInit.current = true;
  });


},[]);


useEffect(()=>{
  const onChange = (
    data:Record<string,chrome.storage.StorageChange>, 
    storageType: string) =>{
      if(storageType!== 'local'){
        return;
      }
      if(typeof data.color?.newValue === 'string'){
        setColor(data.color.newValue);
      }
      if(typeof data.opacity?.newValue === 'number'){
        setOpacity(data.opacity.newValue);
      }
      if(typeof data.isEnabled?.newValue==='boolean'){
        setIsEnabled(data.isEnabled.newValue);
      }
    };
    chrome.storage.onChanged.addListener(onChange);
    return ()=> chrome.storage.onChanged.removeListener(onChange);

},[]);

useEffect(()=>{
  if(colorInit.current){
    chrome.storage.local.set({color});
    document.documentElement.style.setProperty('--thumb-color',color);
    const HSL1 = hexToHSL(color);
    const HSL2 = findHSL2(HSL1.H,HSL1.S,HSL1.L);
    const color2 = HSLToCss(HSL2,0.1);
    document.documentElement.style.setProperty('--gradient-color1',color);
    document.documentElement.style.setProperty('--gradient-color2',color2);
  }
}, [color]);


useEffect(()=>{
  if(opacityInit.current){
    chrome.storage.local.set({opacity});
  }
}, [opacity]);

useEffect(()=>{
  if(isEnabledInit.current){
    chrome.storage.local.set({isEnabled});
  }
}, [isEnabled]);




  return (

<div className="popup-root">


  <div className="pageWrap">
  <div className="colorAlphaBox">

  <div className="colorPicker">
  <img src="images/color-wheel-icon.svg.png" id="colorWheel"></img>
  <input type="color" value={color} id="color" onChange={(event)=>{setColor(event.target.value)}}></input>
  <div id="colorString">{color}</div>
  </div>

  
  <div className="alphaBox">

  <div className="alphaSlider">
  <input type="range" id="alphaValue" min="0" max="1" step="0.01" value={opacity} onChange={(event) => setOpacity(Number(event.target.value))}></input>
  <div id="alphaText">{(Math.round(opacity*100)).toString() + '%'}</div>
  </div>

  <div className="alphaTitle" id="opacity">Opacity</div>

    <div className="flexOptions">
        <input type="button" value="Warm" id="warmButton" className="presetButton" onClick={()=>preset("#FFC107")}></input>
        <input type="button" value="Cool" id="coolButton" className="presetButton" onClick={()=>preset("#42A5F5")}></input>
        <input type="button" value="Read" id="readButton" className="presetButton" onClick={()=>preset("#A98256")}></input>
        <input type="button" value="Mint" id="mintButton" className="presetButton" onClick={()=>preset("#66BB6A")}></input>
    </div>
        
  </div>


  <div className="on-off">
        <label className="switch">
  <input type="checkbox" id="on-off-toggle" checked={isEnabled} onChange={(event)=>toggle(event.target.checked)}></input>
  <span className="slider round" id="on-off-slider">
  <span className="slider-text slider-text-on">On</span>
  <span className="slider-text slider-text-off">Off</span>
</span>
</label>

  </div>



  </div>
</div>





</div>



  )
}

export default App
