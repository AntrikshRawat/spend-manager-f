import { FaGithub, FaEnvelope, FaGlobe, FaCheckCircle } from 'react-icons/fa'

export default function About() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-purple-50 to-pink-100 px-4 py-12">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Header Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-extrabold gradient-flow-text mb-4">
            About Spend Manager
          </h1>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Your ultimate companion for managing shared expenses and group finances
          </p>
        </div>

        {/* Description Section */}
        <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl p-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            <span className="text-blue-600">📋</span>
            What is Spend Manager?
          </h2>
          <p className="text-gray-700 text-lg leading-relaxed">
            <b>Spend Manager</b> is a modern, intuitive web application designed to simplify the way you manage shared expenses. 
            Whether you're splitting bills with roommates, tracking group expenses with friends, or managing family finances, 
            Spend Manager provides a seamless experience to keep everyone on the same page. Create accounts, add members, 
            track transactions, and Spend Manager payments all in one interface.
          </p>
        </div>
        {/* Features Section */}
        <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl p-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
            <span className="text-purple-600">✨</span>
            Key Features
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-start gap-3 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg">
              <FaCheckCircle className="text-blue-600 text-xl mt-1 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-gray-800 mb-1">Shared Accounts</h3>
                <p className="text-gray-600 text-sm">Create and manage multiple shared accounts with friends and family</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg">
              <FaCheckCircle className="text-purple-600 text-xl mt-1 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-gray-800 mb-1">Transaction Tracking</h3>
                <p className="text-gray-600 text-sm">Keep detailed records of every expense with timestamps and descriptions</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-4 bg-gradient-to-r from-pink-50 to-red-50 rounded-lg">
              <FaCheckCircle className="text-pink-600 text-xl mt-1 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-gray-800 mb-1">Smart Settlements</h3>
                <p className="text-gray-600 text-sm">Easily settle payments and track who owes whom</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-4 bg-gradient-to-r from-green-50 to-teal-50 rounded-lg">
              <FaCheckCircle className="text-green-600 text-xl mt-1 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-gray-800 mb-1">Real-time Updates</h3>
                <p className="text-gray-600 text-sm">Get instant notifications when transactions are added or settled</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-4 bg-gradient-to-r from-teal-50 to-cyan-50 rounded-lg">
              <FaCheckCircle className="text-teal-600 text-xl mt-1 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-gray-800 mb-1">AI-Powered Insights</h3>
                <p className="text-gray-600 text-sm">Get intelligent summaries and spending patterns with AI analysis</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-4 bg-gradient-to-r from-indigo-50 to-blue-50 rounded-lg">
              <FaCheckCircle className="text-indigo-600 text-xl mt-1 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-gray-800 mb-1">Secure & Private</h3>
                <p className="text-gray-600 text-sm">Your financial data is encrypted and protected with industry-standard security</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-4 bg-gradient-to-r from-amber-50 to-orange-50 rounded-lg">
              <FaCheckCircle className="text-amber-600 text-xl mt-1 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-gray-800 mb-1">Personal Accounts</h3>
                <p className="text-gray-600 text-sm">Manage your individual expenses alongside shared accounts</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-4 bg-gradient-to-r from-rose-50 to-pink-50 rounded-lg">
              <FaCheckCircle className="text-rose-600 text-xl mt-1 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-gray-800 mb-1">Detailed Reports</h3>
                <p className="text-gray-600 text-sm">View comprehensive spending reports and transaction history</p>
              </div>
            </div>
          </div>
        </div>

        {/* Developer Section */}
        <div className="gradient-flow rounded-2xl shadow-xl p-8 text-white">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <span>👨‍💻</span>
            About the Developer
          </h2>
          <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
            <div className="w-24 h-24 rounded-full bg-white/20 backdrop-blur-lg flex items-center justify-center text-4xl font-bold">
              AR
            </div>
            <div className="flex-1 text-center md:text-left">
              <h3 className="text-2xl font-bold mb-2">Antriksh Rawat</h3>
              <p className="text-blue-100 mb-4">Full Stack Developer</p>
              <p className="text-white/90 mb-6 leading-relaxed">
                Passionate about creating intuitive and powerful web applications that solve real-world problems. 
                Spend Manager was built with the goal of making expense tracking simple, accessible to everyone.
              </p>
              <div className="flex flex-col gap-3">
                <a
                  href="mailto:antrikshrawat2@gmail.com"
                  className="flex items-center justify-center md:justify-start gap-2 text-white hover:text-blue-200 transition"
                >
                  <FaEnvelope className="text-lg" />
                  <span>antrikshrawat2@gmail.com</span>
                </a>
                <a
                  href="https://antrikshrawat.me"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center md:justify-start gap-2 text-white hover:text-blue-200 transition"
                >
                  <FaGlobe className="text-lg" />
                  <span>antrikshrawat.me</span>
                </a>
                <a
                  href="https://github.com/AntrikshRawat"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center md:justify-start gap-2 text-white hover:text-blue-200 transition"
                >
                  <FaGithub className="text-lg" />
                  <span>github.com/AntrikshRawat</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 