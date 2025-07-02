import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, User, LogOut, Settings, Plus, LayoutDashboard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/use-auth';

const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout, isInitialized } = useAuth();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 64);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Автоматический скролл к якорю при переходе на главную страницу с хешем
  useEffect(() => {
    if (location.pathname === '/' && location.hash) {
      const timer = setTimeout(() => {
        const element = document.querySelector(location.hash);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100); // Небольшая задержка для загрузки контента

      return () => clearTimeout(timer);
    }
  }, [location.pathname, location.hash]);

  const navLinks = [
    { label: 'Как работает', href: '#how-it-works', isAnchor: true },
    { label: 'Шаблоны', href: '#templates', isAnchor: true },
    { label: 'Цены', href: '/pricing', isAnchor: false },
    { label: 'Блог', href: '/blog', isAnchor: false }
  ];

  // Check if we're on the home page to determine if we should use anchor links
  const isHomePage = location.pathname === '/';

  const handleLogout = async () => {
    await logout();
    window.location.href = '/';
  };

  // Get user initials for avatar
  const getUserInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  // Handle navigation to anchor links
  const handleNavClick = (link: typeof navLinks[0], e: React.MouseEvent) => {
    e.preventDefault();
    setIsMobileMenuOpen(false);

    if (link.isAnchor) {
      if (isHomePage) {
        // Если на главной странице, просто скроллим к якорю
        const element = document.querySelector(link.href);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      } else {
        // Если не на главной, перенаправляем на главную с якорем
        navigate('/' + link.href);
      }
    } else {
      // Обычные ссылки
      navigate(link.href);
    }
  };

  return (
    <motion.header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled 
          ? 'bg-brand-500 shadow-lg' 
          : 'bg-white/92 backdrop-blur-[10px]'
      }`}
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ type: "spring", stiffness: 100, damping: 20 }}
    >
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-18 md:h-20">
          {/* Logo */}
          <motion.div
            animate={{ scale: isScrolled ? 0.9 : 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 20 }}
          >
            <a 
              href="/"
              className={`text-xl font-bold font-display transition-colors ${
                isScrolled ? 'text-white' : 'text-foreground'
              }`}
              aria-label="Qonaq Invite - главная страница"
            >
              Qonaq Invite
            </a>
          </motion.div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                onClick={(e) => handleNavClick(link, e)}
                className={`font-medium transition-colors hover:opacity-80 cursor-pointer ${
                  isScrolled ? 'text-white' : 'text-muted-foreground'
                }`}
                aria-label={link.label}
              >
                {link.label}
              </a>
            ))}
          </nav>

          {/* Desktop Auth Section */}
          <div className="hidden md:flex items-center space-x-3">
            {!isInitialized ? (
              // Loading state
              <div className="w-10 h-10 rounded-full bg-gray-200 animate-pulse" />
            ) : user ? (
              // Authenticated user section
              <>
                <Button
                  className={`font-semibold px-4 py-2 transition-all ${
                    isScrolled 
                      ? 'bg-white text-brand-500 hover:bg-gray-100' 
                      : 'bg-gradient-brand text-white hover:opacity-90'
                  }`}
                  onClick={() => window.location.href = '/builder'}
                  aria-label="Создать новое приглашение"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Создать
                </Button>
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      className={`relative h-10 w-10 rounded-full ${
                        isScrolled ? 'hover:bg-white/10' : 'hover:bg-gray-100'
                      }`}
                    >
                      <Avatar className="h-9 w-9">
                        <AvatarImage src={user.avatar} alt={user.name} />
                        <AvatarFallback className="bg-gradient-brand text-white">
                          {getUserInitials(user.name)}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56" align="end" forceMount>
                    <div className="flex items-center justify-start gap-2 p-2">
                      <div className="flex flex-col space-y-1 leading-none">
                        <p className="font-medium">{user.name}</p>
                        <p className="w-[200px] truncate text-sm text-muted-foreground">
                          {user.email}
                        </p>
                      </div>
                    </div>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem 
                      onClick={() => window.location.href = '/dashboard'}
                      className="cursor-pointer"
                    >
                      <LayoutDashboard className="mr-2 h-4 w-4" />
                      <span>Мои приглашения</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => window.location.href = '/profile'}
                      className="cursor-pointer"
                    >
                      <User className="mr-2 h-4 w-4" />
                      <span>Профиль</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => window.location.href = '/settings'}
                      className="cursor-pointer"
                    >
                      <Settings className="mr-2 h-4 w-4" />
                      <span>Настройки</span>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem 
                      onClick={handleLogout}
                      className="cursor-pointer text-red-600 focus:text-red-600"
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Выйти</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              // Guest user buttons
              <>
                <Button 
                  variant="ghost"
                  className={`font-semibold transition-all ${
                    isScrolled 
                      ? 'text-white hover:bg-white/10' 
                      : 'text-muted-foreground hover:bg-gray-100'
                  }`}
                  onClick={() => window.location.href = '/login'}
                  aria-label="Войти в аккаунт"
                >
                  Войти
                </Button>
                <Button 
                  className={`font-semibold px-6 transition-all ${
                    isScrolled 
                      ? 'bg-white text-brand-500 hover:bg-gray-100' 
                      : 'bg-gradient-brand text-white hover:opacity-90'
                  }`}
                  onClick={() => window.location.href = '/signup'}
                  aria-label="Создать аккаунт"
                >
                  Регистрация
                </Button>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label={isMobileMenuOpen ? 'Закрыть меню' : 'Открыть меню'}
            aria-expanded={isMobileMenuOpen}
          >
            {isMobileMenuOpen ? (
              <X className={`w-6 h-6 ${isScrolled ? 'text-white' : 'text-foreground'}`} />
            ) : (
              <Menu className={`w-6 h-6 ${isScrolled ? 'text-white' : 'text-foreground'}`} />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ type: "spring", stiffness: 100, damping: 20 }}
              className="md:hidden overflow-hidden border-t border-gray-200/20"
            >
              <nav className="py-4 space-y-4">
                {navLinks.map((link) => (
                  <a
                    key={link.label}
                    href={link.href}
                    onClick={(e) => handleNavClick(link, e)}
                    className={`block font-medium transition-colors hover:opacity-80 cursor-pointer ${
                      isScrolled ? 'text-white' : 'text-muted-foreground'
                    }`}
                  >
                    {link.label}
                  </a>
                ))}
                
                {/* Mobile Auth Section */}
                <div className="flex flex-col space-y-3 pt-4">
                  {!isInitialized ? (
                    <div className="flex items-center space-x-3 px-2">
                      <div className="h-8 w-8 rounded-full bg-gray-200 animate-pulse" />
                      <div className="space-y-1">
                        <div className="h-4 w-20 bg-gray-200 animate-pulse rounded" />
                        <div className="h-3 w-32 bg-gray-200 animate-pulse rounded" />
                      </div>
                    </div>
                  ) : user ? (
                    <>
                      <div className="flex items-center space-x-3 px-2">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={user.avatar} alt={user.name} />
                          <AvatarFallback className="bg-gradient-brand text-white text-sm">
                            {getUserInitials(user.name)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className={`font-medium ${isScrolled ? 'text-white' : 'text-foreground'}`}>
                            {user.name}
                          </p>
                          <p className={`text-sm ${isScrolled ? 'text-white/70' : 'text-muted-foreground'}`}>
                            {user.email}
                          </p>
                        </div>
                      </div>
                      
                      <Button 
                        className={`w-full font-semibold transition-all ${
                          isScrolled 
                            ? 'bg-white text-brand-500 hover:bg-gray-100' 
                            : 'bg-gradient-brand text-white hover:opacity-90'
                        }`}
                        onClick={() => {
                          setIsMobileMenuOpen(false);
                          window.location.href = '/builder';
                        }}
                      >
                        <Plus className="mr-2 h-4 w-4" />
                        Создать приглашение
                      </Button>
                      
                      <Button 
                        variant="ghost"
                        className={`w-full justify-start font-semibold transition-all ${
                          isScrolled 
                            ? 'text-white hover:bg-white/10' 
                            : 'text-muted-foreground hover:bg-gray-100'
                        }`}
                        onClick={() => {
                          setIsMobileMenuOpen(false);
                          window.location.href = '/dashboard';
                        }}
                      >
                        <LayoutDashboard className="mr-2 h-4 w-4" />
                        Мои приглашения
                      </Button>
                      
                      <Button 
                        variant="ghost"
                        className={`w-full justify-start font-semibold transition-all ${
                          isScrolled 
                            ? 'text-white hover:bg-white/10' 
                            : 'text-muted-foreground hover:bg-gray-100'
                        }`}
                        onClick={() => {
                          setIsMobileMenuOpen(false);
                          window.location.href = '/profile';
                        }}
                      >
                        <User className="mr-2 h-4 w-4" />
                        Профиль
                      </Button>
                      <Button 
                        variant="ghost"
                        className={`w-full justify-start font-semibold transition-all ${
                          isScrolled 
                            ? 'text-white hover:bg-white/10' 
                            : 'text-muted-foreground hover:bg-gray-100'
                        }`}
                        onClick={() => {
                          setIsMobileMenuOpen(false);
                          window.location.href = '/settings';
                        }}
                      >
                        <Settings className="mr-2 h-4 w-4" />
                        Настройки
                      </Button>
                      <Button 
                        variant="ghost"
                        className="w-full justify-start font-semibold text-red-600 hover:bg-red-50 hover:text-red-700"
                        onClick={() => {
                          setIsMobileMenuOpen(false);
                          handleLogout();
                        }}
                      >
                        <LogOut className="mr-2 h-4 w-4" />
                        Выйти
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button 
                        variant="ghost"
                        className={`w-full font-semibold transition-all ${
                          isScrolled 
                            ? 'text-white hover:bg-white/10' 
                            : 'text-muted-foreground hover:bg-gray-100'
                        }`}
                        onClick={() => {
                          setIsMobileMenuOpen(false);
                          window.location.href = '/login';
                        }}
                      >
                        Войти
                      </Button>
                      <Button 
                        className={`w-full font-semibold transition-all ${
                          isScrolled 
                            ? 'bg-white text-brand-500 hover:bg-gray-100' 
                            : 'bg-gradient-brand text-white hover:opacity-90'
                        }`}
                        onClick={() => {
                          setIsMobileMenuOpen(false);
                          window.location.href = '/signup';
                        }}
                      >
                        Регистрация
                      </Button>
                    </>
                  )}
                </div>
              </nav>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.header>
  );
};

export default Header;
