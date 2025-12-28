'use client';

interface ToastProps {
  message: string;
  type: 'success' | 'error' | 'info';
  onClose: () => void;
}

export default function Toast({ message, type, onClose }: ToastProps) {
  const bgColor = {
    success: 'bg-green-500',
    error: 'bg-red-500',
    info: 'bg-blue-500',
  };

  const icon = {
    success: '✓',
    error: '✕',
    info: 'ℹ',
  };

  return (
    <div className={`${bgColor[type]} text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-3 min-w-[300px]`}>
      <span className="text-xl font-bold">{icon[type]}</span>
      <p className="flex-grow">{message}</p>
      <button
        onClick={onClose}
        className="text-white hover:text-gray-200 text-xl leading-none"
        aria-label="Close"
      >
        &times;
      </button>
    </div>
  );
}
