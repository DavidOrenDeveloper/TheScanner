const V='v1.7.8',F=['./','index.html','app.js','core.js','manifest.json','icon.svg','lib/xlsx.full.min.js','lib/pdf.min.js','lib/pdf.worker.min.js'];
const SC=self.registration.scope,put=(r,res)=>{if(res&&res.ok&&new URL(r.url).origin===location.origin){const cp=res.clone();caches.open(V).then(c=>c.put(r,cp))}return res};
self.addEventListener('install',e=>{self.skipWaiting();e.waitUntil(caches.open(V).then(c=>c.addAll(F.map(u=>new Request(u,{cache:'reload'})))))});
self.addEventListener('activate',e=>e.waitUntil((async()=>{for(const k of await caches.keys()){if(k===V)continue;const c=await caches.open(k);if((await c.keys()).some(r=>r.url.startsWith(SC)))await caches.delete(k)}await self.clients.claim()})()));
self.addEventListener('message',e=>{if(e.data==='skip')self.skipWaiting()});
self.addEventListener('fetch',e=>{const r=e.request;if(r.method!=='GET')return;const u=new URL(r.url);if(u.origin!==location.origin)return;
const fresh=!/\/lib\//.test(u.pathname)&&(r.mode==='navigate'||/(\/|\.html|\.js|\.json)$/.test(u.pathname));
e.respondWith(fresh?fetch(r,{cache:'no-cache'}).then(res=>put(r,res)).catch(()=>caches.match(r,{ignoreSearch:true}).then(x=>x||caches.match('./',{ignoreSearch:true}))):caches.match(r,{ignoreSearch:true}).then(x=>x||fetch(r).then(res=>put(r,res))))});
