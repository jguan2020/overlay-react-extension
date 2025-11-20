chrome.storage.local.get({isEnabled:true}, ({isEnabled})=>
{
    document.documentElement.dataset.enabled = isEnabled ? 'true' : 'false';
});

chrome.storage.onChanged.addListener((toggle, storageType) =>{
    if(storageType==='local' && toggle.isEnabled){
        document.documentElement.dataset.enabled = toggle.isEnabled.newValue ? 'true' : 'false';
    }
});



function hexToRGB(hex:string){
    const r = parseInt(hex.substring(1,3),16);
    const g = parseInt(hex.substring(3,5),16);
    const b = parseInt(hex.substring(5,7),16);
    const rgb = r.toString()+' '+g.toString()+' '+b.toString();
    return rgb;
}



chrome.storage.local.get('color',({color})=>
    {
        if(typeof color === 'string'){
            const rgb = hexToRGB(color);
            document.documentElement.style.setProperty('--overlay-color',rgb);
        }
    }
);

chrome.storage.local.get('opacity',({opacity})=>
    {
        if(typeof opacity === 'number'){
            const opacityRounded = Math.round(opacity*100)/100;
            document.documentElement.style.setProperty('--overlay-opacity',String(opacityRounded));
        }
    }
);

chrome.storage.onChanged.addListener((color,storageType)=>{
    if(storageType==='local'&& typeof color.color?.newValue === 'string'){
        const rgb = hexToRGB(color.color.newValue);
        document.documentElement.style.setProperty('--overlay-color',rgb);
    }
}
);

chrome.storage.onChanged.addListener((color,storageType)=>{
    if(storageType==='local'&&typeof color.opacity?.newValue === 'number'){
        const opacityRounded = Math.round(color.opacity.newValue*100)/100;
        document.documentElement.style.setProperty('--overlay-opacity',String(opacityRounded));
    }
}
);