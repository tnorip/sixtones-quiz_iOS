import type { ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, shadow } from '../theme';

type Props = {
  label: string;
  onPress: () => void;
  icon?: ReactNode;
  variant?: 'gold' | 'dark';
  disabled?: boolean;
};

export function GoldButton({ label, onPress, icon, variant = 'gold', disabled }: Props) {
  const gradient =
    variant === 'gold'
      ? ([colors.goldLight, colors.gold] as const)
      : ([colors.surfaceSoft, colors.surface] as const);

  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [styles.pressable, pressed && styles.pressed, disabled && styles.disabled]}
    >
      <LinearGradient colors={gradient} style={[styles.button, variant === 'dark' && styles.dark]}>
        {icon ? <View style={styles.icon}>{icon}</View> : null}
        <Text style={[styles.label, variant === 'dark' && styles.darkLabel]}>{label}</Text>
      </LinearGradient>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  pressable: { width: '100%', borderRadius: 16, ...shadow },
  pressed: { opacity: 0.82, transform: [{ scale: 0.985 }] },
  disabled: { opacity: 0.45 },
  button: {
    minHeight: 58,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    paddingHorizontal: 20,
  },
  dark: { borderWidth: 1, borderColor: colors.border },
  icon: { marginRight: 10 },
  label: { color: colors.background, fontSize: 17, fontWeight: '800', letterSpacing: 0.5 },
  darkLabel: { color: colors.text },
});
