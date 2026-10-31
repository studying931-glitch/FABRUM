/* FABRUM service worker — offline-first shell, network-first for the page so updates arrive */
const V='fabrum-v43-0';
const SHELL=['./','./index.html','./manifest.webmanifest','./icon-192.png','./icon-512.png','./apple-touch-icon.png','./favicon.svg','./favicon.ico','./icon-maskable-192.png'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(V).then(c=>c.addAll(SHELL)).then(()=>self.skipWaiting()))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==V).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
const media=u=>/\.(mp4|webm|mov|pdf)(\?|$)/i.test(u);
self.addEventListener('fetch',e=>{
  const r=e.request;
  if(r.method!=='GET'||r.headers.has('range')||media(r.url))return;
  const u=new URL(r.url);
  if(/\.supabase\.(co|in)$/.test(u.hostname))return;
  if(u.origin===location.origin&&u.pathname.endsWith('privacy.html')){e.respondWith(fetch(r).then(res=>{if(res&&res.ok){const cp=res.clone();caches.open(V).then(c=>c.put(r,cp))}return res}).catch(()=>caches.match(r)));return}
  if((r.mode==='navigate'&&u.origin===location.origin&&(u.pathname.endsWith('/')||u.pathname.endsWith('index.html')))||(u.origin===location.origin&&(u.pathname.endsWith('/')||u.pathname.endsWith('index.html')))){
    e.respondWith(fetch(r).then(res=>{if(res&&res.ok){const cp=res.clone();caches.open(V).then(c=>c.put('./index.html',cp))}return res}).catch(()=>caches.match('./index.html').then(m=>m||caches.match('./'))));
    return;
  }
  /* everything else (icons, fonts, QR library): cache first, refresh in background */
  e.respondWith(caches.match(r).then(hit=>{
    const net=fetch(r).then(res=>{if(res&&(res.ok||res.type==='opaque')){const cp=res.clone();caches.open(V).then(c=>c.put(r,cp))}return res}).catch(()=>hit);
    return hit||net;
  }));
});
