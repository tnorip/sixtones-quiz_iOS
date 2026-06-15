import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { StyleSheet, Text, View } from 'react-native';
import { GoldButton } from '../components/GoldButton';
import { Screen } from '../components/Screen';
import type { RootStackParamList } from '../navigation';
import { colors, shadow } from '../theme';

type Props = NativeStackScreenProps<RootStackParamList, 'Result'>;

export function ResultScreen({ navigation, route }: Props) {
  const { score, total } = route.params;
  const rate = score / total;
  const message = rate === 1 ? 'PERFECT!' : rate >= 0.6 ? 'GREAT!' : 'NICE TRY!';

  return (
    <Screen>
      <View style={styles.hero}>
        <Text style={styles.label}>YOUR RESULT</Text>
        <Text style={styles.message}>{message}</Text>
      </View>
      <View style={styles.scoreCard}>
        <Text style={styles.score}>{score}</Text>
        <Text style={styles.total}>/ {total}</Text>
        <Text style={styles.rate}>正解率 {Math.round(rate * 100)}%</Text>
      </View>
      <Text style={styles.caption}>獲得ポイントや履歴保存はFirebase接続後に反映されます。</Text>
      <View style={styles.actions}>
        <GoldButton label="もう一度挑戦" onPress={() => navigation.replace('GameMenu')} />
        <View style={styles.secondary}>
          <GoldButton label="ホームへ戻る" variant="dark" onPress={() => navigation.popToTop()} />
        </View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  hero: { alignItems: 'center', marginTop: 34 },
  label: { color: colors.gold, fontSize: 12, fontWeight: '800', letterSpacing: 3 },
  message: { color: colors.goldLight, fontSize: 42, fontWeight: '900', marginTop: 8 },
  scoreCard: {
    minHeight: 230,
    borderRadius: 28,
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
    marginTop: 32,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadow,
  },
  score: { color: colors.goldLight, fontSize: 84, fontWeight: '900', lineHeight: 90 },
  total: { color: colors.muted, fontSize: 22, fontWeight: '700' },
  rate: { color: colors.text, fontSize: 16, fontWeight: '700', marginTop: 16 },
  caption: { color: colors.muted, textAlign: 'center', fontSize: 12, lineHeight: 18, marginTop: 20 },
  actions: { marginTop: 30 },
  secondary: { marginTop: 14 },
});
