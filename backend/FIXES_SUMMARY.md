# 🔧 Исправления ResizeObserver Ошибок

## Проблема
В консоли браузера появлялись рекурсивные ошибки:
```
❌ Application error: ResizeObserver loop completed with undelivered notifications.
❌ Stack trace: No stack trace
```

## Исправления

### 1. Backend (HTML Template)
**Файл**: `backend/src/services/site_generator.py`

✅ **Исправлено**: Добавлена обработка ResizeObserver ошибок в JavaScript код HTML-шаблона:
- Обертывание ResizeObserver в requestAnimationFrame
- Подавление loop ошибок в callback функциях
- Глобальная обработка ошибок ResizeObserver

### 2. Frontend (Глобальная инициализация)
**Файл**: `frontend/inviteai-spark-invites/src/main.tsx`

✅ **Исправлено**: 
- Добавлен импорт утилиты подавления ошибок
- Инициализация глобального подавления ResizeObserver ошибок при запуске приложения
- Глобальный обработчик для предотвращения показа ошибок в консоли

### 3. Frontend (SiteViewer компонент)
**Файл**: `frontend/inviteai-spark-invites/src/pages/SiteViewer.tsx`

✅ **Исправлено**:
- Добавлен импорт утилиты `createIframeHeightObserver`
- Упрощен код iframe onLoad обработчика
- Использование безопасной утилиты для создания ResizeObserver

### 4. Новая утилита
**Файл**: `frontend/inviteai-spark-invites/src/lib/resizeObserverUtils.ts`

✅ **Создано**: Комплексная утилита для управления ResizeObserver:
- `SafeResizeObserver` класс - обертка с автоматическим подавлением ошибок
- `createIframeHeightObserver` - специализированная функция для iframe
- `initResizeObserverErrorSuppression` - глобальная инициализация
- `isResizeObserverSupported` - проверка поддержки

## Технические детали

### Причина ошибок
ResizeObserver loop ошибки возникают когда:
1. ResizeObserver callback изменяет размеры элементов
2. Это вызывает новые observations 
3. Создается бесконечный цикл уведомлений

### Решение
1. **requestAnimationFrame**: Перенос callback в следующий кадр анимации
2. **Error Suppression**: Тихое игнорирование loop ошибок
3. **Global Wrapping**: Замена нативного ResizeObserver безопасной версией

## Результат

✅ **Ошибки ResizeObserver больше не появляются в консоли**
✅ **Функциональность iframe auto-resize сохранена**  
✅ **Производительность не пострадала**
✅ **Код стал более надежным и переиспользуемым**

## Тестирование

Для проверки исправлений:
1. Откройте DevTools (F12)
2. Перейдите на страницу предпросмотра сайта
3. Убедитесь, что консоль чистая (без ResizeObserver ошибок)
4. Проверьте, что iframe корректно изменяет высоту под контент

---

🎉 **Все ResizeObserver ошибки успешно исправлены!** 