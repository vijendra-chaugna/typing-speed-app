import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, ReferenceLine,
} from 'recharts'

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-surface border border-border rounded-lg px-3 py-2 font-mono text-sm">
      <p className="text-muted">{label}s</p>
      <p className="text-accent font-semibold">{payload[0].value} wpm</p>
    </div>
  )
}

export default function WpmChart({ wpmHistory, netWpm }) {
  if (!wpmHistory.length) return null

  const avg = Math.round(wpmHistory.reduce((s, d) => s + d.wpm, 0) / wpmHistory.length)

  return (
    <div className="bg-surface border border-border rounded-xl p-5 animate-fade-in">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-display font-bold text-lg">WPM Over Time</h3>
        <span className="font-mono text-xs text-muted">avg {avg} wpm</span>
      </div>
      <ResponsiveContainer width="100%" height={180}>
        <LineChart data={wpmHistory} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#2a2a35" />
          <XAxis
            dataKey="sec"
            tickFormatter={v => `${v}s`}
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
          <ReferenceLine
            y={netWpm}
            stroke="#e8ff47"
            strokeDasharray="4 4"
            strokeOpacity={0.4}
            label={{ value: 'net', fill: '#e8ff47', fontSize: 10, fontFamily: 'JetBrains Mono' }}
          />
          <Line
            type="monotone"
            dataKey="wpm"
            stroke="#e8ff47"
            strokeWidth={2}
            dot={{ fill: '#e8ff47', r: 3, strokeWidth: 0 }}
            activeDot={{ r: 5, fill: '#e8ff47' }}
            animationDuration={600}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
