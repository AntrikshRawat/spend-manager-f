import { Link } from 'react-router-dom'
import { HiOutlineEmojiSad } from 'react-icons/hi'

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-indigo-100 via-purple-50 to-pink-100 px-4">
      <div className="flex flex-col items-center">
        <HiOutlineEmojiSad className="text-7xl text-purple-400 mb-4 animate-bounce" />
        <h1 className="text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 mb-2">404</h1>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Page Not Found</h2>
        <p className="text-gray-500 mb-6 text-center max-w-md">Sorry, the page you are looking for does not exist or has been moved.</p>
        <Link
          to="/"
          className="px-6 py-3 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold shadow-lg hover:scale-105 hover:from-blue-700 hover:to-purple-700 transition-all duration-200"
        >
          Go Home
        </Link>
      </div>
    </div>
  )
} 