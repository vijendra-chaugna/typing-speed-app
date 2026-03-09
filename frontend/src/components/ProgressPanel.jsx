import { useState } from 'react'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer,
} from 'recharts'

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-surface border border-border rounded-lg px-3 py-2 font-mono text-xs space-y-1">
      <p className="text-muted mb-1">Run #{label}</p>
      {payload.map(p => (
        <p key={p.dataKey} style={{ color: p.color }}>
          {p.name}: <span className="font-semibold">{p.value}{p.name === 'accuracy' ? '%' : ''}</span>
        </p>
      ))}
    </div>
  )
}

export default function ProgressPanel({ history, onClear }) {
  const [view,   setView]   = useState('graph')  // 'graph' | 'table'
  const [filter, setFilter] = useState('all')    // 'all' | 15 | 30 | 60 | 120

  const filtered = history
    .filter(r => filter === 'all' || r.duration === Number(filter))
    .map((r, i) => ({ ...r, run: i + 1 }))

  const best    = filtered.length ? Math.max(...filtered.map(r => r.netWpm)) : 0
  const avgWpm  = filtered.length ? Math.round(filtered.reduce((s, r) => s + r.netWpm, 0) / filtered.length) : 0
  const avgAcc  = filtered.length ? Math.round(filtered.reduce((s, r) => s + r.accuracy, 0) / filtered.length) : 0

  if (!history.length) {
    return (
      <div className="bg-surface border border-border rounded-2xl p-8 text-center">
        <p className="text-4xl mb-3">📊</p>
        <p className="font-mono text-muted text-sm">No sessions yet. Complete a test to see your progress.</p>
      </div>
    )
  }

  return (
    <div className="bg-surface border border-border rounded-2xl p-6 space-y-6 animate-fade-in">

      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h2 className="font-display text-2xl font-extrabold">
          My <span className="text-accent">Progress</span>
        </h2>
        <div className="flex items-center gap-2">
          {/* Duration filter */}
          <div className="flex items-center gap-1 bg-bg border border-border rounded-xl p-1">
            {['all', '15', '30', '60', '120'].map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3 py-1 rounded-lg font-mono text-xs transition-all
                  ${filter === String(f)
                    ? 'bg-accent text-bg font-semibold'
                    : 'text-muted hover:text-text'}`}
              >
                {f === 'all' ? 'all' : `${f}s`}
              </button>
            ))}
          </div>

          {/* Graph / Table toggle */}
          <div className="flex items-center gap-1 bg-bg border border-border rounded-xl p-1">
            {['graph', 'table'].map(v => (
              <button
                key={v}
                onClick={() => setView(v)}
                className={`px-3 py-1 rounded-lg font-mono text-xs transition-all
                  ${view === v
                    ? 'bg-accent text-bg font-semibold'
                    : 'text-muted hover:text-text'}`}
              >
                {v === 'graph' ? '📈 graph' : '📋 table'}
              </button>
            ))}
          </div>

          <button
            onClick={onClear}
            className="font-mono text-xs text-muted hover:text-wrong transition-colors px-2"
            title="Clear history"
          >
            🗑 clear
          </button>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'best wpm',  value: best },
          { label: 'avg wpm',   value: avgWpm },
          { label: 'avg acc',   value: `${avgAcc}%` },
        ].map(({ label, value }) => (
          <div key={label} className="bg-bg rounded-xl p-4 text-center border border-border">
            <div className="font-mono text-2xl font-bold text-accent">{value}</div>
            <div className="font-mono text-xs text-muted mt-1 uppercase tracking-widest">{label}</div>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <p className="text-center font-mono text-sm text-muted py-4">
          No sessions for this duration yet.
        </p>
      )}

      {/* ── GRAPH VIEW ── */}
      {view === 'graph' && filtered.length > 0 && (
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={filtered} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#2a2a35" />
            <XAxis
              dataKey="run"
              tickFormatter={v => `#${v}`}
              tick={{ fill: '#6b6b80', fontFamily: 'JetBrains Mono', fontSize: 11 }}
              axisLine={{ stroke: '#2a2a35' }}
              tickLine={false}
            />
            <YAxis
              tick={{ fill: '#6b6b80', fontFamily: 'JetBrains Mono', fontSize: 11 }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend
              wrapperStyle={{ fontFamily: 'JetBrains Mono', fontSize: 11, color: '#6b6b80' }}
            />
            <Line
              type="monotone"
              dataKey="netWpm"
              name="net wpm"
              stroke="#e8ff47"
              strokeWidth={2}
              dot={{ fill: '#e8ff47', r: 3, strokeWidth: 0 }}
              activeDot={{ r: 5 }}
              animationDuration={500}
            />
            <Line
              type="monotone"
              dataKey="accuracy"
              name="accuracy"
              stroke="#4ade80"
              strokeWidth={2}
              dot={{ fill: '#4ade80', r: 3, strokeWidth: 0 }}
              activeDot={{ r: 5 }}
              animationDuration={500}
            />
          </LineChart>
        </ResponsiveContainer>
      )}

      {/* ── TABLE VIEW ── */}
      {view === 'table' && filtered.length > 0 && (
        <div className="overflow-x-auto">
          <table className="w-full font-mono text-sm">
            <thead>
              <tr className="border-b border-border">
                {['#', 'date', 'duration', 'net wpm', 'raw wpm', 'accuracy', 'mistakes'].map(h => (
                  <th key={h} className="text-left py-2 px-3 text-xs text-muted uppercase tracking-widest font-normal">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[...filtered].reverse().map((row) => (
                <tr
                  key={row.id}
                  className="border-b border-border/40 hover:bg-bg transition-colors"
                >
                  <td className="py-2.5 px-3 text-muted">{row.run}</td>
                  <td className="py-2.5 px-3 text-muted text-xs">
                    {new Date(row.date).toLocaleDateString('en-US', {
                      month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                    })}
                  </td>
                  <td className="py-2.5 px-3 text-muted">{row.duration}s</td>
                  <td className={`py-2.5 px-3 font-semibold
                    ${row.netWpm === best ? 'text-accent' : 'text-text'}`}>
                    {row.netWpm}
                    {row.netWpm === best && <span className="ml-1 text-xs">👑</span>}
                  </td>
                  <td className="py-2.5 px-3 text-muted">{row.rawWpm}</td>
                  <td className={`py-2.5 px-3
                    ${row.accuracy >= 95 ? 'text-correct' : row.accuracy >= 80 ? 'text-text' : 'text-wrong'}`}>
                    {row.accuracy}%
                  </td>
                  <td className={`py-2.5 px-3
                    ${row.mistakes === 0 ? 'text-correct' : row.mistakes <= 3 ? 'text-text' : 'text-wrong'}`}>
                    {row.mistakes}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}