// אירועים (לחיצות ושינויים)
// ---- events
document.addEventListener('click',async e=>{const b=e.target.closest('[data-a]');if(!b||['TEXTAREA','SELECT','INPUT'].includes(b.tagName))return;const a=b.dataset.a,i=b.dataset.i,it=()=>ITEMS.find(x=>x.id===i),f=fold(),pm=P();
if(a==='tab'){if(i==='home'&&tab==='home'&&!openF)goSearch();else{tab=i;openF=null;render();scrollTo(0,0)}}
else if(a==='go'||a==='chip'){if(a==='chip')Q=b.dataset.add?Q+' '+i:i;else Q=$('#q').value;if($('#fd')){FD=$('#fd').value;FK=$('#fk').value}await doSearch()}
else if(a==='fb'){const[id,act]=i.split('|');fbSet(id,act)}
else if(a==='fbrestore'){const k=qkey(Q),f=S.fb[k]||{};Object.keys(f).forEach(x=>{if(f[x]==='hide')delete f[x]});await save();await doSearch()}
else if(a==='unlink'){unlinkTerm(i)}else if(a==='addsyn2'){addSynQ2()}else if(a==='setp'){openPanel('⚙ הגדרות חיפוש',setPanelBody)}else if(a==='synp'){openPanel('🔗 מונחים נרדפים',synPanelBody)}else if(a==='gotodict'){gotoDict()}else if(a==='pinhdr'){pm.pin=pm.pin===false;await save();b.classList.toggle('on',pm.pin!==false);pinUpdate();toast(pm.pin!==false?'כותרות העמודות מוצמדות':'ההצמדה כבויה',1800)}
else if(a==='cwreset'){S.prefs.cw={};await save();renderList();toast('רוחב העמודות אופס')}
else if(a==='synmore'){SYNMORE=!SYNMORE;render()}else if(a==='updchk')checkUpdate();else if(a==='instdiag')instDiag();
else if(a==='auto'){const r=Core.autoSyn(ITEMS,S.syn);await mut(()=>S.syn=r.syn);toast('נוספו '+r.added+' מונחים למילון')}
else if(a==='add'){const x=it(),r=rmap().get(i),t=await selFolder('הוספה לתיק');if(!t)return;await mut(()=>t.items.push(snap(x,r&&r.hits)));toast('נוסף לתיק "'+esc(t.name)+'"')}
else if(a==='cp'){const x=it();copy(`${x.ref}\n${x.text}\n[${src(x)}]`)}
else if(a==='tofind'){const x=it();await mut(()=>S.finds.push({type:'נושא לבירור',title:x.ref+' '+x.text.slice(0,120),source:src(x)}));toast('נוסף ללשונית "בדיקה מסחרית"')}
else if(a==='deld'){if(await confirmD('למחוק את המסמך ואת הסעיפים שלו? (פריטים שכבר בתיקים נשמרים)','מחק'))await mut(async()=>{await delEmb(ITEMS.filter(x=>x.docId===i).map(x=>x.id));await delFile(i);PDFC.delete(i);await delItems(i);ITEMS=ITEMS.filter(x=>x.docId!==i);S.docs=S.docs.filter(d=>d.id!==i)})}
else if(a==='fnew'){const n=await askText('שם התיק החדש');if(n)await mut(()=>S.folders.push({id:uid(),name:n,items:[]}))}
else if(a==='fopen'){openF=i;FQ='';render()}else if(a==='fback'){openF=null;render()}
else if(a==='fren'){const x=S.folders.find(z=>z.id===i),n=await askText('שם חדש לתיק',x.name);if(n)await mut(()=>x.name=n)}
else if(a==='fdel'){if(await confirmD('למחוק את התיק? הפריטים יועברו לסל המחזור ואפשר לשחזר אותם.','מחק'))await mut(()=>{const x=S.folders.find(z=>z.id===i);x.items.forEach(y=>S.trash.push({x:y,f:x.name}));S.folders=S.folders.filter(z=>z.id!==i)})}
else if(a==='rest'){const t=S.trash[i];await mut(()=>{let g=S.folders.find(z=>z.name===t.f);if(!g){g={id:uid(),name:t.f,items:[]};S.folders.push(g)}g.items.push(t.x);S.trash.splice(i,1)})}
else if(a==='del')await mut(()=>S.trash.push({x:f.items.splice(i,1)[0],f:f.name}));
else if(a==='fav')await mut(()=>f.items[i].fav=!f.items[i].fav);
else if(a==='up'||a==='dn'){const j=+i+(a==='up'?-1:1);if(j<0||j>=f.items.length)return;await mut(()=>[f.items[i],f.items[j]]=[f.items[j],f.items[i]])}
else if(a==='dup')await mut(()=>f.items.splice(+i+1,0,{...f.items[i],id:uid()}));
else if(a==='mv'){const t=await selFolder('העבר לתיק',openF);if(t)await mut(()=>t.items.push(f.items.splice(i,1)[0]))}
else if(a==='fexp')exportDlg(f.items,f.name);
else if(a==='fcp')copy(f.items.map(x=>`[${KIND[x.kind]}] ${x.ref}\nציטוט: ${x.text}\nמקור: ${x.src}${x.note?'\nהערה שלי: '+x.note:''}`).join('\n\n'));
else if(a==='fml')location.href='mailto:?subject='+encodeURIComponent('בירור – '+f.name)+'&body='+encodeURIComponent(f.items.map(x=>`${x.ref} (${x.src}): ${x.note||x.text.slice(0,150)}`).join('\n\n').slice(0,1800));
else if(a==='fnewf')await mut(()=>S.finds.unshift({type:'נושא לבירור',title:''}));
else if(a==='fdelf'){if(await confirmD('למחוק את הממצא?','מחק'))await mut(()=>S.finds.splice(i,1))}
else if(a==='fdr')copy(S.finds[i].draft||'');
else if(a==='fxlf')xl('ממצאים-מסחריים',['סוג','תיאור','מקור','למה חשוב','מה לבדוק','מה לתעד','המלצה','טיוטת פנייה'],S.finds.map(x=>[x.type,x.title,x.source,x.why,x.check,x.doc,x.action,x.draft].map(v=>v||'')),[18,40,40,40,30,30,30,50]);
else if(a==='fprf')window.print();
else if(a==='syns')await mut(()=>S.syn=$('#syn').value.split('\n').map(l=>l.split(',').map(s=>s.trim()).filter(Boolean)).filter(g=>g.length>1));
else if(a==='synr'){if(await confirmD('לשחזר את מילון ברירת המחדל? שינויים שלך יימחקו.','שחזר'))await mut(()=>S.syn=Core.DEF_SYN)}
else if(a==='bk'){const d={v:2,docs:S.docs,folders:S.folders,finds:S.finds,trash:S.trash,syn:S.syn,prefs:S.prefs,cmp:S.cmp,fb:S.fb,items:ITEMS.map(strip)},l=document.createElement('a');l.href=URL.createObjectURL(new Blob([JSON.stringify(d)],{type:'application/json'}));l.download='גיבוי-'+new Date().toISOString().slice(0,10)+'.json';l.click()}
else if(a==='vm'){pm.vm=i;await save();document.querySelectorAll('[data-a=vm]').forEach(x=>x.classList.toggle('on',x.dataset.i===i));render()}
else if(a==='rstr'){RF.str[i]=RF.str[i]?0:1;b.classList.toggle('on',!!RF.str[i]);renderList()}
else if(a==='selmode'){SELMODE=!SELMODE;toast(SELMODE?'מצב בחירה: גרור אצבע/עכבר על התוצאות לסימון':'מצב בחירה כבוי');render()}
else if(a==='chaps'){const pn=PANEL;const cs=[...new Set(ITEMS.filter(x=>x.kind==='boq').map(ch))].sort(nat);const v=await modal(`<b>שמות פרקים</b><div class="src">למשל 01 = חניונים, 06 = פיתוח</div><div class="chapl">${cs.map(c=>`<div class="row"><b style="flex:0 0 50px">${esc(c)}</b><input data-ch="${esc(c)}" value="${esc((pm.chap||{})[c]||'')}"></div>`).join('')}</div>`,()=>[...D().querySelectorAll('[data-ch]')].reduce((o,x)=>(x.value.trim()&&(o[x.dataset.ch]=x.value.trim()),o),{}));if(v){pm.chap=v;await save();render()}if(pn)openPanel(pn.title,pn.body)}
else if(a==='selall'){vres().forEach(r=>SEL.add(r.it.id));if(tab==='cmp')cmpRows().forEach(r=>SEL.add(r.b.id));render()}
else if(a==='selstrong'){SEL.clear();vres().filter(r=>r.strength==='חזקה').forEach(r=>SEL.add(r.it.id));render()}
else if(a==='selnone'){SEL.clear();render()}
else if(a==='badd'){const t=await selFolder('הוספת הנבחרים לתיק');if(!t)return;const m=rmap();await mut(()=>selItems().forEach(x=>t.items.push(snap(x,m.get(x.id)&&m.get(x.id).hits))));toast(SEL.size+' סעיפים נוספו לתיק');SEL.clear();render()}
else if(a==='bfind'){const m=new Map(CR.map(r=>[r.b.id,r]));await mut(()=>selItems().forEach(x=>S.finds.push(m.get(x.id)?findFromCmp(m.get(x.id)):{type:'נושא לבירור',title:x.ref+' '+x.text.slice(0,120),source:src(x)})));toast(SEL.size+' נוספו לבדיקה מסחרית');SEL.clear();render()}
else if(a==='bexp'){const m=rmap();exportDlg(selItems().map(x=>snap(x,m.get(x.id)&&m.get(x.id).hits)),'תוצאות-חיפוש')}
else if(a==='xp'){b.classList.toggle('open')}
else if(a==='semall'){RF.strict=false;renderList()}
else if(a==='ctxall'){RF.ctx=true;renderList()}
else if(a==='weakall'){RF.str['חלשה']=1;renderList()}
else if(a==='preset'){if(i==='strict'){RF.str={'חזקה':1,'בינונית':0,'חלשה':0};RF.ctx=false}else if(i==='bal'){RF.str={'חזקה':1,'בינונית':1,'חלשה':0};RF.ctx=false}else{RF.str={'חזקה':1,'בינונית':1,'חלשה':1};RF.ctx=true}RF.strict=false;try{D().close()}catch(e){}renderList();toast(i==='strict'?'רמת סינון: מדויק':i==='bal'?'רמת סינון: מאוזן':'רמת סינון: רחב',2000)}
else if(a==='rbld'){RF.bld.has(i)?RF.bld.delete(i):RF.bld.add(i);b.classList.toggle('on',RF.bld.has(i));renderList()}
else if(a==='goto'){const e=document.getElementById(i);if(e)e.scrollIntoView({behavior:'smooth',block:'start'})}
else if(a==='xexp')doExport();else if(a==='viewpg')openSrc(i);
else if(a==='offb'||a==='offp'||a==='offall'){}
else if(a==='ctlt'){if(tab==='home')await modal(filtHtml(),null,'סגור');else{CTLOPEN=!CTLOPEN;const mm=document.querySelector('.ctlmore');if(mm)mm.hidden=!CTLOPEN;b.textContent=b.textContent.replace(/[▴▾]/,CTLOPEN?'▴':'▾')}}
else if(a==='runcmp')runCmp();
else if(a==='embgo')buildIndex();else if(a==='embstop')stopEmb();
else if(a==='gksave'){const k=$('#gk').value.trim();if(k){localStorage.setItem('gk',k);toast('המפתח נשמר בדפדפן הזה בלבד');render()}}
else if(a==='gkdel'){localStorage.removeItem('gk');localStorage.removeItem('gb');toast('המפתח נמחק');render()}
else if(a==='gktest')testGemini();
else if(a==='bai'){const L=selItems().slice(0,40),t=await aiCall(itemsPrompt(L,`סכם עבור קבלן חשמל את הדרישות הרלוונטיות לנושא "${Q}"`),L.length+' סעיפים');if(t)await showAI('סיכום AI',t,async()=>{const g=await selFolder('לשמור את הסיכום בתיק');if(g){(g.ai=g.ai||[]).push({t,time:new Date().toLocaleString('he-IL')});await save();render()}})}
else if(a==='fai'){const L=f.items.slice(0,40),t=await aiCall(itemsPrompt(L,`סכם עבור קבלן חשמל את הדרישות בתיק "${f.name}" (כולל הערות הקבלן)`),L.length+' סעיפים');if(t)await showAI('סיכום AI לתיק',t,async()=>{(f.ai=f.ai||[]).push({t,time:new Date().toLocaleString('he-IL')});await save();render()})}
else if(a==='aicp')copy(f.ai[i].t);else if(a==='aidel')await mut(()=>f.ai.splice(i,1));
else if(a==='cai'){const r=CR.find(x=>x.b.id===i),c=S.cmp[i]||{},p=`${itemLine(r.b,0)}\n\nסעיפי מפרט שנמצאו כתואמים אוטומטית (ייתכן שחלקם לא רלוונטיים):\n${r.m.map((m,k)=>itemLine(m.it,k+1)).join('\n')||'(לא נמצאו)'}\n${c.how?'\nאופן הביצוע המתוכנן של הקבלן: '+c.how:''}`,t=await aiCall(`משימה: נתח את שורת כתב הכמויות מול סעיפי המפרט. פרט: 1) דרישות מפרט שמשפיעות על העבודה והעלות 2) דברים שאולי לא כלולים בתיאור/תמחור השורה 3) פערים וסתירות 4) שאלות לבירור מול הבינוי/הפיקוח 5) מה כדאי לתעד.\n\n${p}`,'שורה אחת + '+r.m.length+' סעיפי מפרט');if(t)await showAI('ניתוח AI לשורה',t,async()=>{S.cmp[i]={...(S.cmp[i]||{}),ai:t};await save();render()})}
else if(a==='aiterms'){const ts=Core.topTerms(ITEMS.filter(x=>x.kind==='boq'),80);if(!ts.length)return toast('אין עדיין נתונים');const t=await aiCall(`להלן מונחים נפוצים מכתב כמויות של עבודות חשמל בישראל (אין כאן מסמכים, רק מונחים):\n${ts.join(' | ')}\n\nהצע קבוצות של מונחים נרדפים/חלופיים/קיצורים נפוצים בתחום (למשל שקע = בית תקע). החזר JSON בלבד: מערך של מערכים של מחרוזות. אל תכלול קבוצות שאינך בטוח בהן.`,ts.length+' מונחים בלבד');if(t){let g=[];try{g=JSON.parse(t.replace(/```json|```/g,'').trim()).filter(x=>Array.isArray(x)&&x.length>1)}catch(x){return showAI('תשובה לא ניתנת לפענוח',t)}
const v=await modal(`<b>הצעות AI למילון</b><div class="src">בחר מה להוסיף:</div><div class="chapl">${g.map((x,k)=>`<label class="chk"><input type="checkbox" data-g="${k}" checked> ${esc(x.join(', '))}</label>`).join('')}</div>`,()=>[...D().querySelectorAll('[data-g]:checked')].map(x=>g[x.dataset.g]),'הוסף למילון');if(v&&v.length)await mut(()=>addGroups(v))}}
else if(a==='cmore'){CF.n+=60;render()}
else if(a==='cfind'){const r=CR.find(x=>x.b.id===i);await mut(()=>S.finds.push(findFromCmp(r)));toast('נוסף לבדיקה מסחרית')}
else if(a==='cfindall'){const L=cmpRows();if(await confirmD(`להוסיף ${L.length} שורות לבדיקה מסחרית?`))await mut(()=>L.forEach(r=>S.finds.push(findFromCmp(r))))}
else if(a==='cadd'){const x=it(),t=await selFolder('הוספה לתיק');if(t)await mut(()=>t.items.push(snap(x)))}
else if(a==='cexp'){xl('השוואה-כתב-כמויות-מול-מפרט',['סעיף','תיאור','כמות','יחידה','מחיר','כל נתוני השורה','סעיפי מפרט תואמים','דגלים','סוגי ממצא','אופן ביצוע בפועל','עלות בפועל ליחידה','רווח צפוי'],cmpRows().map(r=>{const b=r.b,c=S.cmp[b.id]||{},pf=(+b.price-+c.cost)*(+b.qty||0);return[b.ref,b.text,b.qty,b.unit,b.price,fieldsStr(b),r.m.map(m=>m.it.ref+' (עמ׳ '+m.it.page+')').join(', '),r.flags.map(f=>f.k).join(' | '),[...new Set(r.flags.map(f=>f.t))].join(' | '),c.how||'',c.cost||'',+c.cost>0&&+b.price>0?Math.round(pf):'']}),[12,60,8,8,8,40,30,40,30,30,12,12])}});
document.addEventListener('change',async e=>{const t=e.target,a=t.dataset.a,pm=P();
if(t.id==='up'){upload([...t.files]);t.value=''}
else if(t.id==='rf'){const f=t.files[0];if(!f||!await confirmD('השחזור יחליף את כל הנתונים הקיימים. להמשיך?','שחזר'))return;try{const d=JSON.parse(await f.text());if(!d.v||!d.items)throw Error('קובץ גיבוי לא תקין');await clearItems();await rq(st('files','readwrite').clear());PDFC.clear();EMB.clear();await rq(st('emb','readwrite').clear());await putItems(d.items);KEYS.forEach(k=>S[k]=d[k]||(k==='cmp'||k==='fb'?{}:k==='prefs'?{...DEFP}:[]));ITEMS=d.items.map(Core.prep);Core.inherit(ITEMS,S.prefs.inh!==false);await save();toast('שוחזר בהצלחה');render()}catch(x){toast('שגיאה בשחזור: '+x.message)}}
else if(a==='note'){fold().items[t.dataset.i].note=t.value;await save();render()}
else if(a==='fe'){S.finds[t.dataset.i][t.dataset.f]=t.value;await save()}
else if(a==='cm'){const c=S.cmp[t.dataset.i]=S.cmp[t.dataset.i]||{};c[t.dataset.f]=t.value;await save();if(t.dataset.f==='cost')render()}
else if(a==='sort'){pm.sort=t.value;await save();renderList()}
else if(a==='rsub'){RF.sub=t.value;renderList()}else if(a==='rtype'){RF.type=t.value;renderList()}
else if(a==='rch'){RF.ch=t.value;renderList()}else if(a==='runit'){RF.unit=t.value;renderList()}else if(a==='rprice'){RF.price=t.value;renderList()}
else if(a==='hl'){pm.hl=t.checked;await save();render()}
else if(a==='sem'){pm.sem=t.checked;await save()}
else if(a==='semadd'){pm.semAdd=t.checked;await save()}
else if(a==='strict'){RF.strict=t.checked;renderList()}
else if(a==='ctxchk'){RF.ctx=t.checked;renderList()}
else if(a==='offb'){t.checked?OFFB.delete(t.dataset.i):OFFB.add(t.dataset.i);t.closest('tr').classList.toggle('off',!t.checked);afterList()}
else if(a==='offgrp'){const ids=GRP.get(t.dataset.g)||[];ids.forEach(id=>{t.checked?OFFB.delete(id):OFFB.add(id);const r=document.querySelector(`tr[data-bid="${id}"]`);if(r){r.classList.toggle('off',!t.checked);const c=r.querySelector('[data-a=offb]');if(c)c.checked=t.checked}});afterList()}
else if(a==='offp'){t.checked?OFFP.delete(t.dataset.i):OFFP.add(t.dataset.i);t.closest('.pgc').classList.toggle('off',!t.checked);afterList()}
else if(a==='offall'){const{gs}=origGroups(vres());(gs.find(x=>x[0].it.docId+'|'+x[0].it.sheet===t.dataset.i)||[]).forEach(r=>t.checked?OFFB.delete(r.it.id):OFFB.add(r.it.id));renderList()}
else if(a==='gmodel'){pm.ai.model=t.value;await save()}
else if(a==='fsort'){FSORT=t.value;render()}
else if(a==='cflag'){CF.flag=t.value;render()}else if(a==='ctype'){CF.type=t.value;render()}else if(a==='cch'){CF.ch=t.value;render()}else if(a==='conly'){CF.only=t.checked;render()}});
document.addEventListener('input',e=>{const l=e.target.dataset.live;if(l==='txt'){RF.txt=e.target.value;renderList()}else if(l==='fq'){FQ=e.target.value;const p=e.target.selectionStart;render();const q=document.querySelector('[data-live=fq]');q.focus();q.setSelectionRange(p,p)}});
document.addEventListener('keydown',e=>{if(e.key==='Enter'&&e.target.id==='q')document.querySelector('[data-a=go]').click()});
