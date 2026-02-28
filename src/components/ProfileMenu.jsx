import { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { HiOutlineUser, HiOutlineLockClosed, HiOutlineLogout } from "react-icons/hi";
import useUserStore from "../store/useUserStore";

export default function ProfileMenu({ onLogout }) {
  const user = useUserStore((u) => u.user);
  const [isOpen, setIsOpen] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const menuRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setIsOpen(false);
        setShowProfile(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (!user) return null;

  return (
    <div className="relative inline-block" ref={menuRef}>
      <button
        onClick={() => { setIsOpen(!isOpen); setShowProfile(false); }}
        className="group"
      >
        <div className="w-9 h-9 flex items-center justify-center rounded-full bg-gradient-to-br from-blue-600 to-purple-600 text-white font-bold text-base ring-2 ring-white/30 group-hover:ring-purple-300 transition-all duration-200 shadow-md">
          {user.userName ? user.userName.charAt(0).toUpperCase() : "U"}
        </div>
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute left-0 mt-3 w-64 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2">
          
          {/* User Header */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-5 py-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                {user.userName ? user.userName.charAt(0).toUpperCase() : "U"}
              </div>
              <div className="min-w-0">
                <p className="text-white font-semibold text-sm truncate">
                  {user.firstName || ""} {user.lastName || ""}
                </p>
                <p className="text-white/60 text-xs truncate">
                  @{user.userName || "user"}
                </p>
              </div>
            </div>
          </div>

          {/* Menu Items */}
          <div className="py-2">
            <button
              onClick={() => setShowProfile(!showProfile)}
              className="w-full flex items-center gap-3 px-5 py-2.5 text-sm text-gray-700 hover:bg-purple-50 hover:text-purple-700 transition-colors duration-150"
            >
              <HiOutlineUser className="w-4.5 h-4.5 text-gray-400" />
              <span className="font-medium">Profile</span>
            </button>

            {/* Profile Details (expandable) */}
            {showProfile && (
              <div className="px-5 py-3 bg-gray-50 border-y border-gray-100 space-y-1.5">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <span className="font-medium text-gray-500 w-16">User</span>
                  <span className="text-gray-800 truncate">{user.userName || "N/A"}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <span className="font-medium text-gray-500 w-16">Name</span>
                  <span className="text-gray-800 truncate">
                    {user.firstName ? user.firstName : "N/A"}{" "}
                    {user.lastName || ""}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <span className="font-medium text-gray-500 w-16">Email</span>
                  <span className="text-gray-800 truncate">{user.email || "N/A"}</span>
                </div>
              </div>
            )}

            <Link
              to="/change-password"
              onClick={() => { setIsOpen(false); setShowProfile(false); }}
              className="w-full flex items-center gap-3 px-5 py-2.5 text-sm text-gray-700 hover:bg-purple-50 hover:text-purple-700 transition-colors duration-150"
            >
              <HiOutlineLockClosed className="w-4.5 h-4.5 text-gray-400" />
              <span className="font-medium">Password</span>
            </Link>
          </div>

          {/* Logout */}
          <div className="px-3 pb-3 pt-1">
            <button
              onClick={() => {
                setIsOpen(false);
                setShowProfile(false);
                onLogout?.();
              }}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-gradient-to-r from-red-500 to-red-600 text-white text-sm font-semibold shadow-sm hover:from-red-600 hover:to-red-700 transition-all duration-200"
            >
              <HiOutlineLogout className="w-4.5 h-4.5" />
              Log out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
