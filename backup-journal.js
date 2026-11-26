/* Backup transaction journal. Load BEFORE app.js so interrupted multi-key writes
   can be rolled back before any model reads the saved data. */
(function(){
  'use strict';
  const JOURNAL='dhikr_dubai_backup_journal_v1';
  const KEYS=[
    'dhikr_dubai_records_v1',
    'dhikr_dubai_tahajjud_v1',
    'dhikr_dubai_quran_v5',
    'dhikr_dubai_dua_v5',
    'dhikr_dubai_daily21_v1'
  ];
  const hasOwn=(obj,key)=>Object.prototype.hasOwnProperty.call(obj,key);
  function validMap(map){
    return map&&typeof map==='object'&&!Array.isArray(map)&&
      KEYS.every(key=>hasOwn(map,key)&&(map[key]===null||typeof map[key]==='string'));
  }
  function snapshot(){
    const values={};
    for(const key of KEYS)values[key]=localStorage.getItem(key);
    return values;
  }
  function restore(before){
    if(!validMap(before))throw Error('Invalid backup rollback snapshot');
    for(const key of KEYS){
      if(before[key]===null)localStorage.removeItem(key);
      else localStorage.setItem(key,before[key]);
      if(localStorage.getItem(key)!==before[key])throw Error('Rollback verification failed');
    }
  }
  let status='ready';
  function recover(){
    try{
      const raw=localStorage.getItem(JOURNAL);
      if(raw===null)return true;
      const entry=JSON.parse(raw);
      if(entry?.version!==1||!validMap(entry.before))throw Error('Invalid recovery journal');
      restore(entry.before);
      localStorage.removeItem(JOURNAL);
      if(localStorage.getItem(JOURNAL)!==null)throw Error('Recovery journal remains');
      status='recovered';
      return true;
    }catch(e){status='blocked';return false}
  }
  const available=recover();
  function commit(changed){
    if(status==='blocked')return {ok:false,reason:'blocked',rolledBack:false};
    if(!changed||typeof changed!=='object'||Array.isArray(changed)||!KEYS.every(key=>hasOwn(changed,key)))
      return {ok:false,reason:'invalid',rolledBack:true};
    let before=null,journalCreated=false;
    try{
      const serialized={};
      for(const key of KEYS)serialized[key]=JSON.stringify(changed[key]);
      before=snapshot();
      const journal=JSON.stringify({version:1,createdAt:new Date().toISOString(),before});
      localStorage.setItem(JOURNAL,journal);
      if(localStorage.getItem(JOURNAL)!==journal)throw Error('Journal verification failed');
      journalCreated=true;
      for(const key of KEYS){
        localStorage.setItem(key,serialized[key]);
        if(localStorage.getItem(key)!==serialized[key])throw Error('Saved value verification failed');
      }
      localStorage.removeItem(JOURNAL);
      if(localStorage.getItem(JOURNAL)!==null)throw Error('Journal cleanup failed');
      status='ready';
      return {ok:true,rolledBack:false};
    }catch(e){
      // A storage/quota error while creating the journal leaves user data untouched.
      if(!journalCreated){
        try{
          if(before&&localStorage.getItem(JOURNAL)!==null){
            restore(before);
            localStorage.removeItem(JOURNAL);
          }
        }catch(rollbackError){status='blocked';return {ok:false,reason:'rollback',rolledBack:false}}
        return {ok:false,reason:'storage',rolledBack:true};
      }
      try{
        restore(before);
        localStorage.removeItem(JOURNAL);
        if(localStorage.getItem(JOURNAL)!==null)throw Error('Journal cleanup failed');
        return {ok:false,reason:'storage',rolledBack:true};
      }catch(rollbackError){
        status='blocked';
        return {ok:false,reason:'rollback',rolledBack:false};
      }
    }
  }
  window.DhikrBackupTxn={
    keys:KEYS.slice(),journalKey:JOURNAL,
    commit,wasRecovered:()=>status==='recovered',
    isBlocked:()=>status==='blocked',status:()=>status,
    snapshot:()=>snapshot()
  };
})();