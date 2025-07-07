import { useEffect, useState } from 'react';
import axiosInstance from '../functions/axiosInstance';
import { useNavigate } from 'react-router-dom';

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
    <div className="max-w-2xl mx-auto mt-10 p-6 bg-white rounded-lg shadow-lg">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold text-gray-800">All Notifications</h2>
        <button
          className="text-blue-600 hover:underline"
          onClick={() => navigate(-1)}
        >
          Back
        </button>
      </div>
      {loading && <div className="text-gray-500">Loading...</div>}
      {error && <div className="text-red-500">{error}</div>}
      {!loading && !error && notifications.length === 0 && (
        <div className="text-gray-500">No notifications</div>
      )}
      <div className="divide-y divide-gray-200">
        {!loading && !error && notifications.map((note, idx) => (
          <div key={idx} className="py-4">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-gray-500 font-semibold">From: {note.from}</span>
              {note.timestamp && <span className="text-xs text-gray-400">{new Date(note.timestamp).toLocaleString()}</span>}
            </div>
            <p className="text-gray-800">{note.message}</p>
          </div>
        ))}
      </div>
    </div>
  );
} 