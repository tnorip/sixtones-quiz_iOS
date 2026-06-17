import type { Difficulty } from './data/quizzes';

export type RootStackParamList = {
  Login: undefined;
  Home: undefined;
  GameMenu: undefined;
  Quiz: { difficulty: Difficulty | 'ランダム' };
  Result: { score: number; total: number; earnedPoints: number; saved: boolean };
  Account: undefined;
  Profile: undefined;
  History: undefined;
  Placeholder: { title: string; description: string };
};
