(function(g){
const norm=s=>String(s==null?'':s).replace(/[\u0591-\u05C7]/g,'').replace(/["'“”״׳’‘`]/g,'').toLowerCase().replace(/[^\u05D0-\u05EAa-z0-9\s.\/-]/g,' ').replace(/\s+/g,' ').trim();
const stem=w=>{let a=w;if(a.length>4&&/(ים|ות)$/.test(a))a=a.slice(0,-2);if(a.length>3&&'הוכלבמש'.includes(a[0]))a=a.slice(1);return a};
const toks=t=>new Set(norm(t).split(' ').filter(Boolean).map(stem));
const TG=new Map();
const tri=w=>{let s=TG.get(w);if(s)return s;s=new Set();const x=' '+w+' ';for(let i=0;i<x.length-2;i++)s.add(x.slice(i,i+3));TG.set(w,s);return s};
const lev1=(a,b)=>{if(Math.abs(a.length-b.length)>1)return false;let i=0;while(i<a.length&&i<b.length&&a[i]===b[i])i++;if(a.length===b.length)return a.slice(i+1)===b.slice(i+1);const[l,sh]=a.length>b.length?[a,b]:[b,a];return l.slice(i+1)===sh.slice(i)};
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
const prep=it=>{it.n=norm((it.ref||'')+' '+it.text);it.nc=norm(it.ctx||'');it.t=toks(it.n);return it};
function expand(q,syn){const nq=' '+norm(q)+' ',out=new Set();for(const gr of syn){const ps=gr.map(norm).filter(Boolean);if(ps.some(p=>nq.includes(' '+p+' ')||nq.includes(' '+p)||(!p.includes(' ')&&nq.split(' ').some(w=>w.length>3&&lev1(stem(w),stem(p))))))ps.forEach(p=>out.add(p))}return[...out]}
function search(q,items,syn,f={}){
const words=norm(q).split(' ').filter(w=>w.length>1&&!STOP.has(w));if(!words.length)return[];
const ex=expand(q,syn).filter(p=>!words.includes(p));
const qt=words.map(w=>({w,s:stem(w),tg:tri(w)})),res=[];
for(const it of items){
if(f.doc&&it.docId!==f.doc)continue;if(f.kind&&it.kind!==f.kind)continue;
let sc=0,hit=0,sy=0;const why=new Set();
for(const x of qt){
if(it.t.has(x.s)){sc+=3;hit++;why.add('התאמה מדויקת')}
else if(x.w.length>2&&it.n.includes(x.w)){sc+=2;hit++;why.add('המילה מופיעה כחלק ממילה אחרת')}
else if(x.w.length>2&&it.nc.includes(x.w)){sc+=1.5;hit++;why.add('מופיע בכותרת/בהקשר הסעיף')}
else if(x.s.length>=3&&[...it.t].some(t=>lev1(t,x.s))){sc+=1;hit++;why.add('כתיב דומה (התאמה מטושטשת)')}
else if(x.w.length>3){let b=0;for(const t of it.t){if(Math.abs(t.length-x.w.length)<=2){const d=dice(x.tg,tri(t));if(d>b)b=d}}if(b>=.55){sc+=1;hit++;why.add('כתיב דומה (התאמה מטושטשת)')}}}
const ns=' '+it.n+' ';
for(const p of ex){if(ns.includes(' '+p)){sy+=2;why.add('מילה נרדפת: '+p);if(sy>=6)break}}
sc+=sy+hit/qt.length*2;if(!hit&&!sy)continue;
const strength=hit===qt.length?'חזקה':(hit>=qt.length/2&&hit>0)||sy>=2?'בינונית':'חלשה';
res.push({it,sc,strength,why:[...why]})}
return res.sort((a,b)=>b.sc-a.sc).slice(0,150)}
function parseXlsx(XL,buf,doc){
const wb=XL.read(buf,{type:'array'}),out=[];doc.pages=wb.SheetNames.length;
for(const sn of wb.SheetNames){const ws=wb.Sheets[sn];if(!ws['!ref'])continue;
const r0=XL.utils.decode_range(ws['!ref']).s.r,rows=XL.utils.sheet_to_json(ws,{header:1,defval:'',raw:true});
const hi=rows.findIndex(r=>r.some(c=>/תיאור|פירוט/.test(c))&&r.some(c=>/כמות|יח/.test(c)));
const H=hi>=0?rows[hi].map(String):[],col=re=>H.findIndex(c=>re.test(c));
const cD=col(/תיאור|פירוט/),cQ=col(/כמות/),cU=col(/יח/),cP=col(/מחיר/);let cR=H.findIndex((c,i)=>i!==cD&&/סעיף|מס/.test(c));
let ctx='';
rows.forEach((r,i)=>{if(i<=hi)return;const cells=r.map(c=>String(c).trim());
let d=cD>=0?cells[cD]:cells.reduce((a,c)=>c.length>a.length&&isNaN(c)?c:a,'');if(!d||d.length<3)return;
const ref=cR>=0?cells[cR]:(cells[0]!==d&&cells[0].length<14?cells[0]:'');
const qty=cQ>=0?r[cQ]:'',unit=cU>=0?cells[cU]:'',price=cP>=0?r[cP]:'';
if(qty===''&&price===''&&d.length<80){ctx=d;}
out.push({ref,text:d,ctx,qty,unit,price,sheet:sn,row:i+r0+1})})}
return out}
g.Core={norm,stem,toks,search,expand,parseXlsx,prep,DEF_SYN};if(typeof module!=='undefined')module.exports=g.Core})(typeof window!=='undefined'?window:globalThis);
