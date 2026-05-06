const CACHE_NAME = 'kutu-oyunu-v56';

// Uygulamanýn çalýþmasý için mutlaka gerekli temel dosyalar
const assets = [
  '/',
  '/index.html',
  '/panel.html',
  '/manifest.json',
  '/icon-512.png'
];

// Yükleme aþamasýnda temel dosyalarý hafýzaya al
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      console.log('Temel dosyalar hafýzaya alýnýyor...');
      return cache.addAll(assets);
    })
  );
  self.skipWaiting(); // Yeni versiyonun hemen aktif olmasýný saðlar
});

// Aktivasyon aþamasýnda eski hafýzayý temizle
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))
      );
    })
  );
});

// Dosya isteklerini yönet (Resimler dahil her þeyi akýllýca kaydet)
self.addEventListener('fetch', e => {
  e.respondWith(
    caches.match(e.request).then(response => {
      // Eðer hafýzada varsa ordan getir, yoksa internetten çek
      return response || fetch(e.request).then(fetchResponse => {
        return caches.open(CACHE_NAME).then(cache => {
          // Gelen yeni dosyayý (örneðin yeni eklediðin bir resmi) hafýzaya kopyala
          // Sadece güvenli ve geçerli istekleri kaydet
          if (e.request.method === 'GET' && fetchResponse.status === 200) {
            cache.put(e.request, fetchResponse.clone());
          }
          return fetchResponse;
        });
      });
    }).catch(() => {
      // Tamamen çevrimdýþý ve hafýzada yoksa yapýlacak iþlem (opsiyonel)
    })
  );
});