/* Mobile smart header: visible after upward scroll, hidden during downward
   reading. Clones only the active page's existing header; no content changes. */
(function installSmartScrollHeader(){
  'use strict';
  const maxWidth=767;
  const hiddenScreens=new Set([
    'focus','quran-reader','dua-reader','night-reader','daily21-reader',
    'asma-reader','asma-list'
  ]);
  const selector='.ex-top,.ex-backhead,.v2-simple-header,.header,.salah-head';
  let source=null,sourceSignature='',activeScreen=null,visible=false;
  let lastY=0,upTravel=0,downTravel=0,queued=false;
  const bar=document.createElement('div');
  bar.className='smart-head';
  bar.id='smart-mobile-header';
  bar.setAttribute('aria-hidden','true');
  bar.inert=true;
  document.body.appendChild(bar);

  const clamp=(value,min,max)=>Math.min(max,Math.max(min,value));
  function viewportY(){
    const max=Math.max(0,document.documentElement.scrollHeight-window.innerHeight);
    return clamp(window.scrollY||window.pageYOffset||0,0,max);
  }
  function enabled(){
    return window.innerWidth<=maxWidth&&!hiddenScreens.has(screen)&&
      !document.body.classList.contains('focus-mode')&&
      !document.querySelector('.bk-overlay,.geo-overlay,.dua-flow-overlay:not([hidden])');
  }
  function show(next){
    next=Boolean(next&&source&&enabled()&&viewportY()>source.getBoundingClientRect().height+18);
    if(next===visible)return;
    visible=next;
    bar.classList.toggle('is-visible',visible);
    bar.setAttribute('aria-hidden',visible?'false':'true');
    bar.inert=!visible;
    if(source){
      if(visible){source.setAttribute('aria-hidden','true');source.inert=true}
      else {source.removeAttribute('aria-hidden');source.inert=false}
    }
  }
  function findSource(){
    const root=document.getElementById('root');
    if(!root||!enabled())return null;
    return root.querySelector(selector);
  }
  function rebuild(){
    const candidate=findSource();
    const changedScreen=activeScreen!==screen;
    if(changedScreen||candidate!==source){
      show(false);
      if(source&&source.isConnected){source.removeAttribute('aria-hidden');source.inert=false}
      source=candidate;
      activeScreen=screen;
      upTravel=downTravel=0;
    }
    if(!source){
      sourceSignature='';
      bar.replaceChildren();
      return;
    }
    const signature=source.outerHTML;
    if(signature===sourceSignature)return;
    sourceSignature=signature;
    const cloned=source.cloneNode(true);
    cloned.removeAttribute('id');
    cloned.removeAttribute('aria-hidden');
    cloned.inert=false;
    cloned.classList.add('smart-head-content');
    const wrap=document.createElement('div');
    wrap.className='smart-head-inner';
    wrap.appendChild(cloned);
    if(source.matches('.ex-top')){
      const top=document.createElement('button');
      top.type='button';
      top.className='smart-head-top';
      top.setAttribute('data-smart-head','top');
      top.setAttribute('aria-label','পৃষ্ঠার শুরুতে যান');
      top.textContent='↑';
      cloned.appendChild(top);
    }
    bar.replaceChildren(wrap);
    if(visible){
      bar.setAttribute('aria-hidden','false');
      bar.inert=false;
      source.setAttribute('aria-hidden','true');
      source.inert=true;
    }
  }
  function update(){
    queued=false;
    const now=viewportY();
    if(!enabled()){
      show(false);
      lastY=now;
      upTravel=downTravel=0;
      return;
    }
    if(!source||!source.isConnected){rebuild()}
    if(!source){lastY=now;return}
    const delta=now-lastY;
    lastY=now;
    if(now<Math.max(72,source.offsetHeight+12)){
      show(false);upTravel=downTravel=0;return;
    }
    if(Math.abs(delta)<1)return;
    if(delta<0){
      upTravel=Math.min(100,upTravel-delta);
      downTravel=0;
      if(upTravel>=13)show(true);
    }else{
      downTravel=Math.min(100,downTravel+delta);
      upTravel=0;
      if(downTravel>=9)show(false);
    }
  }
  function queue(){
    if(queued)return;
    queued=true;
    requestAnimationFrame(update);
  }
  const previousRender=render;
  render=function(){
    // Hide before the app replaces the old header so no stale header can stay interactive.
    show(false);
    const output=previousRender();
    rebuild();
    lastY=viewportY();
    return output;
  };
  window.addEventListener('scroll',queue,{passive:true});
  window.addEventListener('resize',()=>{show(false);rebuild();lastY=viewportY();queue()},{passive:true});
  window.addEventListener('pageshow',()=>{show(false);rebuild();lastY=viewportY()});
  document.addEventListener('focusin',event=>{
    if(event.target?.matches('input,textarea,select,[contenteditable="true"]'))show(false);
  },true);
  document.addEventListener('click',event=>{
    const button=event.target.closest('[data-smart-head="top"]');
    if(!button)return;
    event.preventDefault();event.stopPropagation();
    show(false);
    window.scrollTo({top:0,behavior:window.matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});
  },true);
  rebuild();
  lastY=viewportY();
})();
