// עדכון גרסה
// ================= עדכון גרסה =================
async function applyUpdate(reg){toast('מעדכן…',0);try{if(reg&&reg.waiting)reg.waiting.postMessage('skip');const SC=new URL('./',location.href).href;for(const k of await caches.keys()){const c=await caches.open(k);if((await c.keys()).some(q=>q.url.startsWith(SC)))await caches.delete(k)}if(reg&&reg.scope===SC)await reg.unregister();await Promise.all(APPFILES.map(f=>fetch(f,{cache:'reload'}).catch(()=>0)))}catch(e){}location.reload()}
async function checkUpdate(){toast('בודק גרסה…',0);try{const r=await fetch('sw.js?'+Date.now(),{cache:'no-store'}),t=await r.text(),m=/const V='v([^']+)'/.exec(t),srv=m&&m[1];$('#toast').style.display='none';const reg=navigator.serviceWorker&&await navigator.serviceWorker.getRegistration();if(reg)await reg.update().catch(()=>{});
if(!srv)return await modal('<b>לא הצלחתי לקרוא את הגרסה מהאתר</b>',null,'הבנתי');
if(srv===APPV&&!(reg&&reg.waiting))return await modal(`<b>אתה מעודכן ✔</b><p>הגרסה שלך: <b>${APPV}</b><br>הגרסה באתר: <b>${srv}</b></p>`,null,'הבנתי');
if(await modal(`<b>יש גרסה חדשה</b><p>הגרסה שלך: <b>${APPV}</b><br>הגרסה באתר: <b>${srv}</b></p><p>הנתונים והמסמכים שלך נשמרים.</p>`,null,'עדכן עכשיו'))await applyUpdate(reg)}catch(e){$('#toast').style.display='none';await modal('<b>אין חיבור</b><p>לא ניתן לבדוק גרסה כרגע.</p>',null,'הבנתי')}}

// ================= התקנה כאפליקציה =================
let DIP=null;const isStandalone=()=>matchMedia('(display-mode: standalone)').matches||navigator.standalone===true;
addEventListener('beforeinstallprompt',e=>{e.preventDefault();DIP=e;if(typeof tab!=='undefined'&&tab==='home'&&!document.querySelector('[data-a=pwainst]')&&typeof render==='function')render()});
addEventListener('appinstalled',()=>{DIP=null;toast('האפליקציה הותקנה');if(typeof render==='function')render()});
const instChip=()=>DIP&&!isStandalone()?'<button class="chip" data-a="pwainst">📲 התקן כאפליקציה</button>':'';
async function installApp(){if(isStandalone())return toast('האפליקציה כבר פועלת כמותקנת');
if(DIP){const e=DIP;DIP=null;e.prompt();try{await e.userChoice}catch(x){}return render()}
await modal('<b>Chrome לא מציע התקנה כרגע</b><p>בדרך כלל זה אומר שהוא חושב שהאפליקציה כבר מותקנת (או שהתקנת בעבר ולא הוסרה). מה לעשות:</p><p>1. הסר את האפליקציה הישנה: בכרום פתח <b>chrome://apps</b>, לחיצה ימנית על האפליקציה ← הסר.<br>2. טען מחדש את הדף (או סגור וגש שוב לכתובת).<br>3. חזור לכאן – יופיע כפתור \"התקן כאפליקציה\".</p><p class="src">לבדיקה מפורטת: הגדרות ← אבחון התקנה כאפליקציה.</p>',null,'הבנתי')}
