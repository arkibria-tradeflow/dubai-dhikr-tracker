/* Dua Reader Phase 3 — one compact reading column, no fabricated Arabic.
 * The original 11 Dua records, source strings, and completion keys stay intact.
 * This replaces only the standalone Dua Collection reader; Tahajjud is unchanged.
 */
(function installCompactDuaReader(){
  'use strict';
  const catalog=window.DhikrDuaCatalog;
  if(!catalog)return;
  const KEY='dhikr_dua_reader_options_v1';
  const defaults={arabic:true,pron:true,meaning:true,level:2};
  const readOptions=()=>{
    let raw={};
    try{raw=JSON.parse(localStorage.getItem(KEY)||'{}')}catch(e){}
    if(!raw||typeof raw!=='object'||Array.isArray(raw))raw={};
    return {
      arabic:raw.arabic!==false,
      pron:raw.pron!==false,
      meaning:raw.meaning!==false,
      level:Number.isInteger(raw.level)?Math.max(0,Math.min(4,raw.level)):2
    };
  };
  let prefs=readOptions(),sheetOpen=false,sheetQuery='';
  let lastListFocus=null;
  const escText=value=>String(value??'').replace(/[&<>"']/g,c=>({
    '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'
  }[c]));
  const persist=()=>{
    try{localStorage.setItem(KEY,JSON.stringify(prefs));return true}catch(e){return false}
  };
  const getDua=id=>{const entry=catalog.get(id);return entry?{id:entry.id,title:entry.title,ref:entry.source.reference,url:entry.source.url}:null};
  const getEntry=id=>catalog.get(id);
  // Arabic appears only after an entry has an independently reviewed text.
  // Transliteration is NOT converted into Arabic or presented as a sourced ayah.
  function hasVerifiedArabic(entry){
    return Boolean(entry&&
      ['source_checked','verified','published'].includes(entry.editorial?.status)&&
      entry.editorial?.sourceChecked===true&&
      entry.editorial?.wordingChecked===true&&
      typeof entry.text?.arabic==='string'&&entry.text.arabic.trim()&&
      entry.source?.kind!=='personal');
  }
  function visibleOrder(){
    const ids=window.DhikrDuaLibrary?.visibleIds?.();
    const known=new Set(catalog.entries.map(x=>x.id));
    const filtered=Array.isArray(ids)?ids.filter(id=>known.has(id)):[];
    if(filtered.includes(selectedDua))return [...new Set(filtered)];
    return catalog.entries.map(item=>item.id);
  }
  function isPersonal(entry){return entry.source.kind==='personal'}
  function availableLayers(entry){
    const source=entry.text||{};
    return {
      arabic:hasVerifiedArabic(entry),
      pron:Boolean(isPersonal(entry)?source.personalBengaliWording:source.bengaliPronunciation),
      meaning:Boolean(source.bengaliMeaning)
    };
  }
  function effectiveLayers(entry){
    const available=availableLayers(entry);
    let layers={
      arabic:available.arabic&&prefs.arabic,
      pron:available.pron&&prefs.pron,
      meaning:available.meaning&&prefs.meaning
    };
    if(!Object.values(layers).some(Boolean)){
      if(available.pron)layers.pron=true;
      else if(available.meaning)layers.meaning=true;
      else if(available.arabic)layers.arabic=true;
    }
    return layers;
  }
  function option(layer,label,active){
    return '<label class="dr3-option">'+
      '<input type="checkbox" data-dr3-layer="'+layer+'" '+
      (active?'checked ':'')+
      'aria-label="'+escText(label)+' দেখান বা লুকান"><span>'+escText(label)+'</span></label>';
  }
  function sourceBlock(entry){
    const personal=isPersonal(entry);
    const source=entry.source||{};
    const link=typeof source.url==='string'&&/^https:\/\//i.test(source.url)?
      '<a href="'+escText(source.url)+'" target="_blank" rel="noopener noreferrer" '+
        'aria-label="উৎস খুলুন: '+escText(source.reference)+'">'+
        escText(source.reference)+' ↗</a>':
      '<span>'+escText(source.reference||'রেফারেন্স যাচাইাধীন')+'</span>';
    return '<div class="dr3-source"><span class="dr3-source-label">'+
      (personal?'নিজের ভাষায় দোয়া':'উৎস')+'</span>'+
      (personal?'<span>এটি ব্যক্তিগত বাংলা দোয়া; নির্দিষ্ট কুরআনের আয়াত বা হাদিস নয়।</span>':link)+
      '</div>';
  }
  function listSheet(){
    if(!sheetOpen)return '';
    const value=catalog.normalize(sheetQuery);
    const items=catalog.entries.filter(d=>
      !value||catalog.searchText(d.id).includes(value));
    return '<div class="dr3-overlay" role="presentation">'+
      '<button type="button" class="dr3-backdrop" data-dr3="dismiss" aria-label="তালিকা বন্ধ করুন"></button>'+
      '<section class="dr3-sheet" role="dialog" aria-modal="true" aria-labelledby="dr3-list-title">'+
      '<div class="dr3-sheet-head"><h2 id="dr3-list-title">সব দোয়া</h2>'+
      '<button type="button" data-dr3="dismiss" aria-label="বন্ধ করুন">✕</button></div>'+
      '<label class="dr3-sheet-search">দোয়া খুঁজুন'+
      '<input id="dr3-list-search" type="search" autocomplete="off" placeholder="নাম বা বিষয়" '+
        'value="'+escText(sheetQuery)+'"></label>'+
      '<div class="dr3-sheet-list">'+items.map(dua=>
        '<button type="button" data-dr3="select" data-id="'+escText(dua.id)+'" '+
          'class="'+(selectedDua===dua.id?'dr3-selected':'')+'" '+
          'aria-current="'+(selectedDua===dua.id)+'">'+
          '<span>'+escText(dua.title)+'</span>'+
          '<span aria-hidden="true">'+(selectedDua===dua.id?'✓':'›')+'</span></button>'
      ).join('')+'</div>'+
      '<p class="dr3-sheet-empty" '+(items.length?'hidden':'')+'>এই নামে কোনো দোয়া পাওয়া যায়নি।</p>'+
      '</section></div>';
  }
  const fallback=renderExperienceDuaReader;
  renderExperienceDuaReader=function(){
    const dua=getDua(selectedDua),entry=getEntry(selectedDua);
    if(!dua||!entry)return fallback();
    window.DhikrDuaLibrary?.rememberOpened?.(selectedDua);
    const available=availableLayers(entry),shown=effectiveLayers(entry);
    const isOwn=isPersonal(entry),done=expHas(dudb,selectedDua);
    const order=visibleOrder(),at=order.indexOf(selectedDua);
    const canPrev=at>0,canNext=at>=0&&at<order.length-1;
    const compactTitle=escText(dua.title);
    const layerOptions=[
      available.arabic?option('arabic','আরবি',shown.arabic):'',
      available.pron?option('pron',isOwn?'দোয়া':'উচ্চারণ',shown.pron):'',
      available.meaning?option('meaning',isOwn?'ব্যাখ্যা':'অর্থ',shown.meaning):''
    ].filter(Boolean).join('');
    const data=entry.text||{};
    const layers=[
      shown.arabic?'<p class="dr3-arabic" lang="ar" dir="rtl">'+escText(data.arabic)+'</p>':'',
      shown.pron?'<p class="dr3-pron" lang="bn">'+
        escText(isOwn?data.personalBengaliWording:data.bengaliPronunciation)+'</p>':'',
      shown.meaning?'<p class="dr3-meaning" lang="bn">'+escText(data.bengaliMeaning)+'</p>':''
    ].join('');
    const pendingSource=['pending_review','source_checked'].includes(entry.editorial?.status);
    return '<div class="ex-reader dr3-reader dr3-size-'+prefs.level+'">'+
      '<header class="dr3-header">'+
        '<button type="button" class="dr3-icon-button" data-exp="dua-close" aria-label="দোয়া তালিকায় ফিরুন">✕</button>'+
        '<div class="dr3-heading"><strong>'+compactTitle+'</strong>'+
          '<small>'+bn(at+1)+' / '+bn(order.length)+' · '+(isOwn?'ব্যক্তিগত দোয়া':'দোয়া পাঠ')+'</small></div>'+
        '<div class="dr3-actions">'+
          '<button type="button" data-dr3="smaller" aria-label="লেখা ছোট করুন" '+(prefs.level===0?'disabled':'')+'>A−</button>'+
          '<button type="button" data-dr3="larger" aria-label="লেখা বড় করুন" '+(prefs.level===4?'disabled':'')+'>A+</button></div>'+
        '<button type="button" class="dr3-icon-button dr3-menu" data-dr3="list" aria-label="সব দোয়ার তালিকা খুলুন" aria-haspopup="dialog">☷</button>'+
      '</header>'+
      '<div class="dr3-options" role="group" aria-label="পাঠের অংশ দেখান বা লুকান">'+layerOptions+'</div>'+
      '<div class="ex-reader-scroll dr3-scroll" id="dr3-scroll">'+
        '<main class="dr3-content" aria-label="দোয়া পাঠ">'+
          '<div class="dr3-reading">'+layers+'</div>'+
          (!available.arabic&&!isOwn?
            '<p class="dr3-arabic-note">আরবি পাঠ সূত্র যাচাইয়ের পর যুক্ত হবে।</p>':'')+
          sourceBlock(entry)+
          (pendingSource?'<p class="dr3-review-note">'+(entry.editorial?.status==='source_checked'?'আরবি পাঠ উৎসের সঙ্গে মিলিয়ে যুক্ত করা হয়েছে; বাংলা অর্থ ও উচ্চারণের স্বাধীন সম্পাদনাগত যাচাই বাকি।':'এই পাঠ, বাংলা উচ্চারণ ও উৎসের স্বাধীন যাচাই চলমান।')+'</p>':'')+
        '</main></div>'+
      '<div class="ex-reader-dock dr3-dock" role="group" aria-label="দোয়া পাঠের কাজ">'+
        '<button type="button" data-dr3="previous" '+(canPrev?'':'disabled')+' aria-label="আগের দোয়া">‹ আগের</button>'+
        '<button type="button" data-dr3="save" class="dr3-save" '+(done?'disabled':'')+
        ' aria-label="'+(done?'আজ পড়েছেন':'দোয়া পড়া হয়েছে হিসেবে সেভ করুন')+'">'+
        (done?'✓ আজ পড়েছেন':'✓ সেভ করুন')+'</button>'+
        '<button type="button" data-dr3="next" '+(canNext?'':'disabled')+' aria-label="পরের দোয়া">পরের ›</button>'+
      '</div>'+listSheet()+'</div>';
  };

  function rerenderAt(position,focus){
    const old=document.querySelector('.dr3-scroll');
    const top=position===undefined?(old?.scrollTop||0):position;
    render();
    const target=document.querySelector('.dr3-scroll');
    if(target)target.scrollTop=top;
    if(focus)document.querySelector(focus)?.focus({preventScroll:true});
  }
  function changeDua(id){
    if(!getDua(id))return;
    selectedDua=id;
    sheetOpen=false;sheetQuery='';
    rerenderAt(0);
  }
  document.addEventListener('click',event=>{
    const target=event.target.closest('[data-dr3]');
    if(!target)return;
    event.preventDefault();
    event.stopImmediatePropagation();
    const action=target.dataset.dr3;
    if(action==='smaller'||action==='larger'){
      const next=Math.max(0,Math.min(4,prefs.level+(action==='smaller'?-1:1)));
      if(next===prefs.level)return;
      prefs={...prefs,level:next};
      persist();
      rerenderAt(undefined,'[data-dr3="'+action+'"]');
    }else if(action==='previous'||action==='next'){
      const order=visibleOrder(),index=order.indexOf(selectedDua);
      const id=order[index+(action==='previous'?-1:1)];
      if(id)changeDua(id);
    }else if(action==='save'){
      if(expHas(dudb,selectedDua))return;
      const key=dayInfo().day;
      const changed={...dudb,[key]:[...new Set([...(dudb[key]||[]),String(selectedDua)])]};
      if(!safeWrite(DUAKEY,changed)){toast('দোয়া পাঠ সেভ করা যায়নি।');return}
      dudb=changed;
      rerenderAt();
      toast('আজকের দোয়া পাঠ সেভ হয়েছে');
    }else if(action==='list'){
      sheetOpen=true;sheetQuery='';
      rerenderAt(undefined,'.dr3-sheet-head [data-dr3="dismiss"]');
    }else if(action==='dismiss'){
      sheetOpen=false;sheetQuery='';
      rerenderAt(undefined,'[data-dr3="list"]');
    }else if(action==='select'){
      changeDua(target.dataset.id);
    }
  },true);
  document.addEventListener('change',event=>{
    const layer=event.target?.dataset?.dr3Layer;
    if(!['arabic','pron','meaning'].includes(layer))return;
    const entry=getEntry(selectedDua);
    if(!entry)return;
    const available=availableLayers(entry);
    if(!available[layer])return;
    const next={...prefs,[layer]:Boolean(event.target.checked)};
    const displayed=['arabic','pron','meaning'].some(key=>available[key]&&next[key]);
    if(!displayed){
      event.target.checked=true;
      toast('অন্তত একটি পাঠের অংশ দেখাতে হবে।');
      return;
    }
    prefs=next;
    persist();
    rerenderAt(undefined,'[data-dr3-layer="'+layer+'"]');
  },true);
  document.addEventListener('input',event=>{
    if(event.target?.id!=='dr3-list-search'||!sheetOpen)return;
    sheetQuery=event.target.value;
    const q=catalog.normalize(sheetQuery);
    const buttons=document.querySelectorAll('.dr3-sheet-list [data-dr3="select"]');
    let visible=0;
    buttons.forEach(button=>{
      const match=!q||catalog.searchText(button.dataset.id).includes(q);
      button.hidden=!match;
      if(match)visible++;
    });
    const empty=document.querySelector('.dr3-sheet-empty');
    if(empty)empty.hidden=visible>0;
  },true);
  document.addEventListener('keydown',event=>{
    if(event.key==='Escape'&&sheetOpen&&screen==='dua-reader'){
      event.preventDefault();sheetOpen=false;sheetQuery='';
      rerenderAt(undefined,'[data-dr3="list"]');
    }
  },true);
  window.DhikrCompactDuaReader=Object.freeze({
    key:KEY,
    options:()=>({...prefs}),
    hasVerifiedArabic,
    availableLayers,
    currentOrder:()=>visibleOrder()
  });
})();