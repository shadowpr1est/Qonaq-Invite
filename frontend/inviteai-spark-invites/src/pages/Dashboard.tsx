import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import { format, formatDistanceToNow } from 'date-fns';
import { ru } from 'date-fns/locale';

import { useAuth } from '@/hooks/use-auth';
import { apiClient } from '@/lib/api';
import type { UserSitesResponse, SitePreview } from '@/lib/types';

import MainLayout from '@/components/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { 
  Plus,
  Eye,
  Edit,
  Share2,
  BarChart3,
  Trash2,
  ExternalLink,
  Calendar,
  Clock,
  Globe,
  Users,
  TrendingUp,
  Heart,
  Gift,
  Star,
  Briefcase,
  GraduationCap,
  Home
} from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

const eventIcons = {
  wedding: Heart,
  birthday: Gift,
  anniversary: Star,
  corporate: Briefcase,
  graduation: GraduationCap,
  housewarming: Home,
};

const getEventIcon = (eventType: string) => {
  const IconComponent = eventIcons[eventType as keyof typeof eventIcons] || Calendar;
  return <IconComponent className="w-4 h-4" />;
};

const formatEventType = (eventType: string) => {
  const types: Record<string, string> = {
    wedding: 'Свадьба',
    birthday: 'День рождения',
    anniversary: 'Юбилей',
    corporate: 'Корпоратив',
    graduation: 'Выпускной',
    housewarming: 'Новоселье',
  };
  return types[eventType] || eventType;
};

const Dashboard = () => {
  const navigate = useNavigate();
  const { user, isInitialized } = useAuth();
  
  const [selectedSite, setSelectedSite] = useState<string | null>(null);
  const [statsSite, setStatsSite] = useState<SitePreview | null>(null);
  const [siteStats, setSiteStats] = useState<any>(null);
  const [statsLoading, setStatsLoading] = useState(false);

  // Получение списка сайтов пользователя
  const { 
    data: sitesData, 
    isLoading, 
    error,
    refetch 
  } = useQuery<UserSitesResponse>({
    queryKey: ['user-sites'],
    queryFn: () => apiClient.getUserSites(),
    enabled: !!user,
    refetchOnWindowFocus: false,
  });

  // Перенаправление если не авторизован
  useEffect(() => {
    if (isInitialized && !user) {
      navigate('/login');
    }
  }, [user, isInitialized, navigate]);

  const handleDeleteSite = async (siteId: string, siteName: string) => {
    if (!confirm(`Вы уверены, что хотите удалить сайт "${siteName}"? Это действие нельзя отменить.`)) {
      return;
    }

    try {
      await apiClient.deleteSite(siteId);
      toast.success('Сайт успешно удален');
      refetch();
    } catch (error) {
      console.error('Ошибка удаления сайта:', error);
      toast.error('Ошибка при удалении сайта');
    }
  };

  const handlePublishToggle = async (site: SitePreview) => {
    try {
      await apiClient.updateSite(site.id, {
        is_published: !site.is_published
      });
      toast.success(site.is_published ? 'Сайт снят с публикации' : 'Сайт опубликован');
      refetch();
    } catch (error) {
      console.error('Ошибка публикации:', error);
      toast.error('Ошибка при изменении статуса публикации');
    }
  };

  const copyShareLink = (slug: string) => {
    const shareUrl = `${window.location.origin}/sites/public/${slug}`;
    navigator.clipboard.writeText(shareUrl);
    toast.success('Ссылка скопирована в буфер обмена');
  };

  const handleShowStats = async (site: SitePreview) => {
    setStatsSite(site);
    setStatsLoading(true);
    try {
      // Получаем только список гостей (RSVP)
      const guests = await apiClient.request(`/sites/${site.id}/rsvp`);
      setSiteStats({ guests });
    } catch {
      setSiteStats(null);
    } finally {
      setStatsLoading(false);
    }
  };
  const handleCloseStats = () => {
    setStatsSite(null);
    setSiteStats(null);
  };

  if (!isInitialized) {
    return (
      <MainLayout>
        <div className="min-h-screen flex items-center justify-center">
          <LoadingSpinner size="lg" text="Загрузка..." />
        </div>
      </MainLayout>
    );
  }

  if (!user) {
    return null;
  }

  if (isLoading) {
    return (
      <MainLayout>
        <div className="min-h-screen bg-gradient-to-b from-brand-50 to-white pt-24 pb-12">
          <div className="container mx-auto px-4 max-w-7xl">
            <div className="flex items-center justify-center py-20">
              <LoadingSpinner size="lg" text="Загружаем ваши сайты..." />
            </div>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (error) {
    return (
      <MainLayout>
        <div className="min-h-screen bg-gradient-to-b from-brand-50 to-white pt-24 pb-12">
          <div className="container mx-auto px-4 max-w-7xl">
            <Card className="max-w-md mx-auto">
              <CardContent className="p-8 text-center">
                <h2 className="text-xl font-semibold text-gray-900 mb-2">
                  Ошибка загрузки
                </h2>
                <p className="text-gray-600 mb-4">
                  Не удалось загрузить список сайтов
                </p>
                <Button onClick={() => refetch()}>
                  Попробовать снова
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="min-h-screen bg-gradient-to-b from-brand-50 to-white pt-24 pb-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
          
          {/* Заголовок и статистика */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 md:gap-6">
              <div>
                <h1 className="text-2xl md:text-4xl font-bold text-gray-900 mb-2 md:mb-4">
                  Добро пожаловать, {user.name}!
                </h1>
                <p className="text-base md:text-xl text-gray-600">
                  Управляйте своими событиями и отслеживайте отклики
                </p>
              </div>
            </div>

            {/* Быстрая статистика */}
            {sitesData && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <Globe className="w-6 h-6 text-blue-600" />
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-600">Всего сайтов</p>
                        <p className="text-2xl font-bold text-gray-900">{sitesData.total_count}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center">
                      <div className="p-2 bg-green-100 rounded-lg">
                        <TrendingUp className="w-6 h-6 text-green-600" />
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-600">Опубликовано</p>
                        <p className="text-2xl font-bold text-gray-900">{sitesData.published_count}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center">
                      <div className="p-2 bg-orange-100 rounded-lg">
                        <Edit className="w-6 h-6 text-orange-600" />
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-600">Черновики</p>
                        <p className="text-2xl font-bold text-gray-900">{sitesData.draft_count}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </motion.div>

          {/* Список сайтов */}
          {sitesData && sitesData.sites.length > 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Ваши сайты</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {sitesData.sites.map((site) => (
                  <motion.div
                    key={site.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    whileHover={{ y: -5 }}
                    className="group"
                  >
                    <Card className="h-full hover:shadow-lg transition-all duration-300">
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-2">
                            {getEventIcon(site.event_type)}
                            <Badge variant="secondary" className="text-xs">
                              {formatEventType(site.event_type)}
                            </Badge>
                          </div>
                          <Badge variant={site.is_published ? "default" : "outline"}>
                            {site.is_published ? 'Опубликован' : 'Черновик'}
                          </Badge>
                        </div>
                        
                        <CardTitle className="text-lg line-clamp-2">
                          {site.title}
                        </CardTitle>
                        
                        {site.meta_description && (
                          <p className="text-sm text-gray-600 line-clamp-2">
                            {site.meta_description}
                          </p>
                        )}
                      </CardHeader>

                      <CardContent className="pt-0">
                        <div className="space-y-3">
                          {/* Статистика */}
                          <div className="flex items-center gap-4 text-sm text-gray-600">
                            <div className="flex items-center gap-1">
                              <Eye className="w-4 h-4" />
                              <span>{site.view_count}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Share2 className="w-4 h-4" />
                              <span>{site.share_count}</span>
                            </div>
                          </div>

                          {/* Даты */}
                          <div className="text-xs text-gray-500">
                            <div className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              <span>
                                Создан {formatDistanceToNow(new Date(site.created_at), { 
                                  addSuffix: true, 
                                  locale: ru 
                                })}
                              </span>
                            </div>
                          </div>

                          {/* Действия */}
                          <div className="flex gap-2 pt-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => navigate(`/sites/${site.id}`)}
                              className="flex-1"
                            >
                              <Edit className="w-4 h-4 mr-1" />
                              Редактировать
                            </Button>
                            
                            {site.is_published && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => copyShareLink(site.slug)}
                              >
                                <Share2 className="w-4 h-4" />
                              </Button>
                            )}
                          </div>

                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant={site.is_published ? "outline" : "default"}
                              onClick={() => handlePublishToggle(site)}
                              className="flex-1"
                            >
                              {site.is_published ? (
                                <>
                                  <Eye className="w-4 h-4 mr-1" />
                                  Снять с публикации
                                </>
                              ) : (
                                <>
                                  <Globe className="w-4 h-4 mr-1" />
                                  Опубликовать
                                </>
                              )}
                            </Button>

                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleShowStats(site)}
                              className="flex items-center gap-2"
                            >
                              <BarChart3 className="w-4 h-4" />
                              Статистика
                            </Button>

                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleDeleteSite(site.id, site.title)}
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          ) : (
            /* Пустое состояние */
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-center py-20"
            >
              <Card className="max-w-md mx-auto">
                <CardContent className="p-8">
                  <div className="w-16 h-16 bg-brand-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Plus className="w-8 h-8 text-brand-600" />
                  </div>
                  
                  <h2 className="text-xl font-semibold text-gray-900 mb-2">
                    Создайте свой первый сайт
                  </h2>
                  <p className="text-gray-600 mb-6">
                    С помощью ИИ вы можете создать красивый сайт для любого события всего за несколько минут
                  </p>
                  
                  <Button 
                    size="lg"
                    className="bg-gradient-brand text-white hover:opacity-90 font-semibold"
                    onClick={() => navigate('/builder')}
                  >
                    <Plus className="w-5 h-5 mr-2" />
                    Создать сайт
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </div>
      </div>

      <Dialog open={!!statsSite} onOpenChange={handleCloseStats}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Статистика: {statsSite?.title}</DialogTitle>
          </DialogHeader>
          {statsLoading ? (
            <div className="text-center py-8 text-gray-500">Загрузка...</div>
          ) : siteStats ? (
            <div className="space-y-2">
              <div>Просмотры: <b>{siteStats.total_views ?? 0}</b></div>
              <div>Гости:</div>
              <ul className="pl-4">
                {siteStats && siteStats.guests && siteStats.guests.length > 0 ? siteStats.guests.map((g: any, i: number) => (
                  <li key={i}>{g.guest_name || 'Гость'} <span className="text-xs text-gray-500">({g.response})</span></li>
                )) : <li className="text-gray-400">—</li>}
              </ul>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">Нет данных</div>
          )}
        </DialogContent>
      </Dialog>
    </MainLayout>
  );
};

export default Dashboard; 