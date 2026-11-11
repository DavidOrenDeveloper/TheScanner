(function(g){
let SLR=/(?!)/g;const setSlash=v=>{SLR=v?/(\d)\s*\/\s*(?=\d)/g:/(?!)/g};
const norm=s=>String(s==null?'':s).replace(/[\u0591-\u05C7]/g,'').replace(/["'“”״׳’‘`]/g,'').toLowerCase().replace(/(\d)\s*[x×*\\]\s*(?=\d)/g,'$1x').replace(SLR,'$1x').replace(/(^|\s)(?:מממר|mm2|ממ2)(?=\s|$)/g,'$1ממר').replace(/([\u05D0-\u05EA])-+(?=[\u05D0-\u05EA])/g,'$1 ').replace(/[^\u05D0-\u05EAa-z0-9\s.\/-]/g,' ').replace(/[.\-\/]+(?=\s|$)/g,'').replace(/(^|\s)[.\-\/]+/g,' ').replace(/\s+/g,' ').trim();
const FIN={ך:'כ',ם:'מ',ן:'נ',ף:'פ',ץ:'צ'};
const stem=w=>{let a=w;if(a.length>4&&/(ים|ות)$/.test(a))a=a.slice(0,-2);if(a.length>3&&'הוכלבמש'.includes(a[0]))a=a.slice(1);return a.replace(/[ךםןףץ]/g,x=>FIN[x])};
const sv=w=>{const o=new Set();let a=w;if(a.length>4&&/(ים|ות)$/.test(a))a=a.slice(0,-2);const b=[a];if(a.length>3&&'הוכלבמש'.includes(a[0]))b.push(a.slice(1));for(const x of b){o.add(x);if(x.length>=4&&x.endsWith('ה'))o.add(x.slice(0,-1));if(x.length>=4&&x.endsWith('ת'))o.add(x.slice(0,-1));if(x.length>=3&&x.endsWith('י'))o.add(x.slice(0,-1))}for(const x of [...o]){const s2=x[0]+x.slice(1).replace(/[וי]/g,'');if(s2.length>=3&&s2!==x)o.add(s2)}if(w.length===4&&/(ים|ות)$/.test(w))o.add(w.slice(0,2));if(w.length===3&&w.endsWith('י'))o.add(w.slice(0,2));return[...o].map(z=>z.replace(/[ךםןףץ]/g,y=>FIN[y]))};
const toks=t=>new Set(norm(t).split(' ').filter(Boolean).flatMap(sv));
const TG=new Map();
const tri=w=>{let s=TG.get(w);if(s)return s;s=new Set();const x=' '+w+' ';for(let i=0;i<x.length-2;i++)s.add(x.slice(i,i+3));TG.set(w,s);return s};
const lev1=(a,b)=>{if(Math.min(a.length,b.length)<5||Math.abs(a.length-b.length)>1)return false;let i=0;while(i<a.length&&i<b.length&&a[i]===b[i])i++;if(a.length===b.length)return a.slice(i+1)===b.slice(i+1);const[l,sh]=a.length>b.length?[a,b]:[b,a];return l.slice(i+1)===sh.slice(i)};
const dice=(a,b)=>{let n=0;for(const x of a)if(b.has(x))n++;return 2*n/(a.size+b.size)};
const STOP=new Set('של את כל מה על עם או אל לכל גם מצא אילו הסעיפים סעיפים הקשורים נדרש כולל אין יש הדרישות דרישות עבור ולכל מכל'.split(' '));
const DEF_SYN=[
['שקע','שקעים','תקע','תקעים','בית תקע','בתי תקע','ח"ק','ח\'ק','חק','חיבור קירי'],
['נקודת מאור','נקודות מאור','גוף תאורה','גופי תאורה','תאורה','גוף מאור'],
['שוחת חשמל','שוחות חשמל','שוחה','שוחות','שוחת','שוחת תקשורת','שוחת בזק','שוחת ביקורת','שוחות ביקורת','תא בקרה','תא ביקורת','תא בזק','תא תקשורת','תיבת ביקורת','תא מעבר'],
['תעלה','תעלות','סולם כבלים','מגש כבלים','תעלת כבלים'],
['הארקה','השוואת פוטנציאלים','אלקטרודת הארקה','מוליך הארקה'],
['תאורת חירום','שלט יציאה','שלטי יציאה','גוף חירום','פנס חירום'],
['לוח חשמל','לוחות חשמל','לוח','לוחות'],
['מפסק אוטומטי','מפסק אוטומטי זעיר','מא"ז','מפסק זעיר'],['מפסק אוטומטי מגנטי תרמי','מפסק אוטומטי מגנטו תרמי','מאמ"ת','מגנטו תרמי'],['על הטיח','עה"ט'],['שוה ערך','שווה ערך','שו"ע','שוו"ע'],
['אל פסק','אל-פסק','ups','מערכת אל פסק'],['ממסר פחת','מפסק פחת','מפסק זרם דלף','ממסר זרם דלף','מפסק מגן זרם דלף','rcd','rccb'],['מנתק בעומס','מנתק עומס']];
const CONN=new Set('עבור עם כולל כוללת כוללים לרבות בתוך לפי בעל בעלת בעלי המכיל המכילה המכילים המיועד המיועדת שיבוצע שיבוצעו אשר כמפורט לצורך כגון המשמש המשמשת מחובר המחובר המחוברת הכולל הכוללת במסגרת בצמוד כשהוא כשהיא עי על מול מתוך'.split(' ').map(norm));
const headOf=n=>{const w=n.split(' '),i=w.findIndex((x,k)=>k>=1&&CONN.has(x));return i>0?w.slice(0,i).join(' '):n};
const hasP=(ns,p)=>p.length<=3?ns.includes(' '+p+' '):ns.includes(' '+p);
const prep=it=>{it.n=norm((it.ref||'')+' '+(it.full||it.text));it.nc=norm(it.ctx||'');it.t=toks(it.n);it.tl=it.n.split(/[\s\/\-]+/).filter(Boolean);if(it.kind==='boq'){it.hn=headOf(norm(it.text));it.ht=toks(it.hn)}else{it.hn=null;it.ht=null}return it};
const bv=w=>{const o=new Set([w]);let a=w;if(a.length>4&&/(ים|ות)$/.test(a)){a=a.slice(0,-2);o.add(a)}const b=[a];if(a.length>3&&'הוכלבמש'.includes(a[0]))b.push(a.slice(1));for(const x of b){o.add(x);if(x.length>=4&&/[הת]$/.test(x))o.add(x.slice(0,-1));if(x.length>=4&&x.endsWith('י'))o.add(x.slice(0,-1))}return[...o].filter(z=>z.length>=3).map(z=>z.replace(/[ךםןףץ]/g,y=>FIN[y]))};
const skel=w=>{let a=w;if(a.length>4&&/(ים|ות)$/.test(a))a=a.slice(0,-2);return(a[0]+a.slice(1).replace(/[וי]/g,'')).replace(/[ךםןףץ]/g,y=>FIN[y])};
const tokEq=(a,b)=>{if(a===b)return true;if(a.length<=3||b.length<=3){const[s,l]=a.length<=b.length?[a,b]:[b,a];return s.length>=2&&((l.length===s.length+1&&'הולב'.includes(l[0])&&l.slice(1)===s)||(l.length===s.length+1&&l.startsWith(s)&&/[יהת]$/.test(l))||(l.length===s.length+2&&l.startsWith(s)&&/^(?:ים|ות)$/.test(l.slice(s.length))))}const x=bv(a),y=bv(b);if(x.some(v=>y.includes(v)))return true;const k=skel(a);return k.length>=3&&k===skel(b)};
const hasPh=(tl,pt)=>{for(let i=0;i+pt.length<=tl.length;i++){let ok=true;for(let j=0;j<pt.length;j++)if(!tokEq(tl[i+j],pt[j])){ok=false;break}if(ok)return true}return false};
const near=(tl,core,w)=>{if(core.length<2)return hasPh(tl,core);const pos=core.map(c=>tl.reduce((a,t,i)=>(tokEq(t,c)&&a.push(i),a),[]));if(pos.some(p=>!p.length))return false;return pos[0].some(i0=>pos.every(p=>p.some(i=>Math.abs(i-i0)<=w)))};
const subTok=(tl,w,n)=>(/[a-z0-9]/.test(w)&&w.length>=3&&n.includes(w))||w.length>=3&&tl.some(t=>t.length<=w.length+3&&(t.startsWith(w)||(t.length<=w.length+2&&t.endsWith(w)&&PFXR.test(t.slice(0,t.length-w.length)))));
const SANC=new WeakMap(),MRG=new WeakMap();
const fam=m=>norm(m).split(' ').map(stem).join(' ');
let TRUST=new Set();const setTrust=a=>{TRUST=new Set((a||[]).map(norm))};
const synSig=s=>s.length+':'+TRUST.size+':'+s.reduce((a,g)=>a+g.length+g.reduce((b,m)=>b+String(m).length,0),0);
function cleanSyn(syn){const sg=synSig(syn),e0=SANC.get(syn);if(e0&&e0.sg===sg)return e0.v;let c=[];for(const g of syn){const F=new Map();for(const m of g){if(!norm(m))continue;const k=fam(m);if(!F.has(k))F.set(k,[]);F.get(k).push(m)}
const ks=[...F.keys()],bad=new Set();for(let i=0;i<ks.length;i++)for(let j=i+1;j<ks.length;j++){const a=ks[i],b=ks[j];if(!F.get(a).some(m=>TRUST.has(norm(m)))&&!F.get(b).some(m=>TRUST.has(norm(m)))&&a.length>=4&&b.length>=4&&!a.includes(' ')&&!b.includes(' ')&&(lev1(a,b)||(Math.abs(a.length-b.length)<=2&&dice(tri(a),tri(b))>=.6))){bad.add(a);bad.add(b)}}
const keep=ks.filter(k=>!bad.has(k)).flatMap(k=>F.get(k));if(new Set(keep.map(fam)).size>=2)c.push(keep)}SANC.set(syn,{sg,v:c});return c}
function mergeDef(syn){const sg=synSig(syn),e0=MRG.get(syn);if(e0&&e0.sg===sg)return e0.v;const DN=DEF_SYN.map(d=>d.map(norm)),base=[];
for(const g0 of cleanSyn(syn)){const g=[...g0],gn=g.map(norm);if(gn.some(m=>TRUST.has(m))){base.push(g);continue}const hit=DN.map((d,i)=>gn.some(m=>d.includes(m))?i:-1).filter(i=>i>=0),nf=new Set(g.map(fam)).size;
if(!hit.length){if(nf<=12)base.push(g);continue}
if(hit.length===1&&nf<=DN[hit[0]].length+14)base.push(g)}
for(const d of DEF_SYN){const dn=d.map(norm),tg=base.find(g=>g.some(m=>dn.includes(norm(m))));if(!tg){base.push([...d]);continue}const have=tg.map(norm);d.forEach((m,i)=>{if(!have.includes(dn[i]))tg.push(m)})}
MRG.set(syn,{sg,v:base});MRG.set(base,{sg:synSig(base),v:base});return base}
function concepts(q,syn){const qt=norm(q).split(' ').filter(Boolean),out=[];for(const gr of syn){const ps=gr.map(norm).filter(Boolean).map(p=>p.split(' '));const m=ps.find(p=>p.length>=2&&hasPh(qt,p));if(m)out.push({core:m,members:ps})}return out}
function expand(q,syn){const qt=norm(q).split(' ').filter(Boolean),out=new Set();for(const gr of syn){const ps=gr.map(norm).filter(Boolean);if(ps.some(p=>hasPh(qt,p.split(' '))))ps.forEach(p=>out.add(p))}return[...out]}
const FINX=w=>w.replace(/[ךםןףץ]/g,y=>FIN[y]);
const eqForm=(t,w)=>{const A=FINX(t),B=FINX(w);if(A===B||stem(t)===stem(w)||rt(t)===rt(w))return true;if((A.length===B.length+1&&A.startsWith(B)&&/[יהת]$/.test(A))||(B.length===A.length+1&&B.startsWith(A)&&/[יהת]$/.test(B)))return true;if((A.length===B.length+2&&A.startsWith(B)&&/(?:ימ|ות|ינ)$/.test(A))||(B.length===A.length+2&&B.startsWith(A)&&/(?:ימ|ות|ינ)$/.test(B)))return true;for(let L=1;L<=Math.min(3,t.length-2);L++){if(PFXR.test(t.slice(0,L))){const base=t.slice(L);if(base.length>=2&&(FINX(base)===B||rt(base)===rt(w)||stem(base)===stem(w)))return true}}return false};
const strictTok=(tl,x)=>{let alt=null;for(const t of tl){if(!t||/^\d/.test(t))continue;if(eqForm(t,x.w))return true;if(!alt&&sv(t).some(z=>x.ss.includes(z)))alt=t}return alt||true};
const cidx=(tl,i)=>{let c=0;for(let k=0;k<i;k++){const n=tl[k];if(n&&n.length>=2&&!/\d/.test(n)&&!STOP.has(n)&&!GEN.has(n)&&!CONN.has(n))c++}return c};
const posOf=(tl,w)=>{const o=[];for(let i=0;i<tl.length;i++){const t=tl[i];if(tokEq(t,w)||(w.length>=3&&t.startsWith(w)&&t.length<=w.length+3))o.push(i)}return o};
const spanGap=(tl,ws)=>{const P=ws.map(w=>posOf(tl,w));if(P.some(p=>!p.length))return -1;let best=1e9;for(const a of P[0]){let g=0;for(let k=1;k<P.length;k++){let m=1e9;for(const b of P[k])m=Math.min(m,Math.abs(b-a));g=Math.max(g,m)}best=Math.min(best,g)}return best};
const POLY=[
{id:'תעלה',terms:['תעלה','תעלות','תעלת'],senses:[
{id:'cable',label:'תעלת כבלים',def:1,cues:['כבל','סולם','מחורצ','רשת','פח','מכסה','pvc','מתכת','פלסטית','מלאה','פל']},
{id:'dig',label:'תעלת חפירה',cues:['חפיר','חציב','אספלט','כביש','קרקע','עפר','מילוי','חול','ריפוד','מדרכה']}]},
{id:'מעבר',terms:['מעבר'],senses:[
{id:'phys',label:'מעבר (אש / כבלים / ארון)',def:1,cues:['אש','כבל','קיר','תקרה','הסתעפות','ארון','קידוח','שרוול','פתח','צינור']},
{id:'time',label:'מעבר (תקופה / תופעה)',cues:['תופעות','תקופת','תקופה','חודש','חודשים','זמני']}]}];
const cueHit=(t,c)=>{t=FINX(t);c=FINX(c);return c.length>=4?t.includes(c):t.replace(/^[והבלמש]/,'')===c||t===c};
const polyQ=(words,TQ)=>{const o=[];for(const p of POLY){if(!words.some(w=>p.terms.some(t=>tokEq(w,norm(t)))))continue;let sel=null;for(const sn of p.senses)if(TQ.some(w=>!p.terms.some(t=>tokEq(w,norm(t)))&&sn.cues.some(c=>cueHit(w,c)))){sel=sn;break}if(!sel)sel=p.senses.find(z=>z.def);o.push({p,sel})}return o};
const polyAdj=(r,PQ,tl)=>{for(const{p,sel}of PQ){const got=new Set();for(let i=0;i<tl.length;i++){if(!p.terms.some(t=>tokEq(tl[i],norm(t))))continue;for(let j=Math.max(0,i-3);j<=Math.min(tl.length-1,i+4);j++){if(j===i)continue;for(const sn of p.senses)if(sn.cues.some(c=>cueHit(tl[j],c)))got.add(sn.id)}}
if(got.size&&!got.has(sel.id)){const o=p.senses.find(z=>got.has(z.id));r.strength='חלשה';r.sc*=.35;r.poly={id:o.id,label:o.label};r.why.push('משמעות אחרת של המונח: '+o.label+' (חיפשת: '+sel.label+'). לתוצאות מסוג זה חפש במפורש')}}return r};
function search(q,items,syn,f={}){
syn=mergeDef(syn);
const exc=[],phr=[];q=String(q).replace(/(^|\s)-(\S+)/g,(m,a,w)=>{exc.push(norm(w));return a}).replace(/(^|\s)"([^"]+)"(?=\s|$)/g,(m,a,p)=>{phr.push(norm(p));return a+p});
const TQ=norm(q).split(' ').filter(Boolean),ci=TQ.findIndex((x,k)=>k>=1&&CONN.has(x)),headT=ci>0?TQ.slice(0,ci):TQ,qualT=ci>0?TQ.slice(ci+1):[];
let words=norm(q).split(' ').filter(w=>w.length>1&&!STOP.has(w));if(!words.length)return[];
const isNum=w=>/^\d+(?:[.,]\d+)?$/.test(w);let nums=words.filter(isNum);if(nums.length&&nums.length<words.length)words=words.filter(w=>!isNum(w));else nums=[];
const numRe=nums.map(n=>new RegExp('(^|[^\\d.,])'+n.replace(/[.,]/g,'[.,]')+'(?!\\d|[.,]\\d)'));
const isQ=w=>ci>0&&qualT.includes(w)&&!headT.includes(w);
const exA=expand(q,syn).filter(p=>!words.includes(p)),exH=ci>0?expand(headT.join(' '),syn).filter(p=>!words.includes(p)):exA,ex=[...new Set([...exH,...exA])];
const cg=concepts(q,syn),PQ=polyQ(words,TQ);
const qt=words.map(w=>({w,q:isQ(w),s:stem(w),ss:sv(w),tg:tri(w)})),res=[];const HW=qt.filter(x=>!x.q).map(x=>x.w),TH=4+HW.length*1.5;const synK=p=>p.split(' ').some(w=>qt.some(x=>x.s===stem(w)||tokEq(w,x.w)))?'s1':'s2';
for(const it of items){
if(f.doc&&it.docId!==f.doc)continue;if(f.kind&&it.kind!==f.kind)continue;if(exc.length&&exc.some(w=>w&&(it.n.includes(w)||sv(w).some(v=>it.t.has(v)))))continue;if(phr.length&&!phr.every(p=>it.n.includes(p)))continue;
const tl=it.tl||(it.tl=it.n.split(/[\s\/\-]+/).filter(Boolean));
if(cg.length&&!cg.every(c=>c.members.some(m=>hasPh(tl,m))||near(tl,c.core,3)))continue;
let sc=0,hit=0,sy=0,hh=0,nh=0,fz=0;const why=new Set(),hits=[],UH=!!it.ht,mh=[];
qt.forEach((x,xi)=>{let tk,got=true;const H=()=>{if(UH&&!x.q)hh++};
if(x.ss.some(s=>it.t.has(s))){const fk=strictTok(tl,x);if(fk===true){sc+=3;hit++;why.add('התאמה מדויקת');hits.push({t:x.w,k:'x'});if(UH&&x.ss.some(s=>it.ht.has(s)))H()}else{sc+=1;hit++;fz++;why.add('כתיב דומה (התאמה מטושטשת)');hits.push({t:fk,k:'f'});if(UH&&it.ht.has(fk))H()}}
else if(subTok(tl,x.w,it.n)){sc+=2;hit++;why.add('המילה מופיעה כחלק ממילה אחרת');hits.push({t:x.w,k:'x'});if(UH&&it.hn.includes(x.w))H()}
else if(x.w.length>2&&it.nc.includes(x.w)){sc+=1.5;hit++;if(!x.q)nh++;why.add('מופיע בכותרת הפרק / תת-הפרק של השורה');got=false}
else if(x.s.length>=6&&(tk=[...it.t].find(t=>lev1(t,x.s)))){sc+=1;hit++;fz++;why.add('כתיב דומה (התאמה מטושטשת)');hits.push({t:tk,k:'f'});if(UH&&it.ht.has(tk))H()}
else if(x.w.length>5){let b=0,bt;for(const t of it.t){if(Math.abs(t.length-x.w.length)<=2){const d=dice(x.tg,tri(t));if(d>b){b=d;bt=t}}}if(b>=.7){sc+=1;hit++;fz++;why.add('כתיב דומה (התאמה מטושטשת)');hits.push({t:bt,k:'f'})}else got=false}
else got=false;
mh[xi]=got});
const ns=' '+it.n+' ';
let numHit=null;if(nums.length){numHit=numRe.every(r=>r.test(it.n))}
if(ci>0){const hw=qt.map((x,i)=>[x,i]).filter(([x])=>!x.q);if(hw.length&&!(hw.every(([,i])=>mh[i])||exH.some(p=>hasP(ns,p))))continue}
for(const p of ex){if(hasP(ns,p)){sy+=2;why.add('מילה נרדפת: '+p);hits.push({t:p,k:synK(p)});if(UH&&hasP(' '+it.hn+' ',p))hh++;if(sy>=6)break}}
if(numHit){sc+=8;nums.forEach(n=>hits.push({t:n,k:'n'}));why.add('המידה '+nums.join(', ')+' תואמת')}
const lit=hit-fz;let cov=0;for(const c of cg)if(c.members.some(m=>hasPh(tl,m)))cov+=c.core.length;if(cov&&hit<qt.length){hit=Math.min(qt.length,Math.max(hit,cov));why.add('מושג שקול במילון (למשל שוחה = תא בקרה / תא בזק)')}
sc+=sy+hit/qt.length*2;if(!hit&&!sy)continue;
if(ci>0&&qt.some((x,i)=>x.q&&mh[i])){sc+=1.5;why.add('מופיע גם ההקשר שציינת ('+qualT.join(' ')+')')}
const ctxOnly=UH&&!hh&&!nh;let strength=lit===qt.length?'חזקה':hit===qt.length?'בינונית':(qt.length===1?sy>=2:(hit>0&&sy>=2))?'בינונית':'חלשה';if(UH&&!hh&&nh&&strength==='חזקה')strength='בינונית';if(numHit&&strength==='בינונית'&&hit>=qt.length)strength='חזקה';
if(numHit===false){sc*=.55;why.add('אותו פריט אבל ללא המידה '+nums.join(', '));if(strength==='חזקה')strength='בינונית'}
if(ctxOnly){strength='חלשה';sc*=.3;why.add('מוזכר רק בהקשר (אחרי "עבור / עם / כולל…") – הפריט עצמו הוא משהו אחר')}
const rr=formify({it,sc,strength,why:[...why],hits,ctxOnly,num:numHit===null?null:numHit?1:0});
if(HW.length>=2&&lit>=HW.length&&rr.strength!=='חלשה'){const g=spanGap(tl,HW);if(g>TH){rr.strength=g>16||rr.strength==='בינונית'?'חלשה':'בינונית';rr.sc*=.7;rr.why.push('מילות החיפוש רחוקות זו מזו בתיאור ('+g+' מילים) – לא מופיעות כביטוי')}}
if(HW.length>=2&&rr.strength!=='חלשה'&&rr.fm&&rr.fm.role==='main'){const ps=posOf(tl,HW[0]);if(ps.length&&cidx(tl,ps[0])>=ROLEPOS){rr.strength='חלשה';rr.sc*=.6;rr.fm.role='inc';rr.why.push('המונח הראשי "'+HW[0]+'" מופיע בהמשך התיאור, לא בראשו – הפריט עצמו הוא משהו אחר')}}
if(PQ.length)polyAdj(rr,PQ,tl);res.push(rr)}
return res.sort((a,b)=>b.sc-a.sc).slice(0,f.max||3000)}


const DITTO=/(^|\s)(?:ככנ|כנ)["״”'׳]*ל?[,.]?(?=\s|$)/;
const mergeInh=(b,r)=>{const bt=b.split(/\s+/).filter(Boolean),rt=r.split(/\s+/).filter(Boolean),cl=w=>w.replace(/["״”'׳.,:;()]/g,'');if(!rt.length)return b;
for(const w of rt){const x=cl(w);if(x.length<3||/\d/.test(x))continue;const i=bt.findIndex(y=>cl(y)===x);if(i>0)return bt.slice(0,i).join(' ')+' '+r}
if(/\d/.test(r)){let j=-1;for(let i=bt.length-1;i>=0;i--)if(/\d/.test(bt[i])){j=i;break}if(j>0){while(j>0&&/\d/.test(bt[j-1]))j--;return bt.slice(0,j).join(' ')+' '+r}}
return b+' '+r};
function inherit(items,on=true){const by={};items.forEach(it=>{if(it.kind==='boq')(by[it.docId]=by[it.docId]||[]).push(it)});let n=0;
const sec=r=>String(r||'').split('.').slice(0,3).join('.'),real=it=>!it.head&&!it.note&&/^\d+(\.\d+){3,}/.test(it.ref||''),k=it=>+String(it.id).split('_').pop()||0;
for(const L of Object.values(by)){L.sort((a,b)=>k(a)-k(b));let base=null;
for(const it of L){delete it.inh;const t=String(it.text||''),m=real(it)&&DITTO.exec(t);
if(!m){if(real(it))base=it;continue}
if(!on||!base||sec(base.ref)!==sec(it.ref))continue;
const rest=t.slice(m.index+m[0].length).replace(/^[\s,.:–-]*(?:אך|אף|אלא|אבל)(?=\s|$)/,'').trim(),bt=String(base.text||'');
const eff=mergeInh(bt,rest);it.inh={ref:base.ref,text:bt,eff};
it.n=norm((it.ref||'')+' '+eff);it.t=toks(it.n);it.tl=it.n.split(/[\s\/\-]+/).filter(Boolean);it.hn=headOf(norm(eff));it.ht=toks(it.hn);n++}}
return n}
function searchAdv(q,items,syn,f={}){
syn=mergeDef(syn);const mode=f.mode||'all',U=[],X=[];
String(q).replace(/"([^"]+)"|(\S+)/g,(m,p,w)=>{if(p){const n=norm(p);n&&U.push({ph:n.split(' ')})}else if(w[0]==='-'&&w.length>1){const n=norm(w.slice(1));n&&X.push(n)}else{const n=norm(w);n&&n.split(' ').forEach(z=>z&&U.push({ph:[z]}))}return m});
if(!U.length)return[];
const isN=z=>/^\d+(?:[.,]\d+)?$/.test(z),tm=(t,z)=>isN(z)?new RegExp('(^|[^\\d.,])'+z.replace(/[.,]/g,'[.,]')+'(?!\\d|[.,]\\d)').test(t):(t===z||tokEq(t,z)||(z.length>=3&&t.length<=z.length+3&&t.startsWith(z))),
ph=(tl,p)=>{for(let i=0;i+p.length<=tl.length;i++)if(p.every((z,j)=>tm(tl[i+j],z)))return true;return false};
const sets=mode==='phrase'?[{ph:U.flatMap(u=>u.ph)}]:U;
sets.forEach(u=>{const k=u.ph.join(' ');u.alts=[u.ph];if(f.syn)expand(k,syn).forEach(s=>{if(s!==k)u.alts.push(s.split(' '))})});
const ki=it=>+String(it.id).split('_').pop()||0,res=[];
for(const it of items){if(f.doc&&it.docId!==f.doc)continue;if(f.kind&&it.kind!==f.kind)continue;
const tl=it.tl||(it.tl=it.n.split(/[\s\/\-]+/).filter(Boolean));
if(X.some(z=>tl.some(t=>tm(t,z))))continue;
const hits=[];let got=0;
for(const u of sets){const a=u.alts.find(x=>ph(tl,x));if(a){got++;hits.push({t:a.join(' '),k:a===u.ph?'x':(a.some(w=>u.ph.some(z=>stem(w)===stem(z)||tokEq(w,z)))?'s1':'s2')})}}
if(mode==='any'?!got:got<sets.length)continue;
res.push(formify({it,sc:got/sets.length*10,strength:got===sets.length?'חזקה':'בינונית',why:[mode==='phrase'?'הביטוי מופיע צמוד, באותו סדר':mode==='any'?'נמצאו '+got+' מתוך '+sets.length+' מילים':'כל המילים מופיעות'],hits,ctxOnly:false,num:null}))}
return res.sort((a,b)=>b.sc-a.sc||ki(a.it)-ki(b.it)).slice(0,f.max||3000)}
function parseXlsx(XL,buf,doc){
const wb=XL.read(buf,{type:'array'}),all=[],seen=new Set();doc.pages=wb.SheetNames.length;doc.dupSheets=[];
for(const sn of wb.SheetNames){const ws=wb.Sheets[sn];if(!ws['!ref'])continue;const out=[];
const r0=XL.utils.decode_range(ws['!ref']).s.r,rows=XL.utils.sheet_to_json(ws,{header:1,defval:'',raw:true}),fm=XL.utils.sheet_to_json(ws,{header:1,defval:'',raw:false});
const KW=/תיאור|תאור|פירוט|כמות|יחידה|יח|מחיר|סעיף|פרק|סה"כ|סהכ|מספר|הערות/;
const hi=rows.slice(0,40).findIndex(r=>r.filter(x=>typeof x==='string'&&KW.test(x)).length>=3);
const H=hi>=0?fm[hi].map(x=>String(x).trim()):[],col=re=>H.findIndex(x=>re.test(x)),W=Math.max(0,...rows.map(r=>r.length)),from=hi+1;
const stat=Array.from({length:W},(_,k)=>{let len=0,num=0,sh=0,n=0;for(let i=from;i<Math.min(rows.length,from+300);i++){const v=rows[i][k];if(v===''||v==null)continue;n++;if(typeof v==='number')num++;else{const l=String(v).length;len+=l;if(l<=6)sh++}}return{len,num,sh,n}});
let cD=col(/תיאור|תאור|פירוט/);if(cD<0){let b=0;stat.forEach((s,k)=>{if(s.len>b){b=s.len;cD=k}})}if(cD<0)continue;
let cQ=col(/כמות/),cU=col(/^יח|יחידה/),cP=col(/מחיר/);
if(cU<0)cU=stat.findIndex((s,k)=>k>cD&&s.n&&s.num===0&&s.sh>=s.n*.6);
if(cQ<0)cQ=stat.findIndex((s,k)=>k>cD&&k!==cU&&s.n&&s.num>=s.n*.6);
if(cP<0)cP=stat.findIndex((s,k)=>k>cQ&&cQ>=0&&k!==cU&&s.n&&s.num>=s.n*.6);
const cRef=H.findIndex((x,k)=>k<cD&&/מספר סעיף|סעיף/.test(x)),cB=H.findIndex(x=>/מבנה/.test(x)),cC=H.findIndex(x=>/^פרק/.test(x));
const label=k=>H[k]||(k<cD?'מספור '+(k+1):k===cD?'תיאור':k===cU?'יחידה':k===cQ?'כמות':k===cP?'מחיר':XL.utils.encode_col(k)),skip=k=>/מס"ד|מסד|^#$/.test(H[k]||'');
doc.sh=doc.sh||{};doc.sh[sn]={hdr:Array.from({length:W},(_,k)=>label(k)),r0,hi,W};
let ctx='',lastFull='',ctxR=0;
rows.forEach((r,i)=>{if(i<=hi)return;const f=fm[i].map(x=>String(x).trim()),d=f[cD]||'';if(d.length<3)return;
let ref;if(cRef>=0)ref=f[cRef];else{const refs=[];for(let k=0;k<cD;k++){if(skip(k))continue;if(f[k]&&f[k].length<=14)refs.push(f[k])}ref=refs.join('.')}
const qty=cQ>=0?r[cQ]:'',unit=cU>=0?f[cU]:'',price=cP>=0?r[cP]:'',note=unit==='הערה',head=!note&&!unit&&(qty===''||qty==null);
if(head){ctx=(ref?ref+' ':'')+d;ctxR=i+r0+1}
const ditto=/^כנ"?ל/.test(d.replace(/["'״׳]/g,m=>m=== '"'?'"':'')),full=ditto&&lastFull?lastFull+' ← '+d:'';if(!ditto&&!head&&!note&&qty!==''&&qty!=null)lastFull=d;
out.push({full,ref,text:d,ctx,cr:ctxR,qty,unit,price,sheet:sn,row:i+r0+1,bld:cB>=0?f[cB]:'',chp:cC>=0?f[cC]:'',note:note?1:0,head:head?1:0,cells:Array.from({length:W},(_,k)=>f[k]||''),fields:f.map((x,k)=>[label(k),x]).filter(([,x])=>x!=='')})});
const keyOf=i=>(i.ref||'')+'|'+i.text.slice(0,80);
if(out.length>20&&all.length){const dup=out.filter(i=>seen.has(keyOf(i))).length;if(dup/out.length>=.8){doc.dupSheets.push(sn);continue}}
out.forEach(i=>seen.add(keyOf(i)));all.push(...out)}
return all}
function autoSyn(items,syn){
const W=new Map();for(const it of items)for(const w of norm(it.text).split(' '))if(w.length>=3&&!/[\d.\/-]/.test(w)&&!STOP.has(w))W.set(w,(W.get(w)||0)+1);
const by=new Map();for(const[w,c]of W){if(c<2)continue;const k=stem(w);if(!by.has(k))by.set(k,[]);by.get(k).push(w)}
const keys=[...by.keys()].filter(k=>k.length>=4),par={};const f=x=>par[x]===x?x:(par[x]=f(par[x]));keys.forEach(k=>par[k]=k);
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
const FINN=w=>w.replace(/[ךםןףץ]/g,y=>FIN[y]);
const PFXR=/^ו?(?:ש[כלבמ]?|[כלבמ]ש?)?ה?$/;
const rt=w=>{let a=w;if(a.length>4&&/(ים|ות|ין)$/.test(a))a=a.slice(0,-2);if((a.length>=4&&/[יהת]$/.test(a))||(a.length===3&&/י$/.test(a)))a=a.slice(0,-1);return FINN(a)};
function classTok(n,p,k){if(k==='n')return{c:'n'};if(k==='s2'||k==='f')return{c:k};
const b=FINN(p);if(FINN(n)===b)return{c:k==='s1'?'s1':'x'};
for(let L=Math.min(3,n.length-2);L>=1;L--){const pre=n.slice(0,L);if(PFXR.test(pre)){const base=n.slice(L);if(base.length>=(p.length<=3?2:3)&&(FINN(base)===b||rt(base)===rt(p)))return{c:'p',pf:pre}}}
if(rt(n)===rt(p))return{c:'s1'};return{c:'f'}}
function highlight(raw,hits,mode){raw=String(raw);const out=[],re=/[\u05D0-\u05EA\w"'׳״]+(?:[.\-*×\\][\u05D0-\u05EA\w]+)*/g,sp=[];let m;
while(m=re.exec(raw))sp.push({s:m.index,e:m.index+m[0].length,n:norm(m[0])});const mk=new Array(sp.length).fill(null),pf=new Array(sp.length).fill('');
const RK={x:0,n:0,s1:1,s2:2,f:3};for(const h of [...(hits||[])].sort((a,b)=>(RK[a.k]??1)-(RK[b.k]??1))){const pw=h.t.split(' ');for(let i=0;i+pw.length<=sp.length;i++){let ok=true;for(let j=0;j<pw.length;j++){const n=sp[i+j].n,p=pw[j];if(!n||!(n===p||stem(n)===stem(p)||stem(n)===p||sv(n).some(z=>sv(p).includes(z))||(p.length>2&&n.includes(p))||(/^\d+$/.test(p)&&new RegExp('(^|\\D)'+p+'(?!\\d)').test(n))||(h.k!=='f'&&tokEq(n,p))||(h.k==='f'&&lev1(stem(n),stem(p))))){ok=false;break}}if(ok)for(let j=0;j<pw.length;j++)if(!mk[i+j]){const c=classTok(sp[i+j].n,pw[j],h.k);mk[i+j]=c.c;pf[i+j]=c.pf||''}}}
highlight.last={sp,mk,pf};const E=x=>mode==='text'?x:x.replace(/[&<>]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;'}[c]));let pos=0;
for(let i=0;i<sp.length;i++){if(!mk[i])continue;let j=i;while(j+1<sp.length&&mk[j+1]===mk[i]&&pf[j+1]===pf[i]&&/^\s*$/.test(raw.slice(sp[j].e,sp[j+1].s)))j++;
out.push(E(raw.slice(pos,sp[i].s)));const seg=E(raw.slice(sp[i].s,sp[j].e));out.push(mode==='text'?'【'+seg+'】':'<mark class="m-'+mk[i]+'"'+(mk[i]==='p'?' title="עם תחילית '+pf[i]+'־"':'')+'>'+seg+'</mark>');pos=sp[j].e;i=j}
out.push(E(raw.slice(pos)));return out.join('')}
const FRK={x:0,s1:1,p:2,s2:3,f:4},ROLEPOS=4;
const isGen=w=>{const n=norm(w);return n.length<2||GEN.has(n)||GEN.has(stem(n))};
function analyze(it,hits){const raw=String(it.inh&&it.inh.eff?it.inh.eff:(it.text||''));highlight(raw,hits,'text');const{sp,mk,pf}=highlight.last,forms=new Set(),ex={};let pos=-1,c=0;
for(let i=0;i<sp.length;i++){const k=mk[i];if(k&&k!=='n'){const f=k==='p'?'p:'+pf[i]:k;forms.add(f);if(!ex[f])ex[f]=raw.slice(sp[i].s,sp[i].e);if(pos<0)pos=c}
const n=sp[i].n;if(n&&n.length>=2&&!/^[\d.,\/-]+$/.test(n)&&!GEN.has(n)&&!STOP.has(n)&&!CONN.has(n))c++}
return{forms:[...forms],ex,pos}}
function formify(r){const a=analyze(r.it,r.hits||[]);let best=null;for(const f of a.forms){const k=f.split(':')[0];if(best==null||FRK[k]<FRK[best])best=k}
const role=a.pos>=ROLEPOS?'inc':'main';r.fm={forms:a.forms,ex:a.ex,best:best||'x',pos:a.pos,role};
const weak=()=>{r.strength='חלשה';r.sc*=.6};
if(best==='p'){if(r.strength==='חזקה')r.strength='בינונית';r.sc*=.7;r.why.push('המונח מופיע רק עם תחילית ('+[...new Set(a.forms.filter(f=>f[0]==='p').map(f=>f.slice(2)))].join(', ')+'־) – לא כצורה הבסיסית')}
if(role==='inc'){weak();r.why.push('המונח מופיע בהמשך התיאור (לא בראשו) – קשר עקיף לפריט')}
else if(best==='s2'||best==='f'){weak();r.why.push(best==='s2'?'התאמה דרך מונח נרדף בלבד – קשר עקיף':'התאמה בכתיב דומה בלבד')}
else if(!a.forms.length&&r.it.kind==='spec'&&r.strength==='חזקה'){r.strength='בינונית';r.why.push('הסעיף שייך לפרק "'+String(r.it.ctx||'').slice(0,60)+'" – לא מזכיר את המונח עצמו')}
return r}
const ATT=[['dim','מידות'],['type','סוג / מאפיין'],['fin','חומר / גימור'],['el','זרם · מתח · הספק'],['lt','תאורה'],['ip','הגנה'],['fire','עמידות באש'],['std','תקנים'],['brand','יצרן / דגם']];
const ATK={מלאה:'מלאה',מחורצת:'מחורצת',מחורצות:'מחורצת',מחורץ:'מחורצת',רשת:'רשת',מרשת:'רשת',סולם:'סולם',סולמות:'סולם',קשיח:'קשיח',קשיחה:'קשיח',גמיש:'גמיש',גמישה:'גמיש',שקוע:'שקוע',שקועה:'שקוע',גלוי:'גלוי',גלויה:'גלוי',חיצוני:'חיצוני',חיצונית:'חיצוני',פנימי:'פנימי',פנימית:'פנימי',אטום:'אטום',אטומה:'אטום',מוגן:'מוגן',תלוי:'תלוי',תלויה:'תלוי',מוסתר:'מוסתר',צמוד:'צמוד'};
const FINR=[[/מגולו?ו?בן|מגולוון|גלוון|גלבון|ציפוי אבץ|אבץ/,'מגולוון'],[/(?:צבוע|צבועה|צביעה)\s+בתנור|צבע\s+בתנור/,'צבוע בתנור'],[/צבוע|צבועה|צביעה|צבע(?![א-ת])/,'צבוע'],[/RAL\s?\d{4}/i,0],[/אפוקסי|אפוקסית/,'אפוקסי'],[/נירוסטה|אל[\s-]?חלד|AISI\s?\d+|SS\s?\d{3}/i,'נירוסטה'],[/אלומיניום|אלומיניו/,'אלומיניום'],[/PVC/i,'PVC'],[/פלסטיק|מפלסטיק/,'פלסטיק'],[/נחושת/,'נחושת'],[/פלדה/,'פלדה'],[/(?:^|\s)פח(?:\s|$)|מפח/,'פח'],[/ברזל/,'ברזל'],[/זכוכית/,'זכוכית'],[/פוליקרבונט/,'פוליקרבונט'],[/LSZH|FRLS|ללא הלוגן/i,'ללא הלוגן'],[/\bLED\b|לד(?![א-ת])/i,'LED']];
function itemAttrs(text){const t=String(text||'').replace(/[\u200e\u200f\u202a-\u202e]/g,'').replace(/[”“״]/g,'"').replace(/[’‘׳]/g,"'"),out=[],seen=new Set(),add=(c,v)=>{v=String(v).replace(/\s+/g,' ').trim();const k=c+'|'+v;if(v&&!seen.has(k)){seen.add(k);out.push([c,v])}};
const U='(?:ממ"ר|מ"מ|ס"מ|מ\'|מטר|אינץ\'?)';let m,re;
const cov=[];re=new RegExp('\\d+(?:[.,]\\d+)?(?:\\s*[xX×*/]\\s*\\d+(?:[.,]\\d+)?)+(?:\\s*'+U+')?','g');while(m=re.exec(t)){cov.push([m.index,m.index+m[0].length]);const nx=t.slice(m.index+m[0].length,m.index+m[0].length+4);if(/^\d{1,2}\/\d{1,2}(\/\d{2,4})?$/.test(m[0].trim())||/^\s*kV/i.test(nx)||/^[A-Za-z]/.test(nx))continue;add('dim',m[0].replace(/\s*[xX×*]\s*/g,'x').replace(/\s*\/\s*/g,'/'))}
re=/(\d+(?:[.,]\d+)?\/\d+(?:[.,]\d+)?)\s*kV/gi;while(m=re.exec(t))add('el',m[1]+'kV');re=/\b(\d)\s*[xX×]\s*(\d+)\s*A\b/g;while(m=re.exec(t))add('el',m[1]+'x'+m[2]+'A');re=/(\d+(?:[.,]\d+)?)\s*mA\b/gi;while(m=re.exec(t))add('el',m[1]+'mA');
re=/(\d+(?:[.,]\d+)?)\s*(מ"מ|ס"מ|מיקרון)\s*(עובי|קוטר)/g;while(m=re.exec(t))add('dim',m[3]+' '+m[1]+' '+m[2]);
re=/(\d+(?:[.,]\d+)?)\s*(מ"מ|ס"מ|מיקרון)(?![א-ת])/g;while(m=re.exec(t)){if(cov.some(c=>m.index>=c[0]&&m.index<c[1])||/\d\s*$/.test(t.slice(Math.max(0,m.index-2),m.index)))continue;const b=t.slice(Math.max(0,m.index-12),m.index);if(/(עובי|קוטר|אורך|רוחב|גובה|עומק)\s*(?:של|עד|מינימלי|לפחות)?\s*:?\s*$/.test(b)||/^\s*(עובי|קוטר)/.test(t.slice(m.index+m[0].length,m.index+m[0].length+8)))continue;add('dim',m[1]+' '+m[2])}
re=new RegExp('(עובי|קוטר|אורך|רוחב|גובה|עומק|חתך)\\s*(?:של|עד|מינימלי|מינימום|מקסימלי|לפחות|כ-?)?\\s*:?\\s*(\\d+(?:[.,]\\d+)?(?:\\s*[-–]\\s*\\d+(?:[.,]\\d+)?)?)\\s*(ממ"ר|מ"מ|ס"מ|מ\'|מטר|מיקרון|אינץ\')','g');while(m=re.exec(t))add('dim',m[1]+' '+m[2].replace(/\s+/g,'')+' '+m[3]);
re=/(?<![xX×]\s?|[\d.,])(\d+(?:[.,]\d+)?)\s*(?:אמפר|אמפ'?|A)(?![A-Za-z\u05D0-\u05EA])/g;while(m=re.exec(t))add('el',m[1]+'A');
re=/(\d+(?:[.,]\d+)?)\s*(?:kA|KA|ק"א|קילו\s?אמפר)(?![A-Za-z])/g;while(m=re.exec(t))add('el','ניתוק '+m[1]+'kA');
re=/(?<![\/\d.])(\d+(?:[.,]\d+)?)\s*(kV|KV|V\s?(?:AC|DC)?|וולט)(?![A-Za-z])/g;while(m=re.exec(t))add('el',m[1]+m[2].replace(/\s+/g,' ').replace('וולט','V').replace(/^kv$/i,'kV'));
re=/(\d+(?:[.,]\d+)?)\s*(kVA|KVA|kW|KW|W|וואט|ואט|ק"ו|קו"א|קוו"א)(?![A-Za-z])/g;while(m=re.exec(t))add('el',m[1]+m[2].replace('וואט','W').replace('ואט','W'));
re=/(\d+(?:[.,]\d+)?)\s*(lm|לומן|LUX|lux|לוקס|K|קלווין|cd)(?![A-Za-z])/gi;while(m=re.exec(t))add('lt',m[1]+m[2].replace('לומן','lm').replace('לוקס','lux'));
re=/\bCRI\s*[>≥]?\s*\d+|\bRa\s*[>≥]\s*\d+/gi;while(m=re.exec(t))add('lt',m[0]);
re=/\b(?:IP|IK)\s?-?\d{2}[A-Z]?/g;while(m=re.exec(t))add('ip',m[0].replace(/[\s-]/g,''));
re=/ת"י\s*\d+(?:\s*(?:חלק|ח')\s*\d+)?/g;while(m=re.exec(t))add('std',m[0]);
re=/\b(?:IEC|EN|DIN|UL|BS|VDE)\s?\d[\d-]*\d/g;while(m=re.exec(t))add('std',m[0]);
if(/חסין\s+אש|עמיד\s+(?:ב)?אש|עמידות\s+באש/.test(t))add('fire','חסין אש');re=/\b(?:FE\s?\d{2,3}|E[-\s]?\d{2,3})\b/g;while(m=re.exec(t))add('fire',m[0].replace(/\s/g,''));
for(const[r,l]of FINR){const x=t.match(r);if(x)add('fin',l||x[0].replace(/\s/g,' '))}
for(const w of t.split(/[\s,.;:()]+/)){const k=ATK[w.replace(/^[והבלמש]/,'')]||ATK[w];if(k)add('type',k)}
re=/(?:מתוצרת|תוצרת|יצרן|דגם|דוגמת|דוגמה|ה?מוצר\s+ה?מומלץ|שווה ערך ל-?)\s*[:\-–]?\s*([A-Za-z][A-Za-z0-9\-.\/]*(?:\s[A-Za-z0-9][A-Za-z0-9\-.\/]*){0,3})/g;while(m=re.exec(t))add('brand',m[1].replace(/[.,]$/,''));
return out}
const COST=/כלול במחיר|כלולים במחיר|כלולה במחיר|לא ישולם|ללא תמורה|על חשבון הקבלן|ללא תשלום נוסף|במחיר היחידה|לא יימדד|כלול בסעיף|כלולים בסעיף|לא תשולם/;
const REQ=/חובה|על הקבלן|תקן|תי |בדיק|בדק|אישור|יאושר|דוגמ|תעוד|עדות|אחריות|מבדק/;
const TECH=/\d+(?:\.\d+)?\s?[x×*]\s?\d+(?:\.\d+)?|ip\s?\d{2}|\d+(?:\.\d+)?\s?(?:amp|אמפר|ממ|וולט|ואט|kw|kva|[avw])(?![a-zא-ת])/g;
const tkey=t=>/^ip/.test(t)?'ip':/[x×*]/.test(t)?'dim':t.replace(/[\d.]/g,'');
const tech=n=>{const o={};(n.match(TECH)||[]).forEach(t=>{t=t.replace(/\s/g,'');(o[tkey(t)]=o[tkey(t)]||new Set()).add(t)});return o};
const GEN=new Set('אספקה ואספקה התקנת והתקנת התקנה להתקנת חיבור ממר ממ מטר מטרים מידות מידה מידת גודל גדלים צורה כללי כללית כולל לרבות סוג עבור כמפורט לפי מושלם מוכן ביצוע עבודה עבודות מכל הכל דגם יצרן שווה ערך כמות'.split(' '));
const core=n=>{const o=[];for(const w of n.split(' ')){if(w.length<2||STOP.has(w)||/\d/.test(w))continue;const s=stem(w);if(GEN.has(w)||GEN.has(s)||GEN.has(stem(s)))continue;if(!o.includes(s))o.push(s)}return o};
const coreW=n=>{const o=[],seen=new Set();for(const w of n.split(' ')){if(w.length<2||STOP.has(w)||/\d/.test(w))continue;const s=stem(w);if(GEN.has(w)||GEN.has(s)||GEN.has(stem(s))||seen.has(s))continue;seen.add(s);o.push(w)}return o};
const UNR=/(\d+(?:\.\d+)?)\s?(ממר|ממ|סמ|אמפר|ka|kva|kv|kw|va|וולט|מטר|a|v|w|אינץ)(?![א-תa-z])/g,DIM=/\d+\s?[x×*]\s?\d+(?:\.\d+)?/g;
const attrs=n=>{const o={};let m;UNR.lastIndex=0;while(m=UNR.exec(n)){const k=m[2];(o[k]=o[k]||new Set()).add(String(parseFloat(m[1])))}(n.match(DIM)||[]).forEach(d=>{(o.dim=o.dim||new Set()).add(d.replace(/\s/g,'').replace(/[×*]/,'x'))});return o};
const QG=[[/חד ?גיד/,/דו ?גיד/,/תלת ?גיד/,/רב ?גיד/],[/מתח גבוה/,/מתח בינוני/,/מתח נמוך/],[/נחושת/,/אלומיני/]];
const quals=n=>QG.map(g=>{const s=new Set();g.forEach((r,i)=>{if(r.test(n))s.add(i)});return s});
const qConf=(a,b)=>a.some((s,i)=>s.size&&b[i].size&&![...s].some(x=>b[i].has(x)));
const nConf=(a,b)=>{const o=[];for(const k in a)if(b[k]&&![...a[k]].some(v=>b[k].has(v)))o.push(k==='dim'?'מידות/חתך':k+': '+[...a[k]].join('/')+' ↔ '+[...b[k]].join('/')+(k==='dim'?'':''));return o};
function matchSpec(b,pool,syn,min,minC,min0){
const bw=coreW(b.n).slice(0,14),ba=attrs(b.n),bq=quals(b.n),out=[];if(!bw.length)return out;
const bv=bw.map(w=>sv(w)),alts=bw.map(w=>expand(w,syn)),head=0;
for(const it of pool){const cov=bw.map((w,i)=>bv[i].some(v=>it.t.has(v))||(w.length>=3&&it.n.includes(w))||alts[i].some(p=>hasP(' '+it.n+' ',p)));
if(!cov[head])continue;const SUB=6,c=cov.slice(0,SUB).filter(Boolean).length,cn=it.cn||(it.cn=core(it.n)),den=Math.min(Math.min(SUB,bw.length),Math.max(cn.length,1)),ratio=c/den,both=cov[0]&&(bw.length<2||cov[1]);if(!min0&&bw.length>1&&!cov[1]&&ratio<.6)continue;
if(c<Math.min(minC||2,bw.length)||(ratio<min&&!(both&&ratio>=.3)))continue;
if(qConf(bq,quals(it.n)))continue;const sa=attrs(it.n),cf=Object.entries(ba).flatMap(([k,v])=>{const s=sa[k];return s&&(k!=='dim'||ratio>=.75)&&![...v].some(x=>s.has(x))?[k==='dim'?'חתך/מידות: '+[...v].join(',')+' ↔ '+[...s].join(','):k+': '+[...v].join(',')+' ↔ '+[...s].join(',')]:[]});
if(cf.length&&ratio<.6)continue;
let eq=0;for(const k in ba)if(sa[k]&&[...ba[k]].some(x=>sa[k].has(x)))eq++;
out.push({it,sc:ratio*4+Math.min(c,8)*2.5+eq*3-cf.length,strength:ratio>=.75||(eq>=1&&ratio>=.6)?'חזקה':'בינונית',why:['התאמת מונחי הפריט: '+c+' מתוך '+den+(eq?' · מידות זהות':'')],hits:bw.filter((_,i)=>cov[i]).map(w=>({t:w,k:'x'})),gap:cf})}
return out.sort((a,b)=>b.sc-a.sc)}
function compareOne(b,cands,syn,sem,topic){
syn=mergeDef(syn);
const fl=new Map(),add=(k,t,d)=>{if(fl.has(k)){if(k==='פער טכני'&&!fl.get(k).d.includes(d))fl.get(k).d+=' | '+d;return}fl.set(k,{k,t,d})};
const pool=[...cands];if(sem)sem.forEach(s=>{if(!pool.some(x=>x.id===s.it.id))pool.push(s.it)});
const m=matchSpec(b,pool,syn,.5).slice(0,3);
let tm=[];if(topic&&topic.length){const tp=pool.filter(it=>topic.some(t=>it.t.has(t))&&!m.some(x=>x.it.id===it.id));tm=matchSpec(b,tp,syn,0,1,1).slice(0,2)}
if(!m.length)add('אין התאמה מדויקת במפרט','נושא לבירור','לא נמצא סעיף מפרט שמתאר את אותו פריט עם אותם מאפיינים. ייתכן שאינו מפורט, או שהמונחים שונים (אפשר להוסיף למילון).');
for(const r of m){const n=r.it.n,rf=r.it.ref||('עמ׳ '+r.it.page);
r.gap.forEach(g=>add('פער טכני','פער בין מסמכים','כתב כמויות ↔ מפרט ('+rf+'): '+g));if(r.strength!=='חזקה')continue;
if(COST.test(n))add('כלול במחיר?','סיכון לעלות נוספת','בסעיף מפרט '+rf+' מופיעה לשון של "כלול / לא ישולם בנפרד". ודא שהתמחור כולל זאת.');
if(REQ.test(n))add('דרישות / בדיקות / אישורים','הזדמנות לתיעוד','בסעיף מפרט '+rf+' יש דרישות לביצוע, בדיקות או אישורים. בדוק מה נדרש לתעד ולתמחר.');}
if(!(+b.price>0)&&b.qty!==''&&b.qty!=null)add('ללא מחיר','נושא לבירור','לסעיף אין מחיר בכתב הכמויות.');
return{b,m,tm,flags:[...fl.values()]}}
const GENH=new Set('חשמל עבודות מתקני מתקן כללי כללית אספקת התקנת הספקת מחירון תוספות מערכת במידה ויידרש בלבד'.split(' ').map(norm));
const topicOf=ctx=>norm(String(ctx||'').replace(/^[\d.\s]+/,'').split(' - ')[0]).split(' ').filter(w=>w.length>2&&!GENH.has(w)&&!STOP.has(w)).map(stem);
g.Core={POLY,setTrust,cleanSyn,mergeDef,concepts,sv,topicOf,norm,stem,toks,search,searchAdv,setSlash,inherit,mergeInh,expand,parseXlsx,prep,DEF_SYN,autoSyn,topTerms,related,highlight,compareOne,STOP,core,isGen,classTok,itemAttrs,ATT};if(typeof module!=='undefined')module.exports=g.Core})(typeof window!=='undefined'?window:globalThis);
