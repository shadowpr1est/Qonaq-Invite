import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { format, formatDistanceToNow } from 'date-fns';
import { ru } from 'date-fns/locale';
import { useTranslation } from 'react-i18next';
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
  Home,
  MoreVertical,
  Search,
  Filter,
  SortAsc,
  Activity
} from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';

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

const Dashboard = () => {
  const navigate = useNavigate();
  const { user, isInitialized } = useAuth();
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  
  const [selectedSite, setSelectedSite] = useState<string | null>(null);
  const [statsSite, setStatsSite] = useState<SitePreview | null>(null);
  const [siteStats, setSiteStats] = useState<any>(null);
  const [statsLoading, setStatsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'published' | 'draft'>('all');
  const [sortBy, setSortBy] = useState<'created_at' | 'views' | 'title'>('created_at');

  // Получение списка сайтов пользователя
  const { 
    data: sitesData, 
    isLoading, 
    error
  } = useQuery<UserSitesResponse>({
    queryKey: ['user-sites'],
    queryFn: () => apiClient.getUserSites(),
    enabled: !!user,
    refetchOnWindowFocus: false,
  });

  // Перенаправление если не авторизован
  useEffect(() => {
    if (isInitialized && !user) {
      navigate('/login?from=dashboard');
    }
  }, [user, isInitialized, navigate]);

  const handleDeleteSite = async (siteId: string, siteName: string) => {
    if (!confirm(t('dashboard.delete_confirm', { name: siteName }))) {
      return;
    }
    try {
      await apiClient.deleteSite(siteId);
      toast.success(t('dashboard.delete_success'));
      queryClient.invalidateQueries({ queryKey: ['user-sites'] });
    } catch (error) {
      console.error('Delete site error:', error);
      toast.error(t('dashboard.delete_error'));
    }
  };

  const handlePublishToggle = async (site: SitePreview) => {
    try {
      if (site.is_published) {
        await apiClient.unpublishSite(site.id);
        toast.success(t('dashboard.unpublish_success'));
      } else {
        await apiClient.publishSite(site.id);
        toast.success(t('dashboard.publish_success'));
      }
      queryClient.invalidateQueries({ queryKey: ['user-sites'] });
    } catch (error) {
      console.error('Publish toggle error:', error);
      toast.error(t('dashboard.publish_error'));
    }
  };

  const copyShareLink = (slug: string) => {
    const shareUrl = `${window.location.origin}/site/${slug}`;
    navigator.clipboard.writeText(shareUrl).then(() => {
      toast.success(t('dashboard.copy_success'));
    }).catch(() => {
      toast.error(t('dashboard.copy_error'));
    });
  };

  const handleShowStats = async (site: SitePreview) => {
    setStatsSite(site);
    setStatsLoading(true);
    
    try {
      const stats = await apiClient.getSiteStats(site.id);
      setSiteStats(stats.data);
    } catch (error) {
      console.error('Get stats error:', error);
      toast.error('Failed to load statistics');
    } finally {
      setStatsLoading(false);
    }
  };

  const handleCloseStats = () => {
    setStatsSite(null);
    setSiteStats(null);
  };

  const formatEventType = (eventType: string) => {
    return t(`dashboard.event_types.${eventType}`) || eventType;
  };

  // Фильтрация и сортировка сайтов
  const filteredAndSortedSites = React.useMemo(() => {
    if (!sitesData?.sites) return [];
    
    let filtered = sitesData.sites.filter(site => {
      const matchesSearch = site.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (site.meta_description?.toLowerCase() || '').includes(searchQuery.toLowerCase());
      const matchesFilter = filterStatus === 'all' || 
                          (filterStatus === 'published' && site.is_published) ||
                          (filterStatus === 'draft' && !site.is_published);
      return matchesSearch && matchesFilter;
    });

    return filtered.sort((a, b) => {
      switch (sortBy) {
        case 'title':
          return a.title.localeCompare(b.title);
        case 'views':
          return b.view_count - a.view_count;
        case 'created_at':
        default:
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      }
    });
  }, [sitesData?.sites, searchQuery, filterStatus, sortBy]);

  if (!isInitialized) {
    return (
      <MainLayout>
        <div className="min-h-screen flex items-center justify-center">
          <LoadingSpinner size="lg" text={t('common.loading')} />
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
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50 pt-20 pb-12">
          <div className="container mx-auto px-4 max-w-7xl">
            <div className="flex items-center justify-center py-20">
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl mx-auto mb-4 flex items-center justify-center animate-pulse">
                  <Globe className="w-8 h-8 text-white" />
                </div>
                <LoadingSpinner size="lg" text={t('dashboard.loading_sites')} />
              </div>
            </div>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (error) {
    return (
      <MainLayout>
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50 pt-20 pb-12">
          <div className="container mx-auto px-4 max-w-7xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-md mx-auto mt-20"
            >
              <Card className="border-red-200 bg-red-50/50 backdrop-blur-sm">
                <CardContent className="p-8 text-center">
                  <div className="w-16 h-16 bg-red-100 rounded-2xl mx-auto mb-4 flex items-center justify-center">
                    <Activity className="w-8 h-8 text-red-600" />
                  </div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-2">
                    {t('dashboard.load_error_title')}
                  </h2>
                  <p className="text-gray-600 mb-6">
                    {t('dashboard.load_error_description')}
                  </p>
                  <Button onClick={() => queryClient.invalidateQueries({ queryKey: ['user-sites'] })} className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                    {t('dashboard.try_again')}
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50 pt-20 pb-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
          
          {/* Заголовок с приветствием */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div>
                                    <h1 className="text-2xl md:text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                  {t('dashboard.welcome_message', { name: user.name })}
                </h1>
                <p className="text-base md:text-lg text-gray-600 mt-1">
                  {t('dashboard.manage_sites')}
                </p>
                  </div>
                </div>
              </div>
            
            </div>
          </motion.div>

          {/* Быстрая статистика */}
          {sitesData && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
            >
              <Card className="border-0 shadow-md hover:shadow-lg transition-shadow duration-300 bg-white/70 backdrop-blur-sm">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-gray-600">{t('dashboard.total_sites')}</p>
                      <p className="text-3xl font-bold text-gray-900">{sitesData.total_count}</p>
                    </div>
                    <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center">
                      <Globe className="w-6 h-6 text-white" />
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="border-0 shadow-md hover:shadow-lg transition-shadow duration-300 bg-white/70 backdrop-blur-sm">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-gray-600">{t('dashboard.published_count')}</p>
                      <p className="text-3xl font-bold text-gray-900">{sitesData.published_count}</p>
                    </div>
                    <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-green-600 rounded-2xl flex items-center justify-center">
                      <TrendingUp className="w-6 h-6 text-white" />
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="border-0 shadow-md hover:shadow-lg transition-shadow duration-300 bg-white/70 backdrop-blur-sm">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-gray-600">{t('dashboard.draft_count')}</p>
                      <p className="text-3xl font-bold text-gray-900">{sitesData.draft_count}</p>
                    </div>
                    <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-orange-600 rounded-2xl flex items-center justify-center">
                      <Edit className="w-6 h-6 text-white" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Фильтры и поиск */}
          {sitesData && sitesData.sites.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="mb-6"
            >
              <Card className="border-0 shadow-md bg-white/70 backdrop-blur-sm">
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
                    <div className="flex-1 max-w-md">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <Input
                          placeholder={t('dashboard.search_placeholder')}
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="pl-10 border-gray-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                        />
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="outline" size="sm" className="gap-2">
                            <Filter className="w-4 h-4" />
                            {t('dashboard.filter_status')}
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                          <DropdownMenuItem onClick={() => setFilterStatus('all')}>
                            {t('dashboard.filter_all')}
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => setFilterStatus('published')}>
                            {t('dashboard.filter_published')}
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => setFilterStatus('draft')}>
                            {t('dashboard.filter_draft')}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>

                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="outline" size="sm" className="gap-2">
                            <SortAsc className="w-4 h-4" />
                            {t('dashboard.sort_by')}
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                          <DropdownMenuItem onClick={() => setSortBy('created_at')}>
                            {t('dashboard.sort_created')}
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => setSortBy('title')}>
                            {t('dashboard.sort_title')}
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => setSortBy('views')}>
                            {t('dashboard.sort_views')}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Список сайтов */}
          <AnimatePresence>
            {filteredAndSortedSites.length > 0 ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6"
              >
                {filteredAndSortedSites.map((site, index) => (
                  <motion.div
                    key={site.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ delay: index * 0.05 }}
                    whileHover={{ y: -8 }}
                    className="group"
                  >
                    <Card className="h-full border-0 shadow-md hover:shadow-xl transition-all duration-300 bg-white/70 backdrop-blur-sm overflow-hidden">
                      <CardHeader className="pb-4 relative">
                        <div className="absolute top-4 right-4">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity">
                                <MoreVertical className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => navigate(`/sites/${site.id}`)}>
                                <Edit className="w-4 h-4 mr-2" />
                                {t('dashboard.edit')}
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleShowStats(site)}>
                                <BarChart3 className="w-4 h-4 mr-2" />
                                {t('dashboard.statistics')}
                              </DropdownMenuItem>
                              {site.is_published && (
                                <DropdownMenuItem onClick={() => copyShareLink(site.slug)}>
                                  <Share2 className="w-4 h-4 mr-2" />
                                  {t('dashboard.copy_link')}
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuSeparator />
                              <DropdownMenuItem 
                                onClick={() => handleDeleteSite(site.id, site.title)}
                                className="text-red-600 focus:text-red-600"
                              >
                                <Trash2 className="w-4 h-4 mr-2" />
                                {t('dashboard.delete')}
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>

                        <div className="space-y-3">
                          <div className="flex items-start gap-3">
                            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center flex-shrink-0">
                              {getEventIcon(site.event_type)}
                            </div>
                            <div className="flex-1 min-w-0">
                              <Badge 
                                variant="secondary" 
                                className="text-xs mb-2 bg-gray-100/80 text-gray-700"
                              >
                                {formatEventType(site.event_type)}
                              </Badge>
                              <CardTitle className="text-lg line-clamp-2 group-hover:text-blue-600 transition-colors">
                                {site.title}
                              </CardTitle>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <Badge 
                              variant={site.is_published ? "default" : "outline"}
                              className={site.is_published ? 
                                "bg-green-100 text-green-800 border-green-200" : 
                                "bg-orange-100 text-orange-800 border-orange-200"
                              }
                            >
                              {site.is_published ? t('dashboard.published_badge') : t('dashboard.draft_badge')}
                            </Badge>
                          </div>
                          
                          {site.meta_description && (
                            <p className="text-sm text-gray-600 line-clamp-2">
                              {site.meta_description}
                            </p>
                          )}
                        </div>
                      </CardHeader>
                      
                      <CardContent className="pt-0">
                        <div className="space-y-4">
                          {/* Метрики */}
                          <div className="flex items-center justify-between text-sm">
                            <div className="flex items-center gap-4 text-gray-600">
                              <div className="flex items-center gap-1">
                                <Eye className="w-4 h-4" />
                                <span className="font-medium">{site.view_count} {t('dashboard.views')}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Share2 className="w-4 h-4" />
                                <span className="font-medium">{site.share_count} {t('dashboard.shares')}</span>
                              </div>
                            </div>
                            <div className="flex items-center gap-1 text-xs text-gray-500">
                              <Clock className="w-3 h-3" />
                              <span>
                                {formatDistanceToNow(new Date(site.created_at), { 
                                  addSuffix: true, 
                                  locale: ru 
                                })} {t('dashboard.created_ago')}
                              </span>
                            </div>
                          </div>

                          {/* Основные действия */}
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
                              onClick={() => navigate(`/sites/${site.id}`)}
                            >
                              <Edit className="w-4 h-4 mr-2" />
                              {t('dashboard.edit')}
                            </Button>
                            
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handlePublishToggle(site)}
                              className="border-gray-200 hover:bg-gray-50"
                            >
                              {site.is_published ? (
                                <Eye className="w-4 h-4" />
                              ) : (
                                <Globe className="w-4 h-4" />
                              )}
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </motion.div>
            ) : sitesData && sitesData.sites.length > 0 ? (
              // Нет результатов поиска
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center py-16"
              >
                <div className="w-16 h-16 bg-gray-100 rounded-2xl mx-auto mb-4 flex items-center justify-center">
                  <Search className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {t('dashboard.no_results_title')}
                </h3>
                <p className="text-gray-600 mb-4">
                  {t('dashboard.no_results_description')}
                </p>
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setSearchQuery('');
                    setFilterStatus('all');
                  }}
                >
                  {t('dashboard.reset_filters')}
                </Button>
              </motion.div>
            ) : (
              /* Пустое состояние - нет сайтов */
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-center py-20"
              >
                <Card className="max-w-lg mx-auto border-0 shadow-lg bg-white/80 backdrop-blur-sm">
                  <CardContent className="p-12">
                    <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-3xl flex items-center justify-center mx-auto mb-6">
                      <Plus className="w-10 h-10 text-white" />
                    </div>
                    
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">
                      {t('dashboard.create_first_site_title')}
                    </h2>
                    <p className="text-gray-600 mb-8 leading-relaxed">
                      {t('dashboard.create_first_site_description')}
                    </p>
                    
                    <Button 
                      size="lg"
                      className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-200 px-8"
                      onClick={() => navigate('/builder')}
                    >
                      <Plus className="w-5 h-5 mr-2" />
                      {t('dashboard.start_creating')}
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Диалог статистики */}
      <Dialog open={!!statsSite} onOpenChange={handleCloseStats}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              {t('dashboard.stats_dialog_title', { title: statsSite?.title })}
            </DialogTitle>
          </DialogHeader>
          
          {statsLoading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg animate-pulse mb-4"></div>
              <p className="text-sm text-gray-500">{t('dashboard.loading_stats')}</p>
            </div>
          ) : siteStats ? (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <Card className="p-4 border-0 bg-blue-50">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600 mb-1">
                      {siteStats.total_views ?? 0}
                    </div>
                    <div className="text-sm text-gray-600">{t('dashboard.stats.views')}</div>
                  </div>
                </Card>
                <Card className="p-4 border-0 bg-green-50">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600 mb-1">
                      {siteStats.guests?.length ?? 0}
                    </div>
                    <div className="text-sm text-gray-600">{t('dashboard.stats.guests')}</div>
                  </div>
                </Card>
              </div>
              
              {siteStats.guests && siteStats.guests.length > 0 && (
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">{t('dashboard.guests_list_title')}</h4>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {siteStats.guests.map((guest: any, index: number) => (
                      <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                            <span className="text-xs font-semibold text-white">
                              {guest.guest_name?.charAt(0)?.toUpperCase() || 'Г'}
                            </span>
                          </div>
                                                      <span className="text-sm font-medium">
                              {guest.guest_name || t('dashboard.guest_default_name')}
                            </span>
                        </div>
                        <Badge 
                          variant="outline" 
                          className={guest.response === 'accepted' ? 'border-green-500 text-green-700' : 'border-gray-400 text-gray-600'}
                        >
                          {guest.response}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-2xl mx-auto mb-4 flex items-center justify-center">
                <BarChart3 className="w-8 h-8 text-gray-400" />
              </div>
              <p className="text-gray-500">{t('dashboard.stats_unavailable')}</p>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </MainLayout>
  );
};

export default Dashboard;