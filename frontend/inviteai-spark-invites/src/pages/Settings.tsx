import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Bell, 
  Shield, 
  Palette, 
  Globe, 
  Trash2, 
  Eye, 
  EyeOff, 
  Save,
  Moon,
  Sun,
  Monitor
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/use-auth';
import { useNavigate } from 'react-router-dom';
import MainLayout from '@/components/MainLayout';

interface SettingsData {
  notifications: {
    email: boolean;
    push: boolean;
    marketing: boolean;
    inviteUpdates: boolean;
  };
  privacy: {
    profileVisibility: 'public' | 'private';
    showEmail: boolean;
    showPhone: boolean;
  };
  appearance: {
    theme: 'light' | 'dark' | 'system';
    language: 'ru' | 'kk' | 'en';
  };
  security: {
    twoFactorEnabled: boolean;
    sessionTimeout: '30' | '60' | '120' | 'never';
  };
}

const Settings = () => {
  const { user, isInitialized } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [settings, setSettings] = useState<SettingsData>({
    notifications: {
      email: true,
      push: true,
      marketing: false,
      inviteUpdates: true,
    },
    privacy: {
      profileVisibility: 'public',
      showEmail: false,
      showPhone: false,
    },
    appearance: {
      theme: 'light',
      language: 'ru',
    },
    security: {
      twoFactorEnabled: false,
      sessionTimeout: '60',
    },
  });

  // Redirect if not authenticated
  useEffect(() => {
    if (isInitialized && !user) {
      navigate('/login?from=settings');
    }
  }, [user, isInitialized, navigate]);

  const handleSave = async () => {
    setIsLoading(true);
    try {
      // TODO: Implement API call to save settings
      await new Promise(resolve => setTimeout(resolve, 1000));
      console.log('Settings saved:', settings);
    } catch (error) {
      console.error('Failed to save settings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteAccount = () => {
    if (window.confirm('Вы уверены, что хотите удалить аккаунт? Это действие нельзя отменить.')) {
      console.log('Account deletion requested');
      // TODO: Implement account deletion
    }
  };

  const updateNotificationSetting = (key: keyof SettingsData['notifications'], value: boolean) => {
    setSettings(prev => ({
      ...prev,
      notifications: {
        ...prev.notifications,
        [key]: value,
      },
    }));
  };

  const updatePrivacySetting = (key: keyof SettingsData['privacy'], value: any) => {
    setSettings(prev => ({
      ...prev,
      privacy: {
        ...prev.privacy,
        [key]: value,
      },
    }));
  };

  const updateAppearanceSetting = (key: keyof SettingsData['appearance'], value: any) => {
    setSettings(prev => ({
      ...prev,
      appearance: {
        ...prev.appearance,
        [key]: value,
      },
    }));
  };

  const updateSecuritySetting = (key: keyof SettingsData['security'], value: any) => {
    setSettings(prev => ({
      ...prev,
      security: {
        ...prev.security,
        [key]: value,
      },
    }));
  };

  if (!isInitialized) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-500"></div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="min-h-screen bg-gradient-to-br from-brand-50 via-white to-blue-50 pt-24 pb-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-4 md:mb-8"
          >
            <h1 className="text-2xl md:text-4xl font-bold font-display mb-2 md:mb-4">
              <span className="text-gradient">Настройки</span>
            </h1>
            <p className="text-base md:text-lg text-muted-foreground">Управляйте вашими предпочтениями и безопасностью</p>
          </motion.div>

          <div className="space-y-8">
            {/* Notifications Settings */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Card className="border-2 border-brand-100 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Bell className="w-5 h-5 mr-2" />
                    Уведомления
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Email уведомления</h4>
                      <p className="text-sm text-muted-foreground">Получать уведомления на email</p>
                    </div>
                    <Switch
                      checked={settings.notifications.email}
                      onCheckedChange={(checked) => updateNotificationSetting('email', checked)}
                    />
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Push уведомления</h4>
                      <p className="text-sm text-muted-foreground">Получать уведомления в браузере</p>
                    </div>
                    <Switch
                      checked={settings.notifications.push}
                      onCheckedChange={(checked) => updateNotificationSetting('push', checked)}
                    />
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Маркетинговые уведомления</h4>
                      <p className="text-sm text-muted-foreground">Новости и специальные предложения</p>
                    </div>
                    <Switch
                      checked={settings.notifications.marketing}
                      onCheckedChange={(checked) => updateNotificationSetting('marketing', checked)}
                    />
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Обновления приглашений</h4>
                      <p className="text-sm text-muted-foreground">Уведомления об откликах на приглашения</p>
                    </div>
                    <Switch
                      checked={settings.notifications.inviteUpdates}
                      onCheckedChange={(checked) => updateNotificationSetting('inviteUpdates', checked)}
                    />
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Privacy Settings */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card className="border-2 border-brand-100 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Shield className="w-5 h-5 mr-2" />
                    Приватность
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Видимость профиля</h4>
                      <p className="text-sm text-muted-foreground">Кто может видеть ваш профиль</p>
                    </div>
                    <Select
                      value={settings.privacy.profileVisibility}
                      onValueChange={(value: 'public' | 'private') => 
                        updatePrivacySetting('profileVisibility', value)
                      }
                    >
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="public">Публичный</SelectItem>
                        <SelectItem value="private">Приватный</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Показывать email</h4>
                      <p className="text-sm text-muted-foreground">Отображать email в профиле</p>
                    </div>
                    <Switch
                      checked={settings.privacy.showEmail}
                      onCheckedChange={(checked) => updatePrivacySetting('showEmail', checked)}
                    />
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Показывать телефон</h4>
                      <p className="text-sm text-muted-foreground">Отображать телефон в профиле</p>
                    </div>
                    <Switch
                      checked={settings.privacy.showPhone}
                      onCheckedChange={(checked) => updatePrivacySetting('showPhone', checked)}
                    />
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Appearance Settings */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Card className="border-2 border-brand-100 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Palette className="w-5 h-5 mr-2" />
                    Внешний вид
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Тема</h4>
                      <p className="text-sm text-muted-foreground">Выберите тему оформления</p>
                    </div>
                    <Select
                      value={settings.appearance.theme}
                      onValueChange={(value: 'light' | 'dark' | 'system') => 
                        updateAppearanceSetting('theme', value)
                      }
                    >
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="light">
                          <div className="flex items-center">
                            <Sun className="w-4 h-4 mr-2" />
                            Светлая
                          </div>
                        </SelectItem>
                        <SelectItem value="dark">
                          <div className="flex items-center">
                            <Moon className="w-4 h-4 mr-2" />
                            Тёмная
                          </div>
                        </SelectItem>
                        <SelectItem value="system">
                          <div className="flex items-center">
                            <Monitor className="w-4 h-4 mr-2" />
                            Системная
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Язык</h4>
                      <p className="text-sm text-muted-foreground">Язык интерфейса</p>
                    </div>
                    <Select
                      value={settings.appearance.language}
                      onValueChange={(value: 'ru' | 'kk' | 'en') => 
                        updateAppearanceSetting('language', value)
                      }
                    >
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ru">🇷🇺 Русский</SelectItem>
                        <SelectItem value="kk">🇰🇿 Қазақ</SelectItem>
                        <SelectItem value="en">🇺🇸 English</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Security Settings */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <Card className="border-2 border-brand-100 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Shield className="w-5 h-5 mr-2" />
                    Безопасность
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Двухфакторная аутентификация</h4>
                      <p className="text-sm text-muted-foreground">Дополнительная защита аккаунта</p>
                    </div>
                    <div className="flex items-center gap-2">
                      {settings.security.twoFactorEnabled && (
                        <Badge variant="secondary">Включено</Badge>
                      )}
                      <Switch
                        checked={settings.security.twoFactorEnabled}
                        onCheckedChange={(checked) => updateSecuritySetting('twoFactorEnabled', checked)}
                      />
                    </div>
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Автовыход из сессии</h4>
                      <p className="text-sm text-muted-foreground">Время неактивности до автовыхода</p>
                    </div>
                    <Select
                      value={settings.security.sessionTimeout}
                      onValueChange={(value: '30' | '60' | '120' | 'never') => 
                        updateSecuritySetting('sessionTimeout', value)
                      }
                    >
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="30">30 минут</SelectItem>
                        <SelectItem value="60">1 час</SelectItem>
                        <SelectItem value="120">2 часа</SelectItem>
                        <SelectItem value="never">Никогда</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Danger Zone */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <Card className="border-2 border-red-200 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center text-red-600">
                    <Trash2 className="w-5 h-5 mr-2" />
                    Опасная зона
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between p-4 bg-red-50 rounded-lg">
                    <div>
                      <h4 className="font-medium text-red-900">Удалить аккаунт</h4>
                      <p className="text-sm text-red-700">Полное удаление аккаунта и всех данных</p>
                    </div>
                    <Button
                      variant="destructive"
                      onClick={handleDeleteAccount}
                    >
                      Удалить аккаунт
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Save Button */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="flex justify-center"
            >
              <Button
                onClick={handleSave}
                disabled={isLoading}
                className="px-8 py-3 bg-gradient-brand text-white hover:opacity-90"
                size="lg"
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 mr-2 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    Сохранение...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Сохранить все настройки
                  </>
                )}
              </Button>
            </motion.div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default Settings; 