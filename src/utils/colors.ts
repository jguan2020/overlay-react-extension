export function hexToRGBA(hex:string, a=1){
    const r = parseInt(hex.substring(1,3),16);
    const g = parseInt(hex.substring(3,5),16);
    const b = parseInt(hex.substring(5,7),16);
    const rgb = 'rgba('+r.toString()+', '+g.toString()+', '+b.toString()+', '+a.toString()+')';
    return rgb;
}


export function hexToHSL(hex:string){
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

export function clamp(x:number){
    return Math.max(0,Math.min(1,x));
}

export function findHSL2(H:number,S:number,L:number){
    const H2 = (H+30) %360;
    var S2 = clamp(S*0.9);
    if(S2<0.08){
        S2 = 0.12;
    }
    const L2 = clamp(L+(L<0.55 ? +0.15:-0.15));
    return {H2:H2, S2:S2, L2:L2};
}

export function HSLToCss({H2,S2,L2}:{H2:number,S2:number,L2:number},a=1){
    return "hsl("+(Math.round(H2)).toString()+ " "+(Math.round(S2*100)).toString()+"% "+(Math.round(L2*100)).toString()+"% / " + a.toString()+")";
}