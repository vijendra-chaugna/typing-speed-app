import { useState } from 'react'
import { useRandomText } from '../hooks/useRandomText'
import { useTypingEngine } from '../hooks/useTypingEngine'
import TypingArea from '../components/TypingArea'
import StatsBar from '../components/StatsBar'
import ResultsModal from '../components/ResultsModal'

const DURATIONS = [15, 30, 60, 120]

export default function GamePage({ onSessionComplete }) {
  const [duration, setDuration] = useState(60)
  const { text, refresh, switchDuration } = useRandomText(duration)

  const {
    input, handleInput,
    started, finished, reset,
    timeLeft, elapsed,
    mistakes, rawWpm, netWpm, accuracy,
    progress, charStates,
  } = useTypingEngine(text, duration)

  const handleDurationChange = (d) => {
    setDuration(d)
    switchDuration(d)
    reset()
  }

  const handleRetry = () => reset()

  const handleNewText = () => {
    reset()
    refresh()
  }

  // Called when results modal mounts — save to local history
  const handleFinish = (stats) => {
    onSessionComplete({ ...stats, duration })
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">

      {/* Duration picker */}
      <div className="flex items-center justify-center gap-2 mb-8">
        <div className="flex items-center gap-1 bg-surface border border-border rounded-xl p-1">
          {DURATIONS.map(d => (
            <button
              key={d}
              onClick={() => handleDurationChange(d)}
              className={`px-5 py-2 rounded-lg font-mono text-sm transition-all
                ${duration === d
                  ? 'bg-accent text-bg font-semibold'
                  : 'text-muted hover:text-text'}`}
            >
              {d}s
            </button>
          ))}
        </div>
        <button
          onClick={handleNewText}
          className="px-4 py-2 border border-border rounded-xl font-mono text-sm text-muted
                     hover:border-accent hover:text-accent transition-all"
        >
          ↺ new
        </button>
      </div>

      {/* Stats */}
      <StatsBar
        netWpm={netWpm} rawWpm={rawWpm}
        accuracy={accuracy} mistakes={mistakes}
        timeLeft={timeLeft} started={started}
      />

      {/* Progress bar */}
      <div className="h-0.5 bg-dim rounded-full mb-6 overflow-hidden">
        <div
          className="h-full bg-accent rounded-full transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Typing area */}
      <div className="bg-surface border border-border rounded-2xl p-8 mb-6">
        <TypingArea
          targetText={text}
          charStates={charStates}
          input={input}
          onInput={handleInput}
          finished={finished}
          loading={false}
        />
      </div>

      {/* Start hint */}
      {!started && (
        <p className="text-center font-mono text-sm text-dim mt-4 animate-pulse-slow">
          click the text and start typing…
        </p>
      )}

      {/* Results modal */}
      {finished && (
        <ResultsModal
          stats={{ netWpm, rawWpm, accuracy, mistakes, elapsed }}
          onRetry={handleRetry}
          onNewText={handleNewText}
          onMount={() => handleFinish({ netWpm, rawWpm, accuracy, mistakes, elapsed })}
        />
      )}
    </div>
  )
}