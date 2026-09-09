
import { NavLink, useLocation } from 'react-router-dom';
import { Dumbbell, BarChart3, History, Calendar, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

const navItems = [
  { path: '/workout', icon: Dumbbell, label: 'Entraînement' },
  { path: '/calendar', icon: Calendar, label: 'Calendrier' },
  { path: '/stats', icon: BarChart3, label: 'Stats' },
  { path: '/history', icon: History, label: 'Historique' },
  { path: '/profile', icon: User, label: 'Profil' },
];

interface BottomNavProps {
  onTimerClick?: () => void;
}

const BottomNav = ({ onTimerClick }: BottomNavProps) => {
  const location = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-background/90 backdrop-blur-lg border-t border-border/60 shadow-[0_-8px_30px_hsl(var(--foreground)_/_0.04)]">
      <div className="max-w-md mx-auto flex items-center justify-around h-16 px-2">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path || location.pathname.startsWith(`${item.path}/`);
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={cn(
                'relative flex flex-col items-center justify-center gap-1 px-2 py-1.5 rounded-xl transition-colors duration-200 min-w-[3.5rem]',
                isActive ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <item.icon
                className={cn('h-5 w-5 transition-all duration-200', isActive && 'scale-110')}
                fill={isActive ? 'currentColor' : 'none'}
                strokeWidth={isActive ? 2 : 1.8}
              />
              <span className={cn('text-[10px] font-semibold leading-none', isActive && 'font-bold')}>
                {item.label}
              </span>
              {isActive && (
                <motion.div
                  layoutId="bottom-nav-indicator"
                  className="absolute -top-0.5 w-1 h-1 rounded-full bg-primary"
                  transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                />
              )}
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNav;
