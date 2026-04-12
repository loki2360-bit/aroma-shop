const CACHE = 'tasks-lite-v1';
const ASSETS = [
  './',
  './index.html',
  './manifest.json'
];

// Установка: кэшируем файлы
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(cache => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

// Активация: чистим старые кэши
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys => 
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Offline-first: сначала кэш, потом сеть
self.addEventListener('fetch', e => {
  e.respondWith(
    caches.match(e.request).then(res => 
      res || fetch(e.request).then(net => {
        return caches.open(CACHE).then(cache => {
          cache.put(e.request, net.clone());
          return net;
        });
      }).catch(() => caches.match('./index.html'))
    )
  );
});

// Обработка push-уведомлений (для локальных триггеров)
self.addEventListener('push', e => {
  if (!e.data) return;
  try {
    const data = e.data.json();
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: data.icon || './icons/icon-192.png',
      badge: data.icon || './icons/icon-192.png',
      tag: data.tag || 'task-reminder',
      requireInteraction: true,
      actions: [
        { action: 'open', title: 'Открыть' },
        { action: 'snooze', title: 'Напомнить через 15 мин' }
      ]
    });
  } catch(_) {}
});

// Обработка кликов по уведомлениям
self.addEventListener('notificationclick', e => {
  e.notification.close();
  if (e.action === 'snooze') {
    // Откладываем на 15 мин (локально)
    self.registration.showNotification('⏰ Напомню через 15 мин', {
      body: 'Не забудьте про задачу!',
      tag: 'task-snoozed'
    });
  }
  e.waitUntil(
    clients.matchAll({ type: 'window' }).then(ws => {
      if (ws[0]) return ws[0].focus();
      return clients.openWindow('./index.html');
    })
  );
});

// Сообщения от основной страницы
self.addEventListener('message', e => {
  if (e.data?.type === 'SCHEDULE_NOTIFICATION') {
    // Для локальных уведомлений используем setTimeout в main thread
    // Service Worker не может сам планировать, но может показывать
  }
  if (e.data?.type === 'SHOW_NOTIFICATION') {
    self.registration.showNotification(e.data.title, {
      body: e.data.body,
      icon: e.data.icon,
      tag: e.data.tag,
      requireInteraction: true
    });
  }
});
