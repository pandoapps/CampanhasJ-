import React from 'react';

interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
}

export const GlassCard: React.FC<GlassCardProps> = ({ children, className = '', ...props }) => (
  <div {...props} className={`glass overflow-hidden ${className}`}>
    {children}
  </div>
);

export const GlassCardDark: React.FC<GlassCardProps> = ({ children, className = '', ...props }) => (
  <div {...props} className={`glass-dark overflow-hidden ${className}`}>
    {children}
  </div>
);
