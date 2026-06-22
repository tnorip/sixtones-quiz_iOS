import { useState } from 'react';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Alert, Linking, Pressable, StyleSheet, Text, View } from 'react-native';
import { useAuth } from '../auth/AuthContext';
import { GoldButton } from '../components/GoldButton';
import { Screen } from '../components/Screen';
import type { RootStackParamList } from '../navigation';
import { deleteCurrentAccount, logout } from '../services/authService';
import { colors } from '../theme';

type Props = NativeStackScreenProps<RootStackParamList, 'Account'>;

const externalLinks = [
  { label: 'プライバシーポリシー', url: 'https://st-fanquiz.web.app/privacy.html' },
  { label: '利用規約', url: 'https://st-fanquiz.web.app/terms.html' },
  { label: '公式Web版を開く', url: 'https://st-fanquiz.web.app/' },
];

export function AccountScreen({ navigation }: Props) {
  const { user, isGuest, leaveGuestMode } = useAuth();
  const [error, setError] = useState('');

  const openExternalLink = async (url: string) => {
    setError('');
    try {
      const canOpen = await Linking.canOpenURL(url);
      if (!canOpen) {
        setError('リンクを開けませんでした。');
        return;
      }
      await Linking.openURL(url);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'リンクを開けませんでした。');
    }
  };

  const signOut = async () => {
    setError('');
    try {
      if (isGuest) {
        await leaveGuestMode();
      } else {
        await logout();
      }
      navigation.popToTop();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'ログアウトに失敗しました。');
    }
  };

  const confirmDelete = () => {
    Alert.alert(
      'アカウントを削除しますか？',
      'プロフィール、回答履歴、投稿・報告データを削除します。この操作は取り消せません。',
      [
        { text: 'キャンセル', style: 'cancel' },
        {
          text: '削除する',
          style: 'destructive',
          onPress: () => {
            void deleteCurrentAccount()
              .then(() => navigation.popToTop())
              .catch((reason: unknown) => {
                setError(
                  reason instanceof Error
                    ? reason.message
                    : '削除に失敗しました。再ログインしてからもう一度お試しください。',
                );
              });
          },
        },
      ],
    );
  };

  return (
    <Screen>
      <View style={styles.card}>
        <Text style={styles.label}>ACCOUNT</Text>
        <Text style={styles.title}>{user ? 'ログイン済み' : 'ゲスト利用中'}</Text>
        <Text style={styles.detail}>
          {user?.email ?? 'この端末内だけでクイズを遊べます。データを引き継ぐにはログインが必要です。'}
        </Text>
      </View>

      <GoldButton
        label={isGuest ? 'ログイン画面へ戻る' : 'ログアウト'}
        variant="dark"
        onPress={() => void signOut()}
      />

      <View style={styles.supportCard}>
        <Text style={styles.supportTitle}>サポート</Text>
        <Text style={styles.supportText}>
          ルールやデータの取り扱いは以下から確認できます。クイズ内容の誤りは、回答後の「間違いを報告する」から送信してください。
        </Text>
        {externalLinks.map((item) => (
          <Pressable key={item.url} onPress={() => void openExternalLink(item.url)} style={styles.linkRow}>
            <Text style={styles.linkText}>{item.label}</Text>
            <Text style={styles.linkArrow}>開く</Text>
          </Pressable>
        ))}
      </View>

      {user ? (
        <View style={styles.deleteWrap}>
          <GoldButton label="アカウントを削除" variant="dark" onPress={confirmDelete} />
        </View>
      ) : null}
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 20,
    padding: 22,
    marginTop: 24,
    marginBottom: 24,
  },
  label: { color: colors.gold, fontSize: 11, fontWeight: '800', letterSpacing: 1.5 },
  title: { color: colors.text, fontSize: 24, fontWeight: '900', marginTop: 8 },
  detail: { color: colors.muted, fontSize: 13, lineHeight: 20, marginTop: 10 },
  supportCard: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 20,
    padding: 18,
    marginTop: 18,
  },
  supportTitle: { color: colors.goldLight, fontSize: 18, fontWeight: '800' },
  supportText: { color: colors.muted, fontSize: 13, lineHeight: 20, marginTop: 8, marginBottom: 8 },
  linkRow: {
    minHeight: 48,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  linkText: { color: colors.text, fontSize: 14, fontWeight: '700' },
  linkArrow: { color: colors.gold, fontSize: 12, fontWeight: '800' },
  deleteWrap: { marginTop: 14 },
  error: { color: '#ee8181', textAlign: 'center', fontSize: 13, lineHeight: 20, marginTop: 18 },
});
