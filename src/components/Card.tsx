import React from 'react';
import { useTheme } from '../contexts/ThemeContext';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  rounded?: 'sm' | 'md' | 'lg' | 'xl';
}

const Card: React.FC<CardProps> = ({ 
  children, 
  className = '', 
  hover = true,
  padding = 'md',
  rounded = 'lg'
}) => {
  const { theme } = useTheme();
  
  const paddingClasses = {
    none: '',
    sm: 'p-3',
    md: 'p-6',
    lg: 'p-8'
  };

  const roundedClasses = {
    sm: 'rounded-sm',
    md: 'rounded-md',
    lg: 'rounded-lg',
    xl: 'rounded-xl'
  };

  const hoverEffect = hover ? 'hover:shadow-xl transform hover:scale-[1.02] transition-all duration-200' : '';

  return (
    <div 
      className={`
        ${theme.bg.card} 
        shadow-md 
        border 
        ${theme.border.primary} 
        ${roundedClasses[rounded]} 
        ${paddingClasses[padding]} 
        ${hoverEffect}
        transition-colors duration-300 
        ${className}
      `}
    >
      {children}
    </div>
  );
};

export default Card;