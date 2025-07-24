import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/use-auth';
import { apiClient } from '@/lib/api';
import MainLayout from '@/components/MainLayout';
import Hero from '@/components/Hero';
import HowItWorks from '@/components/HowItWorks';
import SocialProof from '@/components/SocialProof';
import FAQ from '@/components/FAQ';
import Footer from '@/components/Footer';

const Index = () => {
  const navigate = useNavigate();
  const { setUser, user, isInitialized } = useAuth();

  // Простая отладка при загрузке страницы
  console.log('Index component loaded, URL:', window.location.href);





  return (
    <MainLayout>
      <Hero />
      <HowItWorks />
      <SocialProof />
      <FAQ />
      <Footer />
    </MainLayout>
  );
};

export default Index;
