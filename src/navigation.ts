import type { Difficulty } from './data/quizzes';

export type RootStackParamList = {
  Home: undefined;
  GameMenu: undefined;
  Quiz: { difficulty: Difficulty | 'ランダム' };
  Result: { score: number; total: number };
  Placeholder: { title: string; description: string };
};
