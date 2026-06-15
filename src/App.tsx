import { DarkTheme, NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { AuthProvider, useAuth } from './auth/AuthContext';
import type { RootStackParamList } from './navigation';
import { colors } from './theme';
import { AccountScreen } from './screens/AccountScreen';
import { GameMenuScreen } from './screens/GameMenuScreen';
import { HomeScreen } from './screens/HomeScreen';
import { LoginScreen } from './screens/LoginScreen';
import { PlaceholderScreen } from './screens/PlaceholderScreen';
import { QuizScreen } from './screens/QuizScreen';
import { ResultScreen } from './screens/ResultScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();
const navigationTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    background: colors.background,
    card: colors.background,
    primary: colors.gold,
    text: colors.text,
    border: colors.border,
  },
};

function RootNavigator() {
  const { user, isGuest, isLoading } = useAuth();

  if (isLoading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator color={colors.gold} size="large" />
      </View>
    );
  }

  const hasAccess = Boolean(user || isGuest);

  return (
    <NavigationContainer theme={navigationTheme}>
      <StatusBar style="light" />
      <Stack.Navigator
        screenOptions={{
          headerStyle: { backgroundColor: colors.background },
          headerTintColor: colors.goldLight,
          headerTitleStyle: { fontWeight: '700' },
          headerShadowVisible: false,
          contentStyle: { backgroundColor: colors.background },
          animation: 'slide_from_right',
        }}
      >
        {!hasAccess ? (
          <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
        ) : (
          <>
          <Stack.Screen name="Home" component={HomeScreen} options={{ headerShown: false }} />
          <Stack.Screen name="GameMenu" component={GameMenuScreen} options={{ title: 'クイズを選ぶ' }} />
          <Stack.Screen name="Quiz" component={QuizScreen} options={{ title: 'フリープレイ', gestureEnabled: false }} />
          <Stack.Screen name="Result" component={ResultScreen} options={{ title: '結果', gestureEnabled: false }} />
          <Stack.Screen name="Account" component={AccountScreen} options={{ title: 'アカウント' }} />
          <Stack.Screen
            name="Placeholder"
            component={PlaceholderScreen}
            options={({ route }) => ({ title: route.params.title })}
          />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <RootNavigator />
      </AuthProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
  },
});
