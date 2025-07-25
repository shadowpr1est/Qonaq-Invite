import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft } from 'lucide-react';

const Legal = () => {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => window.history.back()}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Назад
          </Button>
          <div className="w-8 h-8 bg-gradient-brand rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">AI</span>
          </div>
          <span className="font-bold text-lg">InviteAI</span>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-16">
        <div className="text-center mb-8 md:mb-12">
          <h1 className="text-2xl md:text-4xl font-bold mb-2 md:mb-4">Правовая информация</h1>
          <p className="text-base md:text-xl text-muted-foreground">
            Условия использования и политика конфиденциальности
          </p>
        </div>

        <div className="space-y-4 md:space-y-8">
          {/* Terms of Service */}
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">Условия использования</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-gray max-w-none">
              <h3>1. Общие положения</h3>
              <p>
                Настоящие Условия использования регулируют использование сервиса InviteAI 
                для создания цифровых приглашений. Используя наш сервис, вы соглашаетесь 
                с данными условиями.
              </p>

              <h3>2. Описание сервиса</h3>
              <p>
                InviteAI предоставляет онлайн-платформу для создания, настройки и 
                распространения цифровых приглашений на различные мероприятия.
              </p>

              <h3>3. Права и обязанности пользователей</h3>
              <ul>
                <li>Вы обязуетесь использовать сервис только в законных целях</li>
                <li>Запрещается создание приглашений с оскорбительным или незаконным контентом</li>
                <li>Вы сохраняете права на созданный вами контент</li>
                <li>Мы оставляем за собой право модерировать контент</li>
              </ul>

              <h3>4. Ограничения ответственности</h3>
              <p>
                Сервис предоставляется "как есть". Мы не несем ответственности за 
                любые убытки, связанные с использованием платформы.
              </p>

              <h3>5. Изменения в условиях</h3>
              <p>
                Мы можем изменять данные условия. О существенных изменениях будем 
                уведомлять пользователей заранее.
              </p>
            </CardContent>
          </Card>

          {/* Privacy Policy */}
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">Политика конфиденциальности</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-gray max-w-none">
              <h3>1. Сбор информации</h3>
              <p>
                Мы собираем информацию, которую вы предоставляете при регистрации и 
                использовании сервиса: email, имя, созданные приглашения.
              </p>

              <h3>2. Использование информации</h3>
              <p>Мы используем вашу информацию для:</p>
              <ul>
                <li>Предоставления услуг платформы</li>
                <li>Улучшения качества сервиса</li>
                <li>Технической поддержки</li>
                <li>Отправки важных уведомлений</li>
              </ul>

              <h3>3. Защита данных</h3>
              <p>
                Мы применяем современные методы защиты для обеспечения безопасности 
                ваших данных. Все данные шифруются при передаче и хранении.
              </p>

              <h3>4. Передача третьим лицам</h3>
              <p>
                Мы не продаем и не передаем ваши персональные данные третьим лицам 
                без вашего согласия, за исключением случаев, требуемых законом.
              </p>

              <h3>5. Cookies</h3>
              <p>
                Мы используем cookies для улучшения работы сайта и анализа 
                пользовательского поведения. Вы можете отключить cookies в настройках браузера.
              </p>

              <h3>6. Ваши права</h3>
              <p>Вы имеете право:</p>
              <ul>
                <li>Получить копию ваших данных</li>
                <li>Исправить неточные данные</li>
                <li>Удалить ваши данные</li>
                <li>Ограничить обработку данных</li>
              </ul>
            </CardContent>
          </Card>

          {/* Contact Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">Контактная информация</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-4">
                По вопросам, связанным с условиями использования или политикой 
                конфиденциальности, обращайтесь:
              </p>
              
              <div className="space-y-2 text-muted-foreground">
                <p><strong>Email:</strong> legal@invite.ai</p>
                <p><strong>Телефон:</strong> +7 (727) 123-45-67</p>
                <p><strong>Адрес:</strong> г. Алматы, ул. Достык, 123, офис 456</p>
              </div>

              <div className="mt-6 p-4 bg-brand-50 rounded-lg">
                <p className="text-sm text-muted-foreground">
                  <strong>Дата последнего обновления:</strong> 15 июня 2024 года
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-8 md:mt-12">
          <Card className="bg-gradient-brand text-white border-0">
            <CardContent className="p-4 md:p-8">
              <h3 className="text-2xl font-bold mb-4">Есть вопросы?</h3>
              <p className="mb-6 text-white/90">
                Наша команда поддержки готова помочь вам
              </p>
              <Button 
                size="lg" 
                className="bg-white text-brand-600 hover:bg-gray-100"
              >
                Связаться с поддержкой
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Legal;
