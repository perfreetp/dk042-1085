import type { ReactNode, CSSProperties } from 'react';
import { cn } from '../../utils/formatters';

interface CardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  onClick?: () => void;
  style?: CSSProperties;
}

export default function Card({ children, className, hover = false, onClick, style }: CardProps) {
  return (
    <div
      className={cn(
        'card-base',
        hover && 'card-hover cursor-pointer',
        onClick && 'cursor-pointer',
        className
      )}
      onClick={onClick}
      style={style}
    >
      {children}
    </div>
  );
}
