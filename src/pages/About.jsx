import { FaGithub } from 'react-icons/fa'

export default function About() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-100 via-purple-50 to-pink-100 px-4 py-12">
      <div className="max-w-xl w-full bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl p-8 flex flex-col gap-6">
        <h1 className="text-3xl font-extrabold text-center bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">About Spend Manager</h1>
        <p className="text-gray-700 text-lg text-center">
          <b>Spend Manager</b> is a modern web app designed to help you manage shared expenses, track group spending, and keep your finances organized with friends, family, or roommates. Easily create accounts, add members, and monitor every transaction in a beautiful, intuitive interface.
        </p>
        <div className="border-t border-gray-200 pt-4">
          <h2 className="text-xl font-bold text-gray-800 mb-2">Developer</h2>
          <div className="flex flex-col items-center gap-2">
            <span className="font-semibold text-blue-700">Antriksh Rawat</span>
            <a
              href="https://github.com/AntrikshRawat"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-gray-700 hover:text-blue-600 transition text-sm"
            >
              <FaGithub className="text-lg" />https://github.com/AntrikshRawat
            </a>
            <a
              href="mailto:antrikshrawat2@gmail.com"
              className="text-sm text-blue-600 hover:underline"
            >
              antrikshrawat2@gmail.com
            </a>
          </div>
        </div>
      </div>
    </div>
  )
} 