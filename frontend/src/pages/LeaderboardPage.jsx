import { useLeaderboard } from '../hooks/useLeaderboard'

const MEDALS = ['🥇', '🥈', '🥉']

export default function LeaderboardPage() {
  const { data, loading, error, refetch } = useLeaderboard()

  return (
    <div className="max-w-2xl mx-auto px-4 py-10 animate-fade-in">
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-display text-4xl font-extrabold">
          Leader<span className="text-accent">board</span>
        </h1>
        <button
          onClick={refetch}
          className="font-mono text-sm text-muted hover:text-accent transition-colors"
        >
          ↻ refresh
        </button>
      </div>

      {loading && (
        <div className="flex justify-center py-20">
          <div className="flex gap-1">
            {[0,1,2].map(i => (
              <span key={i} className="w-2 h-2 rounded-full bg-accent animate-bounce"
                style={{ animationDelay: `${i * 0.15}s` }} />
            ))}
          </div>
        </div>
      )}

      {error && (
        <div className="bg-surface border border-wrong/40 rounded-xl p-4 text-wrong font-mono text-sm">
          Failed to load: {error}
        </div>
      )}

      {!loading && !error && data.length === 0 && (
        <p className="text-center text-muted font-mono py-20">
          No scores yet. Be the first!
        </p>
      )}

      {!loading && data.length > 0 && (
        <div className="space-y-2">
          {/* Header */}
          <div className="grid grid-cols-12 px-4 pb-2 font-mono text-xs text-muted uppercase tracking-widest">
            <span className="col-span-1">#</span>
            <span className="col-span-5">player</span>
            <span className="col-span-2 text-right">wpm</span>
            <span className="col-span-2 text-right">acc</span>
            <span className="col-span-2 text-right">date</span>
          </div>

          {data.map((row, idx) => (
            <div
              key={row.id}
              className={`grid grid-cols-12 items-center px-4 py-3 rounded-xl border transition-all
                ${idx === 0
                  ? 'bg-accent/10 border-accent/30'
                  : 'bg-surface border-border hover:border-dim'
                }`}
            >
              {/* Rank */}
              <span className="col-span-1 font-mono text-sm font-bold">
                {MEDALS[idx] ?? <span className="text-muted">{idx + 1}</span>}
              </span>

              {/* Player */}
              <div className="col-span-5 flex items-center gap-2">
                {row.avatar_url ? (
                  <img src={row.avatar_url} className="w-6 h-6 rounded-full" alt="" />
                ) : (
                  <div className="w-6 h-6 rounded-full bg-dim flex items-center justify-center
                                  text-xs font-mono text-muted">
                    {(row.username?.[0] || '?').toUpperCase()}
                  </div>
                )}
                <span className="font-mono text-sm truncate">{row.username || 'Guest'}</span>
              </div>

              {/* WPM */}
              <span className={`col-span-2 text-right font-mono font-bold
                ${idx === 0 ? 'text-accent' : 'text-text'}`}>
                {row.net_wpm}
              </span>

              {/* Accuracy */}
              <span className="col-span-2 text-right font-mono text-sm text-muted">
                {row.accuracy}%
              </span>

              {/* Date */}
              <span className="col-span-2 text-right font-mono text-xs text-dim">
                {new Date(row.created_at).toLocaleDateString('en-US', {
                  month: 'short', day: 'numeric'
                })}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
