import { motion, type HTMLMotionProps } from 'framer-motion';
import { type ReactNode } from 'react';

interface GlassCardProps extends HTMLMotionProps<'div'> {
  children: ReactNode;
  className?: string;
  hover?: boolean;
}

export function GlassCard({ children, className = '', hover = false, ...rest }: GlassCardProps) {
  return (
    <motion.div
      className={`glass-card ${hover ? 'transition-transform hover:-translate-y-1' : ''} ${className}`}
      {...rest}
    >
      {children}
    </motion.div>
  );
}
