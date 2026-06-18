import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { StyleSheet, Text, View } from 'react-native';
import { useAuth } from '../auth/AuthContext';
import { GoldButton } from '../components/GoldButton';
import { Screen } from '../components/Screen';
import { useUserStats } from '../hooks/useUserStats';
import type { RootStackParamList } from '../navigation';
import { colors } from '../theme';

type Props = NativeStackScreenProps<RootStackParamList, 'Profile'>;

export function ProfileScreen({ navigation }: Props) {
  const { user } = useAuth();
  const { stats, isLoading, error } = useUserStats();
  const correctRate = stats.totalCount > 0 ? ((stats.correctCount / stats.totalCount) * 100).toFixed(1) : '0.0';

  return (
    <Screen>
      <View style={styles.header}>
        <Text style={styles.label}>PROFILE</Text>
        <Text style={styles.name}>{stats.username}</Text>
        <Text style={styles.status}>{user ? 'ログイン済み' : 'ゲスト利用中'}</Text>
      </View>

      {error ? <Text style={styles.error}>{error}</Text> : null}
      {isLoading ? <Text style={styles.loading}>プロフィールを読み込んでいます...</Text> : null}

      <View style={styles.grid}>
        <StatCard label="累計ポイント" value={`${stats.points}P`} />
        <StatCard label="今シーズン" value={`${stats.seasonPoints}P`} />
        <StatCard label="ランク" value={stats.rank} />
        <StatCard label="ストーン" value={`${stats.stones}個`} />
        <StatCard label="正解率" value={`${correctRate}%`} />
        <StatCard label="回答数" value={`${stats.totalCount}問`} />
        <StatCard label="履歴表示" value={`${stats.historyLimit}件`} />
        <StatCard label="最高検定級" value={stats.grade} />
      </View>

      {!user ? (
        <View style={styles.guestCard}>
          <Text style={styles.guestTitle}>ログインするとデータを保存できます</Text>
          <Text style={styles.guestText}>
            Googleログインを使うと、Web・iOS・Androidでポイントや履歴を引き継げます。
          </Text>
          <GoldButton label="アカウント設定へ" variant="dark" onPress={() => navigation.navigate('Account')} />
        </View>
      ) : null}
    </Screen>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.statCard}>
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={styles.statValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  header: { alignItems: 'center', marginTop: 16, marginBottom: 22 },
  label: { color: colors.gold, fontSize: 12, fontWeight: '800', letterSpacing: 3 },
  name: { color: colors.goldLight, fontSize: 30, fontWeight: '900', marginTop: 8 },
  status: { color: colors.muted, fontSize: 12, marginTop: 6 },
  error: { color: '#ee8181', textAlign: 'center', fontSize: 13, marginBottom: 12 },
  loading: { color: colors.muted, textAlign: 'center', fontSize: 13, marginBottom: 12 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  statCard: {
    width: '48%',
    minHeight: 104,
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
    justifyContent: 'center',
  },
  statLabel: { color: colors.muted, fontSize: 11, fontWeight: '700' },
  statValue: { color: colors.text, fontSize: 20, fontWeight: '900', marginTop: 8 },
  guestCard: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 18,
    padding: 18,
    marginTop: 18,
  },
  guestTitle: { color: colors.goldLight, fontSize: 17, fontWeight: '800' },
  guestText: { color: colors.muted, fontSize: 13, lineHeight: 20, marginTop: 8, marginBottom: 16 },
});
