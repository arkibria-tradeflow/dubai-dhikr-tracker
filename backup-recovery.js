/* Phase 4 A3: review before restore, safe replacement, recovery and clear UI.
   Loaded LAST, after all existing data modules are initialized. */
(function installBackupRecoveryUI(){
  'use strict';
  const txn=window.DhikrBackupTxn;
  const lastRequestKey='dhikr_dubai_backup_last_request_v1';
  const MAX_BYTES=6000000;
  let pending=null,host=null,returnFocus=null,submitting=false;
  const plain=obj=>obj!==null&&typeof obj==='object'&&!Array.isArray(obj);
  const formatDate=iso=>{
    if(typeof iso!=='string'||!Number.isFinite(Date.parse(iso)))return 'তারিখ দেওয়া নেই';
    return new Intl.DateTimeFormat('bn-BD',{year:'numeric',month:'short',day:'numeric',hour:'numeric',minute:'2-digit'}).format(new Date(iso));
  };
  function current(){
    return {sessions:db,tahajjud:nightDb,quran:qdb,duas:dudb,daily21:window.DailyZikr21.exportData()};
  }
  function bundle(){
    const data=current();
    return {app:'Dubai Dhikr Tracker',version:4,exportedAt:new Date().toISOString(),
      timezone:TZ,sessions:data.sessions.sessions,tahajjud:data.tahajjud,
      quran:data.quran,duas:data.duas,daily21:data.daily21};
  }
  function counts(data){
    const rows=obj=>Object.values(obj||{}).reduce((sum,list)=>sum+(Array.isArray(list)?list.length:0),0);
    const personal=Object.values(data.daily21||{}).reduce((sum,day)=>
      sum+Object.values(day||{}).reduce((total,n)=>total+(Number.isFinite(n)?n:0),0),0);
    return [
      ['নামাজ-পরবর্তী যিকির',Object.keys(data.sessions?.sessions||{}).length,'সেশন'],
      ['তাহাজ্জুদ',Object.keys(data.tahajjud?.nights||{}).length,'রাত'],
      ['কুরআন পাঠ',rows(data.quran),'পাঠ'],
      ['দোয়া পাঠ',rows(data.duas),'পাঠ'],
      ['ব্যক্তিগত দৈনিক যিকির',personal,'বার']
    ];
  }
  function rowsFor(data){
    return counts(data).map(item=>'<div class="bk-stat"><span>'+item[0]+'</span><strong>'+bn(item[1])+' <small>'+item[2]+'</small></strong></div>').join('');
  }
  function downloadBackup(){
    if(txn?.isBlocked())toast('রেকর্ড উদ্ধার অসম্পূর্ণ—ডাউনলোডের ফাইলে আংশিক তথ্য থাকতে পারে।');
    try{
      const blob=new Blob([JSON.stringify(bundle(),null,2)],{type:'application/json'});
      const url=URL.createObjectURL(blob);
      const link=document.createElement('a');
      link.href=url;
      link.download='dhikr-full-backup-'+dayInfo().day+'.json';
      document.body.appendChild(link);
      link.click();
      link.remove();
      setTimeout(()=>URL.revokeObjectURL(url),12000);
      const stamp=new Date().toISOString();
      try{localStorage.setItem(lastRequestKey,stamp)}catch(e){}
      toast('ব্যাকআপ ডাউনলোড শুরু হয়েছে। Files-এ ফাইলটি সংরক্ষণ করুন।');
      return true;
    }catch(e){toast('ব্যাকআপ তৈরি করা যায়নি। আবার চেষ্টা করুন।');return false}
  }
  function prepare(raw){
    if(!plain(raw)||raw.app!=='Dubai Dhikr Tracker'||!plain(raw.sessions))
      throw Error('Invalid Dhikr backup');
    if(raw.version!==undefined&&(!Number.isInteger(raw.version)||raw.version<1||raw.version>4))
      throw Error('Unsupported backup version');
    for(const prop of ['tahajjud','quran','duas','daily21']){
      if(Object.prototype.hasOwnProperty.call(raw,prop)&&!plain(raw[prop]))throw Error('Invalid '+prop);
    }
    if(raw.tahajjud&& !plain(raw.tahajjud.nights))throw Error('Invalid nights');
    const present=['sessions',...['tahajjud','quran','duas','daily21'].filter(x=>Object.prototype.hasOwnProperty.call(raw,x))];
    const now=current();
    return {
      normalized:{
        sessions:cleanData(raw),
        tahajjud:raw.tahajjud?nClean(raw.tahajjud):now.tahajjud,
        quran:raw.quran?expClean(raw.quran,'s'):now.quran,
        duas:raw.duas?expClean(raw.duas,'d'):now.duas,
        daily21:raw.daily21?window.DailyZikr21.clean(raw.daily21):now.daily21
      },
      version:raw.version||1,
      exportedAt:raw.exportedAt,
      present
    };
  }
  function hide(){
    if(submitting)return;
    pending=null;
    if(host)host.remove();
    host=null;
    document.body.classList.remove('bk-dialog-open');
    const focus=returnFocus;returnFocus=null;
    if(focus?.isConnected)focus.focus();
  }
  function modal(type,contents){
    if(txn?.isBlocked()){toast('রেকর্ড উদ্ধার অসম্পূর্ণ। এখন প্রতিস্থাপন বা মুছবেন না।');return}
    if(host){host.remove();host=null;document.body.classList.remove('bk-dialog-open')}
    returnFocus=document.activeElement;
    host=document.createElement('div');
    host.className='bk-overlay';
    host.innerHTML='<div class="bk-backdrop" data-bk="cancel"></div>'+
      '<section class="bk-dialog" role="dialog" aria-modal="true" aria-labelledby="bk-title" aria-describedby="bk-explanation">'+
      '<div class="bk-top"><span>রেকর্ড নিরাপত্তা</span><button type="button" class="bk-close" data-bk="cancel" aria-label="বন্ধ করুন">✕</button></div>'+
      contents+
      '<label class="bk-ack"><input type="checkbox" id="bk-ack" data-bk="ack"><span>'+
      (type==='restore'?'আমি বুঝেছি: নির্বাচিত ব্যাকআপের বিভাগগুলো এই ডিভাইসের বর্তমান রেকর্ড প্রতিস্থাপন করবে।':'আমি বুঝেছি: এই ডিভাইসের সব আমলের রেকর্ড মুছে যাবে।')+
      '</span></label>'+
      '<div class="bk-actions"><button type="button" class="bk-cancel" data-bk="cancel">বাতিল</button>'+
      '<button type="button" class="bk-export" data-bk="export">আগে ব্যাকআপ নিন</button>'+
      '<button type="button" class="bk-confirm '+(type==='clear'?'bk-danger':'')+'" data-bk="commit" disabled>'+
      (type==='clear'?'সব রেকর্ড মুছুন':'রেকর্ড প্রতিস্থাপন করুন')+
      '</button></div></section>';
    document.body.appendChild(host);
    document.body.classList.add('bk-dialog-open');
    host.querySelector('.bk-close')?.focus();
  }
  function showRestore(file,review){
    pending={type:'restore',data:review.normalized};
    const now=current();
    const missing=['tahajjud','quran','duas','daily21'].filter(x=>!review.present.includes(x));
    const note=missing.length?
      '<p class="bk-note">এটি পুরোনো ব্যাকআপ। ফাইলে না থাকা বিভাগগুলো এই ডিভাইসে অপরিবর্তিত থাকবে।</p>':'';
    modal('restore','<h2 id="bk-title">ব্যাকআপ যাচাই করুন</h2>'+
      '<p id="bk-explanation">ফাইল যাচাই হয়েছে। নিচের রেকর্ডগুলো দেখে তারপর প্রতিস্থাপন নিশ্চিত করুন।</p>'+
      '<div class="bk-file"><strong>'+esc(file.name||'ব্যাকআপ ফাইল')+'</strong>'+
      '<small>সংস্করণ '+bn(review.version)+' · '+formatDate(review.exportedAt)+'</small></div>'+
      '<div class="bk-compare"><div><h3>এই ডিভাইসে এখন</h3>'+rowsFor(now)+'</div>'+
      '<div><h3>প্রতিস্থাপনের পর</h3>'+rowsFor(review.normalized)+'</div></div>'+
      note+
      '<p class="bk-warning">সতর্কতা: প্রতিস্থাপিত রেকর্ড আগের অবস্থায় নিজে থেকে ফেরানো যাবে না। আগে বর্তমান ডেটার ব্যাকআপ ফাইলটি সংরক্ষণ করুন।</p>');
  }
  function requestClear(){
    pending={type:'clear',data:{
      sessions:{version:1,sessions:{}},tahajjud:{nights:{}},quran:{},duas:{},daily21:{}
    }};
    modal('clear','<h2 id="bk-title">সব রেকর্ড মুছবেন?</h2>'+
      '<p id="bk-explanation">এই ডিভাইসে থাকা পাঁচ ওয়াক্ত যিকির, তাহাজ্জুদ, কুরআন, দোয়া ও দৈনিক ২১-এর রেকর্ড মুছে যাবে।</p>'+
      '<div class="bk-compare bk-clear-summary"><div><h3>এখন সংরক্ষিত</h3>'+rowsFor(current())+'</div></div>'+
      '<p class="bk-warning">এই কাজটি ফেরানো যাবে না যদি না আপনার কাছে সংরক্ষিত JSON ব্যাকআপ থাকে।</p>');
  }
  function failureMessage(out){
    if(out.reason==='blocked'||!out.rolledBack)
      return 'স্টোরেজে সমস্যা হয়েছে। আগের রেকর্ড পুনরুদ্ধার অসম্পূর্ণ—অ্যাপ বন্ধ করার আগে সহায়তা নিন।';
    return 'স্টোরেজে জায়গা কম বা সেভ ব্যর্থ হয়েছে। আগের রেকর্ড অক্ষত আছে। আগে ব্যাকআপ নিন।';
  }
  function doCommit(){
    if(!pending||submitting||!host?.querySelector('#bk-ack')?.checked)return;
    const {type,data}=pending;
    submitting=true;
    const confirmButton=host.querySelector('[data-bk="commit"]');
    confirmButton.disabled=true;
    const map={
      [DATA_KEY]:data.sessions,
      [NIGHT_STORAGE]:data.tahajjud,
      [QKEY]:data.quran,
      [DUAKEY]:data.duas,
      [window.DailyZikr21.key]:data.daily21
    };
    const result=txn.commit(map);
    submitting=false;
    if(!result.ok){
      const message=failureMessage(result);
      const error=host.querySelector('.bk-error')||document.createElement('p');
      error.className='bk-error';error.setAttribute('role','alert');error.textContent=message;
      if(!error.isConnected)host.querySelector('.bk-actions').before(error);
      toast('রেকর্ড পরিবর্তন করা যায়নি।');
      return;
    }
    db=data.sessions;
    nightDb=data.tahajjud;
    qdb=data.quran;
    dudb=data.duas;
    window.DailyZikr21.reload();
    pending=null;
    hide();
    if(type==='restore'){screen='history';histOffset=0}
    else {screen='settings';histOffset=0}
    render();
    toast(type==='restore'?'ব্যাকআপের রেকর্ড নিরাপদে ফেরত এসেছে।':'সব আমলের রেকর্ড মুছে ফেলা হয়েছে।');
  }
  async function importSelected(file){
    if(!file)return;
    if(txn?.isBlocked()){toast('রেকর্ড উদ্ধার অসম্পূর্ণ—এখন ব্যাকআপ ফেরত আনবেন না।');return}
    if(file.size>MAX_BYTES||file.size===0){toast('৬ MB-এর মধ্যে সঠিক JSON ব্যাকআপ নির্বাচন করুন।');return}
    try{
      const raw=JSON.parse(await file.text());
      const review=prepare(raw);
      showRestore(file,review);
    }catch(e){toast('ব্যাকআপ ফাইলটি সঠিক নয় বা এই সংস্করণে সমর্থিত নয়।')}
  }
  document.addEventListener('click',event=>{
    const button=event.target.closest('[data-bk]');
    if(!button||!host)return;
    event.preventDefault();
    const action=button.dataset.bk;
    if(action==='cancel')hide();
    else if(action==='export')downloadBackup();
    else if(action==='commit')doCommit();
  },true);
  document.addEventListener('change',event=>{
    if(event.target.id==='bk-ack'&&host){
      host.querySelector('[data-bk="commit"]').disabled=!event.target.checked;
    }
  },true);
  document.addEventListener('keydown',event=>{
    if(!host)return;
    if(event.key==='Escape'){event.preventDefault();hide();return}
    if(event.key!=='Tab')return;
    const items=[...host.querySelectorAll('button:not([disabled]),input:not([disabled])')];
    if(!items.length)return;
    if(event.shiftKey&&document.activeElement===items[0]){event.preventDefault();items.at(-1).focus()}
    else if(!event.shiftKey&&document.activeElement===items.at(-1)){event.preventDefault();items[0].focus()}
  },true);
  // The original file input handler calls the current importFile binding.
  dlBackup=downloadBackup;
  importFile=importSelected;
  const oldSettings=renderSettings;
  renderSettings=function(){
    const html=oldSettings();
    let last='এখনও এই অ্যাপে ব্যাকআপ ডাউনলোড শুরু করার তথ্য নেই';
    try{
      const stamp=localStorage.getItem(lastRequestKey);
      if(stamp)last='সর্বশেষ ডাউনলোড শুরু: '+formatDate(stamp);
    }catch(e){}
    const notice='<p class="bk-settings-note"><strong>'+last+'</strong>. ডাউনলোড শুরু হওয়া মানেই ফাইল নিরাপদে সংরক্ষিত হয়েছে নয়—Files বা অন্য নিরাপদ স্থানে আছে কি না দেখে নিন।</p>';
    return html.replace('<button class="action-btn" data-action="import">',notice+'<button class="action-btn" data-action="import">')
      .replace('ব্যাকআপ ফেরত আনলে বর্তমান রেকর্ড প্রতিস্থাপিত হবে। JSON ফাইলটি ব্যক্তিগত তথ্য হিসেবে নিরাপদে রাখুন।',
        'ব্যাকআপের বিষয়বস্তু আগে দেখানো হবে। পুরোনো ব্যাকআপে অনুপস্থিত বিভাগগুলোর বর্তমান রেকর্ড রাখা হবে। JSON ফাইলটি ব্যক্তিগত তথ্য হিসেবে নিরাপদে রাখুন।');
  };
  window.DhikrBackupUI={requestClear,downloadBackup,importSelected,prepare};
  if(txn?.wasRecovered()){
    setTimeout(()=>toast('আগের অসম্পূর্ণ পরিবর্তন থেকে আপনার রেকর্ড ফিরিয়ে আনা হয়েছে।'),350);
  }else if(txn?.isBlocked()){
    setTimeout(()=>toast('রেকর্ড উদ্ধার অসম্পূর্ণ—এখন প্রতিস্থাপন বা মুছবেন না।'),350);
  }
})();