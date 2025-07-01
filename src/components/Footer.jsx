import { useState } from 'react'
import { Link } from 'react-router-dom'
import { HiStar, HiOutlineX } from 'react-icons/hi'
import useUserStore from '../store/useUserStore'

export default function Footer() {
  const [showModal, setShowModal] = useState(false)
  const [rating, setRating] = useState(0)
  const [hover, setHover] = useState(0)
  const [submitted, setSubmitted] = useState(false)
  const { user } = useUserStore();

  const handleSubmit = (e) => {
    e.preventDefault()
    setSubmitted(true)
    setTimeout(() => {
      setShowModal(false)
      setSubmitted(false)
      setRating(0)
    }, 1500)
  }

  return (
    <footer className="relative bg-gradient-to-r from-blue-600 to-purple-600 text-white py-8 px-4 ">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex flex-col items-center md:items-start">
          <span className="font-bold text-lg tracking-wide">Money Spending Manager</span>
          <span className="text-sm text-blue-100">&copy; {new Date().getFullYear()} All rights reserved.</span>
        </div>
        <div className="flex gap-6 mt-4 md:mt-0">
          <Link to="/" className="hover:underline hover:text-blue-200 transition">Home</Link>
          <Link to="/about" className="hover:underline hover:text-blue-200 transition">About</Link>
          <Link to={!user?"/login":"/my-accounts"} className="hover:underline hover:text-blue-200 transition">My Accounts</Link>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="mt-4 md:mt-0 px-5 py-2 rounded-lg bg-white/20 hover:bg-white/30 text-white font-semibold shadow transition-all duration-200"
        >
          Send Feedback
        </button>
      </div>

      {/* Feedback Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-xs relative animate-fadeIn">
            <button
              className="absolute top-3 right-3 text-gray-400 hover:text-gray-700 text-2xl"
              onClick={() => setShowModal(false)}
              aria-label="Close"
            >
              <HiOutlineX />
            </button>
            <h3 className="text-xl font-bold text-gray-800 mb-4 text-center">Rate Your Experience</h3>
            <form onSubmit={handleSubmit} className="flex flex-col items-center">
              <div className="flex gap-1 mb-4">
                {[1,2,3,4,5].map(star => (
                  <button
                    type="button"
                    key={star}
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHover(star)}
                    onMouseLeave={() => setHover(0)}
                    className="focus:outline-none"
                  >
                    <HiStar
                      className={`text-3xl transition-colors duration-150 ${
                        (hover || rating) >= star ? 'text-yellow-400' : 'text-gray-300'
                      }`}
                    />
                  </button>
                ))}
              </div>
              <button
                type="submit"
                disabled={rating === 0 || submitted}
                className="w-full px-4 py-2 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold shadow hover:from-blue-700 hover:to-purple-700 transition-all duration-200 disabled:opacity-60"
              >
                {submitted ? 'Thank you!' : 'Submit'}
              </button>
            </form>
          </div>
        </div>
      )}
    </footer>
  )
} 