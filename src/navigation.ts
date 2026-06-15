import type { Difficulty } from './data/quizzes';

export type RootStackParamList = {
  Login: undefined;
  Home: undefined;
  GameMenu: undefined;
  Quiz: { difficulty: Difficulty | 'ランダム' };
  Result: { score: number; total: number };
  Account: undefined;
  Placeholder: { title: string; description: string };
};
