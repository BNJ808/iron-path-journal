
import { nanoid } from "nanoid";

const slugify = (str: string) =>
  str
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');

export const EXERCISES_DATABASE = {
  Pectoraux: {
    base: ['Développé couché avec barre', 'Développé couché avec haltères', 'Développé incliné avec haltères', 'Dips'],
    avancé: ['Écarté couché avec haltères', 'Pompes prise large', 'Développé décliné'],
    finition: ['Écarté à la poulie vis-à-vis', 'Pec Deck'],
  },
  Dorsaux: {
    base: ['Tractions', 'Rowing barre', 'Tirage vertical'],
    avancé: ['Rowing haltère', 'Soulevé de terre'],
    finition: ['Tirage horizontal', 'Pull-over'],
  },
  Épaules: {
     base: ['Développé militaire', 'Élévations latérales'],
     avancé: ["Développé d'Arnold", 'Face pulls'],
     finition: ['Oiseau (élévations buste penché)', 'Shrugs'],
  },
  Jambes: {
    base: ['Squat', 'Presse à cuisses', 'Fentes'],
    avancé: ['Soulevé de terre jambes tendues', 'Leg extensions', 'Leg curls'],
    finition: ['Mollets debout', 'Mollets assis'],
  },
  Biceps: {
    base: ['Curl barre', 'Curl haltères'],
    avancé: ['Curl incliné', 'Curl marteau'],
    finition: ['Curl concentration', 'Curl à la poulie'],
  },
  Triceps: {
    base: ['Développé couché prise serrée', 'Dips (focus triceps)'],
    avancé: ['Barre au front', 'Extensions poulie haute'],
    finition: ['Kickback', 'Extensions au-dessus de la tête'],
  },
  Abdos: {
    base: ['Crunchs', 'Planche', 'Relevés de jambes'],
    avancé: ['Russian twists', 'Mountain climbers', 'Bicycle crunches'],
    finition: ['Dead bug', 'Hollow body hold'],
  },
};

export const MUSCLE_GROUP_COLORS: Record<string, string> = {
  'Pectoraux': 'text-red-400',
  'Dorsaux': 'text-blue-400',
  'Épaules': 'text-purple-400',
  'Jambes': 'text-orange-400',
  'Biceps': 'text-pink-400',
  'Triceps': 'text-teal-400',
  'Abdos': 'text-green-400',
  'Autres': 'text-gray-400',
};

export const MUSCLE_GROUP_COLORS_HEX: Record<string, string> = {
  'Pectoraux': '#f87171', // text-red-400
  'Dorsaux': '#60a5fa', // text-blue-400
  'Épaules': '#c084fc', // text-purple-400
  'Jambes': '#fb923c', // text-orange-400
  'Biceps': '#f472b6', // text-pink-400
  'Triceps': '#2dd4bf', // text-teal-400
  'Abdos': '#4ade80', // text-green-400
  'Autres': '#9ca3af', // text-gray-400
};

type Exercise = { id: string; name: string };
export type ExerciseGroup = {
    group: string;
    exercises: Exercise[];
};

export const groupedExercises: ExerciseGroup[] = Object.entries(EXERCISES_DATABASE)
  .map(([group, types]) => ({
    group,
    exercises: Object.values(types)
      .flat()
      .map(name => ({ id: slugify(name), name: name }))
      .sort((a, b) => a.name.localeCompare(b.name)),
  }));

const allExercises = groupedExercises.flatMap(g => g.exercises);

export const exercises = allExercises.sort((a,b) => a.name.localeCompare(b.name));
