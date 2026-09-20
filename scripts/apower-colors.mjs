// APOWER-inspired accents on light product surfaces; dark brand sections remain.
// Only color tokens are changed. Typography, geometry, URLs and alpha stay intact.
export const palette = {
  ink: '#171820', surface: '#f4f3f7', raised: '#ffffff',
  primary: '#165dcc', accent: '#9fc5ff',
  gold: '#b79565', white: '#ffffff', text: '#25242d',
  muted: '#666570', darkMuted: '#c5c5d0', border: '#dcdbe3',
};
const originalVars = {black:'#1f1b19', orange:'#ef4b00', warm:'#dbc6b7', white:'#ffffff', text:'#4e4844', muted:'#a89d96'};
export function themeColor(property, value, context = 'light') {
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
    else if (foreground) {
      if (context === 'dark-hero') result = palette.white;
      else if (context === 'photo') result = palette.text;
      else if (context === 'heading') result = palette.text;
      else if (orange || gold || colored) result = context === 'dark' ? palette.accent : palette.primary;
      else if (context === 'dark') result = level<80 || level>220 ? palette.white : palette.darkMuted;
      else result = level>240 ? (context==='content'?palette.text:palette.white) : level<80 ? palette.text : palette.muted;
    }
    else if (border) result = orange ? palette.primary : context==='dark' ? '#51515f' : palette.border;
    else result = orange ? palette.primary : level<170 ? palette.ink : level<250 ? palette.surface : palette.white;
    if(alpha===1) return result;
    return `rgb(${[1,3,5].map(i=>parseInt(result.slice(i,i+2),16)).join(' ')} / ${Number(alpha.toFixed(5))})`;
  });
}
