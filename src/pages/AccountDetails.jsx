import { useParams } from "react-router-dom";
import {
  HiArrowLeft,
  HiPlus,
  HiRefresh,
  HiSparkles,
  HiOutlineCurrencyRupee,
  HiOutlineUsers,
  HiOutlineDocumentText,
} from "react-icons/hi";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import AddTransactionPopup from "../components/AddTransactionPopup";
import axiosInstance from "../functions/axiosInstance";
import TransactionsHistory from "../components/TransactionsHistory";
import { useNavigate } from "react-router-dom";
import AccountPaidSpend from "../components/AccountPaidSpend";
import useUserStore from "../store/useUserStore";
import socket from "../socket";
import { toast } from "react-toastify";
import ReportViewer from "../components/ReportViewer";

const AccountDetails = () => {
  const [account, setAccount] = useState({});
  const [members, setMembers] = useState([]);
  let { acId } = useParams();
  const [isAddTransactionOpen, setIsAddTransactionOpen] = useState(false);
  const navigate = useNavigate();
  const [transactionsRefreshKey, setTransactionsRefreshKey] = useState(0);
  const [loading, setLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(false);
  const user = useUserStore((u) => u.user);
  const [isAISummaryLoading, setIsAISummaryLoading] = useState(false);
  const [aiSummary, setAiSummary] = useState("");
  const [showSummaryPopup, setShowSummaryPopup] = useState(false);
  const [paidSpendSummery, setPaidSpendSummery] = useState({});
  const [paidSpendLoading, setPaidSpendLoading] = useState(true);

  const fetchAccountDetails = async () => {
    try {
      setAccount({});
      setIsFetching(true);
      const { data } = await axiosInstance.post(
        `${import.meta.env.VITE_BACKEND_URL}/account/details`,
        {
          acId,
        },
        {
          withCredentials: true,
        },
      );
      if (!data || !data?._id) {
        toast.error("No account found!");
        navigate("/my-accounts");
        return;
      }
      setAccount(data);
      if (data.accountType === "shared") {
        await fetchMembersName(data.accountMembers);
      }
    } catch {
      toast.error("No account found");
      navigate("/my-accounts");
    } finally {
      setIsFetching(false);
    }
  };
  const fetchMembersName = async (userIds) => {
    const { data } = await axiosInstance.post(
      `${import.meta.env.VITE_BACKEND_URL}/auth/v1/usernames`,
      {
        userIds,
      },
      {
        withCredentials: true,
      },
    );
    setMembers([...data]);
  };

  const fetchUserPaidSpend = async () => {
    if (!account?._id || !user?.userName) return;
    try {
      setPaidSpendLoading(true);
      const { data } = await axiosInstance.post(
        `${import.meta.env.VITE_BACKEND_URL}/payment/paidspend`,
        { accountMembers: [...members] },
        {
          params: { accountId: account._id },
          headers: { "Content-Type": "application/json" },
          withCredentials: true,
        },
      );
      setPaidSpendSummery(data);
      // const paid = data?.paidSummary?.[user.userName] || 0;
      // const spend = data?.expenseSummary?.[user.userName] || 0;
      // setUserDue(paid < spend ? spend - paid : 0);
    } catch (err) {
      console.error("Failed to fetch user paid-spend data:", err);
    } finally {
      setPaidSpendLoading(false);
    }
  };

  useEffect(() => {
    socket?.on("payment-update", () => {
      setTransactionsRefreshKey((k) => k + 1);
      fetchAccountDetails();
    });
    return () => {
      socket?.off("payment-update");
    };
  });

  useEffect(() => {
    fetchAccountDetails();
  }, []);

  useEffect(() => {
    if (
      account?._id &&
      account.accountType === "shared" &&
      user?.userName &&
      members.length > 1
    ) {
      fetchUserPaidSpend();
    }
  }, [account?._id, user?.userName, transactionsRefreshKey, members]);

  // Clear Transactions handler
  const handleClearTransactions = async () => {
    if (!window.confirm("Are you sure you want to clear all transactions?"))
      return;
    setLoading(true);
    try {
      const { data } = await axiosInstance.put(
        `${import.meta.env.VITE_BACKEND_URL}/payment/clear`,
        {},
        {
          params: { accountId: account?._id },
          headers: { "Content-Type": "application/json" },
          withCredentials: true,
        },
      );
      toast.success(data.message);
      setTransactionsRefreshKey((k) => k + 1);
      fetchAccountDetails();
    } catch (err) {
      toast.error(
        err.response?.data?.message || "Failed to clear transactions.",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleAISummarizer = async () => {
    if (account.totalTransaction < 5) {
      toast.info("Minimum 5 transactions required for AI summary analysis");
      return;
    }

    setIsAISummaryLoading(true);
    setShowSummaryPopup(true);
    try {
      const { data } = await axiosInstance.post(
        `${import.meta.env.VITE_BACKEND_URL}/userAccount/accountsummery`,
        {
          accountId: account?._id,
        },
        {
          withCredentials: true,
        },
      );
      if (data && data.summary) {
        setAiSummary(data.summary);
      } else {
        toast.error("No summary available");
      }
    } catch {
      toast.error("Failed to generate AI summary");
      setShowSummaryPopup(false);
    } finally {
      setIsAISummaryLoading(false);
    }
  };

  const closeSummaryPopup = () => {
    setShowSummaryPopup(false);
    setAiSummary("");
  };

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-indigo-100 via-purple-50 to-pink-100 py-8 px-4 pb-24 overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-purple-300/40 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-blue-300/40 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-r from-blue-200/20 to-purple-200/20 rounded-full blur-3xl"></div>
        {/* Floating particles */}
        <div className="absolute top-20 left-1/4 w-2 h-2 bg-blue-400/60 rounded-full animate-bounce delay-100"></div>
        <div className="absolute top-40 right-1/3 w-3 h-3 bg-purple-400/60 rounded-full animate-bounce delay-300"></div>
        <div className="absolute bottom-40 left-1/3 w-2 h-2 bg-pink-400/60 rounded-full animate-bounce delay-500"></div>
      </div>

      <div className="max-w-5xl mx-auto relative z-10">
        {/* Header Section */}
        <div className="mb-8">
          <Link
            to="/my-accounts"
            className="inline-flex items-center gap-2 text-gray-600 hover:text-blue-600 mb-6 transition-all duration-200 group"
          >
            <div className="p-2 rounded-xl bg-white shadow-md group-hover:bg-blue-50 group-hover:shadow-lg transition-all duration-200">
              <HiArrowLeft className="w-5 h-5" />
            </div>
            <span className="font-medium">Back to Accounts</span>
          </Link>

          <div className="flex items-center gap-4 mb-6">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl blur-lg opacity-40 animate-pulse"></div>
              <div className="relative bg-gradient-to-r from-blue-500 to-purple-500 p-3 rounded-2xl shadow-lg">
                <HiOutlineDocumentText className="text-2xl text-white" />
              </div>
            </div>
            <div>
              <h1 className="text-3xl sm:text-4xl font-black bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent tracking-tight">
                {!isFetching ? account?.accountName : "Loading..."}
              </h1>
              {account?.accountType && (
                <span className={`inline-flex items-center gap-1.5 mt-1 px-3 py-1 rounded-full text-xs font-bold shadow-md ${
                  account.accountType === 'personal'
                    ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white'
                    : 'bg-gradient-to-r from-amber-500 to-orange-500 text-white'
                }`}>
                  <HiSparkles className="w-3 h-3" />
                  {account.accountType === 'personal' ? 'Personal' : 'Shared'}
                </span>
              )}
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="group relative rounded-2xl transition-all duration-300 hover:-translate-y-1">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-green-400 to-emerald-400 rounded-2xl blur opacity-0 group-hover:opacity-40 transition-all duration-500"></div>
              <div className="relative bg-white rounded-2xl border border-gray-200 shadow-lg p-5">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 rounded-xl bg-green-50">
                    <HiOutlineCurrencyRupee className="w-6 h-6 text-green-500" />
                  </div>
                  <p className="text-sm font-medium text-gray-500">Total Spend</p>
                </div>
                <p className="text-3xl font-bold text-gray-800">
                  ₹{!isFetching ? account.totalSpend : "-"}
                </p>
              </div>
            </div>

            <div className="group relative rounded-2xl transition-all duration-300 hover:-translate-y-1">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-400 to-indigo-400 rounded-2xl blur opacity-0 group-hover:opacity-40 transition-all duration-500"></div>
              <div className="relative bg-white rounded-2xl border border-gray-200 shadow-lg p-5">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 rounded-xl bg-blue-50">
                    <HiOutlineUsers className="w-6 h-6 text-blue-500" />
                  </div>
                  <p className="text-sm font-medium text-gray-500">Members</p>
                </div>
                <p className="text-3xl font-bold text-gray-800">
                  {!isFetching ? account.accountMembers?.length : "-"}
                </p>
              </div>
            </div>

            <div className="group relative rounded-2xl transition-all duration-300 hover:-translate-y-1">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-400 to-pink-400 rounded-2xl blur opacity-0 group-hover:opacity-40 transition-all duration-500"></div>
              <div className="relative bg-white rounded-2xl border border-gray-200 shadow-lg p-5">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 rounded-xl bg-purple-50">
                    <HiOutlineDocumentText className="w-6 h-6 text-purple-500" />
                  </div>
                  <p className="text-sm font-medium text-gray-500">Total Transactions</p>
                </div>
                <p className="text-3xl font-bold text-gray-800">
                  {!isFetching ? account.totalTransaction : "-"}
                </p>
              </div>
            </div>
          </div>
        </div>

        {account.accountType === "shared" && (
          <AccountPaidSpend
            accountMembers={members}
            paidSpendLoading={paidSpendLoading}
            paidSpendSummery={paidSpendSummery}
          />
        )}

        {/* Action Buttons Row */}
        <div className="mb-6 bg-white rounded-2xl border border-gray-200 shadow-lg p-6">
          <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
            <div className="w-1.5 h-6 bg-gradient-to-b from-blue-500 to-purple-500 rounded-full"></div>
            Quick Actions
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Add Transaction Button */}
            <button
              onClick={() => setIsAddTransactionOpen(true)}
              className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-semibold bg-blue-50 text-blue-600 border border-blue-200 hover:bg-blue-100 hover:border-blue-300 transition-all duration-200 active:scale-95"
            >
              <HiPlus className="w-5 h-5" />
              <span>Add Transaction</span>
            </button>

            {/* Clear Transactions Button */}
            {account.accountHolder === user?._id && (
              <button
                onClick={handleClearTransactions}
                disabled={account.totalTransaction === 0 || loading}
                className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-semibold bg-red-50 text-red-600 border border-red-200 hover:bg-red-100 hover:border-red-300 transition-all duration-200 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  />
                </svg>
                <span>Clear Transactions</span>
              </button>
            )}

            {/* AI Summarizer Button */}
            <button
              onClick={handleAISummarizer}
              disabled={isFetching}
              className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-semibold bg-teal-50 text-teal-600 border border-teal-200 hover:bg-teal-100 hover:border-teal-300 transition-all duration-200 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <HiSparkles className="w-5 h-5" />
              <span>AI Summarizer</span>
            </button>
          </div>
        </div>

        {/* Transaction Section */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-lg overflow-hidden">
          <div className="p-6 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-1.5 h-6 bg-gradient-to-b from-blue-500 to-purple-500 rounded-full"></div>
                <h2 className="text-xl font-bold text-gray-800">
                  Transaction History
                </h2>
                <button
                  onClick={() => setTransactionsRefreshKey((k) => k + 1)}
                  className="ml-2 p-2 rounded-xl bg-gray-100 hover:bg-blue-50 text-blue-500 hover:text-blue-600 transition-all duration-200"
                  title="Refresh Transactions"
                >
                  <HiRefresh className="w-5 h-5" />
                </button>
              </div>
            </div>
            <TransactionsHistory
              accountId={account?._id}
              refreshKey={transactionsRefreshKey}
              newDeletion={() => {
                setTransactionsRefreshKey((k) => k + 1);
                fetchAccountDetails();
              }}
              accountType={account.accountType}
              accountMembers={members}
            />
          </div>
        </div>
      </div>

      {/* AI Summary Popup */}
      {showSummaryPopup && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[85vh] overflow-hidden flex flex-col border border-gray-200">
            {/* Header */}
            <div className="relative overflow-hidden p-6 bg-gradient-to-r from-purple-500 to-pink-500 shrink-0">
              <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
              <div className="relative flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-white/20">
                    <HiSparkles className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white">AI Account Summary</h2>
                    <p className="text-purple-100 text-sm">Powered by AI analysis</p>
                  </div>
                </div>
                <button
                  onClick={closeSummaryPopup}
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
            <div className="flex-1 min-h-0 overflow-y-auto p-6">
              {isAISummaryLoading ? (
                <div className="flex flex-col items-center justify-center py-16">
                  <div className="relative">
                    <div className="w-20 h-20 rounded-full bg-gradient-to-r from-purple-100 to-pink-100 animate-pulse"></div>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-14 h-14 rounded-full border-4 border-purple-200 border-t-purple-500 animate-spin"></div>
                    </div>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <HiSparkles className="w-6 h-6 text-purple-500 animate-pulse" />
                    </div>
                  </div>
                  <div className="mt-6 text-center">
                    <h3 className="text-lg font-bold text-gray-800 mb-2">
                      AI is analyzing your account...
                    </h3>
                    <p className="text-gray-500">
                      Generating intelligent insights from your transaction data
                    </p>
                  </div>
                  <div className="mt-4 flex space-x-1.5">
                    <div className="w-2.5 h-2.5 bg-purple-400 rounded-full animate-bounce"></div>
                    <div
                      className="w-2.5 h-2.5 bg-purple-400 rounded-full animate-bounce"
                      style={{ animationDelay: "0.1s" }}
                    ></div>
                    <div
                      className="w-2.5 h-2.5 bg-purple-400 rounded-full animate-bounce"
                      style={{ animationDelay: "0.2s" }}
                    ></div>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-5 border border-purple-100">
                    <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                      <span className="text-lg">📊</span> Account Insights
                    </h3>
                    <ReportViewer text={aiSummary} />
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="border-t border-gray-200 p-4 bg-gray-50 shrink-0">
              <div className="flex gap-3">
                <button
                  onClick={closeSummaryPopup}
                  className="flex-1 px-6 py-3 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition-all duration-200 font-semibold"
                >
                  Close
                </button>
                <button
                  onClick={closeSummaryPopup}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl hover:from-purple-600 hover:to-pink-600 transition-all duration-200 font-semibold shadow-lg shadow-purple-500/25"
                >
                  Got It
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <AddTransactionPopup
        isOpen={isAddTransactionOpen}
        accountMembers={members}
        accountId={account?._id}
        onClose={(value) => {
          setIsAddTransactionOpen(false);
          if (value) {
            toast.success("Transaction Added Successfully.");
            setTransactionsRefreshKey((k) => k + 1);
            fetchAccountDetails();
          }
        }}
        accountType={account.accountType}
      />
    </div>
  );
};

export default AccountDetails;
