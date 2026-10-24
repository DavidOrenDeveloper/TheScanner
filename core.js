(function(g){
const norm=s=>String(s==null?'':s).replace(/[\u0591-\u05C7]/g,'').replace(/["'“”״׳’‘`]/g,'').toLowerCase().replace(/[^\u05D0-\u05EAa-z0-9\s.\/-]/g,' ').replace(/[.\-\/]+(?=\s|$)/g,'').replace(/(^|\s)[.\-\/]+/g,' ').replace(/\s+/g,' ').trim();
const FIN={ך:'כ',ם:'מ',ן:'נ',ף:'פ',ץ:'צ'};
const stem=w=>{let a=w;if(a.length>4&&/(ים|ות)$/.test(a))a=a.slice(0,-2);if(a.length>3&&'הוכלבמש'.includes(a[0]))a=a.slice(1);return a.replace(/[ךםןףץ]/g,x=>FIN[x])};
const toks=t=>new Set(norm(t).split(' ').filter(Boolean).map(stem));
const TG=new Map();
const tri=w=>{let s=TG.get(w);if(s)return s;s=new Set();const x=' '+w+' ';for(let i=0;i<x.length-2;i++)s.add(x.slice(i,i+3));TG.set(w,s);return s};
const lev1=(a,b)=>{if(Math.min(a.length,b.length)<5||Math.abs(a.length-b.length)>1)return false;let i=0;while(i<a.length&&i<b.length&&a[i]===b[i])i++;if(a.length===b.length)return a.slice(i+1)===b.slice(i+1);const[l,sh]=a.length>b.length?[a,b]:[b,a];return l.slice(i+1)===sh.slice(i)};
const dice=(a,b)=>{let n=0;for(const x of a)if(b.has(x))n++;return 2*n/(a.size+b.size)};
const STOP=new Set('של את כל מה על עם או אל לכל גם מצא אילו הסעיפים סעיפים הקשורים נדרש כולל אין יש הדרישות דרישות עבור ולכל מכל'.split(' '));
const DEF_SYN=[
['שקע','שקעים','בית תקע','בתי תקע','ח"ק','ח\'ק','חק'],
['נקודת מאור','נקודות מאור','גוף תאורה','גופי תאורה','תאורה','גוף מאור'],
['שוחת חשמל','שוחות חשמל','שוחה','שוחות','שוחת','שוחת תקשורת','תא בקרה','תא תקשורת','תא מעבר'],
['תעלה','תעלות','סולם כבלים','מגש כבלים','תעלת כבלים'],
['הארקה','השוואת פוטנציאלים','אלקטרודת הארקה','מוליך הארקה'],
['תאורת חירום','שלט יציאה','שלטי יציאה','גוף חירום','פנס חירום'],
['לוח חשמל','לוחות חשמל','לוח','מפסק אוטומטי','מאמ"ת','מא"ז']];
const CONN=new Set('עבור עם כולל כוללת כוללים לרבות בתוך לפי בעל בעלת בעלי המכיל המכילה המכילים המיועד המיועדת שיבוצע שיבוצעו אשר כמפורט לצורך כגון המשמש המשמשת מחובר המחובר המחוברת הכולל הכוללת במסגרת בצמוד כשהוא כשהיא עי על מול מתוך'.split(' ').map(norm));
const headOf=n=>{const w=n.split(' '),i=w.findIndex((x,k)=>k>=1&&CONN.has(x));return i>0?w.slice(0,i).join(' '):n};
const prep=it=>{it.n=norm((it.ref||'')+' '+it.text);it.nc=norm(it.ctx||'');it.t=toks(it.n);if(it.kind==='boq'){it.hn=headOf(norm(it.text));it.ht=toks(it.hn)}else{it.hn=null;it.ht=null}return it};
function expand(q,syn){const nq=' '+norm(q)+' ',out=new Set();for(const gr of syn){const ps=gr.map(norm).filter(Boolean);if(ps.some(p=>nq.includes(' '+p+' ')||nq.includes(' '+p)||(!p.includes(' ')&&nq.split(' ').some(w=>w.length>3&&lev1(stem(w),stem(p))))))ps.forEach(p=>out.add(p))}return[...out]}
function search(q,items,syn,f={}){
const words=norm(q).split(' ').filter(w=>w.length>1&&!STOP.has(w));if(!words.length)return[];
const ex=expand(q,syn).filter(p=>!words.includes(p));
const qt=words.map(w=>({w,s:stem(w),tg:tri(w)})),res=[];
for(const it of items){
if(f.doc&&it.docId!==f.doc)continue;if(f.kind&&it.kind!==f.kind)continue;
let sc=0,hit=0,sy=0,hh=0;const why=new Set(),hits=[],UH=!!it.ht;
for(const x of qt){let tk;
if(it.t.has(x.s)){sc+=3;hit++;why.add('התאמה מדויקת');hits.push({t:x.w,k:'x'});if(UH&&it.ht.has(x.s))hh++}
else if(x.w.length>2&&it.n.includes(x.w)){sc+=2;hit++;why.add('המילה מופיעה כחלק ממילה אחרת');hits.push({t:x.w,k:'x'});if(UH&&it.hn.includes(x.w))hh++}
else if(x.w.length>2&&it.nc.includes(x.w)){sc+=1.5;hit++;why.add('מופיע בכותרת/בהקשר הסעיף')}
else if(x.s.length>=5&&(tk=[...it.t].find(t=>lev1(t,x.s)))){sc+=1;hit++;why.add('כתיב דומה (התאמה מטושטשת)');hits.push({t:tk,k:'f'});if(UH&&it.ht.has(tk))hh++}
else if(x.w.length>4){let b=0,bt;for(const t of it.t){if(Math.abs(t.length-x.w.length)<=2){const d=dice(x.tg,tri(t));if(d>b){b=d;bt=t}}}if(b>=.55){sc+=1;hit++;why.add('כתיב דומה (התאמה מטושטשת)');hits.push({t:bt,k:'f'})}}}
const ns=' '+it.n+' ';
for(const p of ex){if(ns.includes(' '+p)){sy+=2;why.add('מילה נרדפת: '+p);hits.push({t:p,k:'s'});if(UH&&(' '+it.hn+' ').includes(' '+p))hh++;if(sy>=6)break}}
sc+=sy+hit/qt.length*2;if(!hit&&!sy)continue;
const ctxOnly=UH&&!hh;let strength=hit===qt.length?'חזקה':(hit>=qt.length/2&&hit>0)||sy>=2?'בינונית':'חלשה';if(ctxOnly){strength='חלשה';sc*=.3;why.add('מוזכר רק בהקשר (אחרי "עבור / עם / כולל…") – הפריט עצמו הוא משהו אחר')}
res.push({it,sc,strength,why:[...why],hits,ctxOnly})}
return res.sort((a,b)=>b.sc-a.sc).slice(0,f.max||300)}
function parseXlsx(XL,buf,doc){
const wb=XL.read(buf,{type:'array'}),out=[];doc.pages=wb.SheetNames.length;
for(const sn of wb.SheetNames){const ws=wb.Sheets[sn];if(!ws['!ref'])continue;
const r0=XL.utils.decode_range(ws['!ref']).s.r,rows=XL.utils.sheet_to_json(ws,{header:1,defval:'',raw:true}),fm=XL.utils.sheet_to_json(ws,{header:1,defval:'',raw:false});
const KW=/תיאור|פירוט|כמות|יחידה|יח|מחיר|סעיף|פרק|סה"כ|סהכ|מספר|הערות/;
const hi=rows.slice(0,40).findIndex(r=>r.filter(x=>typeof x==='string'&&KW.test(x)).length>=3);
const H=hi>=0?fm[hi].map(x=>String(x).trim()):[],col=re=>H.findIndex(x=>re.test(x)),W=Math.max(0,...rows.map(r=>r.length)),from=hi+1;
const stat=Array.from({length:W},(_,k)=>{let len=0,num=0,sh=0,n=0;for(let i=from;i<Math.min(rows.length,from+300);i++){const v=rows[i][k];if(v===''||v==null)continue;n++;if(typeof v==='number')num++;else{const l=String(v).length;len+=l;if(l<=6)sh++}}return{len,num,sh,n}});
let cD=col(/תיאור|פירוט/);if(cD<0){let b=0;stat.forEach((s,k)=>{if(s.len>b){b=s.len;cD=k}})}if(cD<0)continue;
let cQ=col(/כמות/),cU=col(/^יח|יחידה/),cP=col(/מחיר/);
if(cU<0)cU=stat.findIndex((s,k)=>k>cD&&s.n&&s.num===0&&s.sh>=s.n*.6);
if(cQ<0)cQ=stat.findIndex((s,k)=>k>cD&&k!==cU&&s.n&&s.num>=s.n*.6);
if(cP<0)cP=stat.findIndex((s,k)=>k>cQ&&cQ>=0&&k!==cU&&s.n&&s.num>=s.n*.6);
const label=k=>H[k]||(k<cD?'מספור '+(k+1):k===cD?'תיאור':k===cU?'יחידה':k===cQ?'כמות':k===cP?'מחיר':XL.utils.encode_col(k)),skip=k=>/מס"ד|מסד|^#$/.test(H[k]||'');
doc.sh=doc.sh||{};doc.sh[sn]={hdr:Array.from({length:W},(_,k)=>label(k)),r0,hi,W};
let ctx='';
rows.forEach((r,i)=>{if(i<=hi)return;const f=fm[i].map(x=>String(x).trim()),d=f[cD]||'';if(d.length<3)return;
const refs=[];for(let k=0;k<cD;k++){if(skip(k))continue;if(f[k]&&f[k].length<=14)refs.push(f[k])}const ref=refs.join('.');
const qty=cQ>=0?r[cQ]:'',unit=cU>=0?f[cU]:'',price=cP>=0?r[cP]:'';
if((qty===''||qty==null)&&(price===''||price==null)&&d.length<120)ctx=(ref?ref+' ':'')+d;
out.push({ref,text:d,ctx,qty,unit,price,sheet:sn,row:i+r0+1,cells:Array.from({length:W},(_,k)=>f[k]||''),fields:f.map((x,k)=>[label(k),x]).filter(([,x])=>x!=='')})})}
return out}
function autoSyn(items,syn){
const W=new Map();for(const it of items)for(const w of norm(it.text).split(' '))if(w.length>=3&&!/[\d.\/-]/.test(w)&&!STOP.has(w))W.set(w,(W.get(w)||0)+1);
const by=new Map();for(const[w,c]of W){if(c<2)continue;const k=stem(w);if(!by.has(k))by.set(k,[]);by.get(k).push(w)}
const keys=[...by.keys()].filter(k=>k.length>=4),par={};const f=x=>par[x]===x?x:(par[x]=f(par[x]));keys.forEach(k=>par[k]=k);
for(let i=0;i<keys.length;i++)for(let j=i+1;j<keys.length;j++)if(lev1(keys[i],keys[j]))par[f(keys[i])]=f(keys[j]);
const cl=new Map();for(const k of keys){const r=f(k);if(!cl.has(r))cl.set(r,new Set());by.get(k).forEach(w=>cl.get(r).add(w))}
const groups=[];for(const s of cl.values())if(s.size>=2)groups.push([...s]);
const P=new Map();for(const it of items){const t=String(it.text);if(!/[\/()]/.test(t)||norm(t).split(' ').length>6)continue;const segs=t.split(/[\/()]| או /).map(norm).filter(x=>x.length>=2&&/^[\u05D0-\u05EA ]+$/.test(x)&&x.split(' ').length<=3);if(segs.length>=2&&segs.length<=4){const k=[...segs].sort().join('|');P.set(k,(P.get(k)||0)+1)}}
for(const[k,c]of P)if(c>=2)groups.push(k.split('|'));
const out=syn.map(g=>[...g]);let added=0;
for(const g of groups){const ng=g.map(norm);const tgt=out.find(o=>o.map(norm).some(p=>ng.includes(p)));if(!tgt){out.push(g);added+=g.length;continue}const have=tgt.map(norm);for(const p of g)if(!have.includes(norm(p))){tgt.push(p);added++}}
return{syn:out,added}}
function topTerms(items,n){const B=new Map(),U=new Map();for(const it of items){const w=norm(it.text).split(' ').filter(x=>x.length>=2&&!STOP.has(x)&&!/\d/.test(x));w.forEach((x,i)=>{if(x.length>=4)U.set(x,(U.get(x)||0)+1);if(i&&w[i-1].length>=2){const b=w[i-1]+' '+x;B.set(b,(B.get(b)||0)+1)}})}
const a=[...B].filter(([,c])=>c>=3).sort((x,y)=>y[1]-x[1]).slice(0,n).map(x=>x[0]),b=[...U].filter(([,c])=>c>=5).sort((x,y)=>y[1]-x[1]).map(x=>x[0]);return[...new Set([...a,...b])].slice(0,n)}
function related(res,q){const qs=new Set(norm(q).split(' ').map(stem)),C=new Map();for(const r of res.slice(0,25)){const seen=new Set();for(const w of norm(r.it.text).split(' ')){if(w.length<3||STOP.has(w)||/\d/.test(w)||qs.has(stem(w))||seen.has(w))continue;seen.add(w);C.set(w,(C.get(w)||0)+1)}}
return[...C].filter(([,c])=>c>=2).sort((a,b)=>b[1]-a[1]).slice(0,8).map(x=>x[0])}
function highlight(raw,hits,mode){raw=String(raw);const out=[],re=/[\u05D0-\u05EA\w"'׳״]+(?:[.\-][\u05D0-\u05EA\w]+)*/g,sp=[];let m;
while(m=re.exec(raw))sp.push({s:m.index,e:m.index+m[0].length,n:norm(m[0])});const mk=new Array(sp.length).fill(null);
for(const h of [...(hits||[])].sort((a,b)=>(a.k==='f')-(b.k==='f'))){const pw=h.t.split(' ');for(let i=0;i+pw.length<=sp.length;i++){let ok=true;for(let j=0;j<pw.length;j++){const n=sp[i+j].n,p=pw[j];if(!n||!(n===p||stem(n)===stem(p)||stem(n)===p||(p.length>2&&n.includes(p))||(h.k==='f'&&lev1(stem(n),stem(p))))){ok=false;break}}if(ok)for(let j=0;j<pw.length;j++)mk[i+j]=mk[i+j]||h.k}}
const E=x=>mode==='text'?x:x.replace(/[&<>]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;'}[c]));let pos=0;
for(let i=0;i<sp.length;i++){if(!mk[i])continue;let j=i;while(j+1<sp.length&&mk[j+1]===mk[i]&&/^\s*$/.test(raw.slice(sp[j].e,sp[j+1].s)))j++;
out.push(E(raw.slice(pos,sp[i].s)));const seg=E(raw.slice(sp[i].s,sp[j].e));out.push(mode==='text'?'【'+seg+'】':'<mark class="m-'+mk[i]+'">'+seg+'</mark>');pos=sp[j].e;i=j}
out.push(E(raw.slice(pos)));return out.join('')}
const COST=/כלול במחיר|כלולים במחיר|כלולה במחיר|לא ישולם|ללא תמורה|על חשבון הקבלן|ללא תשלום נוסף|במחיר היחידה|לא יימדד|כלול בסעיף|כלולים בסעיף|לא תשולם/;
const REQ=/חובה|על הקבלן|תקן|תי |בדיק|בדק|אישור|יאושר|דוגמ|תעוד|עדות|אחריות|מבדק/;
const TECH=/\d+(?:\.\d+)?\s?[x×*]\s?\d+(?:\.\d+)?|ip\s?\d{2}|\d+(?:\.\d+)?\s?(?:amp|אמפר|ממ|וולט|ואט|kw|kva|[avw])(?![a-zא-ת])/g;
const tkey=t=>/^ip/.test(t)?'ip':/[x×*]/.test(t)?'dim':t.replace(/[\d.]/g,'');
const tech=n=>{const o={};(n.match(TECH)||[]).forEach(t=>{t=t.replace(/\s/g,'');(o[tkey(t)]=o[tkey(t)]||new Set()).add(t)});return o};
const GEN=new Set('אספקה ואספקה התקנת והתקנת התקנה להתקנת חיבור ממר ממ מטר מטרים מידות מידה מידת גודל גדלים צורה כללי כללית כולל לרבות סוג עבור כמפורט לפי מושלם מוכן ביצוע עבודה עבודות מכל הכל דגם יצרן שווה ערך כמות'.split(' '));
const core=n=>{const o=[];for(const w of n.split(' ')){if(w.length<2||STOP.has(w)||/\d/.test(w))continue;const s=stem(w);if(GEN.has(w)||GEN.has(s)||GEN.has(stem(s)))continue;if(!o.includes(s))o.push(s)}return o};
const UNR=/(\d+(?:\.\d+)?)\s?(ממר|ממ|סמ|אמפר|ka|kva|kv|kw|va|וולט|מטר|a|v|w|אינץ)(?![א-תa-z])/g,DIM=/\d+\s?[x×*]\s?\d+(?:\.\d+)?/g;
const attrs=n=>{const o={};let m;UNR.lastIndex=0;while(m=UNR.exec(n)){const k=m[2];(o[k]=o[k]||new Set()).add(String(parseFloat(m[1])))}(n.match(DIM)||[]).forEach(d=>{(o.dim=o.dim||new Set()).add(d.replace(/\s/g,'').replace(/[×*]/,'x'))});return o};
const QG=[[/חד ?גיד/,/דו ?גיד/,/תלת ?גיד/,/רב ?גיד/],[/מתח גבוה/,/מתח בינוני/,/מתח נמוך/],[/נחושת/,/אלומיני/]];
const quals=n=>QG.map(g=>{const s=new Set();g.forEach((r,i)=>{if(r.test(n))s.add(i)});return s});
const qConf=(a,b)=>a.some((s,i)=>s.size&&b[i].size&&![...s].some(x=>b[i].has(x)));
const nConf=(a,b)=>{const o=[];for(const k in a)if(b[k]&&![...a[k]].some(v=>b[k].has(v)))o.push(k==='dim'?'מידות/חתך':k+': '+[...a[k]].join('/')+' ↔ '+[...b[k]].join('/')+(k==='dim'?'':''));return o};
function matchSpec(b,pool,syn,min,minC,min0){
const bc=core(b.n).slice(0,14),ba=attrs(b.n),bq=quals(b.n),out=[];if(!bc.length)return out;
const alts=bc.map(t=>expand(t,syn));const head=0;
for(const it of pool){const cov=bc.map((t,i)=>it.t.has(t)||(t.length>=3&&it.n.includes(t))||alts[i].some(p=>(' '+it.n).includes(' '+p)));
if(!cov[head])continue;const c=cov.filter(Boolean).length,cn=it.cn||(it.cn=core(it.n)),den=Math.min(bc.length,Math.max(cn.length,1)),ratio=c/den;if(!min0&&bc.length>1&&!cov[1]&&ratio<.6)continue;
if(c<Math.min(minC||2,bc.length)||ratio<min)continue;
if(qConf(bq,quals(it.n)))continue;const sa=attrs(it.n),cf=Object.entries(ba).flatMap(([k,v])=>{const s=sa[k];return s&&![...v].some(x=>s.has(x))?[k==='dim'?'חתך/מידות: '+[...v].join(',')+' ↔ '+[...s].join(','):k+': '+[...v].join(',')+' ↔ '+[...s].join(',')]:[]});
if(cf.length&&ratio<.6)continue;
let eq=0;for(const k in ba)if(sa[k]&&[...ba[k]].some(x=>sa[k].has(x)))eq++;
out.push({it,sc:ratio*10+eq*3-cf.length,strength:ratio>=.75||(eq>=1&&ratio>=.6)?'חזקה':'בינונית',why:['התאמת מונחי הפריט: '+c+' מתוך '+den+(eq?' · מידות זהות':'')],hits:bc.filter((_,i)=>cov[i]).map(t=>({t,k:'x'})),gap:cf})}
return out.sort((a,b)=>b.sc-a.sc)}
function compareOne(b,cands,syn,sem,topic){
const fl=new Map(),add=(k,t,d)=>{if(fl.has(k)){if(k==='פער טכני'&&!fl.get(k).d.includes(d))fl.get(k).d+=' | '+d;return}fl.set(k,{k,t,d})};
const pool=[...cands];if(sem)sem.forEach(s=>{if(!pool.some(x=>x.id===s.it.id))pool.push(s.it)});
const m=matchSpec(b,pool,syn,.5).slice(0,3);
let tm=[];if(topic&&topic.length){const tp=pool.filter(it=>topic.some(t=>it.t.has(t))&&!m.some(x=>x.it.id===it.id));tm=matchSpec(b,tp,syn,0,1,1).slice(0,2)}
if(!m.length)add('אין התאמה מדויקת במפרט','נושא לבירור','לא נמצא סעיף מפרט שמתאר את אותו פריט עם אותם מאפיינים. ייתכן שאינו מפורט, או שהמונחים שונים (אפשר להוסיף למילון).');
for(const r of m){const n=r.it.n,rf=r.it.ref||('עמ׳ '+r.it.page);
if(COST.test(n))add('כלול במחיר?','סיכון לעלות נוספת','בסעיף מפרט '+rf+' מופיעה לשון של "כלול / לא ישולם בנפרד". ודא שהתמחור כולל זאת.');
if(REQ.test(n))add('דרישות / בדיקות / אישורים','הזדמנות לתיעוד','בסעיף מפרט '+rf+' יש דרישות לביצוע, בדיקות או אישורים. בדוק מה נדרש לתעד ולתמחר.');
r.gap.forEach(g=>add('פער טכני','פער בין מסמכים','כתב כמויות ↔ מפרט ('+rf+'): '+g))}
if(!(+b.price>0)&&b.qty!==''&&b.qty!=null)add('ללא מחיר','נושא לבירור','לסעיף אין מחיר בכתב הכמויות.');
return{b,m,tm,flags:[...fl.values()]}}
g.Core={norm,stem,toks,search,expand,parseXlsx,prep,DEF_SYN,autoSyn,topTerms,related,highlight,compareOne,STOP,core};if(typeof module!=='undefined')module.exports=g.Core})(typeof window!=='undefined'?window:globalThis);
