import React from 'react';
import { useTheme } from '../contexts/ThemeContext';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  rounded?: 'sm' | 'md' | 'lg' | 'xl';
  glass?: boolean;
  shadow?: 'none' | 'sm' | 'md' | 'lg' | 'colored';
}

const Card: React.FC<CardProps> = ({ 
  children, 
  className = '', 
  hover = true,
  padding = 'md',
  rounded = 'lg',
  glass = false,
  shadow = 'md'
}) => {
  const { theme, isDarkMode } = useTheme();
  
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

  const shadowClasses = {
    none: '',
    sm: 'shadow-soft',
    md: 'shadow-medium',
    lg: 'shadow-large',
    colored: 'shadow-colored'
  };

  const hoverEffect = hover ? 'hover-lift interactive' : '';
  const glassEffect = glass ? (isDarkMode ? 'glass-dark' : 'glass') : theme.bg.card;
  const borderEffect = glass ? '' : `border ${theme.border.primary}`;

  return (
    <div 
      className={`
        ${glassEffect}
        ${shadowClasses[shadow]} 
        ${borderEffect}
        ${roundedClasses[rounded]} 
        ${paddingClasses[padding]} 
        ${hoverEffect}
        animate-scale-in
        transition-all duration-300 ease-in-out
        ${className}
      `}
    >
      {children}
    </div>
  );
};

export default Card;