/* One ayah per reading block with independently selectable verified layers.
   The original source-fetched reader stays responsible for acquiring text; this
   module only renders matched Arabic, pronunciation and meaning per ayah. */
(function installUnifiedQuranReader(){
  'use strict';
  const target=document.getElementById('readerBody');
  const scroller=document.getElementById('scroll');
  const toolbar=document.getElementById('modes');
  const oldSize=document.getElementById('size');
  if(!target||!scroller||!toolbar||!oldSize)return;

  const number=Number(new URLSearchParams(location.search).get('surah'));
  const embedded=JSON.parse(document.getElementById('surah-data')?.textContent||'[]');
  const localSurah=embedded.find(s=>s.n===number);
  const remoteSupported=[78,79,80,81,82,83,84,85,93,94,95,96,97,98,99,100,101,102,104,111];
  if(!localSurah&&!remoteSupported.includes(number))return;

  const VIEW_KEY='dhikr_dubai_reader_views_v1';
  const SIZE_KEY='dhikr_dubai_reader_size_v4';
  const sizeNames=['আরও ছোট','ছোট','স্বাভাবিক','বড়','আরও বড়'];
  const defaults={ar:true,bn:true,meaning:true};
  let options={...defaults};
  let level=0;
  try{
    const saved=JSON.parse(localStorage.getItem(VIEW_KEY)||'null');
    if(saved&&typeof saved==='object'&&!Array.isArray(saved)){
      for(const key of Object.keys(defaults)){
        if(typeof saved[key]==='boolean')options[key]=saved[key];
      }
    }
    const stored=localStorage.getItem(SIZE_KEY);
    if(stored!==null&&Number.isInteger(Number(stored)))level=Math.max(-2,Math.min(2,Number(stored)));
    else if(localStorage.getItem('dhikr_dubai_reading_size_v3')==='large')level=1;
  }catch(e){}
  if(!Object.values(options).some(Boolean))options.ar=true;

  const numberBN=n=>String(n).replace(/[0-9]/g,d=>'০১২৩৪৫৬৭৮৯'[Number(d)]);
  const esc=value=>String(value||'').replace(/[&<>"']/g,ch=>({
    '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'
  }[ch]));
  const isValid=rows=>Array.isArray(rows)&&rows.length>0&&rows.every(r=>
    typeof r.ar==='string'&&r.ar.trim()&&typeof r.meaning==='string'&&r.meaning.trim());
  const localRows=()=>{
    if(!localSurah)return null;
    const pron=localSurah.pron.split(/\n/).map(x=>x.trim()).filter(x=>
      x&&!x.startsWith('বিসমিল্লাহির'));
    if(pron.length!==localSurah.arabic.length||
      localSurah.meaning.length!==localSurah.arabic.length)return null;
    return localSurah.arabic.map((ar,i)=>({ar,bn:pron[i],meaning:localSurah.meaning[i]}));
  };
  let rows=localRows(),pronUnavailable=false;
  if(!rows&&window.DhikrSurahViewData?.number===number){
    rows=window.DhikrSurahViewData.rows;
  }
  if(rows)pronUnavailable=!rows.every(x=>typeof x.bn==='string'&&x.bn.trim());

  const announce=document.createElement('span');
  announce.className='uv-sr-only';
  announce.id='uv-announcement';
  announce.setAttribute('role','status');
  announce.setAttribute('aria-live','polite');
  document.querySelector('.top')?.appendChild(announce);

  // Replace the old one-button, two-size toggle; its legacy listener remains
  // attached to the detached element, so it cannot interfere with these presets.
  const sizes=document.createElement('div');
  sizes.className='uv-size-controls';
  sizes.setAttribute('role','group');
  sizes.setAttribute('aria-label','পাঠের লেখার আকার');
  sizes.innerHTML=
    '<button type="button" data-uv-size="-1" aria-label="লেখা ছোট করুন">A−</button>'+
    '<button type="button" data-uv-size="1" aria-label="লেখা বড় করুন">A+</button>';
  oldSize.replaceWith(sizes);

  toolbar.className='modes uv-options';
  toolbar.removeAttribute('role');
  toolbar.setAttribute('role','group');
  toolbar.setAttribute('aria-label','পাঠে কোন লেখা দেখাবেন');
  toolbar.innerHTML='<label><input type="checkbox" data-uv-layer="ar"><span>আরবি</span></label>'+
    '<label><input type="checkbox" data-uv-layer="bn"><span>উচ্চারণ</span></label>'+
    '<label><input type="checkbox" data-uv-layer="meaning"><span>অর্থ</span></label>';
  const unavailableNote=document.createElement('p');
  unavailableNote.className='uv-unavailable';
  unavailableNote.hidden=true;
  unavailableNote.textContent='এই সুরার যাচাইকৃত বাংলা উচ্চারণ এখন উপলব্ধ নয়।';
  toolbar.after(unavailableNote);

  function updateControls(){
    toolbar.querySelectorAll('[data-uv-layer]').forEach(box=>{
      const key=box.dataset.uvLayer;
      box.disabled=key==='bn'&&(!rows||pronUnavailable);
      box.checked=Boolean(options[key]&&!box.disabled);
      box.closest('label').classList.toggle('uv-checked',box.checked);
    });
    unavailableNote.hidden=!rows||!pronUnavailable;
  }
  function updateSize(){
    target.style.setProperty('--uv-ar-offset',(level*2.2)+'px');
    target.style.setProperty('--uv-bn-offset',(level*1.5)+'px');
    target.style.setProperty('--uv-meaning-offset',(level*1.15)+'px');
    sizes.querySelector('[data-uv-size="-1"]').disabled=level<=-2;
    sizes.querySelector('[data-uv-size="1"]').disabled=level>=2;
    sizes.setAttribute('aria-label','পাঠের লেখার আকার: '+sizeNames[level+2]);
    announce.textContent='লেখার আকার '+sizeNames[level+2];
  }
  function anchor(){
    const scRect=scroller.getBoundingClientRect();
    const items=[...target.querySelectorAll('.uv-ayah')];
    const el=items.find(x=>x.getBoundingClientRect().bottom>scRect.top+10)||items.at(-1);
    return el?{id:el.id,offset:el.getBoundingClientRect().top-scRect.top}:null;
  }
  function restore(place){
    if(!place)return;
    const el=document.getElementById(place.id);
    if(!el)return;
    const rect=scroller.getBoundingClientRect();
    scroller.scrollTop+=(el.getBoundingClientRect().top-rect.top)-place.offset;
  }
  // Some Qur'an editions prefix ayah 1 with Bismillah. This is a display-only
  // adjustment: the fetched Qur'an record is never modified. We already render
  // the same Bismillah above the verses, so avoid showing it twice.
  function firstAyahArabic(text,index){
    if(index!==0)return text;
    const parts=String(text).trim().split(/\s+/);
    if(parts.length<5)return text;
    const normalize=word=>word.normalize('NFKD')
      .replace(/[\u0610-\u061a\u064b-\u065f\u0670\u06d6-\u06ed\u0640]/g,'')
      .replace(/[أإآٱ]/g,'ا');
    const opening=parts.slice(0,4).map(normalize).join(' ');
    if(opening!=='بسم الله الرحمن الرحيم')return text;
    const remainder=parts.slice(4).join(' ').trim();
    return remainder||text;
  }
  function readableLayers(row,index){
    return (options.ar?'<p class="uv-arabic" lang="ar" dir="rtl">'+esc(firstAyahArabic(row.ar,index))+'</p>':'')+
      (options.bn&&!pronUnavailable?'<p class="uv-pron" lang="bn">'+esc(row.bn)+'</p>':'')+
      (options.meaning?'<p class="uv-meaning" lang="bn">'+esc(row.meaning)+'</p>':'');
  }
  // Only genuinely long verses get a small local reduction. Shorter ayahs keep
  // their selected size, while every line must remain inside the reading column.
  function fitArabicVerses(){
    for(const element of target.querySelectorAll('.uv-arabic')){
      element.style.fontSize='';
      const base=parseFloat(getComputedStyle(element).fontSize);
      if(!Number.isFinite(base)||base<=0)continue;
      const minimum=Math.max(21,base-5);
      let size=base;
      while(size>minimum){
        const lineHeight=parseFloat(getComputedStyle(element).lineHeight)||size*1.7;
        const widthOverflow=element.scrollWidth>element.clientWidth+2;
        const longVerse=element.textContent.trim().length>64 &&
          element.getBoundingClientRect().height>lineHeight*3.75;
        if(!widthOverflow&&!longVerse)break;
        size=Math.max(minimum,size-1);
        element.style.fontSize=size+'px';
      }
    }
  }
  function basmala(){
    return '<div class="uv-basmala">'+
      (options.ar?'<p lang="ar" dir="rtl">بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ</p>':'')+
      (options.bn&&!pronUnavailable?'<p lang="bn">বিসমিল্লাহির রাহমানির রাহীম।</p>':'')+
      (options.meaning?'<p lang="bn">পরম করুণাময়, অসীম দয়ালু আল্লাহর নামে।</p>':'')+
      '</div>';
  }
  function paint(preserve=true){
    if(!isValid(rows))return;
    const place=preserve?anchor():null;
    target.classList.remove('arabic','large');
    target.innerHTML='<article class="uv-verses" aria-label="সুরার আয়াতসমূহ">'+
      basmala()+
      rows.map((r,i)=>'<section class="verse uv-ayah" id="uv-ayah-'+(i+1)+'" aria-label="আয়াত '+numberBN(i+1)+'">'+
        '<span class="uv-ayah-number" aria-hidden="true">'+numberBN(i+1)+'</span>'+
        '<div class="uv-ayah-text">'+readableLayers(r,i)+'</div></section>').join('')+
      '<p class="uv-endnote">সুরার '+numberBN(rows.length)+'টি আয়াত</p></article>';
    updateSize();
    updateControls();
    fitArabicVerses();
    restore(place);
  }
  toolbar.addEventListener('change',event=>{
    const key=event.target?.dataset?.uvLayer;
    if(!Object.hasOwn(defaults,key))return;
    const next={...options,[key]:event.target.checked};
    if(!Object.values(next).some(Boolean)){
      event.target.checked=true;
      announce.textContent='কমপক্ষে একটি পাঠের ধরন নির্বাচন করুন।';
      return;
    }
    options=next;
    try{localStorage.setItem(VIEW_KEY,JSON.stringify(options))}catch(e){}
    paint();
  });
  sizes.addEventListener('click',event=>{
    const button=event.target.closest('[data-uv-size]');
    if(!button||button.disabled)return;
    const place=anchor();
    level=Math.max(-2,Math.min(2,level+Number(button.dataset.uvSize)));
    try{localStorage.setItem(SIZE_KEY,String(level))}catch(e){}
    updateSize();
    fitArabicVerses();
    restore(place);
  });
  window.addEventListener('resize',()=>{
    if(rows&&isValid(rows))fitArabicVerses();
  },{passive:true});
  window.addEventListener('dhikr:surah-data',event=>{
    const detail=event.detail;
    if(detail?.number!==number||!isValid(detail.rows))return;
    rows=detail.rows;
    pronUnavailable=!rows.every(x=>typeof x.bn==='string'&&x.bn.trim());
    if(pronUnavailable)announce.textContent='এই সুরার বাংলা উচ্চারণ পাওয়া যায়নি।';
    paint(false);
  });
  window.addEventListener('dhikr:surah-failed',()=>{
    rows=null;
    updateControls();
  });
  if(rows&&isValid(rows))paint(false);
  else updateControls();

  // Keep the three essential actions on one row. Existing Phase 1 code still
  // handles save-first completion, timezone and correct supported navigation.
  const footer=document.getElementById('footer');
  if(footer){
    footer.classList.add('uv-footer');
    const prev=document.getElementById('prev');
    const next=document.getElementById('next');
    if(prev){
      prev.textContent=prev.href.includes('reader.html?surah=')?'← আগের':'← তালিকা';
      prev.setAttribute('aria-label',prev.href.includes('reader.html?surah=')?'আগের সুরা পড়ুন':'সুরার তালিকায় ফিরুন');
    }
    if(next){
      next.textContent=next.href.includes('reader.html?surah=')?'পরের →':'তালিকা →';
      next.setAttribute('aria-label',next.href.includes('reader.html?surah=')?'পরের সুরা পড়ুন':'সুরার তালিকায় ফিরুন');
    }
  }
})();