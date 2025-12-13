import { motion } from 'framer-motion';

interface OrbitLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  animated?: boolean;
}

const sizes = {
  sm: { container: 40, ring: 36, planet: 12, moon: 6, text: 'text-lg' },
  md: { container: 60, ring: 52, planet: 18, moon: 8, text: 'text-2xl' },
  lg: { container: 100, ring: 88, planet: 28, moon: 12, text: 'text-4xl' },
  xl: { container: 160, ring: 140, planet: 44, moon: 18, text: 'text-6xl' }
};

export const OrbitLogo = ({ size = 'md', showText = true, animated = true }: OrbitLogoProps) => {
  const s = sizes[size];

  return (
    <div className="flex items-center gap-3">
      <div 
        className="relative flex items-center justify-center"
        style={{ width: s.container, height: s.container }}
      >
        {/* Outer glow */}
        <div 
          className="absolute inset-0 rounded-full bg-primary/20 blur-xl"
          style={{ transform: 'scale(1.5)' }}
        />
        
        {/* Orbital ring */}
        <motion.div
          className="absolute border-2 border-primary/60 rounded-full"
          style={{ width: s.ring, height: s.ring }}
          animate={animated ? { rotate: 360 } : {}}
          transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
        >
          {/* Orbiting moon */}
          <motion.div
            className="absolute rounded-full bg-secondary glow-secondary"
            style={{ 
              width: s.moon, 
              height: s.moon,
              top: -s.moon / 2,
              left: '50%',
              marginLeft: -s.moon / 2
            }}
          />
        </motion.div>
        
        {/* Second orbital ring */}
        <motion.div
          className="absolute border border-accent/40 rounded-full"
          style={{ width: s.ring * 0.7, height: s.ring * 0.7, transform: 'rotate(60deg)' }}
          animate={animated ? { rotate: -360 } : {}}
          transition={{ duration: 15, repeat: Infinity, ease: 'linear' }}
        />
        
        {/* Center planet */}
        <div 
          className="relative rounded-full bg-gradient-to-br from-primary via-secondary to-accent glow-primary z-10"
          style={{ width: s.planet, height: s.planet }}
        >
          {/* Planet shine */}
          <div 
            className="absolute top-1 left-1 rounded-full bg-foreground/30"
            style={{ width: s.planet * 0.25, height: s.planet * 0.25 }}
          />
        </div>
      </div>
      
      {showText && (
        <motion.span 
          className={`font-bold gradient-cosmic-text ${s.text}`}
          initial={animated ? { opacity: 0, x: -10 } : {}}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
        >
          Orbit
        </motion.span>
      )}
    </div>
  );
};

export default OrbitLogo;
