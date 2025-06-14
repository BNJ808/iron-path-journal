
import { NavLink } from 'react-router-dom';
import { Dumbbell, BarChart3, History, Timer } from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { path: '/workout', icon: Dumbbell, label: 'Entraînement', color: 'text-accent-blue' },
  { path: '/stats', icon: BarChart3, label: 'Stats', color: 'text-accent-purple' },
  { path: '/history', icon: History, label: 'Historique', color: 'text-accent-yellow' },
  { path: '/timer', icon: Timer, label: 'Timer', color: 'text-gray-400' },
];

const BottomNav = () => {
  return (
    <nav className="fixed bottom-0 left-0 right-0 h-16 bg-gray-800 border-t border-gray-700 flex justify-around items-center">
      {navItems.map((item) => (
        <NavLink
          key={item.path}
          to={item.path}
          className={({ isActive }) =>
            cn(
              'flex flex-col items-center justify-center text-gray-400 hover:text-white transition-colors',
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
