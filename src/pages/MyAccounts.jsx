import { Link, useNavigate } from "react-router-dom";
import {
  HiOutlineTrash,
  HiOutlineEye,
  HiPlus,
  HiUserGroup,
} from "react-icons/hi";
import { useEffect, useState } from "react";
import useUserStore from "../store/useUserStore";
import axiosInstance from "../functions/axiosInstance";
import socket from "../socket";
import { toast } from "react-toastify";
import useAccountStore from "../store/useAccountStore";

// Skeleton Loading Component
const AccountSkeleton = () => (
  <div className="group relative bg-white rounded-xl shadow-lg overflow-hidden animate-pulse">
    <div className="relative p-6">
      <div className="flex justify-between items-start mb-4">
        {/* Account name skeleton */}
        <div className="h-6 bg-gray-200 rounded w-32"></div>
        {/* Action buttons skeleton */}
        <div className="flex gap-2">
          <div className="w-9 h-9 bg-gray-200 rounded"></div>
          <div className="w-9 h-9 bg-gray-200 rounded"></div>
        </div>
      </div>
      <div className="flex justify-between items-center">
        {/* Total Spent skeleton */}
        <div className="text-sm">
          <div className="h-3 bg-gray-200 rounded w-16 mb-1"></div>
          <div className="h-5 bg-gray-200 rounded w-20"></div>
        </div>
        {/* Members skeleton */}
        <div className="text-sm">
          <div className="h-3 bg-gray-200 rounded w-14 mb-1"></div>
          <div className="h-5 bg-gray-200 rounded w-8"></div>
        </div>
        {/* Transactions skeleton */}
        <div className="text-sm">
          <div className="h-3 bg-gray-200 rounded w-20 mb-1"></div>
          <div className="h-5 bg-gray-200 rounded w-8"></div>
        </div>
      </div>
    </div>
  </div>
);

export default function MyAccounts() {
  const navigate = useNavigate();
  const { user  ,isLoggedIn} = useUserStore();
  const { createdAccounts, joinedAccounts, fetchAndUpdateAccounts } =
    useAccountStore();
  const [activeTab, setActiveTab] = useState("all");
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteMessage, setDeleteMessage] = useState("");
  useEffect(() => {
    socket?.on("account-update", () => {
      fetchAndUpdateAccounts();
    });
    // Clean up
    return () => {
      socket?.off("account-update");
    };
  });

  useEffect(() => {
    const loadAccounts = async () => {
      if (createdAccounts === null || joinedAccounts === null) {
        setIsLoading(true);
      }

      await fetchAndUpdateAccounts();
      setIsLoading(false);
    };
    loadAccounts();
  }, [createdAccounts, joinedAccounts, fetchAndUpdateAccounts]);

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
      "Are you sure you want to delete this account? This action cannot be undone."
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
        }
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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-purple-50 to-pink-100 py-10 px-2 sm:px-4">
        {/* Animated background shape */}
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-gradient-to-br from-blue-400/30 to-purple-400/10 rounded-full blur-3xl z-0 animate-pulse duration-300" />
        <div className="max-w-4xl mx-auto relative z-10">
          {/* Header */}
          <div className="flex flex-col items-center mb-10">
            <div className="flex items-center gap-3 mb-2">
              <HiUserGroup className="text-4xl text-blue-600 drop-shadow" />
              <h1 className="text-3xl sm:text-4xl font-extrabold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent tracking-tight">
                My Accounts
              </h1>
            </div>
            <p className="text-gray-500 text-center max-w-md">
              Manage all your shared spending accounts in one place. Create,
              view, and organize your group finances with ease.
            </p>
          </div>

          {/* Account Type Tabs */}
          <div className="flex justify-center mb-8">
            <div className="inline-flex rounded-lg border border-gray-200 bg-white p-1 shadow-sm">
              <button
                onClick={() => setActiveTab("all")}
                className={`px-4 py-2 text-sm font-medium rounded-md transition-all duration-200 ${
                  activeTab === "all"
                    ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-sm"
                    : "text-gray-600 hover:text-gray-800 hover:bg-gray-50"
                }`}
              >
                All Accounts
              </button>
              <button
                onClick={() => setActiveTab("created")}
                className={`px-4 py-2 text-sm font-medium rounded-md transition-all duration-200 ${
                  activeTab === "created"
                    ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-sm"
                    : "text-gray-600 hover:text-gray-800 hover:bg-gray-50"
                }`}
              >
                Created by Me
              </button>
              <button
                onClick={() => setActiveTab("joined")}
                className={`px-4 py-2 text-sm font-medium rounded-md transition-all duration-200 ${
                  activeTab === "joined"
                    ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-sm"
                    : "text-gray-600 hover:text-gray-800 hover:bg-gray-50"
                }`}
              >
                Joined Accounts
              </button>
            </div>
          </div>

          {/* Skeleton Loading Grid */}
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-lg px-8 py-6 flex flex-col items-center gap-4 animate-fade-in">
            {deleteMessage === "Deleting your account..." ? (
              <>
                <svg
                  className="animate-spin h-8 w-8 text-gray-600"
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
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8v8z"
                  ></path>
                </svg>
                <span className="text-base font-medium text-gray-700">
                  {deleteMessage}
                </span>
              </>
            ) : (
              <>
                <svg
                  className="h-8 w-8 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                <span className="text-base font-medium text-green-600">
                  {deleteMessage}
                </span>
              </>
            )}
          </div>
        </div>
      )}

      <div
        className={`relative min-h-screen bg-gradient-to-br from-indigo-100 via-purple-50 to-pink-100 py-10 px-2 sm:px-4 transition-all duration-300 ${
          isDeleting ? "filter blur-sm pointer-events-none select-none" : ""
        }`}
      >
        {/* Animated background shape */}
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-gradient-to-br from-blue-400/30 to-purple-400/10 rounded-full blur-3xl z-0 animate-pulse duration-300" />
        <div className="max-w-4xl mx-auto relative z-10">
          {/* Header */}
          <div className="flex flex-col items-center mb-10">
            <div className="flex items-center gap-3 mb-2">
              <HiUserGroup className="text-4xl text-blue-600 drop-shadow" />
              <h1 className="text-3xl sm:text-4xl font-extrabold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent tracking-tight">
                My Accounts
              </h1>
            </div>
            <p className="text-gray-500 text-center max-w-md">
              Manage all your shared spending accounts in one place. Create,
              view, and organize your group finances with ease.
            </p>
          </div>

          {/* Account Type Tabs */}
          <div className="flex justify-center mb-8">
            <div className="inline-flex rounded-lg border border-gray-200 bg-white p-1 shadow-sm">
              <button
                onClick={() => setActiveTab("all")}
                className={`px-4 py-2 text-sm font-medium rounded-md transition-all duration-200 ${
                  activeTab === "all"
                    ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-sm"
                    : "text-gray-600 hover:text-gray-800 hover:bg-gray-50"
                }`}
              >
                All Accounts
              </button>
              <button
                onClick={() => setActiveTab("created")}
                className={`px-4 py-2 text-sm font-medium rounded-md transition-all duration-200 ${
                  activeTab === "created"
                    ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-sm"
                    : "text-gray-600 hover:text-gray-800 hover:bg-gray-50"
                }`}
              >
                Created by Me
              </button>
              <button
                onClick={() => setActiveTab("joined")}
                className={`px-4 py-2 text-sm font-medium rounded-md transition-all duration-200 ${
                  activeTab === "joined"
                    ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-sm"
                    : "text-gray-600 hover:text-gray-800 hover:bg-gray-50"
                }`}
              >
                Joined Accounts
              </button>
            </div>
          </div>

          {/* Accounts Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredAccounts.map((account) => (
              <Link
                key={account._id}
                to={`/my-accounts/${account._id}`}
                className="group relative bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
              >
                <div
                  className={`absolute inset-0 bg-gradient-to-r opacity-5 group-hover:opacity-10 transition-opacity duration-300`}
                />
                <div className="relative p-6">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-xl font-bold text-gray-800">
                      {account.accountName}
                    </h3>
                    <div className="flex gap-2">
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          // Handle view action
                        }}
                        className="p-2 text-gray-500 hover:text-blue-600 transition-colors"
                      >
                        <HiOutlineEye className="w-5 h-5" />
                      </button>
                      {createdAccounts?.includes(account) && (
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            handleDeleteAccount(account._id);
                          }}
                          className="p-2 text-gray-500 hover:text-red-600 transition-colors"
                        >
                          <HiOutlineTrash className="w-5 h-5" />
                        </button>
                      )}
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="text-sm text-gray-500">
                      <span className="block">Total Spent</span>
                      <span className="text-lg font-semibold text-gray-800">
                        ₹{account.totalSpend}
                      </span>
                    </div>
                    <div className="text-sm text-gray-500">
                      <span className="block">Members</span>
                      <span className="text-lg font-semibold text-gray-800">
                        {account.accountMembers.length}
                      </span>
                    </div>
                    <div className="text-sm text-gray-500">
                      <span className="block">Transactions</span>
                      <span className="text-lg font-semibold text-gray-800">
                        {account.totalTransaction ?? 0}
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}

            {/* Add New Account Card */}
            {activeTab != "joined" && (
              <Link
                to="/create-account"
                className="group relative bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-2 border-dashed border-gray-300 hover:border-blue-500"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 opacity-0 group-hover:opacity-5 transition-opacity duration-300" />
                <div className="relative p-6 flex flex-col items-center justify-center h-full min-h-[200px]">
                  <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center mb-4 group-hover:bg-blue-200 transition-colors">
                    <HiPlus className="w-6 h-6 text-blue-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">
                    Create New Account
                  </h3>
                  <p className="text-sm text-gray-500 text-center">
                    Start a new shared expense account with friends or family
                  </p>
                </div>
              </Link>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
