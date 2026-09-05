import { useLocation } from 'react-router-dom';
import Seo from './Seo';

const META: Record<string, { title: string; description: string }> = {
  '/workout': {
    title: 'Entraînement — Carnet Muscu',
    description:
      "Lancez une séance, suivez vos séries, poids et répétitions en direct depuis votre carnet d'entraînement.",
  },
  '/stats': {
    title: 'Statistiques — Carnet Muscu',
    description:
      'Analysez votre progression : volume par groupe musculaire, records personnels, 1RM estimé et suivi du poids.',
  },
  '/history': {
    title: 'Historique des séances — Carnet Muscu',
    description:
      'Retrouvez et modifiez toutes vos séances passées : exercices, séries, charges et durée.',
  },
  '/calendar': {
    title: 'Calendrier d’entraînement — Carnet Muscu',
    description:
      'Planifiez vos séances, visualisez vos jours d’entraînement validés et organisez votre semaine.',
  },
  '/profile': {
    title: 'Profil et réglages — Carnet Muscu',
    description:
      'Gérez votre profil, vos thèmes, vos exercices personnalisés et exportez vos données.',
  },
};

const RouteSeo = () => {
  const { pathname } = useLocation();
  const meta = META[pathname];
  if (!meta) return null;
  return <Seo title={meta.title} description={meta.description} path={pathname} />;
};

export default RouteSeo;
