
import { nanoid } from "nanoid";

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
      .map(name => ({ id: nanoid(), name: name }))
      .sort((a, b) => a.name.localeCompare(b.name)),
  }));

const allExercises = groupedExercises.flatMap(g => g.exercises);

export const exercises = allExercises.sort((a,b) => a.name.localeCompare(b.name));
