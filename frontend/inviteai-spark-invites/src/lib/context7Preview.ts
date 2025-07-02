import { GeneratedSite } from '@/lib/types';

// Simplified Context7-based fallback preview generator
// Returns HTML string with Tailwind CSS and basic sections derived from site data.
export const generateContext7Preview = (site: Partial<GeneratedSite> & any): string => {
  const title = site.event_title || site.title || 'Ваше событие';
  const description = site.description || 'Добро пожаловать на наше мероприятие!';
  const date = site.event_date || '';
  const time = site.event_time || '';
  const venue = site.venue_name || '';

  // Basic color palette selection based on event type
  const eventType = site.event_type || 'birthday';
  const palettes: Record<string, { primary: string; secondary: string }> = {
    wedding: { primary: '#ff80b5', secondary: '#ffc2d1' },
    birthday: { primary: '#60a5fa', secondary: '#93c5fd' },
    corporate: { primary: '#64748b', secondary: '#94a3b8' },
    anniversary: { primary: '#34d399', secondary: '#6ee7b7' },
    graduation: { primary: '#fbbf24', secondary: '#fde68a' },
  };

  const palette = palettes[eventType] || palettes.birthday;

  return `<!DOCTYPE html>
<html lang="ru">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${title}</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    /* Улучшаем видимость опций в выпадающем списке */
    select {
      appearance: none;
      background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='%23ffffff' viewBox='0 0 24 24'%3E%3Cpath d='M7 10l5 5 5-5z'/%3E%3C/svg%3E");
      background-repeat: no-repeat;
      background-position: right 0.75rem center;
      background-size: 1rem;
      padding-right: 2.5rem;
    }
    option {
      color: #1f2937; /* gray-800 */
      background-color: #ffffff;
    }
  </style>
</head>
<body class="font-sans antialiased bg-[${palette.secondary}] text-gray-800">
  <section class="min-h-screen flex flex-col items-center justify-center py-20 px-6">
    <h1 class="text-4xl md:text-6xl font-bold mb-6 text-center text-[${palette.primary}] drop-shadow-lg">${title}</h1>
    <p class="text-lg max-w-2xl text-center mb-8">${description}</p>
    ${date || time ? `<p class="mb-4 text-xl">${date} ${time}</p>` : ''}
    ${venue ? `<p class="mb-8 text-lg">📍 ${venue}</p>` : ''}
    <a href="#rsvp" class="inline-block bg-[${palette.primary}] hover:bg-opacity-90 text-white px-8 py-3 rounded-full shadow-md transition">Подтвердить участие</a>
  </section>
</body>
</html>`;
}; 