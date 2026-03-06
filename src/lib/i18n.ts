export type Language = 'en' | 'zh'

export interface Translations {
  app: {
    title: string
    earTrainer: string
    score: string
    play: string
    review: string
    stats: string
    quit: string
  }
  menu: {
    chooseDifficulty: string
    trainYourEar: string
    easy: string
    normal: string
    hard: string
    easyDesc: string
    normalDesc: string
    hardDesc: string
    levels: string
    best: string
    playButton: string
  }
  game: {
    identifyThe: string
    interval: string
    chord: string
    playSound: string
    replay: string
    playNotes: string
    correct: string
    correctPoints: string
    incorrect: string
    theAnswerWas: string
    nextQuestion: string
    noMistakesYet: string
    startPlaying: string
  }
  review: {
    areasToImprove: string
    recentMistakes: string
    noMistakesRecorded: string
    noMistakesYet: string
    youAnswered: string
    replay: string
  }
  progress: {
    yourProgress: string
    totalScore: string
    accuracy: string
    questions: string
    correct: string
    highestLevels: string
    accuracyOverTime: string
    mostMissed: string
    noDataYet: string
    startPlayingToSee: string
    older: string
    recent: string
  }
  scoreBar: {
    level: string
    combo: string
    accuracy: string
  }
}

export const translations: Record<Language, Translations> = {
  en: {
    app: {
      title: '🎵 Music Theory',
      earTrainer: 'Ear Trainer',
      score: 'Score',
      play: '🏠 Play',
      review: '📋 Review',
      stats: '📊 Stats',
      quit: 'Quit'
    },
    menu: {
      chooseDifficulty: 'Choose Difficulty',
      trainYourEar: 'Train your ear with intervals and chords',
      easy: 'Easy',
      normal: 'Normal',
      hard: 'Hard',
      easyDesc: 'Basic intervals & triads. Visual hints on keyboard.',
      normalDesc: 'All diatonic intervals & seventh chords. No hints.',
      hardDesc: 'Extended chords, altered dominants, compound intervals.',
      levels: 'Levels',
      best: 'Best',
      playButton: 'Play →'
    },
    game: {
      identifyThe: 'Identify the',
      interval: 'interval',
      chord: 'chord',
      playSound: '▶ Play Sound',
      replay: '🔊 Replay',
      playNotes: '🎵 Play Notes',
      correct: 'Correct!',
      correctPoints: '+{points}',
      incorrect: 'The answer was',
      theAnswerWas: 'The answer was',
      nextQuestion: '→ Next Question',
      noMistakesYet: 'No mistakes yet. Keep playing!',
      startPlaying: 'Start playing to see your progress!'
    },
    review: {
      areasToImprove: '⚠️ Areas to Improve',
      recentMistakes: 'Recent Mistakes',
      noMistakesRecorded: 'No mistakes recorded yet. Start playing!',
      noMistakesYet: 'No mistakes yet!',
      youAnswered: 'You answered',
      replay: '🔊'
    },
    progress: {
      yourProgress: '📊 Your Progress',
      totalScore: 'Total Score',
      accuracy: 'Accuracy',
      questions: 'Questions',
      correct: 'Correct',
      highestLevels: 'Highest Levels',
      accuracyOverTime: 'Accuracy Over Time',
      mostMissed: 'Most Missed',
      noDataYet: 'No data yet',
      startPlayingToSee: 'Start playing to see your progress!',
      older: 'Older',
      recent: 'Recent'
    },
    scoreBar: {
      level: 'Lv.',
      combo: 'x',
      accuracy: '🎯'
    }
  },
  zh: {
    app: {
      title: '🎵 音乐理论',
      earTrainer: '听觉训练',
      score: '得分',
      play: '🏠 游戏',
      review: '📋 复习',
      stats: '📊 统计',
      quit: '退出'
    },
    menu: {
      chooseDifficulty: '选择难度',
      trainYourEar: '通过音程与和弦训练你的耳朵',
      easy: '简单',
      normal: '普通',
      hard: '困难',
      easyDesc: '基础音程与三和弦。键盘显示视觉提示。',
      normalDesc: '所有自然音程与七和弦。无提示。',
      hardDesc: '扩展和弦、变化属和弦、复合音程。',
      levels: '等级',
      best: '最佳',
      playButton: '开始 →'
    },
    game: {
      identifyThe: '识别',
      interval: '音程',
      chord: '和弦',
      playSound: '▶ 播放声音',
      replay: '🔊 重播',
      playNotes: '🎵 播放音符',
      correct: '正确！',
      correctPoints: '+{points}',
      incorrect: '答案是',
      theAnswerWas: '答案是',
      nextQuestion: '→ 下一题',
      noMistakesYet: '还没有错误。继续练习！',
      startPlaying: '开始游戏查看进度！'
    },
    review: {
      areasToImprove: '⚠️ 需要改进的方面',
      recentMistakes: '最近错误',
      noMistakesRecorded: '还没有错误记录。开始游戏！',
      noMistakesYet: '还没有错误！',
      youAnswered: '你回答了',
      replay: '🔊'
    },
    progress: {
      yourProgress: '📊 你的进度',
      totalScore: '总分',
      accuracy: '准确率',
      questions: '题目',
      correct: '正确',
      highestLevels: '最高等级',
      accuracyOverTime: '准确率趋势',
      mostMissed: '最常错',
      noDataYet: '暂无数据',
      startPlayingToSee: '开始游戏查看进度！',
      older: '更早',
      recent: '最近'
    },
    scoreBar: {
      level: '第',
      combo: '连击 x',
      accuracy: '🎯'
    }
  }
}

export function useTranslation(language: Language) {
  const t = translations[language]
  return {
    t,
    language,
    setLanguage: () => {} // Will be overridden by context
  }
}
