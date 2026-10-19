import {readdir,readFile,mkdir,writeFile,stat} from 'node:fs/promises';
const assets=new Map();
for(const file of await readdir('src/pages')){
 const code=await readFile('src/pages/'+file,'utf8');
 const prefix=code.match(/const assetPathPrefix = "([^"]+)"/)[1];
 for(const m of code.matchAll(/\$\{assetPathPrefix\}\/([^`]+)`/g))assets.set(m[1],prefix+'/'+m[1]);
}
await mkdir('public/assets',{recursive:true});
let downloaded=0;const queue=[...assets];
async function worker(){while(queue.length){const [name,url]=queue.shift();try{if((await stat('public/assets/'+name)).size>0)continue;}catch{}let error;for(let n=0;n<3;n++){try{const response=await fetch(url);if(!response.ok)throw Error('HTTP '+response.status);await writeFile('public/assets/'+name,new Uint8Array(await response.arrayBuffer()));downloaded++;error=null;break;}catch(e){error=e;}}if(error)throw Error(name+': '+error.message);}}
await Promise.all(Array.from({length:6},worker));
for(const family of ['Inter:wght@400;500;600;700;900','League+Spartan:wght@400;500;600;700']){
 const response=await fetch('https://fonts.googleapis.com/css2?family='+family+'&display=swap',{headers:{'User-Agent':'Mozilla/5.0'}});if(!response.ok)throw Error('Font download failed');
 let css=await response.text();for(const [i,m]of [...css.matchAll(/url\((https[^)]+)\)/g)].entries()){const name=(family.startsWith('Inter')?'inter':'league-spartan')+'-'+i+'.woff2';const font=await fetch(m[1]);if(!font.ok)throw Error('Font bytes unavailable');await writeFile('public/assets/'+name,new Uint8Array(await font.arrayBuffer()));css=css.replace(m[1],'/assets/'+name);}
 await writeFile('public/assets/'+(family.startsWith('Inter')?'inter':'league-spartan')+'.css',css);
}
console.log(JSON.stringify({assets:assets.size,downloaded}));
