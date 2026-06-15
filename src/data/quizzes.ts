export type Difficulty = '初級' | '中級' | '上級';

export type Quiz = {
  id: string;
  question: string;
  options: string[];
  correct: number;
  difficulty: Difficulty;
  explanation?: string;
  randomizeOptions?: boolean;
};

// Firebase接続前でも実機で一連の操作を確認できる開発用データ。
export const sampleQuizzes: Quiz[] = [
  {
    id: 'sample-1',
    question: 'SixTONESのCDデビュー日は？',
    options: ['2019年1月22日', '2020年1月22日', '2020年6月22日', '2021年1月22日'],
    correct: 1,
    difficulty: '初級',
    explanation: 'SixTONESは2020年1月22日にCDデビューしました。',
  },
  {
    id: 'sample-2',
    question: 'デビュー曲「Imitation Rain」の作詞・作曲を手がけたのは？',
    options: ['YOSHIKI', '常田大希', 'Ayase', '米津玄師'],
    correct: 0,
    difficulty: '初級',
    explanation: 'X JAPANのYOSHIKIさんが作詞・作曲を手がけています。',
  },
  {
    id: 'sample-3',
    question: 'SixTONESのメンバーは何人？',
    options: ['4人', '5人', '6人', '7人'],
    correct: 2,
    difficulty: '初級',
  },
  {
    id: 'sample-4',
    question: 'グループ名「SixTONES」の読み方は？',
    options: ['シックストーンズ', 'ストーンズ', 'シックス・トーンズ', 'シクストンズ'],
    correct: 1,
    difficulty: '初級',
  },
  {
    id: 'sample-5',
    question: 'SixTONESの公式YouTubeチャンネルで公開されている企画は？',
    options: ['ドライブ企画', '料理だけ', 'ゲーム実況だけ', 'ニュース番組'],
    correct: 0,
    difficulty: '中級',
  },
];
