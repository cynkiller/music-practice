import { useCallback, useRef } from 'react'
import { View, Text, Button, ScrollView } from '@tarojs/components'
import { useAudio } from '../../hooks/useAudio'
import { useProgress } from '../../hooks/useProgress'
import { useGameState } from '../../hooks/useGameState'
import type { Answer, Difficulty } from '../../types/index'
import { DIFFICULTY_CONFIGS } from '../../lib/musicTheory'
import './index.scss'

// ─── Styles ────────────────────────────────────────────────────────────────────

const S = {
  screen: { minHeight: '100vh', backgroundColor: '#0f172a', display: 'flex' as const, flexDirection: 'column' as const },
  header: { backgroundColor: '#1e293b', padding: '24rpx 32rpx', display: 'flex' as const, alignItems: 'center' as const, justifyContent: 'space-between' as const },
  headerTitle: { color: '#a78bfa', fontSize: '34rpx', fontWeight: '700' as const },
  headerScore: { color: '#f8fafc', fontSize: '28rpx' },
  headerNav: { display: 'flex' as const, gap: '16rpx' },
  navBtn: { backgroundColor: '#334155', color: '#94a3b8', fontSize: '24rpx', padding: '8rpx 20rpx', borderRadius: '12rpx' },
  navBtnActive: { backgroundColor: '#4c1d95', color: '#c4b5fd', fontSize: '24rpx', padding: '8rpx 20rpx', borderRadius: '12rpx' },
  main: { flex: 1, padding: '32rpx 28rpx', display: 'flex' as const, flexDirection: 'column' as const, gap: '32rpx' },

  // Menu
  menuTitle: { color: '#f8fafc', fontSize: '48rpx', fontWeight: '700' as const, textAlign: 'center' as const, marginBottom: '8rpx' },
  menuSub: { color: '#94a3b8', fontSize: '28rpx', textAlign: 'center' as const, marginBottom: '48rpx' },
  diffCard: { backgroundColor: '#1e293b', borderRadius: '24rpx', padding: '36rpx', marginBottom: '24rpx', borderWidth: 2, borderStyle: 'solid' as const, borderColor: '#334155' },
  diffCardEasy: { borderColor: '#059669' },
  diffCardNormal: { borderColor: '#2563eb' },
  diffCardHard: { borderColor: '#dc2626' },
  diffLabel: { fontSize: '36rpx', fontWeight: '700' as const, marginBottom: '8rpx' },
  diffLabelEasy: { color: '#34d399' },
  diffLabelNormal: { color: '#60a5fa' },
  diffLabelHard: { color: '#f87171' },
  diffDesc: { color: '#94a3b8', fontSize: '26rpx', marginBottom: '24rpx' },
  diffLevelRow: { display: 'flex' as const, justifyContent: 'space-between' as const, alignItems: 'center' as const },
  diffLevel: { color: '#64748b', fontSize: '24rpx' },
  playBtn: { backgroundColor: '#7c3aed', color: '#fff', fontSize: '28rpx', padding: '16rpx 40rpx', borderRadius: '16rpx', fontWeight: '600' as const },
  playBtnEasy: { backgroundColor: '#059669' },
  playBtnNormal: { backgroundColor: '#2563eb' },
  playBtnHard: { backgroundColor: '#dc2626' },

  // Game
  scoreRow: { display: 'flex' as const, justifyContent: 'space-between' as const, alignItems: 'center' as const, backgroundColor: '#1e293b', borderRadius: '16rpx', padding: '20rpx 28rpx' },
  scoreBox: { textAlign: 'center' as const },
  scoreLabel: { color: '#64748b', fontSize: '22rpx', marginBottom: '4rpx' },
  scoreValue: { color: '#f8fafc', fontSize: '32rpx', fontWeight: '700' as const },
  quitBtn: { color: '#64748b', fontSize: '26rpx', padding: '8rpx 16rpx' },

  questionCard: { backgroundColor: '#1e293b', borderRadius: '24rpx', padding: '40rpx 32rpx', alignItems: 'center' as const, display: 'flex' as const, flexDirection: 'column' as const, gap: '16rpx' },
  questionType: { color: '#64748b', fontSize: '24rpx', textTransform: 'uppercase' as const, letterSpacing: '2rpx' },
  questionText: { color: '#f8fafc', fontSize: '34rpx', fontWeight: '600' as const, textAlign: 'center' as const },
  questionHint: { color: '#7c3aed', fontSize: '26rpx' },

  playBigBtn: { backgroundColor: '#7c3aed', color: '#fff', fontSize: '32rpx', padding: '28rpx 72rpx', borderRadius: '24rpx', fontWeight: '700' as const, width: '100%', textAlign: 'center' as const },
  controlRow: { display: 'flex' as const, gap: '16rpx', justifyContent: 'center' as const },
  replayBtn: { backgroundColor: '#334155', color: '#f8fafc', fontSize: '26rpx', padding: '16rpx 32rpx', borderRadius: '16rpx', flex: 1, textAlign: 'center' as const },

  answersGrid: { display: 'grid' as const, gridTemplateColumns: 'repeat(2, 1fr)', gap: '16rpx' },
  answerBtn: { backgroundColor: '#1e293b', color: '#f8fafc', fontSize: '28rpx', padding: '28rpx 16rpx', borderRadius: '16rpx', borderWidth: 2, borderStyle: 'solid' as const, borderColor: '#334155', textAlign: 'center' as const },
  answerBtnCorrect: { backgroundColor: '#064e3b', borderColor: '#10b981', color: '#6ee7b7' },
  answerBtnWrong: { backgroundColor: '#450a0a', borderColor: '#ef4444', color: '#fca5a5' },
  answerBtnDisabled: { backgroundColor: '#0f172a', borderColor: '#1e293b', color: '#334155' },

  feedbackCard: { borderRadius: '16rpx', padding: '24rpx 32rpx', textAlign: 'center' as const },
  feedbackCorrect: { backgroundColor: '#064e3b', borderWidth: 1, borderStyle: 'solid' as const, borderColor: '#059669' },
  feedbackWrong: { backgroundColor: '#450a0a', borderWidth: 1, borderStyle: 'solid' as const, borderColor: '#dc2626' },
  feedbackText: { fontSize: '28rpx', fontWeight: '600' as const },
  feedbackCorrectText: { color: '#6ee7b7' },
  feedbackWrongText: { color: '#fca5a5' },
  nextBtn: { backgroundColor: '#7c3aed', color: '#fff', fontSize: '30rpx', padding: '24rpx 48rpx', borderRadius: '20rpx', fontWeight: '600' as const, textAlign: 'center' as const, width: '100%' },

  // Review / Progress
  sectionTitle: { color: '#f8fafc', fontSize: '36rpx', fontWeight: '700' as const, marginBottom: '24rpx' },
  emptyText: { color: '#64748b', fontSize: '28rpx', textAlign: 'center' as const, marginTop: '40rpx' },
  reviewItem: { backgroundColor: '#1e293b', borderRadius: '16rpx', padding: '24rpx', marginBottom: '16rpx' },
  reviewItemName: { color: '#f8fafc', fontSize: '28rpx', fontWeight: '600' as const, marginBottom: '8rpx' },
  reviewItemMeta: { color: '#64748b', fontSize: '24rpx', marginBottom: '16rpx' },
  reviewItemReplay: { backgroundColor: '#334155', color: '#a78bfa', fontSize: '24rpx', padding: '12rpx 24rpx', borderRadius: '12rpx' },

  statRow: { display: 'flex' as const, gap: '16rpx', marginBottom: '16rpx' },
  statCard: { flex: 1, backgroundColor: '#1e293b', borderRadius: '16rpx', padding: '24rpx', textAlign: 'center' as const },
  statValue: { color: '#f8fafc', fontSize: '40rpx', fontWeight: '700' as const, marginBottom: '8rpx' },
  statLabel: { color: '#64748b', fontSize: '22rpx' },
  weaknessItem: { backgroundColor: '#1e293b', borderRadius: '12rpx', padding: '20rpx 24rpx', marginBottom: '12rpx', display: 'flex' as const, justifyContent: 'space-between' as const, alignItems: 'center' as const },
  weaknessName: { color: '#f8fafc', fontSize: '28rpx' },
  weaknessCount: { color: '#ef4444', fontSize: '24rpx' },
  backBtn: { backgroundColor: '#334155', color: '#94a3b8', fontSize: '28rpx', padding: '20rpx 40rpx', borderRadius: '16rpx', textAlign: 'center' as const },
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function Index() {
  const { playInterval, playChord, playArpeggio, stopAll } = useAudio()
  const {
    progress,
    recordAnswer,
    addScore,
    updateHighestLevel,
    getMistakes,
    getWeaknesses,
    getAccuracyOverTime,
  } = useProgress()

  const handleAnswer = useCallback((answer: Answer) => { recordAnswer(answer) }, [recordAnswer])
  const handleScoreAdd = useCallback((points: number) => { addScore(points) }, [addScore])
  const handleLevelUp = useCallback((difficulty: Difficulty, level: number) => { updateHighestLevel(difficulty, level) }, [updateHighestLevel])

  const prevScoreRef = useRef(0)

  const { state, startGame, startAnswering, submitAnswer, nextQuestion, goToMenu, goToReview, goToProgress } =
    useGameState(handleAnswer, handleScoreAdd, handleLevelUp)

  const handleSubmitAnswer = useCallback((option: string) => {
    prevScoreRef.current = state.score
    submitAnswer(option)
  }, [state.score, submitAnswer])

  const handlePlaySound = useCallback(() => {
    if (!state.currentQuestion) return
    const q = state.currentQuestion
    if (q.type === 'interval') playInterval(q.rootNote, q.semitones[1], state.difficulty)
    else playChord(q.rootNote, q.semitones, state.difficulty)
  }, [state.currentQuestion, state.difficulty, playInterval, playChord])

  const handlePlayArpeggio = useCallback(() => {
    if (!state.currentQuestion) return
    const q = state.currentQuestion
    playArpeggio(q.rootNote, q.semitones, state.difficulty)
  }, [state.currentQuestion, state.difficulty, playArpeggio])

  const handleReplay = useCallback((answer: Answer) => {
    const q = answer.question
    if (q.type === 'interval') playInterval(q.rootNote, q.semitones[1], q.difficulty)
    else playChord(q.rootNote, q.semitones, q.difficulty)
  }, [playInterval, playChord])

  const { status } = state
  const q = state.currentQuestion
  const lastAnswer = state.sessionAnswers[state.sessionAnswers.length - 1]
  const config = DIFFICULTY_CONFIGS[state.difficulty]

  // ── Header ──────────────────────────────────────────────────────────────────

  const renderHeader = () => (
    <View style={S.header}>
      <Text style={S.headerTitle}>🎵 Music Theory</Text>
      <View style={S.headerNav}>
        {status !== 'playing' && status !== 'answering' && status !== 'feedback' && (
          <>
            <Text
              style={status === 'menu' ? S.navBtnActive : S.navBtn}
              onClick={goToMenu}
            >Menu</Text>
            <Text
              style={status === 'review' ? S.navBtnActive : S.navBtn}
              onClick={goToReview}
            >Review</Text>
            <Text
              style={status === 'progress' ? S.navBtnActive : S.navBtn}
              onClick={goToProgress}
            >Stats</Text>
          </>
        )}
        <Text style={S.headerScore}>⭐ {progress.totalScore}</Text>
      </View>
    </View>
  )

  // ── Menu ────────────────────────────────────────────────────────────────────

  const renderMenu = () => {
    const difficulties: Array<{ key: Difficulty; label: string; desc: string }> = [
      { key: 'easy', label: '🟢 Easy', desc: 'Basic intervals & triads' },
      { key: 'normal', label: '🔵 Normal', desc: 'All intervals & seventh chords' },
      { key: 'hard', label: '🔴 Hard', desc: 'Extended chords & complex intervals' },
    ]
    const cardBorder = { easy: S.diffCardEasy, normal: S.diffCardNormal, hard: S.diffCardHard }
    const labelColor = { easy: S.diffLabelEasy, normal: S.diffLabelNormal, hard: S.diffLabelHard }
    const btnColor = { easy: S.playBtnEasy, normal: S.playBtnNormal, hard: S.playBtnHard }

    return (
      <ScrollView scrollY style={{ flex: 1 }}>
        <View style={S.main}>
          <Text style={S.menuTitle}>Music Theory</Text>
          <Text style={S.menuSub}>Train your ear, level up your skills</Text>
          {difficulties.map(d => (
            <View key={d.key} style={{ ...S.diffCard, ...cardBorder[d.key] }}>
              <Text style={{ ...S.diffLabel, ...labelColor[d.key] }}>{d.label}</Text>
              <Text style={S.diffDesc}>{d.desc}</Text>
              <View style={S.diffLevelRow}>
                <Text style={S.diffLevel}>
                  Best: Level {progress.highestLevel[d.key]}
                </Text>
                <Button
                  style={{ ...S.playBtn, ...btnColor[d.key] }}
                  onClick={() => startGame(d.key, 1)}
                >Play →</Button>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    )
  }

  // ── Game Board ───────────────────────────────────────────────────────────────

  const renderGame = () => {
    if (!q) return null
    const isAnswering = status === 'answering' || status === 'feedback'
    const isFeedback = status === 'feedback'

    return (
      <ScrollView scrollY style={{ flex: 1 }}>
        <View style={S.main}>
          {/* Score row */}
          <View style={S.scoreRow}>
            <View style={S.scoreBox}>
              <Text style={S.scoreLabel}>Score</Text>
              <Text style={S.scoreValue}>{state.score}</Text>
            </View>
            <View style={S.scoreBox}>
              <Text style={S.scoreLabel}>Combo</Text>
              <Text style={S.scoreValue}>x{state.combo}</Text>
            </View>
            <View style={S.scoreBox}>
              <Text style={S.scoreLabel}>Level</Text>
              <Text style={S.scoreValue}>{state.level}</Text>
            </View>
            <Text style={S.quitBtn} onClick={() => { stopAll(); goToMenu() }}>✕ Quit</Text>
          </View>

          {/* Question card */}
          <View style={S.questionCard}>
            <Text style={S.questionType}>Identify the {q.type}</Text>
            <Text style={S.questionText}>
              {isAnswering ? `Root: ${q.rootNote}` : 'Ready to listen?'}
            </Text>
            {config.showKeyboardHints && isFeedback && (
              <Text style={S.questionHint}>{q.targetName}</Text>
            )}
          </View>

          {/* Play controls */}
          {status === 'playing' && (
            <Button
              style={S.playBigBtn}
              onClick={() => { stopAll(); handlePlaySound(); startAnswering() }}
            >▶ Play Sound</Button>
          )}

          {isAnswering && (
            <View style={S.controlRow}>
              <Button
                style={S.replayBtn}
                onClick={() => { stopAll(); handlePlaySound() }}
              >↺ Replay</Button>
              {isFeedback && q.type === 'chord' && (
                <Button
                  style={S.replayBtn}
                  onClick={() => { stopAll(); handlePlayArpeggio() }}
                >♩ Arpeggio</Button>
              )}
            </View>
          )}

          {/* Answer options */}
          {isAnswering && (
            <View style={S.answersGrid}>
              {q.options.map(option => {
                let btnStyle = { ...S.answerBtn }
                if (isFeedback) {
                  if (option === q.targetName) Object.assign(btnStyle, S.answerBtnCorrect)
                  else if (option === lastAnswer?.userAnswer) Object.assign(btnStyle, S.answerBtnWrong)
                  else Object.assign(btnStyle, S.answerBtnDisabled)
                }
                return (
                  <Button
                    key={option}
                    style={btnStyle}
                    disabled={isFeedback}
                    onClick={() => { stopAll(); handleSubmitAnswer(option) }}
                  >{option}</Button>
                )
              })}
            </View>
          )}

          {/* Feedback */}
          {isFeedback && lastAnswer && (
            <View>
              <View style={{ ...S.feedbackCard, ...(lastAnswer.isCorrect ? S.feedbackCorrect : S.feedbackWrong) }}>
                <Text style={{ ...S.feedbackText, ...(lastAnswer.isCorrect ? S.feedbackCorrectText : S.feedbackWrongText) }}>
                  {lastAnswer.isCorrect
                    ? `✓ Correct! +${state.score - prevScoreRef.current}pts`
                    : `✗ The answer was ${q.targetName}`}
                </Text>
              </View>
              <View style={{ marginTop: '24rpx' }}>
                <Button
                  style={S.nextBtn}
                  onClick={() => { stopAll(); nextQuestion() }}
                >Next Question →</Button>
              </View>
            </View>
          )}
        </View>
      </ScrollView>
    )
  }

  // ── Review ───────────────────────────────────────────────────────────────────

  const renderReview = () => {
    const mistakes = getMistakes()
    return (
      <ScrollView scrollY style={{ flex: 1 }}>
        <View style={S.main}>
          <Text style={S.sectionTitle}>📋 Mistakes Review</Text>
          {mistakes.length === 0 ? (
            <Text style={S.emptyText}>No mistakes yet. Keep playing!</Text>
          ) : (
            mistakes.slice(-20).reverse().map((a, i) => (
              <View key={i} style={S.reviewItem}>
                <Text style={S.reviewItemName}>{a.question.targetName}</Text>
                <Text style={S.reviewItemMeta}>
                  You answered: {a.userAnswer} · {a.question.type} · {a.question.difficulty}
                </Text>
                <Button
                  style={S.reviewItemReplay}
                  onClick={() => handleReplay(a)}
                >▶ Replay</Button>
              </View>
            ))
          )}
          <Button style={S.backBtn} onClick={goToMenu}>← Back to Menu</Button>
        </View>
      </ScrollView>
    )
  }

  // ── Progress ─────────────────────────────────────────────────────────────────

  const renderProgress = () => {
    const accuracy = progress.totalQuestionsAnswered > 0
      ? Math.round((progress.totalCorrect / progress.totalQuestionsAnswered) * 100)
      : 0
    const weaknesses = getWeaknesses()
    const accuracyOverTime = getAccuracyOverTime()

    return (
      <ScrollView scrollY style={{ flex: 1 }}>
        <View style={S.main}>
          <Text style={S.sectionTitle}>📊 Your Progress</Text>

          <View style={S.statRow}>
            <View style={S.statCard}>
              <Text style={S.statValue}>{progress.totalScore}</Text>
              <Text style={S.statLabel}>Total Score</Text>
            </View>
            <View style={S.statCard}>
              <Text style={S.statValue}>{accuracy}%</Text>
              <Text style={S.statLabel}>Accuracy</Text>
            </View>
          </View>

          <View style={S.statRow}>
            <View style={S.statCard}>
              <Text style={S.statValue}>{progress.totalQuestionsAnswered}</Text>
              <Text style={S.statLabel}>Questions</Text>
            </View>
            <View style={S.statCard}>
              <Text style={S.statValue}>{progress.totalCorrect}</Text>
              <Text style={S.statLabel}>Correct</Text>
            </View>
          </View>

          {accuracyOverTime.length > 0 && (
            <View>
              <Text style={{ ...S.sectionTitle, fontSize: '30rpx' }}>Accuracy Trend</Text>
              <View style={{ display: 'flex' as const, gap: '8rpx', alignItems: 'flex-end' as const, height: '120rpx' }}>
                {accuracyOverTime.map((b, i) => (
                  <View key={i} style={{ flex: 1, backgroundColor: b.accuracy >= 70 ? '#059669' : b.accuracy >= 50 ? '#d97706' : '#dc2626', height: `${b.accuracy}%`, borderRadius: '4rpx', minHeight: '8rpx' }} />
                ))}
              </View>
            </View>
          )}

          {weaknesses.length > 0 && (
            <View>
              <Text style={{ ...S.sectionTitle, fontSize: '30rpx' }}>Weak Spots</Text>
              {weaknesses.map((w, i) => (
                <View key={i} style={S.weaknessItem}>
                  <Text style={S.weaknessName}>{w.name}</Text>
                  <Text style={S.weaknessCount}>{w.count} mistakes</Text>
                </View>
              ))}
            </View>
          )}

          <Button style={S.backBtn} onClick={goToMenu}>← Back to Menu</Button>
        </View>
      </ScrollView>
    )
  }

  // ── Render ────────────────────────────────────────────────────────────────────

  return (
    <View style={S.screen}>
      {renderHeader()}
      {(status === 'menu') && renderMenu()}
      {(status === 'playing' || status === 'answering' || status === 'feedback') && renderGame()}
      {status === 'review' && renderReview()}
      {status === 'progress' && renderProgress()}
    </View>
  )
}
