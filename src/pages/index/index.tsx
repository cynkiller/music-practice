import { useCallback, useEffect, useRef } from 'react'
import { View, Text, Button, ScrollView } from '@tarojs/components'
import { useAudio } from '../../hooks/useAudio'
import { useProgress } from '../../hooks/useProgress'
import { useGameState } from '../../hooks/useGameState'
import { useI18n } from '../../hooks/useI18n'
import type { Answer, Difficulty, GameState } from '../../types/index'
import type { Translations } from '../../lib/i18n'
import { DIFFICULTY_CONFIGS, NOTES, noteFromSemitone } from '../../lib/musicTheory'
import './index.scss'

// ─── Piano Keyboard ───────────────────────────────────────────────────────────

const BLACK_KEY_INDICES = new Set([1, 3, 6, 8, 10])
const PIANO_OCTAVES = [3, 4, 5]

function getHighlightedNotes(rootNote: string, semitones: number[]): string[] {
  return semitones.map(s => noteFromSemitone(rootNote, s))
}

function PianoKeyboard({ highlightedNotes, showHints }: { highlightedNotes: string[]; showHints: boolean }) {
  const highlightSet = new Set(highlightedNotes)

  const keys: { note: string; isBlack: boolean; noteWithOctave: string }[] = []
  for (const octave of PIANO_OCTAVES) {
    for (let i = 0; i < 12; i++) {
      keys.push({ note: NOTES[i], isBlack: BLACK_KEY_INDICES.has(i), noteWithOctave: `${NOTES[i]}${octave}` })
    }
  }

  const totalWhite = keys.filter(k => !k.isBlack).length
  const wkw = 100 / totalWhite

  let whiteIndex = 0
  const keyPositions = keys.map(k => {
    if (!k.isBlack) {
      const pos = { ...k, leftPct: whiteIndex * wkw, widthPct: wkw }
      whiteIndex++
      return pos
    }
    return { ...k, leftPct: (whiteIndex - 0.35) * wkw, widthPct: wkw * 0.7 }
  })

  const isHighlighted = (nwo: string) => showHints && highlightSet.has(nwo)

  return (
    <View style={{ position: 'relative' as const, height: '130rpx', width: '100%', overflow: 'hidden' as const, borderRadius: '8rpx', backgroundColor: '#0f172a' }}>
      {keyPositions.filter(k => !k.isBlack).map(k => (
        <View key={k.noteWithOctave} style={{
          position: 'absolute' as const, left: `${k.leftPct}%`, top: 0,
          width: `calc(${k.widthPct}% - 2rpx)`, height: '100%',
          backgroundColor: isHighlighted(k.noteWithOctave) ? '#a78bfa' : '#f8fafc',
          borderRadius: '0 0 6rpx 6rpx', borderRight: '2rpx solid #94a3b8',
        }} />
      ))}
      {keyPositions.filter(k => k.isBlack).map(k => (
        <View key={k.noteWithOctave} style={{
          position: 'absolute' as const, left: `${k.leftPct}%`, top: 0,
          width: `${k.widthPct}%`, height: '63%',
          backgroundColor: isHighlighted(k.noteWithOctave) ? '#7c3aed' : '#1e293b',
          borderRadius: '0 0 4rpx 4rpx', zIndex: 10,
          borderLeft: '1rpx solid #0f172a', borderRight: '1rpx solid #0f172a',
        }} />
      ))}
    </View>
  )
}

// ─── Score Bar ────────────────────────────────────────────────────────────────

function ScoreBar({ state, onQuit, t }: { state: GameState; onQuit: () => void; t: Translations }) {
  const { score, combo, level, difficulty, questionsAnswered, correctAnswers } = state
  const accuracy = questionsAnswered > 0 ? Math.round((correctAnswers / questionsAnswered) * 100) : 0
  const diffColors: Record<Difficulty, { text: string; bg: string; border: string }> = {
    easy:   { text: '#4ade80', bg: '#052e16', border: '#166534' },
    normal: { text: '#fbbf24', bg: '#451a03', border: '#92400e' },
    hard:   { text: '#f87171', bg: '#450a0a', border: '#991b1b' },
  }
  const dc = diffColors[difficulty]

  return (
    <View style={{ display: 'flex' as const, alignItems: 'center' as const, justifyContent: 'space-between' as const, flexWrap: 'wrap' as const, gap: '10rpx' }}>
      <View style={{ display: 'flex' as const, alignItems: 'center' as const, gap: '16rpx', flexWrap: 'wrap' as const }}>
        <View style={{ backgroundColor: dc.bg, borderWidth: 1, borderStyle: 'solid' as const, borderColor: dc.border, borderRadius: '10rpx', paddingLeft: '16rpx', paddingRight: '16rpx', paddingTop: '6rpx', paddingBottom: '6rpx', display: 'flex' as const, gap: '8rpx', alignItems: 'center' as const }}>
          <Text style={{ color: dc.text, fontSize: '22rpx', fontWeight: '700' as const }}>{difficulty.toUpperCase()}</Text>
          <Text style={{ color: '#94a3b8', fontSize: '22rpx' }}>{t.scoreBar.level}{level}</Text>
        </View>
        <View style={{ display: 'flex' as const, alignItems: 'center' as const, gap: '6rpx' }}>
          <Text style={{ color: '#fbbf24' }}>⚡</Text>
          <Text style={{ color: '#f8fafc', fontSize: '28rpx', fontWeight: '700' as const }}>{score.toLocaleString()}</Text>
        </View>
        {combo > 0 && (
          <View style={{ display: 'flex' as const, alignItems: 'center' as const, gap: '6rpx' }}>
            <Text style={{ color: '#fb923c' }}>🔥</Text>
            <Text style={{ color: '#fb923c', fontSize: '28rpx', fontWeight: '700' as const }}>{t.scoreBar.combo}{combo}</Text>
          </View>
        )}
        <View style={{ display: 'flex' as const, alignItems: 'center' as const, gap: '6rpx' }}>
          <Text style={{ color: '#64748b' }}>{t.scoreBar.accuracy}</Text>
          <Text style={{ color: '#94a3b8', fontSize: '24rpx' }}>{accuracy}%</Text>
          <Text style={{ color: '#475569', fontSize: '22rpx' }}>({correctAnswers}/{questionsAnswered})</Text>
        </View>
      </View>
      <Text
        style={{ color: '#64748b', fontSize: '26rpx', paddingLeft: '16rpx', paddingRight: '16rpx', paddingTop: '10rpx', paddingBottom: '10rpx' }}
        onClick={onQuit}
      >{t.app.quit}</Text>
    </View>
  )
}

// ─── Answer Grid ──────────────────────────────────────────────────────────────

function AnswerGrid({ options, onSelect, disabled, correctAnswer, userAnswer, showResult }: {
  options: string[]; onSelect: (opt: string) => void; disabled: boolean
  correctAnswer?: string; userAnswer?: string; showResult: boolean
}) {
  function btnStyle(option: string): object {
    const base = { borderRadius: '16rpx', fontSize: '26rpx', fontWeight: '600' as const, paddingTop: '22rpx', paddingBottom: '22rpx', paddingLeft: '8rpx', paddingRight: '8rpx', borderWidth: 2, borderStyle: 'solid' as const, textAlign: 'center' as const, width: '100%' }
    if (showResult) {
      if (option === correctAnswer)  return { ...base, backgroundColor: '#052e16', borderColor: '#10b981', color: '#6ee7b7' }
      if (option === userAnswer)     return { ...base, backgroundColor: '#450a0a', borderColor: '#ef4444', color: '#fca5a5' }
      return { ...base, backgroundColor: '#0f172a', borderColor: '#1e293b', color: '#334155' }
    }
    return { ...base, backgroundColor: '#1e293b', borderColor: '#475569', color: '#f8fafc' }
  }

  return (
    <View style={{ display: 'flex' as const, flexWrap: 'wrap' as const, gap: '14rpx' }}>
      {options.map(option => (
        <View key={option} style={{ width: 'calc(50% - 7rpx)' }}>
          <Button style={btnStyle(option)} disabled={disabled} onClick={() => { if (!disabled) onSelect(option) }}>
            {option}
          </Button>
        </View>
      ))}
    </View>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function Index() {
  const { playInterval, playChord, playArpeggio, stopAll } = useAudio()
  const { progress, recordAnswer, addScore, updateHighestLevel, getMistakes, getWeaknesses, getAccuracyOverTime } = useProgress()
  const { t, language, toggleLanguage } = useI18n()

  const handleAnswer   = useCallback((answer: Answer) => { recordAnswer(answer) }, [recordAnswer])
  const handleScoreAdd = useCallback((pts: number) => { addScore(pts) }, [addScore])
  const handleLevelUp  = useCallback((diff: Difficulty, lv: number) => { updateHighestLevel(diff, lv) }, [updateHighestLevel])

  const prevScoreRef  = useRef(0)
  const autoPlayedRef = useRef<string | null>(null)

  const { state, startGame, startAnswering, submitAnswer, nextQuestion, goToMenu, goToReview, goToProgress } =
    useGameState(handleAnswer, handleScoreAdd, handleLevelUp)

  const { status } = state
  const q          = state.currentQuestion
  const lastAnswer = state.sessionAnswers[state.sessionAnswers.length - 1]
  const config     = DIFFICULTY_CONFIGS[state.difficulty]

  const handleSubmitAnswer = useCallback((option: string) => {
    prevScoreRef.current = state.score
    submitAnswer(option)
  }, [state.score, submitAnswer])

  const handlePlaySound = useCallback(() => {
    if (!q) return
    if (q.type === 'interval') playInterval(q.rootNote, q.semitones[1], state.difficulty)
    else playChord(q.rootNote, q.semitones, state.difficulty)
  }, [q, state.difficulty, playInterval, playChord])

  const handlePlayArpeggio = useCallback(() => {
    if (!q) return
    playArpeggio(q.rootNote, q.semitones, state.difficulty)
  }, [q, state.difficulty, playArpeggio])

  const handleReplay = useCallback((answer: Answer) => {
    const aq = answer.question
    if (aq.type === 'interval') playInterval(aq.rootNote, aq.semitones[1], aq.difficulty)
    else playChord(aq.rootNote, aq.semitones, aq.difficulty)
  }, [playInterval, playChord])

  // Auto-play arpeggio on wrong chord answer — mirrors GameBoard.tsx
  useEffect(() => {
    if (status === 'feedback' && lastAnswer && !lastAnswer.isCorrect && q?.type === 'chord' && autoPlayedRef.current !== q.id) {
      autoPlayedRef.current = q.id
      const t = setTimeout(() => handlePlayArpeggio(), 600)
      return () => clearTimeout(t)
    }
  }, [status, lastAnswer, q, handlePlayArpeggio])

  const isFeedback  = status === 'feedback'
  const isAnswering = status === 'answering' || isFeedback
  const isPlaying   = status === 'playing' || isAnswering
  const showHints   = config.showKeyboardHints
  const highlightedNotes = (showHints && status === 'answering') || isFeedback
    ? getHighlightedNotes(q?.rootNote ?? '', q?.semitones ?? [])
    : []

  const navItems: { id: 'menu' | 'review' | 'progress'; label: string }[] = [
    { id: 'menu',     label: t.app.play },
    { id: 'review',   label: t.app.review },
    { id: 'progress', label: t.app.stats },
  ]
  const activeNav = isPlaying ? 'menu' : status as 'menu' | 'review' | 'progress'

  return (
    <View style={{ minHeight: '100vh', backgroundColor: '#0f172a', display: 'flex' as const, flexDirection: 'column' as const }}>

      {/* ── HEADER ── */}
      <View style={{ backgroundColor: '#0f172a', borderBottom: '1rpx solid #1e293b', paddingLeft: '24rpx', paddingRight: '24rpx', paddingTop: '16rpx', paddingBottom: '16rpx', display: 'flex' as const, alignItems: 'center' as const, justifyContent: 'space-between' as const }}>
        <View style={{ display: 'flex' as const, alignItems: 'center' as const, gap: '12rpx' }}>
          <Text style={{ fontSize: '32rpx' }}>🎵</Text>
          <Text style={{ color: '#f8fafc', fontSize: '32rpx', fontWeight: '700' as const }}>{t.app.earTrainer}</Text>
        </View>
        <View style={{ display: 'flex' as const, gap: '4rpx' }}>
          {navItems.map(item => (
            <Text key={item.id}
              style={{ fontSize: '22rpx', fontWeight: '500' as const, paddingLeft: '16rpx', paddingRight: '16rpx', paddingTop: '10rpx', paddingBottom: '10rpx', borderRadius: '12rpx', color: activeNav === item.id ? '#f8fafc' : '#94a3b8', backgroundColor: activeNav === item.id ? '#7c3aed' : 'transparent' }}
              onClick={() => {
                if (item.id === 'menu') { stopAll(); goToMenu() }
                else if (item.id === 'review') { goToReview() }
                else { goToProgress() }
              }}>
              {item.label}
            </Text>
          ))}
        </View>
        <View style={{ display: 'flex' as const, gap: '12rpx', alignItems: 'center' as const }}>
          <Text
            style={{ fontSize: '24rpx', fontWeight: '600' as const, paddingLeft: '12rpx', paddingRight: '12rpx', paddingTop: '8rpx', paddingBottom: '8rpx', borderRadius: '10rpx', backgroundColor: '#334155', color: '#a78bfa' }}
            onClick={toggleLanguage}
          >
            {language === 'en' ? '中' : 'EN'}
          </Text>
          <View style={{ display: 'flex' as const, gap: '6rpx', alignItems: 'center' as const }}>
            <Text style={{ color: '#94a3b8', fontSize: '22rpx' }}>{t.app.score}:</Text>
            <Text style={{ color: '#a78bfa', fontSize: '26rpx', fontWeight: '700' as const }}>{progress.totalScore.toLocaleString()}</Text>
          </View>
        </View>
      </View>

      {/* ── MENU ── */}
      {status === 'menu' && (
        <ScrollView scrollY style={{ flex: 1 }}>
          <View style={{ padding: '40rpx 28rpx', display: 'flex' as const, flexDirection: 'column' as const, alignItems: 'center' as const, gap: '24rpx' }}>
            <View style={{ textAlign: 'center' as const, marginBottom: '12rpx' }}>
              <Text style={{ color: '#f8fafc', fontSize: '44rpx', fontWeight: '700' as const, display: 'block' as const }}>{t.menu.chooseDifficulty}</Text>
              <Text style={{ color: '#94a3b8', fontSize: '26rpx', marginTop: '8rpx', display: 'block' as const }}>{t.menu.trainYourEar}</Text>
            </View>
            {([
              { id: 'easy'   as Difficulty, emoji: '🛡', label: t.menu.easy,   color: '#4ade80', border: '#166534', bg: '#052e16', desc: t.menu.easyDesc, levels: '1–10' },
              { id: 'normal' as Difficulty, emoji: '⚔', label: t.menu.normal, color: '#fbbf24', border: '#92400e', bg: '#451a03', desc: t.menu.normalDesc, levels: '11–25' },
              { id: 'hard'   as Difficulty, emoji: '💀', label: t.menu.hard,   color: '#f87171', border: '#991b1b', bg: '#450a0a', desc: t.menu.hardDesc, levels: '26–50' },
            ] as const).map(d => (
              <Button key={d.id}
                style={{ width: '100%', backgroundColor: d.bg, borderWidth: 2, borderStyle: 'solid' as const, borderColor: d.border, borderRadius: '24rpx', padding: '36rpx', display: 'flex' as const, flexDirection: 'column' as const, alignItems: 'center' as const, gap: '12rpx' }}
                onClick={() => startGame(d.id, progress.highestLevel[d.id])}>
                <Text style={{ fontSize: '56rpx' }}>{d.emoji}</Text>
                <Text style={{ color: d.color, fontSize: '36rpx', fontWeight: '700' as const }}>{d.label}</Text>
                <Text style={{ color: '#94a3b8', fontSize: '24rpx', textAlign: 'center' as const }}>{d.desc}</Text>
                <View style={{ display: 'flex' as const, alignItems: 'center' as const, gap: '16rpx', marginTop: '8rpx' }}>
                  <Text style={{ color: '#64748b', fontSize: '24rpx' }}>{t.menu.levels} {d.levels}</Text>
                  <Text style={{ color: '#a78bfa', fontSize: '24rpx', fontWeight: '500' as const }}>{t.menu.best}: {progress.highestLevel[d.id]}</Text>
                </View>
              </Button>
            ))}
          </View>
        </ScrollView>
      )}

      {/* ── GAME BOARD ── */}
      {isPlaying && q && (
        <ScrollView scrollY style={{ flex: 1 }}>
          <View style={{ padding: '24rpx', display: 'flex' as const, flexDirection: 'column' as const, gap: '24rpx' }}>

            <ScoreBar state={state} onQuit={() => { stopAll(); goToMenu() }} t={t} />

            <View style={{ textAlign: 'center' as const }}>
              <Text style={{ color: '#64748b', fontSize: '22rpx', textTransform: 'uppercase' as const, letterSpacing: '2rpx' }}>
                {t.game.identifyThe} {q.type === 'interval' ? t.game.interval : t.game.chord}
              </Text>
            </View>

            <PianoKeyboard highlightedNotes={highlightedNotes} showHints={showHints || isFeedback} />

            {/* Controls */}
            <View style={{ display: 'flex' as const, alignItems: 'center' as const, justifyContent: 'center' as const, gap: '16rpx' }}>
              {status === 'playing' && (
                <Button
                  style={{ paddingLeft: '60rpx', paddingRight: '60rpx', paddingTop: '28rpx', paddingBottom: '28rpx', backgroundColor: '#7c3aed', color: '#fff', fontWeight: '700' as const, borderRadius: '24rpx', fontSize: '30rpx' }}
                  onClick={() => { stopAll(); handlePlaySound(); startAnswering() }}>
                  {t.game.playSound}
                </Button>
              )}
              {isAnswering && (
                <>
                  <Button
                    style={{ paddingLeft: '28rpx', paddingRight: '28rpx', paddingTop: '18rpx', paddingBottom: '18rpx', backgroundColor: '#334155', color: '#f8fafc', borderRadius: '16rpx', fontSize: '26rpx' }}
                    onClick={() => { stopAll(); handlePlaySound() }}>
                    {t.game.replay}
                  </Button>
                  {isFeedback && q.type === 'chord' && (
                    <Button
                      style={{ paddingLeft: '28rpx', paddingRight: '28rpx', paddingTop: '18rpx', paddingBottom: '18rpx', backgroundColor: '#334155', color: '#f8fafc', borderRadius: '16rpx', fontSize: '26rpx' }}
                      onClick={() => { stopAll(); handlePlayArpeggio() }}>
                      {t.game.playNotes}
                    </Button>
                  )}
                </>
              )}
            </View>

            {/* Answer options */}
            {isAnswering && (
              <AnswerGrid
                options={q.options}
                onSelect={opt => { stopAll(); handleSubmitAnswer(opt) }}
                disabled={isFeedback}
                correctAnswer={isFeedback ? q.targetName : undefined}
                userAnswer={isFeedback ? lastAnswer?.userAnswer : undefined}
                showResult={isFeedback}
              />
            )}

            {/* Feedback */}
            {isFeedback && lastAnswer && (
              <View style={{ display: 'flex' as const, flexDirection: 'column' as const, alignItems: 'center' as const, gap: '20rpx' }}>
                <View style={{ paddingLeft: '40rpx', paddingRight: '40rpx', paddingTop: '24rpx', paddingBottom: '24rpx', borderRadius: '16rpx', textAlign: 'center' as const, backgroundColor: lastAnswer.isCorrect ? '#052e16' : '#450a0a', borderWidth: 1, borderStyle: 'solid' as const, borderColor: lastAnswer.isCorrect ? '#059669' : '#dc2626' }}>
                  {lastAnswer.isCorrect ? (
                    <Text style={{ color: '#6ee7b7', fontSize: '28rpx', fontWeight: '700' as const }}>
                      {t.game.correct} {t.game.correctPoints.replace('{points}', String(state.score - prevScoreRef.current))}
                    </Text>
                  ) : (
                    <Text style={{ color: '#fca5a5', fontSize: '28rpx' }}>
                      {t.game.theAnswerWas} <Text style={{ fontWeight: '700' as const }}>{q.targetName}</Text>
                    </Text>
                  )}
                </View>
                <Button
                  style={{ paddingLeft: '40rpx', paddingRight: '40rpx', paddingTop: '24rpx', paddingBottom: '24rpx', backgroundColor: '#7c3aed', color: '#fff', fontWeight: '600' as const, borderRadius: '16rpx', fontSize: '28rpx' }}
                  onClick={() => { stopAll(); nextQuestion() }}>
                  {t.game.nextQuestion}
                </Button>
              </View>
            )}
          </View>
        </ScrollView>
      )}

      {/* ── REVIEW ── */}
      {status === 'review' && (() => {
        const mistakes    = getMistakes()
        const weaknesses  = getWeaknesses()
        const recent      = [...mistakes].reverse().slice(0, 50)
        return (
          <ScrollView scrollY style={{ flex: 1 }}>
            <View style={{ padding: '32rpx 28rpx', display: 'flex' as const, flexDirection: 'column' as const, gap: '40rpx' }}>

              <View>
                <Text style={{ color: '#f8fafc', fontSize: '34rpx', fontWeight: '700' as const, marginBottom: '20rpx', display: 'block' as const }}>
                  {t.review.areasToImprove}
                </Text>
                {weaknesses.length === 0 ? (
                  <Text style={{ color: '#64748b', fontSize: '26rpx' }}>{t.review.noMistakesRecorded}</Text>
                ) : (
                  <View style={{ display: 'flex' as const, flexWrap: 'wrap' as const, gap: '14rpx' }}>
                    {weaknesses.map(w => (
                      <View key={w.name} style={{ width: 'calc(50% - 7rpx)', backgroundColor: '#1e293b', borderWidth: 1, borderStyle: 'solid' as const, borderColor: '#334155', borderRadius: '16rpx', paddingLeft: '20rpx', paddingRight: '20rpx', paddingTop: '16rpx', paddingBottom: '16rpx', display: 'flex' as const, justifyContent: 'space-between' as const, alignItems: 'center' as const }}>
                        <Text style={{ color: '#f8fafc', fontSize: '24rpx', fontWeight: '500' as const }}>{w.name}</Text>
                        <Text style={{ color: '#f87171', fontSize: '22rpx', fontWeight: '700' as const }}>{w.count}x</Text>
                      </View>
                    ))}
                  </View>
                )}
              </View>

              <View>
                <Text style={{ color: '#f8fafc', fontSize: '34rpx', fontWeight: '700' as const, marginBottom: '20rpx', display: 'block' as const }}>
                  {t.review.recentMistakes}
                </Text>
                {recent.length === 0 ? (
                  <Text style={{ color: '#64748b', fontSize: '26rpx' }}>{t.review.noMistakesYet}</Text>
                ) : (
                  recent.map((m, i) => (
                    <View key={`${m.questionId}-${i}`} style={{ backgroundColor: '#1e293b', borderWidth: 1, borderStyle: 'solid' as const, borderColor: '#334155', borderRadius: '16rpx', paddingLeft: '24rpx', paddingRight: '24rpx', paddingTop: '18rpx', paddingBottom: '18rpx', marginBottom: '12rpx', display: 'flex' as const, justifyContent: 'space-between' as const, alignItems: 'center' as const, gap: '16rpx' }}>
                      <View style={{ flex: 1 }}>
                        <View style={{ display: 'flex' as const, gap: '12rpx', marginBottom: '8rpx' }}>
                          <Text style={{ color: '#64748b', fontSize: '20rpx', textTransform: 'uppercase' as const }}>{m.question.type}</Text>
                          <Text style={{ color: '#475569', fontSize: '20rpx' }}>{m.question.difficulty} · Lv.{m.question.level}</Text>
                        </View>
                        <View style={{ display: 'flex' as const, alignItems: 'center' as const, gap: '12rpx' }}>
                          <Text style={{ color: '#f87171', fontSize: '26rpx', textDecorationLine: 'line-through' as const }}>{m.userAnswer}</Text>
                          <Text style={{ color: '#475569' }}>→</Text>
                          <Text style={{ color: '#4ade80', fontSize: '26rpx', fontWeight: '600' as const }}>{m.correctAnswer}</Text>
                        </View>
                      </View>
                      <Button
                        style={{ paddingLeft: '20rpx', paddingRight: '20rpx', paddingTop: '14rpx', paddingBottom: '14rpx', backgroundColor: '#334155', borderRadius: '12rpx', color: '#94a3b8', fontSize: '24rpx' }}
                        onClick={() => handleReplay(m)}>{t.review.replay}</Button>
                    </View>
                  ))
                )}
              </View>
            </View>
          </ScrollView>
        )
      })()}

      {/* ── PROGRESS ── */}
      {status === 'progress' && (() => {
        const accuracy       = progress.totalQuestionsAnswered > 0 ? Math.round((progress.totalCorrect / progress.totalQuestionsAnswered) * 100) : 0
        const weaknesses     = getWeaknesses()
        const accuracyTrend  = getAccuracyOverTime()
        const maxWeak        = weaknesses.length > 0 ? weaknesses[0].count : 1

        return (
          <ScrollView scrollY style={{ flex: 1 }}>
            <View style={{ padding: '32rpx 28rpx', display: 'flex' as const, flexDirection: 'column' as const, gap: '28rpx' }}>

              {/* Stats grid */}
              <View style={{ display: 'flex' as const, flexWrap: 'wrap' as const, gap: '16rpx' }}>
                {([
                  { emoji: '🏆', label: t.progress.totalScore, value: progress.totalScore.toLocaleString(), color: '#a78bfa' },
                  { emoji: '📈', label: t.progress.accuracy,    value: `${accuracy}%`,                       color: '#4ade80' },
                  { emoji: '⏱',  label: t.progress.questions,   value: String(progress.totalQuestionsAnswered), color: '#fbbf24' },
                  { emoji: '✅', label: t.progress.correct,     value: String(progress.totalCorrect),         color: '#60a5fa' },
                ] as const).map(s => (
                  <View key={s.label} style={{ width: 'calc(50% - 8rpx)', backgroundColor: '#1e293b', borderWidth: 1, borderStyle: 'solid' as const, borderColor: '#334155', borderRadius: '16rpx', padding: '24rpx', display: 'flex' as const, flexDirection: 'column' as const, gap: '10rpx' }}>
                    <View style={{ display: 'flex' as const, alignItems: 'center' as const, gap: '10rpx' }}>
                      <Text style={{ fontSize: '26rpx' }}>{s.emoji}</Text>
                      <Text style={{ color: '#94a3b8', fontSize: '20rpx', textTransform: 'uppercase' as const }}>{s.label}</Text>
                    </View>
                    <Text style={{ color: s.color, fontSize: '44rpx', fontWeight: '700' as const }}>{s.value}</Text>
                  </View>
                ))}
              </View>

              {/* Highest levels */}
              <View style={{ backgroundColor: '#1e293b', borderWidth: 1, borderStyle: 'solid' as const, borderColor: '#334155', borderRadius: '16rpx', padding: '28rpx' }}>
                <Text style={{ color: '#f8fafc', fontSize: '30rpx', fontWeight: '700' as const, marginBottom: '20rpx', display: 'block' as const }}>{t.progress.highestLevels}</Text>
                <View style={{ display: 'flex' as const, gap: '32rpx' }}>
                  {([
                    { key: 'easy'   as Difficulty, label: t.menu.easy,   color: '#4ade80' },
                    { key: 'normal' as Difficulty, label: t.menu.normal, color: '#fbbf24' },
                    { key: 'hard'   as Difficulty, label: t.menu.hard,   color: '#f87171' },
                  ] as const).map(d => (
                    <View key={d.key} style={{ display: 'flex' as const, gap: '8rpx', alignItems: 'center' as const }}>
                      <Text style={{ color: d.color, fontSize: '24rpx', fontWeight: '500' as const }}>{d.label}:</Text>
                      <Text style={{ color: '#f8fafc', fontSize: '24rpx', fontWeight: '700' as const }}>{t.scoreBar.level}{progress.highestLevel[d.key]}</Text>
                    </View>
                  ))}
                </View>
              </View>

              {/* Accuracy trend bar chart */}
              {accuracyTrend.length > 1 && (
                <View style={{ backgroundColor: '#1e293b', borderWidth: 1, borderStyle: 'solid' as const, borderColor: '#334155', borderRadius: '16rpx', padding: '28rpx' }}>
                  <Text style={{ color: '#f8fafc', fontSize: '30rpx', fontWeight: '700' as const, marginBottom: '20rpx', display: 'block' as const }}>{t.progress.accuracyOverTime}</Text>
                  <View style={{ display: 'flex' as const, alignItems: 'flex-end' as const, gap: '4rpx', height: '160rpx' }}>
                    {accuracyTrend.map((b, i) => (
                      <View key={i} style={{ flex: 1, display: 'flex' as const, flexDirection: 'column' as const, alignItems: 'center' as const, justifyContent: 'flex-end' as const, height: '100%' }}>
                        <Text style={{ color: '#64748b', fontSize: '16rpx', marginBottom: '4rpx' }}>{b.accuracy}</Text>
                        <View style={{ width: '100%', height: `${Math.max(b.accuracy, 4)}%`, backgroundColor: b.accuracy >= 70 ? '#059669' : b.accuracy >= 50 ? '#d97706' : '#dc2626', borderRadius: '4rpx 4rpx 0 0' }} />
                      </View>
                    ))}
                  </View>
                  <View style={{ display: 'flex' as const, justifyContent: 'space-between' as const, marginTop: '8rpx' }}>
                    <Text style={{ color: '#64748b', fontSize: '20rpx' }}>{t.progress.older}</Text>
                    <Text style={{ color: '#64748b', fontSize: '20rpx' }}>{t.progress.recent}</Text>
                  </View>
                </View>
              )}

              {/* Most missed horizontal bars */}
              {weaknesses.length > 0 && (
                <View style={{ backgroundColor: '#1e293b', borderWidth: 1, borderStyle: 'solid' as const, borderColor: '#334155', borderRadius: '16rpx', padding: '28rpx' }}>
                  <Text style={{ color: '#f8fafc', fontSize: '30rpx', fontWeight: '700' as const, marginBottom: '20rpx', display: 'block' as const }}>{t.progress.mostMissed}</Text>
                  {weaknesses.map(w => (
                    <View key={w.name} style={{ marginBottom: '16rpx' }}>
                      <View style={{ display: 'flex' as const, justifyContent: 'space-between' as const, marginBottom: '6rpx' }}>
                        <Text style={{ color: '#94a3b8', fontSize: '24rpx' }}>{w.name}</Text>
                        <Text style={{ color: '#f87171', fontSize: '24rpx', fontWeight: '700' as const }}>{w.count}</Text>
                      </View>
                      <View style={{ backgroundColor: '#334155', borderRadius: '4rpx', height: '12rpx' }}>
                        <View style={{ width: `${Math.round((w.count / maxWeak) * 100)}%`, height: '100%', backgroundColor: '#ef4444', borderRadius: '4rpx' }} />
                      </View>
                    </View>
                  ))}
                </View>
              )}

              {progress.totalQuestionsAnswered === 0 && (
                <View style={{ textAlign: 'center' as const, paddingTop: '60rpx', paddingBottom: '60rpx' }}>
                  <Text style={{ color: '#64748b', fontSize: '32rpx', display: 'block' as const }}>{t.progress.noDataYet}</Text>
                  <Text style={{ color: '#475569', fontSize: '26rpx', marginTop: '8rpx', display: 'block' as const }}>{t.progress.startPlayingToSee}</Text>
                </View>
              )}
            </View>
          </ScrollView>
        )
      })()}
    </View>
  )
}
