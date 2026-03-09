export default function StatsBar({ netWpm, rawWpm, accuracy, mistakes, timeLeft, started }) {
  const stats = [
    { label: 'wpm',      value: netWpm,    unit: '',  accent: true },
    { label: 'raw',      value: rawWpm,    unit: ''  },
    { label: 'accuracy', value: accuracy,  unit: '%' },
    { label: 'mistakes', value: mistakes,  unit: ''  },
    { label: 'time',     value: timeLeft,  unit: 's' },
  ]

  return (
    <div className="flex items-center justify-center gap-8 py-4">
      {stats.map(({ label, value, unit, accent }) => (
        <div key={label} className="text-center">
          <div className={`font-mono text-3xl font-semibold tabular-nums
            ${accent ? 'text-accent' : 'text-text'}`}>
            {started ? `${value}${unit}` : `—`}
          </div>
          <div className="font-mono text-xs text-muted mt-1 uppercase tracking-widest">
            {label}
          </div>
        </div>
      ))}
    </div>
  )
}
