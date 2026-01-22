import { Link } from "react-router-dom";
import Footer from "../components/Footer";
import useUserStore from "../store/useUserStore";
import LottieAnimation from "../components/LottieAnimation";

export default function HomePage() {
  const user = useUserStore(u=>u.user);
  return (
    <>
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-purple-50 to-pink-100">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 via-purple-600/10 to-pink-600/10"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative z-10 pb-8 sm:pb-16 md:pb-20 lg:pb-28 xl:pb-32">
            <main className="mt-10 sm:mt-12 md:mt-16 lg:mt-20 xl:mt-28">
              <div className="lg:grid lg:grid-cols-12 lg:gap-8 items-center">
                {/* Animation - First in mobile, Right side in desktop */}
                <div className="lg:col-span-6 lg:order-2 flex items-center justify-center">
                  <div className="relative w-full max-w-lg mx-auto">
                      <LottieAnimation />
                  </div>
                </div>

                {/* Content - Second in mobile, Left side in desktop */}
                <div className="mt-10 lg:mt-0 sm:text-center lg:text-left lg:col-span-6 lg:order-1">
                  <h1 className="text-4xl tracking-tight font-extrabold text-gray-900 sm:text-5xl md:text-6xl">
                    <span className="block">Manage your shared</span>
                    <span className="block gradient-flow-text">
                      expenses with ease
                    </span>
                  </h1>
                  <p className="mt-3 text-base text-gray-600 sm:mt-5 sm:text-lg sm:max-w-xl sm:mx-auto md:mt-5 md:text-xl lg:mx-0">
                    Track shared expenses, split bills, and manage group finances
                    effortlessly. Perfect for roommates, friends, and family.
                  </p>
                  <div className="mt-5 sm:mt-8 sm:flex sm:justify-center lg:justify-start">
                    <div className="rounded-md shadow">
                      <Link
                        to={!user ? "/signup" : "/create-account"}
                        className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white gradient-flow hover:from-blue-700 hover:to-purple-700 md:py-4 md:text-lg md:px-10 transition-all duration-200 transform hover:scale-105"
                      >
                        Get Started
                      </Link>
                    </div>
                    <div className="mt-3 sm:mt-0 sm:ml-3">
                      <Link
                        to={!user ? "/login" : "/my-accounts"}
                        className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200 md:py-4 md:text-lg md:px-10 transition-all duration-200 transform hover:scale-105"
                      >
                        View Accounts
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </main>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="py-12 sm:py-16">
        <h1 className="text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl w-full text-center mb-12">
          Our Goal To Reach
        </h1>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
            <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl p-6 text-center transform transition-all duration-300 hover:scale-105 shadow-lg">
              <div className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
                10K+
              </div>
              <div className="text-gray-600">Active Users</div>
            </div>
            <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-6 text-center transform transition-all duration-300 hover:scale-105 shadow-lg">
              <div className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
                50K+
              </div>
              <div className="text-gray-600">Transactions</div>
            </div>
            <div className="bg-gradient-to-br from-pink-50 to-red-50 rounded-xl p-6 text-center transform transition-all duration-300 hover:scale-105 shadow-lg">
              <div className="text-4xl font-bold bg-gradient-to-r from-pink-600 to-red-600 bg-clip-text text-transparent mb-2">
                ₹1M+
              </div>
              <div className="text-gray-600">Total Expenses</div>
            </div>
            <div className="bg-gradient-to-br from-red-50 to-orange-50 rounded-xl p-6 text-center transform transition-all duration-300 hover:scale-105 shadow-lg">
              <div className="text-4xl font-bold bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent mb-2">
                4.9/5
              </div>
              <div className="text-gray-600">User Rating</div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-12 bg-white/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:text-center">
            <h2 className="text-base text-blue-600 font-semibold tracking-wide uppercase">
              Features
            </h2>
            <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
              Everything you need to manage shared expenses
            </p>
          </div>

          <div className="mt-10">
            <div className="space-y-10 md:space-y-0 md:grid md:grid-cols-2 md:gap-x-8 md:gap-y-10">
              {/* Feature 1 */}
              <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg blur opacity-25 group-hover:opacity-100 transition duration-1000 group-hover:duration-200"></div>
                <div className="relative p-6 bg-white/80 backdrop-blur-sm rounded-lg shadow-lg">
                  <div className="flex items-center justify-center h-12 w-12 rounded-md bg-gradient-to-r from-blue-500 to-purple-500 text-white mb-4">
                    <svg
                      className="h-6 w-6"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                      />
                    </svg>
                  </div>
                  <h3 className="text-lg leading-6 font-medium text-gray-900">
                    Group Accounts
                  </h3>
                  <p className="mt-2 text-base text-gray-600">
                    Create shared accounts with up to 6 members. Perfect for
                    roommates, friends, or family members.
                  </p>
                </div>
              </div>

              {/* Feature 2 */}
              <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg blur opacity-25 group-hover:opacity-100 transition duration-1000 group-hover:duration-200"></div>
                <div className="relative p-6 bg-white/80 backdrop-blur-sm rounded-lg shadow-lg">
                  <div className="flex items-center justify-center h-12 w-12 rounded-md bg-gradient-to-r from-purple-500 to-pink-500 text-white mb-4">
                    <svg
                      className="h-6 w-6"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                      />
                    </svg>
                  </div>
                  <h3 className="text-lg leading-6 font-medium text-gray-900">
                    Real-time Notifications
                  </h3>
                  <p className="mt-2 text-base text-gray-600">
                    Get instant notifications when members add new payments to
                    your shared accounts.
                  </p>
                </div>
              </div>

              {/* Feature 3 */}
              <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-pink-600 to-red-600 rounded-lg blur opacity-25 group-hover:opacity-100 transition duration-1000 group-hover:duration-200"></div>
                <div className="relative p-6 bg-white/80 backdrop-blur-sm rounded-lg shadow-lg">
                  <div className="flex items-center justify-center h-12 w-12 rounded-md bg-gradient-to-r from-pink-500 to-red-500 text-white mb-4">
                    <svg
                      className="h-6 w-6"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                  <h3 className="text-lg leading-6 font-medium text-gray-900">
                    Expense Tracking
                  </h3>
                  <p className="mt-2 text-base text-gray-600">
                    Track individual and group spending. See who spent what and
                    monitor total expenses.
                  </p>
                </div>
              </div>

              {/* Feature 4 */}
              <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-red-600 to-orange-600 rounded-lg blur opacity-25 group-hover:opacity-100 transition duration-1000 group-hover:duration-200"></div>
                <div className="relative p-6 bg-white/80 backdrop-blur-sm rounded-lg shadow-lg">
                  <div className="flex items-center justify-center h-12 w-12 rounded-md bg-gradient-to-r from-red-500 to-orange-500 text-white mb-4">
                    <svg
                      className="h-6 w-6"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12l2 2 4-4m-6 8h6M5 12h.01M19 12h.01M4 8h16M4 16h16"
                      />
                    </svg>
                  </div>
                  <h3 className="text-lg leading-6 font-medium text-gray-900">
                    AI Analyzer
                  </h3>
                  <p className="mt-2 text-base text-gray-600">
                    Summarizes account activity — who paid, who spent, and who
                    owes whom.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* How It Works Section */}
      <div className="py-16 bg-gradient-to-br from-purple-50 to-pink-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
              How It Works
            </h2>
            <p className="mt-4 text-lg text-gray-600">
              Get started in three simple steps
            </p>
          </div>

          <div className="mt-12">
            <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
              <div className="relative">
                <div className="flex items-center justify-center h-12 w-12 rounded-md bg-gradient-to-r from-blue-500 to-purple-500 text-white text-xl font-bold">
                  1
                </div>
                <h3 className="mt-4 text-lg font-medium text-gray-900">
                  Create an Account
                </h3>
                <p className="mt-2 text-base text-gray-600">
                  Sign up and create your profile. It takes less than a minute
                  to get started.
                </p>
              </div>

              <div className="relative">
                <div className="flex items-center justify-center h-12 w-12 rounded-md bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xl font-bold">
                  2
                </div>
                <h3 className="mt-4 text-lg font-medium text-gray-900">
                  Add Group Members
                </h3>
                <p className="mt-2 text-base text-gray-600">
                  Invite up to 6 members to join your shared expense group.
                </p>
              </div>

              <div className="relative">
                <div className="flex items-center justify-center h-12 w-12 rounded-md bg-gradient-to-r from-pink-500 to-red-500 text-white text-xl font-bold">
                  3
                </div>
                <h3 className="mt-4 text-lg font-medium text-gray-900">
                  Start Tracking
                </h3>
                <p className="mt-2 text-base text-gray-600">
                  Begin adding expenses and let the app handle the rest.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
    </>
  );
}
