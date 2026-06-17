import { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { useAuth } from '../auth/AuthContext';
import { Screen } from '../components/Screen';
import { useUserStats } from '../hooks/useUserStats';
import {
  loadCurrentRanking,
  type RankingEntry,
  type RankingSeason,
} from '../services/userRepository';
import { colors } from '../theme';

export function RankingScreen() {
  const { user } = useAuth();
  const { stats } = useUserStats();
  const [season, setSeason] = useState<RankingSeason | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    setError('');
    setIsLoading(true);

    loadCurrentRanking()
      .then((ranking) => {
        if (active) setSeason(ranking);
      })
      .catch((reason: unknown) => {
        if (active) setError(reason instanceof Error ? reason.message : 'ランキングを読み込めませんでした。');
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const currentUsername = user ? stats.username : '';
  const entries = season?.data ?? [];

  return (
    <Screen>
      <View style={styles.header}>
        <Text style={styles.label}>MONTHLY RANKING</Text>
        <Text style={styles.title}>第{season?.seasonNumber ?? '-'}シーズン</Text>
        <Text style={styles.note}>毎月月末にリセットされます</Text>
      </View>

      {isLoading ? <ActivityIndicator color={colors.gold} style={styles.loading} /> : null}
      {error ? <Text style={styles.error}>{error}</Text> : null}
      {!isLoading && entries.length === 0 ? (
        <Text style={styles.empty}>まだランキングがありません。最初の挑戦者になりましょう。</Text>
      ) : null}

      {entries.map((entry, index) => (
        <RankingRow
          key={`${entry.username}-${index}`}
          entry={entry}
          position={index + 1}
          isCurrentUser={entry.username === currentUsername}
        />
      ))}
    </Screen>
  );
}

function RankingRow({
  entry,
  position,
  isCurrentUser,
}: {
  entry: RankingEntry;
  position: number;
  isCurrentUser: boolean;
}) {
  const medal = position === 1 ? '1位' : position === 2 ? '2位' : position === 3 ? '3位' : `${position}位`;

  return (
    <View style={[styles.row, isCurrentUser && styles.currentRow]}>
      <View style={styles.left}>
        <Text style={[styles.position, position <= 3 && styles.medal]}>{medal}</Text>
        <View style={styles.userInfo}>
          <Text style={styles.username}>
            {entry.username}
            {isCurrentUser ? '（あなた）' : ''}
          </Text>
          <Text style={styles.rank}>{entry.rank || 'ランク未設定'}</Text>
        </View>
      </View>
      <View style={styles.right}>
        <Text style={styles.points}>{entry.points}P</Text>
        {entry.grade && entry.grade !== '-' ? <Text style={styles.grade}>{entry.grade}</Text> : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: { alignItems: 'center', marginTop: 16, marginBottom: 20 },
  label: { color: colors.gold, fontSize: 12, fontWeight: '800', letterSpacing: 3 },
  title: { color: colors.goldLight, fontSize: 30, fontWeight: '900', marginTop: 8 },
  note: { color: colors.muted, fontSize: 12, marginTop: 6 },
  loading: { marginTop: 28 },
  error: { color: '#ee8181', textAlign: 'center', fontSize: 13, marginTop: 16 },
  empty: { color: colors.muted, textAlign: 'center', fontSize: 14, lineHeight: 22, marginTop: 24 },
  row: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 16,
    padding: 15,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  currentRow: { borderColor: colors.gold, backgroundColor: '#211c11' },
  left: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  position: { color: colors.text, fontSize: 16, fontWeight: '900', width: 44 },
  medal: { color: colors.goldLight },
  userInfo: { flex: 1 },
  username: { color: colors.text, fontSize: 15, fontWeight: '800' },
  rank: { color: colors.muted, fontSize: 11, marginTop: 4 },
  right: { alignItems: 'flex-end', marginLeft: 12 },
  points: { color: colors.gold, fontSize: 17, fontWeight: '900' },
  grade: { color: colors.muted, fontSize: 11, marginTop: 4 },
});
