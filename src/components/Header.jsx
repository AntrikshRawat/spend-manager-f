import { Link, useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { HiBell, HiUser } from 'react-icons/hi'
import useUserStore from '../store/useUserStore'

export default function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const [isNotificationOpen, setIsNotificationOpen] = useState(false)
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [logoutMessage, setLogoutMessage] = useState('');
  const {user,fetchUserInfo,setUser,logOutUser,isLoggedIn} = useUserStore();
  const navigate = useNavigate();
  useEffect(()=>{
    const getUser =async()=>{
      const user = await fetchUserInfo();
      setUser(user);
    }
    if(!user && isLoggedIn){
      getUser();
    }
  }, [fetchUserInfo, setUser,user,isLoggedIn])
  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY
      setIsScrolled(scrollPosition > 20)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen)
  }

  const toggleNotifications = () => {
    setIsNotificationOpen(!isNotificationOpen)
  }

  const handleLogout = async () => {
    setIsLoggingOut(true);
    setLogoutMessage('Logging out...');
    try {
      await logOutUser();
      setLogoutMessage('Logged out successfully!');
      setTimeout(() => {
        setIsLoggingOut(false);
        setLogoutMessage('');
        navigate('/login');
      }, 1000);
    } catch (error) {
      setLogoutMessage('Failed to log out. Please try again.');
      setTimeout(() => {
        setIsLoggingOut(false);
        setLogoutMessage('');
      }, 2000);
    }
  };

  return (
    <>
      {isLoggingOut && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-gradient-to-br from-indigo-900/60 to-purple-900/60 backdrop-blur-lg">
          <div className="bg-white/90 border border-white/30 backdrop-blur-xl shadow-2xl rounded-3xl px-10 py-8 flex flex-col items-center gap-5 animate-fade-in duration-300">
            {logoutMessage === 'Logging out...' ? (
              <>
                <svg
                  className="animate-spin h-10 w-10 text-indigo-600"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8v8z"
                  ></path>
                </svg>
                <span className="text-lg font-semibold text-indigo-700 tracking-wide animate-pulse">
                  {logoutMessage}
                </span>
              </>
            ) : (
              <span className="text-xl font-bold text-green-600 animate-bounce tracking-wide">
                {logoutMessage}
              </span>
            )}
          </div>
        </div>
      )}
      <header 
        className={`fixed top-0 left-0 right-0 z-50 transition-colors duration-500 ${
          isScrolled 
            ? 'bg-white/70 backdrop-blur-md shadow-md' 
            : 'bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900'
        } ${isLoggingOut ? 'filter blur-sm pointer-events-none select-none' : ''}`}
      >
        <nav className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className={`flex text-xl font-bold ${
                  isScrolled ? 'text-gray-800' : 'text-white'
                }`}>
            {user && (
                  <div className="relative inline-block">
                    <button
                      onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                      className="inline-block"
                    >
                      <div className="w-8 h-8 flex items-center justify-center rounded-full bg-blue-500 text-white font-bold text-lg mx-2">
                        {user.userName ? user.userName.charAt(0).toUpperCase() : ''}
                      </div>
                    </button>
                    
                    {/* User Menu Dropdown */}
                    {isUserMenuOpen && (
                      <div className="absolute left-0 mt-2 w-72 bg-white rounded-lg shadow-lg py-2 z-50">
                        <div className="px-4 py-3 border-b border-gray-100">
                          <h3 className="text-sm font-semibold text-gray-800">User Profile</h3>
                        </div>
                        <div className="px-4 py-3">
                        <p className="text-sm text-gray-600">
                            <span className="font-medium">UserName:</span> {user.userName}
                          </p>
                          <p className="text-sm text-gray-600">
                            <span className="font-medium">FullName:</span> {`${user.firstName}`.toUpperCase()} {`${user.lastName}`.toUpperCase()}
                          </p>
                          <p className="text-sm text-gray-600">
                            <span className="font-medium">Email:</span> {user.email}
                          </p>
                        </div>
                        <div className="px-4 py-2 border-t border-gray-100">
                          <Link
                            to="/change-password"
                            className="block w-full px-4 py-2 text-sm text-blue-600 hover:bg-gray-50 text-center"
                            onClick={() => setIsUserMenuOpen(false)}
                          >
                            Change Password
                          </Link>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              <Link 
                to="/" 
                className={`text-xl font-bold mx-1 ${
                  isScrolled ? 'text-gray-800' : 'text-white'
                }`}
              >
                Spend Manager
              </Link>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-6">
              <div className="flex space-x-6">
                <Link 
                  to="/" 
                  className={`transition-colors duration-200 ${
                    isScrolled 
                      ? 'text-gray-600 hover:text-gray-900' 
                      : 'text-gray-200 hover:text-white'
                  }`}
                >
                  Home
                </Link>
                <Link 
                  to="/about" 
                  className={`transition-colors duration-200 ${
                    isScrolled 
                      ? 'text-gray-600 hover:text-gray-900' 
                      : 'text-gray-200 hover:text-white'
                  }`}
                >
                  About
                </Link>
                {user && (
                  <Link
                    to="/my-accounts"
                    className={`transition-colors duration-200 ${
                      isScrolled 
                        ? 'text-gray-600 hover:text-gray-900' 
                        : 'text-gray-200 hover:text-white'
                    }`}
                  >
                    My Accounts
                  </Link>
                )}
              </div>

              <div className="flex items-center space-x-4">
                {/* Notification Bell - Only show if user is logged in */}
                {user && (
                  <div className="relative">
                    <button
                      onClick={toggleNotifications}
                      className={`p-2 rounded-full animate-bounce transition-colors duration-200 ${
                        isScrolled
                          ? 'text-gray-600 hover:bg-gray-100'
                          : 'text-white hover:bg-white/10'
                      }`}
                    >
                      <HiBell className="w-6 h-6 text-blue-500" />
                    </button>

                    {/* Notification Dropdown */}
                    {isNotificationOpen && (
                      <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg py-2 z-50">
                        <div className="px-4 py-2 border-b border-gray-100">
                          <h3 className="text-sm font-semibold text-gray-800">Notifications</h3>
                        </div>
                        <div className="max-h-96 overflow-y-auto">
                          <div className="px-4 py-3 hover:bg-gray-50 cursor-pointer">
                            <p className="text-sm text-gray-800">New expense added to Family Trip</p>
                            <p className="text-xs text-gray-500 mt-1">2 minutes ago</p>
                          </div>
                          <div className="px-4 py-3 hover:bg-gray-50 cursor-pointer">
                            <p className="text-sm text-gray-800">someone added you to a new account</p>
                            <p className="text-xs text-gray-500 mt-1">1 hour ago</p>
                          </div>
                          <div className="px-4 py-3 hover:bg-gray-50 cursor-pointer">
                            <p className="text-sm text-gray-800">Your monthly spending report is ready</p>
                            <p className="text-xs text-gray-500 mt-1">1 day ago</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                <div className="h-6 w-px bg-gray-300"></div>
                
                {user ? (
                  <button
                    onClick={handleLogout}
                    className="px-4 py-2 rounded-md bg-gradient-to-r from-red-500 to-red-600 text-white hover:from-red-600 hover:to-red-700 transition-all duration-200"
                  >
                    Logout
                  </button>
                ) : (
                  <>
                    <Link
                      to="/login"
                      className={`px-4 py-2 rounded-md transition-all duration-200 ${
                        isScrolled
                          ? 'text-gray-800 hover:bg-gray-100'
                          : 'text-white hover:bg-white/10'
                      }`}
                    >
                      Login
                    </Link>
                    <Link
                      to="/signup"
                      className={`px-4 py-2 rounded-md transition-all duration-200 ${
                        isScrolled
                          ? 'bg-gray-800 text-white hover:bg-gray-700'
                          : 'bg-white text-gray-800 hover:bg-gray-100'
                      }`}
                    >
                      Sign Up
                    </Link>
                  </>
                )}
              </div>
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden flex items-center space-x-4">
              {/* Mobile Notification Bell - Only show if user is logged in */}
              {user && (
                <button
                  onClick={toggleNotifications}
                  className={`p-2 rounded-full transition-colors duration-200 ${
                    isScrolled
                      ? 'text-gray-600 hover:bg-gray-100'
                      : 'text-white hover:bg-white/10'
                  }`}
                >
                  <HiBell className="w-6 h-6 animate-bounce text-green-500"/>
                </button>
              )}

              <button
                onClick={toggleMobileMenu}
                className={`inline-flex items-center justify-center p-2 rounded-md ${
                  isScrolled ? 'text-gray-600' : 'text-white'
                } hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white`}
                aria-expanded="false"
              >
                <span className="sr-only">Open main menu</span>
                {/* Hamburger icon */}
                <svg
                  className={`${isMobileMenuOpen ? 'hidden' : 'block'} h-6 w-6`}
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
                {/* Close icon */}
                <svg
                  className={`${isMobileMenuOpen ? 'block' : 'hidden'} h-6 w-6`}
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* Mobile menu */}
          <div className={`${isMobileMenuOpen ? 'block' : 'hidden'} md:hidden`}>
            <div className="pt-2 pb-3 space-y-1">
              <Link
                to="/"
                className={`block px-3 py-2 rounded-md text-base font-medium ${
                  isScrolled ? 'text-gray-600 hover:bg-gray-50' : 'text-white hover:bg-white/10'
                }`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Home
              </Link>
              <Link
                to="/about"
                className={`block px-3 py-2 rounded-md text-base font-medium ${
                  isScrolled ? 'text-gray-600 hover:bg-gray-50' : 'text-white hover:bg-white/10'
                }`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                About
              </Link>
              {user && (
                <>
                  <Link
                    to="/my-accounts"
                    className={`block px-3 py-2 rounded-md text-base font-medium ${
                      isScrolled ? 'text-gray-600 hover:bg-gray-50' : 'text-white hover:bg-white/10'
                    }`}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    My Accounts
                  </Link>
                  <button
                    onClick={() => {
                      handleLogout()
                      setIsMobileMenuOpen(false)
                    }}
                    className="text-left mx-2 px-3 py-2 rounded-md text-base font-medium bg-gradient-to-r from-red-500 to-red-600 text-white hover:from-red-600 hover:to-red-700 transition-all duration-200"
                  >
                    Logout
                  </button>
                </>
              )}
              {!user && (
                <>
                  <Link
                    to="/login"
                    className={`block px-3 py-2 rounded-md text-base font-medium ${
                      isScrolled ? 'text-gray-600 hover:bg-gray-50' : 'text-white hover:bg-white/10'
                    }`}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Login
                  </Link>
                  <Link
                    to="/signup"
                    className={`block px-3 py-2 rounded-md text-base font-medium ${
                      isScrolled ? 'text-gray-600 hover:bg-gray-50' : 'text-white hover:bg-white/10'
                    }`}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Sign Up
                  </Link>
                </>
              )}
            </div>
          </div>
        </nav>
      </header>
    </>
  )
} 