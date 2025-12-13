import { motion } from 'framer-motion';
import { Home, Users, User, PlusCircle, Search } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';

const navItems = [
  { icon: Home, label: 'Home', path: '/home' },
  { icon: Search, label: 'Explore', path: '/explore' },
  { icon: PlusCircle, label: 'Create', path: '/create' },
  { icon: Users, label: 'Spaces', path: '/spaces' },
  { icon: User, label: 'Profile', path: '/profile' },
];

export const MobileNav = () => {
  const location = useLocation();

  return (
    <motion.nav
      className="fixed bottom-0 left-0 right-0 glass-strong border-t border-border/50 px-4 py-2 lg:hidden z-50"
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex items-center justify-around">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          const isCreate = item.path === '/create';
          
          return (
            <Link key={item.path} to={item.path}>
              <motion.div
                className={cn(
                  'flex flex-col items-center gap-1 px-4 py-2 rounded-xl transition-all',
                  isCreate && '',
                  isActive 
                    ? 'text-primary' 
                    : 'text-muted-foreground'
                )}
                whileTap={{ scale: 0.9 }}
              >
                {isCreate ? (
                  <div className="w-12 h-12 rounded-full bg-gradient-to-r from-primary via-secondary to-primary flex items-center justify-center glow-primary">
                    <item.icon className="w-6 h-6 text-primary-foreground" />
                  </div>
                ) : (
                  <>
                    <item.icon className={cn("w-6 h-6", isActive && "glow-primary")} />
                    <span className="text-xs font-medium">{item.label}</span>
                    {isActive && (
                      <motion.div
                        className="absolute -bottom-1 w-1 h-1 rounded-full bg-primary"
                        layoutId="mobileActiveTab"
                      />
                    )}
                  </>
                )}
              </motion.div>
            </Link>
          );
        })}
      </div>
    </motion.nav>
  );
};

export default MobileNav;
