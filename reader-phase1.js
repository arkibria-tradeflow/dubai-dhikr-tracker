/* Phase 1: one reliable Qur'an completion action and consistent supported-surah navigation. */
(function(){
  'use strict';
  const extra=[78,79,80,81,82,83,84,85,93,94,95,96,97,98,99,100,101,102,104,111];
  const script=document.getElementById('surah-data');
  let local=[];
  try{local=JSON.parse(script?.textContent||'[]').map(s=>s.n).filter(Number.isInteger)}catch(e){}
  const supported=[...new Set([...local,...extra])].sort((a,b)=>a-b);
  const number=Number(new URLSearchParams(location.search).get('surah'));
  if(!Number.isInteger(number)||!supported.includes(number))return;
  const online=extra.includes(number);
  const footer=document.getElementById('footer');
  if(!footer)return;
  const next=document.getElementById('next'),prev=document.getElementById('prev');
  const from=new URLSearchParams(location.search).get('from')==='all'?'all':'ten';
  const back='./?view=quran&collection='+from;
  const i=supported.indexOf(number);
  prev.href=i>0?'./reader.html?surah='+supported[i-1]+'&from='+from:back;
  next.href=i<supported.length-1?'./reader.html?surah='+supported[i+1]+'&from='+from:back;
  prev.textContent=i>0?'← আগের সূরা':'← তালিকা';
  next.textContent=i<supported.length-1?'পরের সূরা →':'তালিকায় ফিরুন →';
  document.getElementById('position').textContent=digits(i+1)+' / '+digits(supported.length);
  document.getElementById('back').href=back;
  document.getElementById('backFoot').href=back;
  function digits(n){return String(n).replace(/[0-9]/g,x=>'০১২৩৪৫৬৭৮৯'[Number(x)])}
  function today(){
    let tz='Asia/Dubai';
    try{const value=JSON.parse(localStorage.getItem('dhikr_prayer_location_v1')||'null');
      if(value?.tz){new Intl.DateTimeFormat('en-GB',{timeZone:value.tz});tz=value.tz}
    }catch(e){}
    const parts=new Intl.DateTimeFormat('en-GB',{timeZone:tz,year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(new Date());
    const out={};for(const p of parts)out[p.type]=p.value;
    return out.year+'-'+out.month+'-'+out.day;
  }
  const KEY='dhikr_dubai_quran_v5';
  function isComplete(){try{const data=JSON.parse(localStorage.getItem(KEY)||'{}');return Array.isArray(data[today()])&&data[today()].includes(String(number))}catch(e){return false}}
  const complete=document.createElement('button');
  complete.type='button';complete.className='reader-complete';
  complete.id='reader-complete';
  footer.insertBefore(complete,footer.firstChild);
  const status=document.createElement('span');
  status.className='reader-save-status';
  status.id='reader-save-status';
  status.setAttribute('role','status');
  status.setAttribute('aria-live','polite');
  complete.after(status);
  let readable=!online||!!document.querySelector('#readerBody .verses');
  function paint(){
    const done=isComplete();
    complete.textContent=done?'✓ আজ পড়েছেন':readable?'✓ পড়া শেষ — সেভ করুন':'পাঠ লোড হচ্ছে…';
    complete.disabled=done||!readable;
    complete.setAttribute('aria-label',done?'আজ এই সুরা পড়েছেন':readable?'এই সুরার পাঠ সম্পন্ন হিসেবে সংরক্ষণ করুন':'পাঠ লোড হলে সেভ করা যাবে');
    status.textContent='';
  }
  complete.addEventListener('click',()=>{
    if(!readable)return;
    try{
      const records=JSON.parse(localStorage.getItem(KEY)||'{}');
      if(!records||typeof records!=='object'||Array.isArray(records))throw Error('invalid');
      const day=today();
      const rows=Array.isArray(records[day])?records[day]:[];
      records[day]=[...new Set([...rows.map(String),String(number)])];
      localStorage.setItem(KEY,JSON.stringify(records));
      paint();
      status.textContent='পাঠের রেকর্ড সেভ হয়েছে।';
    }catch(e){status.textContent='রেকর্ড সেভ হয়নি। ব্রাউজার স্টোরেজ পরীক্ষা করুন।'}
  });
  window.addEventListener('dhikr:surah-ready',()=>{
    readable=true;paint();
  });
  window.addEventListener('dhikr:surah-failed',()=>{
    readable=false;paint();status.textContent='পাঠ লোড হয়নি। ইন্টারনেট পরীক্ষা করে আবার খুলুন।';
  });
  window.addEventListener('pageshow',paint);
  paint();
})();