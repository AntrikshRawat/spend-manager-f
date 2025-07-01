import { Outlet } from 'react-router-dom'
import Header from './Header'

export default function RootLayout() {
  return (
    <div className="min-h-screen bg-gray-100">
      <Header />
      <main className="pt-16">
        <Outlet />
      </main>
    </div>
  )
} 