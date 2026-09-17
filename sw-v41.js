const APP='qbr-v42-app';
self.addEventListener('install',e=>{self.skipWaiting()});
self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(keys=>Promise.all(keys.map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',e=>{if(e.request.method!=='GET')return;const u=new URL(e.request.url);if(u.origin===self.location.origin){e.respondWith(fetch(e.request).then(r=>{if(r.ok){caches.open(APP).then(c=>c.put(e.request,r.clone())).catch(()=>{})}return r}).catch(()=>caches.open(APP).then(c=>c.match(e.request)).then(r=>r||Response.error())));return}if(e.request.destination==='image'||/\.(gif|png|webp|jpg|jpeg)(\?|$)/i.test(u.pathname)){e.respondWith(fetch(e.request).catch(()=>caches.match(e.request).then(r=>r||Response.error())))}});
