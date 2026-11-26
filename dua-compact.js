/* Compact, focused Dua collection. Keeps existing reading/navigation and storage intact. */
(function installCompactDuaCatalog(){
  'use strict';
  let searchTerm='';
  const normalize=value=>String(value||'').toLocaleLowerCase('bn').trim()
    .replace(/[০-৯]/g,n=>String('০১২৩৪৫৬৭৮৯'.indexOf(n)));
  function sourceFor(dua){
    const group=NIGHT_GROUPS.find(item=>item.id===dua.group);
    return normalize([dua.title,dua.ref,group?.name,dua.id].filter(Boolean).join(' '));
  }
  renderExperienceDuas=function(){
    const groups=[{id:'all',name:'সব'},...NIGHT_GROUPS.map(item=>({id:item.id,name:item.name}))];
    const selected=NIGHT_GROUPS.find(item=>item.id===duaFilter);
    const list=NIGHT_DUAS.filter(item=>duaFilter==='all'||item.group===duaFilter);
    const term=normalize(searchTerm);
    const matches=list.filter(item=>sourceFor(item).includes(term));
    const today=(dudb[dayInfo().day]||[]).length;
    const chips=groups.map(group=>
      '<button type="button" data-exp="dua-filter" data-filter="'+esc(group.id)+'" '+
      'aria-pressed="'+(group.id===duaFilter)+'" class="'+(group.id===duaFilter?'on':'')+'">'+
      esc(group.name)+'</button>').join('');
    const cards=matches.map(item=>{
      const read=expHas(dudb,item.id);
      return '<button class="ex-dua-row dc-dua-row" type="button" data-exp="dua-open" data-id="'+esc(item.id)+'" '+
        'data-search="'+esc(sourceFor(item))+'" aria-label="'+esc(item.title+', '+item.ref+(read?', আজ পড়েছেন':''))+'">'+
        '<span class="ex-dua-glyph" aria-hidden="true">'+(read?'✓':'✦')+'</span>'+
        '<span class="dc-row-copy"><b>'+esc(item.title)+'</b><small>'+esc(item.ref)+'</small></span>'+
        '<span class="ex-goldarrow" aria-hidden="true">›</span></button>';
    }).join('');
    const resultLabel=selected?selected.name:'সব দোয়া';
    return '<div class="ex-view dc-dua-page">'+expHeader('দোয়া লাইব্রেরি')+
      '<section class="dc-intro" aria-labelledby="dc-title">'+
        '<div class="dc-intro-copy"><h1 id="dc-title">দোয়া সংগ্রহ</h1>'+
        '<p>প্রয়োজন অনুযায়ী দোয়া বেছে নিন</p></div>'+
        '<div class="dc-summary" aria-label="মোট '+bn(NIGHT_DUAS.length)+'টি দোয়া">'+
        '<strong>'+bn(NIGHT_DUAS.length)+'</strong><small>টি দোয়া</small></div></section>'+
      '<label class="dc-search" for="dc-dua-search">'+
        '<span aria-hidden="true">⌕</span>'+
        '<input id="dc-dua-search" type="search" inputmode="search" autocomplete="off" '+
        'placeholder="দোয়ার নাম বা বিষয় খুঁজুন" value="'+esc(searchTerm)+'" aria-label="দোয়া খুঁজুন"></label>'+
      '<div class="ex-chip-scroll dc-filter-scroll" role="group" aria-label="দোয়ার বিষয়">'+chips+'</div>'+
      '<div class="dc-list-heading"><strong>'+esc(resultLabel)+'</strong>'+
        '<span class="dc-counts"><small id="dc-search-status" role="status" aria-live="polite">'+
        bn(matches.length)+'টি পাওয়া গেছে</small>'+
        '<small>আজ পড়েছেন '+bn(today)+'টি</small></span></div>'+
      '<div class="ex-dua-list dc-dua-list">'+cards+'</div>'+
      '<p class="dc-empty" id="dc-dua-empty" '+(matches.length?'hidden':'')+'>এই নামে কোনো দোয়া পাওয়া যায়নি। অন্য শব্দ বা বিভাগ চেষ্টা করুন।</p>'+
      '<p class="ex-footnote">দোয়ায় কল্যাণ চাওয়া হয়; ব্যবসায় সফলতা বা রোগমুক্তির নিশ্চয়তা হিসেবে কোনো আমল দেখানো হচ্ছে না।</p>'+
    '</div>';
  };
  function filterVisible(value){
    const root=document.querySelector('.dc-dua-page');
    if(!root)return;
    const text=normalize(value);
    let visible=0;
    // When typing, search the active category without rebuilding the entire screen.
    const list=NIGHT_DUAS.filter(item=>duaFilter==='all'||item.group===duaFilter);
    const holder=root.querySelector('.dc-dua-list');
    const matching=list.filter(item=>sourceFor(item).includes(text));
    const items=holder?.querySelectorAll('.dc-dua-row')||[];
    // If a previous search narrowed the DOM, rebuild the catalogue only when the
    // search has expanded beyond the mounted subset. Preserve the active input focus.
    if(matching.some(item=>![...items].some(el=>el.dataset.id===item.id))){
      searchTerm=value;
      const field=document.getElementById('dc-dua-search');
      const from=field?.selectionStart, to=field?.selectionEnd;
      const left=root.querySelector('.dc-filter-scroll')?.scrollLeft||0;
      render();
      const input=document.getElementById('dc-dua-search');
      if(input){
        input.focus({preventScroll:true});
        try{input.setSelectionRange(from,to)}catch(e){}
      }
      const chips=document.querySelector('.dc-dua-page .dc-filter-scroll');
      if(chips)chips.scrollLeft=left;
      return;
    }
    items.forEach(row=>{row.hidden=!row.dataset.search.includes(text);if(!row.hidden)visible++});
    root.querySelector('#dc-search-status').textContent=bn(visible)+'টি পাওয়া গেছে';
    root.querySelector('#dc-dua-empty').hidden=visible>0;
    searchTerm=value;
  }
  document.addEventListener('input',event=>{
    if(event.target?.id!=='dc-dua-search')return;
    filterVisible(event.target.value);
  },true);
  document.addEventListener('click',event=>{
    const clicked=event.target.closest('.dc-dua-page [data-exp="dua-filter"]');
    if(!clicked)return;
    const left=document.querySelector('.dc-dua-page .dc-filter-scroll')?.scrollLeft||0;
    const key=clicked.dataset.filter;
    // Existing delegated handler changes the category and rerenders.
    queueMicrotask(()=>{
      const scroller=document.querySelector('.dc-dua-page .dc-filter-scroll');
      if(scroller){
        scroller.scrollLeft=left;
        const active=scroller.querySelector('[data-filter="'+key+'"]');
        active?.focus({preventScroll:true});
        if(active){
          const pos=active.offsetLeft-scroller.offsetLeft;
          if(pos<scroller.scrollLeft)scroller.scrollLeft=pos;
          else if(pos+active.offsetWidth>scroller.scrollLeft+scroller.clientWidth)
            scroller.scrollLeft=pos+active.offsetWidth-scroller.clientWidth;
        }
      }
    });
  },true);
})();