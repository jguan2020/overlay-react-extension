chrome.storage.local.get({isEnabled:true}, ({isEnabled})=>
{
    document.documentElement.dataset.enabled = isEnabled ? 'true' : 'false';
});

chrome.storage.onChanged.addListener((toggle, storageType) =>{
    if(storageType==='local' && toggle.isEnabled){
        document.documentElement.dataset.enabled = toggle.isEnabled.newValue ? 'true' : 'false';
    }
});

function hexToRGBA(hex, a=0.1){
    const r = parseInt(hex.substring(1,3),16);
    const g = parseInt(hex.substring(3,5),16);
    const b = parseInt(hex.substring(5,7),16);
    const rgb = 'rgba('+r.toString()+', '+g.toString()+', '+b.toString()+', '+a.toString()+')';
    return rgb;
}

function hexToRGB(hex){
    const r = parseInt(hex.substring(1,3),16);
    const g = parseInt(hex.substring(3,5),16);
    const b = parseInt(hex.substring(5,7),16);
    const rgb = r.toString()+' '+g.toString()+' '+b.toString();
    return rgb;
}



chrome.storage.local.get('overlayColor',({overlayColor})=>
    {
        if(overlayColor){
            const rgb = hexToRGB(overlayColor);
            document.documentElement.style.setProperty('--overlay-color',rgb);
        }
    }
);

chrome.storage.local.get('opacity',({opacity})=>
    {
        if(opacity){
            const opacityRounded = Math.round(opacity*100)/100;
            document.documentElement.style.setProperty('--overlay-opacity',opacityRounded);
        }
    }
);

chrome.storage.onChanged.addListener((color,storageType)=>{
    if(storageType==='local'&&color.overlayColor){
        const rgb = hexToRGB(color.overlayColor.newValue);
        document.documentElement.style.setProperty('--overlay-color',rgb);
    }
}
);

chrome.storage.onChanged.addListener((color,storageType)=>{
    if(storageType==='local'&&color.opacity){
        const opacityRounded = Math.round(color.opacity.newValue*100)/100;
        document.documentElement.style.setProperty('--overlay-opacity',opacityRounded);
    }
}
);