
import { NavLink } from 'react-router-dom';
import { Dumbbell, BarChart3, History, Timer, User } from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { path: '/workout', icon: Dumbbell, label: 'Entraînement', color: 'text-accent-blue' },
  { path: '/stats', icon: BarChart3, label: 'Stats', color: 'text-accent-purple' },
  { path: '/history', icon: History, label: 'Historique', color: 'text-accent-yellow' },
  { path: '/timer', icon: Timer, label: 'Timer', color: 'text-accent-green' },
  { path: '/profile', icon: User, label: 'Profil', color: 'text-gray-100' },
];

const BottomNav = () => {
  return (
    <nav className="fixed bottom-0 left-0 right-0 h-16 bg-gray-800 border-t border-gray-700 flex items-center px-2">
      {navItems.map((item) => (
        <NavLink
          key={item.path}
          to={item.path}
          className={({ isActive }) =>
            cn(
              'flex flex-1 flex-col items-center justify-center text-gray-400 hover:text-white transition-colors h-full',
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
