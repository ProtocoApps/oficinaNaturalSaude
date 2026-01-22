import React, { useEffect } from 'react';

interface ToastProps {
  message: string;
  type?: 'success' | 'error' | 'info';
  onClose: () => void;
}

const Toast: React.FC<ToastProps> = ({ message, type = 'info', onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 4000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const styles = {
    success: 'bg-neon text-[#132210]',
    error: 'bg-red-500 text-white',
    info: 'bg-blue-600 text-white'
  };

  const icons = {
    success: 'check_circle',
    error: 'error',
    info: 'info'
  };

  return (
    <div className={`fixed top-24 right-4 z-[100] px-6 py-4 rounded-xl shadow-2xl transform transition-all duration-300 animate-fade-in-down flex items-center gap-3 ${styles[type]}`}>
      <span className="material-symbols-outlined filled-icon">
        {icons[type]}
      </span>
      <p className="font-bold text-sm md:text-base">{message}</p>
      <button onClick={onClose} className="ml-2 hover:opacity-70 transition-opacity">
        <span className="material-symbols-outlined text-sm">close</span>
      </button>
    </div>
  );
};

export default Toast;
