import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, User, LogOut, Settings, Plus, LayoutDashboard, Globe, ChevronDown } from 'lucide-react';
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
import { EmailVerificationBanner } from '@/components/EmailVerificationBanner';
import { useTranslation } from 'react-i18next';
import Container from '@/components/ui/container';
import LanguageSwitcher from './LanguageSwitcher';



const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout, isInitialized } = useAuth();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('scroll', handleScroll);
      return () => window.removeEventListener('scroll', handleScroll);
    }
  }, []);

  // Автоматический скролл к якорю при переходе на главную страницу с хешем
  useEffect(() => {
    if (location.pathname === '/' && location.hash) {
      const timer = setTimeout(() => {
        const element = document.querySelector(location.hash);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);

      return () => clearTimeout(timer);
    }
  }, [location.pathname, location.hash]);

  const { t } = useTranslation();
  
  const navLinks = [
    { label: t('header.how_it_works'), href: '#how-it-works', isAnchor: true },
    { label: t('header.templates'), href: '#templates', isAnchor: true },
    { label: t('header.pricing'), href: '/pricing', isAnchor: false },
    { label: t('header.blog'), href: '/blog', isAnchor: false }
  ];

  const isHomePage = location.pathname === '/';

  const handleLogout = async () => {
    try {
      await logout();
      window.location.href = '/';
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const getUserInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const handleNavClick = (link: typeof navLinks[0], e?: React.MouseEvent) => {
    e?.preventDefault();
    setIsMobileMenuOpen(false);

    if (link.isAnchor) {
      if (isHomePage) {
        const element = document.querySelector(link.href);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      } else {
        navigate('/' + link.href);
      }
    } else {
      navigate(link.href);
    }
  };

  return (
    <>
      <motion.header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          isScrolled 
            ? 'bg-white/95 backdrop-blur-xl shadow-xl border-b border-gray-100/50' 
            : 'bg-white/90 backdrop-blur-[20px]'
        }`}
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 100, damping: 20 }}
      >
        <Container>
          <div className="flex items-center justify-between h-18 md:h-24 lg:h-28">
            {/* Logo */}
            <motion.div
              animate={{ scale: isScrolled ? 0.95 : 1 }}
              transition={{ type: "spring", stiffness: 200, damping: 20 }}
              className="flex-shrink-0"
            >
                              <a 
                  href="/"
                  className="flex items-center gap-4 group select-none"
                  aria-label={t('header.home')}
                >
                <motion.div
                  whileHover={{ rotate: 5, scale: 1.1 }}
                  transition={{ type: "spring", stiffness: 400, damping: 10 }}
                >
                  <img 
                    src="/logo.png" 
                    alt="Invitly Logo" 
                    className="w-10 h-10 md:w-12 md:h-12 lg:w-14 lg:h-14 drop-shadow-xl transition-all duration-300" 
                  />
                </motion.div>
                <span className="text-xl md:text-2xl lg:text-3xl font-bold leading-tight bg-gradient-to-r from-indigo-600 via-purple-600 to-purple-700 bg-clip-text text-transparent tracking-tight drop-shadow-sm">
                  Invitly AI
                </span>
              </a>
            </motion.div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-8">
              {navLinks.map((link, index) => (
                <motion.a
                  key={link.label}
                  href={link.href}
                  onClick={(e) => handleNavClick(link, e)}
                  className="font-medium text-gray-700 hover:text-gray-900 transition-colors duration-200 relative group"
                  aria-label={link.label}
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ y: -2 }}
                >
                  {link.label}
                  <motion.span 
                    className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-indigo-500 to-purple-600 transition-all duration-300"
                    whileHover={{ width: "100%" }}
                  />
                </motion.a>
              ))}
            </nav>

            {/* Desktop Auth Section */}
            <div className="hidden md:flex items-center space-x-4">
              <LanguageSwitcher />
              
              {!isInitialized ? (
                <motion.div 
                  className="w-10 h-10 rounded-full bg-gradient-to-r from-gray-200 to-gray-300 animate-pulse"
                  animate={{ opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                />
              ) : user ? (
                <>
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.2 }}
                    whileHover={{ scale: 1.05, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Button
                      className="font-semibold px-6 py-2.5 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 rounded-xl"
                      onClick={() => navigate('/builder')}
                      aria-label={t('header.create_invitation')}
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      {t('header.create')}
                    </Button>
                  </motion.div>
                  
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <motion.div
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <Button
                          variant="ghost"
                          className="relative h-10 w-10 rounded-full hover:bg-gray-100 transition-colors duration-200"
                        >
                          <Avatar className="h-9 w-9 ring-2 ring-gray-100 hover:ring-indigo-200 transition-all duration-200">
                            <AvatarImage src={user.avatar} alt={user.name} />
                            <AvatarFallback className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-medium">
                              {getUserInitials(user.name)}
                            </AvatarFallback>
                          </Avatar>
                        </Button>
                      </motion.div>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-64 p-2" align="end" forceMount>
                      <motion.div 
                        className="flex items-center justify-start gap-3 p-3 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg"
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                      >
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={user.avatar} alt={user.name} />
                          <AvatarFallback className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-medium">
                            {getUserInitials(user.name)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col space-y-1 leading-none">
                          <p className="font-semibold text-gray-900">{user.name}</p>
                          <p className="w-[200px] truncate text-sm text-gray-500">
                            {user.email}
                          </p>
                        </div>
                      </motion.div>
                      <DropdownMenuSeparator />
                                              <DropdownMenuItem 
                          onClick={() => navigate('/dashboard')}
                          className="cursor-pointer hover:bg-gradient-to-r hover:from-indigo-50 hover:to-purple-50 rounded-lg transition-all duration-200"
                        >
                          <LayoutDashboard className="mr-3 h-4 w-4 text-indigo-600" />
                          <span>{t('header.my_invitations')}</span>
                        </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => navigate('/profile')}
                        className="cursor-pointer hover:bg-gradient-to-r hover:from-indigo-50 hover:to-purple-50 rounded-lg transition-all duration-200"
                      >
                        <User className="mr-3 h-4 w-4 text-indigo-600" />
                        <span>Профиль</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => navigate('/settings')}
                        className="cursor-pointer hover:bg-gradient-to-r hover:from-indigo-50 hover:to-purple-50 rounded-lg transition-all duration-200"
                      >
                        <Settings className="mr-3 h-4 w-4 text-indigo-600" />
                        <span>Настройки</span>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                                              <DropdownMenuItem 
                          onClick={handleLogout}
                          className="cursor-pointer text-red-600 focus:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200"
                        >
                          <LogOut className="mr-3 h-4 w-4" />
                          <span>{t('logout')}</span>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </>
              ) : (
                <motion.div 
                  className="flex items-center space-x-3"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button
                      variant="ghost"
                      className="font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 transition-all duration-200"
                      onClick={() => navigate('/login')}
                    >
                      {t('login')}
                    </Button>
                  </motion.div>
                  <motion.div whileHover={{ scale: 1.05, y: -2 }} whileTap={{ scale: 0.95 }}>
                    <Button
                      className="font-semibold px-6 py-2.5 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 rounded-xl"
                      onClick={() => navigate('/signup')}
                    >
                      {t('signup')}
                    </Button>
                  </motion.div>
                </motion.div>
              )}
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden">
              <motion.button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="relative p-3 rounded-xl hover:bg-gray-100 transition-all duration-200 active:scale-95"
                aria-label={t('header.open_menu')}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <div className="relative w-6 h-6">
                  <AnimatePresence mode="wait">
                    {isMobileMenuOpen ? (
                      <motion.div
                        key="close"
                        initial={{ rotate: -90, opacity: 0 }}
                        animate={{ rotate: 0, opacity: 1 }}
                        exit={{ rotate: 90, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="absolute inset-0"
                      >
                        <X className="h-6 w-6 text-gray-700" />
                      </motion.div>
                    ) : (
                      <motion.div
                        key="menu"
                        initial={{ rotate: 90, opacity: 0 }}
                        animate={{ rotate: 0, opacity: 1 }}
                        exit={{ rotate: -90, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="absolute inset-0"
                      >
                        <Menu className="h-6 w-6 text-gray-700" />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.button>
            </div>
          </div>
        </Container>

        {/* Mobile Navigation */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden bg-white/98 backdrop-blur-2xl border-t border-gray-100/50 shadow-2xl"
            >
              <Container className="py-8">
                <motion.nav 
                  className="space-y-4"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.1 }}
                >
                  {navLinks.map((link, index) => (
                    <motion.a
                      key={link.label}
                      href={link.href}
                      onClick={(e) => handleNavClick(link, e)}
                      className="block px-6 py-4 text-lg font-medium text-gray-700 hover:text-gray-900 hover:bg-gradient-to-r hover:from-indigo-50 hover:to-purple-50 rounded-2xl transition-all duration-300 active:scale-95"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      whileHover={{ x: 5 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      {link.label}
                    </motion.a>
                  ))}
                </motion.nav>
                
                <motion.div 
                  className="mt-8 pt-8 border-t border-gray-200/50"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                >
                  <div className="mb-6">
                    <LanguageSwitcher />
                  </div>
                  
                  {!isInitialized ? (
                    <motion.div 
                      className="w-12 h-12 rounded-full bg-gradient-to-r from-gray-200 to-gray-300 animate-pulse"
                      animate={{ opacity: [0.5, 1, 0.5] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    />
                  ) : user ? (
                    <motion.div 
                      className="space-y-4"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4 }}
                    >
                      <motion.button
                        className="w-full flex items-center justify-center gap-3 px-6 py-4 font-semibold bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 rounded-2xl text-lg"
                        onClick={() => {
                          setIsMobileMenuOpen(false);
                          navigate('/builder');
                        }}
                        whileHover={{ scale: 1.02, y: -2 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <Plus className="w-5 h-5" />
                        {t('header.create_invitation')}
                      </motion.button>
                      <motion.div 
                        className="flex items-center gap-4 p-6 bg-gradient-to-r from-gray-50 to-gray-100 rounded-2xl"
                        whileHover={{ scale: 1.02 }}
                        transition={{ type: "spring", stiffness: 400, damping: 10 }}
                      >
                        <Avatar className="h-12 w-12 ring-2 ring-white shadow-md">
                          <AvatarImage src={user.avatar} alt={user.name} />
                          <AvatarFallback className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-medium text-lg">
                            {getUserInitials(user.name)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="text-base font-semibold text-gray-900 truncate">{user.name}</p>
                          <p className="text-sm text-gray-500 truncate">{user.email}</p>
                        </div>
                      </motion.div>
                      <div className="space-y-3">
                        <motion.button
                          className="w-full flex items-center gap-4 px-6 py-4 text-left hover:bg-gradient-to-r hover:from-indigo-50 hover:to-purple-50 rounded-2xl transition-all duration-300 text-lg font-medium"
                          onClick={() => {
                            setIsMobileMenuOpen(false);
                            navigate('/dashboard');
                          }}
                          whileHover={{ x: 5 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <LayoutDashboard className="w-5 h-5 text-indigo-600" />
                          {t('header.my_invitations')}
                        </motion.button>
                        <motion.button
                          className="w-full flex items-center gap-4 px-6 py-4 text-left hover:bg-gradient-to-r hover:from-indigo-50 hover:to-purple-50 rounded-2xl transition-all duration-300 text-lg font-medium"
                          onClick={() => {
                            setIsMobileMenuOpen(false);
                            navigate('/profile');
                          }}
                          whileHover={{ x: 5 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <User className="w-5 h-5 text-indigo-600" />
                          {t('profile')}
                        </motion.button>
                        <motion.button
                          className="w-full flex items-center gap-4 px-6 py-4 text-left hover:bg-gradient-to-r hover:from-indigo-50 hover:to-purple-50 rounded-2xl transition-all duration-300 text-lg font-medium"
                          onClick={() => {
                            setIsMobileMenuOpen(false);
                            navigate('/settings');
                          }}
                          whileHover={{ x: 5 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <Settings className="w-5 h-5 text-indigo-600" />
                          {t('settings')}
                        </motion.button>
                        <motion.button
                          className="w-full flex items-center gap-4 px-6 py-4 text-left text-red-600 hover:text-red-700 hover:bg-red-50 rounded-2xl transition-all duration-300 text-lg font-medium"
                          onClick={() => {
                            setIsMobileMenuOpen(false);
                            handleLogout();
                          }}
                          whileHover={{ x: 5 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <LogOut className="w-5 h-5" />
                          {t('logout')}
                        </motion.button>
                      </div>
                    </motion.div>
                  ) : (
                    <motion.div 
                      className="space-y-4"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4 }}
                    >
                      <motion.button
                        className="w-full px-6 py-4 font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-2xl transition-all duration-300 text-lg"
                        onClick={() => {
                          setIsMobileMenuOpen(false);
                          navigate('/login');
                        }}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        {t('login')}
                      </motion.button>
                      <motion.button
                        className="w-full px-6 py-4 font-semibold bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 rounded-2xl text-lg"
                        onClick={() => {
                          setIsMobileMenuOpen(false);
                          navigate('/signup');
                        }}
                        whileHover={{ scale: 1.02, y: -2 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        {t('signup')}
                      </motion.button>
                    </motion.div>
                  )}
                </motion.div>
              </Container>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.header>

      {/* Email verification banner */}
      {user && !user.is_email_verified && (
        <EmailVerificationBanner />
      )}
    </>
  );
};

export default Header;