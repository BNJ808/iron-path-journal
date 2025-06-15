
import { NavLink, useLocation } from 'react-router-dom';
import { Dumbbell, BarChart3, History, Timer, User } from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { path: '/workout', icon: Dumbbell, label: 'Entraînement', color: 'text-accent-blue' },
  { path: '/stats', icon: BarChart3, label: 'Stats', color: 'text-accent-purple' },
  { path: '/history', icon: History, label: 'Historique', color: 'text-accent-yellow' },
  { path: '/profile', icon: User, label: 'Profil', color: 'text-gray-100' },
];

interface BottomNavProps {
  onTimerClick?: () => void;
}

const BottomNav = ({ onTimerClick }: BottomNavProps) => {
  const location = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 h-16 bg-gray-800 border-t border-gray-700 flex items-center justify-evenly">
      {navItems.slice(0, 3).map((item) => (
        <NavLink
          key={item.path}
          to={item.path}
          className={({ isActive }) =>
            cn(
              'flex flex-col items-center justify-center text-gray-400 hover:text-white transition-colors h-full',
              isActive && item.color,
              isActive && 'font-bold'
            )
          }
        >
          <item.icon className="h-6 w-6" />
          <span className="text-xs mt-1">{item.label}</span>
        </NavLink>
      ))}
      
      {/* Bouton Timer séparé qui ouvre le dialog */}
      <button
        onClick={onTimerClick}
        className="flex flex-col items-center justify-center text-gray-400 hover:text-white transition-colors h-full text-accent-green"
      >
        <Timer className="h-6 w-6" />
        <span className="text-xs mt-1">Timer</span>
      </button>

      {/* Bouton Profil en dernier */}
      <NavLink
        to="/profile"
        className={({ isActive }) =>
          cn(
            'flex flex-col items-center justify-center text-gray-400 hover:text-white transition-colors h-full',
            isActive && 'text-gray-100',
            isActive && 'font-bold'
          )
        }
      >
        <User className="h-6 w-6" />
        <span className="text-xs mt-1">Profil</span>
      </NavLink>
    </nav>
  );
};

export default BottomNav;
