import { forwardRef } from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';
import { cn } from '@/lib/utils';

interface GlassCardProps extends HTMLMotionProps<"div"> {
  glow?: boolean;
  hover?: boolean;
}

export const GlassCard = forwardRef<HTMLDivElement, GlassCardProps>(
  ({ className, glow = false, hover = true, children, ...props }, ref) => {
    return (
      <motion.div
        ref={ref}
        className={cn(
          'glass rounded-2xl p-6 transition-all duration-300',
          glow && 'glow-primary',
          hover && 'hover:border-primary/50 hover:bg-card/70',
          className
        )}
        whileHover={hover ? { y: -4, scale: 1.01 } : {}}
        {...props}
      >
        {children}
      </motion.div>
    );
  }
);

GlassCard.displayName = 'GlassCard';

export default GlassCard;
