import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect, useRef, useCallback } from "react";
import { HiBell, HiOutlineClock } from "react-icons/hi";
import useUserStore from "../store/useUserStore";
import formatDate from "../functions/formatDate";
import socket from "../socket";
import { toast } from "react-toastify";
import axiosInstance from "../functions/axiosInstance";
import useAccountStore from "../store/useAccountStore";
import ProfileMenu from "./ProfileMenu";

export default function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [logoutMessage, setLogoutMessage] = useState("");
  const fetchAndUpdateAccounts = useAccountStore(a=>a.fetchAndUpdateAccounts);
  const clearAccounts = useAccountStore(a=>a.clearAccounts);
  
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
      socket.emit("join_room", user?._id);
    }
  }, [user?._id]);

  const handleAccount = useCallback((note) => {
    if (!isMountedRef.current) return;
    fetchAndUpdateAccounts();
       
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
  }, [navigate,fetchAndUpdateAccounts]);

  const handlePayment = useCallback((note) => {
    if (!isMountedRef.current) return;
    
    fetchAndUpdateAccounts();

    try {
      if (note?.message) {
        toast.info(note.message);
      }
    } catch (error) {
      console.error("Error handling payment notification:", error);
    }
  }, [fetchAndUpdateAccounts]);

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
        socket.off("account-notification", handleAccount);
        socket.off("payment-notification", handlePayment);
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
      const currentScrollY = window.scrollY;
      setIsScrolled(currentScrollY > 20);
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
      clearAccounts();
      
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
      <div className="absolute right-0 mt-2 w-80 xl:w-88 md:w-80 bg-white rounded-2xl border border-gray-200 shadow-lg z-50 overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-gray-100 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center shadow-sm">
            <HiBell className="w-4 h-4 text-white" />
          </div>
          <h3 className="text-sm font-bold text-gray-800 flex-1">Notifications</h3>
          {!loading && !error && visibleNotifications.length > 0 && (
            <span className="text-xs font-semibold text-purple-600 bg-purple-50 border border-purple-200 px-2 py-0.5 rounded-full">
              {notifications.length}
            </span>
          )}
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-400 hover:text-gray-700 transition-colors duration-200"
          >
            &times;
          </button>
        </div>

        <div className="max-h-96 overflow-y-auto">
          {/* Loading State */}
          {loading && (
            <div className="p-4 space-y-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="animate-pulse flex items-start gap-3">
                  <div className="w-8 h-8 bg-gray-200 rounded-full shrink-0"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-3 bg-gray-200 rounded w-24"></div>
                    <div className="h-3 bg-gray-200 rounded w-full"></div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="p-4 flex items-center gap-2 text-red-600">
              <div className="w-8 h-8 rounded-full bg-red-50 flex items-center justify-center shrink-0">
                <span className="text-sm font-bold">!</span>
              </div>
              <p className="text-sm font-medium">{error}</p>
            </div>
          )}

          {/* Empty State */}
          {!loading && !error && visibleNotifications.length === 0 && (
            <div className="p-6 text-center">
              <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-3">
                <HiBell className="w-6 h-6 text-gray-400" />
              </div>
              <p className="text-gray-500 text-sm font-medium">No notifications yet</p>
              <p className="text-gray-400 text-xs mt-1">Activity updates will appear here.</p>
            </div>
          )}

          {/* Notification Items */}
          {!loading && !error && visibleNotifications.length > 0 && (
            <ul className="divide-y divide-gray-100">
              {visibleNotifications.map((note, idx) => (
                <li
                  key={note.id || idx}
                  className="px-4 py-3 hover:bg-gradient-to-r hover:from-blue-50/50 hover:to-purple-50/50 transition-all duration-300 cursor-pointer"
                >
                  <div className="flex items-start gap-2.5">
                    <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center shrink-0 shadow-sm mt-0.5">
                      <span className="text-white text-[10px] font-bold">
                        {(note.from || 'S').charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-0.5">
                        <span className="text-xs font-semibold text-gray-500">
                          {note.from || 'System'}
                        </span>
                        {note.timestamp && (
                          <span className="flex items-center gap-1 text-[10px] text-gray-400">
                            <HiOutlineClock className="w-3 h-3 shrink-0" />
                            {formatDate(note.timestamp)}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-800 leading-snug">{note.message || 'No message'}</p>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Show More Button */}
        {!loading && !error && notifications.length > 5 && (
          <div className="p-3 border-t border-gray-100 text-center">
            <button
              className="w-full py-2 text-sm font-semibold text-white bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl hover:from-blue-600 hover:to-purple-600 transition-all duration-200 shadow-sm hover:shadow-md"
              onClick={() => {
                onClose();
                navigate("/notifications");
              }}
            >
              View All Notifications
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
        className={`fixed left-1/2 -translate-x-1/2 top-4 z-50 transition-all duration-500 ease-in-out shadow-inner ${
          isScrolled
            ? "bg-white/80 backdrop-blur-xl"
            : "backdrop-blur-md gradient-flow"
        } ${
          isLoggingOut ? "filter blur-sm pointer-events-none select-none" : ""
        } rounded-2xl w-[98%] max-w-7xl`}
        style={{ boxShadow: 'inset 0 2px 8px rgba(0, 0, 0, 0.1)' }}
      >
        <nav className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div
              className={`flex text-xl font-bold ${
                isScrolled ? "text-gray-800" : "text-white"
              }`}
            >
              <ProfileMenu onLogout={handleLogout} />
              <Link
                to="/"
                className={`text-2xl font-bold mx-1 ${
                  isScrolled ? "text-gray-600" : "text-emerald-200"
                }`}
              >
                Spend
                <p className={`inline ${isScrolled ? "text-gray-900":"text-emerald-400"}`}>MNR</p>
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
                      <HiBell className={`w-6 h-6 ${
                        isScrolled ? "text-orange-500" : "text-white"
                      }`} />
                    </button>
                    {isNotificationOpen && (
                      <NotificationDropdown onClose={toggleNotifications} />
                    )}
                  </div>
                )}

                {!user && (
                  <>
                    <div className="h-6 w-px bg-gray-300"></div>
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
                    <HiBell className={`w-6 h-6 ${
                      isScrolled ? "text-orange-500" : "text-white"
                    }`} />
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