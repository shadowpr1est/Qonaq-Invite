import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

import { useAuth } from '@/hooks/use-auth';
import { userApi } from '@/lib/api';
import { apiClient } from '@/lib/api';

import MainLayout from '@/components/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  User, 
  Camera, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar,
  Trophy,
  Target,
  Clock,
  TrendingUp,
  Edit3,
  Save,
  X,
  AlertCircle,
  CheckCircle2
} from 'lucide-react';

// Схемы валидации
const profileSchema = z.object({
  name: z.string().min(2, 'Имя должно содержать минимум 2 символа'),
  bio: z.string().max(500, 'Био не должно превышать 500 символов').optional(),
});

const passwordSchema = z.object({
  currentPassword: z.string().min(1, 'Введите текущий пароль'),
  newPassword: z.string()
    .min(8, 'Пароль должен содержать минимум 8 символов')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Пароль должен содержать минимум одну заглавную букву, одну строчную букву и одну цифру'),
  confirmPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Пароли не совпадают",
  path: ["confirmPassword"],
});

type ProfileFormData = z.infer<typeof profileSchema>;
type PasswordFormData = z.infer<typeof passwordSchema>;

interface UserStats {
  total_analyses: number;
  completed_analyses: number;
  average_score?: number;
  total_practice_time: number;
  current_streak: number;
  best_streak: number;
  improvement_rate?: number;
  join_date: string;
}

interface SiteAnalytics {
  site_id: string;
  title: string;
  views: number;
  rsvp_stats: Record<string, number>;
  guests: { name: string; response: string; created_at: string }[];
}

const Profile = () => {
  const navigate = useNavigate();
  const { user, isInitialized } = useAuth();
  
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [statsLoading, setStatsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [siteAnalytics, setSiteAnalytics] = useState<SiteAnalytics[]>([]);
  const [analyticsLoading, setAnalyticsLoading] = useState(false);

  // Формы
  const profileForm = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user?.name || '',
      bio: user?.bio || '',
    },
  });

  const passwordForm = useForm<PasswordFormData>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
  });

  // Перенаправление если не авторизован
  useEffect(() => {
    if (isInitialized && !user) {
      navigate('/login?from=profile');
    }
  }, [user, isInitialized, navigate]);

  // Загрузка статистики
  useEffect(() => {
    const loadStats = async () => {
      if (!user) return;
      
      setStatsLoading(true);
      try {
        const response = await userApi.getStats();
        if (response.data) {
          setUserStats(response.data);
        }
      } catch (error) {
        console.error('Failed to load user stats:', error);
      } finally {
        setStatsLoading(false);
      }
    };

    loadStats();
  }, [user]);

  // Обновление формы при изменении пользователя
  useEffect(() => {
    if (user) {
      profileForm.reset({
        name: user.name,
        bio: user.bio || '',
      });
    }
  }, [user, profileForm]);

  const handleProfileSubmit = async (data: ProfileFormData) => {
    setIsLoading(true);
    setMessage(null);
    
    try {
      const response = await userApi.updateProfile(data);
      
      if (response.data) {
        setMessage({ type: 'success', text: 'Профиль успешно обновлен' });
        setIsEditing(false);
        // Обновление локального состояния пользователя можно добавить позже
      } else if (response.error) {
        setMessage({ type: 'error', text: response.error.detail });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Произошла ошибка при обновлении профиля' });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordSubmit = async (data: PasswordFormData) => {
    setIsLoading(true);
    setMessage(null);
    
    try {
      const response = await userApi.changePassword(data.currentPassword, data.newPassword);
      
      if (response.data) {
        setMessage({ type: 'success', text: 'Пароль успешно изменен' });
        passwordForm.reset();
      } else if (response.error) {
        setMessage({ type: 'error', text: response.error.detail });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Произошла ошибка при изменении пароля' });
    } finally {
      setIsLoading(false);
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ru-RU', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (!isInitialized || !user) {
    return null;
  }

  return (
    <MainLayout>
      <div className="min-h-screen bg-gradient-to-b from-brand-50 to-white pt-24 pb-12">
        <div className="container mx-auto px-4 max-w-4xl">
          {/* Заголовок */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8"
          >
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Профиль</h1>
            <p className="text-xl text-gray-600">Управляйте своим аккаунтом и настройками</p>
          </motion.div>

          {/* Уведомления */}
          {message && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mb-6"
            >
              <Alert variant={message.type === 'error' ? 'destructive' : 'default'}>
                {message.type === 'success' ? (
                  <CheckCircle2 className="h-4 w-4" />
                ) : (
                  <AlertCircle className="h-4 w-4" />
                )}
                <AlertDescription>{message.text}</AlertDescription>
              </Alert>
            </motion.div>
          )}

          <Tabs defaultValue="profile" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="profile">Профиль</TabsTrigger>
              <TabsTrigger value="stats">Статистика</TabsTrigger>
              <TabsTrigger value="analytics">Аналитика</TabsTrigger>
              <TabsTrigger value="security">Безопасность</TabsTrigger>
            </TabsList>

            {/* Вкладка профиля */}
            <TabsContent value="profile">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center gap-2">
                        <User className="w-5 h-5" />
                        Основная информация
                      </CardTitle>
                      <Button
                        variant={isEditing ? "ghost" : "outline"}
                        size="sm"
                        onClick={() => {
                          if (isEditing) {
                            profileForm.reset();
                            setMessage(null);
                          }
                          setIsEditing(!isEditing);
                        }}
                      >
                        {isEditing ? (
                          <>
                            <X className="w-4 h-4 mr-2" />
                            Отмена
                          </>
                        ) : (
                          <>
                            <Edit3 className="w-4 h-4 mr-2" />
                            Редактировать
                          </>
                        )}
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Аватар */}
                    <div className="flex items-center space-x-6">
                      <div className="relative">
                        <Avatar className="w-24 h-24">
                          <AvatarImage src={user.avatar} />
                          <AvatarFallback className="text-xl font-semibold bg-brand-100 text-brand-700">
                            {getInitials(user.name)}
                          </AvatarFallback>
                        </Avatar>
                        {isEditing && (
                          <Button
                            size="sm"
                            variant="secondary"
                            className="absolute -bottom-2 -right-2 rounded-full w-8 h-8 p-0"
                          >
                            <Camera className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                      <div>
                        <h3 className="text-2xl font-semibold text-gray-900">{user.name}</h3>
                        <p className="text-gray-600 flex items-center gap-2">
                          <Mail className="w-4 h-4" />
                          {user.email}
                        </p>
                        <p className="text-gray-500 flex items-center gap-2 mt-1">
                          <Calendar className="w-4 h-4" />
                          Участник с {userStats ? formatDate(userStats.join_date) : '...'}
                        </p>
                      </div>
                    </div>

                    <Separator />

                    {/* Форма редактирования */}
                    {isEditing ? (
                      <Form {...profileForm}>
                        <form onSubmit={profileForm.handleSubmit(handleProfileSubmit)} className="space-y-6">
                          <FormField
                            control={profileForm.control}
                            name="name"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Имя</FormLabel>
                                <FormControl>
                                  <Input {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={profileForm.control}
                            name="bio"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>О себе</FormLabel>
                                <FormControl>
                                  <Textarea 
                                    {...field} 
                                    placeholder="Расскажите о себе..."
                                    rows={4}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <div className="flex gap-3">
                            <Button type="submit" disabled={isLoading}>
                              <Save className="w-4 h-4 mr-2" />
                              {isLoading ? 'Сохранение...' : 'Сохранить'}
                            </Button>
                            <Button 
                              type="button" 
                              variant="ghost" 
                              onClick={() => setIsEditing(false)}
                            >
                              Отмена
                            </Button>
                          </div>
                        </form>
                      </Form>
                    ) : (
                      <div className="space-y-4">
                        <div>
                          <label className="text-sm font-medium text-gray-700">О себе</label>
                          <p className="mt-1 text-gray-900">
                            {user.bio || 'Информация не указана'}
                          </p>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            </TabsContent>

            {/* Вкладка статистики */}
            <TabsContent value="stats">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="space-y-6"
              >
                {statsLoading ? (
                  <Card>
                    <CardContent className="p-6">
                      <div className="text-center">Загрузка статистики...</div>
                    </CardContent>
                  </Card>
                ) : userStats ? (
                  <>
                    {/* Основные метрики */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      <Card>
                        <CardContent className="p-4">
                          <div className="flex items-center space-x-3">
                            <div className="p-2 bg-blue-100 rounded-lg">
                              <Target className="w-5 h-5 text-blue-600" />
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-600">Всего анализов</p>
                              <p className="text-2xl font-bold text-gray-900">{userStats.total_analyses}</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardContent className="p-4">
                          <div className="flex items-center space-x-3">
                            <div className="p-2 bg-green-100 rounded-lg">
                              <Trophy className="w-5 h-5 text-green-600" />
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-600">Средний балл</p>
                              <p className="text-2xl font-bold text-gray-900">
                                {userStats.average_score ? `${userStats.average_score}%` : 'Н/Д'}
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardContent className="p-4">
                          <div className="flex items-center space-x-3">
                            <div className="p-2 bg-purple-100 rounded-lg">
                              <Clock className="w-5 h-5 text-purple-600" />
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-600">Время практики</p>
                              <p className="text-2xl font-bold text-gray-900">{userStats.total_practice_time}м</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardContent className="p-4">
                          <div className="flex items-center space-x-3">
                            <div className="p-2 bg-orange-100 rounded-lg">
                              <TrendingUp className="w-5 h-5 text-orange-600" />
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-600">Текущая серия</p>
                              <p className="text-2xl font-bold text-gray-900">{userStats.current_streak} дн.</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>

                    {/* Достижения */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Trophy className="w-5 h-5" />
                          Достижения
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="flex flex-wrap gap-2">
                          {userStats.completed_analyses >= 10 && (
                            <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                              🎯 10+ анализов
                            </Badge>
                          )}
                          {userStats.current_streak >= 7 && (
                            <Badge variant="secondary" className="bg-green-100 text-green-800">
                              🔥 Неделя подряд
                            </Badge>
                          )}
                          {userStats.average_score && userStats.average_score >= 80 && (
                            <Badge variant="secondary" className="bg-purple-100 text-purple-800">
                              ⭐ Высокие баллы
                            </Badge>
                          )}
                          {userStats.improvement_rate && userStats.improvement_rate >= 15 && (
                            <Badge variant="secondary" className="bg-orange-100 text-orange-800">
                              📈 Быстрый прогресс
                            </Badge>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </>
                ) : (
                  <Card>
                    <CardContent className="p-6">
                      <div className="text-center text-gray-500">
                        Не удалось загрузить статистику
                      </div>
                    </CardContent>
                  </Card>
                )}
              </motion.div>
            </TabsContent>

            {/* Вкладка аналитики */}
            <TabsContent value="analytics">
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                <Card>
                  <CardHeader>
                    <CardTitle>Аналитика приглашений</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {analyticsLoading ? (
                      <div className="text-center py-8 text-gray-500">Загрузка аналитики...</div>
                    ) : siteAnalytics.length === 0 ? (
                      <div className="text-center py-8 text-gray-500">Нет данных по приглашениям</div>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="min-w-full text-sm border">
                          <thead>
                            <tr className="bg-gray-100">
                              <th className="px-3 py-2 border">Событие</th>
                              <th className="px-3 py-2 border">Просмотры</th>
                              <th className="px-3 py-2 border">Гости</th>
                            </tr>
                          </thead>
                          <tbody>
                            {siteAnalytics.map(site => (
                              <tr key={site.site_id} className="border-b">
                                <td className="px-3 py-2 border font-semibold">{site.title}</td>
                                <td className="px-3 py-2 border text-center">{site.views}</td>
                                <td className="px-3 py-2 border">
                                  <div>Гости:</div>
                                  <ul className="pl-4">
                                    {siteAnalytics && siteAnalytics.guests && siteAnalytics.guests.length > 0 ? siteAnalytics.guests.map((g: any, i: number) => (
                                      <li key={i}>{g.guest_name || 'Гость'} <span className="text-xs text-gray-500">({g.response})</span></li>
                                    )) : <li className="text-gray-400">—</li>}
                                    </ul>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            </TabsContent>

            {/* Вкладка безопасности */}
            <TabsContent value="security">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <Card>
                  <CardHeader>
                    <CardTitle>Изменить пароль</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Form {...passwordForm}>
                      <form onSubmit={passwordForm.handleSubmit(handlePasswordSubmit)} className="space-y-4">
                        <FormField
                          control={passwordForm.control}
                          name="currentPassword"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Текущий пароль</FormLabel>
                              <FormControl>
                                <Input type="password" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={passwordForm.control}
                          name="newPassword"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Новый пароль</FormLabel>
                              <FormControl>
                                <Input type="password" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={passwordForm.control}
                          name="confirmPassword"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Подтвердите новый пароль</FormLabel>
                              <FormControl>
                                <Input type="password" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <Button type="submit" disabled={isLoading}>
                          {isLoading ? 'Изменение...' : 'Изменить пароль'}
                        </Button>
                      </form>
                    </Form>
                  </CardContent>
                </Card>
              </motion.div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </MainLayout>
  );
};

export default Profile; 