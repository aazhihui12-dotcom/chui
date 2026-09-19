// APOWER 2025: ink navy, electric violet, cobalt, champagne and white.
// Only color tokens are changed. Typography, geometry, URLs and alpha stay intact.
export const palette = {
  ink: '#050711', surface: '#101426', raised: '#202640',
  violet: '#8020ed', blue: '#4164dc', accent: '#bc95ff',
  gold: '#d6b386', white: '#f5f4ff', muted: '#bcc0d4', border: '#424962',
};
const originalVars = {black:'#1f1b19', orange:'#ef4b00', warm:'#dbc6b7', white:'#ffffff', text:'#4e4844', muted:'#a89d96'};
export function themeColor(property, value, lightPhoto = false) {
  if (!/^(color|background.*|border.*|outline.*|fill|stroke|.*shadow|--source-rest-color|--lbh-.*)$/.test(property)) return value;
  const foreground = /^(color|fill|stroke|--source-rest-color|--lbh-(text|muted))$/.test(property);
  const border = /border|outline/.test(property);
  value = value.replace(/var\(--lbh-(black|orange|warm|white|text|muted)\)/g, (_, key) => originalVars[key]);
  return value.replace(/url\([^)]*\)|#[\da-f]{3,8}\b|rgba?\([^)]*\)|\b(?:white|black)\b/gi, token => {
    if (token.startsWith('url(')) return token;
    let channels, alpha = 1;
    if (token === 'white' || token === 'black') channels = Array(3).fill(token === 'white' ? 255 : 0);
    else if (token.startsWith('#')) {
      let hex = token.slice(1);
      if (hex.length <= 4) hex = [...hex].map(c => c+c).join('');
      channels = [0,2,4].map(i=>parseInt(hex.slice(i,i+2),16));
      if (hex.length===8) alpha = parseInt(hex.slice(6),16)/255;
    } else {
      const parts = token.match(/[\d.]+%?/g);
      channels = parts.slice(0,3).map(n=>n.endsWith('%')?parseFloat(n)*2.55:Number(n));
      if(parts[3]) alpha = parseFloat(parts[3])/(parts[3].endsWith('%')?100:1);
    }
    if(alpha===0) return token;
    const [r,g,b] = channels, level = (r+g+b)/3;
    const orange = r > g*1.35 && r > b*1.6 && r-g>35;
    const gold = r>120 && g>75 && r>b*1.35 && g>b*1.15 && !orange;
    const colored = Math.max(...channels)-Math.min(...channels)>45;
    let result;
    if (/shadow/.test(property)) result = level>200 ? palette.white : palette.ink;
    else if (foreground) result = orange ? (lightPhoto?'#6226ac':palette.accent) : gold ? (lightPhoto?'#72501f':palette.gold) : colored ? (lightPhoto?'#294b9d':'#94b0ff') : lightPhoto ? (level>220?palette.white:level<80?'#18142b':'#46405b') : level<80||level>220 ? palette.white : palette.muted;
    else if (border) result = orange ? palette.accent : gold ? palette.gold : palette.border;
    else result = orange ? palette.violet : gold&&level<210 ? palette.blue : level<65 ? palette.ink : level<170 ? palette.raised : level<250 ? palette.surface : '#080b16';
    if(alpha===1) return result;
    return `rgb(${[1,3,5].map(i=>parseInt(result.slice(i,i+2),16)).join(' ')} / ${Number(alpha.toFixed(5))})`;
  });
}
