'use strict';
/* Tahajjud module. Isolated local data does not modify legacy five-prayer records. */
const NIGHT_STORAGE='dhikr_dubai_tahajjud_v1';
const NIGHT_DUAS=[
 {id:'rizq-need',group:'rizq',title:'কল্যাণ ও জীবিকার জন্য',ref:'সুরা আল-কাসাস ২৮:২৪',url:'https://quran.com/28/24',pron:'রাব্বি ইন্নী লিমা আনযালতা ইলাইয়্যা মিন খাইরিন ফাকীর।',meaning:'হে আমার রব! আপনি আমার প্রতি যে কল্যাণই নাজিল করবেন, আমি তার মুখাপেক্ষী।'},
 {id:'rizq-halal',group:'rizq',title:'হালাল রিজিক ও ঋণমুক্তি',ref:'জামে আত-তিরমিজি ৩৫৬৩ (হাসান)',url:'https://sunnah.com/tirmidhi:3563',pron:'আল্লাহুম্মাকফিনী বিহালালিকা আন হারামিকা, ওয়া আগনিনী বিফাদলিকা আম্মান সিওয়াক।',meaning:'হে আল্লাহ! আপনার হালাল দিয়ে আমাকে হারাম থেকে বাঁচান এবং আপনার অনুগ্রহ দিয়ে অন্যের মুখাপেক্ষী হওয়া থেকে মুক্ত রাখুন।'},
 {id:'rizq-both',group:'rizq',title:'দুনিয়া ও আখিরাতের কল্যাণ',ref:'সুরা আল-বাকারা ২:২০১',url:'https://quran.com/2/201',pron:'রাব্বানা আতিনা ফিদ্দুনইয়া হাসানাতাওঁ ওয়াফিল আখিরাতি হাসানাতাওঁ ওয়াকিনা আযাবান নার।',meaning:'হে আমাদের রব! দুনিয়ায় কল্যাণ দিন, আখিরাতে কল্যাণ দিন এবং আগুনের শাস্তি থেকে রক্ষা করুন।'},
 {id:'work-knowledge',group:'work',title:'সঠিক জ্ঞান ও সিদ্ধান্তের জন্য',ref:'সুরা ত্বহা ২০:১১৪',url:'https://quran.com/20/114',pron:'রাব্বি যিদনী ইলমা।',meaning:'হে আমার রব! আমার জ্ঞান বাড়িয়ে দিন।'},
 {id:'work-personal',group:'work',title:'হালাল ব্যবসায় বরকতের ব্যক্তিগত দোয়া',ref:'নিজের ভাষায় সাধারণ দোয়া — কুরআনের আয়াত বা হাদিসের নির্দিষ্ট বাক্য নয়',url:'',pron:'হে আল্লাহ, আমার ব্যবসা ও কাজে সততা, ন্যায্যতা, হালাল রিজিক, উপকারী সিদ্ধান্ত এবং বরকত দিন। আমাকে কারও অধিকার নষ্ট করা থেকে রক্ষা করুন।',meaning:'নিজের প্রয়োজন অনুযায়ী বাংলাতেও আল্লাহর কাছে দোয়া করা যায়। এই বাংলা কথাগুলো কোনো নির্দিষ্ট সুন্নতি দোয়া নয়।'},
 {id:'family-calm',group:'family',title:'পরিবার ও দাম্পত্য শান্তি',ref:'সুরা আল-ফুরকান ২৫:৭৪',url:'https://quran.com/25/74',pron:'রাব্বানা হাবলানা মিন আযওয়াজিনা ওয়া যুররিয়্যাতিনা কুররাতা আ’ইউনিন ওয়াজআলনা লিলমুত্তাকীনা ইমামা।',meaning:'হে আমাদের রব! আমাদের জীবনসঙ্গী ও সন্তানদের আমাদের চোখের শীতলতা বানিয়ে দিন এবং আমাদের মুত্তাকিদের জন্য আদর্শ করুন।'},
 {id:'family-offspring',group:'family',title:'নেক সন্তান ও পরিবার',ref:'সুরা আলে ইমরান ৩:৩৮',url:'https://quran.com/3/38',pron:'রাব্বি হাব লী মিল্লাদুনকা যুররিয়্যাতান তাইয়্যিবাতান, ইন্নাকা সামীউদ্ দু‘আ।',meaning:'হে আমার রব! আপনার পক্ষ থেকে আমাকে উত্তম সন্তানসন্ততি দান করুন। নিশ্চয় আপনি দোয়া শুনেন।'},
 {id:'wellness-ayyub',group:'health',title:'কষ্ট ও অসুস্থতায় সাহায্য',ref:'সুরা আল-আম্বিয়া ২১:৮৩',url:'https://quran.com/21/83',pron:'রাব্বি আন্নী মাসসানিয়াদ দুররু ওয়া আনতা আরহামুর রাহিমীন।',meaning:'হে আমার রব! আমাকে কষ্ট স্পর্শ করেছে; আপনি দয়ালুদের মধ্যে সর্বাধিক দয়ালু।'},
 {id:'wellness-shifa',group:'health',title:'শিফা ও সুস্থতার দোয়া',ref:'সহিহ আল-বুখারি ৫৭৪৩',url:'https://sunnah.com/bukhari:5743',pron:'আল্লাহুম্মা রাব্বান নাস, আযহিবিল বা’সা, ইশফিহি ওয়া আনতাশ শাফী। লা শিফাআ ইল্লা শিফাউকা, শিফাআল্লা ইউগাদিরু সাকামা।',meaning:'হে আল্লাহ, মানুষের রব! কষ্ট দূর করুন, আরোগ্য দিন। আপনিই আরোগ্যদাতা; আপনার আরোগ্য ছাড়া কোনো আরোগ্য নেই। এমন আরোগ্য দিন যেন অসুস্থতা অবশিষ্ট না থাকে।'},
 {id:'remembrance',group:'dhikr',title:'ক্ষমা প্রার্থনা (ইস্তিগফার)',ref:'সুরা নূহ ৭১:১০ ও বহু হাদিসে ইস্তিগফারের উৎসাহ',url:'https://quran.com/71/10',pron:'আস্তাগফিরুল্লাহ।',meaning:'আমি আল্লাহর কাছে ক্ষমা চাই। ইচ্ছামতো বারবার পড়ুন; তাহাজ্জুদের জন্য এখানে কোনো নির্ধারিত সংখ্যা বাধ্যতামূলক নয়।'},
 {id:'remembrance-salat',group:'dhikr',title:'নবী ﷺ-এর ওপর দরুদ',ref:'সুরা আল-আহযাব ৩৩:৫৬',url:'https://quran.com/33/56',pron:'আল্লাহুম্মা সাল্লি আলা মুহাম্মাদ।',meaning:'হে আল্লাহ, মুহাম্মাদ ﷺ-এর প্রতি রহমত ও সম্মান বর্ষণ করুন।'},
];
const NIGHT_GROUPS=[
 {id:'rizq',icon:'◈',name:'অভাব, রিজিক ও ঋণ',note:'হালাল উপার্জন ও দুনিয়া-আখিরাতের কল্যাণ'},
 {id:'work',icon:'◇',name:'ব্যবসা ও কাজের উন্নতি',note:'সততা, সঠিক সিদ্ধান্ত ও বরকত'},
 {id:'family',icon:'♡',name:'পরিবার ও দাম্পত্য',note:'ভালোবাসা, শান্তি ও নেক সন্তান'},
 {id:'health',icon:'✚',name:'সুস্থতা ও আরোগ্য',note:'কষ্টে সাহায্য ও শিফা'},
 {id:'dhikr',icon:'☾',name:'জিকির ও ইস্তিগফার',note:'ক্ষমা ও আল্লাহর স্মরণ'}
];
const NIGHT_SURAHS=[
{id:'ikhlas',n:112,title:'সুরা আল-ইখলাস',ayat:4,pron:'বিসমিল্লাহির রাহমানির রাহীম।\n\nকুল হুওয়াল্লাহু আহাদ।\nআল্লাহুস সামাদ।\nলাম ইয়ালিদ ওয়ালাম ইউলাদ।\nওয়ালাম ইয়াকুল্লাহু কুফুওয়ান আহাদ।'},
{id:'falaq',n:113,title:'সুরা আল-ফালাক',ayat:5,pron:'বিসমিল্লাহির রাহমানির রাহীম।\n\nকুল আউযু বিরাব্বিল ফালাক।\nমিন শাররি মা খালাক।\nওয়া মিন শাররি গাসিকিন ইযা ওয়াকাব।\nওয়া মিন শাররিন নাফ্ফাছাতি ফিল উকাদ।\nওয়া মিন শাররি হাসিদিন ইযা হাসাদ।'},
{id:'nas',n:114,title:'সুরা আন-নাস',ayat:6,pron:'বিসমিল্লাহির রাহমানির রাহীম।\n\nকুল আউযু বিরাব্বিন নাস।\nমালিকিন নাস।\nইলাহিন নাস।\nমিন শাররিল ওয়াসওয়াসিল খান্নাস।\nআল্লাযী ইউওয়াসউইসু ফী সুদূরিন নাস।\nমিনাল জিন্নাতি ওয়ান নাস।'},
{id:'kawthar',n:108,title:'সুরা আল-কাউসার',ayat:3,pron:'বিসমিল্লাহির রাহমানির রাহীম।\n\nইন্না আ‘তাইনা কাল-কাউসার।\nফাসাল্লি লিরাব্বিকা ওয়ানহার।\nইন্না শানিআকা হুওয়াল আবতার।'},
{id:'asr',n:103,title:'সুরা আল-আসর',ayat:3,pron:'বিসমিল্লাহির রাহমানির রাহীম।\n\nওয়াল আসর।\nইন্নাল ইনসানা লাফী খুসর।\nইল্লাল্লাযীনা আমানূ ওয়া আমিলুস সালিহাতি, ওয়া তাওয়াসাও বিল হাক্কি, ওয়া তাওয়াসাও বিস সাবর।'},
{id:'nasr',n:110,title:'সুরা আন-নাসর',ayat:3,pron:'বিসমিল্লাহির রাহমানির রাহীম।\n\nইযা জা-আ নাসরুল্লাহি ওয়াল ফাতহ।\nওয়া রাআইতান নাসা ইয়াদখুলূনা ফী দীনিল্লাহি আফওয়াজা।\nফাসাব্বিহ বিহামদি রাব্বিকা ওয়াস্তাগফিরহু, ইন্নাহু কানা তাওয়াবা।'},
{id:'kafirun',n:109,title:'সুরা আল-কাফিরুন',ayat:6,pron:'বিসমিল্লাহির রাহমানির রাহীম।\n\nকুল ইয়া আইয়ুহাল কাফিরূন।\nলা আ‘বুদু মা তা‘বুদূন।\nওয়ালা আনতুম আবিদূনা মা আ‘বুদ।\nওয়ালা আনা আবিদুম মা আবাদতুম।\nওয়ালা আনতুম আবিদূনা মা আ‘বুদ।\nলাকুম দীনুকুম ওয়ালিয়া দীন।'},
{id:'quraysh',n:106,title:'সুরা কুরাইশ',ayat:4,pron:'বিসমিল্লাহির রাহমানির রাহীম।\n\nলি-ঈলাফি কুরাইশ।\nঈলাফিহিম রিহলাতাশ শিতাই ওয়াস সাইফ।\nফালইয়া‘বুদূ রাব্বা হাযাল বাইত।\nআল্লাযী আত‘আমাহুম মিন জূ‘ইঁ ওয়া আমানাহুম মিন খাওফ।'},
{id:'fil',n:105,title:'সুরা আল-ফিল',ayat:5,pron:'বিসমিল্লাহির রাহমানির রাহীম।\n\nআলাম তারা কাইফা ফা‘আলা রাব্বুকা বিআসহাবিল ফীল।\nআলাম ইয়াজ‘আল কাইদাহুম ফী তাদলীল।\nওয়া আরসালা আলাইহিম তাইরান আবাবীল।\nতারমীহিম বিহিজারাতিম মিন সিজ্জীল।\nফাজা‘আলাহুম কা‘আসফিম মা‘কূল।'},
{id:'maun',n:107,title:'সুরা আল-মাউন',ayat:7,pron:'বিসমিল্লাহির রাহমানির রাহীম।\n\nআরাআইতাল্লাযী ইউকাযযিবু বিদ্দীন।\nফাযালিকাল্লাযী ইয়াদুউল ইয়াতীম।\nওয়ালা ইয়াহুদ্দু আলা তা‘আমিল মিসকীন।\nফাওয়াইলুল লিল মুসাল্লীন।\nআল্লাযীনা হুম আন সালাতিহিম সাহূন।\nআল্লাযীনা হুম ইউরাঊন।\nওয়া ইয়ামনা‘ঊনাল মা‘ঊন।'}
];
function nClean(raw){const data={nights:{}};if(!raw||typeof raw!=='object')return data;
 for(const [day,s] of Object.entries(raw.nights||{}).slice(0,2000)){
 if(!/^\d{4}-\d\d-\d\d$/.test(day)||!s||typeof s!=='object')continue;
 const validSet=(v,arr)=>Array.isArray(v)?[...new Set(v.filter(x=>arr.some(a=>a.id===x)))]:[];
 data.nights[day]={rakaat:Math.min(40,Math.max(0,(Number(s.rakaat)||0)&~1)),witr:!!s.witr,duas:validSet(s.duas,NIGHT_DUAS),surahs:validSet(s.surahs,NIGHT_SURAHS),updatedAt:typeof s.updatedAt==='string'?s.updatedAt:null};
 }
 return data;
}
let nightDb=nClean(safeRead(NIGHT_STORAGE,{nights:{}}));
let nightTab='steps',nightReadType=null,nightReadId=null,nightReadOrigin='duas',nightNotice=false;
function nightSave(){safeWrite(NIGHT_STORAGE,nightDb)}
function shiftDate(date,n){const [y,m,d]=date.split('-').map(Number);return new Date(Date.UTC(y,m-1,d+n)).toISOString().slice(0,10)}
function nightWindow(){const p=dayInfo(),today=p.day, t=p.tm,nightAfterIsha=validTimes(t)&&p.now>=minutes(t.Isha),beforeFajr=validTimes(t)&&p.now<minutes(t.Fajr);
 const active=nightAfterIsha||beforeFajr;const date=beforeFajr?shiftDate(today,-1):today;const start=times[date]||null;const end=times[shiftDate(date,1)]||null;
 let lastThird=null;const sunset=minutes(start?.Maghrib),fajr=minutes(end?.Fajr);
 if(Number.isFinite(sunset)&&Number.isFinite(fajr)&&fajr>=0){let m=sunset+(1440+fajr-sunset)*2/3;lastThird=`${pad(Math.floor(m/60)%24)}:${pad(Math.floor(m)%60)}`}
 return {active,date,lastThird,nextFajr:beforeFajr?t?.Fajr:end?.Fajr,isha:start?.Isha,source:start?.source||t?.source||null};
}
function nightRecord(date){return nightDb.nights[date]||{rakaat:0,witr:false,duas:[],surahs:[],updatedAt:null}}
function nightMutate(fn){const w=nightWindow();if(!w.active){toast('তাহাজ্জুদের রেকর্ড এশার পর থেকে ফজরের আগে খোলা থাকবে');return false}let rec=nightDb.nights[w.date];if(!rec)rec=nightDb.nights[w.date]={rakaat:0,witr:false,duas:[],surahs:[]};fn(rec);rec.updatedAt=new Date().toISOString();nightSave();return true}
function nReaderParagraphs(s){return String(s||'').split(/\n+/).map(p=>p.trim()).filter(Boolean).map(p=>`<p>${esc(p)}</p>`).join('')}
function nSectionTabs(){return `<div class="nt-tabs" role="tablist" aria-label="তাহাজ্জুদ বিভাগ">${[['steps','নামাজ'],['duas','দোয়া ও আমল'],['surahs','১০টি সুরা']].map(([id,label])=>`<button role="tab" class="${nightTab===id?'on':''}" aria-selected="${nightTab===id}" data-night="tab" data-tab="${id}">${label}</button>`).join('')}</div>`}
function renderNight(){const w=nightWindow(),record=nightRecord(w.date);
 const status=w.active?'এখন পড়ার সময়':'এখন নামাজের সময় নয়';
 const timing=w.lastThird?`রাতের শেষ এক-তৃতীয়াংশ শুরু ≈ ${showTime(w.lastThird)}`:'পরের ফজরের সময় পাওয়া গেলে শেষ এক-তৃতীয়াংশ দেখাবে';
 const top=`<div class="nt-top"><span class="nt-kicker">NIGHT WORSHIP · DUBAI</span><h1>তাহাজ্জুদ <em>ও রাতের দোয়া</em></h1><p>আল্লাহর কাছে চাওয়ার একটি নীরব সময়। শান্তভাবে নামাজ, দোয়া ও তিলাওয়াত করুন।</p><div class="nt-state ${w.active?'live':'locked'}"><span>${w.active?'●':'◌'} ${status}</span><strong>${w.active?'ফজর পর্যন্ত':'এশার পর খুলবে'}</strong></div><div class="nt-time"><span>${esc(timing)}</span><small>দুবাই সময় · গণনাভিত্তিক, আনুমানিক</small></div></div>`;
 let body='';
 if(nightTab==='steps'){
 body=`<div class="nt-panel"><div class="nt-eyebrow">YOUR NIGHT PRACTICE</div><h2>২ রাকাত করে শুরু করুন</h2><p>এশার পর থেকে ফজরের আগে রাতের নফল নামাজ পড়া যায়। ঘুম থেকে উঠে পড়াকে সাধারণত তাহাজ্জুদ বলা হয়। শেষ তৃতীয়াংশ বিশেষ ফজিলতপূর্ণ, কিন্তু সেটাই একমাত্র সময় নয়।</p><div class="nt-rakaat"><div><small>এই রাতে আদায় করেছেন</small><strong>${bn(record.rakaat)} <span>রাকাত</span></strong></div><span class="nt-halfmoon">☾</span></div><button class="nt-primary" data-night="rakaat" ${w.active?'':'disabled'}><span>＋ ২ রাকাত পড়েছি</span><span>→</span></button><button class="nt-secondary" data-night="rakaat-minus" ${w.active&&record.rakaat>0?'':'disabled'}>− ভুল হলে ২ রাকাত কমান</button><div class="nt-witr"><div><b>বিতর পড়েছেন?</b><small>বিতর আগে পড়ে থাকলে একই রাতে আবার পড়বেন না।</small></div><button data-night="witr" class="${record.witr?'yes':''}" ${w.active?'':'disabled'} aria-pressed="${record.witr}">${record.witr?'✓ হ্যাঁ':'চিহ্নিত করুন'}</button></div></div>
 <div class="nt-heading">সহজ নামাজের ধাপ</div><div class="nt-guides">${[
 ['১','ইচ্ছা ও প্রস্তুতি','নিয়ত মনে করুন, অজু করুন; রাতের ইবাদতে মন দিন।'],
 ['২','২ রাকাত নামাজ','প্রতি রাকাতে সুরা ফাতিহা ও আরেকটি সুরা আরবিতে তিলাওয়াত করুন; প্রতি ২ রাকাত শেষে সালাম ফেরান।'],
 ['৩','আন্তরিক দোয়া','সিজদায়, সালাম ফেরানোর পর ও রাতের শেষ ভাগে আপনার প্রয়োজন আল্লাহর কাছে বলুন।'],
 ['৪','বিতর মনে রাখুন','বিতর বাকি থাকলে আপনার অনুসৃত মাযহাবের নিয়মে আদায় করুন। আগে আদায় করলে আবার বিতর নয়।']
 ].map(([no,t,desc])=>`<div class="nt-guide"><span>${no}</span><div><b>${t}</b><p>${desc}</p></div></div>`).join('')}</div><div class="nt-disclaimer">এখানে ২ রাকাতের গণনা শুধু ব্যক্তিগত রেকর্ড; বাধ্যতামূলক লক্ষ্য নয়। ঘুম থেকে উঠে পড়াকে সাধারণত তাহাজ্জুদ বলা হয়; এশার পর ঘুম ছাড়া পড়া নফল নামাজ কিয়ামুল লাইল।</div><button class="nt-linkrow" data-night="tab" data-tab="duas">দোয়া ও আমল পড়ুন <span>→</span></button>`;
 }else if(nightTab==='duas'){
 body=`<div class="nt-heading">যে বিষয়ে দোয়া করতে চান</div><div class="nt-lead">সব দোয়া এক রাতে পড়া জরুরি নয়। আপনার প্রয়োজন অনুযায়ী বেছে নিন।</div>${NIGHT_GROUPS.map(g=>{const items=NIGHT_DUAS.filter(d=>d.group===g.id);return `<div class="nt-group"><div class="nt-group-title"><span>${g.icon}</span><div><h3>${g.name}</h3><small>${g.note}</small></div></div>${items.map(d=>`<button class="nt-item" data-night="open" data-type="dua" data-id="${d.id}"><span class="nt-check ${record.duas.includes(d.id)?'done':''}">${record.duas.includes(d.id)?'✓':'✦'}</span><span class="nt-item-name">${d.title}<small>${esc(d.ref)}</small></span><span class="nt-arrow">↗</span></button>`).join('')}</div>`}).join('')}`;
 }else{
 body=`<div class="nt-heading">১০টি ছোট সুরা</div><div class="nt-lead">সুরা ফাতিহা ছাড়া ১০টি সুরার <b>শুধু বাংলা উচ্চারণ</b>। পড়ার সময় বড় করে দেখতে সুরায় ট্যাপ করুন।</div><div class="nt-disclaimer">মনে রাখবেন: বাংলা উচ্চারণ শেখার সহায়ক মাত্র। নামাজে কুরআন আরবিতে তিলাওয়াত করতে হয়। সঠিক উচ্চারণ শিখতে বিশ্বস্ত কারির তিলাওয়াত অনুসরণ করুন।</div>${NIGHT_SURAHS.map((s,i)=>`<button class="nt-surah" data-night="open" data-type="surah" data-id="${s.id}"><span class="nt-surah-number">${String(i+1).padStart(2,'0')}</span><span class="nt-item-name">${s.title}<small>${bn(s.ayat)} আয়াত · সুরা ${bn(s.n)}</small></span><span class="nt-read-status">${record.surahs.includes(s.id)?'✓ পড়া':'পড়ুন ↗'}</span></button>`).join('')}`;
 }
 return `<div class="nt-page">${top}${nSectionTabs()}${body}<div class="nt-source-note">উৎস: <a href="https://sunnah.com/bukhari:990" target="_blank" rel="noopener noreferrer">রাতের নামাজ</a> · <a href="https://sunnah.com/bukhari:1145" target="_blank" rel="noopener noreferrer">শেষ তৃতীয়াংশ</a> · <a href="https://sunnah.com/abudawud:1439" target="_blank" rel="noopener noreferrer">এক রাতে এক বিতর</a><br>রেকর্ড শুধু এই আইফোনে সংরক্ষিত হয়।</div></div>`;
}
function renderNightReader(){const isSurah=nightReadType==='surah',a=(isSurah?NIGHT_SURAHS:NIGHT_DUAS).find(x=>x.id===nightReadId);if(!a){screen='night';return renderNight()};const w=nightWindow(),r=nightRecord(w.date),read=isSurah?r.surahs.includes(a.id):r.duas.includes(a.id);
 return `<div class="nt-fullscreen ${readingSize==='large'?'nt-large':''}"><header class="nt-reader-head"><button data-night="close" aria-label="পেছনে যান">✕</button><div><small>${isSurah?'SURAHS · BENGALI ONLY':'SUPPLICATION · BANGLA'}</small><strong>${a.title}</strong></div><button data-night="font" aria-label="হরফ বড় করুন">A${readingSize==='large'?'−':'+'}</button></header><div class="nt-reading-scroll" id="night-scroll"><div class="nt-reader-inner"><div class="nt-reading-ornament">☾</div><span class="nt-kicker">${isSurah?`${bn(a.ayat)} আয়াত · সুরা ${bn(a.n)}`:esc(a.ref)}</span><h1>${a.title}</h1><div class="nt-reading-card" lang="bn"><span class="nt-card-label">${isSurah?'বাংলা উচ্চারণ':'পড়ার উচ্চারণ'}</span>${nReaderParagraphs(a.pron)}</div>${!isSurah?`<div class="nt-meaning"><span>বাংলা অর্থ</span><p>${esc(a.meaning)}</p></div>${a.url?`<a class="nt-ref" href="${a.url}" target="_blank" rel="noopener noreferrer">মূল উৎস দেখুন ↗</a>`:''}`:''}${isSurah?'<p class="nt-reader-caution">এটি আরবি তিলাওয়াতের বিকল্প নয়। সঠিক উচ্চারণ শিখে আরবিতেই পড়ুন।</p>':''}</div></div><div class="nt-reader-dock"><div><span>${w.active?'আজ রাতের রেকর্ড':'এই সময় শুধু পড়ার জন্য খোলা'}</span><strong>${read?'✓ পড়া হয়েছে':'নিজের গতিতে পড়ুন'}</strong></div><button class="nt-big-action" data-night="mark" ${w.active?'':'disabled'}>${read?'✓ সম্পন্ন — আবার ট্যাপ করে বাদ দিন':'✓ পড়া হয়েছে'}</button><button class="nt-return" data-night="close">তালিকায় ফিরে যান ↑</button></div></div>`;
}
// Adapt existing navigation, home and history without changing the five-prayer counting format.
const nOriginalRender=render,nOriginalNav=renderNav,nOriginalToday=renderToday,nOriginalHistory=renderHistory;
render=function(){if(screen==='night'||screen==='night-reader'){
 const root=document.getElementById('root');const readingScroll=screen==='night-reader'?document.getElementById('night-scroll')?.scrollTop:null;
 document.body.classList.toggle('focus-mode',screen==='night-reader');root.innerHTML=screen==='night-reader'?renderNightReader():renderNight();renderNav();
 if(readingScroll!=null){const el=document.getElementById('night-scroll');if(el)el.scrollTop=readingScroll}
 return;
 }return nOriginalRender();};
renderNav=function(){if(screen==='night-reader')return;
 const html=[['today','home','আজ'],['night','moon','তাহাজ্জুদ'],['history','chart','রেকর্ড'],['settings','settings','সেটিংস']].map(([v,ic,label])=>`<button class="nav-btn ${screen===v||(v==='today'&&(screen==='session'||screen==='focus'))?'active':''}" data-action="nav" data-screen="${v}" aria-label="${label}">${ic==='moon'?'<span class="nt-nav-moon">☾</span>':icon(ic)}<span>${label}</span></button>`).join('');document.getElementById('nav').innerHTML=html;
};
renderToday=function(){const base=nOriginalToday(),w=nightWindow(),r=nightRecord(w.date),d=w.lastThird?`শেষ তৃতীয়াংশ: ${showTime(w.lastThird)}`:'শেষ তৃতীয়াংশ: সময়সূচি লোড হচ্ছে';
 return base+`<section class="nt-home-card"><div class="nt-home-glow"></div><div class="nt-home-top"><span>✦ NIGHT PRAYER</span><span class="nt-home-status">${w.active?'● এখন খোলা':'◌ রাতের ইবাদত'}</span></div><div class="nt-home-moon">☾</div><h2>তাহাজ্জুদ<br><em>আল্লাহর কাছে চান</em></h2><p>হালাল রিজিক, ব্যবসা, পরিবার, দাম্পত্য শান্তি ও সুস্থতার জন্য দোয়া।</p><div class="nt-home-details"><span>${esc(d)}</span><span>${bn(r.rakaat)} রাকাত রেকর্ড</span></div><button data-action="nav" data-screen="night">${w.active?'রাতের ইবাদত শুরু করুন':'দোয়া ও সুরা দেখুন'} <span>↗</span></button></section>`;
};
renderHistory=function(){const r=nOriginalHistory();const day=getHistDate();let nights=nightDb.nights[day]||null;const a=nights?`${bn(nights.rakaat)} রাকাত · ${bn(nights.duas.length)} দোয়া · ${bn(nights.surahs.length)} সুরা`:'কোনো রেকর্ড নেই';
 return r+`<div class="nt-history-card"><span class="nt-kicker">TAHAJJUD HISTORY</span><h3>রাতের ইবাদতের রেকর্ড</h3><p>${esc(banglaDate(day))}</p><strong>${a}</strong><small>মধ্যরাতের পরের আমল আগের রাতের তারিখে সংরক্ষিত হয়।</small></div>`;
};
const nOldBackup=dlBackup;
dlBackup=function(){const payload={app:'Dubai Dhikr Tracker',version:2,exportedAt:new Date().toISOString(),timezone:TZ,sessions:db.sessions,tahajjud:nightDb};const blob=new Blob([JSON.stringify(payload,null,2)],{type:'application/json'}),url=URL.createObjectURL(blob),link=document.createElement('a');link.href=url;link.download=`dhikr-dubai-backup-${dayInfo().day}.json`;document.body.appendChild(link);link.click();link.remove();setTimeout(()=>URL.revokeObjectURL(url),5000);toast('নামাজ ও তাহাজ্জুদের ব্যাকআপ প্রস্তুত')};
importFile=async function(f){if(!f||f.size>6_000_000){toast('সঠিক JSON ফাইল নির্বাচন করুন');return}try{const x=JSON.parse(await f.text());if(x?.app!=='Dubai Dhikr Tracker'||!x.sessions||typeof x.sessions!=='object')throw Error('invalid');if(!confirm('আপনার বর্তমান রেকর্ড বদলে ব্যাকআপের রেকর্ড বসানো হবে। চালিয়ে যাবেন?'))return;const clean=cleanData(x);if(!safeWrite(DATA_KEY,clean))return;db=clean;if(x.tahajjud){nightDb=nClean(x.tahajjud);nightSave()}screen='history';histOffset=0;render();toast('ব্যাকআপ সফলভাবে ফেরত এসেছে')}catch(e){toast('ব্যাকআপ ফাইলটি সঠিক নয়')}};
// Interactions are isolated to data-night elements so legacy handlers are unaffected.
document.addEventListener('click',e=>{const b=e.target.closest('[data-night]');if(!b||b.disabled)return;const a=b.dataset.night;
 if(a==='tab'){nightTab=b.dataset.tab;render();window.scrollTo(0,0)}
 else if(a==='rakaat'){if(nightMutate(r=>{r.rakaat=Math.min(40,r.rakaat+2)})){render();toast('২ রাকাত রেকর্ড হয়েছে')}}
 else if(a==='rakaat-minus'){if(nightMutate(r=>{r.rakaat=Math.max(0,r.rakaat-2)}))render()}
 else if(a==='witr'){if(nightMutate(r=>{r.witr=!r.witr}))render()}
 else if(a==='open'){nightReadType=b.dataset.type;nightReadId=b.dataset.id;nightReadOrigin=nightTab;screen='night-reader';render();window.scrollTo(0,0)}
 else if(a==='close'){screen='night';nightTab=nightReadOrigin;render();window.scrollTo(0,0)}
 else if(a==='font'){readingSize=readingSize==='normal'?'large':'normal';safeWrite('dhikr_dubai_reading_size_v3',readingSize);render()}
 else if(a==='mark'){const id=nightReadId,type=nightReadType,key=type==='surah'?'surahs':'duas';if(nightMutate(rec=>{const set=new Set(rec[key]);if(set.has(id))set.delete(id);else set.add(id);rec[key]=[...set]})){render();toast('আলহামদুলিল্লাহ! রেকর্ড সেভ হয়েছে')}}
});
// Night module loads after the original script; refresh its navigation and home presentation.
render();