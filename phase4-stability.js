/* Phase 4 A1: update Home/session only when a prayer boundary changes.
   Keep existing navigation, counters, dates and saved records unchanged. */
(function installStableScreenUpdates(){
  'use strict';
  function prayerState(){
    const info=dayInfo();
    if(!validTimes(info.tm))return info.day+'|unavailable';
    const opened=PRAYERS.filter(p=>info.now>=minutes(info.tm[p.key])).map(p=>p.key).join(',');
    const upcoming=PRAYERS.find(p=>info.now<minutes(info.tm[p.key]))?.key||'end-of-day';
    return info.day+'|'+opened+'|'+upcoming;
  }
  let snapshot=prayerState();
  const priorRender=render;
  render=function(){
    const result=priorRender();
    snapshot=prayerState();
    return result;
  };
  window.DhikrStableTick=function(){
    if(screen!=='today'&&screen!=='session')return false;
    const next=prayerState();
    if(next===snapshot)return false;
    // A new prayer just opened or today's timetable changed.
    // The existing render handler preserves layout and screen semantics.
    snapshot=next;
    render();
    return true;
  };
})();