import { collection, getDocs } from 'firebase/firestore';
import type { Difficulty, Quiz } from '../data/quizzes';
import { db } from './firebase';

const difficulties: Difficulty[] = ['初級', '中級', '上級'];

function isDifficulty(value: unknown): value is Difficulty {
  return typeof value === 'string' && difficulties.includes(value as Difficulty);
}

function toQuiz(id: string, value: Record<string, unknown>): Quiz | null {
  if (
    typeof value.question !== 'string' ||
    !Array.isArray(value.options) ||
    !value.options.every((option) => typeof option === 'string') ||
    typeof value.correct !== 'number' ||
    !Number.isInteger(value.correct) ||
    value.correct < 0 ||
    value.correct >= value.options.length ||
    !isDifficulty(value.difficulty)
  ) {
    return null;
  }

  return {
    id,
    question: value.question,
    options: value.options,
    correct: value.correct,
    difficulty: value.difficulty,
    explanation: typeof value.explanation === 'string' ? value.explanation : '',
    randomizeOptions: value.randomizeOptions !== false,
  };
}

export async function loadQuizzes(): Promise<Quiz[]> {
  const snapshot = await getDocs(collection(db, 'quizzes'));
  return snapshot.docs
    .map((document) => toQuiz(document.id, document.data()))
    .filter((quiz): quiz is Quiz => quiz !== null);
}
