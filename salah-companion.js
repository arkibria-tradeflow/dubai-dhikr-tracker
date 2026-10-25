(function installSalahCompanion(){
  "use strict";
  const D=window.SalahData;if(!D)return;
  let choice="Fajr",unit=0,step=0,origin="prayers",showBn=true,showMeaning=true;
  const oldTiles=expPrayerTiles,oldRender=render;
  expPrayerTiles=function(info,mode){
    return oldTiles(info,mode).replaceAll('data-action="prayer"','data-action="salah-tile"').replace(/\sdisabled aria-disabled="true"/g,"");
  };
  const conf=()=>D.prayers[choice],type=()=>conf().units[unit];
  const B=s=>esc(String(s||""));
  function begin(key){
    choice=D.prayers[key]?key:"Fajr";unit=0;step=0;screen="salah-overview";repaint();
  }
  function renderCard(key){
    const r=D.reads[key];if(!r)return "";
    return `<article class="salah-reading"><h3>${B(r[0])}</h3><div class="salah-arabic" lang="ar" dir="rtl">${B(r[1]).replace(/\n/g,"<br>")}</div>${showBn?`<div class="salah-translation"><small>বাংলা উচ্চারণ</small><p>${B(r[2])}</p></div>`:""}${showMeaning?`<div class="salah-translation"><small>বাংলা অর্থ</small><p>${B(r[3])}</p></div>`:""}</article>`;
  }
  function toggles(){
    return `<div class="salah-toggles"><button data-salah="bn" aria-pressed="${showBn}">${showBn?"✓ ":""}বাংলা উচ্চারণ</button><button data-salah="meaning" aria-pressed="${showMeaning}">${showMeaning?"✓ ":""}বাংলা অর্থ</button></div>`;
  }
  function header(sub){
    return `<header class="salah-head"><button data-salah="back" aria-label="ফিরে যান">←</button><div><strong>${B(conf().bn)} নামাজ</strong><small>${B(sub)}</small></div><span>☾</span></header>`;
  }
  function postures(which){
    const head='<circle cx="110" cy="34" r="14" fill="#E8C992"/>';
    const torso='<path d="M99 50 L92 121 L128 121 L121 50Z" fill="#EBDDC3"/>';
    const legs='<path d="M99 121 L99 171 M120 121 L120 171" stroke="#EBDDC3" stroke-width="12" stroke-linecap="round"/>';
    let body;
    if(which==="takbir")body=head+torso+legs+'<path d="M99 63 L81 45 L81 26 M121 63 L139 45 L139 26" stroke="#E8C992" stroke-width="9" fill="none" stroke-linecap="round"/>';
    else if(which==="standing")body=head+torso+legs+'<path d="M99 64 L97 90 L110 100 L123 90 L121 64" stroke="#E8C992" stroke-width="9" fill="none" stroke-linecap="round"/>';
    else if(which==="ruku")body='<circle cx="163" cy="82" r="14" fill="#E8C992"/><path d="M92 109 L148 90" stroke="#EBDDC3" stroke-width="27" stroke-linecap="round"/><path d="M92 108 L95 171 M112 108 L114 171" stroke="#EBDDC3" stroke-width="11" stroke-linecap="round"/><path d="M150 96 L137 131 L111 136" stroke="#E8C992" stroke-width="9" fill="none" stroke-linecap="round"/>';
    else if(which==="sujud")body='<circle cx="180" cy="154" r="13" fill="#E8C992"/><path d="M80 137 L118 101 L167 148" stroke="#EBDDC3" stroke-width="27" stroke-linecap="round" stroke-linejoin="round" fill="none"/><path d="M80 139 L60 168 L115 168 M170 148 L160 169" stroke="#E8C992" stroke-width="10" stroke-linecap="round" fill="none"/>';
    else body='<circle cx="110" cy="59" r="14" fill="#E8C992"/><path d="M102 76 L95 132 L126 132 L120 76Z" fill="#EBDDC3"/><path d="M95 131 L72 157 L129 166 M128 132 L145 158 L109 167" stroke="#EBDDC3" stroke-width="13" stroke-linecap="round" fill="none"/><path d="M100 87 L85 127 M121 87 L137 127" stroke="#E8C992" stroke-width="9" stroke-linecap="round"/>';
    return `<svg class="salah-figure" viewBox="0 0 220 190" role="img" aria-label="${which==="sujud"?"সিজদা":which==="ruku"?"রুকু":which==="sitting"?"বসা":"দাঁড়ানো"}"><rect x="18" y="173" width="184" height="8" rx="4" fill="#3D8066"/>${body}</svg>`;
  }
  function stages(){
    const n=type()[0],farz=type()[1]==="ফরজ",witr=type()[1].includes("বিতর"),st=[];
    const add=(r,label,pose,note,keys,count)=>st.push({r,label,pose,note,keys,count});
    for(let r=1;r<=n;r++){
      if(r===1)add(r,"নিয়ত ও তাকবির","takbir","মনে মনে নামাজের নিয়ত করুন। আল্লাহু আকবার বলে হাত বাঁধুন এবং সানা পড়ুন।",["takbir","sana"]);
      const q=["bismillah","fatiha"];
      if(r===1)q.unshift("auzu");
      if(!farz||r<=2)q.push("ikhlas");
      add(r,"কিয়াম ও কিরাত","standing",(farz&&r>2)?"ফরজ নামাজের শেষ দুই রাকাতে সূরা ফাতিহা পড়ুন।":"সূরা ফাতিহা পড়ে অন্য একটি সূরা পড়ুন। এখানে উদাহরণ হিসেবে ইখলাস দেওয়া হয়েছে।",q);
      if(witr&&r===3)add(r,"বিতরের দোয়া কুনুত","standing","কিরাত শেষে আল্লাহু আকবার বলে হাত তুলে আবার বাঁধুন। রুকুর আগে দোয়া কুনুত পড়ুন।",["takbir","qunut"]);
      add(r,"রুকু","ruku","আল্লাহু আকবার বলে রুকুতে গিয়ে তাসবিহ পড়ুন।",["ruku"],"৩ বার");
      add(r,"কওমা","standing","রুকু থেকে উঠে সম্পূর্ণ সোজা হয়ে দাঁড়ান।",["qawmah"]);
      add(r,"প্রথম সিজদা","sujud","আল্লাহু আকবার বলে প্রথম সিজদা করুন।",["sujud"],"৩ বার");
      add(r,"দুই সিজদার মাঝে বসা","sitting","স্থির হয়ে বসুন; এই দোয়াটি পড়তে পারেন।",["jalsa"]);
      add(r,"দ্বিতীয় সিজদা","sujud","আল্লাহু আকবার বলে দ্বিতীয় সিজদা করুন।",["sujud"],"৩ বার");
      if(r===2&&n>2)add(r,"প্রথম বৈঠক","sitting","আত্তাহিয়্যাতু পড়ে পরের রাকাতের জন্য দাঁড়ান। চার রাকাত গাইরে মুয়াক্কাদা সুন্নতের প্রথম বৈঠকের কিছু নিয়ম আলাদা—নিচের ফিকহ নোট দেখুন।",["tashahhud"]);
      if(r===n){
        add(r,"শেষ বৈঠক ও দোয়া","sitting","আত্তাহিয়্যাতু, দরুদে ইবরাহিম এবং দোয়া মাসুরা পড়ুন। দোয়া মাসুরা সুন্নত, না পড়লেও নামাজ শুদ্ধ হবে।",["tashahhud","durood","masura"]);
        add(r,"সালাম","sitting","ডানে ও বামে মুখ ঘুরিয়ে সালাম বলুন। এরপরই পরবর্তী নামাজ বা আগের জিকির স্ক্রিনে যাবেন।",["salam"]);
      }
    }
    return st;
  }
  function overview(){
    const locked=choice!=="Tahajjud"&&!unlocked(choice);
    return `<main class="salah-shell">${header("SALAH COMPANION · হানাফি নিয়ম")}<div class="salah-hero"><small>নামাজ শেখা ও প্রস্তুতি</small><h1>${B(conf().bn)} নামাজ</h1><p>নামাজের ভঙ্গি, পূর্ণ সূরা-দোয়া ও বাংলা উচ্চারণসহ ধাপে ধাপে শিখুন। সালামের পর আগের জিকির স্ক্রিনে যাবেন।</p></div><div class="salah-label">এই ওয়াক্তের রাকাতসমূহ</div><div class="salah-unit-list">${conf().units.map((u,i)=>`<button data-salah="unit" data-index="${i}" class="salah-unit ${i===unit?"selected":""}"><span class="salah-unit-num">${u[0]}</span><span><b>${u[0]} রাকাত ${B(u[1])}</b><small>${i===0?"প্রথমে":i===conf().units.length-1?"শেষে":"এরপর"} পড়ুন</small></span><span>›</span></button>`).join("")}</div><button class="salah-primary" data-salah="start">ভিজুয়াল নামাজ গাইড শুরু করুন <span>→</span></button><button class="salah-secondary" data-salah="library">সূরা ও দোয়া একসঙ্গে দেখুন <span>›</span></button><div class="salah-note">নামাজ চলাকালে ফোনে ট্যাপ করার প্রয়োজন নেই। গাইডটি আগে শিখতে ও অনুশীলন করতে ব্যবহার করুন।</div>${choice==="Tahajjud"?'<div class="salah-note">তাহাজ্জুদ সাধারণত দুই রাকাত করে পড়া যায়। চাইলে আবার একই গাইড অনুসরণ করুন।</div>':`<button class="salah-direct" data-salah="dhikr" ${locked?"disabled":""}>${locked?"নামাজের সময় হলে জিকির খুলবে":"আগের জিকির স্ক্রিন সরাসরি খুলুন ↗"}</button>`}</main>`;
  }
  function guide(){
    const all=stages(),s=all[Math.min(step,all.length-1)],last=step===all.length-1;
    return `<main class="salah-shell salah-guide">${header(type()[0]+" রাকাত "+type()[1])}<div class="salah-progress-label"><strong>${s.r}ম রাকাত · ${B(s.label)}</strong><span>${step+1}/${all.length}</span></div><div class="salah-meter"><span style="width:${(step+1)/all.length*100}%"></span></div><div class="salah-visual">${postures(s.pose)}<h2>${B(s.label)}</h2><p>${B(s.note)}</p>${s.count?`<span class="salah-repeat">${s.count}</span>`:""}</div>${toggles()}<div class="salah-reading-list">${s.keys.map(renderCard).join("")}</div><div class="salah-dock"><button data-salah="previous" class="salah-secondary" ${step===0?"disabled":""}>← আগে</button><button data-salah="${last?"finish":"next"}" class="salah-primary">${last?"সালাম শেষ ✓":"পরের ধাপ →"}</button></div><p class="salah-footnote">শুধু শেখার গাইড। শুদ্ধ উচ্চারণের জন্য ক্বারি/শিক্ষকের সহায়তা নিন।</p></main>`;
  }
  function library(){
    const keys=["takbir","sana","auzu","bismillah","fatiha","ikhlas","ruku","qawmah","sujud","jalsa","tashahhud","durood","masura","salam"];
    if(choice==="Isha")keys.splice(keys.indexOf("tashahhud"),0,"qunut");
    return `<main class="salah-shell">${header("সূরা ও দোয়া")}<div class="salah-hero"><small>RECITATION LIBRARY</small><h1>নামাজে যা পড়তে হয়</h1><p>যেকোনো দোয়া খুলে আরবি, উচ্চারণ ও অর্থ দেখুন।</p></div>${toggles()}<div class="salah-reading-list">${keys.map(k=>`<details class="salah-expander"><summary>${B(D.reads[k][0])}</summary>${renderCard(k)}</details>`).join("")}</div></main>`;
  }
  function repaint(){render();window.scrollTo(0,0);}
  render=function(){
    if(screen==="salah-overview"||screen==="salah-guide"||screen==="salah-library"){
      const root=document.getElementById("root");if(!root)return;
      document.body.classList.toggle("focus-mode",screen==="salah-guide");
      root.innerHTML=screen==="salah-overview"?overview():screen==="salah-guide"?guide():library();
      renderExperienceNav();
      const nav=document.querySelector(".nav");if(nav)nav.hidden=screen!=="salah-overview";
      if(screen==="salah-overview")document.querySelector('[data-screen="prayers"]')?.classList.add("active");
      return;
    }
    oldRender();
    if(screen==="night"){
      const root=document.getElementById("root");
      if(root&&!root.querySelector('[data-salah="night"]'))root.insertAdjacentHTML("beforeend",'<button class="salah-night-cta" data-salah="night">☾ তাহাজ্জুদ নামাজের ভিজুয়াল গাইড <span>→</span></button>');
    }
  };
  function dhikr(){
    if(choice==="Tahajjud"){screen="night";repaint();return;}
    prayer=choice;
    if(!unlocked(choice)){screen="salah-overview";repaint();toast("নামাজের সময় শুরু না হওয়া পর্যন্ত জিকির লক থাকবে।");return;}
    screen="session";repaint();
  }
  document.addEventListener("click",e=>{
    const btn=e.target.closest("[data-salah], [data-action='salah-tile'], [data-action='prayer']");
    if(!btn||btn.disabled)return;
    const action=btn.dataset.salah||"tile";
    e.preventDefault();e.stopImmediatePropagation();
    if(action==="tile"){origin=screen==="today"?"today":"prayers";begin(btn.dataset.prayer);}
    else if(action==="night"){origin="night";begin("Tahajjud");}
    else if(action==="back"){screen=screen==="salah-overview"?origin:"salah-overview";repaint();}
    else if(action==="unit"){unit=Number(btn.dataset.index);step=0;repaint();}
    else if(action==="start"){step=0;screen="salah-guide";repaint();}
    else if(action==="previous"){step=Math.max(0,step-1);repaint();}
    else if(action==="next"){step=Math.min(stages().length-1,step+1);repaint();}
    else if(action==="bn"){showBn=!showBn;render();}
    else if(action==="meaning"){showMeaning=!showMeaning;render();}
    else if(action==="library"){screen="salah-library";repaint();}
    else if(action==="dhikr"){dhikr();}
    else if(action==="finish"){
      if(unit<conf().units.length-1){unit++;screen="salah-overview";repaint();toast("সালাম শেষ। এবার পরবর্তী রাকাতসমষ্টি দেখুন।");}
      else dhikr();
    }
  },true);
  render();
})();
