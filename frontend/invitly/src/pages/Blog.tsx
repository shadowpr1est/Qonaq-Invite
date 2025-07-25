import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, User, ArrowRight } from 'lucide-react';
import MainLayout from '@/components/MainLayout';

const blogPosts = [
  {
    id: 1,
    title: '10 трендов в дизайне свадебных приглашений 2024',
    excerpt: 'Узнайте о самых актуальных тенденциях в оформлении свадебных приглашений в этом году...',
    author: 'Анна Петрова',
    date: '15 июня 2024',
    readTime: '5 мин',
    category: 'Дизайн',
    image: 'wedding-trends'
  },
  {
    id: 2,
    title: 'Как организовать детский праздник: пошаговый гид',
    excerpt: 'Полное руководство по планированию незабываемого детского дня рождения от А до Я...',
    author: 'Марат Касымов',
    date: '12 июня 2024',
    readTime: '8 мин',
    category: 'Планирование',
    image: 'kids-party'
  },
  {
    id: 3,
    title: 'Цифровые vs бумажные приглашения: что выбрать?',
    excerpt: 'Сравниваем плюсы и минусы традиционных и современных способов приглашения гостей...',
    author: 'Дана Абдуллина',
    date: '10 июня 2024',
    readTime: '6 мин',
    category: 'Советы',
    image: 'digital-vs-paper'
  }
];

const categories = ['Все', 'Дизайн', 'Планирование', 'Советы', 'Тренды'];

const Blog = () => {
  return (
    <MainLayout>
      <div className="min-h-screen bg-gradient-to-br from-brand-50 to-white pt-24 md:pt-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-16">
          {/* Header Section */}
          <div className="text-center mb-8 md:mb-16">
            <h1 className="text-3xl md:text-5xl font-bold mb-4 md:mb-6">
              <span className="text-gradient">Блог</span> InviteAI
            </h1>
            <p className="text-base md:text-xl text-muted-foreground max-w-3xl mx-auto">
              Советы по организации мероприятий, тренды дизайна и вдохновение для ваших праздников
            </p>
          </div>

          {/* Categories Filter */}
          <div className="flex flex-wrap justify-center gap-2 md:gap-4 mb-8 md:mb-12">
            {categories.map((category, index) => (
              <Button
                key={category}
                variant={index === 0 ? "default" : "outline"}
                className={index === 0 ? "bg-gradient-brand" : ""}
              >
                {category}
              </Button>
            ))}
          </div>

          {/* Featured Post */}
          <Card className="mb-8 md:mb-12 shadow-xl overflow-hidden">
            <div className="grid grid-cols-1 lg:grid-cols-2">
              <div className="h-64 lg:h-auto bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center text-white">
                <div className="text-center">
                  <div className="text-6xl mb-4">✨</div>
                  <div className="text-lg font-semibold">Главная статья</div>
                </div>
              </div>
              <div className="p-8 flex flex-col justify-center">
                <div className="text-sm text-brand-600 font-semibold mb-2">РЕКОМЕНДУЕМ</div>
                <h2 className="text-3xl font-bold mb-4">
                  {blogPosts[0].title}
                </h2>
                <p className="text-muted-foreground mb-6">
                  {blogPosts[0].excerpt}
                </p>
                <div className="flex items-center gap-4 text-sm text-muted-foreground mb-6">
                  <div className="flex items-center gap-1">
                    <User className="w-4 h-4" />
                    {blogPosts[0].author}
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    {blogPosts[0].date}
                  </div>
                  <span>{blogPosts[0].readTime}</span>
                </div>
                <Button className="self-start bg-gradient-brand hover:opacity-90">
                  Читать статью
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </div>
          </Card>

          {/* Blog Posts Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-8 mb-8 md:mb-12">
            {blogPosts.slice(1).map((post) => (
              <Card key={post.id} className="shadow-lg hover:shadow-xl transition-shadow cursor-pointer group">
                <div className="h-48 bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white">
                  <div className="text-center">
                    <div className="text-4xl mb-2">📝</div>
                    <div className="text-sm font-semibold">{post.category}</div>
                  </div>
                </div>
                <CardHeader>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                    <span className="bg-brand-100 text-brand-700 px-2 py-1 rounded-full">
                      {post.category}
                    </span>
                    <span>•</span>
                    <span>{post.readTime}</span>
                  </div>
                  <CardTitle className="text-lg group-hover:text-brand-600 transition-colors">
                    {post.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground text-sm mb-4">
                    {post.excerpt}
                  </p>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <User className="w-3 h-3" />
                      {post.author}
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {post.date}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Newsletter Signup */}
          <Card className="bg-gradient-brand text-white border-0 shadow-xl mt-8">
            <CardContent className="p-6 md:p-12 text-center">
              <div className="text-5xl mb-6">📬</div>
              <h3 className="text-3xl font-bold mb-4">
                Подпишитесь на рассылку
              </h3>
              <p className="text-xl mb-8 text-white/90 max-w-2xl mx-auto">
                Получайте лучшие статьи о планировании мероприятий и новые шаблоны приглашений
              </p>
              <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
                <input
                  type="email"
                  placeholder="Ваш email"
                  className="flex-1 px-4 py-3 rounded-lg text-gray-900"
                />
                <Button 
                  size="lg" 
                  className="bg-white text-brand-600 hover:bg-gray-100 whitespace-nowrap"
                >
                  Подписаться
                </Button>
              </div>
              <p className="text-sm text-white/70 mt-4">
                Никакого спама. Только полезный контент.
              </p>
            </CardContent>
          </Card>

          {/* Load More */}
          <div className="text-center mt-8 md:mt-12">
            <Button variant="outline" size="lg">
              Загрузить еще статьи
            </Button>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default Blog;
