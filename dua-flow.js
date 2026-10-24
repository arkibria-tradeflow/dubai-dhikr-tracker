/* Dua reader navigation and bottom-sheet library, shared by Tahajjud and Dua collection. */
(function(){
'use strict';
let sheetOpen=false,query='';
const escapeHtml=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const collection=()=>screen==='night-reader'?(nightReadType==='surah'?NIGHT_SURAHS:NIGHT_DUAS):NIGHT_DUAS;
const currentId=()=>screen==='night-reader'?nightReadId:selectedDua;
const groupName=id=>(NIGHT_GROUPS.find(g=>g.id===id)||{}).name||'দোয়া ও আমল';
function decorate(html){
 const isNight=screen==='night-reader',isSurah=isNight&&nightReadType==='surah';
 const items=collection(),index=items.findIndex(d=>d.id===currentId());
 if(index<0)return html;
 const previous=index>0,following=index<items.length-1;
 const nav='<div class="dua-flow-nav"><button data-duaflow="previous" '+(previous?'':'disabled')+' aria-label="আগের দোয়া">‹ <span>আগের '+(isSurah?'সুরা':'দোয়া')+'</span></button><span class="dua-flow-count">'+bn(index+1)+' / '+bn(items.length)+'</span><button data-duaflow="next" '+(following?'':'disabled')+' aria-label="পরের দোয়া"><span>পরের '+(isSurah?'সুরা':'দোয়া')+'</span> ›</button></div>';
 const list=items.map((d,i)=>'<button class="dua-flow-item '+(i===index?'active':'')+'" data-duaflow="select" data-id="'+escapeHtml(d.id)+'" data-search="'+escapeHtml((d.title+' '+(d.group?groupName(d.group):'')).toLowerCase())+'"><span class="dua-flow-number">'+bn(i+1)+'</span><span><strong>'+escapeHtml(d.title)+'</strong><small>'+escapeHtml(d.group?groupName(d.group):'সুরা')+'</small></span><span>'+(i===index?'✓':'›')+'</span></button>').join('');
 const sheet='<div class="dua-flow-overlay" '+(sheetOpen?'':'hidden')+'><button class="dua-flow-backdrop" data-duaflow="dismiss" aria-label="তালিকা বন্ধ করুন"></button><section class="dua-flow-sheet" role="dialog" aria-modal="true" aria-label="দোয়ার তালিকা"><div class="dua-flow-handle"></div><div class="dua-flow-sheet-head"><strong>'+(isSurah?'সব সুরা':'সব দোয়া ও আমল')+'</strong><button data-duaflow="dismiss" aria-label="বন্ধ করুন">✕</button></div><input id="dua-flow-search" placeholder="নাম বা বিভাগ দিয়ে খুঁজুন" aria-label="দোয়া খুঁজুন" value="'+escapeHtml(query)+'"><div class="dua-flow-items">'+list+'</div><p class="dua-flow-empty" hidden>কোনো দোয়া পাওয়া যায়নি</p></section></div>';
 const dockClass=isNight?'nt-reader-dock':'ex-reader-dock';
 const open='<button class="dua-flow-open" data-duaflow="open" aria-haspopup="dialog">☰ &nbsp; '+(isSurah?'সব সুরা':'সব দোয়া')+' দেখুন <span>⌃</span></button>';
 const marker='<div class="'+dockClass+'">';
 if(!html.includes(marker))return html;
 return html.replace(marker,marker+nav+open)+sheet;
}
const oldNight=renderNightReader,oldDua=renderExperienceDuaReader;
renderNightReader=function(){return decorate(oldNight())};
renderExperienceDuaReader=function(){return decorate(oldDua())};
function refresh(){render();if(sheetOpen){const input=document.getElementById('dua-flow-search');if(input){input.value=query;filter();}}}
function filter(){const q=query.trim().toLowerCase();let visible=0;document.querySelectorAll('.dua-flow-item').forEach(el=>{const show=el.dataset.search.includes(q);el.hidden=!show;if(show)visible++});const empty=document.querySelector('.dua-flow-empty');if(empty)empty.hidden=visible!==0;}
function choose(id){if(screen==='night-reader')nightReadId=id;else selectedDua=id;sheetOpen=false;query='';render();const scroll=document.querySelector('.nt-reading-scroll,.ex-reader-scroll');if(scroll)scroll.scrollTop=0;}
document.addEventListener('click',e=>{
 const btn=e.target.closest('[data-duaflow]');if(!btn)return;
 e.preventDefault();e.stopImmediatePropagation();
 const action=btn.dataset.duaflow;
 if(action==='open'){sheetOpen=true;refresh();return;}
 if(action==='dismiss'){sheetOpen=false;query='';render();return;}
 const items=collection(),i=items.findIndex(x=>x.id===currentId());
 if(action==='select'){choose(btn.dataset.id);return;}
 if(action==='previous'&&i>0)choose(items[i-1].id);
 if(action==='next'&&i<items.length-1)choose(items[i+1].id);
},true);
document.addEventListener('input',e=>{if(e.target.id==='dua-flow-search'){query=e.target.value;filter();}});
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&sheetOpen){sheetOpen=false;query='';render();}});
let y0=null;document.addEventListener('touchstart',e=>{if(e.target.closest('.dua-flow-sheet-head,.dua-flow-handle'))y0=e.touches[0].clientY;},{passive:true});document.addEventListener('touchend',e=>{if(y0===null)return;const dy=e.changedTouches[0].clientY-y0;y0=null;if(dy>75&&sheetOpen){sheetOpen=false;query='';render();}},{passive:true});
render();
})();
