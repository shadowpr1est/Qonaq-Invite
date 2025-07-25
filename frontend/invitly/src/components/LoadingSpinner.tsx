import React from 'react';
import { useTranslation } from 'react-i18next';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  text?: string;
}

const sizePx = {
  sm: 24,
  md: 40,
  lg: 56,
  xl: 72,
};

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ size = 'md', className = '', text }) => {
  const { t } = useTranslation();
  
  return (
    <div className={`flex flex-col items-center justify-center space-y-4 ${className}`}>
      <div
        className="invitly-loader"
        style={{ width: sizePx[size], height: sizePx[size] }}
        role="status"
        aria-label={t('common.loading')}
      />
      {text && (
        <p className="text-sm text-gray-600 font-medium animate-pulse">{text}</p>
      )}
    </div>
  );
};

// Добавляем стиль только один раз
if (typeof window !== 'undefined' && !document.getElementById('invitly-loader-style')) {
  const style = document.createElement('style');
  style.id = 'invitly-loader-style';
  style.innerHTML = `
.invitly-loader {
  aspect-ratio: 1;
  border-radius: 50%;
  background: 
    radial-gradient(farthest-side,#8b5cf6 94%,#0000) top/8px 8px no-repeat,
    conic-gradient(#0000 30%,#8b5cf6);
  -webkit-mask: radial-gradient(farthest-side,#0000 calc(100% - 8px),#000 0);
  mask: radial-gradient(farthest-side,#0000 calc(100% - 8px),#000 0);
  animation: invitly-loader-spin 1s infinite linear;
}
@keyframes invitly-loader-spin{100%{transform:rotate(1turn)}}
`;
  document.head.appendChild(style);
} 