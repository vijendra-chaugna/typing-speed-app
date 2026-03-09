import { useState } from 'react'
import { AuthProvider } from './context/AuthContext'
import { useProgressHistory } from './hooks/useProgressHistory'
import Navbar from './components/Navbar'
import GamePage from './pages/GamePage'
import LeaderboardPage from './pages/LeaderboardPage'
import ProgressPanel from './components/ProgressPanel'

export default function App() {
  const [page, setPage] = useState('game')
  const { history, addEntry, clearHistory } = useProgressHistory()

  return (
    <AuthProvider>
      <div className="min-h-screen bg-bg text-text">
        <Navbar page={page} setPage={setPage} />
        <main>
          {page === 'game' && (
            <div className="max-w-3xl mx-auto px-4 space-y-8 pb-16">
              <GamePage onSessionComplete={addEntry} />
              <ProgressPanel history={history} onClear={clearHistory} />
            </div>
          )}
          {page === 'leaderboard' && <LeaderboardPage />}
        </main>
      </div>
    </AuthProvider>
  )
}