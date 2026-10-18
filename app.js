'use strict';
/** Dubai Dhikr Tracker: all records are kept locally on the user's device. */
const TZ='Asia/Dubai';
const PRAYERS=[
  {key:'Fajr',bn:'ফজর',en:'Fajr',icon:'☾'},
  {key:'Dhuhr',bn:'জোহর',en:'Dhuhr',icon:'☀'},
  {key:'Asr',bn:'আসর',en:'Asr',icon:'◈'},
  {key:'Maghrib',bn:'মাগরিব',en:'Maghrib',icon:'◑'},
  {key:'Isha',bn:'এশা',en:'Isha',icon:'✦'}
];
const STEPS=[
{id:'istighfar', title:'আস্তাগফিরুল্লাহ',repeat:3,arabic:'أَسْتَغْفِرُ اللَّهَ',pron:'আস্তাগফিরুল্লাহ।',meaning:'আমি আল্লাহর কাছে ক্ষমা প্রার্থনা করছি।'},
{id:'salam',title:'আল্লাহুম্মা আনতাস সালাম',repeat:1,arabic:'اللَّهُمَّ أَنْتَ السَّلَامُ وَمِنْكَ السَّلَامُ تَبَارَكْتَ يَا ذَا الْجَلَالِ وَالْإِكْرَامِ',pron:'আল্লাহুম্মা আনতাস-সালামু, ওয়া মিনকাস-সালামু, তাবারাকতা ইয়া যাল-জালালি ওয়াল-ইকরাম।',meaning:'হে আল্লাহ! আপনিই শান্তির উৎস; আপনার কাছ থেকেই শান্তি আসে। হে মহিমা ও সম্মানের অধিকারী, আপনি বরকতময়।'},
{id:'long-tahlil',title:'লা ইলাহা ইল্লাল্লাহ — দীর্ঘ জিকির',repeat:1,arabic:'لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ\n\nلَا حَوْلَ وَلَا قُوَّةَ إِلَّا بِاللَّهِ، لَا إِلَهَ إِلَّا اللَّهُ وَلَا نَعْبُدُ إِلَّا إِيَّاهُ، لَهُ النِّعْمَةُ وَلَهُ الْفَضْلُ وَلَهُ الثَّنَاءُ الْحَسَنُ\n\nلَا إِلَهَ إِلَّا اللَّهُ مُخْلِصِينَ لَهُ الدِّينَ وَلَوْ كَرِهَ الْكَافِرُونَ',pron:'লা ইলাহা ইল্লাল্লাহু ওয়াহদাহু লা শারীকা লাহু। লাহুল মুলকু ওয়া লাহুল হামদু, ওয়া হুয়া আলা কুল্লি শাইয়িন কাদীর।\n\nলা হাওলা ওয়ালা কুওয়াতা ইল্লা বিল্লাহ। লা ইলাহা ইল্লাল্লাহু ওয়ালা না’বুদু ইল্লা ইয়্যাহু। লাহুন নি’মাতু ওয়া লাহুল ফাদলু ওয়া লাহুস সানাউল হাসান।\n\nলা ইলাহা ইল্লাল্লাহু মুখলিসীনা লাহুদ্দীনা ওয়ালাও কারিহাল কাফিরূন।',meaning:'আল্লাহ একক ও শরিকবিহীন; রাজত্ব ও প্রশংসা তাঁর, তিনিই সর্বশক্তিমান। আল্লাহর সাহায্য ছাড়া কোনো শক্তি নেই। সকল নিয়ামত ও অনুগ্রহ তাঁর। আমরা একনিষ্ঠভাবে তাঁরই ইবাদত করি।'},
{id:'la-mania',title:'আল্লাহুম্মা লা মানি‘আ',repeat:1,arabic:'اللَّهُمَّ لَا مَانِعَ لِمَا أَعْطَيْتَ وَلَا مُعْطِيَ لِمَا مَنَعْتَ وَلَا يَنْفَعُ ذَا الْجَدِّ مِنْكَ الْجَدُّ',pron:'আল্লাহুম্মা লা মানি‘আ লিমা আ‘তাইতা, ওয়ালা মু‘তিয়া লিমা মানা‘তা, ওয়ালা ইয়ানফা‘উ যাল-জাদ্দি মিনকাল-জাদ্দ।',meaning:'হে আল্লাহ! আপনি যা দেন তা কেউ আটকাতে পারে না; আপনি যা আটকে রাখেন তা কেউ দিতে পারে না। ধনসম্পদ ও মর্যাদা আপনাকে অতিক্রম করে কাউকে উপকার করতে পারে না।'},
{id:'a-inni',title:'আল্লাহুম্মা আ‘ইন্নী',repeat:1,arabic:'اللَّهُمَّ أَعِنِّي عَلَى ذِكْرِكَ وَشُكْرِكَ وَحُسْنِ عِبَادَتِكَ',pron:'আল্লাহুম্মা আ‘ইন্নী আলা যিকরিকা, ওয়া শুকরিকা, ওয়া হুসনি ইবাদাতিক।',meaning:'হে আল্লাহ! আপনাকে স্মরণ করতে, আপনার প্রতি কৃতজ্ঞ হতে ও সুন্দরভাবে ইবাদত করতে আমাকে সাহায্য করুন।'},
{id:'qini',title:'আল্লাহুম্মা কিনী আযাবাকা',repeat:1,arabic:'اللَّهُمَّ قِنِي عَذَابَكَ يَوْمَ تَبْعَثُ عِبَادَكَ',pron:'আল্লাহুম্মা কিনী আযাবাকা ইয়াওমা তাব‘আছু ইবাদাক।',meaning:'হে আল্লাহ! যেদিন আপনি বান্দাদের পুনরুত্থিত করবেন, সেদিন আমাকে আপনার শাস্তি থেকে রক্ষা করুন।'},
{id:'subhanallah',title:'সুবহানাল্লাহ',repeat:33,arabic:'سُبْحَانَ اللَّهِ',pron:'সুবহানাল্লাহ।',meaning:'আল্লাহ সকল ত্রুটি থেকে পবিত্র।'},
{id:'alhamdulillah',title:'আলহামদুলিল্লাহ',repeat:33,arabic:'الْحَمْدُ لِلَّهِ',pron:'আলহামদুলিল্লাহ।',meaning:'সকল প্রশংসা আল্লাহর।'},
{id:'allahuakbar',title:'আল্লাহু আকবার',repeat:33,arabic:'اللَّهُ أَكْبَرُ',pron:'আল্লাহু আকবার।',meaning:'আল্লাহ সর্বশ্রেষ্ঠ।'},
{id:'hundred',title:'১০০ পূর্ণ করার জিকির',repeat:1,arabic:'لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ',pron:'লা ইলাহা ইল্লাল্লাহু ওয়াহদাহু লা শারীকা লাহু। লাহুল মুলকু ওয়া লাহুল হামদু, ওয়া হুয়া আলা কুল্লি শাইয়িন কাদীর।',meaning:'আল্লাহ ছাড়া সত্য কোনো উপাস্য নেই; তিনি একক ও শরিকবিহীন। রাজত্ব ও প্রশংসা তাঁর। তিনি সবকিছুর ওপর ক্ষমতাবান।'},
{id:'ten',title:'ফজর-মাগরিবের বিশেষ জিকির',repeat:10,special:true,arabic:'لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ يُحْيِي وَيُمِيتُ وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ',pron:'লা ইলাহা ইল্লাল্লাহু ওয়াহদাহু লা শারীকা লাহু, লাহুল মুলকু ওয়া লাহুল হামদু, ইউহয়ী ওয়া ইউমীতু, ওয়া হুয়া আলা কুল্লি শাইয়িন কাদীর।',meaning:'আল্লাহ একক; রাজত্ব ও প্রশংসা তাঁর। তিনিই জীবন দেন ও মৃত্যু ঘটান; তিনি সর্বশক্তিমান।'},
{id:'kursi',title:'আয়াতুল কুরসি',repeat:1,arabic:'اللَّهُ لَا إِلَٰهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ ۚ لَا تَأْخُذُهُ سِنَةٌ وَلَا نَوْمٌ ۚ لَهُ مَا فِي السَّمَاوَاتِ وَمَا فِي الْأَرْضِ ۗ مَنْ ذَا الَّذِي يَشْفَعُ عِنْدَهُ إِلَّا بِإِذْنِهِ ۚ يَعْلَمُ مَا بَيْنَ أَيْدِيهِمْ وَمَا خَلْفَهُمْ ۖ وَلَا يُحِيطُونَ بِشَيْءٍ مِنْ عِلْمِهِ إِلَّا بِمَا شَاءَ ۚ وَسِعَ كُرْسِيُّهُ السَّمَاوَاتِ وَالْأَرْضَ ۖ وَلَا يَئُودُهُ حِفْظُهُمَا ۚ وَهُوَ الْعَلِيُّ الْعَظِيمُ',pron:'আল্লাহু লা ইলাহা ইল্লা হুয়াল হাইয়্যুল কাইয়্যুম।\n\nলা তা’খুযুহু সিনাতুঁ ওয়ালা নাউম। লাহু মা ফিস সামাওয়াতি ওয়া মা ফিল আরদ।\n\nমান যাল্লাযী ইয়াশফাউ ইনদাহু ইল্লা বিইযনিহ। ইয়ালামু মা বাইনা আইদীহিম ওয়া মা খালফাহুম।\n\nওয়ালা ইউহীতূনা বিশাইয়িম মিন ইলমিহী ইল্লা বিমা শা। ওয়াসিআ কুরসিয়্যুহুস সামাওয়াতি ওয়াল আরদ।\n\nওয়ালা ইয়াউদুহু হিফযুহুমা ওয়া হুয়াল আলিয়্যুল আযীম।',meaning:'আল্লাহ চিরঞ্জীব, সবকিছুর ধারক। তাঁকে তন্দ্রা বা ঘুম স্পর্শ করে না। সবকিছুর মালিক তিনি। তাঁর অনুমতি ছাড়া কেউ সুপারিশ করতে পারে না। তাঁর জ্ঞান ও কর্তৃত্ব সবকিছুকে পরিবেষ্টন করে; তিনি সর্বোচ্চ, মহান।'},
{id:'ikhlas',title:'সুরা আল-ইখলাস',repeat:1,three:true,arabic:'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ\nقُلْ هُوَ اللَّهُ أَحَدٌ\nاللَّهُ الصَّمَدُ\nلَمْ يَلِدْ وَلَمْ يُولَدْ\nوَلَمْ يَكُنْ لَهُ كُفُوًا أَحَدٌ',pron:'বিসমিল্লাহির রাহমানির রাহীম।\n\nকুল হুয়াল্লাহু আহাদ।\nআল্লাহুস সামাদ।\nলাম ইয়ালিদ ওয়ালাম ইউলাদ।\nওয়ালাম ইয়াকুল্লাহু কুফুওয়ান আহাদ।',meaning:'আল্লাহ এক ও অদ্বিতীয়। তিনি কারও মুখাপেক্ষী নন; তাঁর কোনো সন্তান নেই, তাঁকেও জন্ম দেওয়া হয়নি, তাঁর সমকক্ষ কেউ নেই।'},
{id:'falaq',title:'সুরা আল-ফালাক',repeat:1,three:true,arabic:'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ\nقُلْ أَعُوذُ بِرَبِّ الْفَلَقِ\nمِنْ شَرِّ مَا خَلَقَ\nوَمِنْ شَرِّ غَاسِقٍ إِذَا وَقَبَ\nوَمِنْ شَرِّ النَّفَّاثَاتِ فِي الْعُقَدِ\nوَمِنْ شَرِّ حَاسِدٍ إِذَا حَسَدَ',pron:'বিসমিল্লাহির রাহমানির রাহীম।\n\nকুল আউযু বিরাব্বিল ফালাক।\nমিন শাররি মা খালাক।\nওয়া মিন শাররি গাসিকিন ইযা ওয়াকাব।\nওয়া মিন শাররিন নাফ্ফাছাতি ফিল উকাদ।\nওয়া মিন শাররি হাসিদিন ইযা হাসাদ।',meaning:'প্রভাতের রবের কাছে আশ্রয় চাই সমস্ত সৃষ্টি, গভীর রাতের অন্ধকার, জাদু ও হিংসুকের অনিষ্ট থেকে।'},
{id:'nas',title:'সুরা আন-নাস',repeat:1,three:true,arabic:'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ\nقُلْ أَعُوذُ بِرَبِّ النَّاسِ\nمَلِكِ النَّاسِ\nإِلَٰهِ النَّاسِ\nمِنْ شَرِّ الْوَسْوَاسِ الْخَنَّاسِ\nالَّذِي يُوَسْوِسُ فِي صُدُورِ النَّاسِ\nمِنَ الْجِنَّةِ وَالنَّاسِ',pron:'বিসমিল্লাহির রাহমানির রাহীম।\n\nকুল আউযু বিরাব্বিন নাস।\nমালিকিন নাস।\nইলাহিন নাস।\nমিন শাররিল ওয়াসওয়াসিল খান্নাস।\nআল্লাযী ইউওয়াসউইসু ফী সুদূরিন নাস।\nমিনাল জিন্নাতি ওয়ান নাস।',meaning:'মানুষের রব, অধিপতি ও উপাস্য আল্লাহর কাছে আশ্রয় চাই, জিন বা মানুষের মধ্যকার কুমন্ত্রণাদাতার অনিষ্ট থেকে।'}
];
const DATA_KEY='dhikr_dubai_records_v1'; const TIMES_KEY='dhikr_dubai_times_v1';
const pad=n=>String(n).padStart(2,'0');
const bn=n=>Number(n).toLocaleString('bn-BD');
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const icon=(name,size=19)=>{const p={home:'<path d="m3 10 9-7 9 7v10a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1z"/>',chart:'<rect x="4" y="12" width="4" height="8" rx="1"/><rect x="10" y="7" width="4" height="13" rx="1"/><rect x="16" y="3" width="4" height="17" rx="1"/>',settings:'<circle cx="12" cy="12" r="3"/><path d="M12 2v3m0 14v3M4.9 4.9 7 7m10 10 2.1 2.1M2 12h3m14 0h3M4.9 19.1 7 17M17 7l2.1-2.1"/>',back:'<path d="m15 18-6-6 6-6"/>',check:'<path d="m5 12 4 4L19 6"/>',chevron:'<path d="m6 9 6 6 6-6"/>',lock:'<rect x="5" y="10" width="14" height="11" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/>',download:'<path d="M12 3v12m-4-4 4 4 4-4M4 17v4h16v-4"/>',info:'<circle cx="12" cy="12" r="9"/><path d="M12 11v6m0-10v1"/>'};return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${p[name]||p.info}</svg>`};
function safeRead(k, fallback){try{let x=localStorage.getItem(k);return x?JSON.parse(x):fallback}catch(e){return fallback}}
function safeWrite(k,v){try{localStorage.setItem(k,JSON.stringify(v));return true}catch(e){toast('সেভ করা যাচ্ছে না—ব্রাউজারের স্টোরেজ চালু করুন');return false}}
function cleanData(x){if(!x||typeof x!=='object'||typeof x.sessions!=='object'||!x.sessions)return {version:1,sessions:{}};
 const obj={version:1,sessions:{}};
 for(const [key,s] of Object.entries(x.sessions).slice(0,6000)){
  if(!/^\d{4}-\d\d-\d\d\|(Fajr|Dhuhr|Asr|Maghrib|Isha)$/.test(key)||!s||typeof s!=='object')continue;
  const items={};for(const [sid,step] of Object.entries(s.items||{})){
   if(!STEPS.some(d=>d.id===sid)||!step||typeof step!=='object')continue;
   let count=Number(step.count); if(!Number.isInteger(count)||count<0||count>33)continue;
   items[sid]={count,updatedAt:typeof step.updatedAt==='string'?step.updatedAt:null,completedAt:typeof step.completedAt==='string'?step.completedAt:null};
  }
  obj.sessions[key]={items};
 }
 return obj;
}
let db=cleanData(safeRead(DATA_KEY,{version:1,sessions:{}}));
let times=safeRead(TIMES_KEY,{});if(!times||typeof times!=='object'||Array.isArray(times))times={};
// A one-day published fallback lets the initial demo open without network; subsequent days require verified fetched times.
const SEED={'2026-10-18':{Fajr:'05:01',Sunrise:'06:14',Dhuhr:'12:06',Asr:'15:22',Maghrib:'17:53',Isha:'19:06',source:'Published Dubai timetable (Assabile)'}};
for(const [d,t] of Object.entries(SEED))if(!times[d])times[d]=t;
let screen='today',prayer='Fajr',openId=null,histOffset=0,loading=false,err='',busyMonths=new Set(),currentDay='',toastTimer=null;
let focusId=null, focusTab='bn', finishing=false, finishTimer=null, finishNext=null, finishToken=0;
function cancelFinish(){finishToken++;clearTimeout(finishTimer);finishTimer=null;finishing=false;finishNext=null}
function firstUnfinished(pr=prayer){const inf=dayInfo(),sess=sessionFor(inf.day,pr);return stepsFor(pr).find(d=>itemCount(sess,d)<target(d,pr))?.id||null}
function nextUnfinished(pr,completed){const inf=dayInfo(),all=stepsFor(pr),sess=sessionFor(inf.day,pr),index=all.findIndex(d=>d.id===completed);return [...all.slice(index+1),...all.slice(0,index)].find(d=>itemCount(sess,d)<target(d,pr))?.id||null}
function openFocus(id){if(!unlocked(prayer)){toast('এই নামাজের সময় এখনো শুরু হয়নি');screen='today';render();return}const step=stepsFor(prayer).find(d=>d.id===id);if(!step)return;cancelFinish();focusId=id;focusTab='bn';screen='focus';render();window.scrollTo(0,0);document.getElementById('focus-reading')?.scrollTo(0,0)}
function finishGo(){if(!finishing)return;const dest=finishNext;cancelFinish();if(dest)openFocus(dest);else{screen='session';focusId=null;render();window.scrollTo(0,0)}}

function dubaiParts(dt=new Date()){
 const part=new Intl.DateTimeFormat('en-GB',{timeZone:TZ,year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',second:'2-digit',hourCycle:'h23'}).formatToParts(dt);
 const v={};part.forEach(p=>v[p.type]=p.value);
 return {day:`${v.year}-${v.month}-${v.day}`,year:+v.year,month:+v.month,hour:+v.hour,minute:+v.minute,second:+v.second};
}
function banglaDate(day){const d=new Date(`${day}T12:00:00+04:00`);return new Intl.DateTimeFormat('bn-BD',{timeZone:TZ,day:'numeric',month:'long',year:'numeric',weekday:'long'}).format(d)}
function prettyDay(day){const d=new Date(`${day}T12:00:00+04:00`);return new Intl.DateTimeFormat('bn-BD',{timeZone:TZ,day:'numeric',month:'short'}).format(d)}
function formatClock(dt){return new Intl.DateTimeFormat('en-GB',{timeZone:TZ,hour:'2-digit',minute:'2-digit',hourCycle:'h23'}).format(dt)}
function showTime(t){if(!t)return '—';const m=/^(\d\d?):(\d\d)/.exec(t);if(!m)return '—';const h=Number(m[1]);return `${pad(h%12||12)}:${m[2]} ${h<12?'AM':'PM'}`}
function minutes(s){if(typeof s!=='string')return NaN;const m=/^(\d{1,2}):(\d\d)/.exec(s);return m?Number(m[1])*60+Number(m[2]):NaN}
function validTimes(t){if(!t)return false;let arr=['Fajr','Sunrise','Dhuhr','Asr','Maghrib','Isha'].map(k=>minutes(t[k]));return arr.every(n=>n>=0&&n<1440)&&arr.every((v,i)=>i===0||v>arr[i-1])}
function parseApiTime(s){const m=String(s||'').match(/^(\d{1,2}):(\d\d)/);return m?`${pad(+m[1])}:${m[2]}`:''}
function extractTiming(raw){const t={source:'AlAdhan • Dubai (experimental method 16)'};for(const k of ['Fajr','Sunrise','Dhuhr','Asr','Maghrib','Isha'])t[k]=parseApiTime(raw?.[k]);return validTimes(t)?t:null}
function dayInfo(){const p=dubaiParts();const now=p.hour*60+p.minute;return {day:p.day,now,clock:`${pad(p.hour)}:${pad(p.minute)}`,tm:times[p.day]||null}}
function unlocked(pr,info=dayInfo()){return validTimes(info.tm)&&info.now>=minutes(info.tm[pr])}
function stepsFor(pr){return STEPS.filter(s=>!s.special||pr==='Fajr'||pr==='Maghrib')}
function target(d,pr){return d.three&&(pr==='Fajr'||pr==='Maghrib')?3:d.repeat}
function keyFor(date,pr){return `${date}|${pr}`}
function sessionFor(date,pr){return db.sessions[keyFor(date,pr)]||{items:{}}}
function itemCount(s,d){return Number(s.items?.[d.id]?.count)||0}
function sessionStats(date,pr){const s=sessionFor(date,pr),steps=stepsFor(pr),done=steps.filter(d=>itemCount(s,d)>=target(d,pr)).length;return {done,total:steps.length,percent:Math.round(done/steps.length*100),started:steps.some(d=>itemCount(s,d)>0),complete:done===steps.length}}
function todayStat(day){let complete=0,stepsDone=0,stepsAll=0,started=0;for(const p of PRAYERS){let s=sessionStats(day,p.key);if(s.complete)complete++;if(s.started)started++;stepsDone+=s.done;stepsAll+=s.total}return {complete,stepsDone,stepsAll,started}}
function toast(s){let t=document.getElementById('toast');t.textContent=s;t.classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(()=>t.classList.remove('show'),2300)}
async function fetchToday(){const p=dubaiParts();let d=p.day.split('-');let url=`https://api.aladhan.com/v1/timings/${d[2]}-${d[1]}-${d[0]}?latitude=25.2048&longitude=55.2708&method=16&school=0&timezonestring=Asia%2FDubai`;
 try{const r=await fetch(url,{cache:'no-store'});if(!r.ok)throw Error('http');const json=await r.json();const tm=extractTiming(json?.data?.timings);if(!tm)throw Error('invalid');times[p.day]=tm;safeWrite(TIMES_KEY,times);err='';if(screen!=='focus')render();}catch(e){if(!validTimes(times[p.day])){err='এই মুহূর্তে দুবাইয়ের নামাজের সময় পাওয়া যাচ্ছে না। সময় না পাওয়া পর্যন্ত ভবিষ্যৎ নামাজ লক থাকবে।';render()}}}
async function fetchMonth(year,month){const id=`${year}-${pad(month)}`;if(busyMonths.has(id)||times[`${id}-01`]?.source==='AlAdhan • Dubai (experimental method 16)')return;busyMonths.add(id);
 const url=`https://api.aladhan.com/v1/calendar/${year}/${month}?latitude=25.2048&longitude=55.2708&method=16&school=0&timezonestring=Asia%2FDubai`;
 try{const r=await fetch(url);if(!r.ok)throw Error('http');const j=await r.json();if(!Array.isArray(j.data))throw Error('data');for(const entry of j.data){const d=entry?.date?.gregorian?.date;const x=/^(\d\d)-(\d\d)-(\d{4})$/.exec(d||'');const tm=extractTiming(entry?.timings);if(x&&tm)times[`${x[3]}-${x[2]}-${x[1]}`]=tm;}safeWrite(TIMES_KEY,times);err='';if(screen!=='focus')render();}catch(e){}finally{busyMonths.delete(id)}}
async function updateTimes(){if(loading)return;loading=true;err='';if(screen!=='focus')render();const p=dubaiParts();await fetchToday();loading=false;if(screen!=='focus')render();fetchMonth(p.year,p.month);let n=p.month===12?1:p.month+1;fetchMonth(p.month===12?p.year+1:p.year,n)}
function countChange(id,delta){
 const info=dayInfo();if(!unlocked(prayer,info)){toast('এই নামাজের সময় এখনো শুরু হয়নি');cancelFinish();screen='today';render();return}
 const d=STEPS.find(x=>x.id===id);if(!d||!stepsFor(prayer).includes(d))return;
 const k=keyFor(info.day,prayer);if(!db.sessions[k])db.sessions[k]={items:{}};
 const session=db.sessions[k],x=session.items[id]||{count:0,completedAt:null},max=target(d,prayer),previous=Number(x.count)||0;
 const cnt=Math.min(max,Math.max(0,previous+delta));if(previous===cnt)return;
 session.items[id]={count:cnt,updatedAt:new Date().toISOString(),completedAt:cnt===max?new Date().toISOString():null};
 if(!safeWrite(DATA_KEY,db))return;
 if(navigator.vibrate&&delta>0)try{navigator.vibrate(cnt===max?40:12)}catch(e){}
 if(cnt===max&&previous<max&&delta>0&&screen==='focus'&&focusId===id){
   finishing=true;finishNext=nextUnfinished(prayer,id);const token=++finishToken;
   render();finishTimer=setTimeout(()=>{if(token===finishToken)finishGo()},1250);
 }else{if(finishing)cancelFinish();render()}
}

function prevDate(offset){const day=dayInfo().day;let d=new Date(`${day}T12:00:00+04:00`);d.setUTCDate(d.getUTCDate()+offset);const ps=new Intl.DateTimeFormat('en-GB',{timeZone:TZ,year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(d);const o={};ps.forEach(x=>o[x.type]=x.value);return `${o.year}-${o.month}-${o.day}`}
function getHistDate(){return prevDate(histOffset)}
function totalFinished(){let x=0;for(const k of Object.keys(db.sessions)){const [day,pr]=k.split('|');if(sessionStats(day,pr).complete)x++}return x}
function activeDays(){return new Set(Object.keys(db.sessions).filter(k=>{const [d,p]=k.split('|');return sessionStats(d,p).started}).map(k=>k.split('|')[0])).size}
function renderNav(){document.getElementById('nav').innerHTML=[['today','home','আজ'],['history','chart','রেকর্ড'],['settings','settings','সেটিংস']].map(([v,ic,label])=>`<button class="nav-btn ${((screen==='session'?'today':screen)===v)?'active':''}" data-action="nav" data-screen="${v}" aria-label="${label}">${icon(ic)}<span>${label}</span></button>`).join('')}
function renderToday(){
 const i=dayInfo(),stat=todayStat(i.day),valid=validTimes(i.tm),next=PRAYERS.find(p=>valid&&i.now<minutes(i.tm[p.key]));
 const lastAvailable=[...PRAYERS].reverse().find(p=>unlocked(p.key,i));
 const candidate=[...PRAYERS].reverse().find(p=>unlocked(p.key,i)&&sessionStats(i.day,p.key).started&&!sessionStats(i.day,p.key).complete)||PRAYERS.find(p=>unlocked(p.key,i)&&!sessionStats(i.day,p.key).complete)||lastAvailable;
 const current=lastAvailable||next;
 const cstat=candidate?sessionStats(i.day,candidate.key):null;
 const cards=PRAYERS.map((p,index)=>{const available=unlocked(p.key,i),stats=sessionStats(i.day,p.key),currentNow=p.key===current?.key;
 const state=stats.complete?'সম্পন্ন':available?(stats.started?'চলমান':'শুরু করুন'):'লক';
 return `<button class="prayer v2-prayer ${available?'v2-unlocked':'v2-locked'} ${currentNow?'is-current':''}" ${available?'':'disabled aria-disabled="true"'} data-action="prayer" data-prayer="${p.key}" aria-label="${p.bn}, ${state}"><span class="v2-prayer-emblem">${available?(stats.complete?'✓':p.icon):icon('lock',21)}</span><span class="v2-prayer-details"><strong>${p.bn}</strong><small>${valid?showTime(i.tm[p.key]):'সময় আসেনি'}</small></span><span class="v2-status ${stats.complete?'is-complete':''}">${available?(stats.complete?'✓ সম্পন্ন':`${bn(stats.done)}/${bn(stats.total)}`):'লক'}</span></button>`}).join('');
 return `<div class="v2-topbar"><div class="v2-logo"><div class="v2-symbol">☪</div><div><strong>যিকির</strong><small>YOUR DAILY MOMENT OF PEACE</small></div></div><div class="v2-location">◉ DUBAI</div></div>
 <section class="v2-hero"><div class="v2-hero-halo"></div><div class="v2-hero-orbit">☾</div><div class="v2-hero-inner"><div class="v2-hero-overline">${esc(banglaDate(i.day))}</div><h1>একটু থামুন,<br><em>আল্লাহকে স্মরণ করুন।</em></h1><p>প্রতিটি জিকিরের জন্য শান্ত, সহজ ও মনোযোগী একটি মুহূর্ত।</p><div class="v2-hero-rule"></div><div class="v2-hero-data"><div><small>দুবাইয়ের সময়</small><strong>${i.clock}</strong></div><div><small>পরবর্তী ওয়াক্ত</small><strong class="v2-next">${next?next.bn+' · '+showTime(i.tm[next.key]):valid?'সব ওয়াক্ত শুরু হয়েছে':'সময়সূচি লোড হচ্ছে'}</strong></div></div></div></section>
 <div class="v2-progress-card"><div class="v2-progress-ring" style="--p:${Math.round(100*stat.stepsDone/Math.max(stat.stepsAll,1))}%"><div><strong>${bn(stat.stepsDone)}</strong><span>/${bn(stat.stepsAll)}</span></div></div><div class="v2-progress-content"><span class="v2-kicker">আজকের অগ্রগতি</span><strong>প্রতিটি জিকিরের<br>একটি সুন্দর রেকর্ড</strong><small>${bn(stat.complete)} / ৫ ওয়াক্তের সব জিকির সম্পন্ন</small></div></div>
 ${candidate?`<button class="v2-continue" data-action="continue" data-prayer="${candidate.key}"><span class="v2-continue-left"><small>${esc(candidate.bn)} • ${cstat?.started?'আবার শুরু করুন':'শুরু করুন'}</small><strong>জিকির শুরু করুন</strong></span><span class="v2-circle-arrow">→</span></button>`:''}
 <div class="v2-section-heading"><div><small>DAILY PRACTICE</small><h2>পাঁচ ওয়াক্ত</h2></div><span>${bn(stat.complete)} / ৫ সম্পন্ন</span></div>
 <div class="v2-prayer-grid">${cards}</div>
 ${err?`<div class="errbox">${esc(err)} <button data-action="refresh">আবার চেষ্টা করুন</button></div>`:''}
 <div class="v2-home-note">${valid?'ওয়াক্ত শুরু হলে সেই নামাজের জিকির খুলবে। পরের নামাজ আগে থেকে খোলা যাবে না।':'সময়সূচি না পাওয়া পর্যন্ত ভবিষ্যৎ ওয়াক্ত বন্ধ থাকবে।'}<br><small>সময়: ${esc(i.tm?.source||'দুবাই গণনাভিত্তিক সময়')}</small></div>`;
}
function renderDua(d,idx,s,p){const n=itemCount(s,d),max=target(d,p),full=n>=max,opened=openId===d.id;return `<section class="dua ${opened?'open':''}"><button class="dua-head" data-action="expand" data-id="${d.id}" aria-expanded="${opened}"><span class="dua-n ${full?'complete':''}">${full?icon('check',15):bn(idx+1)}</span><div style="min-width:0;flex:1"><div class="dua-title">${esc(d.title)}</div><div class="dua-sub">${bn(max)} বার • ${full?'পড়া হয়েছে':n?`${bn(n)} / ${bn(max)} বার পড়েছেন`:'পড়তে ট্যাপ করুন'}</div></div><div class="dua-hright">${full?'✓ ':''}${icon('chevron',17).replace('width="17"','class="rot" width="17"')}</div></button>${opened?`<div class="dua-body"><div class="fieldlabel">বাংলা উচ্চারণ</div><div class="pron">${esc(d.pron)}</div><div class="extra"><div class="fieldlabel">আরবি</div><div class="arabic">${esc(d.arabic).replace(/\n/g,'<br>')}</div></div><div class="extra"><div class="fieldlabel">বাংলা অর্থ</div><div class="meaning">${esc(d.meaning)}</div></div><div class="count-wrap"><div><div class="count-text">পড়ার সংখ্যা</div><div class="count-num">${bn(n)} <span style="font-size:13px;color:#70907d">/ ${bn(max)}</span></div></div><div class="count-actions"><button class="count-button minus" data-action="adjust" data-id="${d.id}" data-delta="-1" ${n===0?'disabled':''} aria-label="একবার কমান">−</button><button class="count-button" data-action="adjust" data-id="${d.id}" data-delta="1" ${full?'disabled':''} aria-label="একবার গণনা করুন">${full?icon('check',18):'+'}</button></div></div><div class="count-foot">${max>1?'প্রতি বার পড়ার পর + চাপুন।':'পড়া শেষ হলে + চাপুন।'} প্রতিটি পরিবর্তন এই ডিভাইসে সেভ হবে।</div>${full?`<button class="single-btn complete" data-action="adjust" data-id="${d.id}" data-delta="-${max}">✓ পড়া হয়েছে — আবার শুরু করুন</button>`:''}</div>`:''}</section>`}
function renderSession(){
 const info=dayInfo(),p=PRAYERS.find(p=>p.key===prayer);if(!unlocked(prayer,info)){screen='today';return renderToday()}
 const sess=sessionFor(info.day,prayer),steps=stepsFor(prayer),stats=sessionStats(info.day,prayer),first=firstUnfinished(prayer);
 const cards=steps.map((d,j)=>{const count=itemCount(sess,d),goal=target(d,prayer),complete=count>=goal;return `<button class="v2-dua-row ${complete?'complete':''}" data-action="focus" data-id="${d.id}" aria-label="${d.title}, ${bn(count)} / ${bn(goal)} বার"><span class="v2-stepnum">${complete?icon('check',22):String(j+1).padStart(2,'0')}</span><span class="v2-row-copy"><strong>${esc(d.title)}</strong><small>${complete?'সম্পন্ন হয়েছে':`${bn(count)} / ${bn(goal)} বার • ট্যাপ করে পড়ুন`}</small></span><span class="v2-row-arrow">→</span></button>`}).join('');
 return `<div class="v2-simple-header"><button class="v2-back" data-action="nav" data-screen="today" aria-label="হোমে ফিরুন">${icon('back',24)}</button><div>ফরজ নামাজের পরের জিকির</div><span class="v2-header-moon">☾</span></div>
 <div class="v2-session-hero"><div class="v2-session-icon">☪</div><small>${esc(banglaDate(info.day))} • ${showTime(info.tm[prayer])}</small><h1>${p.bn} নামাজের জিকির</h1><p>${bn(stats.done)} / ${bn(stats.total)}টি ধাপ সম্পন্ন</p><div class="v2-meter"><span style="width:${stats.percent}%"></span></div></div>
 ${stats.complete?`<div class="v2-done-banner">✓ আলহামদুলিল্লাহ! সব জিকির সম্পন্ন হয়েছে।</div>`:`<button class="v2-continue session-start" data-action="focus" data-id="${first}"><span class="v2-continue-left"><small>শান্তভাবে পড়ুন, এক ধাপ করে</small><strong>${stats.started?'যেখান থেকে শেষ করেছেন':'জিকির শুরু করুন'}</strong></span><span class="v2-circle-arrow">→</span></button>`}
 <div class="v2-section-heading"><div><small>YOUR DHIKR JOURNEY</small><h2>জিকিরের তালিকা</h2></div><span>${bn(steps.length)}টি ধাপ</span></div>
 <div class="v2-step-list">${cards}</div>
 <p class="footnote">বাংলা উচ্চারণে আরবির সব ধ্বনি বোঝানো যায় না। নির্ভরযোগ্য কারির তিলাওয়াত অনুসরণ করুন।</p>`;
}
// Focus mode: one dua fills the full iPhone viewport. Reading area scrolls independently from its fixed counter.
function textParagraphs(value,kind){const v=String(value||'').trim();if(kind==='arabic')return v.split(/\n+/).filter(Boolean).map(t=>`<p class="v2-reading-p">${esc(t)}</p>`).join('');
 return v.split(/\n\s*\n|\n/).filter(Boolean).map(t=>`<p class="v2-reading-p">${esc(t)}</p>`).join('');}
function renderFocus(){
 const info=dayInfo();if(!unlocked(prayer,info)){screen='today';return renderToday()}
 const steps=stepsFor(prayer),d=steps.find(x=>x.id===focusId);if(!d){screen='session';return renderSession()}
 const index=steps.indexOf(d),sess=sessionFor(info.day,prayer),n=itemCount(sess,d),goal=target(d,prayer),percent=Math.round(n/goal*100),prName=PRAYERS.find(p=>p.key===prayer)?.bn||'';
 const active=focusTab==='ar'?'arabic':focusTab==='meaning'?'meaning':'pron';const content=active==='arabic'?d.arabic:active==='meaning'?d.meaning:d.pron;
 const tabs=[['bn','বাংলা উচ্চারণ'],['ar','আরবি'],['meaning','অর্থ']].map(([key,label])=>`<button class="v2-tab ${focusTab===key?'active':''}" data-action="focus-tab" data-tab="${key}" role="tab" aria-selected="${focusTab===key}">${label}</button>`).join('');
 return `<div class="v2-focus-page"><div class="v2-focus-head"><button class="v2-focus-close" data-action="focus-close" aria-label="জিকির তালিকায় ফিরুন">✕</button><div class="v2-focus-heading"><span>${prName} নামাজ</span><strong>${bn(index+1)} / ${bn(steps.length)} ধাপ</strong></div><button class="v2-focus-min" data-action="focus-close" aria-label="জিকির ছোট করুন">${icon('chevron',22)}</button></div>
 <div class="v2-focus-line"><span style="width:${(index + percent/100)/steps.length*100}%"></span></div>
 <div id="focus-reading" class="v2-focus-reading" tabindex="0"><div class="v2-focus-body"><div class="v2-focus-kicker">✦ READ · REFLECT · REMEMBER</div><h1>${esc(d.title)}</h1><div class="v2-focus-subtitle">${bn(goal)} বার পড়ুন <span class="v2-bullet">•</span> ${prName}</div>
 <div class="v2-focus-tabs" role="tablist" aria-label="কীভাবে পড়বেন">${tabs}</div>
 <div class="v2-reading-paper ${active==='arabic'?'is-arabic':''} ${d.id==='kursi'||d.three?'is-long':''}" lang="${active==='arabic'?'ar':'bn'}" ${active==='arabic'?'dir="rtl"':''}><div class="v2-reading-caption">${active==='arabic'?'মূল আরবি':active==='meaning'?'বাংলা অর্থ':'বাংলা উচ্চারণ'}</div>${textParagraphs(content,active)}</div>
 <div class="v2-reading-hint">${goal>1?'প্রতিবার পড়া শেষে নিচের সবুজ বাটনে চাপুন।':'পড়া শেষ হলে নিচের সবুজ বাটনে চাপুন।'}<br>আপনার অগ্রগতি এই আইফোনে সেভ হবে।</div></div></div>
 <div class="v2-focus-dock"><div class="v2-counter-top"><div><small>পড়া হয়েছে</small><strong>${bn(n)} <span>/ ${bn(goal)}</span></strong></div><div class="v2-counter-progress" style="--p:${percent}%">${bn(percent)}%</div></div>
 <div class="v2-tap-row"><button class="v2-minus" data-action="adjust" data-id="${d.id}" data-delta="-1" ${n===0?'disabled':''} aria-label="একবার কমান">−</button><button class="v2-giant-tap" data-action="adjust" data-id="${d.id}" data-delta="1" ${n===goal?'disabled':''} aria-label="${n===goal?'সম্পন্ন হয়েছে':'একবার পড়া হয়েছে, সংখ্যা বাড়ান'}"><span class="v2-button-flower">✦</span>${n>=goal?'সম্পন্ন হয়েছে':'পড়া হয়েছে · ট্যাপ করুন'}<span class="v2-tap-arrow">${n===goal?'✓':'+'}</span></button></div>
 ${n===goal&&!finishing?'<button class="v2-next-link" data-action="focus-next">পরবর্তী জিকির →</button>':''}</div>
 ${finishing?`<div class="v2-success-layer" role="status" aria-live="assertive"><div class="v2-success-card"><div class="v2-success-seal">✓</div><span class="v2-success-over">DHIKR COMPLETED</span><h2>আলহামদুলিল্লাহ!</h2><p>${esc(d.title)}<br>${bn(goal)} বার পড়া হয়েছে</p><div class="v2-success-track"><span></span></div><button class="v2-success-next" data-action="finish-next">${finishNext?'পরবর্তী জিকির →':'তালিকায় ফিরে যান →'}</button></div></div>`:''}
 </div>`;
}
function renderHistory(){let day=dayInfo().day,sel=getHistDate();const streakArr=Array.from({length:7},(_,i)=>prevDate(i-6));const totals=streakArr.map(d=>todayStat(d).complete);const list=PRAYERS.map(p=>{const s=sessionStats(sel,p.key),entry=sessionFor(sel,p.key);const full=stepsFor(p.key).filter(d=>itemCount(entry,d)>=target(d,p.key));let last=Object.values(entry.items).map(v=>v.updatedAt).filter(Boolean).sort().at(-1);return `<div class="record"><div><b>${p.bn}</b><p>${s.started?`${bn(s.done)} / ${bn(s.total)} ধাপ সম্পন্ন`:'কোনো রেকর্ড নেই'}</p>${full.length?`<div class="record-items">${full.slice(0,3).map(x=>esc(x.title)).join(' · ')}${full.length>3?` · +${bn(full.length-3)}`:''}</div>`:''}</div><div class="record-right">${s.complete?'✓ সম্পন্ন':s.started?'চলমান':'—'}<small>${last?formatClock(new Date(last))+' Dubai':' '}</small></div></div>`}).join('');
 return `<header class="header"><div class="brand"><div class="brand-mark">☾</div><div><div class="brand-name">যিকির</div><div class="brand-sub">After Prayer • Dubai</div></div></div><span class="smallpill">📍 দুবাই</span></header><div class="panel-head"><h1>আমার জিকিরের রেকর্ড</h1><p>আপনার পড়ার সংখ্যা, সম্পন্ন নামাজ ও আগের দিনের অগ্রগতি এখানে সংরক্ষিত থাকে।</p></div>
 <div class="mini-stats"><div class="card"><div class="stat-val">${bn(totalFinished())}</div><div class="stat-label">মোট সম্পন্ন তালিকা</div></div><div class="card"><div class="stat-val">${bn(activeDays())}</div><div class="stat-label">সক্রিয় দিন</div></div><div class="card"><div class="stat-val">${bn(todayStat(day).complete)}</div><div class="stat-label">আজ সম্পন্ন</div></div></div>
 <div class="section-title"><h2>গত ৭ দিনের অগ্রগতি</h2><span class="sub">প্রতিদিন ৫ ওয়াক্ত</span></div><div class="card week">${streakArr.map((d,i)=>`<div class="day"><div class="daybar"><span style="height:${totals[i]*20}%"></span></div><div class="daylabel">${esc(new Intl.DateTimeFormat('bn-BD',{timeZone:TZ,weekday:'short'}).format(new Date(d+'T12:00:00+04:00')))}</div></div>`).join('')}</div>
 <div class="section-title"><h2>দিনভিত্তিক ইতিহাস</h2></div><div class="card" style="display:flex;align-items:center;justify-content:space-between;padding:10px 12px;margin-bottom:12px"><button class="action-btn" style="margin:0;padding:8px" data-action="history-offset" data-delta="-1" aria-label="আগের দিন">‹</button><div style="font-size:12px;font-weight:750;text-align:center">${banglaDate(sel)}</div><button class="action-btn" style="margin:0;padding:8px" data-action="history-offset" data-delta="1" ${histOffset>=0?'disabled':''} aria-label="পরের দিন">›</button></div><div class="record-list">${list}</div>
 <div class="notice">📦 রেকর্ড শুধু এই ডিভাইস ও ব্রাউজারে সেভ হয়। অন্য ফোনে নেওয়া বা ব্রাউজার ডেটা মুছে যাওয়ার ঝুঁকি এড়াতে সেটিংস থেকে ব্যাকআপ ডাউনলোড করুন।</div>`}
function renderSettings(){let d=dayInfo();return `<header class="header"><div class="brand"><div class="brand-mark">☾</div><div><div class="brand-name">যিকির</div><div class="brand-sub">After Prayer • Dubai</div></div></div><span class="smallpill">📍 দুবাই</span></header><div class="panel-head"><h1>সেটিংস ও ব্যাকআপ</h1><p>নামাজের সময়ের উৎস, ডেটা সংরক্ষণ এবং ব্যক্তিগত রেকর্ড নিয়ন্ত্রণ করুন।</p></div>
 <div class="card settings-card"><h3>⏱ দুবাই নামাজের সময়</h3><p>টাইমজোন <strong>Asia/Dubai (UTC+4)</strong>। AlAdhan-এর Dubai calculation method 16 থেকে দৈনিক সময় আনা হয়। এটি সরকারিভাবে প্রকাশিত IACAD সময় নয়; স্থানীয় মসজিদের সময়ের সঙ্গে সামান্য পার্থক্য হতে পারে।</p><p>আজকের সময়ের উৎস: <strong>${esc((d.tm||{}).source||'পাওয়া যায়নি')}</strong></p><button class="action-btn" data-action="refresh">↻ সময় হালনাগাদ করুন</button><p class="tiny"><a href="https://aladhan.com/prayer-times-api" target="_blank" rel="noopener noreferrer">প্রার্থনার সময়ের API ও হিসাব পদ্ধতি</a></p></div>
 <div class="card settings-card"><h3>💾 আমার রেকর্ড</h3><p>প্রতিটি গণনা, নামাজভিত্তিক ধাপ ও শেষ করার সময় আপনার ব্রাউজারের স্থানীয় স্টোরেজে থাকে। কোনো অ্যাকাউন্ট বা অনলাইন সিঙ্ক নেই।</p><button class="action-btn" data-action="export">${icon('download',16)} JSON ব্যাকআপ</button><button class="action-btn" data-action="import">↑ ব্যাকআপ ফেরত আনুন</button><p class="tiny">ব্যাকআপ ফেরত আনলে বর্তমান রেকর্ড প্রতিস্থাপিত হবে। JSON ফাইলটি ব্যক্তিগত তথ্য হিসেবে নিরাপদে রাখুন।</p></div>
 <div class="card settings-card"><h3>📱 মোবাইলে অ্যাপের মতো ব্যবহার</h3><p>iPhone Safari-তে এই অ্যাপের HTTPS লিংক খুলে <strong>Share → Add to Home Screen</strong> চাপুন। Android Chrome-এ <strong>Install app</strong> ব্যবহার করুন।</p><button class="action-btn" id="install-btn" data-action="install">অ্যাপ ইনস্টল করুন</button><p class="tiny">PWA ইনস্টল করতে ওয়েবসাইটটি HTTPS-এ হোস্ট করতে হবে। কেবল ZIP ফাইল খুললে ইনস্টল নাও হতে পারে।</p></div>
 <div class="card settings-card"><h3>⚠️ রেকর্ড মুছুন</h3><p>এই ডিভাইসে সংরক্ষিত সব জিকিরের রেকর্ড স্থায়ীভাবে মুছে যাবে। আগে ব্যাকআপ নিতে পারেন।</p><button class="action-btn danger" data-action="clear">সব রেকর্ড মুছে ফেলুন</button></div>
 <p class="footnote">যিকির কোনো নামাজের বিকল্প নয়। অ্যাপের চেকলিস্টের সংখ্যা আপনার নিজের লেখা বই বা ছবির ধারাবাহিকতা অনুসরণ করে সাজানো।</p>`}
function render(){const root=document.getElementById('root');if(!root)return;const offset=screen==='focus'?document.getElementById('focus-reading')?.scrollTop:null;document.body.classList.toggle('focus-mode',screen==='focus');root.innerHTML=screen==='focus'?renderFocus():screen==='session'?renderSession():screen==='history'?renderHistory():screen==='settings'?renderSettings():renderToday();renderNav();if(offset!==null&&offset!==undefined){const el=document.getElementById('focus-reading');if(el)el.scrollTop=offset}}
let deferredInstallPrompt=null;window.addEventListener('beforeinstallprompt',e=>{e.preventDefault();deferredInstallPrompt=e});
function dlBackup(){const payload={app:'Dubai Dhikr Tracker',version:1,exportedAt:new Date().toISOString(),timezone:TZ,sessions:db.sessions};const blob=new Blob([JSON.stringify(payload,null,2)],{type:'application/json'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=`dhikr-dubai-backup-${dayInfo().day}.json`;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),5000);toast('ব্যাকআপ প্রস্তুত হয়েছে')}
async function importFile(f){if(!f||f.size>6_000_000){toast('সঠিক JSON ফাইল নির্বাচন করুন');return}try{const x=JSON.parse(await f.text());if(x?.app!=='Dubai Dhikr Tracker'||!x.sessions||typeof x.sessions!=='object')throw Error('invalid');if(!confirm('আপনার বর্তমান রেকর্ড বদলে ব্যাকআপের রেকর্ড বসানো হবে। চালিয়ে যাবেন?'))return;const clean=cleanData(x);if(safeWrite(DATA_KEY,clean)){db=clean;screen='history';histOffset=0;render();toast('ব্যাকআপ সফলভাবে ফেরত এসেছে')}}catch(e){toast('ব্যাকআপ ফাইলটি সঠিক নয়')}}
document.addEventListener('click',e=>{const b=e.target.closest('[data-action]');if(!b||b.disabled)return;const a=b.dataset.action;
 if(a==='nav'){cancelFinish();screen=b.dataset.screen;focusId=null;openId=null;window.scrollTo(0,0);render()}
 else if(a==='prayer'){if(unlocked(b.dataset.prayer)){cancelFinish();prayer=b.dataset.prayer;screen='session';window.scrollTo(0,0);render()}}
 else if(a==='continue'){if(unlocked(b.dataset.prayer)){prayer=b.dataset.prayer;let first=firstUnfinished(prayer);if(first)openFocus(first);else{screen='session';render()}}}
 else if(a==='focus'){openFocus(b.dataset.id)}
 else if(a==='focus-close'){cancelFinish();focusId=null;screen='session';render();window.scrollTo(0,0)}
 else if(a==='focus-tab'){focusTab=b.dataset.tab;const read=document.getElementById('focus-reading');if(read){const offset=read.scrollTop;render();document.getElementById('focus-reading')?.scrollTo(0,Math.min(offset,80))}else render()}
 else if(a==='focus-next'){const next=nextUnfinished(prayer,focusId);if(next)openFocus(next);else{focusId=null;screen='session';render()}}
 else if(a==='finish-next'){finishGo()}
 else if(a==='adjust'){countChange(b.dataset.id,Number(b.dataset.delta))}
 else if(a==='refresh'){updateTimes()}
 else if(a==='history-offset'){histOffset=Math.min(0,Math.max(-3650,histOffset+Number(b.dataset.delta)));render()}
 else if(a==='export'){dlBackup()}
 else if(a==='import'){document.getElementById('restore-input').click()}
 else if(a==='clear'){if(confirm('সব রেকর্ড স্থায়ীভাবে মুছে ফেলবেন?')){if(safeWrite(DATA_KEY,{version:1,sessions:{}})){db={version:1,sessions:{}};render();toast('এই ডিভাইসের রেকর্ড মুছে ফেলা হয়েছে')}}}
 else if(a==='install'){if(deferredInstallPrompt){deferredInstallPrompt.prompt();deferredInstallPrompt=null}else{toast('iPhone: Safari → Share → Add to Home Screen')}}
});

document.getElementById('restore-input').addEventListener('change',e=>{const f=e.target.files[0];e.target.value='';importFile(f)});
currentDay=dayInfo().day;render();updateTimes();
setInterval(()=>{const day=dayInfo().day;if(day!==currentDay){currentDay=day;cancelFinish();screen='today';openId=null;focusId=null;histOffset=0;render();updateTimes()}else if(screen==='today'||screen==='session'){if(screen==='session'&&!unlocked(prayer))screen='today';render()}},15000);
if('serviceWorker' in navigator && (location.protocol==='https:'||location.hostname==='localhost'))navigator.serviceWorker.register('./sw.js').catch(()=>{});