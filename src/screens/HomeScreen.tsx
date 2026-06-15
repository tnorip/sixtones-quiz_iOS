import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { GoldButton } from '../components/GoldButton';
import { Screen } from '../components/Screen';
import type { RootStackParamList } from '../navigation';
import { colors, shadow } from '../theme';

type Props = NativeStackScreenProps<RootStackParamList, 'Home'>;

const menuItems = [
  ['プロフィール', 'ポイントや称号を確認'],
  ['履歴', 'これまでの回答を確認'],
  ['ランキング', '全国のファンと競う'],
  ['ストーン', '所持ストーンを確認'],
] as const;

export function HomeScreen({ navigation }: Props) {
  return (
    <Screen>
      <View style={styles.hero}>
        <Text style={styles.eyebrow}>SixTONES QUIZ</Text>
        <Text style={styles.logo}>ストQ</Text>
        <Text style={styles.tagline}>知れば知るほど、もっと好きになる。</Text>
      </View>

      <View style={styles.userCard}>
        <View>
          <Text style={styles.welcome}>ようこそ</Text>
          <Text style={styles.username}>ゲスト リスナー</Text>
        </View>
        <View style={styles.points}>
          <Text style={styles.pointsLabel}>POINT</Text>
          <Text style={styles.pointsValue}>0 P</Text>
        </View>
      </View>

      <GoldButton label="クイズに挑戦" onPress={() => navigation.navigate('GameMenu')} />

      <View style={styles.grid}>
        {menuItems.map(([title, description]) => (
          <Pressable
            key={title}
            onPress={() => navigation.navigate('Placeholder', { title, description })}
            style={({ pressed }) => [styles.menuCard, pressed && styles.pressed]}
          >
            <Text style={styles.menuTitle}>{title}</Text>
            <Text style={styles.menuDescription}>{description}</Text>
          </Pressable>
        ))}
      </View>

      <Pressable
        onPress={() =>
          navigation.navigate('Placeholder', {
            title: '遊び方',
            description: 'フリープレイや検定モードのルールを掲載する画面です。',
          })
        }
      >
        <Text style={styles.help}>遊び方を見る</Text>
      </Pressable>
      <Text style={styles.disclaimer}>このアプリは非公式のファン向けクイズアプリです。</Text>
    </Screen>
  );
}

const styles = StyleSheet.create({
  hero: { alignItems: 'center', paddingTop: 18, paddingBottom: 28 },
  eyebrow: { color: colors.gold, fontSize: 12, fontWeight: '800', letterSpacing: 4 },
  logo: { color: colors.goldLight, fontSize: 58, fontWeight: '900', letterSpacing: 4, marginTop: 4 },
  tagline: { color: colors.muted, fontSize: 13, marginTop: 4 },
  userCard: {
    minHeight: 86,
    borderRadius: 18,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 18,
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    ...shadow,
  },
  welcome: { color: colors.muted, fontSize: 12 },
  username: { color: colors.text, fontSize: 18, fontWeight: '800', marginTop: 4 },
  points: { alignItems: 'flex-end' },
  pointsLabel: { color: colors.gold, fontSize: 10, fontWeight: '800', letterSpacing: 1.5 },
  pointsValue: { color: colors.goldLight, fontSize: 20, fontWeight: '900', marginTop: 2 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginTop: 20 },
  menuCard: {
    width: '48%',
    minHeight: 116,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
  },
  pressed: { opacity: 0.72 },
  menuTitle: { color: colors.goldLight, fontSize: 17, fontWeight: '800' },
  menuDescription: { color: colors.muted, fontSize: 12, lineHeight: 18, marginTop: 8 },
  help: { color: colors.gold, textAlign: 'center', fontSize: 14, fontWeight: '700', marginTop: 8, padding: 12 },
  disclaimer: { color: '#777269', textAlign: 'center', fontSize: 10, marginTop: 8 },
});
