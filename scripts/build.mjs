import {readFile,readdir,mkdir,writeFile,cp} from 'node:fs/promises';
import {build} from 'esbuild';
import React from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import {pathToFileURL} from 'node:url';
import {utilityCSS,darkUtilityCSS} from './utilities.mjs';
import {mobileContent} from '../src/mobile.mjs';
import {enhancements,globalFooterWithLibrary as globalFooter} from '../src/experience.mjs';
import {libraryDocument} from '../src/library-pages.mjs';
import {downloads,publications,downloadText} from '../src/library-data.mjs';
const sizes={home:3478,about:2558,programs:2207,events:2305,gallery:2305,contact:1936,donate:2162,resources:2017};
const titles={home:'Home',about:'About ASIF',programs:'Our Programs',events:'Events',gallery:'Gallery',contact:'Contact',donate:'Donate',resources:'Resources'};
await mkdir('dist',{recursive:true});await mkdir('.cache',{recursive:true});await cp('public','dist',{recursive:true});
const codes=[];
const href=n=>n==='home'?'/':'/'+n+'/';
const logo='<a class="brand" href="/" aria-label="ASIF home"><span class="brand-icon"><img src="/assets/f07f3.png" alt=""></span><span><strong>ASIF</strong><small>ACTIZENS SOCIAL<br>IMPACT FOUNDATION</small></span></a>';
const links=['home','about','programs','events','gallery','resources','contact'].map(n=>[n,titles[n]]);
for(const name of Object.keys(sizes)){
 const original=await readFile('src/pages/'+name+'.jsx','utf8');codes.push(original);
 const code=original.replace(/const assetPathPrefix = "[^"]+";/,'const assetPathPrefix = "/assets";');
 const out='.cache/'+name+'.mjs';await build({stdin:{contents:code,loader:'jsx',resolveDir:process.cwd()},platform:'node',format:'esm',outfile:out,bundle:true,external:['react']});
 const component=(await import(pathToFileURL(process.cwd()+'/'+out).href+'?v='+Date.now())).default;
 const markup=renderToStaticMarkup(React.createElement(component));
 const nav=links.filter(([n])=>n!=='gallery').map(([n,t])=>n==='resources'?'<div class="resource-nav"><span><a '+(name===n?'aria-current="page" ':'')+'href="/resources/">Resources</a><button class="resource-toggle" aria-expanded="false" aria-label="Resources menu">⌄</button></span><div class="resource-menu"><button data-resource="Downloads">Downloads</button><a href="/gallery/">Gallery</a><button data-resource="Publication">Publication</button></div></div>':'<a '+(name===n?'aria-current="page" ':'')+'href="'+href(n)+'">'+t+'</a>').join('');
 const header='<header class="site-header">'+logo+'<button class="menu-toggle" aria-label="Open menu" aria-expanded="false">☰</button><nav aria-label="Main navigation">'+nav+'<a class="donate-link" href="/donate/">Donate</a></nav></header>';
 const html='<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="theme-color" content="#0b5a35"><meta name="description" content="Actizens Social Impact Foundation empowers citizens, strengthens communities and advances sustainable development across Nigeria."><title>'+titles[name]+' | Actizens Social Impact Foundation</title><link rel="icon" href="/assets/f07f3.png"><link rel="stylesheet" href="/assets/inter.css"><link rel="stylesheet" href="/assets/league-spartan.css"><link rel="stylesheet" href="/design.css"><link rel="stylesheet" href="/site.css"><link rel="stylesheet" href="/experience.css"></head><body data-page="'+name+'"><a class="skip-link" href="#main">Skip to content</a><div class="desktop-shell" style="--page-height:'+sizes[name]+'px"><main id="main" class="design-canvas" style="height:'+sizes[name]+'px">'+markup+header+'</main></div><div class="mobile-site">'+header+'<main id="mobile-main">'+mobileContent(name)+'</main></div>'+enhancements(name)+globalFooter()+'<dialog id="detail-dialog" aria-labelledby="dialog-title"><button class="dialog-close" aria-label="Close dialog">×</button><div id="dialog-content"></div></dialog><div id="status" role="status" aria-live="polite"></div><script type="module" src="/app.js"></script></body></html>';
 const themedHTML=html.replaceAll('<button data-resource="Downloads">Downloads</button>','<a href="/downloads/">Downloads</a>').replaceAll('<button data-resource="Publication">Publication</button>','<a href="/publications/">Publications</a>').replace('<meta name="theme-color"','<script src="/theme-init.js"></script><meta name="theme-color"').replace('</head>','<link rel="stylesheet" href="/design-dark.css"><link rel="stylesheet" href="/theme.css"></head>');
 const dir=name==='home'?'dist':'dist/'+name;await mkdir(dir,{recursive:true});await writeFile(dir+'/index.html',themedHTML);
}
await writeFile('dist/design.css','*,::before,::after{box-sizing:border-box;border:0 solid #e5e7eb}p{margin:0}img{display:block;max-width:100%}'+utilityCSS(codes));
await writeFile('dist/design-dark.css',darkUtilityCSS(codes));
await cp('src/mobile.mjs','dist/content.js');
await writeFile('dist/guides.js','export const guides='+JSON.stringify((await import('../src/experience.mjs')).guides)+';');
await cp('src/library-data.mjs','dist/library-data.js');
for(const kind of ['downloads','publications']){await mkdir('dist/'+kind,{recursive:true});await writeFile('dist/'+kind+'/index.html',libraryDocument(kind));}
for(const article of publications){await mkdir('dist/publications/'+article.id,{recursive:true});await writeFile('dist/publications/'+article.id+'/index.html',libraryDocument('publications',article));}
await mkdir('dist/files',{recursive:true});
const escapeText=s=>s.replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;');
for(const item of downloads.filter(i=>i.status==='available')){const text=downloadText(item);await writeFile('dist/files/'+item.id+'.txt',text);await writeFile('dist/files/'+item.id+'.html','<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>'+item.title+' | ASIF website starter guide</title><style>body{max-width:760px;margin:40px auto;padding:0 24px;font:15px/1.8 system-ui;color:#17291d}pre{white-space:pre-wrap;font:inherit}button{padding:12px 18px;background:#0b5a35;color:white;border:0;border-radius:4px;cursor:pointer}@media print{button{display:none}body{margin:0;font-size:11pt}}</style></head><body><button onclick="window.print()">Print or save as PDF</button><pre>'+escapeText(text)+'</pre></body></html>');}
await writeFile('dist/files/asif-starter-toolkit.txt',downloads.filter(i=>i.status==='available').map(downloadText).join('\n'+'='.repeat(64)+'\n\n'));
console.log('Built 10 main pages, 4 article pages and 4 downloadable starter guides.');
