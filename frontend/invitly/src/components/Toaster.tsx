import { AnimatePresence } from 'framer-motion';
import { useToast } from '@/hooks/use-toast';
import Toast from './Toast';

const Toaster = () => {
  const { toasts, removeToast } = useToast();

  return (
    <div className="fixed top-4 right-4 z-50 space-y-4">
      <AnimatePresence>
        {toasts.map((toast) => (
          <Toast
            key={toast.id}
            {...toast}
            onClose={removeToast}
          />
        ))}
      </AnimatePresence>
    </div>
  );
};

export default Toaster; 