// חלוניות
// ---- dialogs
const D=()=>$('#dlg');
let PANEL=null;
(()=>{const sm=HTMLDialogElement.prototype.showModal;HTMLDialogElement.prototype.showModal=function(){if(!this.open)sm.call(this);decorateDlg(this)}})();
function closeDlg(d){const c=d.querySelector('#mcn,[data-close]');c?c.click():d.close()}
function decorateDlg(d){d.querySelectorAll(':scope>.dx').forEach(x=>x.remove());const x=document.createElement('button');x.type='button';x.className='dx noprint';x.setAttribute('aria-label','סגור');x.title='סגור';x.textContent='✕';x.onclick=()=>closeDlg(d);d.prepend(x)}
document.addEventListener('click',e=>{const d=e.target;if(d&&d.tagName==='DIALOG'&&d.open&&d.dataset.bd==='1'){const r=d.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)closeDlg(d)}});
const dlgBox=(body,foot)=>`<div class="dbody">${body}</div><div class="dfoot">${foot}</div>`;
const panelHtml=()=>dlgBox(`<h3 class="ptl">${PANEL.title}</h3>${PANEL.body()}`,'<button class="b" id="pclose" data-close>סגור</button>');
function openPanel(title,body){PANEL={title,body};const d=D();d.style.width='min(760px,96vw)';d.dataset.bd='1';d.oncancel=null;d.innerHTML=panelHtml();d.showModal();d.querySelector('#pclose').onclick=()=>d.close()}
function refreshPanel(){if(!PANEL)return;const d=D();if(!d.open){PANEL=null;return}const b=d.querySelector('.dbody'),st=b?b.scrollTop:0;d.innerHTML=panelHtml();decorateDlg(d);d.querySelector('#pclose').onclick=()=>d.close();const nb=d.querySelector('.dbody');if(nb)nb.scrollTop=st}
D().addEventListener('close',()=>{if(!D().open)PANEL=null});
const modal=(html,init,okL='אישור')=>new Promise(ok=>{const d=D();PANEL=null;d.style.width='';const info=!init&&/^(סגור|הבנתי)$/.test(okL);d.dataset.bd=info?'1':'';d.innerHTML=dlgBox(html,`<button class="b" id="mok"${info?' data-close':''}>${okL}</button>${info?'':'<button class="b g" id="mcn">ביטול</button>'}`);d.showModal();const done=v=>{d.close();ok(v)};if(!info)$('#mcn').onclick=()=>done(null);d.oncancel=()=>ok(null);$('#mok').onclick=()=>done(init?init():true);const i=d.querySelector('.dbody input,.dbody select');i&&i.focus()});
const askText=(t,v='')=>modal(`<b>${t}</b><input id="mi" value="${esc(v)}">`,()=>$('#mi').value.trim()||null);
const confirmD=(m,l)=>modal(`<p>${m}</p>`,null,l||'אישור').then(v=>!!v);
const selFolder=async(title,excl)=>{const L=S.folders.filter(f=>f.id!==excl);const v=await modal(`<b>${title}</b><select id="pf">${L.map(f=>`<option value="${f.id}"${f.id===LF?' selected':''}>${esc(f.name)}</option>`).join('')}<option value="_new">+ תיק חדש…</option></select>`,()=>$('#pf').value);if(!v)return null;if(v==='_new'){const n=await askText('שם התיק החדש');if(!n)return null;const f={id:uid(),name:n,items:[]};S.folders.push(f);LF=f.id;return f}LF=v;return S.folders.find(f=>f.id===v)};
