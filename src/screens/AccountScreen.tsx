import { useState } from 'react';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Alert, StyleSheet, Text, View } from 'react-native';
import { useAuth } from '../auth/AuthContext';
import { GoldButton } from '../components/GoldButton';
import { Screen } from '../components/Screen';
import type { RootStackParamList } from '../navigation';
import { deleteCurrentAccount, logout } from '../services/authService';
import { colors } from '../theme';

type Props = NativeStackScreenProps<RootStackParamList, 'Account'>;

export function AccountScreen({ navigation }: Props) {
  const { user, isGuest, leaveGuestMode } = useAuth();
  const [error, setError] = useState('');

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
                    : '削除に失敗しました。再ログインしてからお試しください。',
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
        <Text style={styles.label}>ログイン状態</Text>
        <Text style={styles.title}>{user ? 'ログイン済み' : 'ゲスト利用中'}</Text>
        <Text style={styles.detail}>
          {user?.email ?? 'この端末内だけでクイズを遊べます。データ引き継ぎにはログインが必要です。'}
        </Text>
      </View>

      <GoldButton
        label={isGuest ? 'ログイン画面へ戻る' : 'ログアウト'}
        variant="dark"
        onPress={() => void signOut()}
      />

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
  deleteWrap: { marginTop: 14 },
  error: { color: '#ee8181', textAlign: 'center', fontSize: 13, lineHeight: 20, marginTop: 18 },
});
