import { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { useAuth } from '../auth/AuthContext';
import { Screen } from '../components/Screen';
import { loadHistory, type HistoryItem } from '../services/userRepository';
import { colors } from '../theme';

export function HistoryScreen() {
  const { user } = useAuth();
  const [items, setItems] = useState<HistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(Boolean(user));
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    setError('');

    if (!user) {
      setItems([]);
      setIsLoading(false);
      return () => {
        active = false;
      };
    }

    setIsLoading(true);
    loadHistory(user)
      .then((history) => {
        if (active) setItems(history);
      })
      .catch((reason: unknown) => {
        if (active) setError(reason instanceof Error ? reason.message : '履歴を読み込めませんでした。');
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });

    return () => {
      active = false;
    };
  }, [user]);

  return (
    <Screen>
      <Text style={styles.title}>回答履歴</Text>
      {!user ? <Text style={styles.note}>ゲスト利用中は履歴が保存されません。</Text> : null}
      {isLoading ? <ActivityIndicator color={colors.gold} style={styles.loading} /> : null}
      {error ? <Text style={styles.error}>{error}</Text> : null}
      {!isLoading && user && items.length === 0 ? (
        <Text style={styles.note}>まだ回答履歴がありません。クイズに挑戦してみましょう。</Text>
      ) : null}

      {items.map((item) => (
        <View key={item.id} style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.difficulty}>{item.difficulty}</Text>
            <Text style={item.isCorrect ? styles.correct : styles.incorrect}>
              {item.isCorrect ? '正解' : '不正解'}
            </Text>
          </View>
          <Text style={styles.question}>{item.question}</Text>
          <Text style={styles.answer}>あなたの回答: {item.options[item.userAnswer] ?? '-'}</Text>
          <Text style={styles.answer}>正解: {item.options[item.correct] ?? '-'}</Text>
          <Text style={styles.points}>+{item.points}P</Text>
        </View>
      ))}
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: { color: colors.goldLight, fontSize: 30, fontWeight: '900', textAlign: 'center', marginVertical: 20 },
  note: { color: colors.muted, fontSize: 14, lineHeight: 22, textAlign: 'center', marginTop: 12 },
  loading: { marginTop: 28 },
  error: { color: '#ee8181', textAlign: 'center', fontSize: 13, marginTop: 16 },
  card: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  difficulty: { color: colors.gold, fontSize: 12, fontWeight: '800' },
  correct: { color: '#63d69b', fontSize: 12, fontWeight: '800' },
  incorrect: { color: '#ee8181', fontSize: 12, fontWeight: '800' },
  question: { color: colors.text, fontSize: 16, fontWeight: '800', lineHeight: 23, marginBottom: 10 },
  answer: { color: colors.muted, fontSize: 13, lineHeight: 20 },
  points: { color: colors.gold, fontSize: 13, fontWeight: '900', marginTop: 8 },
});
