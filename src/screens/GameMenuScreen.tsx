import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { StyleSheet, Text, View } from 'react-native';
import { GoldButton } from '../components/GoldButton';
import { Screen } from '../components/Screen';
import type { Difficulty } from '../data/quizzes';
import type { RootStackParamList } from '../navigation';
import { colors } from '../theme';

type Props = NativeStackScreenProps<RootStackParamList, 'GameMenu'>;

const levels: Array<{ label: string; difficulty: Difficulty | 'ランダム'; detail: string }> = [
  { label: '初級', difficulty: '初級', detail: 'まずは基本問題から' },
  { label: '中級', difficulty: '中級', detail: 'もっと深く知りたい人へ' },
  { label: '上級', difficulty: '上級', detail: '目指せストQマスター' },
  { label: 'ランダム', difficulty: 'ランダム', detail: '難易度を混ぜて出題' },
];

export function GameMenuScreen({ navigation }: Props) {
  return (
    <Screen>
      <View style={styles.intro}>
        <Text style={styles.title}>フリープレイ</Text>
        <Text style={styles.description}>難易度を選んで5問に挑戦。正解するとポイントを獲得できます。</Text>
      </View>
      {levels.map((level, index) => (
        <View key={level.label} style={styles.buttonWrap}>
          <GoldButton
            label={`${level.label}  ·  ${level.detail}`}
            variant={index === 0 ? 'gold' : 'dark'}
            onPress={() => navigation.navigate('Quiz', { difficulty: level.difficulty })}
          />
        </View>
      ))}
      <View style={styles.examCard}>
        <Text style={styles.examTitle}>ストQ検定</Text>
        <Text style={styles.examText}>級ごとの合格ラインを突破するチャレンジモード。次の実装フェーズで接続します。</Text>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  intro: { alignItems: 'center', marginTop: 24, marginBottom: 30 },
  title: { color: colors.goldLight, fontSize: 30, fontWeight: '900' },
  description: { color: colors.muted, fontSize: 14, lineHeight: 22, textAlign: 'center', marginTop: 10 },
  buttonWrap: { marginBottom: 14 },
  examCard: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 18,
    marginTop: 18,
    padding: 20,
  },
  examTitle: { color: colors.gold, fontSize: 20, fontWeight: '800' },
  examText: { color: colors.muted, fontSize: 13, lineHeight: 20, marginTop: 8 },
});
