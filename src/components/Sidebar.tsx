import { motion } from 'framer-motion';
import { Home, Users, User, Settings, PlusCircle } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { OrbitLogo } from './OrbitLogo';
import { CosmicButton } from './CosmicButton';
import { cn } from '@/lib/utils';
import { useSpaces } from '@/hooks/useSpaces';

const navItems = [
  { icon: Home, label: 'Home', path: '/home' },
  { icon: Users, label: 'Spaces', path: '/spaces' },
  { icon: User, label: 'Profile', path: '/profile' },
  { icon: Settings, label: 'Settings', path: '/settings' },
];

export const Sidebar = () => {
  const location = useLocation();
  const { spaces } = useSpaces();
  const joinedSpaces = spaces.filter((s) => s.is_joined);

  return (
    <motion.aside
      className="fixed left-0 top-0 h-screen w-64 glass-strong border-r border-border/50 p-6 hidden lg:flex flex-col z-40"
      initial={{ x: -100, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* Logo */}
      <Link to="/home" className="mb-8">
        <OrbitLogo size="md" />
      </Link>

      {/* Navigation */}
      <nav className="flex-1 space-y-2">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link key={item.path} to={item.path}>
              <motion.div
                className={cn(
                  'flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300',
                  isActive 
                    ? 'bg-primary/20 text-primary glow-primary' 
                    : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'
                )}
                whileHover={{ x: 4 }}
                whileTap={{ scale: 0.98 }}
              >
                <item.icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
                {isActive && (
                  <motion.div
                    className="absolute left-0 w-1 h-8 bg-primary rounded-r-full"
                    layoutId="activeTab"
                  />
                )}
              </motion.div>
            </Link>
          );
        })}
      </nav>

      {/* Joined Spaces */}
      {joinedSpaces.length > 0 && (
        <div className="mt-6">
          <h4 className="text-sm font-semibold text-muted-foreground mb-2">Joined Spaces</h4>
          <div className="space-y-1 overflow-y-auto max-h-64 pr-1 no-scrollbar pb-10">
            {joinedSpaces.map((s) => (
              <Link key={s.id} to={`/space/${s.id}`}>
                <div className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-muted/50 transition-colors">
                  <div className="w-5 h-5 rounded-md overflow-hidden bg-card border border-border/50">
                    <img src={s.icon_url || 'https://images.unsplash.com/photo-1614732414444-096e5f1122d5?w=200'} alt={s.name} className="w-full h-full object-cover" />
                  </div>
                  <span className="text-sm">{s.name}</span>
                </div>
              </Link>
            ))}
            <div className="h-9" />
          </div>
        </div>
      )}

      {/* Create Post CTA moved to page-level for global positioning */}
    </motion.aside>
  );
};

export default Sidebar;
