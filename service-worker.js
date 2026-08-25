const CACHE = 'reparto-live-v134';
const FILES = ['./', './index.html', './styles.css', './auth.css', './design-v76.css', './serioplast-v95.css', './supabase.js', './codifica-catalog.js', './app.js', './manifest.json', './icon-192.png', './icon-512.png', './apple-touch-icon.png', './brand-bottle.png', './brand-logo.jpg', './brand-pattern.jpg', './assets/forklifts/muletto-checklist.png'];
self.addEventListener('install', event => event.waitUntil(Promise.all([caches.open(CACHE).then(cache => cache.addAll(FILES)),self.skipWaiting()])));
self.addEventListener('activate', event => event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(key => key !== CACHE).map(key => caches.delete(key)))).then(()=>self.clients.claim())));
self.addEventListener('fetch', event => {
  event.respondWith(fetch(event.request).then(response => {
    const copy = response.clone();
    caches.open(CACHE).then(cache => cache.put(event.request, copy));
    return response;
  }).catch(() => caches.match(event.request)));
});
self.addEventListener('push',event=>{
  let data={title:'Reparto Live',body:'Nuovo aggiornamento dal reparto',line:''};
  try{data={...data,...event.data.json()}}catch{}
  event.waitUntil(self.registration.showNotification(data.title,{body:data.body,icon:'./icon-192.png',badge:'./icon-192.png',tag:data.line?`line-${data.line}`:'reparto-live',data:{url:'./'}}));
});
self.addEventListener('notificationclick',event=>{
  event.notification.close();
  event.waitUntil(clients.matchAll({type:'window',includeUncontrolled:true}).then(list=>{for(const client of list)if('focus'in client)return client.focus();return clients.openWindow(event.notification.data?.url||'./')}));
});
