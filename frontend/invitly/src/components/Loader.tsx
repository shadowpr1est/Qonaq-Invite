import React from 'react';

const Loader: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div className={`invitly-loader ${className}`}></div>
);

export default Loader;

// Добавляем стиль только один раз
if (typeof window !== 'undefined' && !document.getElementById('invitly-loader-style')) {
  const style = document.createElement('style');
  style.id = 'invitly-loader-style';
  style.innerHTML = `
.invitly-loader {
  width: 50px;
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