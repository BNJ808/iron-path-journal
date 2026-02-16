
import { NavLink, useLocation } from 'react-router-dom';
import { Dumbbell, BarChart3, History, Calendar, User } from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { path: '/workout', icon: Dumbbell, label: 'Entraînement', color: 'text-accent-blue' },
  { path: '/calendar', icon: Calendar, label: 'Calendrier', color: 'text-accent-green' },
  { path: '/stats', icon: BarChart3, label: 'Stats', color: 'text-accent-purple' },
  { path: '/history', icon: History, label: 'Historique', color: 'text-accent-yellow' },
  { path: '/profile', icon: User, label: 'Profil', color: 'text-foreground' },
];

interface BottomNavProps {
  onTimerClick?: () => void;
}

const BottomNav = ({ onTimerClick }: BottomNavProps) => {
  const location = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 h-16 bg-card border-t border-border flex items-center justify-evenly z-50">
      {navItems.map((item) => (
        <NavLink
          key={item.path}
          to={item.path}
          className={({ isActive }) =>
            cn(
              'flex flex-col items-center justify-center text-muted-foreground hover:text-foreground transition-colors h-full px-2',
              isActive && item.color,
              isActive && 'font-bold'
            )
          }
        >
          <item.icon className="h-6 w-6" />
          <span className="text-xs mt-1">{item.label}</span>
        </NavLink>
      ))}
    </nav>
  );
};

export default BottomNav;
