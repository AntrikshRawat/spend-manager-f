import React, { useEffect, useState } from 'react';
import axiosInstance from '../functions/axiosInstance';
import { toast } from 'react-toastify';

const AccountPaidSpend = ({ accountMembers = [], accountId }) => {
  const [paidSummery, setPaidSummery] = useState({});
  const [expenseSummery, setExpenseSummery] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchPaidSpend = async () => {
      if (!accountId || !accountMembers.length) return;
      setLoading(true);
      setError('');
      try {
        const { data } = await axiosInstance.post(
          `${import.meta.env.VITE_BACKEND_URL}/payment/paidspend`,
          { accountMembers },
          {
            params: { accountId },
            headers: { 'Content-Type': 'application/json' },
            withCredentials: true,
          }
        );
        setPaidSummery(data.paidSummary || {});
        setExpenseSummery(data.expenseSummary || {});
      } catch (err) {
        const errorMsg = err.response?.data?.message || 'Failed to fetch summary.';
        setError(errorMsg);
        toast.error(errorMsg);
      } finally {
        setLoading(false);
      }
    };
    fetchPaidSpend();
  }, [accountId, accountMembers]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
      {/* Paid Section */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-xl font-semibold text-gray-800">Paid</h2>
        </div>
        <div className="p-6">
          {loading ? (
            <div className="text-center text-gray-500">Loading...</div>
          ) : error ? (
            <div className="text-center text-red-500">{error}</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {accountMembers.map((member) => {
                const name = typeof member === 'string' ? member : member.name;
                return (
                  <div
                    key={name}
                    className="bg-gradient-to-br from-indigo-50 to-blue-50 rounded-xl p-6 shadow-md flex flex-col items-center transition-transform hover:shadow-lg"
                  >
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-indigo-400 flex items-center justify-center mb-3 shadow">
                      <span className="text-white text-lg font-bold">
                        {name ? name.charAt(0).toUpperCase() : '?'}
                      </span>
                    </div>
                    <p className="text-base font-semibold text-gray-800 mb-1 text-center">
                      {name}
                    </p>
                    <p className="text-xl font-bold text-indigo-700 text-center">
                      ₹{paidSummery[name] ?? 0}
                    </p>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
      {/* Spend Section */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-xl font-semibold text-gray-800">Spend</h2>
        </div>
        <div className="p-6">
          {loading ? (
            <div className="text-center text-gray-500">Loading...</div>
          ) : error ? (
            <div className="text-center text-red-500">{error}</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {accountMembers.map((member) => {
                const name = typeof member === 'string' ? member : member.name;
                return (
                  <div
                    key={name}
                    className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-6 shadow-md flex flex-col items-center transition-transform hover:shadow-lg"
                  >
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-400 to-purple-400 flex items-center justify-center mb-3 shadow">
                      <span className="text-white text-lg font-bold">
                        {name ? name.charAt(0).toUpperCase() : '?'}
                      </span>
                    </div>
                    <p className="text-base font-semibold text-gray-800 mb-1 text-center">
                      {name}
                    </p>
                    <p className="text-xl font-bold text-indigo-700 text-center">
                      ₹{expenseSummery[name] ?? 0}
                    </p>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AccountPaidSpend; 