import {readFileSync} from 'node:fs';
import {runInNewContext,Script} from 'node:vm';
import assert from 'node:assert/strict';
import test from 'node:test';

const read=file=>readFileSync(new URL('../'+file,import.meta.url),'utf8');
const guard=read('backup-journal.js');
const ui=read('backup-recovery.js');
const app=read('index.html');
const sw=read('sw.js');
const exp=read('experience.js');
const keys=[
  'dhikr_dubai_records_v1','dhikr_dubai_tahajjud_v1',
  'dhikr_dubai_quran_v5','dhikr_dubai_dua_v5','dhikr_dubai_daily21_v1'
];
const journal='dhikr_dubai_backup_journal_v1';
function store(initial={},fail=()=>false){
  const data=new Map(Object.entries(initial));
  const api={
    getItem:k=>data.has(k)?data.get(k):null,
    setItem(k,v){if(fail('set',k,String(v),data))throw Error('Simulated full storage');data.set(k,String(v))},
    removeItem(k){if(fail('remove',k,null,data))throw Error('Simulated failed remove');data.delete(k)}
  };
  return {data,api};
}
function boot(storage){
  const env={window:{},localStorage:storage.api,Date};
  runInNewContext(guard,env,{filename:'backup-journal.js'});
  return env.window.DhikrBackupTxn;
}
function values(label){
  return Object.fromEntries(keys.map((k,i)=>[k,{kind:label,index:i,rows:[label+':'+i]}]));
}
function raws(payload){
  return Object.fromEntries(keys.map(k=>[k,JSON.stringify(payload[k])]));
}

test('all new scripts and modified app files parse',()=>{
  for(const file of ['backup-journal.js','backup-recovery.js','experience.js','sw.js']){
    assert.doesNotThrow(()=>new Script(read(file),{filename:file}));
  }
});

test('successful restore commits all five categories and clears the journal',()=>{
  const old=raws(values('old')),next=values('new');
  const s=store(old),api=boot(s);
  const result=api.commit(next);
  assert.equal(result.ok,true);
  assert.equal(s.api.getItem(journal),null);
  for(const k of keys)assert.equal(s.api.getItem(k),JSON.stringify(next[k]));
});

test('quota rejection of the journal does not change any saved records',()=>{
  const old=raws(values('original'));
  const s=store(old,(verb,key)=>verb==='set'&&key===journal);
  const api=boot(s),result=api.commit(values('new'));
  assert.equal(result.ok,false);
  assert.equal(result.rolledBack,true);
  assert.equal(s.api.getItem(journal),null);
  for(const k of keys)assert.equal(s.api.getItem(k),old[k]);
});

test('mid-write failure rolls back exact JSON strings including untouched categories',()=>{
  const old=raws(values('original'));
  let triggered=false;
  const s=store(old,(verb,key,value)=> {
    if(verb!=='set'||key!==keys[2]||triggered)return false;
    if(value===old[key])return false;
    triggered=true;return true;
  });
  const api=boot(s),out=api.commit(values('replacement'));
  assert.equal(out.ok,false);
  assert.equal(out.rolledBack,true);
  assert.equal(s.api.getItem(journal),null);
  for(const k of keys)assert.equal(s.api.getItem(k),old[k]);
});

test('unexpected app interruption restores pre-restore records before modules load',()=>{
  const old=raws(values('previous'));
  const initial={
    ...old,
    [keys[0]]:JSON.stringify({broken:true}),
    [keys[1]]:JSON.stringify({partial:true}),
    [journal]:JSON.stringify({version:1,before:old,createdAt:'2026-11-26T10:00:00Z'})
  };
  const s=store(initial),api=boot(s);
  assert.equal(api.wasRecovered(),true);
  assert.equal(s.api.getItem(journal),null);
  for(const k of keys)assert.equal(s.api.getItem(k),old[k]);
});

test('rollback failure retains recovery journal for the next app start',()=>{
  const old=raws(values('previous'));
  let failedNextWrite=false;
  let rejectRollback=true;
  const s=store(old,(verb,key,value,current)=>{
    if(verb!=='set')return false;
    if(key===keys[2]&&!failedNextWrite&&value!==old[key]){failedNextWrite=true;return true}
    if(rejectRollback&&key===keys[0]&&value===old[key]&&current.get(key)!==old[key])return true;
    return false;
  });
  const first=boot(s),result=first.commit(values('new'));
  assert.equal(result.ok,false);
  assert.equal(result.rolledBack,false);
  assert.equal(first.isBlocked(),true);
  assert.notEqual(s.api.getItem(journal),null);
  rejectRollback=false;
  const next=boot(s);
  assert.equal(next.wasRecovered(),true);
  for(const k of keys)assert.equal(s.api.getItem(k),old[k]);
  assert.equal(s.api.getItem(journal),null);
});

test('malformed journal is not applied to user records and blocks destructive writes',()=>{
  const old=raws(values('real'));
  const s=store({...old,[journal]:'{"version":1,"before":{}}'});
  const api=boot(s);
  assert.equal(api.isBlocked(),true);
  assert.equal(api.commit(values('new')).ok,false);
  for(const k of keys)assert.equal(s.api.getItem(k),old[k]);
});

test('all backups are reviewed before restoration; destructive clear is routed through modal',()=>{
  assert.match(ui,/async function importSelected\(file\)/);
  assert.match(ui,/const review=prepare\(raw\)/);
  assert.match(ui,/showRestore\(file,review\)/);
  assert.match(ui,/data-bk="ack"/);
  assert.match(ui,/if\(action==='ack'\)return/); // Must not prevent default checkbox click
  assert.match(ui,/if\(!pending\|\|submitting\|\|!host\?\.querySelector\('#bk-ack'\)\?\.checked\)return/);
  assert.match(ui,/txn\.commit\(map\)/);
  assert.match(ui,/requestClear/);
  assert.match(exp,/window\.DhikrBackupUI\.requestClear\(\)/);
  assert.match(ui,/raw\.version>4/);
  assert.match(ui,/raw\.tahajjud\?nClean\(raw\.tahajjud\):now\.tahajjud/);
});

test('recovery code is loaded before app records and offline assets include the guard',()=>{
  assert.ok(app.indexOf('backup-journal.js?v=1.0.0')<app.indexOf('app.js?v=9.0.2'));
  assert.ok(app.indexOf('backup-recovery.js?v=1.0.0')>app.indexOf('daily-zikr.js?v=1.0.1'));
  assert.match(app,/backup-recovery\.css\?v=1\.0\.0/);
  assert.match(sw,/const CACHE='dubai-dhikr-v\d+\.\d+\.\d+'/);
  for(const file of ['backup-journal.js','backup-recovery.js','backup-recovery.css'])
    assert.ok(sw.includes("'./"+file+"'"),file+' must be precached');
});
