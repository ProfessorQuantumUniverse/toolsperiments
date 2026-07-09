/* =====================================================================
   SHELLY FINDER  —  app.js
   Ein adaptives Auswahl-Quiz für Shelly-Geräte.
   Selbst gezeichnete SVG-Illustrationen (keine externen Bilder),
   vollständige Produktdatenbank, verzweigter Frageablauf, Matching.
   ===================================================================== */

/* ---------------------------------------------------------------------
   1) SVG-ICON-FACTORY
   Farben: Limetten-Gehäuse wie echte Shelly-Module.
   viewBox 120x120. Auf hellem Grund (Antwortkarten) und auf dunklem
   Grund (Ergebnis) gleichermaßen lesbar.
--------------------------------------------------------------------- */
const C = {
  body:'#A6D400', edge:'#5E8000', edgeDark:'#4a6600', term:'#1a1c21', screw:'#0c0d10',
  plate:'#F7F8F2', ink:'#16181C', white:'#ffffff', glow:'#B7E60A', dark:'#22242b'
};

/* A realistic screw-terminal connector bar (dark plastic block + metallic screws).
   Rendered at the top or bottom edge of a module, like a real Shelly. */
function connector(x, y, w, n){
  const h = 11;
  let s = `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="3" fill="url(#termGrad)"/>`
        + `<rect x="${x+1}" y="${y+1}" width="${w-2}" height="3.4" rx="2" fill="#3a3d45" opacity=".55"/>`;
  const pad = 8;
  for(let i=0;i<n;i++){
    const cx = x + pad + (w-2*pad) * (n===1 ? .5 : i/(n-1));
    const cy = y + h/2;
    s += `<circle cx="${cx}" cy="${cy}" r="3.5" fill="url(#screwGrad)" stroke="#000" stroke-opacity=".35"/>`
      +  `<line x1="${cx-2}" y1="${cy}" x2="${cx+2}" y2="${cy}" stroke="#000" stroke-opacity=".5" stroke-width="1.1" stroke-linecap="round"/>`;
  }
  return s;
}

/* Glossy lime module body with bezel, top highlight, screw terminals and a printed label plate. */
function moduleBody(w,h,label,accent){
  const x=(120-w)/2, y=(120-h)/2;
  const plateW = Math.min(w-22, 62), plateH = 24;
  const nT = Math.min(4, Math.max(2, Math.round(w/24)));
  return `
    <rect x="${x}" y="${y}" width="${w}" height="${h}" rx="13" fill="url(#bodyGrad)" stroke="${C.edge}" stroke-width="1.6"/>
    <rect x="${x+2.5}" y="${y+2.5}" width="${w-5}" height="${h-5}" rx="10.5" fill="none" stroke="rgba(255,255,255,.5)" stroke-width="1.3"/>
    <rect x="${x+4}" y="${y+4}" width="${w-8}" height="${(h-8)*.52}" rx="9" fill="url(#gloss)"/>
    ${connector(x+6, y-6, w-12, nT)}
    ${connector(x+6, y+h-5, w-12, nT)}
    <rect x="${60-plateW/2}" y="${60-plateH/2}" width="${plateW}" height="${plateH}" rx="6" fill="url(#plateGrad)" stroke="rgba(22,24,28,.16)"/>
    <rect x="${60-plateW/2+2}" y="${60-plateH/2+1.5}" width="${plateW-4}" height="2.4" rx="1.5" fill="#fff" opacity=".7"/>
    ${accent||''}
    <text x="60" y="60.5" font-family="'IBM Plex Mono',monospace" font-size="12" font-weight="700" letter-spacing=".4" fill="${C.ink}" text-anchor="middle" dominant-baseline="central">${label}</text>
  `;
}

function svgWrap(inner){
  return `<svg viewBox="0 0 120 120" role="img" xmlns="http://www.w3.org/2000/svg">${inner}</svg>`;
}

const ICONS = {
  relay:(o={})=>{ const mini=o.mini; const w=mini?72:88,h=mini?50:60;
    return svgWrap(moduleBody(w,h, o.label||(o.pm?'PM':'1'))); },
  relay2:(o={})=> svgWrap(moduleBody(92,64, o.pm?'2PM':'2',
    `<circle class="led-dot" cx="45" cy="49" r="2.6" fill="${C.glow}"/><circle class="led-dot" cx="75" cy="49" r="2.6" fill="${C.glow}"/>`)),
  noNeutral:(o={})=> svgWrap(moduleBody(o.ch===2?92:80, 60, o.ch===2?'2L':'1L',
    `<text x="60" y="81" font-family="'IBM Plex Mono',monospace" font-size="7" font-weight="600" fill="${C.edgeDark}" text-anchor="middle">NO&#8201;N</text>`)),
  input:()=> svgWrap(moduleBody(88,62,'i4',
    `<g fill="${C.edgeDark}"><rect x="39" y="47" width="7" height="6" rx="1.5"/><rect x="49" y="47" width="7" height="6" rx="1.5"/><rect x="64" y="47" width="7" height="6" rx="1.5"/><rect x="74" y="47" width="7" height="6" rx="1.5"/></g>`)),
  dimmer:()=> svgWrap(moduleBody(90,62,'',
    `<rect x="34" y="54" width="52" height="12" rx="6" fill="url(#screenGrad)" stroke="rgba(22,24,28,.25)"/>
     <rect x="36" y="56.5" width="30" height="3.6" rx="2" fill="${C.glow}" opacity=".85"/>
     <circle cx="72" cy="60" r="7" fill="url(#plateGrad)" stroke="${C.ink}" stroke-width="1.4"/>
     <circle class="led-dot" cx="72" cy="60" r="2.4" fill="${C.glow}"/>`)),
  cover:()=> svgWrap(moduleBody(92,64,'',
    `<path d="M52 53 l8 -8 l8 8" fill="none" stroke="${C.ink}" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/>
     <path d="M52 67 l8 8 l8 -8" fill="none" stroke="${C.ink}" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/>`)),
  din:(o={})=>{ const n=o.ch||1; const disp=o.display;
    let leds=''; for(let i=0;i<Math.min(n,4);i++){leds+=`<circle class="led-dot" cx="${44+i*11}" cy="94" r="3" fill="${C.glow}"/>`;}
    return svgWrap(`
      <rect x="30" y="10" width="60" height="100" rx="9" fill="url(#bodyGrad)" stroke="${C.edge}" stroke-width="1.6"/>
      <rect x="32.5" y="12.5" width="55" height="95" rx="7" fill="none" stroke="rgba(255,255,255,.45)" stroke-width="1.3"/>
      <rect x="34" y="13" width="52" height="30" rx="7" fill="url(#gloss)"/>
      ${connector(34, 3, 52, Math.min(3, n+1))}
      ${connector(34, 106, 52, Math.min(3, n+1))}
      ${disp
        ? `<rect x="39" y="30" width="42" height="28" rx="4" fill="url(#screenGrad)" stroke="#000" stroke-opacity=".35"/>
           <rect x="41" y="32" width="38" height="9" rx="2" fill="#000" opacity=".25"/>
           <text class="screen-text" x="60" y="45" font-family="'IBM Plex Mono',monospace" font-size="8" font-weight="600" fill="${C.glow}" text-anchor="middle">${o.label||''}</text>`
        : `<rect x="38" y="33" width="44" height="23" rx="5" fill="url(#plateGrad)" stroke="rgba(22,24,28,.16)"/>
           <rect x="40" y="34.5" width="40" height="2.4" rx="1.5" fill="#fff" opacity=".7"/>
           <text x="60" y="45.5" font-family="'IBM Plex Mono',monospace" font-size="10" font-weight="700" fill="${C.ink}" text-anchor="middle">${o.label||'PRO'}</text>`}
      ${leds}
    `); },
  meter:()=> svgWrap(`
    <path d="M92 20 v76" stroke="#2c2f37" stroke-width="6" stroke-linecap="round"/>
    <circle cx="92" cy="58" r="18" fill="none" stroke="#1c1e24" stroke-width="6"/>
    <path class="led-ring" d="M92 42 a16 16 0 1 1 -11 4.6" fill="none" stroke="${C.glow}" stroke-width="4" stroke-linecap="round"/>
    <rect x="16" y="30" width="60" height="60" rx="12" fill="url(#bodyGrad)" stroke="${C.edge}" stroke-width="1.6"/>
    <rect x="18.5" y="32.5" width="55" height="55" rx="9.5" fill="none" stroke="rgba(255,255,255,.45)" stroke-width="1.3"/>
    <rect x="20" y="33" width="52" height="26" rx="8" fill="url(#gloss)"/>
    <rect x="30" y="48" width="32" height="22" rx="4" fill="url(#screenGrad)"/>
    <text class="screen-text" x="46" y="60" font-family="'IBM Plex Mono',monospace" font-size="9" font-weight="600" fill="${C.glow}" text-anchor="middle">EM</text>
    ${connector(22, 84, 48, 3)}
  `),
  plugRound:(o={})=> svgWrap(`
    <rect x="53.5" y="86" width="6" height="20" rx="3" fill="url(#steelGrad)"/>
    <rect x="61" y="86" width="6" height="20" rx="3" fill="url(#steelGrad)"/>
    <circle cx="60" cy="52" r="36" fill="url(#bodyGradR)" stroke="${C.edge}" stroke-width="1.6"/>
    <path d="M60 16 a36 36 0 0 1 30 16 a44 44 0 0 0 -60 0 a36 36 0 0 1 30 -16z" fill="url(#gloss)"/>
    <circle class="led-ring" cx="60" cy="52" r="30" fill="none" stroke="${o.led!==false?C.glow:'rgba(255,255,255,.45)'}" stroke-width="3.4"/>
    <circle cx="60" cy="52" r="19" fill="url(#plateGrad)" stroke="rgba(22,24,28,.14)"/>
    <circle cx="53" cy="52" r="3.4" fill="url(#screwGrad)"/><circle cx="67" cy="52" r="3.4" fill="url(#screwGrad)"/>
  `),
  plugSquare:(o={})=> svgWrap(`
    <rect x="53.5" y="82" width="6" height="20" rx="3" fill="url(#steelGrad)"/>
    <rect x="61" y="82" width="6" height="20" rx="3" fill="url(#steelGrad)"/>
    <rect x="24" y="16" width="72" height="70" rx="16" fill="url(#bodyGrad)" stroke="${C.edge}" stroke-width="1.6"/>
    <rect x="26.5" y="18.5" width="67" height="65" rx="13.5" fill="none" stroke="rgba(255,255,255,.45)" stroke-width="1.3"/>
    <rect x="28" y="19" width="64" height="30" rx="12" fill="url(#gloss)"/>
    <circle cx="60" cy="50" r="17" fill="url(#plateGrad)" stroke="rgba(22,24,28,.14)"/>
    <circle cx="53" cy="50" r="3" fill="url(#screwGrad)"/><circle cx="67" cy="50" r="3" fill="url(#screwGrad)"/>
    ${o.out?`<path d="M40 28 a6 6 0 0 1 12 0 v4" fill="none" stroke="${C.ink}" stroke-width="2.2" stroke-linecap="round"/><circle class="led-dot" cx="80" cy="30" r="3" fill="${C.glow}"/>`
           :`<circle class="led-dot" cx="80" cy="30" r="3" fill="${C.glow}"/>`}
  `),
  strip:()=> svgWrap(`
    <rect x="12" y="40" width="96" height="42" rx="14" fill="url(#bodyGrad)" stroke="${C.edge}" stroke-width="1.6"/>
    <rect x="14.5" y="42.5" width="91" height="37" rx="11.5" fill="none" stroke="rgba(255,255,255,.42)" stroke-width="1.2"/>
    <rect x="16" y="43" width="88" height="16" rx="9" fill="url(#gloss)"/>
    ${[27,50,73,96].map(cx=>`<circle cx="${cx}" cy="61" r="9.5" fill="url(#plateGrad)" stroke="rgba(22,24,28,.12)"/><circle cx="${cx-3}" cy="61" r="1.9" fill="url(#screwGrad)"/><circle cx="${cx+3}" cy="61" r="1.9" fill="url(#screwGrad)"/>`).join('')}
    <circle class="led-dot" cx="19" cy="47" r="2.4" fill="${C.glow}"/>
  `),
  motion:()=> svgWrap(`
    <path d="M90 40 a26 26 0 0 1 0 34" fill="none" stroke="${C.glow}" stroke-width="3" stroke-linecap="round" opacity=".9" class="led-ring"/>
    <path d="M98 32 a38 38 0 0 1 0 50" fill="none" stroke="${C.edgeDark}" stroke-width="2.6" stroke-linecap="round" opacity=".45"/>
    <rect x="34" y="28" width="50" height="64" rx="15" fill="url(#bodyGrad)" stroke="${C.edge}" stroke-width="1.6"/>
    <rect x="36.5" y="30.5" width="45" height="59" rx="12.5" fill="none" stroke="rgba(255,255,255,.42)" stroke-width="1.2"/>
    <rect x="38" y="31" width="42" height="26" rx="12" fill="url(#gloss)"/>
    <ellipse cx="59" cy="52" rx="16" ry="14" fill="url(#screenGrad)"/>
    <ellipse cx="54" cy="47" rx="4.5" ry="3.4" fill="rgba(183,230,10,.75)"/>
    <circle class="led-dot" cx="59" cy="80" r="3" fill="${C.glow}"/>
  `),
  presence:()=> svgWrap(`
    <circle cx="60" cy="60" r="32" fill="url(#bodyGradR)" stroke="${C.edge}" stroke-width="1.6"/>
    <path d="M60 28 a32 32 0 0 1 26 14 a40 40 0 0 0 -52 0 a32 32 0 0 1 26 -14z" fill="url(#gloss)"/>
    ${[13,21,29].map((r,i)=>`<circle class="led-ring" style="animation-delay:${i*.3}s" cx="60" cy="60" r="${r}" fill="none" stroke="${C.ink}" stroke-width="1.8" opacity="${.75-i*.2}"/>`).join('')}
    <circle cx="60" cy="60" r="4.5" fill="${C.ink}"/>
    <circle class="led-dot" cx="86" cy="86" r="4.5" fill="${C.glow}"/>
  `),
  contact:()=> svgWrap(`
    <rect x="22" y="32" width="46" height="56" rx="12" fill="url(#bodyGrad)" stroke="${C.edge}" stroke-width="1.6"/>
    <rect x="24.5" y="34.5" width="41" height="51" rx="9.5" fill="none" stroke="rgba(255,255,255,.42)" stroke-width="1.2"/>
    <rect x="26" y="35" width="38" height="22" rx="9" fill="url(#gloss)"/>
    <circle class="led-dot" cx="45" cy="78" r="3" fill="${C.glow}"/>
    <rect x="78" y="40" width="20" height="40" rx="7" fill="url(#bodyGrad)" stroke="${C.edge}" stroke-width="1.6"/>
    <rect x="80" y="42" width="16" height="16" rx="6" fill="url(#gloss)"/>
    <line x1="68" y1="60" x2="78" y2="60" stroke="${C.edgeDark}" stroke-width="2.4" stroke-dasharray="2 3" stroke-linecap="round"/>
  `),
  thermo:()=> svgWrap(`
    <rect x="30" y="24" width="60" height="72" rx="15" fill="url(#bodyGrad)" stroke="${C.edge}" stroke-width="1.6"/>
    <rect x="32.5" y="26.5" width="55" height="67" rx="12.5" fill="none" stroke="rgba(255,255,255,.42)" stroke-width="1.2"/>
    <rect x="34" y="27" width="52" height="28" rx="12" fill="url(#gloss)"/>
    <rect x="38" y="35" width="44" height="32" rx="5" fill="#EBEDE4" stroke="rgba(22,24,28,.18)"/>
    <text x="60" y="52" font-family="'IBM Plex Mono',monospace" font-size="12" font-weight="700" fill="${C.ink}" text-anchor="middle">21°</text>
    <text x="60" y="63" font-family="'IBM Plex Mono',monospace" font-size="6.5" fill="${C.edgeDark}" text-anchor="middle">48% RH</text>
    <path d="M60 76 c-6 6 -6 12 0 12 c6 0 6 -6 0 -12" fill="url(#waterGrad)"/>
  `),
  water:()=> svgWrap(`
    <ellipse cx="60" cy="66" rx="38" ry="12" fill="url(#waterGrad)" opacity=".35"/>
    <circle cx="60" cy="52" r="32" fill="url(#bodyGradR)" stroke="${C.edge}" stroke-width="1.6"/>
    <path d="M60 20 a32 32 0 0 1 26 14 a40 40 0 0 0 -52 0 a32 32 0 0 1 26 -14z" fill="url(#gloss)"/>
    <path d="M60 38 c-9 11 -9 19 0 19 c9 0 9 -8 0 -19z" fill="url(#waterGrad)"/>
    <ellipse cx="56" cy="50" rx="2.6" ry="4" fill="#fff" opacity=".6"/>
    <circle class="led-dot" cx="60" cy="76" r="3" fill="${C.glow}"/>
  `),
  smoke:()=> svgWrap(`
    <circle cx="60" cy="58" r="36" fill="url(#bodyGradR)" stroke="${C.edge}" stroke-width="1.6"/>
    <path d="M60 22 a36 36 0 0 1 30 16 a44 44 0 0 0 -60 0 a36 36 0 0 1 30 -16z" fill="url(#gloss)"/>
    <circle cx="60" cy="58" r="30" fill="none" stroke="rgba(255,255,255,.35)" stroke-width="1.4"/>
    ${[0,45,90,135,180,225,270,315].map(a=>{const r=a*Math.PI/180;return `<circle cx="${(60+Math.cos(r)*20).toFixed(1)}" cy="${(58+Math.sin(r)*20).toFixed(1)}" r="2.6" fill="${C.term}"/>`;}).join('')}
    <circle class="led-dot" cx="60" cy="58" r="6" fill="${C.glow}"/>
  `),
  gas:()=> svgWrap(`
    <rect x="26" y="26" width="68" height="66" rx="16" fill="url(#bodyGrad)" stroke="${C.edge}" stroke-width="1.6"/>
    <rect x="28.5" y="28.5" width="63" height="61" rx="13.5" fill="none" stroke="rgba(255,255,255,.42)" stroke-width="1.2"/>
    <rect x="30" y="29" width="60" height="28" rx="13" fill="url(#gloss)"/>
    <rect x="36" y="38" width="48" height="24" rx="5" fill="url(#screenGrad)"/>
    <text class="screen-text" x="60" y="53" font-family="'IBM Plex Mono',monospace" font-size="11" font-weight="600" fill="${C.glow}" text-anchor="middle">CH&#8324;</text>
    <g stroke="${C.term}" stroke-width="2.4" stroke-linecap="round"><line x1="44" y1="72" x2="44" y2="80"/><line x1="52" y1="72" x2="52" y2="82"/><line x1="60" y1="72" x2="60" y2="80"/><line x1="68" y1="72" x2="68" y2="82"/><line x1="76" y1="72" x2="76" y2="80"/></g>
  `),
  trv:()=> svgWrap(`
    <rect x="42" y="16" width="36" height="42" rx="9" fill="url(#steelGrad)" stroke="${C.edgeDark}" stroke-width="1.2"/>
    <rect x="44" y="18" width="32" height="10" rx="5" fill="#fff" opacity=".4"/>
    <circle cx="60" cy="72" r="27" fill="url(#bodyGradR)" stroke="${C.edge}" stroke-width="1.6"/>
    <path d="M60 45 a27 27 0 0 1 22 12 a34 34 0 0 0 -44 0 a27 27 0 0 1 22 -12z" fill="url(#gloss)"/>
    <circle cx="60" cy="72" r="19" fill="none" stroke="${C.ink}" stroke-width="2.2"/>
    ${[...Array(12)].map((_,i)=>{const a=i*30*Math.PI/180;return `<line x1="${(60+Math.cos(a)*19).toFixed(1)}" y1="${(72+Math.sin(a)*19).toFixed(1)}" x2="${(60+Math.cos(a)*22).toFixed(1)}" y2="${(72+Math.sin(a)*22).toFixed(1)}" stroke="${C.ink}" stroke-width="1.4" opacity=".5"/>`;}).join('')}
    <line x1="60" y1="72" x2="60" y2="56" stroke="${C.ink}" stroke-width="3" stroke-linecap="round"/>
  `),
  button:()=> svgWrap(`
    <rect x="28" y="28" width="64" height="64" rx="18" fill="url(#bodyGrad)" stroke="${C.edge}" stroke-width="1.6"/>
    <rect x="30.5" y="30.5" width="59" height="59" rx="15.5" fill="none" stroke="rgba(255,255,255,.42)" stroke-width="1.3"/>
    <rect x="32" y="31" width="56" height="28" rx="15" fill="url(#gloss)"/>
    <circle cx="60" cy="60" r="18" fill="url(#plateGrad)" stroke="${C.edgeDark}" stroke-width="1.2"/>
    <circle cx="60" cy="60" r="9" fill="url(#bodyGradR)" stroke="${C.edgeDark}"/>
  `),
  gateway:()=> svgWrap(`
    <rect x="34" y="46" width="52" height="36" rx="10" fill="url(#bodyGrad)" stroke="${C.edge}" stroke-width="1.6"/>
    <rect x="36" y="48" width="48" height="14" rx="8" fill="url(#gloss)"/>
    <circle cx="60" cy="64" r="4" fill="${C.ink}"/>
    ${[9,17].map((r,i)=>`<path class="led-ring" style="animation-delay:${i*.35}s" d="M${60-r} ${64-r} a${(r*1.4).toFixed(1)} ${(r*1.4).toFixed(1)} 0 0 1 ${r*2} 0" fill="none" stroke="${C.ink}" stroke-width="2" opacity="${.7-i*.3}"/>`).join('')}
    <rect x="55" y="82" width="10" height="10" rx="2" fill="url(#steelGrad)"/>
  `),
  panel:()=> svgWrap(`
    <rect x="16" y="24" width="88" height="72" rx="12" fill="#1a1c22" stroke="#2f333d" stroke-width="2"/>
    <rect x="22" y="30" width="76" height="60" rx="6" fill="url(#screenGrad)"/>
    <rect x="28" y="36" width="32" height="22" rx="4" fill="url(#bodyGrad)"/>
    <text x="44" y="50" font-family="'IBM Plex Mono',monospace" font-size="8" font-weight="700" fill="${C.ink}" text-anchor="middle">21°</text>
    <rect x="64" y="36" width="28" height="9" rx="2" fill="#333844"/>
    <rect x="64" y="49" width="28" height="9" rx="2" fill="#333844"/>
    <rect x="28" y="63" width="64" height="9" rx="2" fill="#262a33"/>
    <circle class="led-dot" cx="33" cy="82" r="4" fill="${C.glow}"/>
    <rect x="44" y="78" width="22" height="7" rx="3.5" fill="#333844"/>
    <rect x="72" y="78" width="20" height="7" rx="3.5" fill="#333844"/>
  `),
  bulb:()=> svgWrap(`
    <path d="M60 22 a27 27 0 0 1 17 48 c-4 4 -5 8 -5 12 h-24 c0 -4 -1 -8 -5 -12 a27 27 0 0 1 17 -48z" fill="url(#bodyGradR)" stroke="${C.edge}" stroke-width="1.6"/>
    <path d="M46 40 a26 26 0 0 1 24 -14 a20 20 0 0 0 -18 20z" fill="url(#gloss)"/>
    <rect x="49" y="83" width="22" height="6" rx="2" fill="url(#steelGrad)"/>
    <rect x="51" y="91" width="18" height="5" rx="2" fill="url(#steelGrad)"/>
    <path d="M52 55 l6 8 l4 -14 l4 10" fill="none" stroke="rgba(22,24,28,.4)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
  `),
  strip_led:()=> svgWrap(`
    <rect x="14" y="50" width="92" height="20" rx="6" fill="url(#screenGrad)" stroke="#3a3d45" stroke-width="1.4"/>
    <rect x="16" y="52" width="88" height="6" rx="3" fill="#fff" opacity=".08"/>
    ${[27,44,60,76,93].map((x,i)=>`<circle class="led-dot" style="animation-delay:${i*.18}s" cx="${x}" cy="60" r="5" fill="${['#ff5a5a','#ffd24a',C.body,'#5ab0ff','#c05aff'][i]}"/>`).join('')}
  `),
  // small category glyphs for the goal screen (still lime, simpler)
  gSwitch:()=> ICONS.relay({label:'ON'}),
  gDim:()=> ICONS.dimmer(),
  gCover:()=> ICONS.cover(),
  gPlug:()=> ICONS.plugRound(),
  gMeter:()=> ICONS.meter(),
  gSensor:()=> ICONS.motion(),
  gInput:()=> ICONS.input(),
  gPanel:()=> ICONS.panel(),
};

function icon(name, o){ const f = ICONS[name]; return f ? f(o||{}) : ICONS.relay({}); }

/* ---------------------------------------------------------------------
   2) PRODUKTDATENBANK
   Preise = grobe Straßenpreise in € (Orientierung, keine Zusage).
   proto = angezeigte Protokoll-Chips.
--------------------------------------------------------------------- */
const WIFI4 = ['Wi-Fi','Bluetooth','Zigbee','Matter'];
const WIFI3 = ['Wi-Fi','Bluetooth','Matter*'];
const PRO   = ['Wi-Fi','LAN','Bluetooth'];

const P = {
  /* ---- Unterputz-Relais Gen4 ---- */
  '1mini':   {name:'Shelly 1 Mini Gen4', gen:'Gen4 · Mini', cat:'relay', icon:['relay',{mini:1,label:'1'}], price:'ca. 13 €', proto:WIFI4, pm:false,
    blurb:'Kleinstes potentialfreies Schaltrelais. Passt in fast jede Dose.',
    specs:[['Kanäle','1 (potentialfrei)'],['Last','bis 8 A'],['Messung','nein'],['Nullleiter','erforderlich']]},
  '1pmmini': {name:'Shelly 1PM Mini Gen4', gen:'Gen4 · Mini', cat:'relay', icon:['relay',{mini:1,pm:1,label:'PM'}], price:'ca. 15 €', proto:WIFI4, pm:true,
    blurb:'Winziges Relais mit Verbrauchsmessung – ideal für enge Dosen.',
    specs:[['Kanäle','1'],['Last','bis 8 A'],['Messung','ja'],['Nullleiter','erforderlich']]},
  '1':       {name:'Shelly 1 Gen4', gen:'Gen4', cat:'relay', icon:['relay',{label:'1'}], price:'ca. 14 €', proto:WIFI4, pm:false,
    blurb:'Universeller potentialfreier Schalter für Licht, Geräte, Schütze, Garagentor.',
    specs:[['Kanäle','1 (potentialfrei)'],['Last','bis 16 A'],['Messung','nein'],['Nullleiter','erforderlich']]},
  '1pm':     {name:'Shelly 1PM Gen4', gen:'Gen4', cat:'relay', icon:['relay',{pm:1,label:'PM'}], price:'ca. 16 €', proto:WIFI4, pm:true,
    blurb:'Der Allrounder: schalten + Verbrauch messen für Licht und Geräte.',
    specs:[['Kanäle','1'],['Last','bis 16 A'],['Messung','ja'],['Nullleiter','erforderlich']]},
  '2pm':     {name:'Shelly 2PM Gen4', gen:'Gen4', cat:'relay', icon:['relay2',{pm:1}], price:'ca. 25 €', proto:WIFI4, pm:true,
    blurb:'Zwei Kanäle mit Messung – oder ein Rollladen mit Positionssteuerung.',
    specs:[['Kanäle','2 (od. 1 Rollladen)'],['Last','bis 16 A gesamt'],['Messung','je Kanal'],['Nullleiter','erforderlich']]},
  '1l':      {name:'Shelly 1L Gen4', gen:'Gen4', cat:'relay', icon:['noNeutral',{ch:1}], price:'ca. 17 €', proto:WIFI4, pm:false,
    blurb:'Für Schalterdosen ohne Nullleiter – nur Phase nötig.',
    specs:[['Kanäle','1'],['Last','Licht bis ~200 W'],['Messung','nein'],['Nullleiter','NICHT nötig']]},
  '2l':      {name:'Shelly 2L Gen4', gen:'Gen4', cat:'relay', icon:['noNeutral',{ch:2}], price:'ca. 20 €', proto:WIFI4, pm:false,
    blurb:'Zwei Kanäle ganz ohne Nullleiter – z. B. Wechselschaltung nachrüsten.',
    specs:[['Kanäle','2'],['Last','Licht je Kanal'],['Messung','nein'],['Nullleiter','NICHT nötig']]},
  'pmmini':  {name:'Shelly PM Mini Gen3', gen:'Gen3 · Mini', cat:'relay', icon:['relay',{mini:1,label:'PM'}], price:'ca. 11 €', proto:WIFI3, pm:true,
    blurb:'Reiner Verbrauchsmesser ohne Schaltfunktion. Extrem klein.',
    specs:[['Kanäle','0 (nur messen)'],['Messbereich','bis 16 A'],['Schalten','nein'],['Nullleiter','erforderlich']]},

  /* ---- Eingänge / Szenen ---- */
  'i4':      {name:'Shelly i4 Gen4', gen:'Gen4', cat:'input', icon:['input',{}], price:'ca. 13 €', proto:WIFI4, pm:false,
    blurb:'4 Eingänge (230 V) – vorhandene Schalter/Taster smart machen, Szenen auslösen.',
    specs:[['Eingänge','4 × 230 V'],['Relais','keins'],['Zweck','Szenen/Automation'],['Nullleiter','erforderlich']]},
  'i4dc':    {name:'Shelly i4 DC Gen4', gen:'Gen4', cat:'input', icon:['input',{}], price:'ca. 13 €', proto:WIFI4, pm:false,
    blurb:'4 Eingänge für 5–24 V DC – Klingel, Sensoren, Fahrzeug- und Kleinspannung.',
    specs:[['Eingänge','4 × 5–24 V DC'],['Relais','keins'],['Zweck','Szenen/Automation'],['Versorgung','DC']]},

  /* ---- Dimmer ---- */
  'dim':     {name:'Shelly Dimmer Gen4', gen:'Gen4', cat:'dim', icon:['dimmer',{}], price:'ca. 28 €', proto:WIFI4, pm:true,
    blurb:'Unterputz-Dimmer für dimmbare LED und Glühlampen (Phasenab-/anschnitt).',
    specs:[['Last','dimmbare LED / Glüh'],['Prinzip','Phasenab-/anschnitt'],['Messung','ja'],['Nullleiter','erforderlich']]},
  'dim010':  {name:'Shelly Dimmer 0/1-10V PM Gen4', gen:'Gen4', cat:'dim', icon:['dimmer',{}], price:'ca. 30 €', proto:WIFI4, pm:true,
    blurb:'Steuert LED-Treiber / Vorschaltgeräte mit 0–10 V bzw. 1–10 V Eingang.',
    specs:[['Ausgang','0–10 V / 1–10 V'],['Last','externer LED-Treiber'],['Messung','ja'],['Modus','Sink & Source']]},
  'dali':    {name:'Shelly DALI Dimmer Gen3', gen:'Gen3', cat:'dim', icon:['dimmer',{}], price:'ca. 30 €', proto:WIFI3, pm:false,
    blurb:'Für DALI-Vorschaltgeräte / DALI-Bus-Leuchten.',
    specs:[['Protokoll','DALI'],['Last','DALI-EVGs'],['Messung','nein'],['Nullleiter','erforderlich']]},
  'walldim': {name:'Shelly Plus Wall Dimmer', gen:'Plus', cat:'dim', icon:['panel',{}], price:'ca. 30 €', proto:['Wi-Fi','Bluetooth'], pm:false,
    blurb:'Sichtbarer Wand-Dimmer mit Touch-Slider – ersetzt den Lichtschalter.',
    specs:[['Bauform','Aufputz-Bedienteil'],['Bedienung','Touch-Slider'],['Messung','nein'],['Nullleiter','erforderlich']]},
  'rgbw':    {name:'Shelly Plus RGBW PM', gen:'Plus', cat:'dim', icon:['strip_led',{}], price:'ca. 27 €', proto:['Wi-Fi','Bluetooth'], pm:true,
    blurb:'Für RGB / RGBW LED-Streifen (12/24 V) mit Verbrauchsmessung.',
    specs:[['Last','RGB/RGBW-Streifen'],['Spannung','12 / 24 V DC'],['Kanäle','4'],['Messung','ja']]},

  /* ---- Rollladen DIN ---- */
  'produal': {name:'Shelly Pro Dual Cover/Shutter PM', gen:'Pro', cat:'cover', icon:['din',{ch:2,label:'2C'}], price:'ca. 110 €', proto:PRO, pm:true,
    blurb:'Zwei Rollläden/Markisen im Verteiler, mit Messung und LAN.',
    specs:[['Rollläden','2'],['Bauform','Hutschiene'],['Messung','ja'],['Anschluss','WLAN + LAN']]},

  /* ---- DIN-Relais Pro ---- */
  'pro1':    {name:'Shelly Pro 1', gen:'Pro', cat:'relay', icon:['din',{ch:1,label:'1'}], price:'ca. 75 €', proto:PRO, pm:false,
    blurb:'Hutschienen-Relais, potentialfrei, mit LAN – robust für den Verteiler.',
    specs:[['Kanäle','1 (potentialfrei)'],['Last','bis 16 A'],['Messung','nein'],['Anschluss','WLAN + LAN']]},
  'pro1pm':  {name:'Shelly Pro 1PM', gen:'Pro', cat:'relay', icon:['din',{ch:1,label:'PM'}], price:'ca. 85 €', proto:PRO, pm:true,
    blurb:'Hutschienen-Relais mit Messung, LAN und Übertemperatur-/Überlastschutz.',
    specs:[['Kanäle','1'],['Last','bis 16 A'],['Messung','ja'],['Anschluss','WLAN + LAN']]},
  'pro2':    {name:'Shelly Pro 2', gen:'Pro', cat:'relay', icon:['din',{ch:2,label:'2'}], price:'ca. 90 €', proto:PRO, pm:false,
    blurb:'Zwei potentialfreie Kanäle auf der Hutschiene.',
    specs:[['Kanäle','2 (potentialfrei)'],['Last','bis 16 A/Kanal'],['Messung','nein'],['Anschluss','WLAN + LAN']]},
  'pro2pm':  {name:'Shelly Pro 2PM', gen:'Pro', cat:'relay', icon:['din',{ch:2,label:'2PM'}], price:'ca. 110 €', proto:PRO, pm:true,
    blurb:'Zwei Kanäle mit Messung – auch als Rollladensteuerung im Verteiler.',
    specs:[['Kanäle','2 (od. Rollladen)'],['Last','bis 16 A/Kanal'],['Messung','je Kanal'],['Anschluss','WLAN + LAN']]},
  'pro3':    {name:'Shelly Pro 3', gen:'Pro', cat:'relay', icon:['din',{ch:3,label:'3'}], price:'ca. 92 €', proto:PRO, pm:false,
    blurb:'Drei potentialfreie Kanäle für größere Installationen.',
    specs:[['Kanäle','3 (potentialfrei)'],['Last','bis 16 A/Kanal'],['Messung','nein'],['Anschluss','WLAN + LAN']]},
  'pro4pm':  {name:'Shelly Pro 4PM', gen:'Pro', cat:'relay', icon:['din',{ch:4,display:1,label:'4PM'}], price:'ca. 130 €', proto:PRO, pm:true,
    blurb:'Vier Kanäle mit Messung und Farbdisplay – der Klassiker für den Verteiler.',
    specs:[['Kanäle','4'],['Last','bis 16 A/Kanal'],['Messung','je Kanal'],['Extra','Display + LAN']]},
  'pro1pm40':{name:'Shelly Pro 1PM 40A Gen4', gen:'Pro · Gen4', cat:'relay', icon:['din',{ch:1,display:1,label:'40A'}], price:'ca. 95 €', proto:['Wi-Fi','LAN','Bluetooth','Zigbee','Matter'], pm:true,
    blurb:'Erstes Pro-Modul mit Matter/Zigbee – bis 40 A für starke Lasten (Boiler & Co.).',
    specs:[['Kanäle','1'],['Last','bis 40 A'],['Messung','ja'],['Anschluss','WLAN + LAN + Matter']]},

  /* ---- Energiemesser ---- */
  'em':      {name:'Shelly EM Gen4', gen:'Gen4', cat:'meter', icon:['meter',{}], price:'ca. 35 €', proto:WIFI4, pm:true,
    blurb:'Misst einen Stromkreis per Klemme (auch PV), schaltet über potentialfreien Kontakt ein Schütz.',
    specs:[['Messung','1 Klemme (CT)'],['Schaltkontakt','ja (Schütz)'],['Speicher','lokal'],['PV/Einspeisung','ja']]},
  'em63':    {name:'Shelly EM-63 Gen4', gen:'Gen4', cat:'meter', icon:['meter',{}], price:'ca. 40 €', proto:WIFI4, pm:true,
    blurb:'1-phasiger Energiezähler bis 63 A mit berührungsloser Messung – ganzer Hausanschluss (1-phasig).',
    specs:[['Phasen','1'],['Bereich','bis 63 A'],['Messung','berührungslos'],['Speicher','lokal']]},
  '3em63':   {name:'Shelly 3EM-63 Gen3', gen:'Gen3', cat:'meter', icon:['din',{ch:3,label:'3EM'}], price:'ca. 90 €', proto:WIFI3, pm:true,
    blurb:'3-phasiger Zähler bis 63 A/Phase – kompakt für den Verteiler.',
    specs:[['Phasen','3'],['Bereich','bis 63 A/Phase'],['Bauform','Hutschiene'],['Speicher','lokal']]},
  'pro3em':  {name:'Shelly Pro 3EM', gen:'Pro', cat:'meter', icon:['din',{ch:3,display:1,label:'3EM'}], price:'ca. 110 €', proto:PRO, pm:true,
    blurb:'3-phasiger Zähler im Zählerschrank mit 3×120 A Wandlern, 60 Tage Speicher, Matter-ready.',
    specs:[['Phasen','3'],['Wandler','3 × 120 A CT'],['Speicher','60 Tage'],['Anschluss','WLAN + LAN']]},
  'pro3em400':{name:'Shelly Pro 3EM-400', gen:'Pro', cat:'meter', icon:['din',{ch:3,display:1,label:'400'}], price:'ca. 140 €', proto:PRO, pm:true,
    blurb:'Wie Pro 3EM, aber für sehr große Ströme bis 400 A pro Phase.',
    specs:[['Phasen','3'],['Wandler','bis 400 A CT'],['Speicher','60 Tage'],['Anschluss','WLAN + LAN']]},
  'proem50': {name:'Shelly Pro EM-50', gen:'Pro', cat:'meter', icon:['din',{ch:2,display:1,label:'EM50'}], price:'ca. 90 €', proto:PRO, pm:true,
    blurb:'1-phasig, 2 Messkanäle (2×50 A CT) plus Schaltkontakt – ideal für PV-Überschuss-Steuerung.',
    specs:[['Phasen','1'],['Kanäle','2 × 50 A CT'],['Schaltkontakt','ja'],['Anschluss','WLAN + LAN']]},

  /* ---- Stecker ---- */
  'plugs':   {name:'Shelly Plug S Gen3', gen:'Gen3', cat:'plug', icon:['plugRound',{}], price:'ca. 19 €', proto:WIFI3, pm:true,
    blurb:'Kompakter Zwischenstecker mit Messung und LED-Ring, bis ~2500 W.',
    specs:[['Leistung','bis ~2500 W'],['Messung','ja'],['Extra','LED-Ring'],['Bauform','sehr kompakt']]},
  'plugm':   {name:'Shelly Plug M Gen3', gen:'Gen3', cat:'plug', icon:['plugSquare',{}], price:'ca. 20 €', proto:WIFI3, pm:true,
    blurb:'Kräftiger Zwischenstecker bis 3000 W (13 A) – für Heizlüfter, Staubsauger & Co.',
    specs:[['Leistung','bis 3000 W'],['Strom','13 A'],['Messung','ja'],['Matter','ja']]},
  'plugout': {name:'Shelly Outdoor Plug S Gen3', gen:'Gen3', cat:'plug', icon:['plugSquare',{out:1}], price:'ca. 25 €', proto:WIFI3, pm:true,
    blurb:'Wetterfester Außenstecker mit Messung – für Garten, Terrasse, Deko.',
    specs:[['Einsatz','außen (IP44)'],['Messung','ja'],['Leistung','bis ~2500 W'],['Matter','ja']]},
  'strip4':  {name:'Shelly Power Strip 4 Gen4', gen:'Gen4', cat:'plug', icon:['strip',{}], price:'ca. 40 €', proto:WIFI4, pm:true,
    blurb:'Steckdosenleiste mit 4 einzeln messbaren Ausgängen.',
    specs:[['Ausgänge','4 (einzeln)'],['Messung','je Ausgang'],['Bauform','Leiste'],['Matter','ja']]},

  /* ---- Sensoren ---- */
  'blumotion':{name:'Shelly BLU Motion', gen:'BLU · Bluetooth', cat:'sensor', icon:['motion',{}], price:'ca. 20 €', proto:['Bluetooth'], pm:false, gateway:true,
    blurb:'Bewegungsmelder mit Helligkeitssensor, bis ~5 Jahre Batterie.',
    specs:[['Erfasst','Bewegung + Lux'],['Batterie','~5 Jahre'],['Funk','Bluetooth'],['Gateway','nötig*']]},
  'presence':{name:'Shelly Presence Gen4', gen:'Gen4', cat:'sensor', icon:['presence',{}], price:'ca. 35 €', proto:WIFI4, pm:false,
    blurb:'Feine Anwesenheitserkennung (mmWave) – erkennt auch ruhende Personen.',
    specs:[['Erfasst','Anwesenheit (mmWave)'],['Vorteil','erkennt Ruhe'],['Funk','WLAN'],['Gateway','nein']]},
  'blucontact':{name:'Shelly BLU Door/Window', gen:'BLU · Bluetooth', cat:'sensor', icon:['contact',{}], price:'ca. 20 €', proto:['Bluetooth'], pm:false, gateway:true,
    blurb:'Tür-/Fensterkontakt mit Neigung und Helligkeit, sehr flach.',
    specs:[['Erfasst','offen/zu, Neigung, Lux'],['Batterie','~5 Jahre'],['Funk','Bluetooth'],['Gateway','nötig*']]},
  'bluht':   {name:'Shelly BLU H&T', gen:'BLU · Bluetooth', cat:'sensor', icon:['thermo',{}], price:'ca. 23 €', proto:['Bluetooth','Zigbee'], pm:false, gateway:true,
    blurb:'Temperatur & Luftfeuchte, winzig, lange Batterie.',
    specs:[['Erfasst','Temp + Feuchte'],['Batterie','sehr lang'],['Funk','Bluetooth/Zigbee'],['Gateway','nötig*']]},
  'plusht':  {name:'Shelly Plus H&T Gen3', gen:'Gen3', cat:'sensor', icon:['thermo',{}], price:'ca. 35 €', proto:['Wi-Fi','Bluetooth'], pm:false,
    blurb:'Temperatur & Luftfeuchte über WLAN – mit E-Paper-Display, ohne Hub.',
    specs:[['Erfasst','Temp + Feuchte'],['Display','E-Paper'],['Funk','WLAN'],['Gateway','nein']]},
  'flood':   {name:'Shelly Flood Gen4', gen:'Gen4', cat:'sensor', icon:['water',{}], price:'ca. 22 €', proto:WIFI4, pm:false,
    blurb:'Wassermelder mit Sensorkabel – sofortige Alarme bei Leckagen.',
    specs:[['Erfasst','Wasser / Leck'],['Extra','Sensorkabel'],['Funk','WLAN + Zigbee'],['Gateway','nein']]},
  'smoke':   {name:'Shelly Plus Smoke', gen:'Plus', cat:'sensor', icon:['smoke',{}], price:'ca. 40 €', proto:['Wi-Fi','Bluetooth'], pm:false,
    blurb:'Rauchmelder mit App-Alarm und Automationen.',
    specs:[['Erfasst','Rauch'],['Alarm','App + Sirene'],['Funk','WLAN'],['Gateway','nein']]},
  'gas':     {name:'Shelly Gas', gen:'Gen1', cat:'sensor', icon:['gas',{}], price:'ca. 55 €', proto:['Wi-Fi'], pm:false,
    blurb:'Gasmelder (Methan/Propan) mit Alarm und optionalem Ventil-Trigger.',
    specs:[['Erfasst','Gas'],['Alarm','App + Sirene'],['Funk','WLAN'],['Gateway','nein']]},
  'blutrv':  {name:'Shelly BLU TRV', gen:'BLU · Bluetooth', cat:'sensor', icon:['trv',{}], price:'ca. 50 €', proto:['Bluetooth'], pm:false, gateway:true,
    blurb:'Smarter Heizkörper-Thermostatkopf für präzise Raumtemperatur.',
    specs:[['Funktion','Heizkörper-Ventil'],['Regelung','per App/Szene'],['Funk','Bluetooth'],['Gateway','nötig*']]},

  /* ---- Taster / Gateway / Panel ---- */
  'blubutton':{name:'Shelly BLU Button', gen:'BLU · Bluetooth', cat:'input', icon:['button',{}], price:'ca. 13 €', proto:['Bluetooth'], pm:false, gateway:true,
    blurb:'Batterie-Funktaster – überall aufklebbar, löst Szenen aus.',
    specs:[['Bedienung','1 Taste, Mehrfachklick'],['Montage','frei platzierbar'],['Funk','Bluetooth'],['Gateway','nötig*']]},
  'blugw':   {name:'Shelly BLU Gateway', gen:'BLU', cat:'input', icon:['gateway',{}], price:'ca. 15 €', proto:['Wi-Fi','Bluetooth'], pm:false,
    blurb:'Brücke, die BLU-Sensoren ins WLAN/Cloud bringt (falls kein anderes Shelly als Gateway dient).',
    specs:[['Zweck','BLU → WLAN/Cloud'],['Nötig für','BLU in der App'],['Funk','WLAN + BT'],['Alternative','jedes Nicht-Sensor-Shelly']]},
  'wall':    {name:'Shelly Wall Display', gen:'Gen3', cat:'panel', icon:['panel',{}], price:'ca. 110 €', proto:['Wi-Fi','Bluetooth','Zigbee'], pm:false,
    blurb:'Wand-Touchpanel mit integriertem Relais und Sensorik – Steuerzentrale im Raum.',
    specs:[['Display','Touch'],['Relais','integriert'],['Sensorik','Temp u. a.'],['Montage','Wanddose']]},
  'wallxl':  {name:'Shelly Wall Display XL', gen:'Gen3', cat:'panel', icon:['panel',{}], price:'ca. 170 €', proto:['Wi-Fi','Bluetooth','Zigbee'], pm:false,
    blurb:'Großes 10,1"-Dashboard für Licht, Rollläden, Heizung, Kamera & Energie.',
    specs:[['Display','10,1" Touch'],['Relais','integriert'],['4 Tasten','frei belegbar'],['Montage','Wanddose']]},

  /* ---- Z-Wave (Wave) für bestehende Z-Wave-Netze ---- */
  'wave1':   {name:'Shelly Wave 1', gen:'Wave · Z-Wave', cat:'relay', icon:['relay',{mini:1,label:'Z'}], price:'ca. 30 €', proto:['Z-Wave'], pm:false, hub:true,
    blurb:'Potentialfreies Unterputz-Relais für Z-Wave-Netze (Hub nötig).',
    specs:[['Kanäle','1 (potentialfrei)'],['Funk','Z-Wave'],['Messung','nein'],['Hub','erforderlich']]},
  'wave1pm': {name:'Shelly Wave 1PM', gen:'Wave · Z-Wave', cat:'relay', icon:['relay',{mini:1,pm:1,label:'ZP'}], price:'ca. 33 €', proto:['Z-Wave'], pm:true, hub:true,
    blurb:'Unterputz-Relais mit Messung für Z-Wave-Netze.',
    specs:[['Kanäle','1'],['Funk','Z-Wave'],['Messung','ja'],['Hub','erforderlich']]},
  'wave2pm': {name:'Shelly Wave 2PM', gen:'Wave · Z-Wave', cat:'relay', icon:['relay2',{pm:1}], price:'ca. 45 €', proto:['Z-Wave'], pm:true, hub:true,
    blurb:'Zwei Kanäle / Rollladen mit Messung für Z-Wave.',
    specs:[['Kanäle','2 / Rollladen'],['Funk','Z-Wave'],['Messung','ja'],['Hub','erforderlich']]},
  'wavepro1pm':{name:'Shelly Wave Pro 1PM', gen:'Wave Pro · Z-Wave', cat:'relay', icon:['din',{ch:1,label:'ZPM'}], price:'ca. 60 €', proto:['Z-Wave'], pm:true, hub:true,
    blurb:'Hutschienen-Relais mit Messung für Z-Wave-Verteiler.',
    specs:[['Kanäle','1'],['Bauform','Hutschiene'],['Funk','Z-Wave'],['Hub','erforderlich']]},
  'waveshutter':{name:'Shelly Wave Shutter', gen:'Wave · Z-Wave', cat:'cover', icon:['cover',{}], price:'ca. 45 €', proto:['Z-Wave'], pm:true, hub:true,
    blurb:'Rollladensteuerung für Z-Wave-Netze.',
    specs:[['Rollläden','1'],['Position','ja'],['Funk','Z-Wave'],['Hub','erforderlich']]},
  'wavecontact':{name:'Shelly Wave Door/Window', gen:'Wave · Z-Wave', cat:'sensor', icon:['contact',{}], price:'ca. 30 €', proto:['Z-Wave LR'], pm:false, hub:true,
    blurb:'Tür-/Fensterkontakt mit großer Reichweite (Z-Wave Long Range).',
    specs:[['Erfasst','offen/zu, Neigung, Lux'],['Funk','Z-Wave LR'],['Batterie','lang'],['Hub','erforderlich']]},
  'wavemotion':{name:'Shelly Wave Motion', gen:'Wave · Z-Wave', cat:'sensor', icon:['motion',{}], price:'ca. 35 €', proto:['Z-Wave'], pm:false, hub:true,
    blurb:'Bewegungsmelder für Z-Wave-Netze.',
    specs:[['Erfasst','Bewegung + Lux'],['Funk','Z-Wave'],['Batterie','lang'],['Hub','erforderlich']]},
};

/* ---------------------------------------------------------------------
   3) FRAGEABLAUF (adaptiv, verzweigt)
   Jede Frage schreibt genau EIN Feld ins Profil. `when` entscheidet,
   ob die Frage im aktuellen Zweig überhaupt gestellt wird.
   Reihenfolge im Array = logische Reihenfolge des Flows.
--------------------------------------------------------------------- */
const Q = [
  { id:'goal', field:'goal', eyebrow:'Schritt 01 · Vorhaben',
    title:'Was möchtest du smart machen?',
    lede:'Wähle, worum es dir hauptsächlich geht. Alles Weitere fragen wir passend dazu ab.',
    cols:false,
    when:()=>true,
    opts:[
      {v:'switch', b:'Schalten', s:'Licht oder ein Gerät ein-/ausschalten', ic:['relay',{label:'ON'}]},
      {v:'dim',    b:'Dimmen', s:'Licht dimmen (LED, Streifen, DALI …)', ic:['dimmer',{}]},
      {v:'cover',  b:'Rollladen / Jalousie / Markise', s:'hoch, runter, Position', ic:['cover',{}]},
      {v:'plug',   b:'Steckdose smart machen', s:'Zwischenstecker zum Einstecken', ic:['plugRound',{}]},
      {v:'meter',  b:'Energie messen', s:'Verbrauch/PV erfassen, nicht schalten', ic:['meter',{}]},
      {v:'sensor', b:'Etwas erfassen (Sensor)', s:'Bewegung, Tür, Temperatur, Wasser …', ic:['motion',{}]},
      {v:'input',  b:'Schalter/Taster & Szenen', s:'vorhandene Taster einbinden, Fernauslöser', ic:['input',{}]},
      {v:'panel',  b:'Bedienpanel / Display', s:'Touch-Zentrale an der Wand', ic:['panel',{}]},
    ]},

  { id:'eco', field:'eco', eyebrow:'Schritt 02 · System',
    title:'Welches Smart-Home-System nutzt du?',
    lede:'Bestimmt vor allem, ob wir dir WLAN-, Bluetooth- oder Z-Wave-Geräte empfehlen. Gen4-Module können ohnehin Matter, Zigbee und Wi-Fi gleichzeitig.',
    when:()=>true,
    opts:[
      {v:'matter', b:'Apple Home / Matter', s:'herstellerübergreifend', ic:['gateway',{}]},
      {v:'ha',     b:'Home Assistant', s:'lokal, Bastler-Liebling', ic:['gateway',{}]},
      {v:'ag',     b:'Alexa / Google', s:'Sprachassistent', ic:['gateway',{}]},
      {v:'zwave',  b:'Z-Wave', s:'ich habe einen Z-Wave-Hub', ic:['gateway',{}]},
      {v:'shelly', b:'Nur Shelly-App / egal', s:'ohne festes Ökosystem', ic:['gateway',{}]},
    ]},

  /* ---------- SCHALTEN ---------- */
  { id:'mount', field:'mount', eyebrow:'Einbauort',
    title:'Wo wird das Gerät verbaut?',
    lede:'Unterputz verschwindet hinter Schalter/Steckdose. Die Hutschiene sitzt im Sicherungskasten.',
    when:p=>p.goal==='switch',
    opts:[
      {v:'inwall', b:'Unterputz', s:'hinter Schalter / in der Dose', ic:['relay',{label:'UP'}]},
      {v:'din',    b:'Hutschiene / Verteiler', s:'im Sicherungs-/Zählerschrank', ic:['din',{ch:1,label:'DIN'}]},
    ]},
  { id:'neutral', field:'neutral', eyebrow:'Verkabelung',
    title:'Ist ein Nullleiter (N) in der Dose?',
    lede:'Viele alte Schalterdosen führen nur die Phase. Ohne N brauchst du ein spezielles Modell. Im Zweifel: „Nein / weiß nicht“.',
    when:p=>p.goal==='switch' && p.mount==='inwall',
    opts:[
      {v:'yes', b:'Ja, Nullleiter ist da', s:'Standardfall bei neueren Dosen', ic:['relay',{label:'N'}]},
      {v:'no',  b:'Nein / weiß nicht', s:'nur Phase in der Schalterdose', ic:['noNeutral',{ch:1}]},
    ]},
  { id:'channels', field:'channels', eyebrow:'Kanäle',
    title:'Wie viele Stromkreise steuerst du hier?',
    lede:'Ein Kanal = ein Verbraucher/Schalter. Zwei Kanäle z. B. für Licht + Steckdose an einer Stelle.',
    when:p=>p.goal==='switch' && p.mount==='inwall',
    opts:[
      {v:1, b:'1 Kanal', s:'ein Verbraucher', ic:['relay',{label:'1'}]},
      {v:2, b:'2 Kanäle', s:'zwei getrennte Verbraucher', ic:['relay2',{}]},
    ]},
  { id:'dinch', field:'channels', eyebrow:'Kanäle',
    title:'Wie viele Kanäle brauchst du im Verteiler?',
    lede:'Ein Pro-Modul kann mehrere Stromkreise gleichzeitig schalten.',
    when:p=>p.goal==='switch' && p.mount==='din',
    opts:[
      {v:1, b:'1 Kanal', s:'', ic:['din',{ch:1,label:'1'}]},
      {v:2, b:'2 Kanäle', s:'', ic:['din',{ch:2,label:'2'}]},
      {v:3, b:'3 Kanäle', s:'', ic:['din',{ch:3,label:'3'}]},
      {v:4, b:'4 Kanäle', s:'', ic:['din',{ch:4,label:'4'}]},
    ]},
  { id:'dry', field:'dry', eyebrow:'Kontaktart',
    title:'Brauchst du einen potentialfreien Kontakt?',
    lede:'Potentialfrei = der Schaltkontakt hat keine eigene Spannung. Nötig für Geräte mit eigener Versorgung: Garagentor, Heizkessel, Klingel, 24-V-Technik.',
    when:p=>p.goal==='switch' && (p.neutral==='yes' || p.mount==='din'),
    opts:[
      {v:false, b:'Nein, normale 230-V-Last', s:'Lampe, Steckdose, Pumpe …', ic:['relay',{label:'230'}]},
      {v:true,  b:'Ja, potentialfrei', s:'Garagentor, Kessel, Klingel …', ic:['relay',{label:'∅'}]},
    ]},
  { id:'pm', field:'pm', eyebrow:'Messung',
    title:'Soll das Gerät den Verbrauch messen?',
    lede:'Mit Messung siehst du Watt & Kilowattstunden in der App und kannst darauf automatisieren.',
    when:p=>p.goal==='switch' && p.dry===false,
    opts:[
      {v:true,  b:'Ja, mit Verbrauchsmessung', s:'Watt & kWh im Blick', ic:['relay',{pm:1,label:'PM'}]},
      {v:false, b:'Nein, nur schalten', s:'günstiger, reicht oft', ic:['relay',{label:'1'}]},
    ]},
  { id:'tight', field:'tight', eyebrow:'Platz',
    title:'Wie viel Platz ist in der Dose?',
    lede:'Für flache/volle Dosen gibt es die Mini-Baureihe. Sonst reicht die Standardgröße.',
    when:p=>p.goal==='switch' && p.mount==='inwall' && p.neutral==='yes',
    opts:[
      {v:true,  b:'Eng – so klein wie möglich', s:'Mini-Baureihe', ic:['relay',{mini:1,label:'mini'}]},
      {v:false, b:'Genug Platz / egal', s:'Standardgröße', ic:['relay',{label:'std'}]},
    ]},
  { id:'load', field:'load', eyebrow:'Last',
    title:'Wie hoch ist die Last?',
    lede:'Für sehr starke Verbraucher (Boiler, Durchlauferhitzer) braucht es ein Modul mit hoher Strombelastbarkeit.',
    when:p=>p.goal==='switch' && p.mount==='din' && p.channels===1,
    opts:[
      {v:'std', b:'Normal – bis 16 A', s:'Licht, Steckdosen, Geräte', ic:['din',{ch:1,label:'16A'}]},
      {v:'high',b:'Sehr hoch – bis 40 A', s:'Boiler, Durchlauferhitzer …', ic:['din',{ch:1,display:1,label:'40A'}]},
    ]},

  /* ---------- DIMMEN ---------- */
  { id:'dimtype', field:'dimtype', eyebrow:'Leuchtmittel',
    title:'Was möchtest du dimmen?',
    lede:'Der richtige Dimmer hängt vom Typ der Leuchte bzw. des Treibers ab.',
    when:p=>p.goal==='dim',
    opts:[
      {v:'phase', b:'Dimmbare LED / Glühlampen', s:'Standard-Deckenlicht, Phasenab-/anschnitt', ic:['dimmer',{}]},
      {v:'010',   b:'LED-Treiber mit 0–10 V / 1–10 V', s:'Steuereingang am Vorschaltgerät', ic:['dimmer',{}]},
      {v:'dali',  b:'DALI-Vorschaltgeräte', s:'DALI-Bus-Leuchten', ic:['dimmer',{}]},
      {v:'rgbw',  b:'RGB / RGBW LED-Streifen', s:'Farbige Streifen 12/24 V', ic:['strip_led',{}]},
      {v:'wall',  b:'Sichtbarer Wand-Dimmer', s:'Touch-Slider statt Schalter', ic:['panel',{}]},
    ]},
  { id:'dimmount', field:'mount', eyebrow:'Einbauort',
    title:'Unterputz oder Hutschiene?',
    lede:'',
    when:p=>p.goal==='dim' && (p.dimtype==='phase' || p.dimtype==='010'),
    opts:[
      {v:'inwall', b:'Unterputz', s:'hinter dem Schalter', ic:['dimmer',{}]},
      {v:'din',    b:'Hutschiene', s:'im Verteiler (Pro)', ic:['din',{ch:1,label:'DIM'}]},
    ]},

  /* ---------- ROLLLADEN ---------- */
  { id:'covermount', field:'mount', eyebrow:'Umfang',
    title:'Wie viele Rollläden und wo?',
    lede:'Ein Antrieb passt unter den Schalter. Mehrere steuerst du gebündelt im Verteiler.',
    when:p=>p.goal==='cover',
    opts:[
      {v:'inwall', b:'1 Rollladen, Unterputz', s:'hinter dem Schalter', ic:['cover',{}]},
      {v:'din',    b:'Mehrere / Hutschiene', s:'im Verteiler, mit Messung', ic:['din',{ch:2,label:'2C'}]},
    ]},

  /* ---------- STECKER ---------- */
  { id:'plugwhere', field:'plugwhere', eyebrow:'Ort',
    title:'Innen oder außen?',
    lede:'',
    when:p=>p.goal==='plug',
    opts:[
      {v:'in',  b:'Innen', s:'Wohnraum, Büro', ic:['plugRound',{}]},
      {v:'out', b:'Außen', s:'Garten, Terrasse (wetterfest)', ic:['plugSquare',{out:1}]},
    ]},
  { id:'plugpower', field:'plugpower', eyebrow:'Leistung',
    title:'Was hängt am Stecker?',
    lede:'Starke Verbraucher brauchen mehr Reserve. Für viele Geräte lohnt eine messende Leiste.',
    when:p=>p.goal==='plug' && p.plugwhere==='in',
    opts:[
      {v:'s',    b:'Kleines Gerät, kompakt', s:'bis ~2500 W, mit LED-Ring', ic:['plugRound',{}]},
      {v:'m',    b:'Kräftiges Gerät', s:'bis 3000 W: Heizlüfter, Sauger', ic:['plugSquare',{}]},
      {v:'strip',b:'Mehrere Geräte', s:'Steckdosenleiste, einzeln messbar', ic:['strip',{}]},
    ]},

  /* ---------- ENERGIE MESSEN ---------- */
  { id:'meterscope', field:'meterscope', eyebrow:'Messumfang',
    title:'Was genau willst du messen?',
    lede:'Von einem einzelnen Kreis bis zum ganzen Drehstrom-Hausanschluss – das entscheidet das Modell.',
    when:p=>p.goal==='meter',
    opts:[
      {v:'single', b:'Ein Kreis, Unterputz – nur messen', s:'winzig, kein Schalten', ic:['relay',{mini:1,label:'PM'}]},
      {v:'ct',     b:'Ein Kreis per Klemme (auch PV)', s:'+ Schütz schalten möglich', ic:['meter',{}]},
      {v:'home1',  b:'Ganzes Haus, 1-phasig', s:'Hausanschluss bis 63 A', ic:['meter',{}]},
      {v:'home3',  b:'Ganzes Haus, 3-phasig (Drehstrom)', s:'im Zählerschrank', ic:['din',{ch:3,display:1,label:'3EM'}]},
      {v:'two',    b:'Zwei Kreise + Schütz (PV-Überschuss)', s:'z. B. Überschuss-Steuerung', ic:['din',{ch:2,display:1,label:'EM50'}]},
      {v:'huge',   b:'Sehr große Ströme (>120 A)', s:'Gewerbe / große Anlagen', ic:['din',{ch:3,display:1,label:'400'}]},
    ]},

  /* ---------- SENSOR ---------- */
  { id:'sensortype', field:'sensortype', eyebrow:'Messgröße',
    title:'Was soll der Sensor erfassen?',
    lede:'',
    when:p=>p.goal==='sensor',
    opts:[
      {v:'motion',   b:'Bewegung', s:'PIR-Melder', ic:['motion',{}]},
      {v:'presence', b:'Anwesenheit (mmWave)', s:'erkennt auch ruhende Personen', ic:['presence',{}]},
      {v:'contact',  b:'Tür / Fenster', s:'offen / geschlossen', ic:['contact',{}]},
      {v:'temp',     b:'Temperatur & Luftfeuchte', s:'Klima im Raum', ic:['thermo',{}]},
      {v:'water',    b:'Wasser / Leck', s:'Waschmaschine, Keller', ic:['water',{}]},
      {v:'smoke',    b:'Rauch', s:'Brandschutz', ic:['smoke',{}]},
      {v:'gas',      b:'Gas', s:'Methan / Propan', ic:['gas',{}]},
      {v:'trv',      b:'Heizkörper-Thermostat', s:'Ventilkopf (TRV)', ic:['trv',{}]},
    ]},
  { id:'sensorconn', field:'sensorconn', eyebrow:'Anbindung',
    title:'Wie soll der Sensor funken?',
    lede:'WLAN funktioniert ohne Hub, verbraucht aber mehr Strom. Bluetooth-Sensoren (BLU) halten Jahre, brauchen aber ein Gateway – ein anderes Shelly reicht dafür.',
    when:p=>p.goal==='sensor' && (p.sensortype==='motion' || p.sensortype==='contact' || p.sensortype==='temp'),
    opts:[
      {v:'wifi',  b:'WLAN direkt, ohne Hub', s:'einfachster Einstieg', ic:['thermo',{}]},
      {v:'bt',    b:'Bluetooth, sehr lange Batterie', s:'braucht Gateway*', ic:['motion',{}]},
      {v:'zwave', b:'Z-Wave', s:'ich habe einen Z-Wave-Hub', ic:['contact',{}]},
    ]},

  /* ---------- INPUT / SZENEN ---------- */
  { id:'inputtype', field:'inputtype', eyebrow:'Art',
    title:'Wie sollen Taster/Szenen eingebunden werden?',
    lede:'',
    when:p=>p.goal==='input',
    opts:[
      {v:'ac',     b:'Vorhandene Schalter (230 V) einbinden', s:'4 Eingänge, kein Relais', ic:['input',{}]},
      {v:'dc',     b:'Niederspannung 5–24 V DC', s:'Klingel, Sensoren, KFZ', ic:['input',{}]},
      {v:'button', b:'Funk-Taster (Batterie)', s:'frei aufklebbar', ic:['button',{}]},
    ]},

  /* ---------- PANEL ---------- */
  { id:'panelsize', field:'panelsize', eyebrow:'Größe',
    title:'Welches Bedienpanel?',
    lede:'',
    when:p=>p.goal==='panel',
    opts:[
      {v:'std', b:'Standard Wand-Panel', s:'Touch + Relais + Sensorik', ic:['panel',{}]},
      {v:'xl',  b:'Groß, 10,1" Dashboard', s:'Kamera, Energie, alles im Blick', ic:['panel',{}]},
    ]},
];

/* ---------------------------------------------------------------------
   4) MATCHING – vom Profil zur Empfehlung
   liefert { primary, alts:[], reasons:[], notes:[] }  (IDs aus P)
--------------------------------------------------------------------- */
function resolve(p){
  const R = (primary, alts, reasons, notes)=>({primary, alts:alts||[], reasons:reasons||[], notes:notes||[]});
  const zwave = p.eco==='zwave';
  const ecoNote = zwaveNote(p);

  /* ---- SCHALTEN ---- */
  if(p.goal==='switch'){
    // Z-Wave-Zweig (nur wo sinnvoll)
    if(zwave){
      if(p.mount==='din') return R('wavepro1pm', ['pro1pm','pro1'],
        ['Du nutzt ein Z-Wave-Netz – Wave-Module binden sich direkt in deinen Hub ein.',
         'Hutschienen-Ausführung mit Messung für den Verteiler.'],
        ['Ohne Z-Wave-Hub sind die Pro-Modelle (WLAN/LAN) meist die bessere Wahl.']);
      const zpm = p.pm!==false;
      return R(zpm?'wave1pm':'wave1', [zpm?'wave2pm':'wave1pm', zpm?'1pm':'1'],
        ['Passt in dein bestehendes Z-Wave-Netz und braucht kein WLAN.',
         zpm?'Mit Verbrauchsmessung.':'Reines Schalten, günstiger.'],
        ['Wave-Geräte benötigen einen Z-Wave-Hub. Ohne Hub nimm die Gen4-WLAN-Variante.']);
    }
    // Hutschiene / Pro
    if(p.mount==='din'){
      if(p.channels===1){
        if(p.load==='high') return R('pro1pm40', ['pro1pm','pro1'],
          ['Bis 40 A – ausgelegt für starke Verbraucher wie Boiler oder Durchlauferhitzer.',
           'Als Gen4-Pro sogar mit Matter & Zigbee zusätzlich zu WLAN/LAN.'], ecoNote);
        if(p.dry) return R('pro1', ['pro1pm'],
          ['Potentialfreier Kanal auf der Hutschiene – ideal für Geräte mit eigener Spannung.',
           'Robust mit LAN und Schutzfunktionen im Verteiler.'], ecoNote);
        return R('pro1pm', ['pro1','pro1pm40'],
          ['Ein Kanal mit Messung, LAN und Überlast-/Übertemperaturschutz im Verteiler.'], ecoNote);
      }
      if(p.channels===2) return R(p.dry?'pro2':'pro2pm', [p.dry?'pro2pm':'pro2','pro4pm'],
        [p.dry?'Zwei potentialfreie Kanäle auf der Hutschiene.':'Zwei Kanäle mit Messung – auch als Rollladensteuerung nutzbar.'], ecoNote);
      if(p.channels===3) return R('pro3', ['pro4pm','pro2pm'],
        ['Drei potentialfreie Kanäle für größere Installationen.'], ecoNote);
      return R('pro4pm', ['pro3','pro2pm'],
        ['Vier Kanäle mit Messung und Display – der Verteiler-Klassiker.'], ecoNote);
    }
    // Unterputz
    if(p.neutral==='no'){
      return R(p.channels===2?'2l':'1l', [p.channels===2?'1l':'2l','1'],
        ['Deine Dose hat keinen Nullleiter – die L-Baureihe kommt mit nur der Phase aus.',
         'Ideal zum Nachrüsten bestehender Schalter.'],
        ['Ohne N ist die Last (v. a. bei LED) begrenzt. Bei Flackern hilft ggf. ein Bypass.'].concat(ecoNote));
    }
    if(p.channels===2) return R('2pm', ['pro2pm','1pm'],
      ['Zwei Kanäle mit Messung an einer Stelle – oder ein Rollladen.',
       'Gen4: WLAN, Bluetooth, Zigbee und Matter gleichzeitig.'], ecoNote);
    // 1 Kanal Unterputz
    if(p.dry){
      return R(p.tight?'1mini':'1', [p.tight?'1':'1mini','pro1'],
        ['Potentialfreier Kontakt für Garagentor, Kessel, Klingel & Co.',
         p.tight?'Mini-Bauform für enge Dosen.':'Standardgröße mit bis zu 16 A.'], ecoNote);
    }
    if(p.pm!==false){
      return R(p.tight?'1pmmini':'1pm', [p.tight?'1pm':'1pmmini','2pm'],
        ['Ein Kanal mit Verbrauchsmessung – der Allrounder.',
         p.tight?'Mini-Version für flache Dosen.':'Bis 16 A für Licht und Geräte.'], ecoNote);
    }
    return R(p.tight?'1mini':'1', [p.tight?'1pmmini':'1pm','1'],
      ['Reines Schalten ohne Messung – günstig und kompakt.',
       p.tight?'Kleinste Bauform.':'Standardgröße bis 16 A.'], ecoNote);
  }

  /* ---- DIMMEN ---- */
  if(p.goal==='dim'){
    if(p.dimtype==='rgbw') return R('rgbw', ['dim'],
      ['Für farbige RGB/RGBW-Streifen mit eigener Messung.'], ecoNote);
    if(p.dimtype==='dali') return R('dali', ['dim010'],
      ['Für DALI-Vorschaltgeräte bzw. DALI-Bus-Leuchten.'], ecoNote);
    if(p.dimtype==='wall') return R('walldim', ['dim'],
      ['Sichtbares Bedienteil mit Touch-Slider – ersetzt den Lichtschalter.'], ecoNote);
    if(p.dimtype==='010') return R(p.mount==='din'?'dim010':'dim010', ['dim'],
      ['Steuert LED-Treiber mit 0–10 V / 1–10 V Eingang, inkl. Messung.'], ecoNote);
    // phase
    return R('dim', ['dim010','walldim'],
      ['Unterputz-Dimmer für dimmbare LED und Glühlampen (Phasenab-/anschnitt), mit Messung.',
       'Gen4 mit Matter, Zigbee und WLAN.'], ecoNote);
  }

  /* ---- ROLLLADEN ---- */
  if(p.goal==='cover'){
    if(zwave) return R('waveshutter', ['2pm'],
      ['Rollladensteuerung für dein Z-Wave-Netz.'],
      ['Braucht einen Z-Wave-Hub.']);
    if(p.mount==='din') return R('produal', ['pro2pm','2pm'],
      ['Zwei Rollläden/Markisen gebündelt im Verteiler, mit Messung und LAN.'], ecoNote);
    return R('2pm', ['produal','pro2pm'],
      ['Im Rollladen-Modus steuert das 2PM einen Antrieb inkl. Position und Messung.',
       'Passt hinter den vorhandenen Schalter.'], ecoNote);
  }

  /* ---- STECKER ---- */
  if(p.goal==='plug'){
    if(p.plugwhere==='out') return R('plugout', ['plugm','plugs'],
      ['Wetterfester Außenstecker mit Messung – für Garten und Terrasse.'], ecoNote);
    if(p.plugpower==='strip') return R('strip4', ['plugm','plugs'],
      ['Steckdosenleiste mit vier einzeln messbaren Ausgängen.'], ecoNote);
    if(p.plugpower==='m') return R('plugm', ['plugs','strip4'],
      ['Bis 3000 W – genug Reserve für Heizlüfter, Staubsauger & Co.'], ecoNote);
    return R('plugs', ['plugm','strip4'],
      ['Kompakter Zwischenstecker mit Messung und LED-Statusring.'], ecoNote);
  }

  /* ---- ENERGIE ---- */
  if(p.goal==='meter'){
    switch(p.meterscope){
      case 'single': return R('pmmini', ['em'],
        ['Winziger reiner Verbrauchsmesser für einen Kreis – ohne Schaltfunktion.'], ecoNote);
      case 'ct': return R('em', ['proem50','em63'],
        ['Misst einen Kreis per Stromwandler-Klemme, auch PV-Einspeisung.',
         'Der potentialfreie Kontakt kann ein Schütz schalten.'], ecoNote);
      case 'home1': return R('em63', ['em','3em63'],
        ['1-phasiger Hausanschluss bis 63 A mit berührungsloser Messung.'], ecoNote);
      case 'home3': return R('pro3em', ['3em63','pro3em400'],
        ['3-phasiger Zähler für den Zählerschrank, 3×120 A Wandler, 60 Tage Speicher, Matter-ready.'], ecoNote);
      case 'two': return R('proem50', ['em','pro3em'],
        ['Zwei Messkanäle plus Schaltkontakt – gemacht für PV-Überschuss-Steuerung.'], ecoNote);
      case 'huge': return R('pro3em400', ['pro3em'],
        ['Für sehr große Ströme bis 400 A pro Phase.'], ecoNote);
    }
  }

  /* ---- SENSOR ---- */
  if(p.goal==='sensor'){
    if(p.sensortype==='presence') return R('presence', ['blumotion'],
      ['mmWave erkennt auch ruhende Personen – zuverlässiger als klassische PIR-Melder.'], ecoNote);
    if(p.sensortype==='water') return R('flood', [],
      ['Wassermelder mit Sensorkabel, funkt direkt über WLAN – ohne Gateway.'], ecoNote);
    if(p.sensortype==='smoke') return R('smoke', [],
      ['Rauchmelder mit App-Alarm und Automationen über WLAN.'], ecoNote);
    if(p.sensortype==='gas') return R('gas', [],
      ['Gasmelder mit Alarm; kann per Szene z. B. ein Ventil auslösen.'], ecoNote);
    if(p.sensortype==='trv') return R('blutrv', ['bluht'],
      ['Heizkörper-Thermostatkopf für präzise Raumtemperatur.'],
      ['Als BLU-Gerät über Bluetooth – ein anderes Shelly oder das BLU Gateway dient als Brücke.']);
    // motion / contact / temp mit Anbindungswahl
    const conn = p.sensorconn;
    if(p.sensortype==='motion'){
      if(conn==='zwave') return R('wavemotion', ['blumotion'], ['Bewegungsmelder für dein Z-Wave-Netz.'], ['Braucht Z-Wave-Hub.']);
      if(conn==='wifi')  return R('presence', ['blumotion'], ['Über WLAN ohne Gateway; Presence erkennt sogar ruhende Personen.'], ecoNote);
      return R('blumotion', ['presence'], ['Bluetooth-Bewegungsmelder mit bis zu ~5 Jahren Batterie.'], gwNote());
    }
    if(p.sensortype==='contact'){
      if(conn==='zwave') return R('wavecontact', ['blucontact'], ['Tür-/Fensterkontakt mit großer Reichweite (Z-Wave LR).'], ['Braucht Z-Wave-Hub.']);
      return R('blucontact', ['wavecontact'], ['Sehr flacher Tür-/Fensterkontakt, lange Batterie.'],
        conn==='wifi'?['Für Tür/Fenster gibt es keinen reinen WLAN-Sensor – dieser BLU ist der Standard. Ein anderes Shelly dient als Gateway.']:gwNote());
    }
    // temp
    if(conn==='wifi') return R('plusht', ['bluht'], ['Temperatur & Luftfeuchte über WLAN, mit E-Paper-Display, ohne Hub.'], ecoNote);
    return R('bluht', ['plusht'], ['Winziger Temperatur-/Feuchtesensor mit sehr langer Batterie.'], gwNote());
  }

  /* ---- INPUT ---- */
  if(p.goal==='input'){
    if(p.inputtype==='dc') return R('i4dc', ['i4'], ['4 Eingänge für 5–24 V DC – Klingel, Sensoren, Kleinspannung.'], ecoNote);
    if(p.inputtype==='button') return R('blubutton', ['i4'], ['Batterie-Funktaster, frei platzierbar, löst Szenen aus.'], gwNote());
    return R('i4', ['i4dc'], ['4 Eingänge (230 V) – vorhandene Schalter smart machen und Szenen auslösen.'], ecoNote);
  }

  /* ---- PANEL ---- */
  if(p.goal==='panel'){
    return p.panelsize==='xl'
      ? R('wallxl', ['wall'], ['Großes 10,1"-Dashboard als Steuerzentrale für die ganze Wohnung.'], [])
      : R('wall', ['wallxl'], ['Wand-Touchpanel mit Relais und Sensorik – Steuerung direkt im Raum.'], []);
  }

  return R('1pm', ['1'], ['Vielseitiger Standard für die meisten Aufgaben.'], []);
}

function gwNote(){ return ['BLU-Sensoren funken über Bluetooth. Als Gateway genügt ein beliebiges anderes Shelly (Relais, Stecker …) oder das kleine BLU Gateway.']; }
function zwaveNote(p){ return []; }

/* ---------------------------------------------------------------------
   5) RENDER-ENGINE + NAVIGATION
--------------------------------------------------------------------- */
const app = document.getElementById('app');
const restartTop = document.getElementById('restartTop');
let state = { profile:{}, history:[] };  // history: [{qId, field, value, label, eyebrow}]

function nextQuestion(){
  for(const q of Q){
    if(q.when(state.profile) && state.profile[q.field] === undefined) return q;
  }
  return null;
}

function goIntro(e){ if(e) e.preventDefault(); state={profile:{},history:[]}; restartTop.hidden=true; renderIntro(); window.scrollTo({top:0,behavior:'smooth'}); return false; }

function start(){ restartTop.hidden=false; render(); }

function choose(q, opt){
  state.profile[q.field] = opt.v;
  state.history.push({qId:q.id, field:q.field, value:opt.v, label:opt.b, eyebrow:q.eyebrow});
  render();
  window.scrollTo({top:0,behavior:'smooth'});
}

function back(){
  const last = state.history.pop();
  if(last){ delete state.profile[last.field]; }
  if(state.history.length===0 && !nextQuestion()){ /* stay */ }
  render();
  window.scrollTo({top:0,behavior:'smooth'});
}

/* ---- estimate total steps for the progress bar (branch-aware) ---- */
function estimateTotal(){
  // count questions that currently apply given the profile so far + already answered
  let count = state.history.length;
  const snap = {...state.profile};
  for(const q of Q){
    if(q.when(snap) && snap[q.field]===undefined){ count++; snap[q.field]='__'; }
  }
  return Math.max(count, state.history.length+1);
}

function render(){
  const q = nextQuestion();
  if(!q){ renderResult(); return; }
  renderQuestion(q);
}

/* ---------- INTRO ---------- */
function renderIntro(){
  app.innerHTML = `
   <div class="stage">
     <div class="spine" aria-hidden="true">
       <h2>Ablauf</h2>
       <div class="trail">
         <div class="node"><span class="dot"></span><span class="lbl">01</span><span class="val">Vorhaben</span></div>
         <div class="node"><span class="dot"></span><span class="lbl">02</span><span class="val">System</span></div>
         <div class="node"><span class="dot"></span><span class="lbl">03+</span><span class="val">Details</span></div>
         <div class="node"><span class="dot"></span><span class="lbl">→</span><span class="val">Empfehlung</span></div>
       </div>
     </div>
     <div class="intro fade-in">
       <div class="panel" style="margin-bottom:6px"><div class="eyebrow">Shelly-Auswahlhilfe</div></div>
       <h1>Welches <span class="hl">Shelly</span> passt<br>zu deinem Vorhaben?</h1>
       <p class="lede">Über 40 Module – Relais, Dimmer, Rollladen, Energiemesser, Stecker, Sensoren, Panels. Beantworte ein paar Fragen und du landest bei dem Gerät, das du wirklich brauchst – inklusive Begründung, Alternativen und Datenblatt.</p>
       <button class="startbtn" onclick="start()">Los geht's
         <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg>
       </button>
       <div class="introstats">
         <div><b data-to="40" data-suffix="+">40+</b><span>Geräte im Pool</span></div>
         <div><b data-to="8">8</b><span>Einsatzbereiche</span></div>
         <div><b data-to="2" data-prefix="~" data-suffix=" Min">~2 Min</b><span>bis zur Empfehlung</span></div>
       </div>
     </div>
   </div>`;
  animateStats();
}

/* ---------- QUESTION ---------- */
function renderQuestion(q){
  const total = estimateTotal();
  const done = state.history.length;
  const pct = Math.round(done/total*100);
  const cols = q.opts.length>=4 && q.opts.every(o=>!o.s || o.s.length<40) ? 'cols-2' : (q.cols===false?'':'');

  const spine = state.history.map((h,i)=>`
    <div class="node done"><span class="dot"></span><span class="lbl">${escapeHtml(h.eyebrow.split('·')[0].trim())}</span><span class="val">${escapeHtml(h.label)}</span></div>`).join('')
    + `<div class="node active"><span class="dot"></span><span class="lbl">${escapeHtml(q.eyebrow.split('·')[0].trim())}</span><span class="val">${escapeHtml(q.title)}</span></div>`;
  const fillH = state.history.length===0 ? 0 : (state.history.length/(state.history.length+1))*100;

  app.innerHTML = `
   <div class="stage">
     <aside class="spine" aria-hidden="true">
       <h2>Deine Auswahl</h2>
       <div class="trail"><div class="fill" style="height:${fillH}%"></div>${spine}</div>
     </aside>
     <section class="panel fade-in" role="group" aria-labelledby="qtitle">
       <div class="mprog"><div class="bar"><i style="width:${pct}%"></i></div><span class="pct">${done} / ~${total}</span></div>
       <div class="eyebrow">${escapeHtml(q.eyebrow)}</div>
       <h1 id="qtitle">${escapeHtml(q.title)}</h1>
       ${q.lede?`<p class="lede">${escapeHtml(q.lede)}</p>`:''}
       <div class="opts ${cols}">
         ${q.opts.map((o,i)=>`
           <button class="opt" data-i="${i}">
             <span class="ic">${icon(o.ic[0], o.ic[1])}</span>
             <span class="txt"><b>${escapeHtml(o.b)}</b>${o.s?`<span>${escapeHtml(o.s)}</span>`:''}</span>
             <span class="chev"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 6l6 6-6 6"/></svg></span>
           </button>`).join('')}
       </div>
       <div class="navrow">
         <button class="back" onclick="back()" ${state.history.length===0?'disabled':''}>
           <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 6l-6 6 6 6"/></svg>
           Zurück
         </button>
         <span class="hint">Antwort wählen …</span>
       </div>
     </section>
   </div>`;

  app.querySelectorAll('.opt').forEach(btn=>{
    btn.addEventListener('click',()=>{
      const o = q.opts[+btn.dataset.i];
      btn.classList.add('sel');
      setTimeout(()=>choose(q,o), 150);
    });
  });
}

/* ---------- RESULT ---------- */
function renderResult(){
  const rec = resolve(state.profile);
  const prod = P[rec.primary] || P['1pm'];
  const chips = prod.proto.map(x=>`<span class="chip">${escapeHtml(x)}</span>`).join('')
    + (prod.pm?`<span class="chip pm">Messung</span>`:'');
  const specs = prod.specs.map(([k,v])=>`<div class="row"><div class="k">${escapeHtml(k)}</div><div class="v">${escapeHtml(v)}</div></div>`).join('');
  const reasons = rec.reasons.map(r=>`<li>${check()} <span>${escapeHtml(r)}</span></li>`).join('');
  const notes = rec.notes.map(n=>`<div class="note">${escapeHtml(n).replace(/\*/g,'')}</div>`).join('');
  const alts = rec.alts.map(id=>{ const a=P[id]; if(!a) return ''; return `
    <div class="altcard">
      <span class="ic">${icon(a.icon[0], a.icon[1])}</span>
      <div><b>${escapeHtml(a.name)}</b><span>${escapeHtml(a.blurb)}</span><span class="p">${escapeHtml(a.price)}</span></div>
    </div>`; }).join('');

  const path = state.history.map(h=>`<span class="chip">${escapeHtml(h.label)}</span>`).join(' ');
  const shopUrl = 'https://www.shelly.com/search?q=' + encodeURIComponent(prod.name.replace('Shelly ',''));

  app.innerHTML = `
   <div class="stage">
     <aside class="spine" aria-hidden="true">
       <h2>Dein Weg</h2>
       <div class="trail"><div class="fill" style="height:100%"></div>
         ${state.history.map(h=>`<div class="node done"><span class="dot"></span><span class="lbl">${escapeHtml(h.eyebrow.split('·')[0].trim())}</span><span class="val">${escapeHtml(h.label)}</span></div>`).join('')}
         <div class="node done"><span class="dot"></span><span class="lbl">→</span><span class="val">Empfehlung</span></div>
       </div>
     </aside>
     <section class="result fade-in">
       <div class="eyebrow">Deine Empfehlung</div>
       <h1>${escapeHtml(prod.name)}</h1>
       <p class="sub">Auf Basis deiner Angaben passt dieses Gerät am besten. Details, warum – und passende Alternativen – findest du unten.</p>

       <div class="hero">
         <div class="shot">${icon(prod.icon[0], prod.icon[1])}</div>
         <div class="body">
           <span class="badge-gen">${escapeHtml(prod.gen)}</span>
           <h2>${escapeHtml(prod.name)}</h2>
           <p class="blurb">${escapeHtml(prod.blurb)}</p>
           <div class="chips">${chips}</div>
           <div class="price">${escapeHtml(prod.price)}<small>Straßenpreis, ca.</small></div>
         </div>
       </div>

       <div class="specsheet">${specs}</div>

       <div class="why">
         <h3>Warum das passt</h3>
         <ul>${reasons}</ul>
         ${notes}
       </div>

       ${alts?`<div class="alts"><h3>Alternativen</h3><div class="altgrid">${alts}</div></div>`:''}

       <div class="cta">
         <a class="btn primary" href="${shopUrl}" target="_blank" rel="noopener">Beim Shelly-Shop ansehen
           <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M7 17L17 7M9 7h8v8"/></svg></a>
         <button class="btn line" onclick="back()">Antwort ändern</button>
         <button class="btn line" onclick="goIntro()">Neu starten</button>
       </div>

       <p class="disclaimer">Inoffizielles Hilfstool, nicht mit Shelly/Allterco Robotics verbunden. Produktnamen und Marken gehören ihren Eigentümern. Preise sind grobe Orientierungswerte und schwanken je nach Händler und Zeitpunkt. Verfügbarkeit, Zulassungen (z. B. Nullleiter-Pflicht, Absicherung) und Modellvarianten (EU/US/UK/ANZ) bitte vor dem Kauf prüfen – bei Festinstallation im Zweifel eine Elektrofachkraft hinzuziehen.<br><br>Dein Weg: ${path}</p>
     </section>
   </div>`;
  celebrate();
}

/* ---------- helpers ---------- */
function check(){ return `<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6L9 17l-5-5"/></svg>`; }
function escapeHtml(s){ return String(s).replace(/[&<>"']/g, c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }

/* ---------- flourishes ---------- */
const reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* Celebratory confetti burst when a recommendation appears. */
function celebrate(){
  if(reduceMotion) return;
  const layer = document.createElement('div');
  layer.className = 'confetti';
  const colors = ['#A6D400','#B7E60A','#79b3ff','#ffd24a','#ff6b6b','#16181C'];
  const N = 46;
  for(let i=0;i<N;i++){
    const p = document.createElement('i');
    const c = colors[i % colors.length];
    p.style.background = c;
    p.style.left = Math.random()*100 + 'vw';
    p.style.animationDuration = (2.2 + Math.random()*1.6) + 's';
    p.style.animationDelay = (Math.random()*0.35) + 's';
    p.style.transform = `rotate(${Math.random()*360}deg)`;
    if(i % 3 === 0){ p.style.borderRadius = '50%'; p.style.width = '8px'; p.style.height = '8px'; }
    layer.appendChild(p);
  }
  document.body.appendChild(layer);
  setTimeout(()=>layer.remove(), 4200);
}

/* Count-up animation for the intro stat numbers. */
function animateStats(){
  if(reduceMotion) return;
  app.querySelectorAll('.introstats b[data-to]').forEach(el=>{
    const to = parseFloat(el.dataset.to);
    const suffix = el.dataset.suffix || '';
    const prefix = el.dataset.prefix || '';
    const dur = 1100, t0 = performance.now();
    const step = now=>{
      const k = Math.min(1, (now - t0)/dur);
      const eased = 1 - Math.pow(1-k, 3);
      const val = Math.round(to * eased);
      el.textContent = prefix + val + suffix;
      if(k < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  });
}

/* expose for inline handlers */
window.goIntro = goIntro;
window.start = start;
window.back = back;

/* boot */
renderIntro();
