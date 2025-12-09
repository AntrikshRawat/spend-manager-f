import { useEffect, useState } from 'react';
import axiosInstance from '../functions/axiosInstance';
import formatDate from '../functions/formatDate';
import { HiTrash } from 'react-icons/hi';
import useUserStore from '../store/useUserStore';
import { toast } from 'react-toastify';

// Skeleton Loading Component for Transactions
const TransactionSkeleton = () => (
  <div className="py-3 px-2 flex flex-col sm:grid sm:grid-cols-6 gap-2 sm:items-center animate-pulse">
    {/* Paid By skeleton */}
    <div className="h-5 bg-gray-200 rounded w-20 mx-auto sm:mx-0"></div>
    {/* Amount skeleton */}
    <div className="h-5 bg-gray-200 rounded w-16 mx-auto sm:mx-0"></div>
    {/* Where skeleton */}
    <div className="h-5 bg-gray-200 rounded w-24 mx-auto sm:mx-0"></div>
    {/* Date skeleton */}
    <div className="h-4 bg-gray-200 rounded w-28 mx-auto sm:mx-0"></div>
    {/* Member Expenses skeleton */}
    <div className="space-y-1">
      <div className="h-4 bg-gray-200 rounded w-16 mx-auto sm:mx-0"></div>
      <div className="h-4 bg-gray-200 rounded w-20 mx-auto sm:mx-0"></div>
    </div>
    {/* Action button skeleton */}
    <div className="flex justify-center sm:justify-start w-full mt-2 sm:mt-0">
      <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
    </div>
  </div>
);

const TransactionsHistory = ({ accountId, refreshKey = 0,newDeletion,accountType, accountMembers = [] }) => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deletingId, setDeletingId] = useState(null);
  const {user} = useUserStore();

  const fetchTransactions = async () => {
    setLoading(true);
    setTransactions([]);
    setError('');
    try {
      const { data } = await axiosInstance.get(
        `${import.meta.env.VITE_BACKEND_URL}/payment`,
        {
          params:{
            accountId
          },
          headers: { 'Content-Type': 'application/json' },
          withCredentials: true,
        }
      );
      setTransactions(data || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch transactions.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (accountId) fetchTransactions();
    // eslint-disable-next-line
  }, [accountId, refreshKey]);

  const handleDelete = async (transactionId,amount) => {
    if (!window.confirm('Are you sure you want to delete this transaction?')) return;
    setDeletingId(transactionId);
    try {
      await axiosInstance.delete(
        `${import.meta.env.VITE_BACKEND_URL}/payment/delete`,
        {
          params:{
            amount,
            accountId,
            paymentId:transactionId
          },
          headers: { 'Content-Type': 'application/json' },
          withCredentials: true,
        }
      );
      toast.success("Transaction deleted successfully.");
      newDeletion();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete transaction.');
    } finally {
      setDeletingId(null);
    }
  };

  if (loading) {
    return (
      <div className="mt-6 bg-white rounded-xl shadow p-4">
        {/* Header skeleton */}
        <div className={`hidden sm:grid ${accountType === 'personal' ? 'grid-cols-4' : 'grid-cols-6'} gap-4 px-2 py-2 bg-gray-50 rounded-lg font-semibold text-gray-600 text-sm mb-2`}>
          {accountType !== 'personal' && <div>Paid By</div>}
          <div>Amount</div>
          <div>Where</div>
          <div>Date</div>
          {accountType !== 'personal' && <div>Member Expenses</div>}
          <div>Action</div>
        </div>
        <ul className="divide-y divide-gray-100">
          <TransactionSkeleton />
        </ul>
      </div>
    );
  }
  
  if (error) return <div className="text-red-600 py-4">{error}</div>;
  if (!transactions.length) return <div className="text-gray-400 py-4">No transactions found.</div>;

  return (
    <div className="mt-6 bg-white rounded-xl shadow p-4">
      <div className={`hidden sm:grid ${accountType === 'personal' ? 'grid-cols-4' : 'grid-cols-6'} gap-4 px-2 py-2 bg-gray-50 rounded-lg font-semibold text-gray-600 text-sm mb-2`}>
        {accountType !== 'personal' && <div>Paid By</div>}
        <div>Amount</div>
        <div>Where</div>
        <div>Date & Time</div>
        {accountType !== 'personal' && <div>Member Expenses</div>}
        <div>Action</div>
      </div>
      <ul className="divide-y divide-gray-100">
        {transactions.map((tx, idx) => (
          <li
            key={tx._id || idx}
            className={`py-3 px-2 flex flex-col sm:grid ${accountType === 'personal' ? 'sm:grid-cols-4' : 'sm:grid-cols-6'} gap-2 sm:items-center hover:bg-gray-50 rounded-lg transition`}
          >
            {accountType !== 'personal' && <div className="font-semibold text-blue-700 w-full text-center sm:text-left">{tx.paidBy}</div>}
            <div className="text-green-700 font-bold w-full text-center sm:text-left">₹{tx.amount}</div>
            <div className="text-gray-700 w-full text-center sm:text-left">{tx.where}</div>
            <div className="text-xs text-gray-500 w-full text-center sm:text-left">
              {formatDate(tx.date)}
            </div>
            {/* Member Expenses Section - Right Side */}
            {accountType !== 'personal' && (
              <div className="w-full text-center sm:text-left">
                {tx.memberExpenses && tx.memberExpenses.length > 0 ? (
                  <div className="text-xs space-y-1">
                    {tx.memberExpenses.map((expense, expenseIdx) => (
                      <div key={expenseIdx} className="flex justify-between items-center bg-blue-50 px-2 py-1 rounded-md">
                        <span className="text-blue-700 font-medium">
                          {accountType === 'shared' && accountMembers[expenseIdx] 
                            ? accountMembers[expenseIdx] 
                            : `M${expenseIdx + 1}`}
                        </span>
                        <span className="text-blue-900 font-semibold">₹{expense}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <span className="text-gray-400 text-xs italic">No expenses</span>
                )}
              </div>
            )}
            {/* Action Button - Responsive */}
            <div className="flex justify-center sm:justify-start w-full mt-2 sm:mt-0">
              <button
                onClick={() => handleDelete(tx._id,tx.amount)}
                className="p-3 rounded-full bg-red-100 hover:bg-red-200 text-red-600 transition focus:outline-none focus:ring-2 focus:ring-red-300 disabled:opacity-50"
                disabled={deletingId === tx._id || user?.userName !== tx.paidBy}
                title="Delete Transaction"
                style={{ minWidth: 40, minHeight: 40 }}
              >
                {deletingId === tx._id ? (
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
                  </svg>
                ) : (
                  <HiTrash className="w-5 h-5" />
                )}
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default TransactionsHistory; 