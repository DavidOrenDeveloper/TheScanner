// חיפוש, משוב ואבחון התקנה
// ================= לימוד מהחלטות, מונחים, חיפוש =================
const frame=()=>new Promise(r=>requestAnimationFrame(()=>setTimeout(r,0)));
let FBH=0,SEMST='כבוי';
const qkey=q=>Core.norm(q).split(' ').filter(w=>w.length>1&&!Core.STOP.has(w)).map(Core.stem).sort().join(' ');
function applyFb(){const f=S.fb[qkey(Q)]||{};FBH=0;res=res.filter(x=>{const v=f[x.it.id];if(v==='hide'){FBH++;return false}if(v==='weak'){x.strength='חלשה';x.sc*=.3}if(v==='good'){x.strength='חזקה';x.sc+=100}return true}).sort((p,q)=>q.sc-p.sc)}
async function doSearch(){const q0=$('#q');q0&&q0.blur();tab='home';openF=null;SEL.clear();RF.ch='';RF.unit='';RF.txt='';RF.strict=false;RF.ctx=false;RF.str={'חזקה':1,'בינונית':1,'חלשה':0};RF.sub='';RF.type='';RF.fo=new Set();RF.role='';RF.attr='';toast('מחפש…',0);await frame();let sem='כבוי';res=(P().sm&&P().sm!=='smart')?Core.searchMulti(Q,ITEMS,S.syn,{doc:FD,kind:FK,mode:P().sm,syn:P().asyn},Core.searchAdv):Core.searchMulti(Q,ITEMS,S.syn,{doc:FD,kind:FK,poly:S.poly});
if(P().sem&&(P().sm||'smart')==='smart'){if(!embReady())sem='לא פעיל (אין אינדקס – ראה הגדרות)';else{try{res=await mergeSem(res);sem='פעיל'}catch(x){sem='נכשל: '+x.message}}}
applyFb();SEMST=sem;render();const nv=vres().length;toast((nv?`נמצאו ${nv} תוצאות`+(res.length>nv?` (ועוד ${res.length-nv} חלשות/מוסתרות)`:''):res.length?`אין התאמות חזקות · יש ${res.length} חלשות מוסתרות`:'לא נמצאו תוצאות')+(sem!=='כבוי'?` · חיפוש סמנטי: ${sem}`:'')+(FBH?` · ${FBH} הוסתרו לפי החלטתך`:''),2200)}
async function fbSet(id,act){const k=qkey(Q),f=S.fb[k]=S.fb[k]||{};if(f[id]===act)delete f[id];else f[id]=act;await save();const r=res.find(x=>x.it.id===id);
if(f[id]==='hide'){res=res.filter(x=>x.it.id!==id);FBH++}else if(r){if(f[id]==='weak'){r.strength='חלשה'}else if(f[id]==='good'){r.strength='חזקה'}}
SEL.delete(id);render();toast(act==='hide'?'הוסתר – לא יוצג בחיפוש הזה שוב (אפשר לשחזר)':act==='weak'?'סומן כהתאמה חלשה':'סומן כרלוונטי',2500)}
const fbBtns=id=>`<span class="fbb noprint"><button title="רלוונטי" data-a="fb" data-i="${id}|good">✓</button><button title="התאמה חלשה" data-a="fb" data-i="${id}|weak">↓</button><button title="לא רלוונטי – הסתר" data-a="fb" data-i="${id}|hide">✕</button></span>`;

async function instDiag(){const o=[];try{const r=await fetch('manifest.json',{cache:'no-store'}),j=await r.json();o.push(['מזהה האפליקציה (id)',j.id||'חסר ✘ – זה manifest ישן']);o.push(['start_url / scope',(j.start_url||'')+' / '+(j.scope||'')]);const ic=j.icons||[];for(const i of ic){const q=await fetch(i.src,{method:'HEAD',cache:'no-store'}).catch(()=>null);o.push(['אייקון '+(i.sizes||'')+' '+(i.type||''),q&&q.ok?'נמצא ✔':'חסר ✘ – לא הועלה ל-GitHub'])}
const has=n=>ic.some(i=>new RegExp(n).test(i.sizes||'')&&/png/.test(i.type||''));o.push(['אייקוני PNG 192 ו-512 (נדרשים להתקנה)',has('192')&&has('512')?'כן ✔':'לא ✘ – manifest ישן'])}catch(e){o.push(['manifest.json','לא נטען: '+e.message])}
o.push(['Service Worker שולט בעמוד',navigator.serviceWorker&&navigator.serviceWorker.controller?'כן ✔':'לא'],['מצב תצוגה',matchMedia('(display-mode: standalone)').matches?'אפליקציה מותקנת':'בתוך הדפדפן'],['גרסת קוד',APPV],['כתובת',location.href]);
await modal(`<b>אבחון התקנה</b><table class="diag">${o.map(([k,v])=>`<tr><td>${esc(k)}</td><td>${esc(v)}</td></tr>`).join('')}</table><div class="src">אם הכול ✔ אבל כרום כותב "האפליקציה כבר מותקנת" ולא נפתחת: זו אפליקציה ישנה שנשארה בטלפון. הסר אותה דרך הגדרות הטלפון ← אפליקציות (חפש "כתב כמויות" או את שם האתר), ואז פתח את האתר מחדש והתקן.</div>`,null,'סגור')}
