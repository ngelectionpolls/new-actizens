// One motion vocabulary for every page: a single orchestrated hero entrance, one quiet reveal for card groups.
// Values mirror the tokens in experience.css :root (--ease-out, --ease-drawer, --duration-hero, --duration-reveal).
export const EASE_OUT='cubic-bezier(.23,1,.32,1)',EASE_DRAWER='cubic-bezier(.32,.72,0,1)',HERO=720,REVEAL=420;
const browser=typeof window!=='undefined'&&typeof document!=='undefined';
export const reduceMotion=browser&&window.matchMedia?window.matchMedia('(prefers-reduced-motion: reduce)'):null;
export const staggerDelay=(index,stagger=60,max=240)=>Math.max(0,Math.min(index*stagger,max));
export const motionOff=()=>!browser||!!reduceMotion?.matches||typeof Element==='undefined'||!Element.prototype.animate;
const shown=el=>!!el&&getComputedStyle(el).display!=='none';
// Figma nodes carry rotation/flip transforms: compose the motion on top and settle back on the original.
const base=el=>{const t=getComputedStyle(el).transform;return t==='none'?'':t;};
const from=(b,delta)=>(b+' '+delta).trim();
// rise() takes over visibility, so a pre-hidden reveal target is released in the same frame its first keyframe lands.
const pending=new Map(),unmark=el=>{pending.delete(el);if(el?.getAttribute?.('data-reveal')==='pending')el.removeAttribute('data-reveal');};
export function rise(el,{travel=8,duration=240,delay=0,easing=EASE_OUT}={}){unmark(el);if(motionOff()||!shown(el))return null;const b=base(el);return el.animate([{opacity:0,transform:from(b,`translateY(${travel}px)`)},{opacity:1,transform:b||'none'}],{duration,delay,easing,fill:'backwards'});}
// The image is laid down right-to-left toward the headline; the clip sits on the image itself, and its start inset
// (2.83% = .06/(2*1.06)) trims the 1.06 scale back to the original box so nothing spills from overflow-visible parents.
function lay(el,delay){const b=base(el);return el.animate([{clipPath:'inset(2.83% 2.83% 2.83% 100%)',transform:from(b,'scale(1.06)')},{clipPath:'inset(0 0 0 0)',transform:b||'none'}],{duration:900,delay,easing:EASE_DRAWER,fill:'backwards',id:'hero-media-wipe'});}
// Full-bleed media sit behind the headline, so a wipe there is too loud: they settle (fade + 1.04 scale) instead.
export const mediaMode=(width,limit,inclusive=false)=>(inclusive?width>=limit:width>limit)?'settle':'wipe';
function settle(el,delay){const b=base(el);return el.animate([{opacity:0,transform:from(b,'scale(1.04)')},{opacity:1,transform:b||'none'}],{duration:900,delay,easing:EASE_OUT,fill:'backwards',id:'hero-media-settle'});}
function draw(el,delay){if(base(el))return null;el.style.transformOrigin='left';return el.animate([{transform:'scaleX(0)'},{transform:'none'}],{duration:480,delay,easing:EASE_OUT,fill:'backwards'});}
export function heroSequence({lines=[],supporting=[],media=[],accent=[],fullBleed=900,fullBleedInclusive=false}={}){if(motionOff())return[];const out=[];const L=[...lines].filter(shown),S=[...supporting].filter(shown),M=[...media].filter(shown),A=[...accent].filter(shown);
L.forEach((el,i)=>out.push(rise(el,{travel:18,duration:HERO,delay:i*70})));const after=Math.max(0,L.length-1)*70+180;S.forEach((el,i)=>out.push(rise(el,{travel:10,duration:520,delay:after+i*60})));
M.forEach(el=>out.push((mediaMode(el.getBoundingClientRect().width,fullBleed,fullBleedInclusive)==='settle'?settle:lay)(el,80)));const accentAt=M.length?80+900*.6:after;A.forEach(el=>out.push(draw(el,accentAt)));return out.filter(Boolean);}
// Already-visible elements belong to the first screen: they are never hidden and re-shown.
const inView=el=>{const r=el.getBoundingClientRect();return r.width>0&&r.top<innerHeight&&r.bottom>0;};
const observers=new Set();
// Below-fold targets are pre-hidden (data-reveal=pending, CSS no-preference only) so they never show, vanish and fade
// back in. Anything that could not reach the trigger (unrendered, above the viewport, too tall for 12%) is left alone.
export const shouldMarkPending=(rect,viewportH,motionAllowed)=>!!motionAllowed&&rect.width>0&&rect.height>0&&rect.top>=viewportH&&rect.height*.12<viewportH-40;
// Figma splits a card into two shadowed siblings (image half, body half); their shared wrapper is the card.
const shadowNode=k=>String(k?.className?.baseVal??k?.className??'').includes('shadow-');
export const cardUnit=node=>{const p=node?.parentElement,kids=p?[...p.children]:[];return kids.length===2&&kids.every(shadowNode)&&kids.includes(node)?p:node;};
export const cardUnits=nodes=>[...new Set([...nodes].map(cardUnit))];
// Jumps (anchors, scroll restoration, flings) can carry pending targets past the viewport: show those as they are.
const sweep=()=>{for(const [el,observer] of pending)if(el.getBoundingClientRect().bottom<0){observer.unobserve(el);unmark(el);}};
export function revealOnScroll(elements,{stagger=60,maxStagger=240,skip=()=>false}={}){if(motionOff()||typeof IntersectionObserver==='undefined')return null;const targets=[...elements].filter(el=>el&&!inView(el));if(!targets.length)return null;
const observer=new IntersectionObserver(entries=>{const groups=new Map();for(const entry of entries){if(!entry.isIntersecting)continue;const el=entry.target;observer.unobserve(el);if(skip()||reduceMotion?.matches){unmark(el);continue;}const i=groups.get(el.parentElement)||0;groups.set(el.parentElement,i+1);rise(el,{travel:12,duration:REVEAL,delay:staggerDelay(i,stagger,maxStagger)});}sweep();},{threshold:.12,rootMargin:'0px 0px -40px 0px'});
for(const el of targets){if(shouldMarkPending(el.getBoundingClientRect(),innerHeight,true)){el.setAttribute('data-reveal','pending');pending.set(el,observer);}observer.observe(el);}observers.add(observer);return observer;}
let sweepFrame=0;if(browser){addEventListener('pageshow',sweep);addEventListener('scroll',()=>{if(pending.size&&!sweepFrame)sweepFrame=requestAnimationFrame(()=>{sweepFrame=0;sweep();});},{passive:true});}
// Turning reduced motion on mid-visit stops pending reveals, shows pre-hidden targets and lands every running animation on its final frame.
reduceMotion?.addEventListener?.('change',()=>{if(!reduceMotion.matches)return;for(const observer of observers)observer.disconnect();observers.clear();for(const el of [...pending.keys()])unmark(el);for(const animation of document.getAnimations())animation.finish();});
// Dialogs leave faster than they arrive (ease-in), and on phones the bottom sheet drops back down. Escape takes the same
// path; the native close runs once the exit ends, and a re-open during the exit cancels it.
export const EASE_IN='cubic-bezier(.4,0,1,1)';
export function animateDialogClose(dialog){if(!dialog||dialog.dataset.motionClose)return dialog;dialog.dataset.motionClose='1';const close=dialog.close.bind(dialog),open=dialog.showModal.bind(dialog);let closing=null;
const stop=()=>{const running=closing;closing=null;return running||[];};
dialog.close=value=>{if(closing||!dialog.open)return;if(motionOff()){close(value);return;}const sheet=matchMedia('(max-width:600px)').matches,timing={duration:sheet?220:160,easing:EASE_IN,fill:'forwards'};
closing=[dialog.animate(sheet?[{transform:'none'},{transform:'translateY(100%)'}]:[{opacity:1,transform:'none'},{opacity:0,transform:'translateY(6px) scale(.98)'}],timing),dialog.animate([{opacity:1},{opacity:0}],{...timing,pseudoElement:'::backdrop'})];
const mine=closing;mine[0].finished.then(()=>{if(closing!==mine)return;stop();close(value);for(const a of mine)a.cancel();},()=>{});};
dialog.showModal=()=>{for(const a of stop())a.cancel();if(!dialog.open)open();};
dialog.addEventListener('cancel',e=>{if(!e.cancelable)return;e.preventDefault();dialog.close();});return dialog;}
