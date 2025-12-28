import { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
}

export default function Card({ children, className = '', onClick }: CardProps) {
  const clickableClass = onClick ? 'cursor-pointer hover:shadow-lg transition-shadow' : '';

  return (
    <div
      className={`bg-white rounded-lg shadow-md overflow-hidden ${clickableClass} ${className}`}
      onClick={onClick}
    >
      {children}
    </div>
  );
}
