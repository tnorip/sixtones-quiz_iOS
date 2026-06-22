import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { StyleSheet, Text, View } from 'react-native';
import { GoldButton } from '../components/GoldButton';
import { Screen } from '../components/Screen';
import type { RootStackParamList } from '../navigation';
import { colors } from '../theme';

type Props = NativeStackScreenProps<RootStackParamList, 'Help'>;

const sections = [
  {
    title: 'フリープレイ',
    body: '難易度を選んで5問に挑戦します。正解すると難易度に応じてポイントを獲得できます。',
  },
  {
    title: '検定モード',
    body: '4級から特級までの合格ラインに挑戦します。ログイン中は開始時にストーンを消費し、合格すると最高検定級に反映されます。',
  },
  {
    title: 'ストーン',
    body: 'ログインすると1日1個もらえます。検定への挑戦や履歴表示件数の拡張に使えます。',
  },
  {
    title: 'クイズ提案と報告',
    body: '新しいクイズを提案できます。採用されるとストーン3個を獲得できます。回答後は問題の間違い報告も送信できます。',
  },
  {
    title: 'データ保存',
    body: 'ログインするとポイント、履歴、ランキング、ストーンなどが保存されます。ゲスト利用では端末をまたいだ引き継ぎはできません。',
  },
];

export function HelpScreen({ navigation }: Props) {
  return (
    <Screen>
      <View style={styles.hero}>
        <Text style={styles.label}>HOW TO PLAY</Text>
        <Text style={styles.title}>遊び方</Text>
        <Text style={styles.note}>ストQはSixTONESに関するクイズを遊びながら、ポイントや検定級を集めるアプリです。</Text>
      </View>

      {sections.map((section, index) => (
        <View key={section.title} style={styles.card}>
          <Text style={styles.number}>{String(index + 1).padStart(2, '0')}</Text>
          <View style={styles.cardBody}>
            <Text style={styles.cardTitle}>{section.title}</Text>
            <Text style={styles.cardText}>{section.body}</Text>
          </View>
        </View>
      ))}

      <View style={styles.actions}>
        <GoldButton label="クイズに挑戦する" onPress={() => navigation.navigate('GameMenu')} />
        <View style={styles.secondary}>
          <GoldButton label="ホームへ戻る" variant="dark" onPress={() => navigation.popToTop()} />
        </View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  hero: { alignItems: 'center', marginTop: 22, marginBottom: 22 },
  label: { color: colors.gold, fontSize: 12, fontWeight: '800', letterSpacing: 3 },
  title: { color: colors.goldLight, fontSize: 36, fontWeight: '900', marginTop: 8 },
  note: { color: colors.muted, fontSize: 13, lineHeight: 20, textAlign: 'center', marginTop: 12 },
  card: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 18,
    padding: 18,
    marginBottom: 14,
  },
  number: { color: colors.gold, fontSize: 13, fontWeight: '900', width: 34, letterSpacing: 1 },
  cardBody: { flex: 1 },
  cardTitle: { color: colors.goldLight, fontSize: 18, fontWeight: '800' },
  cardText: { color: colors.muted, fontSize: 13, lineHeight: 20, marginTop: 8 },
  actions: { marginTop: 10 },
  secondary: { marginTop: 14 },
});
