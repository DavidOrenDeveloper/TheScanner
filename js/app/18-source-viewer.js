// פתיחה במקור (PDF / Excel)
const srcB=it=>`<button class="b g" data-a="opensrc" data-i="${it.id}">📂 פתח במקור</button>`;
function openSrc(id){const it=ITEMS.find(x=>x.id===id);if(!it)return;it.kind==='spec'?srcPdf(it):srcXl(it)}
function srcPdf(it){const doc=S.docs.find(d=>d.id===it.docId);if(!doc||!doc.file)return toast('אין קובץ מקור – העלה את המפרט שוב');
const n=doc.pages||Math.max(1,...ITEMS.filter(x=>x.docId===doc.id).map(x=>+x.page||0)),by=new Map(),d=D();
const cmv=new Map(res.map(r=>[r.it.id,r.fm&&r.fm.best]));res.forEach(r=>{if(r.it.docId===doc.id&&r.it.page){if(!by.has(r.it.page))by.set(r.it.page,[]);by.get(r.it.page).push(r.it)}});
d.style.width='min(980px,98vw)';
d.dataset.bd='1';d.innerHTML=dlgBox(`<div class="srch"><b>${esc(doc.name)}</b><span class="src">עמוד <input id="sgp" type="number" min="1" max="${n}" value="${it.page}" style="width:76px"> מתוך ${n}</span><button class="chip" id="sgo">עבור</button><button class="chip" id="sgv">◀ קודם</button><button class="chip" id="sgn">הבא ▶</button></div><div class="srcw" id="srcw">${Array.from({length:n},(_,i)=>`<div class="vpg" data-p="${i+1}"><div class="pn">עמוד ${i+1}</div><canvas></canvas></div>`).join('')}</div>`,'<button class="b g" id="sgx" data-close>סגור</button>');
d.showModal();const W=$('#srcw'),pg=p=>W.querySelector(`.vpg[data-p="${Math.min(n,Math.max(1,p))}"]`),
cur=()=>{const t=W.getBoundingClientRect().top;for(const v of W.querySelectorAll('.vpg'))if(v.getBoundingClientRect().bottom>t+20)return +v.dataset.p;return n};
const io=new IntersectionObserver(es=>es.forEach(e=>{const v=e.target;if(e.isIntersecting&&!v.dataset.d){v.dataset.d=1;const p=+v.dataset.p;drawPage(v.querySelector('canvas'),'',doc.id,p,by.get(p)||[],hlOn('spec'),true,cmv).then(()=>{v.style.aspectRatio='auto'}).catch(()=>{delete v.dataset.d})}}),{root:W,rootMargin:'700px 0px'});
W.querySelectorAll('.vpg').forEach(v=>io.observe(v));
const go=p=>{pg(p).scrollIntoView({block:'start'});$('#sgp').value=Math.min(n,Math.max(1,p))};
$('#sgo').onclick=()=>go(+$('#sgp').value||1);$('#sgv').onclick=()=>go(cur()-1);$('#sgn').onclick=()=>go(cur()+1);
$('#sgx').onclick=()=>{io.disconnect();d.close()};W.addEventListener('scroll',()=>{$('#sgp').value=cur()},{passive:true});go(+it.page||1)}
function srcXl(it){const doc=S.docs.find(d=>d.id===it.docId)||{},sh=doc.sh&&doc.sh[it.sheet],L=ITEMS.filter(x=>x.docId===it.docId&&x.sheet===it.sheet).sort((a,b)=>a.row-b.row),i0=L.findIndex(x=>x.id===it.id);if(i0<0)return;
const hasC=L.some(r=>r.cells)&&sh,hdr=hasC?sh.hdr:['סעיף','תיאור'],cof=r=>hasC&&r.cells?r.cells:[r.ref,r.text],
cl=k=>{let s='',m=k+1;while(m>0){const z=(m-1)%26;s=String.fromCharCode(65+z)+s;m=Math.floor((m-1)/26)}return s},
lab=(x,k)=>{const m=/^עמודה (\d+)$/.exec(x||'');return m?cl(+m[1]-1):(x||cl(k))},
cols=hdr.map((_,k)=>k).filter(k=>L.some(r=>String(cof(r)[k]==null?'':cof(r)[k]).trim()!=='')),
dk=cof(it).findIndex(v=>String(v)===String(it.text)),sec=r=>String(r.ref||'').split('.').slice(0,3).join('.'),HM=new Map(res.map(r=>[r.it.id,r]));
let lo=Math.max(0,i0-40),hi=Math.min(L.length,i0+41),only=false;const d=D();
const rowH=r=>{const rr=HM.get(r.id),cs=cof(r);return`<tr class="${r.id===it.id?'tgt ':''}${rr&&hlOn('boq')?'mk':''}${r.head?' hd':''}"${r.id===it.id?' id="srow"':''}><td class="rn"><b>${r.row}</b></td>${cols.map(k=>{const v=cs[k]==null?'':cs[k];return`<td${k===dk?' style="min-width:320px"':''}>${rr&&String(v)===String(r.text)?hlt(r.text,rr.hits,'boq'):esc(v)}</td>`}).join('')}</tr>`};
d.style.width='min(1100px,98vw)';
d.dataset.bd='1';d.innerHTML=dlgBox(`<div class="srch"><b>${esc(doc.name||it.docName)} · גיליון "${esc(it.sheet)}"</b><span class="src" id="sinfo"></span></div><div class="srch"><button class="chip" id="sup">⬆ עוד למעלה</button><button class="chip" id="sdn">⬇ עוד למטה</button><button class="chip" id="sonly">רק הסעיף/פרק הזה</button><button class="chip" id="sall">כל הגיליון</button><button class="chip" id="sgo">🎯 חזרה לתוצאה</button></div><div class="srcw" id="srcw"><table class="xl" style="width:max-content;min-width:100%;table-layout:auto"><thead><tr><th></th>${cols.map(k=>`<th>${esc(lab(hdr[k],k))}</th>`).join('')}</tr></thead><tbody id="srcb"></tbody></table></div>`,'<button class="b g" id="sgx" data-close>סגור</button>');
const W=()=>$('#srcw'),draw=()=>{const rows=only?L.filter(r=>sec(r)===sec(it)):L.slice(lo,hi);$('#srcb').innerHTML=rows.map(rowH).join('');$('#sup').style.display=!only&&lo>0?'':'none';$('#sdn').style.display=!only&&hi<L.length?'':'none';$('#sonly').classList.toggle('on',only);$('#sinfo').textContent=only?`סעיף ${sec(it)} · ${rows.length} שורות`:`שורות ${L[lo].row}–${L[hi-1].row} מתוך ${L.length}`};
d.showModal();draw();const goT=()=>{const e=$('#srow');e&&e.scrollIntoView({block:'center'})};goT();
$('#sup').onclick=()=>{const w=W(),h=w.scrollHeight;lo=Math.max(0,lo-100);draw();w.scrollTop+=w.scrollHeight-h};
$('#sdn').onclick=()=>{hi=Math.min(L.length,hi+100);draw()};
$('#sall').onclick=()=>{only=false;lo=0;hi=L.length;draw();goT()};
$('#sonly').onclick=()=>{only=!only;if(!only){lo=Math.max(0,i0-40);hi=Math.min(L.length,i0+41)}draw();goT()};
$('#sgo').onclick=goT;$('#sgx').onclick=()=>d.close()}
document.addEventListener('click',e=>{const b=e.target.closest('[data-a="opensrc"]');if(b){e.preventDefault();openSrc(b.dataset.i)}});
