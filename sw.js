const CACHE='frameone-v1';
const ASSETS=['./','./index.html','./manifest.json','./icon-192.png','./icon-512.png'];
self.addEventListener('install',e=>{ e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS)).then(()=>self.skipWaiting())); });
self.addEventListener('activate',e=>{ e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())); });
self.addEventListener('fetch',e=>{
  const url=e.request.url;
  // never cache the supabase API or the supabase CDN script — always go to network
  if(url.includes('supabase')){ return; }
  e.respondWith(
    caches.match(e.request).then(hit=>hit||fetch(e.request).then(res=>{
      if(e.request.method==='GET' && res.ok && url.startsWith(self.location.origin)){
        const copy=res.clone(); caches.open(CACHE).then(c=>c.put(e.request,copy));
      }
      return res;
    }).catch(()=>caches.match('./index.html')))
  );
});
