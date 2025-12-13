import { forwardRef } from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';
import { cn } from '@/lib/utils';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'glass' | 'outline';
type ButtonSize = 'sm' | 'md' | 'lg';

interface CosmicButtonProps extends Omit<HTMLMotionProps<"button">, 'children'> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  glow?: boolean;
  children: React.ReactNode;
}

const variants: Record<ButtonVariant, string> = {
  primary: 'bg-gradient-to-r from-primary via-secondary to-primary bg-[length:200%_100%] text-primary-foreground hover:animate-shimmer',
  secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
  ghost: 'bg-transparent hover:bg-muted text-foreground',
  glass: 'glass text-foreground hover:bg-card/80',
  outline: 'bg-transparent border-2 border-primary text-primary hover:bg-primary/10'
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: 'px-4 py-2 text-sm rounded-lg',
  md: 'px-6 py-3 text-base rounded-xl',
  lg: 'px-8 py-4 text-lg rounded-2xl'
};

export const CosmicButton = forwardRef<HTMLButtonElement, CosmicButtonProps>(
  ({ className, variant = 'primary', size = 'md', glow = true, children, ...props }, ref) => {
    return (
      <motion.button
        ref={ref}
        className={cn(
          'font-semibold transition-all duration-300 relative overflow-hidden',
          variants[variant],
          sizeClasses[size],
          glow && variant === 'primary' && 'glow-primary',
          className
        )}
        whileHover={{ scale: 1.02, y: -2 }}
        whileTap={{ scale: 0.98 }}
        {...props}
      >
        {children}
      </motion.button>
    );
  }
);

CosmicButton.displayName = 'CosmicButton';

export default CosmicButton;
