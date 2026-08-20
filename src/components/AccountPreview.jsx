import { useEffect, useState } from "react";
import { Link } from "react-router-dom"; // Added missing import
import { HiOutlineDocumentText } from "react-icons/hi"; // Added missing import
import axiosInstance from "../functions/axiosInstance";
import formatDate from "../functions/formatDate";

// Function to fetch top 5 transactions for an account
const fetchTop5Transactions = async (accountId, signal) => {
  try {
    const { data } = await axiosInstance.get(
      `${import.meta.env.VITE_BACKEND_URL}/payment`,
      {
        params: { accountId },
        headers: { "Content-Type": "application/json" },
        withCredentials: true,
        signal,
      },
    );
    // Assuming backend sends oldest first. Grabs last 5 and reverses for UI.
    return (data || []).slice(-5).reverse();
  } catch (err) {
    if (err.name === "CanceledError") return null; // Ignore aborted requests
    console.error("Failed to fetch transactions:", err);
    return [];
  }
};

export default function AccountPreview({ previewAccount, closePreview }) {
  const [previewTransactions, setPreviewTransactions] = useState([]);
  const [loadingTransactions, setLoadingTransactions] = useState(false);

  useEffect(() => {
    const controller = new AbortController(); // Prevents race conditions

    const loadPreviewTransactions = async () => {
      if (previewAccount?._id) {
        setLoadingTransactions(true);
        const transactions = await fetchTop5Transactions(
          previewAccount._id,
          controller.signal,
        );
        if (transactions) {
          // Only set if not aborted
          setPreviewTransactions(transactions);
          setLoadingTransactions(false);
        }
      } else {
        setPreviewTransactions([]);
      }
    };

    loadPreviewTransactions();

    return () => controller.abort(); // Cleanup on unmount or account change
  }, [previewAccount]);

  // Safely return null if no account is provided to prevent crashes
  if (!previewAccount) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[85vh] overflow-hidden flex flex-col border border-gray-200">
        {/* Header */}
        <div className="relative overflow-hidden p-6 bg-gradient-to-r from-blue-500 to-purple-500 shrink-0 min-h-[104px]">
          <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
          <div className="relative flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-white mb-1">
                {previewAccount.accountName}
              </h2>
              <p className="text-blue-100 text-sm">Recent activity preview</p>
            </div>
            <button
              onClick={closePreview}
              className="p-2 rounded-xl bg-white/20 text-white hover:bg-white/30 transition-all"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
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

        {/* Content */}
        <div className="flex-1 min-h-0 overflow-y-auto p-6 pt-4">
          <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">
            Recent Transactions
          </h3>
          {loadingTransactions ? (
            <div className="flex flex-col items-center justify-center py-16">
              <div className="relative">
                <div className="w-16 h-16 rounded-full bg-gradient-to-r from-blue-100 to-purple-100 animate-pulse"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-12 h-12 rounded-full border-4 border-blue-200 border-t-blue-500 animate-spin"></div>
                </div>
              </div>
              <p className="text-gray-500 mt-4">Loading transactions...</p>
            </div>
          ) : previewTransactions.length > 0 ? (
            <div className="space-y-3">
              {previewTransactions.map((tx, idx) => (
                <div
                  key={tx._id || idx}
                  className="group bg-gray-50 rounded-xl p-4 hover:bg-gray-100 transition-all duration-200 border border-gray-100 hover:border-gray-200"
                >
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex-1">
                      <p className="font-semibold text-gray-800 group-hover:text-blue-600 transition-colors">
                        {tx.where}
                      </p>
                      <p className="text-sm text-gray-500 flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                        Paid by {tx.paidBy}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xl font-bold text-green-600">
                        ₹{tx.amount}
                      </p>
                    </div>
                  </div>
                  <p className="text-xs text-gray-400 flex items-center gap-1">
                    <svg
                      className="w-3 h-3"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    {formatDate(tx.date)}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
                <HiOutlineDocumentText className="w-8 h-8 text-gray-400" />
              </div>
              <p className="text-gray-500">No transactions found</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 p-4 bg-gray-50 shrink-0">
          <div className="flex gap-3">
            <button
              onClick={closePreview}
              className="flex-1 px-6 py-3 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition-all duration-200 font-semibold"
            >
              Close
            </button>
            <Link
              to={`/my-accounts/${previewAccount._id}`}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-xl hover:from-blue-600 hover:to-purple-600 transition-all duration-200 font-semibold text-center shadow-lg shadow-purple-500/25"
            >
              View Full Details
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
