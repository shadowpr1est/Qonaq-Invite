import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';

import { apiClient } from '@/lib/api';
import type { GeneratedSite } from '@/lib/types';
import { generateContext7Preview } from '@/lib/context7Preview';

import { LoadingSpinner } from '@/components/LoadingSpinner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ArrowLeft, ExternalLink, Share2, Edit, MessageCircle, Send, Sparkles, Smartphone, Monitor, Zap, Calendar, MapPin, User } from 'lucide-react';
import LivePreviewFrame from '@/components/LivePreviewFrame';

const SiteViewer = () => {
  const { siteId } = useParams<{ siteId: string }>();
  const navigate = useNavigate();
  
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [previewMode, setPreviewMode] = useState<'mobile' | 'desktop'>('desktop');
  
  // Состояние для live preview
  const [liveHtmlContent, setLiveHtmlContent] = useState('');
  const [isUpdatingPreview, setIsUpdatingPreview] = useState(false);
  
  // Состояние для чата редактирования
  const [chatMessages, setChatMessages] = useState<Array<{id: string, text: string, isUser: boolean, timestamp: Date}>>([
    {
      id: '1',
      text: '🚀 Привет! Я ваш AI-редактор. Скажите что хотите изменить в приглашении и я мгновенно обновлю live preview!',
      isUser: false,
      timestamp: new Date()
    },
    {
      id: '2', 
      text: '💡 Примеры команд: "Сделай фон ярче", "Поменяй шрифт на элегантный", "Добавь анимации", "Измени цвета на розовые"',
      isUser: false,
      timestamp: new Date()
    }
  ]);
  const [chatInput, setChatInput] = useState('');
  const [isProcessingChat, setIsProcessingChat] = useState(false);

  // Получение данных сайта
  const { 
    data: site, 
    isLoading, 
    error 
  } = useQuery<GeneratedSite>({
    queryKey: ['site', siteId],
    queryFn: () => apiClient.getSite(siteId!),
    enabled: !!siteId,
    refetchOnWindowFocus: false,
  });

  // Синхронизируем live content с загруженным сайтом
  useEffect(() => {
    if (!site) return;

    if (site.html_content && site.html_content.trim().length > 20) {
      setLiveHtmlContent(site.html_content);
    } else {
      // fallback preview via Context7
      const fallback = generateContext7Preview(site);
      setLiveHtmlContent(fallback);
    }
  }, [site?.html_content]);

  // Записываем просмотр для аналитики - DISABLED
  // useEffect(() => {
  //   if (site) {
  //     apiClient.recordAnalytics(site.slug, {
  //       event_type: 'page_view',
  //       event_data: {
  //         source: 'editor_preview'
  //       }
  //     });
  //   }
  // }, [site]);

  const handleShare = () => {
    if (!site) return;
    
    const shareUrl = `${window.location.origin}/sites/public/${site.slug}`;
    navigator.clipboard.writeText(shareUrl);
    toast.success('Ссылка скопирована в буфер обмена');
  };

  const handleOpenPublic = () => {
    if (!site) return;
    
    const publicUrl = `${window.location.origin}/sites/public/${site.slug}`;
    window.open(publicUrl, '_blank');
  };

  const handleChatSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || isProcessingChat || !liveHtmlContent) return;

    const userMessage = {
      id: Date.now().toString(),
      text: chatInput,
      isUser: true,
      timestamp: new Date()
    };

    setChatMessages(prev => [...prev, userMessage]);
    const command = chatInput.toLowerCase();
    setChatInput('');
    setIsProcessingChat(true);

         // Показываем индикатор обновления
     setIsUpdatingPreview(true);

     // Мгновенное обновление preview (< 300ms)
     setTimeout(() => {
       let updatedHtml = liveHtmlContent;
       let responseText = '';

       // Симуляция изменений на основе команд
       if (command.includes('ярче') || command.includes('яркие')) {
         updatedHtml = updatedHtml.replace(/background-color:\s*#[a-fA-F0-9]{6}/g, 'background-color: #ff6b6b');
         updatedHtml = updatedHtml.replace(/color:\s*#[a-fA-F0-9]{6}/g, 'color: #4ecdc4');
         responseText = '🎨 Сделал цвета ярче! Теперь приглашение выглядит более энергично и привлекательно.';
       } else if (command.includes('анимации') || command.includes('анимация')) {
         updatedHtml = updatedHtml.replace('<body', '<body style="animation: fadeIn 1s ease-in;"');
         updatedHtml = updatedHtml.replace('</head>', `
           <style>
             @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
             @keyframes bounce { 0%, 20%, 50%, 80%, 100% { transform: translateY(0); } 40% { transform: translateY(-10px); } 60% { transform: translateY(-5px); } }
             .animated { animation: bounce 2s infinite; }
           </style>
           </head>
         `);
         responseText = '✨ Добавил плавные анимации! Теперь элементы появляются с красивыми переходами.';
       } else if (command.includes('шрифт') || command.includes('текст')) {
         updatedHtml = updatedHtml.replace(/font-family:[^;"]*/g, 'font-family: "Georgia", serif');
         responseText = '📝 Изменил шрифт на более элегантный! Теперь текст выглядит более стильно.';
       } else if (command.includes('розовые') || command.includes('розовый')) {
         updatedHtml = updatedHtml.replace(/background-color:\s*#[a-fA-F0-9]{6}/g, 'background-color: #ff69b4');
         updatedHtml = updatedHtml.replace(/color:\s*#[a-fA-F0-9]{6}/g, 'color: #ff1493');
         responseText = '💖 Изменил цветовую схему на розовые тона! Очень мило и нежно.';
       } else if (command.includes('стиль') || command.includes('дизайн')) {
         updatedHtml = updatedHtml.replace('<body', '<body style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);"');
         responseText = '🎭 Обновил стиль! Добавил градиентный фон для более современного вида.';
       } else {
         // Общий ответ для других команд
         const responses = [
           '🚀 Понял! Обновляю дизайн согласно вашему запросу.',
           '⚡ Применяю изменения к приглашению прямо сейчас!',
           '🎯 Отличная идея! Вношу соответствующие правки.',
           '✅ Выполняю ваш запрос. Live preview обновляется!',
         ];
         responseText = responses[Math.floor(Math.random() * responses.length)];
       }

       // Обновляем live preview
       setLiveHtmlContent(updatedHtml);
       setIsUpdatingPreview(false);
       
       // Добавляем ответ AI
       const response = {
         id: (Date.now() + 1).toString(),
         text: responseText,
         isUser: false,
         timestamp: new Date()
       };
       
       setChatMessages(prev => [...prev, response]);
       setIsProcessingChat(false);

       // Показываем toast о применении изменений
       toast.success('Live Preview обновлён!', {
         duration: 2000,
       });
       
     }, 250); // Задержка < 300ms для "мгновенного" обновления
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <LoadingSpinner size="lg" text="Загружаем сайт..." />
      </div>
    );
  }

  if (error || !site) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="max-w-md mx-auto">
          <CardContent className="p-8 text-center">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Сайт не найден
            </h2>
            <p className="text-gray-600 mb-4">
              Возможно, сайт был удален или у вас нет прав доступа
            </p>
            <Button onClick={() => navigate('/dashboard')}>
              Вернуться к списку
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex flex-col md:flex-row min-h-screen w-full bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      {/* Чат */}
      <aside className="w-full md:w-[340px] flex flex-col min-h-0 bg-white border-r border-gray-200">
        {/* Sticky header */}
        <header className="sticky top-0 z-20 p-4 border-b border-gray-200 bg-gradient-to-r from-purple-600 to-blue-600 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <div>
              <h2 className="text-white font-semibold">AI Редактор</h2>
              <p className="text-white/80 text-xs">Изменяйте приглашение голосом или текстом</p>
            </div>
          </div>
          <Button
            variant="default"
            size="sm"
            onClick={() => navigate('/dashboard')}
            className="bg-white/20 hover:bg-white/30 text-white border-white/30 backdrop-blur-sm font-medium px-4 py-2 transition-all duration-200 shadow-lg hover:shadow-xl focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2"
            aria-label="Назад к проектам"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Назад
          </Button>
        </header>
        {/* Чат сообщения */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-white">
          {chatMessages.map((msg) => (
            <div
              key={msg.id}
              className={
                msg.isUser
                  ? 'ml-auto max-w-[80%] bg-gradient-to-r from-purple-100 to-blue-100 text-right rounded-xl px-4 py-2 shadow'
                  : 'max-w-[90%] bg-gray-50 text-left rounded-xl px-4 py-2 shadow'
              }
              tabIndex={0}
              aria-label={msg.text}
            >
              {msg.text}
            </div>
          ))}
        </div>
        {/* Ввод сообщения */}
        <form onSubmit={handleChatSubmit} className="p-4 border-t border-gray-200 bg-gray-50 flex gap-2">
          <Input
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            placeholder={liveHtmlContent ? "Опишите изменения: 'Сделай ярче', 'Поменяй шрифт', 'Добавь анимации'..." : "Загружаю приглашение..."}
            className="flex-1 border-gray-300 focus:border-purple-500 focus-visible:ring-2 focus-visible:ring-purple-500"
            disabled={isProcessingChat || !liveHtmlContent}
            aria-label="Введите команду для AI редактора"
          />
          <Button
            type="submit"
            size="sm"
            disabled={!chatInput.trim() || isProcessingChat || !liveHtmlContent}
            className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 px-4 focus-visible:ring-2 focus-visible:ring-purple-500"
            aria-label="Отправить команду"
          >
            <Send className="w-4 h-4" />
          </Button>
        </form>
      </aside>

      {/* Превью */}
      <main className="flex-1 flex flex-col min-h-0 overflow-auto bg-gray-50">
        {/* Панель управления превью */}
        <nav className="sticky top-0 z-10 p-4 bg-white border-b border-gray-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
          <div className="flex items-center gap-4">
            <h1 className="text-lg font-semibold text-gray-900">Live Preview</h1>
            <div className="flex items-center gap-3 text-sm text-gray-600">
              {isUpdatingPreview ? (
                <span className="inline-flex items-center gap-1 bg-blue-100 text-blue-700 px-2 py-1 rounded-full animate-pulse">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  Обновляется...
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 bg-green-100 text-green-700 px-2 py-1 rounded-full">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  Live
                </span>
              )}
              {site?.is_published ? (
                <span className="inline-flex items-center gap-1 bg-emerald-100 text-emerald-700 px-2 py-1 rounded-full">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                  Опубликовано
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                  Черновик
                </span>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <Button
              variant="outline"
              size="sm"
              onClick={handleShare}
              className="text-purple-600 border-purple-200 hover:bg-purple-50 focus-visible:ring-2 focus-visible:ring-purple-500"
              aria-label="Скопировать ссылку на сайт"
            >
              <Share2 className="w-4 h-4 mr-1" />Поделиться
            </Button>
            <Button
              size="sm"
              onClick={() => setIsFullscreen(true)}
              className="bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:from-purple-700 hover:to-blue-700 focus-visible:ring-2 focus-visible:ring-purple-500"
              aria-label="Открыть в новом окне"
            >
              <ExternalLink className="w-4 h-4 mr-1" />Открыть
            </Button>
          </div>
        </nav>
        {/* Live Preview контейнер */}
        <section className={
          `flex-1 flex flex-col items-center justify-center p-2 sm:p-6 md:p-8 lg:p-12 overflow-visible min-h-0` +
          (previewMode === 'mobile' ? ' bg-white' : '')
        }>
          <div className={
            `w-full h-full flex flex-col rounded-lg shadow-lg overflow-hidden` +
            (previewMode === 'mobile' ? ' max-w-sm' : ' max-w-full')
          }>
            {/* Адресная строка симуляция */}
            <div className="bg-gray-200 px-4 py-2 flex items-center gap-3 text-xs text-gray-600 rounded-t-lg">
              <div className="flex gap-1">
                <div className="w-3 h-3 bg-red-400 rounded-full"></div>
                <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                <div className="w-3 h-3 bg-green-400 rounded-full"></div>
              </div>
              <div className="bg-white rounded px-3 py-1 flex-1 text-gray-700 truncate">
                {site?.is_published ? `invitely.app/e/${site.slug}` : `${window.location.host}/preview`}
              </div>
            </div>
            {/* Живой HTML сайт */}
            <LivePreviewFrame
              html={liveHtmlContent}
              mode={previewMode}
              onModeChange={setPreviewMode}
              toolbar={null}
              className="h-full rounded-t-none"
              minHeight={600}
            />
          </div>
        </section>
        {/* Нижняя панель навигации */}
        <footer className="p-4 bg-white border-t border-gray-200 flex items-center justify-between">
          <Button
            variant="outline"
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-2 text-purple-600 border-purple-200 hover:bg-purple-50 focus-visible:ring-2 focus-visible:ring-purple-500"
            aria-label="Вернуться к проектам"
          >
            <ArrowLeft className="w-4 h-4" />Вернуться к проектам
          </Button>
          {site?.created_at && (
            <div className="text-sm text-gray-500">
              Сайт создан: {new Date(site.created_at).toLocaleDateString('ru-RU')}
            </div>
          )}
        </footer>
      </main>

      {/* Полноэкранный режим */}
      {isFullscreen && (
        <div className="fixed inset-0 z-50 bg-white flex flex-col">
          {/* Панель управления в полноэкранном режиме */}
          <div className="absolute top-4 left-4 z-10 flex gap-2">
            <Button
              variant="default"
              size="sm"
              onClick={() => setIsFullscreen(false)}
              className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-200 font-medium px-4 py-2 focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2"
              aria-label="Выйти из полного экрана"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />Выйти из полного экрана
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleShare}
              className="text-purple-600 border-purple-200 hover:bg-purple-50 focus-visible:ring-2 focus-visible:ring-purple-500"
              aria-label="Скопировать ссылку на сайт"
            >
              <Share2 className="w-4 h-4" />
            </Button>
            {site?.is_published && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleOpenPublic}
                className="text-purple-600 border-purple-200 hover:bg-purple-50 focus-visible:ring-2 focus-visible:ring-purple-500"
                aria-label="Открыть публичную версию"
              >
                <ExternalLink className="w-4 h-4" />
              </Button>
            )}
          </div>
          {/* Контент сайта */}
          <iframe
            srcDoc={liveHtmlContent}
            className="w-full h-full border-0"
            title={site?.title}
            sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
            key={liveHtmlContent.length}
          />
        </div>
      )}
    </div>
  );
};

export default SiteViewer; 