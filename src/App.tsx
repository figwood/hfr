import { useState } from 'react'
import { Routes, Route, NavLink, Navigate, useLocation } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import LoginPage from './pages/LoginPage'
import ItemList from './components/ItemList'
import HistoryPage from './components/HistoryPage'
import AddItemModal from './components/AddItemModal'

function ProtectedLayout() {
  const { isAuthenticated, logout, user } = useAuth()
  const [showAdd, setShowAdd] = useState(false)
  const location = useLocation()

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Top bar */}
      <header className="bg-white border-b border-gray-200 px-4 pt-safe-top">
        <div className="flex items-center justify-between h-14">
          <h1 className="text-xl font-bold text-gray-900">家鲜记</h1>
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-500">{user?.username}</span>
            <button
              onClick={logout}
              className="text-sm text-gray-400 active:text-red-500"
            >
              退出
            </button>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto">
        <Routes>
          <Route path="/" element={<ItemList />} />
          <Route path="/history" element={<HistoryPage />} />
        </Routes>
      </main>

      {/* Bottom navigation */}
      <nav className="bg-white border-t border-gray-200 pb-safe-bottom">
        <div className="flex items-center h-16">
          <NavLink
            to="/"
            end
            className={({ isActive }) =>
              `flex-1 flex flex-col items-center justify-center gap-0.5 text-xs font-medium transition-colors ${
                isActive ? 'text-green-600' : 'text-gray-400'
              }`
            }
          >
            <span className="text-xl">🥗</span>
            <span>物品</span>
          </NavLink>

          {/* Add button */}
          <div className="flex-1 flex items-center justify-center">
            <button
              onClick={() => setShowAdd(true)}
              className="w-14 h-14 rounded-full bg-green-600 text-white text-3xl flex items-center justify-center shadow-lg active:bg-green-700 -mt-5"
            >
              +
            </button>
          </div>

          <NavLink
            to="/history"
            className={({ isActive }) =>
              `flex-1 flex flex-col items-center justify-center gap-0.5 text-xs font-medium transition-colors ${
                isActive ? 'text-green-600' : 'text-gray-400'
              }`
            }
          >
            <span className="text-xl">📦</span>
            <span>历史</span>
          </NavLink>
        </div>
      </nav>

      {showAdd && <AddItemModal onClose={() => setShowAdd(false)} />}
    </div>
  )
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/*" element={<ProtectedLayout />} />
    </Routes>
  )
}
