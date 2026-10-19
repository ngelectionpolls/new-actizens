// Convert the design reference's utility notation to ordinary CSS at build time.
// No CSS framework or runtime dependency is required by the published site.
export function declaration(c){
const simple={absolute:'position:absolute',relative:'position:relative',flex:'display:flex',block:'display:block',contents:'display:contents','flex-col':'flex-direction:column','flex-none':'flex:none','shrink-0':'flex-shrink:0','items-start':'align-items:flex-start','items-end':'align-items:flex-end','items-center':'align-items:center','justify-center':'justify-content:center','justify-between':'justify-content:space-between','content-stretch':'align-content:stretch','size-full':'width:100%;height:100%','h-full':'height:100%','w-full':'width:100%','min-w-full':'min-width:100%','min-w-px':'min-width:1px','min-h-px':'min-height:1px','w-0':'width:0','h-0':'height:0','inset-0':'inset:0','left-0':'left:0','right-0':'right:0','top-0':'top:0','top-px':'top:1px','mb-0':'margin-bottom:0','gap-px':'gap:1px','pr-px':'padding-right:1px','bg-white':'background-color:#fff','text-white':'color:#fff','border-white':'border-color:#fff','border':'border-width:1px','border-solid':'border-style:solid','border-b-2':'border-bottom-width:2px','font-normal':'font-weight:400','font-medium':'font-weight:500','font-semibold':'font-weight:600','font-bold':'font-weight:700','font-black':'font-weight:900','not-italic':'font-style:normal','text-center':'text-align:center','uppercase':'text-transform:uppercase','capitalize':'text-transform:capitalize','whitespace-nowrap':'white-space:nowrap','whitespace-pre':'white-space:pre','whitespace-pre-wrap':'white-space:pre-wrap','overflow-hidden':'overflow:hidden','overflow-clip':'overflow:clip','object-cover':'object-fit:cover','pointer-events-none':'pointer-events:none','max-w-none':'max-width:none','-translate-x-1/2':'--tx:-50%;transform:translate(var(--tx,0),var(--ty,0))','-translate-y-1/2':'--ty:-50%;transform:translate(var(--tx,0),var(--ty,0))','-scale-y-100':'transform:scaleY(-1)','rotate-180':'transform:rotate(180deg)','rotate-90':'transform:rotate(90deg)','bg-gradient-to-b':'background-image:linear-gradient(to bottom,var(--from),var(--to))','bg-gradient-to-r':'background-image:linear-gradient(to right,var(--from),var(--to))'};
if(c==='-scale-y-100')return 'scale:1 -1';
if(c==='rotate-180')return 'rotate:180deg';
if(c==='rotate-90')return 'rotate:90deg';
if(simple[c])return simple[c];if(/^opacity-\d+$/.test(c))return 'opacity:'+Number(c.split('-')[1])/100;
if(c==='[word-break:break-word]')return 'overflow-wrap:break-word';
const match=c.match(/^(.+?)-\[(.*)\]$/);if(!match)throw Error('Unsupported design class: '+c);
let [,key,val]=match;val=val.replace(/_/g,' ');if(val.startsWith('calc('))val=val.replace(/([\d%])([+-])(?=[\d.])/g,'$1 $2 ');
if(key==='font')return 'font-family:'+(val.includes('League')?'"League Spartan"':'"Inter"')+',sans-serif';
if(key==='text')return /^(#|rgb|white|transparent)/.test(val)?'color:'+val:'font-size:'+val;
if(key==='border')return /^(#|rgb)/.test(val)?'border-color:'+val:'border-width:'+val;
if(key==='size')return 'width:'+val+';height:'+val;
if(key==='inset')return 'inset:'+val;
if(key==='rounded')return 'border-radius:'+val;
if(key.startsWith('rounded-'))return 'border-'+({tl:'top-left',tr:'top-right',bl:'bottom-left',br:'bottom-right'}[key.slice(8)])+'-radius:'+val;
if(key==='bg')return 'background-color:'+val;
if(key==='from'||key==='to')return '--'+key+':'+val;
if(key==='shadow')return 'box-shadow:'+val;
if(key==='drop-shadow')return 'filter:drop-shadow('+val+')';
if(key==='rotate')return 'rotate:'+val;
if(key==='skew-x')return 'transform:skewX('+val+')';
if(key==='aspect')return 'aspect-ratio:'+val;
if(key==='p')return 'padding:'+val;
if(key==='px')return 'padding-inline:'+val;
if(key==='py')return 'padding-block:'+val;
const props={w:'width',h:'height',left:'left',right:'right',top:'top',bottom:'bottom',gap:'gap',leading:'line-height',tracking:'letter-spacing',flex:'flex','min-w':'min-width','max-w':'max-width','min-h':'min-height','max-h':'max-height'};
if(props[key])return props[key]+':'+val;
throw Error('Unsupported design class: '+c);
}
export function utilityCSS(codes){const classes=new Set();for(const code of codes)for(const m of code.matchAll(/className="([^"]*)"/g))for(const c of m[1].split(/\s+(?![^\[]*\])/))classes.add(c);return [...classes].map(c=>'[class~='+JSON.stringify(c)+']{'+declaration(c)+'}').join('\n');}
export function darkUtilityCSS(codes){
 const classes=new Set();for(const code of codes)for(const m of code.matchAll(/className="([^"]*)"/g))for(const c of m[1].split(/\s+(?![^\[]*\])/))classes.add(c);
 const rules=[];
 for(const c of classes){const d=declaration(c);const match=d.match(/^(background-color|color|border-color):(.+)$/);if(!match)continue;const [,property,value]=match;let rgb;if(value==='#fff')rgb=[255,255,255];else if(/^#[a-f\d]{6}$/i.test(value))rgb=[1,3,5].map(i=>parseInt(value.slice(i,i+2),16));else if(value.startsWith('rgb'))rgb=value.match(/[\d.]+/g).slice(0,3).map(Number);if(!rgb)continue;
 const [r,g,b]=rgb,light=(r+g+b)/3,green=g>r*1.15&&g>b*1.1,gold=r>180&&g>80&&b<90;let dark;
 if(property==='border-color')dark='#344c3d';
 else if(property==='color')dark=green?'#8cddb0':gold?value:light>230?'#f1f7f3':light>110||value.startsWith('rgba')?'#b9cec1':'#eaf3ed';
 else dark=gold?value:green&&light<110?(light<35?'#0b2415':'#17623c'):light>235?'#16271c':light>170?'#1d3026':light>95?'#273b2e':green?'#1b3023':'#15271c';
 rules.push('html[data-theme="dark"] .design-canvas [class~='+JSON.stringify(c)+']{'+property+':'+dark+'}');
 }
 return rules.join('\n');
}
