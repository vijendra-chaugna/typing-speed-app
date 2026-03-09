import { useEffect, useRef, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import api from '../utils/api'
import toast from 'react-hot-toast'

export default function ResultsModal({ stats, onRetry, onNewText, onMount }) {
  const { user } = useAuth()
  const [saving, setSaving] = useState(false)
  const hasFired = useRef(false)   // ← guard against Strict Mode double-invoke

  useEffect(() => {
    if (hasFired.current) return
    hasFired.current = true

    // Save to local progress history
    onMount?.()

    // Save to backend if logged in
    if (!user) return
    const save = async () => {
      setSaving(true)
      try {
        await api.post('/scores', {
          net_wpm:          stats.netWpm,
          accuracy:         stats.accuracy,
          raw_wpm:          stats.rawWpm,
          duration_seconds: stats.elapsed,
          mistakes:         stats.mistakes,
          wpm_history:      null,
        })
        toast.success('Score saved to leaderboard!')
      } catch (e) {
        toast.error(`Could not save: ${e.message}`)
      } finally {
        setSaving(false)
      }
    }
    save()
  }, [])

  const grade = stats.netWpm >= 80 ? '🔥' : stats.netWpm >= 50 ? '⚡' : '💪'

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in">
      <div className="bg-surface border border-border rounded-2xl p-8 w-full max-w-md mx-4 animate-slide-up">
        <div className="text-center mb-6">
          <div className="text-5xl mb-2">{grade}</div>
          <h2 className="font-display text-3xl font-extrabold">
            {stats.netWpm} <span className="text-accent">wpm</span>
          </h2>
          <p className="text-muted font-mono text-sm mt-1">{stats.accuracy}% accuracy</p>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-6">
          {[
            { label: 'Raw WPM',  value: stats.rawWpm },
            { label: 'Mistakes', value: stats.mistakes },
            { label: 'Time',     value: `${stats.elapsed}s` },
          ].map(({ label, value }) => (
            <div key={label} className="bg-bg rounded-xl p-3 text-center">
              <div className="font-mono text-xl font-semibold">{value}</div>
              <div className="font-mono text-xs text-muted mt-1">{label}</div>
            </div>
          ))}
        </div>

        {!user && (
          <p className="text-center text-sm text-muted mb-4 font-mono">
            Sign in to save to the global leaderboard.
          </p>
        )}
        {saving && (
          <p className="text-center text-sm text-accent font-mono mb-4 animate-pulse-slow">
            saving score…
          </p>
        )}

        <div className="flex gap-3">
          <button onClick={onRetry}
            className="flex-1 py-3 bg-accent text-bg font-mono font-semibold rounded-xl hover:bg-yellow-300 transition-colors">
            retry
          </button>
          <button onClick={onNewText}
            className="flex-1 py-3 bg-surface border border-border font-mono text-text rounded-xl hover:border-accent hover:text-accent transition-all">
            new text
          </button>
        </div>
      </div>
    </div>
  )
}