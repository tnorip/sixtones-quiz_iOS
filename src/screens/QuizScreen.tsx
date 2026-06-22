import { useEffect, useMemo, useState } from 'react';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import * as Haptics from 'expo-haptics';
import { ActivityIndicator, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { useAuth } from '../auth/AuthContext';
import { GoldButton } from '../components/GoldButton';
import { Screen } from '../components/Screen';
import { sampleQuizzes, type Quiz } from '../data/quizzes';
import type { RootStackParamList } from '../navigation';
import { loadQuizzes } from '../services/quizRepository';
import { examConfigs, saveQuizRun, submitQuizReport, type QuizAnswerResult } from '../services/userRepository';
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
  const { user } = useAuth();
  const mode = route.params.mode ?? 'free';
  const examGrade = mode === 'exam' && 'grade' in route.params ? route.params.grade : undefined;
  const examConfig = examGrade ? examConfigs[examGrade] : null;
  const [allQuizzes, setAllQuizzes] = useState<Quiz[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
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
    if (mode === 'exam' && examConfig) {
      const filtered = allQuizzes.filter((quiz) => examConfig.difficulties.includes(quiz.difficulty));
      return shuffle(filtered.length ? filtered : allQuizzes).slice(0, examConfig.questions).map(randomizeOptions);
    }

    const difficulty = 'difficulty' in route.params ? route.params.difficulty : 'ランダム';
    const filtered =
      difficulty === 'ランダム'
        ? allQuizzes
        : allQuizzes.filter((quiz) => quiz.difficulty === difficulty);
    return shuffle(filtered.length ? filtered : allQuizzes).slice(0, 5).map(randomizeOptions);
  }, [allQuizzes, examConfig, mode, route.params]);

  const [index, setIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [results, setResults] = useState<QuizAnswerResult[]>([]);
  const [reportVisible, setReportVisible] = useState(false);
  const [reportDetail, setReportDetail] = useState('');
  const [reportError, setReportError] = useState('');
  const [reportMessage, setReportMessage] = useState('');
  const [isReporting, setIsReporting] = useState(false);
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
    const isCorrect = optionIndex === quiz.correct;
    setResults((value) => [...value, { question: quiz, userAnswer: optionIndex, isCorrect }]);
    if (isCorrect) {
      setScore((value) => value + 1);
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } else {
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
  };

  const resetReportState = () => {
    setReportVisible(false);
    setReportDetail('');
    setReportError('');
    setReportMessage('');
    setIsReporting(false);
  };

  const reportQuestion = async () => {
    if (!user) {
      navigation.navigate('Account');
      return;
    }

    const detail = reportDetail.trim();
    setReportError('');
    setReportMessage('');

    if (!detail) {
      setReportError('間違いの内容を入力してください。');
      return;
    }

    setIsReporting(true);
    try {
      await submitQuizReport(user, { question: quiz, detail });
      setReportDetail('');
      setReportVisible(false);
      setReportMessage('報告を送信しました。確認いたします。');
    } catch (error) {
      setReportError(error instanceof Error ? error.message : '報告の送信に失敗しました。もう一度お試しください。');
    } finally {
      setIsReporting(false);
    }
  };

  const next = async () => {
    if (index === quizzes.length - 1) {
      const finalScore = results.filter((result) => result.isCorrect).length;
      const passed = mode === 'exam' && examConfig ? finalScore >= examConfig.passLine : undefined;
      let earnedPoints = 0;
      let saved = false;
      if (user && !usingSampleData) {
        setIsSaving(true);
        try {
          earnedPoints = await saveQuizRun(user, results, {
            mode,
            grade: examGrade,
            passed,
          });
          saved = true;
        } catch (error) {
          console.warn('Failed to save quiz result.', error);
        } finally {
          setIsSaving(false);
        }
      }
      navigation.replace('Result', {
        score: finalScore,
        total: quizzes.length,
        earnedPoints,
        saved,
        mode,
        grade: examGrade,
        passed,
        passLine: examConfig?.passLine,
      });
      return;
    }
    setIndex((value) => value + 1);
    setSelected(null);
    resetReportState();
  };

  return (
    <Screen>
      <View style={styles.progressRow}>
        <Text style={styles.progress}>QUESTION {index + 1} / {quizzes.length}</Text>
        <Text style={styles.score}>{examGrade ?? `正解 ${score}`}</Text>
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
          <View style={styles.reportCard}>
            <Pressable onPress={() => setReportVisible((value) => !value)} style={styles.reportToggle}>
              <Text style={styles.reportToggleText}>間違いを報告する</Text>
            </Pressable>
            {reportVisible ? (
              <View style={styles.reportForm}>
                <TextInput
                  value={reportDetail}
                  onChangeText={setReportDetail}
                  placeholder="例: 正解が違う、選択肢に誤字がある"
                  placeholderTextColor="#777269"
                  maxLength={300}
                  multiline
                  style={styles.reportInput}
                />
                <GoldButton
                  label={isReporting ? '送信中...' : user ? '報告を送信する' : 'ログインして報告する'}
                  variant="dark"
                  disabled={isReporting}
                  onPress={() => void reportQuestion()}
                />
              </View>
            ) : null}
            {reportError ? <Text style={styles.reportError}>{reportError}</Text> : null}
            {reportMessage ? <Text style={styles.reportMessage}>{reportMessage}</Text> : null}
          </View>
          <GoldButton
            label={index === quizzes.length - 1 ? (isSaving ? '保存中...' : '結果を見る') : '次の問題へ'}
            disabled={isSaving}
            onPress={() => void next()}
          />
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
  reportCard: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 16,
    backgroundColor: colors.surface,
    padding: 14,
    marginBottom: 18,
  },
  reportToggle: { alignItems: 'center', paddingVertical: 4 },
  reportToggleText: { color: colors.gold, fontSize: 13, fontWeight: '800' },
  reportForm: { marginTop: 12 },
  reportInput: {
    minHeight: 90,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surfaceSoft,
    color: colors.text,
    fontSize: 14,
    lineHeight: 20,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 12,
    textAlignVertical: 'top',
  },
  reportError: { color: '#ee8181', textAlign: 'center', fontSize: 12, lineHeight: 18, marginTop: 10 },
  reportMessage: { color: colors.goldLight, textAlign: 'center', fontSize: 12, lineHeight: 18, marginTop: 10 },
  centerState: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  stateTitle: { color: colors.text, fontSize: 20, fontWeight: '800', marginTop: 20, textAlign: 'center' },
  stateText: { color: colors.muted, fontSize: 14, marginTop: 10, textAlign: 'center' },
  stateAction: { width: '100%', marginTop: 28 },
  sampleNotice: { color: colors.muted, fontSize: 11, marginTop: 8 },
});
