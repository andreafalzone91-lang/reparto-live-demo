const CACHE = 'reparto-live-v63';
const FILES = ['./', './index.html', './styles.css', './auth.css', './supabase.js', './app.js', './manifest.json', './icon.svg'];
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
  event.waitUntil(self.registration.showNotification(data.title,{body:data.body,icon:'./icon.svg',badge:'./icon.svg',tag:data.line?`line-${data.line}`:'reparto-live',data:{url:'./'}}));
});
self.addEventListener('notificationclick',event=>{
  event.notification.close();
  event.waitUntil(clients.matchAll({type:'window',includeUncontrolled:true}).then(list=>{for(const client of list)if('focus'in client)return client.focus();return clients.openWindow(event.notification.data?.url||'./')}));
});
