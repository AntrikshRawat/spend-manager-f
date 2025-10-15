import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect, useRef, useCallback } from "react";
import { HiBell } from "react-icons/hi";
import useUserStore from "../store/useUserStore";
import socket from "../socket";
import { toast } from "react-toastify";
import { FaUser } from "react-icons/fa";
import axiosInstance from "../functions/axiosInstance";

export default function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [logoutMessage, setLogoutMessage] = useState("");
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  
  // Use ref to track if component is mounted
  const isMountedRef = useRef(true);
  const logoutTimeoutRef = useRef(null);
  
  const { user, fetchUserInfo, logOutUser, isLoggedIn } = useUserStore();
  const navigate = useNavigate();

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
      if (logoutTimeoutRef.current) {
        clearTimeout(logoutTimeoutRef.current);
      }
    };
  }, []);

  // Socket handlers with safety checks
  const handleConnect = useCallback(() => {
    if (socket && user?._id && isMountedRef.current) {
      socket.emit("join_room", user._id);
    }
  }, [user?._id]);

  const handleAccount = useCallback((note) => {
    if (!isMountedRef.current) return;
    
    try {
      if (note?.message) {
        toast.info(note.message);
      }
      if (!note.relatedAccount) {
        navigate("/my-accounts");
      }
    } catch (error) {
      console.error("Error handling account notification:", error);
    }
  }, [navigate]);

  const handlePayment = useCallback((note) => {
    if (!isMountedRef.current) return;
    
    try {
      if (note?.message) {
        toast.info(note.message);
      }
    } catch (error) {
      console.error("Error handling payment notification:", error);
    }
  }, []);

  // Socket effect with proper dependencies and cleanup
  useEffect(() => {
    if (!socket || !user?._id || !isMountedRef.current) return;

    socket.on("connect", handleConnect);
    socket.on("account-notification", handleAccount);
    socket.on("payment-notification", handlePayment);

    // Emit join room if already connected
    if (socket.connected) {
      handleConnect();
    }

    return () => {
      if (socket) {
        socket.off("connect", handleConnect);
        socket.off("account", handleAccount);
        socket.off("payment", handlePayment);
      }
    };
  }, [user?._id, handleConnect, handleAccount, handlePayment]);

  useEffect(() => {
    const getUser = async () => {
      if (!isMountedRef.current) return;
       await fetchUserInfo();
    };
    
    if (!user && isLoggedIn) {
         getUser();
    }
  }, [fetchUserInfo, user, isLoggedIn]);

  useEffect(() => {
    const handleScroll = () => {
      if (!isMountedRef.current) return;
      const scrollPosition = window.scrollY;
      setIsScrolled(scrollPosition > 20);
    };
    
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const toggleMobileMenu = () => {
    if (!isMountedRef.current) return;
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const toggleNotifications = () => {
    if (!isMountedRef.current) return;
    setIsNotificationOpen(!isNotificationOpen);
  };

  const handleLogout = async () => {
    if (!isMountedRef.current) return;
    
    setIsLoggingOut(true);
    setLogoutMessage("Logging out...");
    
    try {
      await logOutUser();
      
      if (!isMountedRef.current) return;
      
      setLogoutMessage("Logged out successfully!");
      
      logoutTimeoutRef.current = setTimeout(() => {
        if (isMountedRef.current) {
          setIsLoggingOut(false);
          navigate("/login");
        }
      }, 1000);
    } catch (error) {
      console.error("Logout error:", error);
      
      if (!isMountedRef.current) return;
      
      setLogoutMessage("Failed to log out. Please try again.");
      
      logoutTimeoutRef.current = setTimeout(() => {
        if (isMountedRef.current) {
          setIsLoggingOut(false);
        }
      }, 2000);
    }
  };

  // Notification Component with error boundaries
  function NotificationDropdown({ onClose }) {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
      const fetchNotifications = async () => {
        if (!isMountedRef.current) return;
        
        setLoading(true);
        setError(null);
        
        try {
          const response = await axiosInstance.get(
            `${import.meta.env.VITE_BACKEND_URL}/notifications`,
            {
              withCredentials: true,
            }
          );
          
          if (isMountedRef.current) {
            setNotifications(response.data || []);
          }
        } catch (err) {
          console.error("Error fetching notifications:", err);
          if (isMountedRef.current) {
            setError("Failed to load notifications");
          }
        } finally {
          if (isMountedRef.current) {
            setLoading(false);
          }
        }
      };
      
      fetchNotifications();
    }, []);

    // Only show the first 5 notifications
    const visibleNotifications = notifications.slice(0, 5);

    return (
      <div className="absolute right-0 mt-2 w-72  xl:w-80 md:w-72 xs:w-60 bg-white rounded-lg shadow-lg py-2 z-50">
        <div className="px-4 py-2 border-b border-gray-100 flex justify-between items-center">
          <h3 className="text-sm font-semibold text-gray-800">Notifications</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-700 text-lg"
          >
            &times;
          </button>
        </div>
        <div className="max-h-96 overflow-y-auto">
          {loading && <div className="px-4 py-3 text-gray-500">Loading...</div>}
          {error && <div className="px-4 py-3 text-red-500">{error}</div>}
          {!loading && !error && visibleNotifications.length === 0 && (
            <div className="px-4 py-3 text-gray-500">No notifications</div>
          )}
          {!loading &&
            !error &&
            visibleNotifications.map((note, idx) => (
              <div
                key={note.id || idx} // Use proper key
                className="px-4 py-3 hover:bg-gray-50 cursor-pointer border-b last:border-b-0"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-gray-500 font-semibold">
                    From: {note.from || 'System'}
                  </span>
                  {note.timestamp && (
                    <span className="text-xs text-gray-400">
                      {new Date(note.timestamp).toLocaleString()}
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-800">{note.message || 'No message'}</p>
              </div>
            ))}
        </div>
        {/* Show More Button */}
        {!loading && !error && notifications.length > 5 && (
          <div className="px-4 py-2 border-t border-gray-100 text-center">
            <button
              className="text-blue-600 hover:underline font-medium"
              onClick={() => {
                onClose();
                navigate("/notifications");
              }}
            >
              Show More
            </button>
          </div>
        )}
      </div>
    );
  }

  return (
    <>
      {isLoggingOut && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-lg px-8 py-6 flex flex-col items-center gap-4 animate-fade-in">
            {logoutMessage === "Logging out..." ? (
              <>
                <svg
                  className="animate-spin h-8 w-8 text-gray-600"
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
                <span className="text-base font-medium text-gray-700">
                  {logoutMessage}
                </span>
              </>
            ) : (
              <>
                <svg
                  className="h-8 w-8 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                <span className="text-base font-medium text-green-600">
                  {logoutMessage}
                </span>
              </>
            )}
          </div>
        </div>
      )}

      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-colors duration-500 ${
          isScrolled
            ? "bg-white/70 backdrop-blur-md shadow-md"
            : "bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900"
        } ${
          isLoggingOut ? "filter blur-sm pointer-events-none select-none" : ""
        }`}
      >
        <nav className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div
              className={`flex text-xl font-bold ${
                isScrolled ? "text-gray-800" : "text-white"
              }`}
            >
              {user && (
                <div className="relative inline-block">
                  <button
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    className="inline-block"
                  >
                    <div className="w-8 h-8 flex items-center justify-center rounded-full bg-blue-500 text-white font-bold text-lg mx-2">
                      {user.userName ? user.userName.charAt(0).toUpperCase() : 'U'}
                    </div>
                  </button>
                  
                  {/* User Menu Dropdown */}
                  {isUserMenuOpen && (
                    <div className="absolute left-0 mt-2 w-72 bg-white rounded-lg shadow-lg py-2 z-50">
                      <div className="px-4 py-3 border-b border-gray-100">
                        <h3 className="text-sm font-semibold text-gray-800">Account Settings</h3>
                      </div>
                      <div className="px-4 py-3">
                        <p className="text-sm text-gray-600">
                          <span className="font-medium">UserName:</span> {user.userName || 'N/A'}
                        </p>
                        <p className="text-sm text-gray-600">
                          <span className="font-medium">FullName:</span> {user.firstName ? user.firstName.toUpperCase() : 'N/A'} {user.lastName ? user.lastName.toUpperCase() : ''}
                        </p>
                        <p className="text-sm text-gray-600">
                          <span className="font-medium">Email:</span> {user.email || 'N/A'}
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
                  isScrolled ? "text-gray-800" : "text-white"
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
                      ? "text-gray-600 hover:text-gray-900"
                      : "text-gray-200 hover:text-white"
                  }`}
                >
                  Home
                </Link>
                <Link
                  to="/about"
                  className={`transition-colors duration-200 ${
                    isScrolled
                      ? "text-gray-600 hover:text-gray-900"
                      : "text-gray-200 hover:text-white"
                  }`}
                >
                  About
                </Link>
                {user && (
                  <Link
                    to="/my-accounts"
                    className={`transition-colors duration-200 ${
                      isScrolled
                        ? "text-gray-600 hover:text-gray-900"
                        : "text-gray-200 hover:text-white"
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
                      className={`p-2 rounded-full transition-colors duration-200 ${
                        isScrolled
                          ? "text-gray-600 hover:bg-gray-100"
                          : "text-white hover:bg-white/10"
                      }`}
                    >
                      <HiBell className="w-6 h-6 text-blue-500" />
                    </button>
                    {isNotificationOpen && (
                      <NotificationDropdown onClose={toggleNotifications} />
                    )}
                  </div>
                )}

                <div className="h-6 w-px bg-gray-300"></div>

                {user ? (
                  <button
                    onClick={handleLogout}
                    disabled={isLoggingOut}
                    className="px-4 py-2 rounded-md bg-gradient-to-r from-red-500 to-red-600 text-white hover:from-red-600 hover:to-red-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoggingOut ? "Logging out..." : "Logout"}
                  </button>
                ) : (
                  <>
                    <Link
                      to="/login"
                      className={`px-4 py-2 rounded-md transition-all duration-200 ${
                        isScrolled
                          ? "text-gray-800 hover:bg-gray-100"
                          : "text-white hover:bg-white/10"
                      }`}
                    >
                      Login
                    </Link>
                    <Link
                      to="/signup"
                      className={`px-4 py-2 rounded-md transition-all duration-200 ${
                        isScrolled
                          ? "bg-gray-800 text-white hover:bg-gray-700"
                          : "bg-white text-gray-800 hover:bg-gray-100"
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
                <div className="relative">
                  <button
                    onClick={toggleNotifications}
                    className={`p-2 rounded-full transition-colors duration-200 ${
                      isScrolled
                        ? "text-gray-600 hover:bg-gray-100"
                        : "text-white hover:bg-white/10"
                    }`}
                  >
                    <HiBell className="w-6 h-6 text-green-500" />
                  </button>
                  {isNotificationOpen && (
                    <NotificationDropdown onClose={toggleNotifications} />
                  )}
                </div>
              )}

              <button
                onClick={toggleMobileMenu}
                className={`inline-flex items-center justify-center p-2 rounded-md ${
                  isScrolled ? "text-gray-600" : "text-white"
                } hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white`}
                aria-expanded="false"
              >
                <span className="sr-only">Open main menu</span>
                {/* Hamburger icon */}
                <svg
                  className={`${isMobileMenuOpen ? "hidden" : "block"} h-6 w-6`}
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
                {/* Close icon */}
                <svg
                  className={`${isMobileMenuOpen ? "block" : "hidden"} h-6 w-6`}
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
          </div>

          {/* Mobile menu */}
          <div className={`${isMobileMenuOpen ? "block" : "hidden"} md:hidden`}>
            <div className="pt-2 pb-3 space-y-1">
              <Link
                to="/"
                className={`block px-3 py-2 rounded-md text-base font-medium ${
                  isScrolled
                    ? "text-gray-600 hover:bg-gray-50"
                    : "text-white hover:bg-white/10"
                }`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Home
              </Link>
              <Link
                to="/about"
                className={`block px-3 py-2 rounded-md text-base font-medium ${
                  isScrolled
                    ? "text-gray-600 hover:bg-gray-50"
                    : "text-white hover:bg-white/10"
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
                      isScrolled
                        ? "text-gray-600 hover:bg-gray-50"
                        : "text-white hover:bg-white/10"
                    }`}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    My Accounts
                  </Link>
                  <button
                    onClick={() => {
                      handleLogout();
                      setIsMobileMenuOpen(false);
                    }}
                    disabled={isLoggingOut}
                    className="text-left mx-2 px-3 py-2 rounded-md text-base font-medium bg-gradient-to-r from-red-500 to-red-600 text-white hover:from-red-600 hover:to-red-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoggingOut ? "Logging out..." : "Logout"}
                  </button>
                </>
              )}
              {!user && (
                <>
                  <Link
                    to="/login"
                    className={`block px-3 py-2 rounded-md text-base font-medium ${
                      isScrolled
                        ? "text-gray-600 hover:bg-gray-50"
                        : "text-white hover:bg-white/10"
                    }`}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Login
                  </Link>
                  <Link
                    to="/signup"
                    className={`block px-3 py-2 rounded-md text-base font-medium ${
                      isScrolled
                        ? "text-gray-600 hover:bg-gray-50"
                        : "text-white hover:bg-white/10"
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
  );
}