import { useEffect, useState } from 'react';
import axiosInstance from '../functions/axiosInstance';
import formatDate from '../functions/formatDate';
import { HiTrash, HiOutlineClock, HiOutlineCurrencyRupee } from 'react-icons/hi';
import useUserStore from '../store/useUserStore';
import { toast } from 'react-toastify';
import useAccountStore from '../store/useAccountStore';

// Skeleton Loading Component for Transactions
const TransactionSkeleton = () => (
  <div className="bg-gray-50 rounded-xl p-5 animate-pulse space-y-3">
    <div className="flex items-center gap-3">
      <div className="w-10 h-10 bg-gray-200 rounded-full shrink-0"></div>
      <div className="flex-1 space-y-2">
        <div className="h-4 bg-gray-200 rounded w-28"></div>
        <div className="h-3 bg-gray-200 rounded w-20"></div>
      </div>
      <div className="h-5 bg-gray-200 rounded w-16"></div>
    </div>
    <div className="flex gap-3">
      <div className="h-3 bg-gray-200 rounded w-24"></div>
      <div className="h-3 bg-gray-200 rounded w-32"></div>
    </div>
  </div>
);

const TransactionsHistory = ({ accountId, refreshKey = 0,newDeletion,accountType, accountMembers = [] }) => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deletingId, setDeletingId] = useState(null);
  const user = useUserStore(u=>u.user);
  const fetchAndUpdateAccounts = useAccountStore(s=>s.fetchAndUpdateAccounts);

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
    fetchAndUpdateAccounts();
  }, [accountId, refreshKey,fetchAndUpdateAccounts]);

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
      <div className="mt-6 bg-white rounded-2xl border border-gray-200 shadow-lg overflow-hidden">
        <div className="p-5 border-b border-gray-100 flex items-center gap-2">
          <div className="w-1.5 h-6 bg-gradient-to-b from-blue-500 to-purple-500 rounded-full"></div>
          <h2 className="text-lg font-bold text-gray-800">Transactions</h2>
        </div>
        <div className="p-5 space-y-3">
          <TransactionSkeleton />
          <TransactionSkeleton />
          <TransactionSkeleton />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mt-6 bg-white rounded-2xl border border-red-200 shadow-lg p-6">
        <div className="flex items-center gap-3 text-red-600">
          <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center shrink-0">
            <span className="text-xl">!</span>
          </div>
          <p className="font-medium">{error}</p>
        </div>
      </div>
    );
  }

  if (!transactions.length) {
    return (
      <div className="mt-6 bg-white rounded-2xl border border-gray-200 shadow-lg p-10 text-center">
        <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
          <HiOutlineCurrencyRupee className="w-8 h-8 text-gray-400" />
        </div>
        <p className="text-gray-500 font-medium">No transactions found.</p>
        <p className="text-gray-400 text-sm mt-1">Transactions will appear here once added.</p>
      </div>
    );
  }

  return (
    <div className="mt-6 bg-white rounded-2xl border border-gray-200 shadow-lg overflow-hidden">
      {/* Header */}
      <div className="p-5 border-b border-gray-100 flex items-center gap-2">
        <div className="w-1.5 h-6 bg-gradient-to-b from-blue-500 to-purple-500 rounded-full"></div>
        <h2 className="text-lg font-bold text-gray-800">Transactions</h2>
        <span className="ml-auto text-xs font-semibold text-purple-600 bg-purple-50 border border-purple-200 px-2.5 py-1 rounded-full">
          {transactions.length} {transactions.length === 1 ? 'entry' : 'entries'}
        </span>
      </div>

      {/* Table Header - Desktop */}
      <div className={`hidden sm:grid ${accountType === 'personal' ? 'grid-cols-4' : 'grid-cols-6'} gap-4 px-6 py-3 bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-100 text-xs font-bold text-gray-500 uppercase tracking-wider`}>
        {accountType !== 'personal' && <div>Paid By</div>}
        <div>Amount</div>
        <div>Where</div>
        <div>Date & Time</div>
        {accountType !== 'personal' && <div>Member Expenses</div>}
        <div className="text-center">Action</div>
      </div>

      {/* Transaction List */}
      <ul className="divide-y divide-gray-100">
        {transactions.map((tx, idx) => (
          <li
            key={tx._id || idx}
            className="group"
          >
            {/* Desktop View */}
            <div className={`hidden sm:grid ${accountType === 'personal' ? 'sm:grid-cols-4' : 'sm:grid-cols-6'} gap-4 px-6 py-4 items-center hover:bg-gradient-to-r hover:from-blue-50/50 hover:to-purple-50/50 transition-all duration-300`}>
              {/* Paid By */}
              {accountType !== 'personal' && (
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center shrink-0 shadow-sm">
                    <span className="text-white text-xs font-bold">
                      {tx.paidBy?.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <span className="font-semibold text-gray-800 text-sm truncate">{tx.paidBy}</span>
                </div>
              )}

              {/* Amount */}
              <div>
                <span className="inline-flex items-center gap-1 font-bold text-green-600 bg-green-50 border border-green-200 px-2.5 py-1 rounded-lg text-sm">
                  ₹{tx.amount}
                </span>
              </div>

              {/* Where */}
              <div className="text-gray-800 font-semibold text-base truncate">
                {tx.where}
              </div>

              {/* Date */}
              <div className="flex items-center gap-1.5 text-gray-500 text-xs">
                <HiOutlineClock className="w-4 h-4 text-gray-400 shrink-0" />
                <span>{formatDate(tx.date)}</span>
              </div>

              {/* Member Expenses */}
              {accountType !== 'personal' && (
                <div>
                  {tx.memberExpenses && tx.memberExpenses.length > 0 ? (
                    <div className="space-y-1">
                      {tx.memberExpenses.map((expense, expenseIdx) => (
                        <div key={expenseIdx} className="flex justify-between items-center bg-blue-50 border border-blue-100 px-2.5 py-1 rounded-lg text-xs">
                          <span className="text-blue-700 font-medium truncate mr-2">
                            {accountType === 'shared' && accountMembers[expenseIdx]
                              ? accountMembers[expenseIdx]
                              : `M${expenseIdx + 1}`}
                          </span>
                          <span className="text-blue-900 font-bold whitespace-nowrap">₹{expense}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <span className="text-gray-400 text-xs italic">No expenses</span>
                  )}
                </div>
              )}

              {/* Action */}
              <div className="flex justify-center">
                <button
                  onClick={() => handleDelete(tx._id,tx.amount)}
                  className="p-2.5 rounded-xl bg-red-50 border border-red-100 text-red-500 hover:bg-red-100 hover:border-red-200 hover:text-red-600 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-red-300 disabled:opacity-40 disabled:cursor-not-allowed"
                  disabled={deletingId === tx._id || user?.userName !== tx.paidBy}
                  title="Delete Transaction"
                >
                  {deletingId === tx._id ? (
                    <div className="w-5 h-5 rounded-full border-2 border-red-200 border-t-red-500 animate-spin"></div>
                  ) : (
                    <HiTrash className="w-4.5 h-4.5" />
                  )}
                </button>
              </div>
            </div>

            {/* Mobile Card View */}
            <div className="sm:hidden p-4 hover:bg-gradient-to-r hover:from-blue-50/50 hover:to-purple-50/50 transition-all duration-300">
              <div className="flex items-start gap-3">
                {/* Avatar / Icon */}
                {accountType !== 'personal' ? (
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center shrink-0 shadow-sm">
                    <span className="text-white text-sm font-bold">
                      {tx.paidBy?.charAt(0).toUpperCase()}
                    </span>
                  </div>
                ) : (
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center shrink-0 shadow-sm">
                    <HiOutlineCurrencyRupee className="w-5 h-5 text-white" />
                  </div>
                )}

                {/* Details */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    {accountType !== 'personal' ? (
                      <span className="font-semibold text-gray-800 text-sm truncate">{tx.paidBy}</span>
                    ) : null}
                    <span className="font-bold text-green-600 bg-green-50 border border-green-200 px-2 py-0.5 rounded-lg text-sm ml-auto shrink-0">
                      ₹{tx.amount}
                    </span>
                  </div>

                  {/* Where - Centered */}
                  <div className="text-center my-2">
                    <span className="font-semibold text-gray-800 text-base">{tx.where}</span>
                  </div>

                  {/* Member Expenses - Mobile */}
                  {accountType !== 'personal' && tx.memberExpenses && tx.memberExpenses.length > 0 && (
                    <div className="flex flex-col items-center gap-1.5 mb-2">
                      {tx.memberExpenses.map((expense, expenseIdx) => (
                        <div key={expenseIdx} className="flex items-center justify-between w-48 bg-blue-50 border border-blue-100 text-xs px-3 py-1.5 rounded-lg">
                          <span className="text-blue-700 font-medium">
                            {accountType === 'shared' && accountMembers[expenseIdx]
                              ? accountMembers[expenseIdx]
                              : `M${expenseIdx + 1}`}
                          </span>
                          <span className="text-blue-900 font-bold">₹{expense}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Date - Moved to last */}
                  <div className="flex items-center justify-center gap-1 text-xs text-gray-500 mt-2">
                    <HiOutlineClock className="w-3.5 h-3.5" />
                    <span>{formatDate(tx.date)}</span>
                  </div>
                </div>

                {/* Delete Button - Mobile */}
                <button
                  onClick={() => handleDelete(tx._id,tx.amount)}
                  className="p-2 rounded-xl bg-red-50 border border-red-100 text-red-500 hover:bg-red-100 transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed shrink-0 self-center"
                  disabled={deletingId === tx._id || user?.userName !== tx.paidBy}
                  title="Delete Transaction"
                >
                  {deletingId === tx._id ? (
                    <div className="w-4 h-4 rounded-full border-2 border-red-200 border-t-red-500 animate-spin"></div>
                  ) : (
                    <HiTrash className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default TransactionsHistory;