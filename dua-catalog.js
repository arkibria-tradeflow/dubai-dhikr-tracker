/* Dua Library Phase 1: taxonomy and editorial metadata.
 * Data-only foundation for future browsing screens. Keeps all existing IDs,
 * pronunciation, meaning, sources and personal reading history unchanged.
 * Legacy records remain visible but are NOT labelled source-verified.
 */
(function installDuaCatalog(){
  'use strict';
  const definitions=[
    ['daily-life','দৈনন্দিন জীবন','Daily life','ঘুম, খাবার, পোশাক, ঘরের কাজ',['ঘুম','খাবার','পোশাক','বাড়িতে প্রবেশ','বাড়ি থেকে বের হওয়া']],
    ['morning-evening','সকাল ও সন্ধ্যার আমল','Morning and evening','সকাল ও সন্ধ্যার দোয়া ও যিকির',['সকাল','সন্ধ্যা','দিনের শুরু','দিনের শেষ']],
    ['salah-worship','নামাজ ও ইবাদত','Salah and worship','সালাত ও অন্যান্য ইবাদতের সঙ্গে সম্পর্কিত দোয়া',['নামাজ','সিজদা','ইবাদত','দরুদ']],
    ['repentance-forgiveness','ক্ষমা ও তওবা','Repentance and forgiveness','ক্ষমা, তওবা ও আত্মশুদ্ধি',['ইস্তিগফার','ক্ষমা','তওবা','আত্মশুদ্ধি']],
    ['faith-guidance','ঈমান ও হেদায়েত','Faith and guidance','সঠিক পথে থাকা ও ঈমানের দৃঢ়তা',['ঈমান','হেদায়েত','অটল থাকা','হৃদয়']],
    ['gratitude-praise','শোকর ও প্রশংসা','Gratitude and praise','আল্লাহর প্রশংসা, শোকর ও সন্তুষ্টি',['শুকরিয়া','হামদ','কৃতজ্ঞতা','প্রশংসা']],
    ['livelihood-debt','রিজিক ও ঋণমুক্তি','Livelihood and debt','হালাল উপার্জন, অভাব ও ঋণ',['রিজিক','আয়','ঋণ','দারিদ্র্য','হালাল']],
    ['work-decisions','কাজ ও সিদ্ধান্ত','Work and decisions','কাজ, সততা, দায়িত্ব ও সিদ্ধান্ত',['চাকরি','ব্যবসা','ইস্তিখারা','সিদ্ধান্ত','দায়িত্ব']],
    ['knowledge-learning','শিক্ষা ও জ্ঞান','Education and knowledge','জ্ঞান, শিক্ষা ও বোঝার সক্ষমতা',['পড়াশোনা','পরীক্ষা','জ্ঞান','শেখা']],
    ['marriage-spouses','বিবাহ ও দাম্পত্য','Marriage and spouses','বিবাহ ও জীবনসঙ্গীদের জন্য দোয়া',['বিবাহ','স্বামী','স্ত্রী','দাম্পত্য','সম্প্রীতি']],
    ['family-children','পরিবার ও সন্তান','Family and children','মা-বাবা, পরিবার ও সন্তান',['সন্তান','মা-বাবা','পরিবার','আত্মীয়']],
    ['health-healing','স্বাস্থ্য ও আরোগ্য','Health and healing','অসুস্থতা, ব্যথা ও আরোগ্য',['অসুস্থতা','শিফা','রোগ','সুস্থতা']],
    ['anxiety-peace','দুশ্চিন্তা ও প্রশান্তি','Worry and peace','দুশ্চিন্তা, ভয়, দুঃখ ও প্রশান্তি',['উদ্বেগ','মানসিক শান্তি','দুঃখ','ভয়']],
    ['safety-protection','বিপদ ও নিরাপত্তা','Safety and protection','বিপদ-আপদ ও সুরক্ষার প্রার্থনা',['বিপদ','সুরক্ষা','নিরাপত্তা','আশ্রয়']],
    ['travel','সফর ও যাতায়াত','Travel and journeys','সফর, যাত্রা ও ফিরে আসা',['সফর','ভ্রমণ','যাত্রা','বাড়ি ফেরা']],
    ['character-relationships','উত্তম চরিত্র ও সম্পর্ক','Character and relationships','ভালো ব্যবহার, ন্যায় ও পারস্পরিক সম্পর্ক',['চরিত্র','সততা','ন্যায়','সম্পর্ক']],
    ['patience-trials','ধৈর্য ও কঠিন সময়','Patience in trials','পরীক্ষা, কষ্ট, ক্ষতি ও ধৈর্য',['ধৈর্য','কঠিন সময়','পরীক্ষা','কষ্ট']],
    ['ramadan-fasting','রমজান ও রোজা','Ramadan and fasting','রোজা ও রমজানের আমল',['রমজান','রোজা','ইফতার','সেহরি']],
    ['hajj-umrah','হজ ও উমরাহ','Hajj and Umrah','হজ ও উমরাহর প্রাসঙ্গিক দোয়া',['হজ','উমরাহ','তাওয়াফ','আরাফাত']],
    ['death-hereafter','মৃত্যু ও আখিরাত','Death and Hereafter','আখিরাত, জান্নাত ও মৃতদের জন্য দোয়া',['মৃত্যু','আখিরাত','জান্নাত','জাহান্নাম','মৃত ব্যক্তি']]
  ];
  const categories=Object.freeze(definitions.map(([id,name,en,description,subtopics])=>
    Object.freeze({id,name,en,description,subtopics:Object.freeze(subtopics.slice())})));
  const categoryById=new Map(categories.map(x=>[x.id,x]));
  const kinds=Object.freeze(['quran','hadith','dhikr','personal']);
  const reviewStatuses=Object.freeze(['draft','pending_review','verified','published','needs_correction']);

  /* Additional topics are indexed against the existing 11 stable legacy IDs.
     No Arabic is generated from transliteration. Legacy attribution and
     grading remain source claims pending an independent editorial check. */
  const descriptions={
    'rizq-need':{
      primary:'livelihood-debt',secondary:['patience-trials','faith-guidance'],
      kind:'quran',citationScope:'excerpt',
      tags:['কল্যাণ','জীবিকা','অভাব','প্রয়োজন','দোয়া','কষ্ট','খাইর']
    },
    'rizq-halal':{
      primary:'livelihood-debt',secondary:['work-decisions'],
      kind:'hadith',citationScope:'supplication',
      tags:['ঋণ','ঋণমুক্তি','উপার্জন','হালাল','হারাম','স্বনির্ভরতা','চাকরি']
    },
    'rizq-both':{
      primary:'death-hereafter',secondary:['livelihood-debt','faith-guidance'],
      kind:'quran',citationScope:'excerpt',
      tags:['দুনিয়া','আখিরাত','দুনিয়ার কল্যাণ','পরকাল','জাহান্নাম','সুরক্ষা']
    },
    'work-knowledge':{
      primary:'knowledge-learning',secondary:['work-decisions'],
      kind:'quran',citationScope:'excerpt',
      tags:['জ্ঞান','পড়াশোনা','পরীক্ষা','শিক্ষা','সিদ্ধান্ত','বোঝা']
    },
    'work-personal':{
      primary:'work-decisions',secondary:['livelihood-debt','character-relationships'],
      kind:'personal',citationScope:'personal_wording',
      tags:['ব্যবসা','বরকত','হালাল','সততা','ন্যায্যতা','কাজ','দায়িত্ব']
    },
    'family-calm':{
      primary:'marriage-spouses',secondary:['family-children','anxiety-peace'],
      kind:'quran',citationScope:'excerpt',
      tags:['বিবাহ','দাম্পত্য','পরিবার','সন্তান','শান্তি','স্বামী','স্ত্রী']
    },
    'family-offspring':{
      primary:'family-children',secondary:['marriage-spouses'],
      kind:'quran',citationScope:'excerpt',
      tags:['সন্তান','পরিবার','নেক সন্তান','গর্ভধারণ','সন্তানসন্ততি']
    },
    'wellness-ayyub':{
      primary:'health-healing',secondary:['patience-trials','anxiety-peace'],
      kind:'quran',citationScope:'excerpt',
      tags:['রোগ','অসুস্থতা','ব্যথা','কষ্ট','ধৈর্য','আরোগ্য']
    },
    'wellness-shifa':{
      primary:'health-healing',secondary:['anxiety-peace'],
      kind:'hadith',citationScope:'supplication',
      tags:['শিফা','সুস্থতা','রোগমুক্তি','অসুস্থতা','আরোগ্য','দোয়া']
    },
    'remembrance':{
      primary:'repentance-forgiveness',secondary:['salah-worship','daily-life'],
      kind:'dhikr',citationScope:'general_encouragement',
      tags:['ইস্তিগফার','ক্ষমা','তওবা','জিকির','যিকির','আত্মশুদ্ধি']
    },
    'remembrance-salat':{
      primary:'salah-worship',secondary:['gratitude-praise','faith-guidance'],
      kind:'dhikr',citationScope:'general_encouragement',
      tags:['দরুদ','সালাওয়াত','নবী','সালাত','যিকির','জিকির']
    }
  };
  const normalized=value=>String(value||'').normalize('NFKC').toLocaleLowerCase('bn')
    .replace(/[০-৯]/g,d=>String('০১২৩৪৫৬৭৮৯'.indexOf(d)))
    .replace(/[^\p{L}\p{N}]+/gu,' ').replace(/\s+/g,' ').trim();
  const legacy=typeof NIGHT_DUAS!=='undefined'?NIGHT_DUAS:[];
  const entries=Object.freeze(legacy.map(original=>{
    const meta=descriptions[original.id];
    if(!meta)throw Error('Missing Dua metadata: '+original.id);
    const primary=categoryById.get(meta.primary);
    if(!primary||meta.secondary.some(x=>!categoryById.has(x)))
      throw Error('Invalid Dua category for '+original.id);
    const tags=Object.freeze(meta.tags.slice());
    const categoriesFor=Object.freeze([meta.primary,...meta.secondary]);
    return Object.freeze({
      id:original.id,
      legacyGroup:original.group,
      title:original.title,
      primaryCategory:meta.primary,
      categoryIds:categoriesFor,
      tags,
      source:Object.freeze({
        kind:meta.kind,
        reference:original.ref,
        url:original.url||null,
        citationScope:meta.citationScope
      }),
      text:Object.freeze({
        arabic:null,
        bengaliPronunciation:meta.kind==='personal'?null:original.pron,
        personalBengaliWording:meta.kind==='personal'?original.pron:null,
        bengaliMeaning:original.meaning
      }),
      editorial:Object.freeze({
        status:'pending_review',
        sourceChecked:false,
        wordingChecked:false,
        pronunciationChecked:false,
        meaningChecked:false,
        reviewer:null,
        reviewedAt:null,
        notes:'Imported legacy entry; source, wording, Arabic, Bengali transliteration and attribution need editorial verification before claiming verified.'
      }),
      prescribedCount:null,
      prescribedOccasion:null
    });
  }));
  const entryById=new Map(entries.map(x=>[x.id,x]));
  if(entryById.size!==entries.length)throw Error('Duplicate Dua IDs in legacy content');
  if(Object.keys(descriptions).length!==entries.length)
    throw Error('Unmatched Dua metadata: all 11 legacy IDs must be mapped');
  function searchText(id){
    const row=entryById.get(typeof id==='string'?id:id?.id);
    if(!row)return '';
    const groups=row.categoryIds.map(x=>categoryById.get(x)).filter(Boolean);
    const source=row.source;
    return normalized([
      row.id,row.title,source.reference,source.kind,source.citationScope,
      ...groups.flatMap(x=>[x.name,x.en,...x.subtopics]),...row.tags
    ].join(' '));
  }
  function list(filters={}){
    const category=filters.category||null,kind=filters.kind||null;
    const term=normalized(filters.query||'');
    return entries.filter(row=>(!category||row.categoryIds.includes(category))&&
      (!kind||row.source.kind===kind)&&(!term||searchText(row.id).includes(term)));
  }
  function categoryStats(){
    return categories.map(category=>({
      ...category,
      count:entries.filter(row=>row.categoryIds.includes(category.id)).length
    }));
  }
  function validateCandidate(record){
    const issues=[];
    if(!record||typeof record!=='object'||Array.isArray(record))
      return {valid:false,issues:['A candidate must be a structured Dua record.']};
    if(typeof record.id!=='string'||!(/^[a-z0-9]+(?:-[a-z0-9]+)*$/).test(record.id))
      issues.push('Stable slug ID is required.');
    if(typeof record.title!=='string'||record.title.trim().length<3)
      issues.push('A meaningful title is required.');
    if(!categoryById.has(record.primaryCategory))
      issues.push('Primary category must exist.');
    if(!Array.isArray(record.categoryIds)||!record.categoryIds.includes(record.primaryCategory)||
      record.categoryIds.some(id=>!categoryById.has(id))||
      new Set(record.categoryIds).size!==record.categoryIds.length)
      issues.push('Category IDs must be unique, valid and contain the primary category.');
    if(!Array.isArray(record.tags)||record.tags.length<1||record.tags.length>20||
      record.tags.some(tag=>typeof tag!=='string'||!tag.trim()||tag.length>80))
      issues.push('Provide between 1 and 20 useful search tags.');
    if(!record.source||!kinds.includes(record.source.kind))
      issues.push('Distinguish Qur\'an, Hadith, dhikr and personal wording.');
    if(record.source?.kind!=='personal'&&
       (typeof record.source?.reference!=='string'||!record.source.reference.trim()))
      issues.push('Non-personal wording requires a reference.');
    if(record.source?.url!==null&&record.source?.url!==undefined&&
       (typeof record.source.url!=='string'||!/^https:\/\//i.test(record.source.url)))
      issues.push('References must use HTTPS, or no URL.');
    if(!record.text||typeof record.text.bengaliMeaning!=='string'||
       !record.text.bengaliMeaning.trim())
      issues.push('Bengali meaning or explanation is required.');
    if(record.source?.kind==='personal'&&record.text?.arabic)
      issues.push('Do not attach invented Arabic to a personal Bengali dua.');
    if(record.source?.kind==='personal'&&
       (!record.text?.personalBengaliWording||
        record.text.bengaliPronunciation))
      issues.push('Personal Bengali wording must be labeled, not called Arabic pronunciation.');
    if(record.editorial&&!reviewStatuses.includes(record.editorial.status))
      issues.push('Unrecognized editorial status.');
    const publication=record.editorial?.status==='verified'||record.editorial?.status==='published';
    if(publication){
      const fields=['sourceChecked','wordingChecked','pronunciationChecked','meaningChecked'];
      if(fields.some(key=>record.editorial[key]!==true)||
        typeof record.editorial.reviewer!=='string'||!record.editorial.reviewer.trim()||
        !Number.isFinite(Date.parse(record.editorial.reviewedAt)))
        issues.push('Publishing/verification needs a named reviewer, date and completed source/text checks.');
    }
    if(record.prescribedCount!==null&&record.prescribedCount!==undefined){
      const c=record.prescribedCount;
      if(!c||!Number.isInteger(c.times)||c.times<1||typeof c.reference!=='string'||!c.reference.trim())
        issues.push('Never prescribe a recitation number without a specific reviewed source.');
    }
    return {valid:issues.length===0,issues};
  }
  const api=Object.freeze({
    version:1,
    categories,
    entries,
    kinds,
    statuses:reviewStatuses,
    get:id=>entryById.get(String(id))||null,
    list,
    searchText,
    normalize:normalized,
    categoryStats,
    validateCandidate
  });
  window.DhikrDuaCatalog=api;
})();