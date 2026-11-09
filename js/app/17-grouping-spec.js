// תצוגה מקובצת וכפתור 'מה אומר המפרט'
const grpH=L=>{const G=new Map(),sp=[];
for(const r of L){const it=r.it;if(it.kind!=='boq'){sp.push(r);continue}const tx=it.inh?it.inh.eff:it.text,k=Core.norm(tx)+'|'+(it.unit||'');let g=G.get(k);if(!g){g={tx,it,unit:it.unit||'',n:0,tot:0,hasQ:false,b:new Map(),hits:r.hits};G.set(k,g)}
g.n++;const q=parseFloat(String(it.qty).replace(/,/g,'')),c=ch(it),b=g.b.get(c)||{n:0,q:0};b.n++;if(isFinite(q)){g.tot+=q;g.hasQ=true;b.q+=q}g.b.set(c,b)}
const f=x=>+x.toFixed(2),rows=[...G.values()].map(g=>`<tr><td>${hlt(g.tx,g.hits,'boq')}${g.it.inh?`<div class="inh">↳ מושלם מסעיף ${esc(g.it.inh.ref)}</div>`:''}</td><td>${esc(g.unit)}</td><td><b>${g.hasQ?f(g.tot):'—'}</b></td><td>${g.n}</td><td>${[...g.b].sort((x,y)=>nat(x[0],y[0])).map(([c,b])=>`<span class="tag">${esc(chName(c))}: ${b.q?f(b.q):b.n+' שורות'}</span>`).join(' ')}</td></tr>`).join('');
return`<div class="card">📊 תצוגה מקובצת: סעיפים זהים מאוחדים, עם סה"כ כמות ופירוט לפי מבנה (${G.size} סעיפים). אפשר לכבות ב"אפשרויות חיפוש מתקדמות".</div><div class="tw"><table class="tb"><thead><tr><th>סעיף</th><th>יח'</th><th>סה"כ כמות</th><th>הופעות</th><th>פירוט לפי מבנה</th></tr></thead><tbody>${rows}</tbody></table></div>`+(sp.length?`<h3>מפרט</h3><div class="grid">${sp.map(resRow).join('')}</div>`:'')};
const specB=it=>P().spb!==false&&it.kind==='boq'?`<button class="b g" data-a="spec" data-i="${it.id}">📘 מה אומר המפרט</button>`:'',specBox=it=>P().spb!==false&&it.kind==='boq'?`<div class="spx" id="spx_${it.id}"></div>`:'';
function specHtml(it){const sp=ITEMS.filter(x=>x.kind==='spec');if(!sp.length)return'<div class="src">לא הועלה מפרט.</div>';
const q=(it.inh?it.inh.eff:it.text).split(/\s+/).filter(w=>!/\d/.test(w)).slice(0,10).join(' '),r=Core.search(q,sp,S.syn,{kind:'spec'}).slice(0,3);
return r.length?r.map(x=>`<div class="spi"><b>${esc(src(x.it))}</b><div>${hlt(x.it.text.length>300?x.it.text.slice(0,300)+'…':x.it.text,x.hits,'spec')}</div></div>`).join(''):'<div class="src">לא נמצאה התאמה במפרט.</div>'}
document.addEventListener('click',e=>{const b=e.target.closest('[data-a="spec"]');if(!b)return;const id=b.dataset.i,it=ITEMS.find(x=>x.id===id);if(!it)return;let box=$('#spx_'+id);
if(!box){const tr=b.closest('tr');if(!tr)return;const nx=tr.nextElementSibling;if(nx&&nx.classList.contains('spxr')){nx.remove();return}const nr=document.createElement('tr');nr.className='spxr';nr.innerHTML='<td colspan="99"><div class="spx"></div></td>';tr.after(nr);box=nr.querySelector('.spx')}
else if(box.innerHTML){box.innerHTML='';return}
box.innerHTML=specHtml(it)});
document.addEventListener('change',async e=>{const t=e.target,a=t.dataset&&t.dataset.a;if(!['grp','spb','slx'].includes(a))return;keepQ();P()[a]=t.checked;
if(a==='slx'){Core.setSlash(t.checked);ITEMS.forEach(Core.prep);Core.inherit(ITEMS,P().inh!==false)}await save();a==='slx'&&Q.trim()?await doSearch():a==='grp'?renderList():render()});
