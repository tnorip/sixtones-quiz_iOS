import { useState } from 'react';
import * as AppleAuthentication from 'expo-apple-authentication';
import { ActivityIndicator, Linking, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { useAuth } from '../auth/AuthContext';
import { GoldButton } from '../components/GoldButton';
import { Screen } from '../components/Screen';
import { signInWithApple, signInWithGoogle } from '../services/authService';
import { colors } from '../theme';

export function LoginScreen() {
  const { continueAsGuest } = useAuth();
  const [isBusy, setIsBusy] = useState(false);
  const [error, setError] = useState('');

  const run = async (action: () => Promise<void>) => {
    setError('');
    setIsBusy(true);
    try {
      await action();
    } catch (reason) {
      const message = reason instanceof Error ? reason.message : 'ログインに失敗しました。';
      const code = typeof reason === 'object' && reason !== null && 'code' in reason ? String(reason.code) : '';
      if (code !== 'ERR_REQUEST_CANCELED') setError(message);
    } finally {
      setIsBusy(false);
    }
  };

  const openLink = async (url: string) => {
    try {
      await Linking.openURL(url);
    } catch {
      setError('リンクを開けませんでした。');
    }
  };

  return (
    <Screen>
      <View style={styles.hero}>
        <Text style={styles.eyebrow}>SixTONES QUIZ</Text>
        <Text style={styles.logo}>ストQ</Text>
        <Text style={styles.description}>
          ログインすると、Web・iOS・Androidでポイントや履歴を引き継げます。
        </Text>
      </View>

      <View style={styles.actions}>
        <GoldButton label="Googleでログイン" onPress={() => void run(signInWithGoogle)} disabled={isBusy} />

        {Platform.OS === 'ios' ? (
          <View style={styles.appleWrap}>
            <AppleAuthentication.AppleAuthenticationButton
              buttonType={AppleAuthentication.AppleAuthenticationButtonType.SIGN_IN}
              buttonStyle={AppleAuthentication.AppleAuthenticationButtonStyle.WHITE}
              cornerRadius={14}
              style={styles.appleButton}
              onPress={() => void run(signInWithApple)}
            />
          </View>
        ) : null}

        {isBusy ? <ActivityIndicator color={colors.gold} style={styles.indicator} /> : null}
        {error ? <Text style={styles.error}>{error}</Text> : null}
      </View>

      <View style={styles.dividerRow}>
        <View style={styles.divider} />
        <Text style={styles.dividerText}>または</Text>
        <View style={styles.divider} />
      </View>

      <GoldButton
        label="ログインせずに遊ぶ"
        variant="dark"
        disabled={isBusy}
        onPress={() => void continueAsGuest()}
      />
      <Text style={styles.guestNote}>
        ゲスト利用では端末変更時にポイントや履歴を引き継げません。あとからログインできます。
      </Text>

      <View style={styles.linkRow}>
        <Pressable accessibilityRole="link" onPress={() => void openLink('https://st-fanquiz.web.app/privacy.html')}>
          <Text style={styles.policy}>プライバシーポリシー</Text>
        </Pressable>
        <Text style={styles.linkSeparator}> / </Text>
        <Pressable accessibilityRole="link" onPress={() => void openLink('https://st-fanquiz.web.app/terms.html')}>
          <Text style={styles.policy}>利用規約</Text>
        </Pressable>
      </View>
      <Text style={styles.disclaimer}>このアプリは非公式のファン向けクイズアプリです。</Text>
    </Screen>
  );
}

const styles = StyleSheet.create({
  hero: { alignItems: 'center', paddingTop: 40, paddingBottom: 36 },
  eyebrow: { color: colors.gold, fontSize: 12, fontWeight: '800', letterSpacing: 4 },
  logo: { color: colors.goldLight, fontSize: 64, fontWeight: '900', letterSpacing: 4, marginTop: 4 },
  description: { color: colors.muted, fontSize: 14, lineHeight: 22, textAlign: 'center', marginTop: 16 },
  actions: { width: '100%' },
  appleWrap: { marginTop: 14 },
  appleButton: { width: '100%', height: 58 },
  indicator: { marginTop: 18 },
  error: { color: '#ee8181', fontSize: 13, lineHeight: 20, textAlign: 'center', marginTop: 16 },
  dividerRow: { flexDirection: 'row', alignItems: 'center', marginVertical: 24 },
  divider: { flex: 1, height: 1, backgroundColor: colors.border },
  dividerText: { color: colors.muted, fontSize: 12, marginHorizontal: 14 },
  guestNote: { color: colors.muted, fontSize: 11, lineHeight: 18, textAlign: 'center', marginTop: 14 },
  linkRow: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 36 },
  policy: { color: colors.gold, fontSize: 12, fontWeight: '700', textAlign: 'center' },
  linkSeparator: { color: colors.muted, fontSize: 12 },
  disclaimer: { color: '#777269', fontSize: 10, textAlign: 'center', marginTop: 12 },
});
