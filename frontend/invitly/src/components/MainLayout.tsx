
import { ReactNode } from 'react';
import Header from './Header';
import Toaster from './Toaster';

interface MainLayoutProps {
  children: ReactNode;
  className?: string;
}

const MainLayout = ({ children, className = "" }: MainLayoutProps) => {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <main className={`pt-16 md:pt-20 ${className}`}>
        {children}
      </main>
      <Toaster />
    </div>
  );
};

export default MainLayout;
