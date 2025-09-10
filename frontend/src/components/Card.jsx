import React from 'react';

const Card = ({ 
  children, 
  className = '', 
  hover = false, 
  gradient = false,
  ...props 
}) => {
  const baseClasses = 'rounded-xl border border-slate-200 dark:border-slate-600 p-6 transition-all duration-300';
  const hoverClasses = hover ? 'hover:shadow-xl hover:shadow-teal-500/10 hover:border-teal-500/30 hover:-translate-y-1' : '';
  const gradientClasses = gradient ? 'card-gradient' : 'bg-white/80 dark:bg-slate-800/50 backdrop-blur-sm';
  
  return (
    <div 
      className={`${baseClasses} ${gradientClasses} ${hoverClasses} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

export default Card;
