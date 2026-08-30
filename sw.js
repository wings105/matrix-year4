const CACHE='matrix-t4-v4';
const SHELL=['/','/index.html','/manifest.json','/icon.svg'];

self.addEventListener('install',event=>{
  self.skipWaiting();
  event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(SHELL)));
});

self.addEventListener('activate',event=>{
  event.waitUntil((async()=>{
    const keys=await caches.keys();
    await Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)));
    await self.clients.claim();
  })());
});

self.addEventListener('fetch',event=>{
  const request=event.request;
  if(request.method!=='GET') return;

  const url=new URL(request.url);

  // Never cache authentication, student records or guardian data.
  if(url.origin===self.location.origin && url.pathname.startsWith('/api/')){
    event.respondWith(fetch(request));
    return;
  }

  // Navigation is network-first so a deployed UI update is not hidden by an old shell.
  if(request.mode==='navigate'){
    event.respondWith((async()=>{
      try{
        const response=await fetch(request);
        if(response.ok){
          const cache=await caches.open(CACHE);
          cache.put('/index.html',response.clone());
        }
        return response;
      }catch{
        return (await caches.match('/index.html')) || (await caches.match('/'));
      }
    })());
    return;
  }

  // Static assets are cache-first with background refresh.
  event.respondWith((async()=>{
    const cached=await caches.match(request);
    const network=fetch(request).then(async response=>{
      if(response.ok && url.origin===self.location.origin){
        const cache=await caches.open(CACHE);
        cache.put(request,response.clone());
      }
      return response;
    }).catch(()=>null);
    return cached || (await network) || Response.error();
  })());
});
