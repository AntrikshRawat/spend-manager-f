import { useCallback, useEffect, useMemo, useState } from "react";
import axiosInstance from "../functions/axiosInstance";
import formatDate from "../functions/formatDate";
import {
  HiTrash,
  HiOutlineClock,
  HiOutlineCurrencyRupee,
  HiOutlineCalendar,
} from "react-icons/hi";
import useUserStore from "../store/useUserStore";
import { toast } from "react-toastify";
import { TransactionSkeleton } from "../Skeletons/TransactionSkeleton";

const TransactionsHistory = ({
  accountId,
  accountType,
  accountMembers = [],
  paymentEvent,
  onMonthChange,
  selectedMonth: externalSelectedMonth,
  onSelectMonth: externalOnSelectMonth,
}) => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deletingId, setDeletingId] = useState(null);
  const [internalSelectedMonth, setInternalSelectedMonth] = useState(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
  });

  const activeSelectedMonth =
    externalSelectedMonth !== undefined
      ? externalSelectedMonth
      : internalSelectedMonth;

  const handleSelectMonth = (val) => {
    if (externalOnSelectMonth) {
      externalOnSelectMonth(val);
    } else {
      setInternalSelectedMonth(val);
    }
  };

  const user = useUserStore((u) => u.user);

  // Derive available months from transactions and filter
  const { availableMonths, filteredTransactions } = useMemo(() => {
    const monthMap = new Map();
    const fullMonthNames = [
      "January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"
    ];
    const shortMonthNames = [
      "Jan", "Feb", "Mar", "Apr", "May", "Jun",
      "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
    ];

    // Always ensure current month is present in the list
    const now = new Date();
    const currKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
    monthMap.set(currKey, {
      key: currKey,
      label: `${shortMonthNames[now.getMonth()]} ${now.getFullYear()}`,
      fullName: `${fullMonthNames[now.getMonth()]} ${now.getFullYear()}`,
      year: now.getFullYear(),
      month: now.getMonth(),
    });

    transactions.forEach((tx) => {
      if (!tx.date) return;
      const d = new Date(tx.date);
      if (isNaN(d.getTime())) return;
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      if (!monthMap.has(key)) {
        monthMap.set(key, {
          key,
          label: `${shortMonthNames[d.getMonth()]} ${d.getFullYear()}`,
          fullName: `${fullMonthNames[d.getMonth()]} ${d.getFullYear()}`,
          year: d.getFullYear(),
          month: d.getMonth(),
        });
      }
    });

    // Sort by most recent first
    const sorted = Array.from(monthMap.values()).sort((a, b) => {
      if (b.year !== a.year) return b.year - a.year;
      return b.month - a.month;
    });

    const filtered = transactions.filter((tx) => {
      if (!tx.date) return false;
      const d = new Date(tx.date);
      if (isNaN(d.getTime())) return false;
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      return key === activeSelectedMonth;
    });

    return { availableMonths: sorted, filteredTransactions: filtered };
  }, [transactions, activeSelectedMonth]);

  const monthSpend = useMemo(() => {
    return filteredTransactions.reduce(
      (sum, tx) => sum + (Number(tx.amount) || 0),
      0
    );
  }, [filteredTransactions]);

  // Report month stats up to parent component
  useEffect(() => {
    if (onMonthChange && availableMonths.length > 0) {
      const active =
        availableMonths.find((m) => m.key === activeSelectedMonth) ||
        availableMonths[0];
      if (active) {
        onMonthChange({
          monthKey: active.key,
          monthLabel: active.label,
          monthName: active.fullName || active.label,
          totalSpend: monthSpend,
          totalTransactions: filteredTransactions.length,
        });
      }
    }
  }, [
    activeSelectedMonth,
    monthSpend,
    filteredTransactions.length,
    availableMonths,
    onMonthChange,
  ]);

  const fetchTransactions = useCallback(async () => {
    setLoading(true);
    setTransactions([]);
    setError("");
    try {
      const { data } = await axiosInstance.get(
        `${import.meta.env.VITE_BACKEND_URL}/payment`,
        {
          params: {
            accountId,
          },
          headers: { "Content-Type": "application/json" },
          withCredentials: true,
        },
      );
      setTransactions([...(data || [])]);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch transactions.");
    } finally {
      setLoading(false);
    }
  }, [accountId]);

  useEffect(() => {
    if (accountId) fetchTransactions();

    const handler = ()=>{
      fetchTransactions();
    };
    window.addEventListener("paymentUpdate",handler);

    return ()=>{
      window.removeEventListener("paymentUpdate",handler);
    }
  }, [accountId, fetchTransactions]);

  const handleDelete = async (transactionId, amount) => {
    if (!window.confirm("Are you sure you want to delete this transaction?"))
      return;
    setDeletingId(transactionId);
    try {
      await axiosInstance.delete(
        `${import.meta.env.VITE_BACKEND_URL}/payment/delete`,
        {
          params: {
            amount,
            accountId,
            paymentId: transactionId,
          },
          headers: { "Content-Type": "application/json" },
          withCredentials: true,
        },
      );
      toast.success("Transaction deleted successfully.");
      window.dispatchEvent(paymentEvent);
    } catch (err) {
      toast.error(
        err.response?.data?.message || "Failed to delete transaction.",
      );
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
        <p className="text-gray-400 text-sm mt-1">
          Transactions will appear here once added.
        </p>
      </div>
    );
  }

  return (
    <div className="mt-6 bg-white rounded-2xl border border-gray-200 shadow-lg overflow-hidden">
      {/* Header */}
      <div className="p-5 border-b border-gray-100 flex flex-wrap items-center gap-2">
        <div className="w-1.5 h-6 bg-gradient-to-b from-blue-500 to-purple-500 rounded-full"></div>
        <h2 className="text-lg font-bold text-gray-800">Transactions</h2>

        {/* Month Filter */}
        {availableMonths.length > 0 && (
          <div className="relative ml-auto flex items-center gap-2">
            <HiOutlineCalendar className="w-4 h-4 text-gray-400" />
            <select
              value={activeSelectedMonth}
              onChange={(e) => handleSelectMonth(e.target.value)}
              className="appearance-none bg-gray-50 border border-gray-200 text-gray-700 text-xs font-semibold rounded-xl px-3 py-1.5 pr-7 focus:outline-none focus:ring-2 focus:ring-purple-300 focus:border-purple-300 transition-all duration-200 cursor-pointer hover:bg-gray-100"
            >
              {availableMonths.map((m) => (
                <option key={m.key} value={m.key}>
                  {m.label}
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2">
              <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        )}

        <span className={`text-xs font-semibold text-purple-600 bg-purple-50 border border-purple-200 px-2.5 py-1 rounded-full ${availableMonths.length === 0 ? 'ml-auto' : ''}`}>
          {filteredTransactions.length}{" "}
          {filteredTransactions.length === 1 ? "entry" : "entries"}
        </span>
      </div>

      {/* Table Header - Desktop */}
      <div
        className={`hidden sm:grid ${
          accountType === "personal" ? "grid-cols-4" : "grid-cols-6"
        } gap-4 px-6 py-3 bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-100 text-xs font-bold text-gray-500 uppercase tracking-wider`}
      >
        {accountType !== "personal" && <div>Paid By</div>}
        <div>Amount</div>
        <div>Where</div>
        <div>Date & Time</div>
        {accountType !== "personal" && <div>Member Expenses</div>}
        <div className="text-center">Action</div>
      </div>

      {/* Transaction List */}
      <ul className="divide-y divide-gray-100">
        {filteredTransactions.length === 0 && (
          <li className="p-8 text-center">
            <HiOutlineCalendar className="w-8 h-8 text-gray-300 mx-auto mb-2" />
            <p className="text-gray-500 font-medium text-sm">No transactions for this month.</p>
          </li>
        )}
        {filteredTransactions.map((tx, idx) => (
          <li key={tx._id || idx} className="group">
            {/* Desktop View */}
            <div
              className={`hidden sm:grid ${
                accountType === "personal" ? "sm:grid-cols-4" : "sm:grid-cols-6"
              } gap-4 px-6 py-4 items-center hover:bg-gradient-to-r hover:from-blue-50/50 hover:to-purple-50/50 transition-all duration-300`}
            >
              {/* Paid By */}
              {accountType !== "personal" && (
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center shrink-0 shadow-sm">
                    <span className="text-white text-xs font-bold">
                      {tx.paidBy?.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <span className="font-semibold text-gray-800 text-sm truncate">
                    {tx.paidBy}
                  </span>
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
              {accountType !== "personal" && (
                <div>
                  {tx.memberExpenses && tx.memberExpenses.length > 0 ? (
                    <div className="space-y-1">
                      {tx.memberExpenses.map((expense, expenseIdx) => (
                        <div
                          key={expenseIdx}
                          className="flex justify-between items-center bg-blue-50 border border-blue-100 px-2.5 py-1 rounded-lg text-xs"
                        >
                          <span className="text-blue-700 font-medium truncate mr-2">
                            {accountType === "shared" &&
                            accountMembers[expenseIdx]
                              ? accountMembers[expenseIdx]
                              : `M${expenseIdx + 1}`}
                          </span>
                          <span className="text-blue-900 font-bold whitespace-nowrap">
                            ₹{expense}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <span className="text-gray-400 text-xs italic">
                      No expenses
                    </span>
                  )}
                </div>
              )}

              {/* Action */}
              <div className="flex justify-center">
                <button
                  onClick={() => handleDelete(tx._id, tx.amount)}
                  className="p-2.5 rounded-xl bg-red-50 border border-red-100 text-red-500 hover:bg-red-100 hover:border-red-200 hover:text-red-600 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-red-300 disabled:opacity-40 disabled:cursor-not-allowed"
                  disabled={
                    deletingId === tx._id || user?.userName !== tx.paidBy
                  }
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
                {accountType !== "personal" ? (
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
                    {accountType !== "personal" ? (
                      <span className="font-semibold text-gray-800 text-sm truncate">
                        {tx.paidBy}
                      </span>
                    ) : null}
                    <span className="font-bold text-green-600 bg-green-50 border border-green-200 px-2 py-0.5 rounded-lg text-sm ml-auto shrink-0">
                      ₹{tx.amount}
                    </span>
                  </div>

                  {/* Where - Centered */}
                  <div className="text-center my-2">
                    <span className="font-semibold text-gray-800 text-base">
                      {tx.where}
                    </span>
                  </div>

                  {/* Member Expenses - Mobile */}
                  {accountType !== "personal" &&
                    tx.memberExpenses &&
                    tx.memberExpenses.length > 0 && (
                      <div className="flex flex-col items-center gap-1.5 mb-2">
                        {tx.memberExpenses.map((expense, expenseIdx) => (
                          <div
                            key={expenseIdx}
                            className="flex items-center justify-between w-48 bg-blue-50 border border-blue-100 text-xs px-3 py-1.5 rounded-lg"
                          >
                            <span className="text-blue-700 font-medium">
                              {accountType === "shared" &&
                              accountMembers[expenseIdx]
                                ? accountMembers[expenseIdx]
                                : `M${expenseIdx + 1}`}
                            </span>
                            <span className="text-blue-900 font-bold">
                              ₹{expense}
                            </span>
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
                  onClick={() => handleDelete(tx._id, tx.amount)}
                  className="p-2 rounded-xl bg-red-50 border border-red-100 text-red-500 hover:bg-red-100 transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed shrink-0 self-center"
                  disabled={
                    deletingId === tx._id || user?.userName !== tx.paidBy
                  }
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