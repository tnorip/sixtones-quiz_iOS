import type { Difficulty } from './data/quizzes';
import type { ExamGrade } from './services/userRepository';

export type RootStackParamList = {
  Login: undefined;
  Home: undefined;
  GameMenu: undefined;
  Quiz: { difficulty: Difficulty | 'ランダム'; mode?: 'free' } | { grade: ExamGrade; mode: 'exam' };
  Result: {
    score: number;
    total: number;
    earnedPoints: number;
    saved: boolean;
    mode: 'free' | 'exam';
    grade?: ExamGrade;
    passed?: boolean;
    passLine?: number;
  };
  Account: undefined;
  Profile: undefined;
  History: undefined;
  Ranking: undefined;
  Stones: undefined;
  Proposal: undefined;
  Placeholder: { title: string; description: string };
};
