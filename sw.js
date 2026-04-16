// Network-first SW — sempre busca da rede, cache só para offline
const CACHE='sos-v24';

self.addEventListener('install',()=>self.skipWaiting());
self.addEventListener('activate',event=>{
  event.waitUntil(
    caches.keys()
      .then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k))))
      .then(()=>self.clients.claim())
  );
});

self.addEventListener('fetch',event=>{
  // Só intercepta GET do mesmo domínio
  if(event.request.method!=='GET') return;
  event.respondWith(
    fetch(event.request,{cache:'no-store'})
      .then(response=>{
        // Salva cópia no cache para uso offline
        if(response.ok){
          const clone=response.clone();
          caches.open(CACHE).then(c=>c.put(event.request,clone));
        }
        return response;
      })
      .catch(()=>caches.match(event.request)) // offline fallback
  );
});
