<!DOCTYPE html>
<html lang='ru' class='scroll-smooth'>
<head>
    <meta charset='UTF-8'>
    <meta name='viewport' content='width=device-width, initial-scale=1.0'>
    <title>{data.get('event_title', 'Приглашение на событие')}</title>
    <script src='https://cdn.tailwindcss.com'></script>
    <style>
        {extra_styles}
        
        .elegant-shadow {{ 
            box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25), 
                       0 0 0 1px rgba(255, 255, 255, 0.1); 
        }}
        
        .text-shadow {{ 
            text-shadow: 0 4px 8px rgba(0,0,0,0.1), 
                        0 2px 4px rgba(0,0,0,0.1); 
        }}
        
        .fade-in {{ 
            animation: fadeIn 1s ease-out forwards; 
            opacity: 0;
        }}
        
        .slide-up {{ 
            animation: slideUp 0.8s ease-out forwards; 
            opacity: 0;
            transform: translateY(30px);
        }}
        
        .slide-up:nth-child(2) {{ animation-delay: 0.2s; }}
        .slide-up:nth-child(3) {{ animation-delay: 0.4s; }}
        .slide-up:nth-child(4) {{ animation-delay: 0.6s; }}
        
        @keyframes fadeIn {{
            from {{ opacity: 0; transform: translateY(20px); }}
            to {{ opacity: 1; transform: translateY(0); }}
        }}
        
        @keyframes slideUp {{
            from {{ opacity: 0; transform: translateY(30px); }}
            to {{ opacity: 1; transform: translateY(0); }}
        }}
        
        .gradient-text {{
            background: linear-gradient(135deg, var(--tw-gradient-stops));
            background-clip: text;
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
        }}
        
        .gradient-bg {{
            background: linear-gradient(135deg, var(--tw-gradient-stops));
        }}
        
        .time-badge {{
            background: linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(255, 255, 255, 0.7) 100%);
            border: 1px solid rgba(255, 255, 255, 0.3);
            backdrop-filter: blur(10px);
        }}
        
        .location-card {{
            background: linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(255, 255, 255, 0.8) 100%);
            backdrop-filter: blur(15px);
        }}
        
        .icon-gradient {{
            background: linear-gradient(135deg, var(--tw-gradient-stops));
        }}
        
        .hover-lift {{
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }}
        
        .hover-lift:hover {{
            transform: translateY(-5px);
            box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.3);
        }}
        
        .pulse-gentle {{
            animation: pulseGentle 2s infinite;
        }}
        
        @keyframes pulseGentle {{
            0%, 100% {{ transform: scale(1); }}
            50% {{ transform: scale(1.05); }}
        }}
        
        .glass-effect {{
            background: rgba(255, 255, 255, 0.1);
            backdrop-filter: blur(10px);
            border: 1px solid rgba(255, 255, 255, 0.2);
        }}
        
        .map-placeholder {{
            background: linear-gradient(135deg, {colors['secondary']});
            border: 2px dashed rgba(156, 163, 175, 0.3);
            position: relative;
            overflow: hidden;
        }}
        
        .map-placeholder::before {{
            content: "📍";
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            font-size: 4rem;
            opacity: 0.2;
        }}
        
        .map-placeholder::after {{
            content: "";
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: linear-gradient(45deg, transparent 40%, rgba(255,255,255,0.1) 50%, transparent 60%);
            animation: shimmer 3s infinite;
        }}
        
        @keyframes shimmer {{
            0% {{ transform: translateX(-100%); }}
            100% {{ transform: translateX(100%); }}
        }}
        
        @media (max-width: 640px) {{
            .{theme_styles['title']} {{
                font-size: 2.5rem;
                line-height: 1.1;
            }}
            
            .{theme_styles['description']} {{
                font-size: 1.1rem;
                line-height: 1.5;
            }}
        }}
    </style>
</head>
<body class="{colors['background']} min-h-screen">
    <div class="min-h-screen py-8 sm:py-12 px-4">
        <div class="{theme_styles['container']}">
            <!-- Hero Section -->
            <div class="text-center mb-12 sm:mb-16 fade-in py-[30px]">
                <h1 class="{theme_styles['title']} gradient-text bg-gradient-to-r {colors['primary']} text-shadow mb-6 sm:mb-8">
                    {data.get('event_title', 'Приглашение на событие')}
                </h1>
                
                <p class="{theme_styles['description']} {colors['accent']} max-w-4xl mx-auto mb-8">
                    {data.get('description', 'Присоединяйтесь к нам на особенном празднике')}
                </p>
                
                <div class="inline-flex items-center gap-3 time-badge px-6 py-3 rounded-full glass-effect">
                    <div class="w-8 h-8 icon-gradient bg-gradient-to-r {colors['primary']} rounded-full flex items-center justify-center">
                        <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                    </div>
                    <span class="text-sm sm:text-base font-medium {colors['accent']}">
                        {formatted_date}{f', {formatted_time}' if formatted_time else ''}
                    </span>
                </div>
            </div>
            
            <!-- Main Content Grid -->
            <div class="grid grid-cols-1 gap-8 mb-12 sm:mb-16">
    <!-- Calendar Card -->
    <div class="{theme_styles['card']} {theme_styles['spacing']} slide-up hover-lift">
        <div class="flex items-center gap-4 mb-6">
            <div class="w-12 h-12 icon-gradient bg-gradient-to-r {colors['primary']} rounded-2xl flex items-center justify-center pulse-gentle">
                <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                </svg>
            </div>
            <h3 class="text-xl sm:text-2xl font-bold {colors['accent']}">
                Дата события
            </h3>
        </div>
        {calendar_html}
    </div>

    <!-- Location Card -->
    <div class="{theme_styles['card']} {theme_styles['spacing']} slide-up hover-lift">
        <div class="flex items-center gap-4 mb-6">
            <div class="w-12 h-12 icon-gradient bg-gradient-to-r {colors['primary']} rounded-2xl flex items-center justify-center pulse-gentle">
                <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
                </svg>
            </div>
            <h3 class="text-xl sm:text-2xl font-bold {colors['accent']}">
                Место проведения
            </h3>
        </div>

        <div class="space-y-4">
            <div class="location-card p-4 rounded-2xl">
                <p class="text-lg font-semibold {colors['accent']} mb-2">
                    {data.get('location', 'Место уточняется')}
                </p>
                {f'<p class="text-sm text-gray-600 mb-4">{data.get("location_address", "")}</p>' if data.get('location_address') else ''}
                
                <div class="map-placeholder h-32 rounded-xl mb-4 relative">
                    <div class="absolute inset-0 flex items-center justify-center">
                        <span class="text-gray-400 text-sm font-medium">Карта загружается...</span>
                    </div>
                </div>
                
                {f'''
                <a href="https://maps.google.com/?q={data.get('location_address', data.get('location', ''))}" 
                   target="_blank" 
                   class="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 transition-colors font-medium">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path>
                    </svg>
                    Открыть в картах
                </a>
                ''' if data.get('location') or data.get('location_address') else ''}
            </div>
        </div>
    </div>
</div>

            
            <!-- Additional Info Cards -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12 sm:mb-16">
                {f'''
                <!-- Dress Code Card -->
                <div class="{theme_styles['card']} {theme_styles['spacing']} slide-up hover-lift">
                    <div class="flex items-center gap-4 mb-4">
                        <div class="w-10 h-10 icon-gradient bg-gradient-to-r {colors['primary']} rounded-xl flex items-center justify-center">
                            <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                            </svg>
                        </div>
                        <h3 class="text-lg font-bold {colors['accent']}">Дресс-код</h3>
                    </div>
                    <p class="text-gray-600 leading-relaxed">{data.get('dress_code', 'Свободный стиль')}</p>
                </div>
                ''' if data.get('dress_code') else ''}
                
                {f'''
                <!-- Special Notes Card -->
                <div class="{theme_styles['card']} {theme_styles['spacing']} slide-up hover-lift">
                    <div class="flex items-center gap-4 mb-4">
                        <div class="w-10 h-10 icon-gradient bg-gradient-to-r {colors['primary']} rounded-xl flex items-center justify-center">
                            <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                            </svg>
                        </div>
                        <h3 class="text-lg font-bold {colors['accent']}">Важно знать</h3>
                    </div>
                    <p class="text-gray-600 leading-relaxed">{data.get('special_notes', '')}</p>
                </div>
                ''' if data.get('special_notes') else ''}
                
                {f'''
                <!-- Gift Info Card -->
                <div class="{theme_styles['card']} {theme_styles['spacing']} slide-up hover-lift">
                    <div class="flex items-center gap-4 mb-4">
                        <div class="w-10 h-10 icon-gradient bg-gradient-to-r {colors['primary']} rounded-xl flex items-center justify-center">
                            <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7"></path>
                            </svg>
                        </div>
                        <h3 class="text-lg font-bold {colors['accent']}">Подарки</h3>
                    </div>
                    <p class="text-gray-600 leading-relaxed">{data.get('gift_info', '')}</p>
                </div>
                ''' if data.get('gift_info') else ''}
                
                {f'''
                <!-- Menu Card -->
                <div class="{theme_styles['card']} {theme_styles['spacing']} slide-up hover-lift">
                    <div class="flex items-center gap-4 mb-4">
                        <div class="w-10 h-10 icon-gradient bg-gradient-to-r {colors['primary']} rounded-xl flex items-center justify-center">
                            <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path>
                            </svg>
                        </div>
                        <h3 class="text-lg font-bold {colors['accent']}">Меню</h3>
                    </div>
                    <p class="text-gray-600 leading-relaxed">{data.get('menu_info', '')}</p>
                </div>
                ''' if data.get('menu_info') else ''}
            </div>
            
            <!-- RSVP Section -->
            {rsvp_section}
            
            <!-- Contact Section -->
            {contact_section}
            
            <!-- Footer -->
            <div class="text-center mt-12 sm:mt-16 fade-in">
                <div class="{theme_styles['card']} {theme_styles['spacing']} max-w-2xl mx-auto">
                    <div class="flex items-center justify-center gap-4 mb-6">
                        <div class="w-12 h-12 icon-gradient bg-gradient-to-r {colors['primary']} rounded-full flex items-center justify-center pulse-gentle">
                            <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path>
                            </svg>
                        </div>
                        <h3 class="text-2xl font-bold {colors['accent']}">
                            Ждём вас!
                        </h3>
                    </div>
                    
                    <p class="text-gray-600 leading-relaxed mb-6">
                        {data.get('closing_message', 'Будем рады видеть вас на нашем празднике. Увидимся скоро!')}
                    </p>
                    
                    <div class="inline-flex items-center gap-2 text-sm text-gray-500">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                        </svg>
                        Создано с любовью
                    </div>
                </div>
            </div>
        </div>
    </div>
    
    <!-- JavaScript для интерактивности -->
    <script>
        // Плавная анимация появления элементов
        const observerOptions = {{
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        }};
        
        const observer = new IntersectionObserver((entries) => {{
            entries.forEach(entry => {{
                if (entry.isIntersecting) {{
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                }}
            }});
        }}, observerOptions);
        
        // Наблюдаем за элементами с анимацией
        document.querySelectorAll('.fade-in, .slide-up').forEach(el => {{
            observer.observe(el);
        }});
        
        // Обработка RSVP кнопок
        document.querySelectorAll('button').forEach(button => {{
            button.addEventListener('click', function() {{
                // Добавляем визуальный фидбек
                this.style.transform = 'scale(0.95)';
                setTimeout(() => {{
                    this.style.transform = 'scale(1)';
                }}, 150);
                
                // Здесь можно добавить отправку данных на сервер
                console.log('RSVP clicked:', this.textContent);
            }});
        }});
        
        // Параллакс эффект для фона
        window.addEventListener('scroll', () => {{
            const scrolled = window.pageYOffset;
            const parallax = document.querySelector('body');
            const speed = scrolled * 0.5;
            
            if (parallax) {{
                parallax.style.transform = `translateY(${{speed}}px)`;
            }}
        }});
        
        // Анимация hover для карточек
        document.querySelectorAll('.hover-lift').forEach(card => {{
            card.addEventListener('mouseenter', function() {{
                this.style.transition = 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
                this.style.transform = 'translateY(-8px)';
                this.style.boxShadow = '0 25px 50px -12px rgba(0, 0, 0, 0.3)';
            }});
            
            card.addEventListener('mouseleave', function() {{
                this.style.transform = 'translateY(0)';
                this.style.boxShadow = '0 25px 50px -12px rgba(0, 0, 0, 0.25)';
            }});
        }});
        
        // Имитация загрузки карты
        setTimeout(() => {{
            const mapPlaceholder = document.querySelector('.map-placeholder');
            if (mapPlaceholder) {{
                mapPlaceholder.innerHTML = `
                    <div class="h-full w-full bg-gray-100 rounded-xl flex items-center justify-center">
                        <div class="text-center">
                            <div class="w-16 h-16 bg-gradient-to-r {colors['primary']} rounded-full flex items-center justify-center mx-auto mb-2">
                                <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
                                </svg>
                            </div>
                            <p class="text-sm text-gray-600 font-medium">Место проведения</p>
                        </div>
                    </div>
                `;
            }}
        }}, 2000);
    </script>
</body>
</html>"""

мне нужно чтобы на 1 странице был только заголовок и описание, на 2 странице были календарь и карта(карта должна быть снизу календаря, можно еще добавить сколько осталось до события), на 3 страницу rsvp, контактные данные и остальное.
Также мне нужно чтобы код реально учитывал выбранный стиль и генерировал сайты в стиле современный, классический, минималистичный и тд. .
Еще надо чтобы выбранный шаблон тоже добавлял что-то свое, а то они никак не отличаются! Если я выбрал День Рождение, то должно быть что-то связанное с Днем Рождения, и тоже самое с остальными.