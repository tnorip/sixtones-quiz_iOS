import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  createContext,
  type PropsWithChildren,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { onAuthStateChanged, type User } from 'firebase/auth';
import { auth } from '../services/firebase';

const GUEST_KEY = '@stq/guest-mode';

type AuthContextValue = {
  user: User | null;
  isLoading: boolean;
  isGuest: boolean;
  continueAsGuest: () => Promise<void>;
  leaveGuestMode: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: PropsWithChildren) {
  const [user, setUser] = useState<User | null>(null);
  const [isGuest, setIsGuest] = useState(false);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [isGuestLoading, setIsGuestLoading] = useState(true);

  useEffect(() => {
    let active = true;

    AsyncStorage.getItem(GUEST_KEY)
      .then((value) => {
        if (active) setIsGuest(value === 'true');
      })
      .finally(() => {
        if (active) setIsGuestLoading(false);
      });

    const unsubscribe = onAuthStateChanged(auth, (nextUser) => {
      if (!active) return;
      setUser(nextUser);
      if (nextUser) {
        setIsGuest(false);
        void AsyncStorage.removeItem(GUEST_KEY);
      }
      setIsAuthLoading(false);
    });

    return () => {
      active = false;
      unsubscribe();
    };
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isLoading: isAuthLoading || isGuestLoading,
      isGuest,
      continueAsGuest: async () => {
        await AsyncStorage.setItem(GUEST_KEY, 'true');
        setIsGuest(true);
      },
      leaveGuestMode: async () => {
        await AsyncStorage.removeItem(GUEST_KEY);
        setIsGuest(false);
      },
    }),
    [isAuthLoading, isGuest, isGuestLoading, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const value = useContext(AuthContext);
  if (!value) {
    throw new Error('useAuth must be used inside AuthProvider.');
  }
  return value;
}
