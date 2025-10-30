# PWA Deployment Checklist

## Pre-Deployment

### ✅ Development
- [x] vite-plugin-pwa установлен
- [x] workbox-window установлен
- [x] Иконки созданы (6 размеров)
- [x] vite.config.js настроен
- [x] index.html обновлен с PWA meta-тегами
- [x] Service Worker регистрация добавлена в main.jsx
- [x] README.md обновлен
- [x] Build успешно выполняется

### ✅ Generated Files
- [x] manifest.webmanifest генерируется
- [x] sw.js (Service Worker) генерируется
- [x] workbox runtime генерируется
- [x] Все иконки копируются в dist/

## Testing (Local)

### Chrome DevTools
- [ ] Manifest загружается корректно
- [ ] Service Worker регистрируется
- [ ] Cache Storage заполняется
- [ ] Offline mode работает
- [ ] Update notification показывается

### Lighthouse Audit
- [ ] PWA score 90+
- [ ] Все PWA критерии пройдены
- [ ] Нет критических ошибок

### Installation Test
- [ ] Desktop: install prompt появляется
- [ ] Desktop: приложение устанавливается
- [ ] Desktop: standalone mode работает

## Deployment

### Server Requirements
- [ ] HTTPS настроен (обязательно!)
- [ ] Все статические файлы доступны
- [ ] CORS настроен корректно (если нужно)
- [ ] Cache headers настроены правильно

### Files to Deploy
```
dist/
├── assets/          # JS, CSS
├── icons/           # Все PWA иконки
├── index.html       # Главная страница
├── manifest.webmanifest  # PWA манифест
├── sw.js            # Service Worker
├── workbox-*.js     # Workbox runtime
├── tab_icon.png     # Favicon
```

### Environment Variables
- [ ] VITE_GOOGLE_CLIENT_ID установлен
- [ ] VITE_API_URL установлен
- [ ] Другие env переменные настроены

## Post-Deployment

### Mobile Testing - Android
- [ ] Открыть в Chrome на Android
- [ ] "Install app" доступно в меню
- [ ] Приложение устанавливается на home screen
- [ ] Standalone mode работает
- [ ] Custom splash screen показывается
- [ ] Theme color применяется

### Mobile Testing - iOS
- [ ] Открыть в Safari на iOS
- [ ] "Add to Home Screen" работает
- [ ] Приложение появляется на home screen
- [ ] Apple Touch Icon отображается
- [ ] Standalone mode работает
- [ ] Status bar имеет правильный стиль

### Functional Testing
- [ ] Авторизация через Google работает
- [ ] API запросы успешны
- [ ] Навигация между страницами работает
- [ ] Offline: статика доступна
- [ ] Offline: cached API данные доступны
- [ ] Update flow: уведомление показывается
- [ ] Update flow: обновление применяется

### Performance
- [ ] First Contentful Paint < 2s
- [ ] Time to Interactive < 5s
- [ ] Offline page load < 1s
- [ ] Cache hit rate высокий

## Monitoring

### Metrics to Track
- [ ] Installation rate
- [ ] Service Worker registration errors
- [ ] Cache hit/miss ratio
- [ ] Offline usage statistics
- [ ] Update acceptance rate

### Common Issues

#### Service Worker не регистрируется
- Проверить HTTPS
- Проверить console errors
- Проверить путь к sw.js

#### Manifest не загружается
- Проверить CORS headers
- Проверить путь к manifest
- Проверить Content-Type: application/manifest+json

#### Icons не показываются
- Проверить пути в manifest
- Проверить доступность файлов
- Проверить размеры иконок

#### Install prompt не появляется
- Проверить HTTPS
- Посетить сайт 2+ раза
- Подождать 5 минут между визитами
- Проверить Chrome engagement checks

## Rollback Plan

Если PWA вызывает проблемы:

1. Удалить Service Worker регистрацию из main.jsx
2. Очистить Service Worker: `navigator.serviceWorker.getRegistrations().then(r => r.forEach(reg => reg.unregister()))`
3. Откатить vite.config.js к версии без VitePWA
4. Rebuild и redeploy

## Future Enhancements

- [ ] Push Notifications
  - Backend endpoint for subscriptions
  - Web Push protocol implementation
  - Notification UI

- [ ] Background Sync
  - Queue failed API requests
  - Sync when connection restored

- [ ] IndexedDB Integration
  - Offline data persistence
  - Conflict resolution

- [ ] Share Target API
  - Accept shared content from other apps
  - Add words from other apps

- [ ] Periodic Background Sync
  - Update content in background
  - Fetch new words

## Support

### Documentation
- README.md - Getting started
- PWA-TESTING.md - Testing guide
- PWA-IMPLEMENTATION-SUMMARY.md - Technical details

### Resources
- [MDN PWA Guide](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps)
- [Workbox Documentation](https://developer.chrome.com/docs/workbox/)
- [vite-plugin-pwa Documentation](https://vite-pwa-org.netlify.app/)

---

**Last Updated:** October 28, 2025
**Version:** 1.0.0
**Status:** ✅ Ready for deployment

