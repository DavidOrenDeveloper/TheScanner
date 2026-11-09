// קריאת קבצים (PDF / Excel)
// ---- parsing
async function parsePdf(buf,doc){pdfjsLib.GlobalWorkerOptions.workerSrc='js/vendor/pdf.worker.min.js';const pdf=await pdfjsLib.getDocument({data:new Uint8Array(buf.slice(0))}).promise;doc.pages=pdf.numPages;
const addR=(c,p,its)=>{const x1=Math.min(...its.map(t=>t.transform[4]))-2,x2=Math.max(...its.map(t=>t.transform[4]+t.width))+2,y1=Math.min(...its.map(t=>t.transform[5]))-3,y2=Math.max(...its.map(t=>t.transform[5]+(t.height||10)))+2;let r=c.rects&&c.rects.find(z=>z.p===p);if(!r)(c.rects=c.rects||[]).push({p,x1,y1,x2,y2});else{r.x1=Math.min(r.x1,x1);r.x2=Math.max(r.x2,x2);r.y1=Math.min(r.y1,y1);r.y2=Math.max(r.y2,y2)}};
const lineText=its=>{const s=[...its].sort((a,b)=>b.transform[4]-a.transform[4]);let o='';s.forEach((t,i)=>{if(i){const q=s[i-1],gap=q.transform[4]-(t.transform[4]+t.width);o+=gap<(q.height||10)*0.14?'':' '}o+=t.str});return o.trim()};
const pages=[],empty=[];
for(let p=1;p<=pdf.numPages;p++){const pg=await pdf.getPage(p),H=pg.getViewport({scale:1}).height,tc=await pg.getTextContent(),m={};tc.items.forEach(t=>{if(!t.str.trim())return;const y=Math.round(t.transform[5]/3);(m[y]=m[y]||[]).push(t)});
const ls=Object.keys(m).map(Number).sort((a,b)=>b-a).map(y=>({y:y*3,its:m[y],text:lineText(m[y])})).filter(l=>l.text);if(!ls.length)empty.push(p);pages.push({p,H,ls})}
const cnt=new Map(),key=l=>l.text.replace(/\d+/g,'#');pages.forEach(P=>P.ls.forEach(l=>{if(l.y>P.H*.92||l.y<P.H*.08){const k=key(l);cnt.set(k,(cnt.get(k)||0)+1)}}));
const rep=new Set([...cnt].filter(([,n])=>n>=Math.max(3,pdf.numPages*.25)).map(x=>x[0])),out=[];let cur=null,ctx='';
for(const P of pages){for(const l of P.ls){if((l.y>P.H*.92||l.y<P.H*.08)&&rep.has(key(l)))continue;const mm=l.text.match(/^(\d{1,3}(?:\.\d+)+)\s*(.*)$/);
if(mm){cur={ref:mm[1],text:mm[2],ctx,page:P.p};out.push(cur);if(mm[2].length<70&&mm[1].split('.').length<=2)ctx=mm[1]+' '+mm[2]}
else{if(!cur){cur={ref:'',text:'',ctx,page:P.p};out.push(cur)}cur.text+=(cur.text?' ':'')+l.text}addR(cur,P.p,l.its)}}
const byP=new Map();out.forEach(i=>{(byP.get(i.page)||byP.set(i.page,[]).get(i.page)).push(i)});const toc=new Set();
for(const[p,L]of byP)if(L.length>=10&&L.filter(i=>i.text.length<95&&/\s\d{1,3}$/.test(i.text)).length>=L.length*.6)toc.add(p);
const kept=out.filter(i=>!toc.has(i.page)&&i.text.length>2);
doc.status=(empty.length?`נקלט חלקית – אין טקסט בעמודים ${empty.slice(0,15).join(', ')} (סרוק? OCR אינו כלול)`:'נקלט')+(toc.size?` · דילגתי על עמודי תוכן עניינים: ${[...toc].join(', ')}`:'')+(rep.size?` · הוסרו ${rep.size} כותרות עליונות/תחתונות חוזרות`:'');return kept}
async function upload(files){for(const f of files){const doc={id:uid(),name:f.name,date:new Date().toLocaleString('he-IL'),status:'מעבד…',ver:S.docs.filter(d=>d.name===f.name).length+1};S.docs.push(doc);toast('מעבד '+f.name,0);render();
try{const ext=f.name.split('.').pop().toLowerCase(),buf=await f.arrayBuffer();let items;if(ext==='pdf'){doc.type='pdf';items=await parsePdf(buf,doc)}else if(/^(xlsx|xls|csv)$/.test(ext)){doc.type='xlsx';items=Core.parseXlsx(XLSX,buf,doc);doc.status='נקלט'+(doc.dupSheets&&doc.dupSheets.length?` · הגיליון "${doc.dupSheets.join('", "')}" זהה ברובו לגיליון קודם – לא נכלל, כדי לא להכפיל תוצאות`:'')}else throw Error('נתמכים PDF ו-Excel בלבד');
items.forEach((i,k)=>Object.assign(i,{id:doc.id+'_'+k,docId:doc.id,docName:doc.name,ver:doc.ver,kind:doc.type==='pdf'?'spec':'boq'}));await putItems(items);await putFile({id:doc.id,name:f.name,type:doc.type,buf});doc.file=true;ITEMS.push(...items.map(Core.prep));Core.inherit(ITEMS,P().inh!==false);doc.count=items.length;const ar=Core.autoSyn(ITEMS,S.syn);S.syn=ar.syn;doc.dict=ar.added}catch(e){doc.status='שגיאה: '+e.message}
await save();toast(doc.name+': '+doc.status);render()}}
