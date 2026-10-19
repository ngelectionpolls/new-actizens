export function initTheme(){
 const root=document.documentElement,system=matchMedia('(prefers-color-scheme: dark)');
 const controls=()=>[...document.querySelectorAll('.theme-toggle')];
 function apply(theme){root.dataset.theme=theme;root.style.colorScheme=theme;for(const button of controls()){const next=theme==='dark'?'light':'dark';button.setAttribute('aria-label','Switch to '+next+' mode');button.title='Switch to '+next+' mode';button.setAttribute('aria-pressed',String(theme==='dark'));button.innerHTML='<span aria-hidden="true">'+(theme==='dark'?'☀':'☾')+'</span>';}}
 for(const header of document.querySelectorAll('.site-header,.sticky-navigation')){const button=document.createElement('button');button.className='theme-toggle';button.type='button';header.append(button);button.onclick=()=>{const next=root.dataset.theme==='dark'?'light':'dark';try{localStorage.setItem('asif-theme',next);}catch{}apply(next);};}
 apply(root.dataset.theme==='dark'?'dark':'light');
 system.addEventListener('change',e=>{let saved;try{saved=localStorage.getItem('asif-theme');}catch{}if(saved!=='light'&&saved!=='dark')apply(e.matches?'dark':'light');});
 addEventListener('storage',e=>{if(e.key==='asif-theme')apply(e.newValue==='light'||e.newValue==='dark'?e.newValue:system.matches?'dark':'light');});
}
