import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { StyleSheet, Text, View } from 'react-native';
import { Screen } from '../components/Screen';
import type { RootStackParamList } from '../navigation';
import { colors } from '../theme';

type Props = NativeStackScreenProps<RootStackParamList, 'Placeholder'>;

export function PlaceholderScreen({ route }: Props) {
  return (
    <Screen>
      <View style={styles.card}>
        <Text style={styles.title}>{route.params.title}</Text>
        <Text style={styles.description}>{route.params.description}</Text>
        <Text style={styles.note}>Web版のFirebaseデータ構造を共用して、この画面を次の実装単位で接続します。</Text>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 22,
    padding: 24,
    marginTop: 30,
  },
  title: { color: colors.goldLight, fontSize: 28, fontWeight: '900' },
  description: { color: colors.text, fontSize: 16, lineHeight: 25, marginTop: 14 },
  note: { color: colors.muted, fontSize: 13, lineHeight: 20, marginTop: 22 },
});
