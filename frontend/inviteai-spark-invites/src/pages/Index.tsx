import MainLayout from '@/components/MainLayout';
import Hero from '@/components/Hero';
import HowItWorks from '@/components/HowItWorks';
import SocialProof from '@/components/SocialProof';
import FAQ from '@/components/FAQ';
import Footer from '@/components/Footer';

const Index = () => {
  return (
    <MainLayout className="px-4 sm:px-6 lg:px-8">
      <Hero />
      <HowItWorks />
      <SocialProof />
      <FAQ />
      <Footer />
    </MainLayout>
  );
};

export default Index;
