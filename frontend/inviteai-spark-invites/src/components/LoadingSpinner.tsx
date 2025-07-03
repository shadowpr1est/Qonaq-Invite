import { cn } from '@/lib/utils';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  text?: string;
  variant?: 'default' | 'dots' | 'pulse' | 'gradient';
}

const sizeClasses = {
  sm: 'h-4 w-4',
  md: 'h-8 w-8',
  lg: 'h-12 w-12',
  xl: 'h-16 w-16',
};

const DefaultSpinner = ({ size }: { size: string }) => (
  <div
    className={cn(
      "animate-spin rounded-full border-3 border-gray-300 border-t-purple-500",
      size
    )}
    role="status"
    aria-label="Загрузка"
  />
);

const DotsSpinner = ({ size }: { size: string }) => {
  const dotSize = size.includes('4') ? 'w-1 h-1' : size.includes('8') ? 'w-2 h-2' : 'w-3 h-3';
  
  return (
    <div className="flex space-x-1">
      <div className={cn("bg-purple-500 rounded-full animate-bounce", dotSize)} style={{animationDelay: '0ms'}}></div>
      <div className={cn("bg-purple-500 rounded-full animate-bounce", dotSize)} style={{animationDelay: '150ms'}}></div>
      <div className={cn("bg-purple-500 rounded-full animate-bounce", dotSize)} style={{animationDelay: '300ms'}}></div>
    </div>
  );
};

const PulseSpinner = ({ size }: { size: string }) => (
  <div className={cn("relative", size)}>
    <div className="absolute inset-0 bg-purple-500 rounded-full animate-ping opacity-75"></div>
    <div className="relative bg-purple-600 rounded-full h-full w-full"></div>
  </div>
);

const GradientSpinner = ({ size }: { size: string }) => (
  <div className={cn("relative", size)}>
    <div className="absolute inset-0 bg-gradient-to-r from-purple-500 via-blue-500 to-cyan-500 rounded-full animate-spin"></div>
    <div className="absolute inset-1 bg-white rounded-full"></div>
    <div className="absolute inset-2 bg-gradient-to-r from-purple-400 via-blue-400 to-cyan-400 rounded-full animate-pulse"></div>
  </div>
);

export const LoadingSpinner = ({ 
  size = 'md', 
  className, 
  text,
  variant = 'gradient'
}: LoadingSpinnerProps) => {
  const sizeClass = sizeClasses[size];
  
  const renderSpinner = () => {
    switch (variant) {
      case 'dots':
        return <DotsSpinner size={sizeClass} />;
      case 'pulse':
        return <PulseSpinner size={sizeClass} />;
      case 'gradient':
        return <GradientSpinner size={sizeClass} />;
      default:
        return <DefaultSpinner size={sizeClass} />;
    }
  };

  return (
    <div className={cn("flex flex-col items-center justify-center space-y-4", className)}>
      {renderSpinner()}
      {text && (
        <p className="text-sm text-gray-600 font-medium animate-pulse">{text}</p>
      )}
    </div>
  );
}; 