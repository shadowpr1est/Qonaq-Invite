
import { ReactNode } from 'react';
import Header from './Header';

interface MainLayoutProps {
  children: ReactNode;
}

const MainLayout = ({ children }: MainLayoutProps) => {
  return (
    <div className="min-h-screen">
      <Header />
      <main>
        {children}
      </main>
    </div>
  );
};

export default MainLayout;
