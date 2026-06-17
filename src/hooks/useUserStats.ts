import { useEffect, useState } from 'react';
import { useAuth } from '../auth/AuthContext';
import { getDefaultStats, loadUserStats, type UserStats } from '../services/userRepository';

export function useUserStats() {
  const { user } = useAuth();
  const [stats, setStats] = useState<UserStats>(() => getDefaultStats(user));
  const [isLoading, setIsLoading] = useState(Boolean(user));
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    setError('');

    if (!user) {
      setStats(getDefaultStats(null));
      setIsLoading(false);
      return () => {
        active = false;
      };
    }

    setIsLoading(true);
    loadUserStats(user)
      .then((nextStats) => {
        if (active) setStats(nextStats);
      })
      .catch((reason: unknown) => {
        if (!active) return;
        setStats(getDefaultStats(user));
        setError(reason instanceof Error ? reason.message : 'ユーザーデータを読み込めませんでした。');
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });

    return () => {
      active = false;
    };
  }, [user]);

  return { stats, isLoading, error };
}
