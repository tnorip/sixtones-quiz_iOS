import { useEffect, useMemo, useState } from 'react';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import * as Haptics from 'expo-haptics';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { GoldButton } from '../components/GoldButton';
import { Screen } from '../components/Screen';
import { sampleQuizzes, type Quiz } from '../data/quizzes';
import type { RootStackParamList } from '../navigation';
import { loadQuizzes } from '../services/quizRepository';
import { colors, shadow } from '../theme';

type Props = NativeStackScreenProps<RootStackParamList, 'Quiz'>;

function shuffle<T>(items: T[]): T[] {
  const result = [...items];
  for (let index = result.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(Math.random() * (index + 1));
    [result[index], result[randomIndex]] = [result[randomIndex], result[index]];
  }
  return result;
}

function randomizeOptions(quiz: Quiz): Quiz {
  if (quiz.randomizeOptions === false) return quiz;

  const options = shuffle(quiz.options.map((label, index) => ({ label, index })));
  return {
    ...quiz,
    options: options.map((option) => option.label),
    correct: options.findIndex((option) => option.index === quiz.correct),
  };
}

export function QuizScreen({ navigation, route }: Props) {
  const [allQuizzes, setAllQuizzes] = useState<Quiz[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [usingSampleData, setUsingSampleData] = useState(false);

  useEffect(() => {
    let active = true;

    loadQuizzes()
      .then((items) => {
        if (!active) return;
        if (items.length === 0) {
          setAllQuizzes(sampleQuizzes);
          setUsingSampleData(true);
        } else {
          setAllQuizzes(items);
        }
      })
      .catch((error: unknown) => {
        console.warn('Failed to load quizzes from Firestore.', error);
        if (!active) return;
        setAllQuizzes(sampleQuizzes);
        setUsingSampleData(true);
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const quizzes = useMemo(() => {
    const filtered =
      route.params.difficulty === 'ランダム'
        ? allQuizzes
        : allQuizzes.filter((quiz) => quiz.difficulty === route.params.difficulty);
    return shuffle(filtered.length ? filtered : allQuizzes).slice(0, 5).map(randomizeOptions);
  }, [allQuizzes, route.params.difficulty]);

  const [index, setIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const quiz = quizzes[index];
  const answered = selected !== null;

  if (isLoading) {
    return (
      <Screen scroll={false}>
        <View style={styles.centerState}>
          <ActivityIndicator color={colors.gold} size="large" />
          <Text style={styles.stateTitle}>問題を読み込んでいます</Text>
          <Text style={styles.stateText}>Firestoreのクイズデータを確認中です。</Text>
        </View>
      </Screen>
    );
  }

  if (!quiz) {
    return (
      <Screen scroll={false}>
        <View style={styles.centerState}>
          <Text style={styles.stateTitle}>出題できる問題がありません</Text>
          <Text style={styles.stateText}>難易度を選び直してください。</Text>
          <View style={styles.stateAction}>
            <GoldButton label="クイズ選択へ戻る" onPress={() => navigation.replace('GameMenu')} />
          </View>
        </View>
      </Screen>
    );
  }

  const answer = (optionIndex: number) => {
    if (answered) return;
    setSelected(optionIndex);
    if (optionIndex === quiz.correct) {
      setScore((value) => value + 1);
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } else {
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
  };

  const next = () => {
    if (index === quizzes.length - 1) {
      navigation.replace('Result', { score, total: quizzes.length });
      return;
    }
    setIndex((value) => value + 1);
    setSelected(null);
  };

  return (
    <Screen>
      <View style={styles.progressRow}>
        <Text style={styles.progress}>QUESTION {index + 1} / {quizzes.length}</Text>
        <Text style={styles.score}>正解 {score}</Text>
      </View>
      {usingSampleData ? <Text style={styles.sampleNotice}>オフライン用サンプル問題で出題中</Text> : null}
      <View style={styles.track}>
        <View style={[styles.bar, { width: `${((index + 1) / quizzes.length) * 100}%` }]} />
      </View>
      <View style={styles.questionCard}>
        <Text style={styles.difficulty}>{quiz.difficulty}</Text>
        <Text style={styles.question}>{quiz.question}</Text>
      </View>
      <View style={styles.options}>
        {quiz.options.map((option, optionIndex) => {
          const isSelected = selected === optionIndex;
          const isCorrect = answered && optionIndex === quiz.correct;
          const isIncorrect = answered && isSelected && !isCorrect;
          return (
            <Pressable
              key={option}
              onPress={() => answer(optionIndex)}
              style={({ pressed }) => [
                styles.option,
                isCorrect && styles.correct,
                isIncorrect && styles.incorrect,
                pressed && !answered && styles.optionPressed,
              ]}
            >
              <Text style={styles.optionIndex}>{String.fromCharCode(65 + optionIndex)}</Text>
              <Text style={styles.optionText}>{option}</Text>
            </Pressable>
          );
        })}
      </View>
      {answered ? (
        <View style={styles.feedback}>
          <Text style={selected === quiz.correct ? styles.correctText : styles.incorrectText}>
            {selected === quiz.correct ? '正解！' : '残念、不正解'}
          </Text>
          {quiz.explanation ? <Text style={styles.explanation}>{quiz.explanation}</Text> : null}
          <GoldButton label={index === quizzes.length - 1 ? '結果を見る' : '次の問題へ'} onPress={next} />
        </View>
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  progressRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  progress: { color: colors.gold, fontSize: 12, fontWeight: '800', letterSpacing: 1.2 },
  score: { color: colors.text, fontSize: 13, fontWeight: '700' },
  track: { height: 5, borderRadius: 5, backgroundColor: colors.surfaceSoft, marginTop: 12, overflow: 'hidden' },
  bar: { height: '100%', borderRadius: 5, backgroundColor: colors.gold },
  questionCard: {
    minHeight: 190,
    borderRadius: 22,
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
    padding: 24,
    marginTop: 30,
    justifyContent: 'center',
    ...shadow,
  },
  difficulty: { color: colors.gold, fontSize: 12, fontWeight: '800', marginBottom: 12 },
  question: { color: colors.text, fontSize: 23, fontWeight: '800', lineHeight: 34 },
  options: { marginTop: 22 },
  option: {
    minHeight: 62,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    paddingHorizontal: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  optionPressed: { opacity: 0.7 },
  correct: { backgroundColor: '#163c2a', borderColor: colors.correct },
  incorrect: { backgroundColor: '#431f1f', borderColor: colors.incorrect },
  optionIndex: { color: colors.gold, width: 30, fontSize: 14, fontWeight: '900' },
  optionText: { color: colors.text, flex: 1, fontSize: 15, fontWeight: '600', lineHeight: 22 },
  feedback: { marginTop: 12 },
  correctText: { color: '#63d69b', fontSize: 22, fontWeight: '900' },
  incorrectText: { color: '#ee8181', fontSize: 22, fontWeight: '900' },
  explanation: { color: colors.muted, fontSize: 14, lineHeight: 22, marginTop: 8, marginBottom: 18 },
  centerState: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  stateTitle: { color: colors.text, fontSize: 20, fontWeight: '800', marginTop: 20, textAlign: 'center' },
  stateText: { color: colors.muted, fontSize: 14, marginTop: 10, textAlign: 'center' },
  stateAction: { width: '100%', marginTop: 28 },
  sampleNotice: { color: colors.muted, fontSize: 11, marginTop: 8 },
});
