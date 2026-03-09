import { useState, useEffect, useRef, useCallback } from 'react'

export function useTypingEngine(targetText, duration = 60) {
  const [input,      setInput]      = useState('')
  const [started,    setStarted]    = useState(false)
  const [finished,   setFinished]   = useState(false)
  const [timeLeft,   setTimeLeft]   = useState(duration)
  const [mistakes,   setMistakes]   = useState(0)
  const [wpmHistory, setWpmHistory] = useState([])

  const intervalRef = useRef(null)
  const elapsedRef  = useRef(0)
  const mistakeSet  = useRef(new Set())

  // ── Helpers ──────────────────────────────────────────────────
  const calcWpm = useCallback((typed, seconds) => {
    if (seconds === 0) return 0
    const words = typed.trim().split(/\s+/).filter(Boolean).length
    return Math.round((words / seconds) * 60)
  }, [])

  const calcNetWpm = useCallback((typed, totalSeconds, errorCount) => {
    const raw = calcWpm(typed, totalSeconds)
    const penaltyPerMin = errorCount / (totalSeconds / 60)
    return Math.max(0, Math.round(raw - penaltyPerMin))
  }, [calcWpm])

  const calcAccuracy = useCallback((typed, target) => {
    if (!typed.length) return 100
    let correct = 0
    for (let i = 0; i < typed.length; i++) {
      if (typed[i] === target[i]) correct++
    }
    return Math.round((correct / typed.length) * 100)
  }, [])

  // ── Finish helper ─────────────────────────────────────────────
  const triggerFinish = useCallback(() => {
    clearInterval(intervalRef.current)
    intervalRef.current = null
    setFinished(true)
  }, [])

  // ── Timer ─────────────────────────────────────────────────────
  const startTimer = useCallback(() => {
    if (intervalRef.current) return
    intervalRef.current = setInterval(() => {
      elapsedRef.current += 1

      // WPM snapshot every 5 seconds
      if (elapsedRef.current % 5 === 0) {
        setInput(prev => {
          const wpm = calcWpm(prev, elapsedRef.current)
          setWpmHistory(h => [...h, { sec: elapsedRef.current, wpm }])
          return prev
        })
      }

      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(intervalRef.current)
          intervalRef.current = null
          setFinished(true)
          return 0
        }
        return prev - 1
      })
    }, 1000)
  }, [calcWpm])

  // ── Input handler ─────────────────────────────────────────────
  const handleInput = useCallback((value) => {
    if (finished) return

    // Don't allow typing beyond the target text length
    if (value.length > targetText.length) return

    if (!started && value.length > 0) {
      setStarted(true)
      startTimer()
    }

    // Detect new mistakes
    const pos = value.length - 1
    if (value.length > input.length && pos >= 0) {
      if (value[pos] !== targetText[pos]) {
        if (!mistakeSet.current.has(pos)) {
          mistakeSet.current.add(pos)
          setMistakes(m => m + 1)
        }
      }
    }

    setInput(value)

    // ✅ Auto-finish when full text is typed (regardless of timer)
    if (value === targetText) {
      triggerFinish()
    }
  }, [finished, started, input, targetText, startTimer, triggerFinish])

  // ── Reset ─────────────────────────────────────────────────────
  const reset = useCallback(() => {
    clearInterval(intervalRef.current)
    intervalRef.current = null
    elapsedRef.current  = 0
    mistakeSet.current  = new Set()
    setInput('')
    setStarted(false)
    setFinished(false)
    setTimeLeft(duration)
    setMistakes(0)
    setWpmHistory([])
  }, [duration])

  useEffect(() => () => clearInterval(intervalRef.current), [])
  useEffect(() => { reset() }, [targetText, reset])

  // ── Derived stats ─────────────────────────────────────────────
  const elapsed  = duration - timeLeft
  const rawWpm   = calcWpm(input, elapsed || 1)
  const netWpm   = calcNetWpm(input, elapsed || 1, mistakes)
  const accuracy = calcAccuracy(input, targetText)
  const progress = targetText.length ? (input.length / targetText.length) * 100 : 0

  const charStates = targetText.split('').map((ch, i) => {
    if (i >= input.length) return 'pending'
    return input[i] === ch ? 'correct' : 'wrong'
  })

  return {
    input, handleInput,
    started, finished, reset,
    timeLeft, elapsed,
    mistakes, rawWpm, netWpm, accuracy,
    progress, charStates, wpmHistory,
  }
}