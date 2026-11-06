/* Phase 3: network/retry guidance and conservative SPA focus management.
   No changes to dhikr counts or on-device records. */
(function installPhase3Polish(){
  'use strict';
  let previousScreen=screen;
  let announcement=null;
  function getAnnouncer(){
    if(announcement?.isConnected)return announcement;
    announcement=document.getElementById('p3-announcer');
    if(!announcement){
      announcement=document.createElement('div');
      announcement.id='p3-announcer';
      announcement.className='p3-visually-hidden';
      announcement.setAttribute('role','status');
      announcement.setAttribute('aria-live','polite');
      announcement.setAttribute('aria-atomic','true');
      document.body.appendChild(announcement);
    }
    return announcement;
  }
  function online(){return typeof navigator.onLine==='boolean'?navigator.onLine:true}
  function state(){
    const available=validTimes(dayInfo().tm);
    if(!online())return {
      id:'offline',
      icon:'⌁',
      title:'আপনি এখন অফলাইনে আছেন',
      detail:available?
        'সংরক্ষিত নামাজের সময় দেখানো হচ্ছে। যিকিরের গণনা এই ডিভাইসে চলবে; অনলাইনে সময় যাচাই করুন।':
        'যিকির ও সংরক্ষিত পাঠ ব্যবহার করতে পারবেন। আজকের নামাজের সময় পেতে ইন্টারনেট প্রয়োজন।',
      retry:false
    };
    if(!available&&loading)return{
      id:'loading',icon:'◌',title:'নামাজের সময় লোড হচ্ছে',
      detail:'আপনার নির্বাচিত এলাকার সময় যাচাই করা হচ্ছে।',retry:false
    };
    if(!available)return{
      id:'unavailable',icon:'!',title:'নামাজের সময় পাওয়া যাচ্ছে না',
      detail:'ইন্টারনেট সংযোগ পরীক্ষা করে আবার চেষ্টা করুন। নির্ভরযোগ্য সময় না পাওয়া পর্যন্ত সংশ্লিষ্ট যিকির লক থাকতে পারে।',retry:true
    };
    return null;
  }
  function bannerHtml(s){
    return '<div class="p3-network-banner" data-p3-state="'+s.id+'" role="note">'+
      '<span class="p3-network-icon" aria-hidden="true">'+s.icon+'</span>'+
      '<div class="p3-network-copy"><strong>'+s.title+'</strong><p>'+s.detail+'</p></div>'+
      (s.retry?'<button type="button" class="p3-network-retry" data-p3="retry-times">আবার চেষ্টা</button>':'')+
      '</div>';
  }
  function updateBanner(){
    const root=document.getElementById('root');
    if(!root)return;
    const existing=root.querySelector('.p3-network-banner');
    const display=['today','prayers'].includes(screen);
    if(!display){existing?.remove();return}
    const status=state();
    if(!status){existing?.remove();return}
    if(existing?.dataset.p3State===status.id)return;
    const parent=root.querySelector('.ex-view');
    const header=parent?.querySelector('.ex-top');
    if(!parent)return;
    if(existing)existing.outerHTML=bannerHtml(status);
    else if(header)header.insertAdjacentHTML('afterend',bannerHtml(status));
    else parent.insertAdjacentHTML('afterbegin',bannerHtml(status));
  }
  function focusTitle(){
    if(document.querySelector('.geo-overlay'))return;
    const selectors=[
      '.p2-intro h1','.ex-page-title','.d21-reader-inner h1','.v2-focus-body h1',
      '.ex-reader-content h1','.nt-reader-inner h1','.salah-hero h1',
      '.v7-q-heading strong','.panel-head h1','.d21-hero h1'
    ];
    const root=document.getElementById('root');
    const heading=root?.querySelector(selectors.join(','));
    if(!heading)return;
    if(!heading.hasAttribute('tabindex'))heading.setAttribute('tabindex','-1');
    try{heading.focus({preventScroll:true})}catch(e){heading.focus()}
  }
  const oldRender=render;
  render=function(){
    const old=previousScreen;
    const result=oldRender();
    updateBanner();
    previousScreen=screen;
    if(old!==screen&&document.activeElement?.tagName!=='INPUT'&&document.activeElement?.tagName!=='TEXTAREA'){
      requestAnimationFrame(()=>{
        if(previousScreen===screen)focusTitle();
      });
    }
    return result;
  };
  document.addEventListener('click',event=>{
    const button=event.target.closest('[data-p3="retry-times"]');
    if(!button)return;
    event.preventDefault();event.stopImmediatePropagation();
    if(!online()){
      getAnnouncer().textContent='ইন্টারনেট সংযোগ চালু করে আবার চেষ্টা করুন।';
      return;
    }
    button.disabled=true;
    button.textContent='লোড হচ্ছে…';
    getAnnouncer().textContent='নামাজের সময় আবার যাচাই করা হচ্ছে।';
    void updateTimes();
  },true);
  window.addEventListener('offline',()=>{
    getAnnouncer().textContent='ইন্টারনেট সংযোগ নেই। সংরক্ষিত যিকির ব্যবহার করা যাবে।';
    updateBanner();
  });
  window.addEventListener('online',()=>{
    getAnnouncer().textContent='ইন্টারনেট সংযোগ ফিরে এসেছে।';
    updateBanner();
    if(['today','prayers'].includes(screen)&&!validTimes(dayInfo().tm)&&!loading)void updateTimes();
  });
  // Prepare the reader/role hints once without replacing any existing action.
  getAnnouncer();
  updateBanner();
})();
