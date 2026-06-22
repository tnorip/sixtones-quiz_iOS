import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { useAuth } from '../auth/AuthContext';
import { GoldButton } from '../components/GoldButton';
import { Screen } from '../components/Screen';
import type { Difficulty } from '../data/quizzes';
import type { RootStackParamList } from '../navigation';
import { submitQuizProposal } from '../services/userRepository';
import { colors } from '../theme';

type Props = NativeStackScreenProps<RootStackParamList, 'Proposal'>;

const difficulties: Difficulty[] = ['初級', '中級', '上級'];

export function ProposalScreen({ navigation }: Props) {
  const { user } = useAuth();
  const [question, setQuestion] = useState('');
  const [options, setOptions] = useState(['', '', '', '']);
  const [difficulty, setDifficulty] = useState<Difficulty>('初級');
  const [explanation, setExplanation] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const updateOption = (index: number, value: string) => {
    setOptions((current) => current.map((option, optionIndex) => (optionIndex === index ? value : option)));
  };

  const resetForm = () => {
    setQuestion('');
    setOptions(['', '', '', '']);
    setDifficulty('初級');
    setExplanation('');
  };

  const submit = async () => {
    if (!user) {
      navigation.navigate('Account');
      return;
    }

    const trimmedQuestion = question.trim();
    const trimmedOptions = options.map((option) => option.trim());
    const trimmedExplanation = explanation.trim();

    setError('');
    setMessage('');

    if (!trimmedQuestion) {
      setError('問題文を入力してください。');
      return;
    }
    if (trimmedOptions.some((option) => !option)) {
      setError('選択肢を4つすべて入力してください。');
      return;
    }

    setIsSubmitting(true);
    try {
      await submitQuizProposal(user, {
        question: trimmedQuestion,
        options: trimmedOptions,
        difficulty,
        explanation: trimmedExplanation,
      });
      resetForm();
      setMessage('提案を送信しました。採用されるとストーン3個が付与されます。');
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : '提案の送信に失敗しました。もう一度お試しください。');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Screen>
      <View style={styles.hero}>
        <Text style={styles.label}>QUIZ PROPOSAL</Text>
        <Text style={styles.title}>クイズを提案する</Text>
        <Text style={styles.note}>
          選択肢1を正解として登録します。運営が確認し、採用された提案にはストーン3個が付与されます。
        </Text>
      </View>

      {!user ? (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>ログインが必要です</Text>
          <Text style={styles.cardText}>提案者を記録し、採用時にストーンを付与するためログインしてください。</Text>
          <View style={styles.buttonWrap}>
            <GoldButton label="ログイン画面へ" variant="dark" onPress={() => navigation.navigate('Account')} />
          </View>
        </View>
      ) : (
        <View style={styles.card}>
          <Text style={styles.inputLabel}>問題文</Text>
          <TextInput
            value={question}
            onChangeText={setQuestion}
            placeholder="例: SixTONESの○○は？"
            placeholderTextColor="#777269"
            maxLength={200}
            multiline
            style={[styles.input, styles.textarea]}
          />

          <Text style={styles.inputLabel}>選択肢</Text>
          {options.map((option, index) => (
            <TextInput
              key={index}
              value={option}
              onChangeText={(value) => updateOption(index, value)}
              placeholder={index === 0 ? '選択肢1（正解）' : `選択肢${index + 1}`}
              placeholderTextColor="#777269"
              maxLength={50}
              style={styles.input}
            />
          ))}

          <Text style={styles.inputLabel}>難易度</Text>
          <View style={styles.difficultyRow}>
            {difficulties.map((item) => (
              <Pressable
                key={item}
                onPress={() => setDifficulty(item)}
                style={[styles.difficultyChip, difficulty === item && styles.difficultyChipActive]}
              >
                <Text style={[styles.difficultyText, difficulty === item && styles.difficultyTextActive]}>{item}</Text>
              </Pressable>
            ))}
          </View>

          <Text style={styles.inputLabel}>解説（任意）</Text>
          <TextInput
            value={explanation}
            onChangeText={setExplanation}
            placeholder="解説があれば入力してください"
            placeholderTextColor="#777269"
            maxLength={300}
            multiline
            style={[styles.input, styles.textarea]}
          />

          {error ? <Text style={styles.error}>{error}</Text> : null}
          {message ? <Text style={styles.success}>{message}</Text> : null}

          <View style={styles.buttonWrap}>
            <GoldButton
              label={isSubmitting ? '送信中...' : '提案する'}
              disabled={isSubmitting}
              onPress={() => void submit()}
            />
          </View>
        </View>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  hero: { alignItems: 'center', marginTop: 22, marginBottom: 22 },
  label: { color: colors.gold, fontSize: 12, fontWeight: '800', letterSpacing: 3 },
  title: { color: colors.goldLight, fontSize: 30, fontWeight: '900', marginTop: 8 },
  note: { color: colors.muted, fontSize: 13, lineHeight: 20, textAlign: 'center', marginTop: 12 },
  card: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 18,
    padding: 18,
  },
  cardTitle: { color: colors.goldLight, fontSize: 20, fontWeight: '800' },
  cardText: { color: colors.muted, fontSize: 13, lineHeight: 20, marginTop: 8 },
  inputLabel: { color: colors.goldLight, fontSize: 13, fontWeight: '800', marginTop: 16, marginBottom: 8 },
  input: {
    minHeight: 48,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surfaceSoft,
    color: colors.text,
    fontSize: 15,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 10,
  },
  textarea: { minHeight: 92, textAlignVertical: 'top' },
  difficultyRow: { flexDirection: 'row', gap: 10, marginBottom: 8 },
  difficultyChip: {
    flex: 1,
    minHeight: 44,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceSoft,
  },
  difficultyChipActive: { backgroundColor: colors.gold, borderColor: colors.goldLight },
  difficultyText: { color: colors.muted, fontSize: 14, fontWeight: '800' },
  difficultyTextActive: { color: colors.background },
  error: { color: '#ee8181', textAlign: 'center', fontSize: 13, lineHeight: 20, marginTop: 8 },
  success: { color: colors.goldLight, textAlign: 'center', fontSize: 13, lineHeight: 20, marginTop: 8 },
  buttonWrap: { marginTop: 18 },
});
