#!/usr/bin/env python3
"""בדיקות למנוע החיפוש של TheScanner (Playwright).
  python tests/run.py regression --boq כתב_כמויות.xlsx --spec מפרט.pdf
  python tests/run.py audit      --boq כתב_כמויות.xlsx --spec מפרט.pdf   (דוח חריגים: tests/audit-report.md)
דורש: pip install playwright && playwright install chromium
"""
import argparse, json, os, sys, threading, http.server, functools
from playwright.sync_api import sync_playwright

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

CHECK_JS = r"""(tests)=>tests.map(t=>{
 const res=Core.search(t.q,ITEMS,S.syn,{}),vis=res.filter(r=>r.strength!=='חלשה'),weak=res.filter(r=>r.strength==='חלשה'),errs=[];
 if(t.visMin!=null&&vis.length<t.visMin)errs.push('נמצאו '+vis.length+' גלויות, נדרש '+t.visMin);
 if(t.visNone){const re=new RegExp(t.visNone),b=vis.filter(r=>re.test(r.it.n));if(b.length)errs.push(b.length+' תוצאות גלויות אסורות, למשל: '+(b[0].it.ref||'')+' '+(b[0].it.text||'').slice(0,60))}
 if(t.visAll){const re=new RegExp(t.visAll),b=vis.filter(r=>!re.test(r.it.n));if(b.length)errs.push(b.length+' תוצאות גלויות בלי "'+t.visAll+'", למשל: '+(b[0].it.ref||'')+' '+(b[0].it.text||'').slice(0,60))}
 if(t.visTopHas&&!vis.slice(0,5).some(r=>r.it.n.includes(t.visTopHas)))errs.push('"'+t.visTopHas+'" לא בחמש הראשונות');
 if(t.visHas&&!vis.some(r=>r.it.n.includes(t.visHas)))errs.push('"'+t.visHas+'" לא בין הגלויות');
 if(t.visRef&&!vis.some(r=>r.it.ref===t.visRef))errs.push('הסעיף '+t.visRef+' אמור להיות גלוי');
 if(t.weakRef&&vis.some(r=>r.it.ref===t.weakRef))errs.push('הסעיף '+t.weakRef+' אמור להיות חלש/מוסתר');
 if(t.weakHas&&!weak.some(r=>r.it.n.includes(t.weakHas)))errs.push('"'+t.weakHas+'" אמור להופיע בין החלשות');
 return {id:t.id,q:t.q,vis:vis.length,errs}})"""

AUDIT_JS = r"""()=>{
 const N=Core.norm,real=ITEMS.filter(i=>i.kind==='boq'&&!i.head&&!i.note&&i.unit),SK=new Set(['אספקה','ואספקה','התקנת','והתקנת','אספקת','ואספקת','התקנה','הספקת','הכל','כנל','קומפלט','תוספת','ביצוע','שעת','שלושה','ארבעה']);
 const cnt=new Map();for(const it of real){const w=(it.hn||N(it.text)).split(' ').filter(x=>x.length>1&&!SK.has(x)&&!/^[\d.x\/-]+$/.test(x));for(const n of [1,2,3])if(w.length>=n){const k=w.slice(0,n).join(' ');cnt.set(k,(cnt.get(k)||0)+1)}}
 const qs=[...cnt].filter(([k,c])=>{const n=k.split(' ').length;return (n<=2&&c>=3)||(n===3&&c>=8)}).map(x=>x[0]);
 const rows=[];
 for(const q of qs){const res=Core.search(q,ITEMS,S.syn,{}),vis=res.filter(r=>r.strength!=='חלשה'),sim={};let simN=0;
  for(const r of vis)if(r.fm.forms.includes('f')){simN++;const e=r.fm.ex.f;if(e)sim[e]=(sim[e]||0)+1}
  const col={},qw=N(q).split(' ');for(const r of vis){const tl=r.it.tl,i=tl.findIndex(t=>Core.stem(t)===Core.stem(qw[0]));if(i>=0&&tl[i+1]&&tl[i+1].length>2)col[tl[i+1]]=(col[tl[i+1]]||0)+1}
  const top=Object.entries(col).sort((a,b)=>b[1]-a[1]);
  rows.push({q,total:res.length,vis:vis.length,weak:res.length-vis.length,simN,sim:Object.entries(sim).sort((a,b)=>b[1]-a[1]).slice(0,4),
   fewWordSplit:qw.length>=2?vis.filter(r=>r.why.some(w=>/רחוקות/.test(w))).length:0,polyWeak:res.filter(r=>r.poly).length,
   poly:top.length>=2&&top[0][1]<vis.length*.5&&top[1][1]>=3?top.slice(0,3):null})}
 return rows}"""

def serve():
    h = functools.partial(http.server.SimpleHTTPRequestHandler, directory=ROOT)
    h.log_message = lambda *a, **k: None
    srv = http.server.ThreadingHTTPServer(('127.0.0.1', 0), h)
    threading.Thread(target=srv.serve_forever, daemon=True).start()
    return srv, f'http://127.0.0.1:{srv.server_address[1]}/index.html'

def load(p, url, files):
    ctx = p.chromium.launch(); pg = ctx.new_page()
    pg.goto(url); pg.wait_for_timeout(800)
    pg.click('text=מסמכים'); pg.wait_for_selector('#up', state='attached')
    pg.set_input_files('#up', files)
    pg.wait_for_function("S.docs.length>=%d && S.docs.every(d=>d.count!=null||/שגיאה/.test(d.status))" % len(files), timeout=300000)
    return ctx, pg

def main():
    ap = argparse.ArgumentParser(); ap.add_argument('mode', choices=['regression', 'audit'])
    ap.add_argument('--boq', required=True); ap.add_argument('--spec', required=True)
    a = ap.parse_args(); srv, url = serve()
    with sync_playwright() as p:
        b, pg = load(p, url, [os.path.abspath(a.boq), os.path.abspath(a.spec)])
        if a.mode == 'regression':
            T = json.load(open(os.path.join(ROOT, 'tests', 'regression.json'), encoding='utf8'))['tests']
            out = pg.evaluate(CHECK_JS, T); bad = [r for r in out if r['errs']]
            for r in out: print(('✔' if not r['errs'] else '✘'), r['id'], '|', r['q'], '| גלויות:', r['vis'], *(['\n     ' + e for e in r['errs']]))
            print(f"\n{len(out)-len(bad)}/{len(out)} עברו"); sys.exit(1 if bad else 0)
        rows = pg.evaluate(AUDIT_JS); L = ['# דוח חריגים אוטומטי', f'חיפושים שהורצו: {len(rows)}', '']
        sec = lambda t, xs: L.extend(['## ' + t, *(xs or ['(אין)']), ''])
        sec('אפס תוצאות', [f'- {r["q"]}' for r in rows if r['total'] == 0])
        sec('יש תוצאות אבל כולן חלשות (מוסתרות)', [f'- {r["q"]} ({r["weak"]} חלשות)' for r in rows if r['total'] and not r['vis']])
        sec('רעש: יותר מ-150 תוצאות גלויות', [f'- {r["q"]}: {r["vis"]}' for r in sorted(rows, key=lambda r: -r['vis']) if r['vis'] > 150])
        sec('תוצאות גלויות עם מילה דומה אחרת', [f'- {r["q"]}: {r["simN"]} ← ' + ', '.join(f'{w}×{n}' for w, n in r['sim']) for r in rows if r['simN'] >= 3])
        sec('ביטויים שהמילים בהם רחוקות זו מזו (הורדו)', [f'- {r["q"]}: {r["fewWordSplit"]}' for r in rows if r['fewWordSplit']])
        sec('משמעות אחרת (הורדו ל"חלשה")', [f'- {r["q"]}: {r["polyWeak"]}' for r in rows if r['polyWeak']])
        sec('חשד למונח רב-משמעי (המילה הבאה מתפצלת)', [f'- {r["q"]}: ' + ', '.join(f'{w}×{n}' for w, n in r['poly']) for r in rows if r['poly']])
        open(os.path.join(ROOT, 'tests', 'audit-report.md'), 'w', encoding='utf8').write('\n'.join(L)); print('נכתב tests/audit-report.md')
        b.close()

if __name__ == '__main__':
    main()
