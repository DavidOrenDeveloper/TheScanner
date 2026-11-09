// כותרות עמודות מוצמדות
// ================= כותרות עמודות מוצמדות =================
let PHK='';
function pinUpdate(){const f=$('#phf');if(!f)return;const off=()=>{f.style.display='none';PHK=''};
if(P().pin===false||tab!=='home'||(D().open)){return off()}
const bar=document.querySelector('.rbar'),top=bar?bar.getBoundingClientRect().bottom:0;let hit=null;
for(const t of document.querySelectorAll('#rl table.xl,#rl table.tb')){const th=t.tHead;if(!th)continue;const r=t.getBoundingClientRect(),hr=th.getBoundingClientRect();if(hr.top<top-1&&r.bottom>top+hr.height+24){hit=t;break}}
if(!hit)return off();
const th=hit.tHead,hr=th.getBoundingClientRect(),cont=hit.closest('.tw')||hit.parentElement,cr=cont.getBoundingClientRect(),tr=hit.getBoundingClientRect(),z=ZM||1,ws=[...th.rows[0].cells].map(c=>c.getBoundingClientRect().width/z);
const key=ws.map(Math.round).join(',')+'|'+z+'|'+hit.className+'|'+th.rows[0].cells.length+'|'+(hit.dataset.pk||'');
if(key!==PHK||f._t!==hit){PHK=key;f._t=hit;const c=hit.cloneNode(false);c.removeAttribute('style');c.className=hit.className;c.style.width=ws.reduce((a,b)=>a+b,0)+'px';c.style.tableLayout='fixed';c.innerHTML='<colgroup>'+ws.map(w=>`<col style="width:${w}px">`).join('')+'</colgroup>';const h2=th.cloneNode(true);h2.querySelectorAll('.rsz').forEach(x=>x.remove());h2.querySelectorAll('input,button').forEach(x=>x.remove());c.appendChild(h2);f.innerHTML='';f.appendChild(c)}
const c=f.firstChild;f.style.cssText=`display:block;top:${top}px;left:${cr.left}px;width:${cr.width}px;height:${hr.height}px`;c.style.left=(tr.left-cr.left)+'px';c.style.transform=z===1?'':`scale(${z})`}
(()=>{const f=document.createElement('div');f.id='phf';f.className='noprint';f.setAttribute('aria-hidden','true');document.body.appendChild(f);let q=0;const go=()=>{if(q)return;q=requestAnimationFrame(()=>{q=0;pinUpdate()})};addEventListener('scroll',go,{passive:true,capture:true});addEventListener('resize',go)})();
document.getElementById('toast').addEventListener('click',()=>{document.getElementById('toast').style.display='none'});document.getElementById('embchip').addEventListener('click',()=>{tab='set';openF=null;render();scrollTo(0,0)});
