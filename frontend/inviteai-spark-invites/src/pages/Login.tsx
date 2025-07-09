import { useCallback, useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';

import { useAuth } from '@/hooks/use-auth';
// import { GoogleOAuthButton } from '@/components/GoogleOAuthButton';

import MainLayout from '@/components/MainLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  AlertCircle, 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  ArrowRight,
  CheckCircle,
  Loader2,
  User
} from 'lucide-react';
import { Separator } from '@/components/ui/separator';

const loginSchema = z.object({
  email: z.string().email('Некорректный email адрес'),
  password: z.string().min(6, 'Пароль должен содержать минимум 6 символов'),
  remember: z.boolean().default(false),
});

type LoginFormData = z.infer<typeof loginSchema>;

const Login = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  
  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
      remember: false,
    },
  });

  const { login, isLoading: authLoading, error, errorSuggestion, clearError } = useAuth();

  // Очищаем ошибку при изменении формы
  useEffect(() => {
    if (error) {
      const subscription = form.watch(() => clearError());
      return () => subscription.unsubscribe();
    }
  }, [error, clearError, form]);

  const handleSubmit = useCallback(async (data: LoginFormData) => {
    try {
      await login({
        email: data.email,
        password: data.password
      });
      
      setIsSuccess(true);
      setTimeout(() => {
        navigate('/');
      }, 1500);
    } catch (error) {
      console.error('Login error:', error);
    }
  }, [login, navigate]);

  const isLoading = form.formState.isSubmitting || authLoading;

  // Success animation
  if (isSuccess) {
    return (
      <MainLayout>
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 via-blue-50 to-purple-50 px-4 pt-20">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 20 }}
            className="text-center"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="w-20 h-20 bg-gradient-to-r from-emerald-500 to-green-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg"
            >
              <CheckCircle className="w-10 h-10 text-white" />
            </motion.div>
            <motion.h2
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-2xl font-bold text-gray-900 mb-2"
            >
              Добро пожаловать!
            </motion.h2>
            <motion.p
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="text-gray-600"
            >
              Вы успешно вошли в аккаунт
            </motion.p>
          </motion.div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 px-4 pt-20 relative overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden">
          <motion.div
            animate={{
              rotate: 360,
              scale: [1, 1.1, 1],
            }}
            transition={{
              duration: 20,
              repeat: Infinity,
              ease: "linear",
            }}
            className="absolute -top-20 -right-20 w-40 h-40 bg-gradient-to-r from-blue-400/20 to-purple-400/20 rounded-full blur-xl"
          />
          <motion.div
            animate={{
              rotate: -360,
              scale: [1, 1.2, 1],
            }}
            transition={{
              duration: 25,
              repeat: Infinity,
              ease: "linear",
            }}
            className="absolute -bottom-20 -left-20 w-60 h-60 bg-gradient-to-r from-indigo-400/20 to-pink-400/20 rounded-full blur-xl"
          />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ 
            type: "spring", 
            stiffness: 100, 
            damping: 20,
            delay: 0.1
          }}
          className="relative z-10"
        >
          <Card className="w-full max-w-[460px] shadow-2xl border-0 bg-white/80 backdrop-blur-sm">
            <CardHeader className="text-center px-4 sm:px-8 md:px-12 py-8 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-t-lg">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.3, type: "spring" }}
                className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4 backdrop-blur-sm"
              >
                <User className="w-8 h-8 text-white" />
              </motion.div>
              <CardTitle className="text-3xl font-bold mb-2">
                Добро пожаловать!
              </CardTitle>
            </CardHeader>
            
            <CardContent className="px-4 sm:px-8 md:px-12 py-8 w-full">
              <AnimatePresence mode="sync">
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="mb-6 space-y-3"
                  >
                    <Alert variant="destructive" className="border-red-200 bg-red-50">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription className="text-red-800">{error}</AlertDescription>
                    </Alert>
                    {errorSuggestion && (
                      <Alert className="border-blue-200 bg-blue-50">
                        <AlertDescription className="text-blue-800 flex items-start gap-2">
                          <span className="text-blue-600 font-medium">💡</span>
                          {errorSuggestion}
                        </AlertDescription>
                      </Alert>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>

              <Form {...form}>
                <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-5 w-full">
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.4 }}
                      >
                        <FormItem>
                          <FormLabel className="text-base font-semibold text-gray-700 flex items-center gap-2">
                            <Mail className="w-4 h-4 text-blue-600" />
                            Email адрес
                          </FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Input
                  type="email" 
                                placeholder="example@email.com"
                                className="h-12 text-base pl-4 pr-4 border-2 border-gray-200 focus:border-blue-500 transition-all duration-200 bg-gray-50 focus:bg-white"
                                {...field}
                />
              </div>
                          </FormControl>
                          <FormMessage className="text-red-600 min-h-[20px] max-h-[40px] block text-sm leading-tight overflow-hidden" />
                        </FormItem>
                      </motion.div>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.5 }}
                      >
                        <FormItem>
                          <FormLabel className="text-base font-semibold text-gray-700 flex items-center gap-2">
                            <Lock className="w-4 h-4 text-blue-600" />
                            Пароль
                          </FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Input
                                type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                                className="h-12 text-base pl-4 pr-12 border-2 border-gray-200 focus:border-blue-500 transition-all duration-200 bg-gray-50 focus:bg-white"
                                {...field}
                              />
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 p-0 hover:bg-gray-100"
                                onClick={() => setShowPassword(!showPassword)}
                              >
                                {showPassword ? (
                                  <EyeOff className="h-4 w-4 text-gray-500" />
                                ) : (
                                  <Eye className="h-4 w-4 text-gray-500" />
                                )}
                              </Button>
                            </div>
                          </FormControl>
                          <FormMessage className="text-red-600 min-h-[20px] max-h-[40px] block text-sm leading-tight overflow-hidden" />
                        </FormItem>
                      </motion.div>
                    )}
                  />

                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.6 }}
                    className="flex items-center justify-between"
                  >
                    <FormField
                      control={form.control}
                      name="remember"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                              className="border-2 border-gray-300 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                            />
                          </FormControl>
                          <FormLabel className="text-sm font-medium text-gray-600">
                            Запомнить меня
                          </FormLabel>
                        </FormItem>
                      )}
                    />
                    
                    <Link 
                      to="/forgot-password" 
                      className="text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors hover:underline"
                    >
                      Забыли пароль?
                    </Link>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.7 }}
                  >
                    <Button 
                      type="submit" 
                      className="w-full h-12 text-base font-semibold bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white transition-all duration-200 transform hover:scale-[1.02] disabled:transform-none"
                      disabled={isLoading}
                      size="lg"
                    >
                      {isLoading ? (
                        <div className="flex items-center gap-2">
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Вход в систему...
              </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          Войти в аккаунт
                          <ArrowRight className="w-4 h-4" />
              </div>
                      )}
              </Button>
                  </motion.div>
                </form>
              </Form>

              {/* Google OAuth Section */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
                className="mt-6"
              >
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-300"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-4 bg-white text-gray-500 font-medium">
                      или войти через
                    </span>
                  </div>
                </div>
                
                {/* <div className="mt-4">
                  <GoogleOAuthButton 
                    mode="login" 
                    disabled={isLoading}
                  />
                </div> */}
              </motion.div>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.9 }}
                className="mt-6 text-center"
              >
                <p className="text-sm text-gray-600">
                  Нет аккаунта?{' '}
                  <Link 
                    to="/signup" 
                    className="font-medium text-blue-600 hover:text-blue-700 transition-colors hover:underline"
                  >
                    Зарегистрироваться
                  </Link>
                </p>
              </motion.div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </MainLayout>
  );
};

export default Login;
