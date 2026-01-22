import { Outlet } from 'react-router-dom'
import Header from './Header'

export default function RootLayout() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-purple-50 to-pink-100">
      <Header />
      <main className="pt-16">
        <Outlet />
      </main>
    </div>
  )
} 