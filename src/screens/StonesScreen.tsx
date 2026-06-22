import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useAuth } from '../auth/AuthContext';
import { GoldButton } from '../components/GoldButton';
import { Screen } from '../components/Screen';
import { useUserStats } from '../hooks/useUserStats';
import type { RootStackParamList } from '../navigation';
import { expandHistoryLimit, type UserStats } from '../services/userRepository';
import { colors } from '../theme';

type Props = NativeStackScreenProps<RootStackParamList, 'Stones'>;

export function StonesScreen({ navigation }: Props) {
  const { user } = useAuth();
  const { stats, isLoading } = useUserStats();
  const [currentStats, setCurrentStats] = useState<UserStats>(stats);
  const [error, setError] = useState('');
  const [isExpanding, setIsExpanding] = useState(false);

  useEffect(() => {
    setCurrentStats(stats);
  }, [stats]);

  const canExpand = Boolean(user && currentStats.stones >= 5 && currentStats.historyLimit < 100);

  const expand = async () => {
    if (!user) {
      navigation.navigate('Account');
      return;
    }

    setError('');
    setIsExpanding(true);
    try {
      const nextStats = await expandHistoryLimit(user);
      setCurrentStats(nextStats);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : '履歴表示件数の拡張に失敗しました。');
    } finally {
      setIsExpanding(false);
    }
  };

  return (
    <Screen>
      <View style={styles.hero}>
        <Text style={styles.label}>STONES</Text>
        <Text style={styles.stones}>{currentStats.stones} 個</Text>
        <Text style={styles.note}>
          ストーンは検定への挑戦や便利機能の拡張に使えます。ログインすると毎日1個もらえます。
        </Text>
      </View>

      {isLoading ? <Text style={styles.loading}>ストーン情報を読み込んでいます...</Text> : null}
      {error ? <Text style={styles.error}>{error}</Text> : null}

      <View style={styles.card}>
        <Text style={styles.cardTitle}>毎日ログインボーナス</Text>
        <Text style={styles.cardText}>
          今日のログインボーナスは自動で反映されます。最終受取日: {currentStats.loginBonusDate ?? '未受取'}
        </Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>履歴表示件数を拡張</Text>
        <Text style={styles.cardText}>
          現在の履歴表示件数: {currentStats.historyLimit}件。ストーン5個で+5件、最大100件まで拡張できます。
        </Text>
        <View style={styles.buttonWrap}>
          <GoldButton
            label={
              currentStats.historyLimit >= 100
                ? '上限に達しています'
                : user
                  ? 'ストーン5個で+5件拡張'
                  : 'ログインして拡張する'
            }
            variant="dark"
            disabled={Boolean(user && (!canExpand || isExpanding))}
            onPress={() => void expand()}
          />
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>クイズ提案ボーナス</Text>
        <Text style={styles.cardText}>
          投稿したクイズが採用されるとストーン3個を獲得できます。採用可否は運営が確認します。
        </Text>
        <View style={styles.buttonWrap}>
          <GoldButton
            label={user ? 'クイズを提案する' : 'ログインして提案する'}
            variant="dark"
            onPress={() => navigation.navigate(user ? 'Proposal' : 'Account')}
          />
        </View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  hero: { alignItems: 'center', marginTop: 22, marginBottom: 24 },
  label: { color: colors.gold, fontSize: 12, fontWeight: '800', letterSpacing: 3 },
  stones: { color: colors.goldLight, fontSize: 54, fontWeight: '900', marginTop: 8 },
  note: { color: colors.muted, fontSize: 13, lineHeight: 20, textAlign: 'center', marginTop: 12 },
  loading: { color: colors.muted, textAlign: 'center', fontSize: 13, marginBottom: 12 },
  error: { color: '#ee8181', textAlign: 'center', fontSize: 13, lineHeight: 20, marginBottom: 12 },
  card: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 18,
    padding: 18,
    marginBottom: 14,
  },
  cardTitle: { color: colors.goldLight, fontSize: 18, fontWeight: '800' },
  cardText: { color: colors.muted, fontSize: 13, lineHeight: 20, marginTop: 8 },
  buttonWrap: { marginTop: 16 },
});
