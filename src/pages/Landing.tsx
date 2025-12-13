import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { Starfield } from '@/components/Starfield';
import { OrbitLogo } from '@/components/OrbitLogo';
import { CosmicButton } from '@/components/CosmicButton';
import { GlassCard } from '@/components/GlassCard';

const credits = [
  { name: 'Furqan Hussain', roll: '24F-AI-110' },
  { name: 'Mudassir Kazi', roll: '24F-AI-115' },
  { name: 'Ashad Abassi', roll: '24F-AI-105' },
  { name: 'Abeel Ahsan', roll: '24F-AI-155' },
];

const Landing = () => {
  return (
    <div className="min-h-screen relative overflow-hidden">
      <Starfield />
      
      {/* Gradient overlays */}
      <div className="absolute inset-0 bg-gradient-to-b from-primary/10 via-transparent to-secondary/10 pointer-events-none" />
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-secondary/20 rounded-full blur-3xl pointer-events-none" />

      {/* Navigation */}
      <motion.header 
        className="relative z-10 flex items-center justify-between px-6 py-4 lg:px-12"
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6 }}
      >
        <OrbitLogo size="md" />
        <div className="flex items-center gap-4">
          <Link to="/login">
            <CosmicButton variant="ghost">Log In</CosmicButton>
          </Link>
        </div>
      </motion.header>

      {/* Hero Section */}
      <main className="relative z-10 flex flex-col items-center justify-center min-h-[80vh] px-6 text-center">
        <motion.div
          className="mb-8"
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.8, type: 'spring' }}
        >
          <OrbitLogo size="xl" showText={false} />
        </motion.div>

        <motion.h1
          className="text-5xl md:text-7xl lg:text-8xl font-bold mb-6 text-glow"
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.6 }}
        >
          <span className="gradient-cosmic-text">Orbit</span>
        </motion.h1>

        <motion.p
          className="text-xl md:text-2xl text-muted-foreground max-w-2xl mb-12"
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.6 }}
        >
          Connect with spaces, share posts, and explore communities tailored to your interests.
        </motion.p>

        <motion.div
          className="flex flex-col sm:flex-row gap-4"
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.7, duration: 0.6 }}
        >
          <Link to="/signup">
            <CosmicButton size="lg" className="flex items-center gap-2">
              Get Started <ArrowRight className="w-5 h-5" />
            </CosmicButton>
          </Link>
          
        </motion.div>

        {/* Floating elements */}
        <motion.div
          className="absolute top-1/4 right-10 w-4 h-4 rounded-full bg-primary animate-float"
          style={{ animationDelay: '0s' }}
        />
        <motion.div
          className="absolute bottom-1/3 left-20 w-3 h-3 rounded-full bg-secondary animate-float"
          style={{ animationDelay: '1s' }}
        />
        <motion.div
          className="absolute top-1/2 right-1/4 w-2 h-2 rounded-full bg-accent animate-float"
          style={{ animationDelay: '2s' }}
        />
      </main>

      {/* Footer Credits */}
      <footer className="relative z-10 px-6 py-12 lg:px-12 mt-8 border-t border-border/50 bg-card/60 backdrop-blur-md">
        <div className="max-w-4xl mx-auto">
          <h3 className="text-lg font-semibold mb-4">Project submitted by</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {credits.map((c) => (
              <GlassCard key={c.roll} className="p-4" hover={false}>
                <div className="flex items-center justify-between">
                  <span className="font-medium">{c.name}</span>
                  <span className="text-sm text-muted-foreground">Roll {c.roll}</span>
                </div>
              </GlassCard>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
