// עדכון גרסה
// ================= עדכון גרסה =================
async function applyUpdate(reg){toast('מעדכן…',0);try{if(reg&&reg.waiting)reg.waiting.postMessage('skip');const SC=new URL('./',location.href).href;for(const k of await caches.keys()){const c=await caches.open(k);if((await c.keys()).some(q=>q.url.startsWith(SC)))await caches.delete(k)}if(reg&&reg.scope===SC)await reg.unregister();await Promise.all(APPFILES.map(f=>fetch(f,{cache:'reload'}).catch(()=>0)))}catch(e){}location.reload()}
async function checkUpdate(){toast('בודק גרסה…',0);try{const r=await fetch('sw.js?'+Date.now(),{cache:'no-store'}),t=await r.text(),m=/const V='v([^']+)'/.exec(t),srv=m&&m[1];$('#toast').style.display='none';const reg=navigator.serviceWorker&&await navigator.serviceWorker.getRegistration();if(reg)await reg.update().catch(()=>{});
if(!srv)return await modal('<b>לא הצלחתי לקרוא את הגרסה מהאתר</b>',null,'הבנתי');
if(srv===APPV&&!(reg&&reg.waiting))return await modal(`<b>אתה מעודכן ✔</b><p>הגרסה שלך: <b>${APPV}</b><br>הגרסה באתר: <b>${srv}</b></p>`,null,'הבנתי');
if(await modal(`<b>יש גרסה חדשה</b><p>הגרסה שלך: <b>${APPV}</b><br>הגרסה באתר: <b>${srv}</b></p><p>הנתונים והמסמכים שלך נשמרים.</p>`,null,'עדכן עכשיו'))await applyUpdate(reg)}catch(e){$('#toast').style.display='none';await modal('<b>אין חיבור</b><p>לא ניתן לבדוק גרסה כרגע.</p>',null,'הבנתי')}}
