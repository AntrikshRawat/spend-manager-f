import { Link, useNavigate } from "react-router-dom";
import {
  HiOutlineTrash,
  HiOutlineEye,
  HiPlus,
  HiUserGroup,
  HiOutlineCurrencyRupee,
  HiOutlineUsers,
  HiOutlineDocumentText,
  HiOutlineSparkles,
} from "react-icons/hi";
import { useEffect, useState } from "react";
import useUserStore from "../store/useUserStore";
import axiosInstance from "../functions/axiosInstance";
import { toast } from "react-toastify";
import useAccountStore from "../store/useAccountStore";
import { AccountSkeleton } from "../Skeletons/AccountSkeleton";
import AccountPreview from "../components/AccountPreview";

export default function MyAccounts() {
  const navigate = useNavigate();
  const user = useUserStore((u) => u.user);
  const isLoggedIn = useUserStore((u) => u.isLoggedIn);
  const createdAccounts = useAccountStore((s) => s.createdAccounts);
  const joinedAccounts = useAccountStore((s) => s.joinedAccounts);
  const fetchAndUpdateAccounts = useAccountStore(
    (s) => s.fetchAndUpdateAccounts,
  );
  const [activeTab, setActiveTab] = useState("all");
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteMessage, setDeleteMessage] = useState("");
  const [previewAccount, setPreviewAccount] = useState(null);
  const [preview, setIsPreview] = useState(false);

  useEffect(() => {
    window.addEventListener("updateEvent", fetchAndUpdateAccounts);

    return () => {
      window.removeEventListener("updateEvent", fetchAndUpdateAccounts);
    };
  }, [fetchAndUpdateAccounts]);

  useEffect(() => {
    fetchAndUpdateAccounts();
  }, []);

  useEffect(() => {
    const loadAccounts = async () => {
      if (createdAccounts !== null && joinedAccounts !== null) {
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      if (isLoggedIn) {
        await fetchAndUpdateAccounts();
      }
      setIsLoading(false);
    };
    loadAccounts();
  }, [createdAccounts, joinedAccounts, fetchAndUpdateAccounts, isLoggedIn]);

  useEffect(() => {
    if (!user && !isLoggedIn) {
      navigate("/login");
      return;
    }
  }, [user, isLoggedIn, navigate]);

  let filteredAccounts = [];
  if (createdAccounts !== null && joinedAccounts !== null) {
    const allAccounts = [...createdAccounts, ...joinedAccounts];
    if (activeTab === "all") {
      filteredAccounts = allAccounts;
    } else if (activeTab === "created") {
      filteredAccounts = createdAccounts;
    } else if (activeTab === "joined") {
      filteredAccounts = joinedAccounts;
    }
  }

  const handleDeleteAccount = async (accountId) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this account? This action cannot be undone.",
    );
    if (!confirmed) return;
    setIsDeleting(true);
    setDeleteMessage("Deleting your account...");
    try {
      await axiosInstance.delete(
        `${import.meta.env.VITE_BACKEND_URL}/account/delete`,
        {
          data: { accountId },
          withCredentials: true,
        },
      );
      setDeleteMessage("Account deleted successfully!");
      // Animation: wait, then hide overlay and refresh
      fetchAndUpdateAccounts();
      setTimeout(() => {
        setIsDeleting(false);
        setDeleteMessage("");
      }, 1500);
    } catch (error) {
      console.error("Failed to delete account:", error);
      setDeleteMessage("Failed to delete account. Please try again.");
      toast.error("Failed to delete account. Please try again.");
      setTimeout(() => {
        setIsDeleting(false);
        setDeleteMessage("");
      }, 2000);
    }
  };

  if (isLoading && (createdAccounts === null || joinedAccounts === null)) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-purple-50 to-pink-100 py-10 px-2 sm:px-4 relative overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-purple-300/40 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-blue-300/40 rounded-full blur-3xl animate-pulse delay-1000"></div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-r from-blue-200/20 to-purple-200/20 rounded-full blur-3xl"></div>
        </div>

        <div className="max-w-5xl mx-auto relative z-10">
          {/* Header */}
          <div className="flex flex-col items-center mb-12">
            <div className="flex items-center gap-4 mb-4">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl blur-lg opacity-40"></div>
                <div className="relative bg-gradient-to-r from-blue-500 to-purple-500 p-3 rounded-2xl">
                  <HiUserGroup className="text-3xl text-white" />
                </div>
              </div>
              <h1 className="text-4xl sm:text-5xl font-black bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent tracking-tight">
                My Accounts
              </h1>
            </div>
            <p className="text-gray-600 text-center max-w-lg text-lg">
              Manage all your shared spending accounts in one place
            </p>
          </div>

          {/* Tab Navigation */}
          <div className="flex justify-center mb-10">
            <div className="inline-flex rounded-2xl bg-white/80 backdrop-blur-xl p-1.5 shadow-lg border border-gray-200">
              {["all", "created", "joined"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-6 py-3 text-sm font-semibold rounded-xl transition-all duration-300 ${
                    activeTab === tab
                      ? "bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg shadow-purple-500/25"
                      : "text-gray-600 hover:text-gray-800 hover:bg-gray-100"
                  }`}
                >
                  {tab === "all"
                    ? "All Accounts"
                    : tab === "created"
                    ? "Created by Me"
                    : "Joined"}
                </button>
              ))}
            </div>
          </div>

          {/* Skeleton Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <AccountSkeleton />
            <AccountSkeleton />
          </div>
        </div>
      </div>
    );
  }
  return (
    <>
      {/* Blur Loading Overlay for Deleting */}
      {isDeleting && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md">
          <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl px-10 py-8 flex flex-col items-center gap-5 animate-fade-in border border-white/20">
            {deleteMessage === "Deleting your account..." ? (
              <>
                <div className="relative">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-r from-red-500 to-orange-500 animate-pulse"></div>
                  <svg
                    className="absolute inset-0 animate-spin h-16 w-16 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="3"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8v8z"
                    ></path>
                  </svg>
                </div>
                <span className="text-lg font-semibold text-gray-700">
                  {deleteMessage}
                </span>
              </>
            ) : (
              <>
                <div className="w-16 h-16 rounded-full bg-gradient-to-r from-green-500 to-emerald-500 flex items-center justify-center">
                  <svg
                    className="h-8 w-8 text-white"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
                <span className="text-lg font-semibold text-green-600">
                  {deleteMessage}
                </span>
              </>
            )}
          </div>
        </div>
      )}

      <div
        className={`relative min-h-screen bg-gradient-to-br from-indigo-100 via-purple-50 to-pink-100 py-10 px-2 sm:px-4 overflow-hidden transition-all duration-300 ${
          isDeleting ? "filter blur-sm pointer-events-none select-none" : ""
        }`}
      >
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
          {/* Header */}
          <div className="flex flex-col items-center mb-12">
            <div className="flex items-center gap-4 mb-4">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl blur-lg opacity-40 animate-pulse"></div>
                <div className="relative bg-gradient-to-r from-blue-500 to-purple-500 p-3 rounded-2xl shadow-lg">
                  <HiUserGroup className="text-3xl text-white" />
                </div>
              </div>
              <h1 className="text-4xl sm:text-5xl font-black bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent tracking-tight">
                My Accounts
              </h1>
            </div>
            <p className="text-gray-600 text-center max-w-lg text-lg">
              Manage all your shared spending accounts in one place
            </p>
          </div>

          {/* Tab Navigation */}
          <div className="flex justify-center mb-10">
            <div className="inline-flex rounded-2xl bg-white/80 backdrop-blur-xl p-1.5 shadow-lg border border-gray-200">
              {["all", "created", "joined"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-6 py-3 text-sm font-semibold rounded-xl transition-all duration-300 ${
                    activeTab === tab
                      ? "bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg shadow-purple-500/25 scale-105"
                      : "text-gray-600 hover:text-gray-800 hover:bg-gray-100"
                  }`}
                >
                  {tab === "all"
                    ? "All Accounts"
                    : tab === "created"
                    ? "Created by Me"
                    : "Joined"}
                </button>
              ))}
            </div>
          </div>

          {/* Empty State for Joined Accounts */}
          {activeTab === "joined" && filteredAccounts?.length === 0 && (
            <div className="text-center py-16">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-r from-purple-200 to-pink-200 mb-6">
                <HiOutlineUsers className="w-10 h-10 text-purple-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-3">
                No Joined Accounts
              </h2>
              <p className="text-gray-500 max-w-md mx-auto">
                You haven&apos;t joined any shared accounts yet. Ask a friend to
                invite you to their account!
              </p>
            </div>
          )}

          {/* Accounts Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredAccounts.map((account, index) => (
              <Link
                key={account._id}
                to={`/my-accounts/${account._id}`}
                className="group relative rounded-2xl transition-all duration-500 hover:-translate-y-2"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                {/* Card glow effect */}
                <div
                  className={`absolute -inset-0.5 bg-gradient-to-r ${
                    account.accountType === "personal"
                      ? "from-emerald-500 to-teal-500"
                      : "from-blue-500 to-purple-500"
                  } rounded-2xl blur opacity-0 group-hover:opacity-50 transition-all duration-500`}
                ></div>

                <div className="relative bg-white rounded-2xl border border-gray-200 shadow-lg overflow-hidden">
                  <div className="p-6">
                    {/* Header with Account Name, Badge, and Actions */}
                    <div className="flex justify-between items-center mb-6 gap-4">
                      <div className="flex-shrink-0">
                        <h3 className="text-xl font-bold text-gray-800 mb-1 group-hover:text-blue-600 transition-colors">
                          {account.accountName}
                        </h3>
                      </div>

                      {/* Centered Badge */}
                      <div
                        className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-bold shadow-lg flex items-center gap-1.5 ${
                          account.accountType === "personal"
                            ? "bg-gradient-to-r from-emerald-500 to-teal-500 text-white"
                            : "bg-gradient-to-r from-amber-500 to-orange-500 text-white"
                        }`}
                      >
                        <HiOutlineSparkles className="w-3 h-3" />
                        {account.accountType === "personal"
                          ? "Personal"
                          : "Shared"}
                      </div>

                      {/* Action Buttons */}
                      <div className="flex gap-2 flex-shrink-0">
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            setPreviewAccount(account);
                            setIsPreview(true);
                          }}
                          className="p-2.5 rounded-xl bg-gray-100 text-gray-500 hover:text-blue-600 hover:bg-blue-50 transition-all duration-200"
                        >
                          <HiOutlineEye className="w-5 h-5" />
                        </button>
                        {createdAccounts.some(acc => acc._id === account?._id) && (
                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              handleDeleteAccount(account._id);
                            }}
                            className="p-2.5 rounded-xl bg-gray-100 text-gray-500 hover:text-red-600 hover:bg-red-50 transition-all duration-200"
                          >
                            <HiOutlineTrash className="w-5 h-5" />
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-3 gap-3">
                      <div className="bg-gray-50 rounded-xl p-3 text-center group-hover:bg-green-50 transition-colors">
                        <div className="flex justify-center mb-2">
                          <HiOutlineCurrencyRupee className="w-5 h-5 text-green-500" />
                        </div>
                        <p className="text-xs text-gray-500 mb-1">
                          Total Spent
                        </p>
                        <p className="text-lg font-bold text-gray-800">
                          ₹{account.totalSpend}
                        </p>
                      </div>
                      <div className="bg-gray-50 rounded-xl p-3 text-center group-hover:bg-blue-50 transition-colors">
                        <div className="flex justify-center mb-2">
                          <HiOutlineUsers className="w-5 h-5 text-blue-500" />
                        </div>
                        <p className="text-xs text-gray-500 mb-1">Members</p>
                        <p className="text-lg font-bold text-gray-800">
                          {account.accountMembers.length}
                        </p>
                      </div>
                      <div className="bg-gray-50 rounded-xl p-3 text-center group-hover:bg-purple-50 transition-colors">
                        <div className="flex justify-center mb-2">
                          <HiOutlineDocumentText className="w-5 h-5 text-purple-500" />
                        </div>
                        <p className="text-xs text-gray-500 mb-1">
                          Transactions
                        </p>
                        <p className="text-lg font-bold text-gray-800">
                          {account.totalTransaction ?? 0}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Hover indicator */}
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-purple-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500"></div>
                </div>
              </Link>
            ))}

            {/* Add New Account Card */}
            {activeTab !== "joined" && (
              <Link
                to="/create-account"
                className="group relative rounded-2xl transition-all duration-500 hover:-translate-y-2"
              >
                {/* Card glow effect */}
                <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl blur opacity-0 group-hover:opacity-40 transition-all duration-500"></div>

                <div className="relative bg-white rounded-2xl border-2 border-dashed border-gray-300 hover:border-blue-400 overflow-hidden flex items-center justify-center transition-all duration-300 shadow-lg h-full">
                  <div className="text-center p-6">
                    <div className="relative inline-flex mb-4">
                      <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl blur-lg opacity-0 group-hover:opacity-40 transition-opacity duration-300"></div>
                      <div className="relative w-12 h-12 rounded-xl bg-gradient-to-r from-blue-100 to-purple-100 flex items-center justify-center group-hover:from-blue-500 group-hover:to-purple-500 transition-all duration-300">
                        <HiPlus className="w-6 h-6 text-blue-500 group-hover:text-white transition-colors" />
                      </div>
                    </div>
                    <h3 className="text-lg font-bold text-gray-800 mb-1 group-hover:text-blue-600 transition-colors">
                      Create New Account
                    </h3>
                    <p className="text-sm text-gray-500">
                      Start a new shared expense account
                    </p>
                  </div>
                </div>
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Preview Popup */}
      {preview && (
        <AccountPreview
          previewAccount={previewAccount}
          closePreview={() => {
            setIsPreview(false);
          }}
        />
      )}
    </>
  );
}
