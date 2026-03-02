import { useEffect, useState } from 'react';
import axiosInstance from '../functions/axiosInstance';
import formatDate from '../functions/formatDate';
import { useNavigate } from 'react-router-dom';
import { HiArrowLeft, HiBell, HiOutlineClock } from 'react-icons/hi';

// Skeleton Loading Component
const NotificationSkeleton = () => (
  <div className="bg-gray-50 rounded-xl p-5 animate-pulse space-y-3">
    <div className="flex items-center gap-3">
      <div className="w-10 h-10 bg-gray-200 rounded-full shrink-0"></div>
      <div className="flex-1 space-y-2">
        <div className="h-4 bg-gray-200 rounded w-32"></div>
        <div className="h-3 bg-gray-200 rounded w-20"></div>
      </div>
      <div className="h-3 bg-gray-200 rounded w-24"></div>
    </div>
    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
  </div>
);

export default function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchNotifications = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await axiosInstance.get(`${import.meta.env.VITE_BACKEND_URL}/notifications`, {
          withCredentials: true,
        });
        setNotifications(response.data || []);
      } catch {
        setError('Failed to load notifications');
      } finally {
        setLoading(false);
      }
    };
    fetchNotifications();
  }, []);

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-indigo-100 via-purple-50 to-pink-100 py-8 px-4 pb-24 overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-purple-300/40 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-blue-300/40 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-r from-blue-200/20 to-purple-200/20 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 max-w-2xl mx-auto">
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="group flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors duration-200"
        >
          <div className="w-9 h-9 rounded-xl bg-white/80 backdrop-blur-sm border border-gray-200 shadow-sm flex items-center justify-center group-hover:bg-white group-hover:shadow-md transition-all duration-200">
            <HiArrowLeft className="w-4 h-4" />
          </div>
          <span className="font-medium text-sm">Back</span>
        </button>

        {/* Main Card */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-lg overflow-hidden">
          {/* Header */}
          <div className="p-5 border-b border-gray-100 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center shadow-sm">
              <HiBell className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-800">All Notifications</h2>
              <p className="text-xs text-gray-400">Stay updated with your account activity</p>
            </div>
            {!loading && !error && notifications.length > 0 && (
              <span className="ml-auto text-xs font-semibold text-purple-600 bg-purple-50 border border-purple-200 px-2.5 py-1 rounded-full">
                {notifications.length} {notifications.length === 1 ? 'notification' : 'notifications'}
              </span>
            )}
          </div>

          {/* Loading State */}
          {loading && (
            <div className="p-5 space-y-3">
              <NotificationSkeleton />
              <NotificationSkeleton />
              <NotificationSkeleton />
              <NotificationSkeleton />
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="p-6">
              <div className="flex items-center gap-3 text-red-600">
                <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center shrink-0">
                  <span className="text-xl font-bold">!</span>
                </div>
                <p className="font-medium">{error}</p>
              </div>
            </div>
          )}

          {/* Empty State */}
          {!loading && !error && notifications.length === 0 && (
            <div className="p-10 text-center">
              <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
                <HiBell className="w-8 h-8 text-gray-400" />
              </div>
              <p className="text-gray-500 font-medium">No notifications yet</p>
              <p className="text-gray-400 text-sm mt-1">Notifications will appear here when there&apos;s activity on your accounts.</p>
            </div>
          )}

          {/* Notifications List */}
          {!loading && !error && notifications.length > 0 && (
            <ul className="divide-y divide-gray-100">
              {notifications.map((note, idx) => (
                <li
                  key={note.id || idx}
                  className="group px-5 py-4 hover:bg-gradient-to-r hover:from-blue-50/50 hover:to-purple-50/50 transition-all duration-300"
                >
                  <div className="flex items-start gap-3">
                    {/* Avatar */}
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center shrink-0 shadow-sm mt-0.5">
                      <span className="text-white text-xs font-bold">
                        {(note.from || 'S').charAt(0).toUpperCase()}
                      </span>
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-semibold text-gray-500">
                          {note.from || 'System'}
                        </span>
                        {note.timestamp && (
                          <span className="flex items-center gap-1 text-xs text-gray-400">
                            <HiOutlineClock className="w-3.5 h-3.5 shrink-0" />
                            {formatDate(note.timestamp)}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-800 leading-relaxed">{note.message}</p>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
} 