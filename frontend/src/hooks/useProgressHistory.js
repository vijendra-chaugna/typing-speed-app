import { useState, useCallback } from 'react'

const STORAGE_KEY = 'ts_progress_history'
const MAX_ENTRIES = 50

export function useProgressHistory() {
  const [history, setHistory] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY)) || []
    } catch {
      return []
    }
  })

  const addEntry = useCallback((entry) => {
    setHistory(prev => {
      const updated = [
        ...prev,
        {
          id:        Date.now(),
          date:      new Date().toISOString(),
          netWpm:    entry.netWpm,
          rawWpm:    entry.rawWpm,
          accuracy:  entry.accuracy,
          mistakes:  entry.mistakes,
          duration:  entry.duration,
          elapsed:   entry.elapsed,
        }
      ].slice(-MAX_ENTRIES)   // keep last 50
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
      return updated
    })
  }, [])

  const clearHistory = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY)
    setHistory([])
  }, [])

  return { history, addEntry, clearHistory }
}