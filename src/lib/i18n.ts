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
    practiceWeaknesses: string
    accuracyByItem: string
    commonConfusions: string
    mistakenFor: string
    noDataYet: string
    all: string
    intervals: string
    chords: string
    correct: string
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
  musicTheory: {
    intervals: Record<string, string>
    chords: Record<string, string>
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
      replay: '🔊',
      practiceWeaknesses: 'Practice Weaknesses',
      accuracyByItem: 'Accuracy by Item',
      commonConfusions: 'Common Confusions',
      mistakenFor: 'mistaken for',
      noDataYet: 'No data yet. Start playing!',
      all: 'All',
      intervals: 'Intervals',
      chords: 'Chords',
      correct: 'correct',
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
    },
    musicTheory: {
      intervals: {
        'Minor 2nd': 'Minor 2nd',
        'Major 2nd': 'Major 2nd',
        'Minor 3rd': 'Minor 3rd',
        'Major 3rd': 'Major 3rd',
        'Perfect 4th': 'Perfect 4th',
        'Tritone': 'Tritone',
        'Perfect 5th': 'Perfect 5th',
        'Minor 6th': 'Minor 6th',
        'Major 6th': 'Major 6th',
        'Minor 7th': 'Minor 7th',
        'Major 7th': 'Major 7th',
        'Octave': 'Octave',
        'Minor 9th': 'Minor 9th',
        'Major 9th': 'Major 9th',
        'Minor 10th': 'Minor 10th',
        'Major 10th': 'Major 10th',
      },
      chords: {
        'Major': 'Major',
        'Minor': 'Minor',
        'Diminished': 'Diminished',
        'Augmented': 'Augmented',
        'Major 7th': 'Major 7th',
        'Dominant 7th': 'Dominant 7th',
        'Minor 7th': 'Minor 7th',
        'Half-Dim 7th': 'Half-Dim 7th',
        'Diminished 7th': 'Diminished 7th',
        'Major 9th': 'Major 9th',
        'Dominant 9th': 'Dominant 9th',
        'Minor 9th': 'Minor 9th',
        'Dominant 11th': 'Dominant 11th',
        'Dominant 13th': 'Dominant 13th',
        'Alt Dominant': 'Alt Dominant',
      },
    },
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
      replay: '🔊',
      practiceWeaknesses: '针对练习',
      accuracyByItem: '各项准确率',
      commonConfusions: '常见混淆',
      mistakenFor: '误选为',
      noDataYet: '暂无数据。开始游戏！',
      all: '全部',
      intervals: '音程',
      chords: '和弦',
      correct: '正确',
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
    },
    musicTheory: {
      intervals: {
        'Minor 2nd': '小二度',
        'Major 2nd': '大二度',
        'Minor 3rd': '小三度',
        'Major 3rd': '大三度',
        'Perfect 4th': '纯四度',
        'Tritone': '三全音',
        'Perfect 5th': '纯五度',
        'Minor 6th': '小六度',
        'Major 6th': '大六度',
        'Minor 7th': '小七度',
        'Major 7th': '大七度',
        'Octave': '八度',
        'Minor 9th': '小九度',
        'Major 9th': '大九度',
        'Minor 10th': '小十度',
        'Major 10th': '大十度',
      },
      chords: {
        'Major': '大三和弦',
        'Minor': '小三和弦',
        'Diminished': '减三和弦',
        'Augmented': '增三和弦',
        'Major 7th': '大七和弦',
        'Dominant 7th': '属七和弦',
        'Minor 7th': '小七和弦',
        'Half-Dim 7th': '半减七和弦',
        'Diminished 7th': '减七和弦',
        'Major 9th': '大九和弦',
        'Dominant 9th': '属九和弦',
        'Minor 9th': '小九和弦',
        'Dominant 11th': '属十一和弦',
        'Dominant 13th': '属十三和弦',
        'Alt Dominant': '变化属和弦',
      },
    },
  }
}

export function translateMusicName(name: string, t: Translations, context: 'interval' | 'chord'): string {
  if (context === 'interval') {
    return t.musicTheory.intervals[name] ?? name
  } else {
    return t.musicTheory.chords[name] ?? name
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
