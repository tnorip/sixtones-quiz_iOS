import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { StyleSheet, Text, View } from 'react-native';
import { GoldButton } from '../components/GoldButton';
import { Screen } from '../components/Screen';
import type { Difficulty } from '../data/quizzes';
import type { RootStackParamList } from '../navigation';
import { examConfigs, type ExamGrade } from '../services/userRepository';
import { colors } from '../theme';

type Props = NativeStackScreenProps<RootStackParamList, 'GameMenu'>;

const levels: Array<{ label: string; difficulty: Difficulty | 'ランダム'; detail: string }> = [
  { label: '初級', difficulty: '初級', detail: 'まずは基本問題から' },
  { label: '中級', difficulty: '中級', detail: 'もっと深く知りたい人へ' },
  { label: '上級', difficulty: '上級', detail: '目指せストQマスター' },
  { label: 'ランダム', difficulty: 'ランダム', detail: '難易度を混ぜて出題' },
];

const grades: ExamGrade[] = ['4級', '3級', '2級', '1級', '特級'];

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
            onPress={() => navigation.navigate('Quiz', { difficulty: level.difficulty, mode: 'free' })}
          />
        </View>
      ))}

      <View style={styles.examCard}>
        <Text style={styles.examTitle}>ストQ検定</Text>
        <Text style={styles.examText}>
          級ごとの合格ラインを突破するチャレンジモード。合格するとプロフィールの最高検定級に反映されます。
        </Text>
      </View>
      {grades.map((grade) => {
        const config = examConfigs[grade];
        return (
          <View key={grade} style={styles.buttonWrap}>
            <GoldButton
              label={`${grade}  ·  ${config.questions}問中${config.passLine}問正解で合格`}
              variant="dark"
              onPress={() => navigation.navigate('Quiz', { grade, mode: 'exam' })}
            />
          </View>
        );
      })}
      <Text style={styles.examNote}>ストーン消費とタイマーは、ストーン機能の実装後に有効化します。</Text>
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
    marginBottom: 14,
    padding: 20,
  },
  examTitle: { color: colors.gold, fontSize: 20, fontWeight: '800' },
  examText: { color: colors.muted, fontSize: 13, lineHeight: 20, marginTop: 8 },
  examNote: { color: colors.muted, fontSize: 11, lineHeight: 18, textAlign: 'center', marginTop: 2 },
});
