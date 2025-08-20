import useUserStore from '../store/useUserStore';
import Footer from '../components/Footer';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import ChangePasswordPopup from '../components/ChangePasswordPopup';

export default function Profile() {
  const { user } = useUserStore();
  const navigate = useNavigate();
  const [showChangePassword, setShowChangePassword] = useState(false);

  return (
    <>
    <ChangePasswordPopup isOpen={showChangePassword} onClose={() => setShowChangePassword(false)} />
    <div className={`min-h-screen flex flex-col justify-center items-center bg-gradient-to-br from-indigo-100 via-purple-50 to-pink-100 transition-all duration-300 ${showChangePassword ? 'blur-sm brightness-75 pointer-events-none select-none' : ''}`}>
      <div className="flex flex-col items-center w-full max-w-md mx-auto mt-16 mb-8">
        {/* Large rounded avatar with first letter of name */}
        <div className="w-48 h-48 rounded-full bg-gradient-to-br from-blue-900 to-purple-900 flex items-center justify-center text-white text-8xl font-bold mb-6 shadow-lg">
          {user?.firstName ? user.firstName[0].toUpperCase() : user?.userName ? user.userName[0].toUpperCase() : '?'}
        </div>
        {/* User name below avatar */}
        <div className="text-4xl font-extrabold text-gray-900 mb-8 text-center">
          {user?.firstName}{" "}{user?.lastName}
        </div>
        {/* User details */}
        <div className="w-full bg-white/80 backdrop-blur-sm rounded-xl shadow-lg p-8 mb-8">
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4">
              <div className="font-semibold text-gray-700 w-32">Username:</div>
              <div className="text-gray-900">{user?.userName || '-'}</div>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4">
              <div className="font-semibold text-gray-700 w-32">Name:</div>
              <div className="text-gray-900">{user?.firstName}{" "}{user?.lastName}</div>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4">
              <div className="font-semibold text-gray-700 w-32">Email:</div>
              <div className="text-gray-900">{user?.email || '-'}</div>
            </div>
          </div>
          {/* Action buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-8">
            <button
              className="w-full py-2 px-4 rounded-md bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold shadow hover:scale-105 transition-all"
              onClick={() => setShowChangePassword(true)}
            >
              Change Password
            </button>
            <button
              className="w-full py-2 px-4 rounded-md bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold shadow hover:scale-105 transition-all"
              onClick={() => navigate('/forgot-password')}
            >
              Forgot Password
            </button>
            <button
              className="w-full py-2 px-4 rounded-md bg-gradient-to-r from-red-500 to-red-700 text-white font-semibold shadow hover:scale-105 transition-all sm:col-span-2"
              onClick={() => navigate('/delete-account')}
            >
              Delete Account
            </button>
          </div>
        </div>
      </div>
    </div>
      <Footer />
    </>
  );
}
