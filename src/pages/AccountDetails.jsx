import { useParams } from 'react-router-dom';
import { HiArrowLeft, HiPlus, HiRefresh, HiSparkles } from 'react-icons/hi';
import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import AddTransactionPopup from '../components/AddTransactionPopup';
import axiosInstance from '../functions/axiosInstance';
import TransactionsHistory from '../components/TransactionsHistory';
import { useNavigate } from 'react-router-dom';
import AccountPaidSpend from '../components/AccountPaidSpend';
import useUserStore from '../store/useUserStore';
import socket from '../socket';
import { toast } from 'react-toastify';
import ReportViewer from '../components/ReportViewer';

const AccountDetails = () => {
  const [account, setAccount] = useState({});
  const [members,setMembers] = useState([]);
  let { acId } = useParams();
  const [isAddTransactionOpen, setIsAddTransactionOpen] = useState(false);
  const navigate = useNavigate();
  const [transactionsRefreshKey, setTransactionsRefreshKey] = useState(0);
  const [loading, setLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(false);
  const {user} = useUserStore();
  const [isAISummaryLoading, setIsAISummaryLoading] = useState(false);
  const [aiSummary, setAiSummary] = useState('');
  const [showSummaryPopup, setShowSummaryPopup] = useState(false);

  const fetchAccountDetails = async () => {
    try {
      setAccount({});
      setIsFetching(true);
      const {data} = await axiosInstance.post(`${import.meta.env.VITE_BACKEND_URL}/account/details`,{
        acId
      },{
        withCredentials: true,
      });
      if (!data || !data?._id) {
        toast.error('No account found!');
        navigate('/my-accounts');
        return;
      }
      setAccount(data);
      if(data.accountType === "shared") {
          await fetchMembersName(data.accountMembers);
      }
    } catch {
      toast.error('No account found');
      navigate('/my-accounts');
    } finally {
      setIsFetching(false);
    }
  }
  const fetchMembersName=async(userIds)=>{
      const {data} = await axiosInstance.post(`${import.meta.env.VITE_BACKEND_URL}/auth/v1/usernames`,{
        userIds
      },{
        withCredentials: true,
      });
    setMembers([]);
    for(let i=0;i<data.length;i++) {
      setMembers((prev)=>{
        const list = [...prev];
        const userdetail = {
          name:data[i],
          spend:0
        };
        list.push(userdetail);
        return list;
      })
    }
  }
  useEffect(() => {
    socket?.on("payment-update", () => {
      setTransactionsRefreshKey(k => k + 1);
      fetchAccountDetails();
    });
    return () => {
      socket?.off("payment-update");
    };
  });

  useEffect(() => {
    fetchAccountDetails();
  }, []);

  // Clear Transactions handler
  const handleClearTransactions = async () => {
    if (!window.confirm('Are you sure you want to clear all transactions?')) return;
    setLoading(true);
    try {
      const {data} = await axiosInstance.put(
        `${import.meta.env.VITE_BACKEND_URL}/payment/clear`,
        {},
        {
          params: { accountId: account?._id },
          headers: { 'Content-Type': 'application/json' },
          withCredentials: true,
        }
      );
      toast.success(data.message);
      setTransactionsRefreshKey(k => k + 1);
      fetchAccountDetails();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to clear transactions.');
    } finally {
      setLoading(false);
    }
  };

  const handleAISummarizer = async () => {
    if (account.totalTransaction < 5) {
      toast.info('Minimum 5 transactions required for AI summary analysis');
      return;
    }

    setIsAISummaryLoading(true);
    setShowSummaryPopup(true);
    try {
      const { data } = await axiosInstance.post(
        `${import.meta.env.VITE_BACKEND_URL}/accountsummary`,
        {
          accountId: account?._id
        },
        {
          withCredentials: true,
        }
      );
      if (data && data.summary) {
        setAiSummary(data.summary);
      } else {
        toast.error('No summary available');
      }
    } catch {
      toast.error('Failed to generate AI summary');
      setShowSummaryPopup(false);
    } finally {
      setIsAISummaryLoading(false);
    }
  };

  const closeSummaryPopup = () => {
    setShowSummaryPopup(false);
    setAiSummary('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-purple-50 to-pink-100 py-8 px-4 pb-24">
      <div className="max-w-4xl mx-auto">
        {/* Header Section */}
        <div className="mb-8">
          <Link
            to="/my-accounts"
            className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-4 transition-colors"
          >
            <HiArrowLeft className="w-5 h-5 mr-2" />
            Back to Accounts
          </Link>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">{!isFetching?account?.accountName:"-"}</h1>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white rounded-xl shadow-md p-4">
              <p className="text-sm text-gray-500 mb-1">Total Spend</p>
              <p className="text-2xl font-bold" >
                ₹{!isFetching?account.totalSpend:"-"}
              </p>
            </div>
            <div className="bg-white rounded-xl shadow-md p-4">
              <p className="text-sm text-gray-500 mb-1">Members</p>
              <p className="text-2xl font-bold text-gray-800">{!isFetching?account.accountMembers?.length:"-"}</p>
            </div>
            <div className="bg-white rounded-xl shadow-md p-4">
              <p className="text-sm text-gray-500 mb-1">Total Transactions</p>
              <p className="text-2xl font-bold text-gray-800">{!isFetching?account.totalTransaction:"-"}</p>
            </div>
          </div>
        </div>

        {account.accountType === 'shared' && (
          <AccountPaidSpend accountMembers={members.map(member=>member.name)} accountId={account?._id} refreshKey={transactionsRefreshKey}/>
        )}

        {/* Transaction Section */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <div className="p-6 border-b border-gray-100">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <h2 className="text-xl font-semibold text-gray-800 w-full sm:w-auto">Transaction History</h2>
                <button
                  onClick={() => setTransactionsRefreshKey(k => k + 1)}
                  className="ml-2 p-2 rounded-full bg-gray-100 hover:bg-blue-100 text-blue-600 transition"
                  title="Refresh Transactions"
                >
                  <HiRefresh className="w-5 h-5" />
                </button>
              </div>
              <div className="flex gap-2 w-full sm:w-auto">
                <button 
                  onClick={() => setIsAddTransactionOpen(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 w-full sm:w-auto justify-center"
                >
                  <HiPlus className="w-5 h-5" />
                  Add Transaction
                </button>
{ account.accountHolder === user?._id && <button
                  onClick={handleClearTransactions}
                  disabled={account.totalTransaction === 0 ||loading}
                  className="px-4 py-2 bg-red-500 text-white rounded-lg shadow hover:bg-red-600 transition disabled:opacity-50 w-full sm:w-auto"
                >
                  Clear Transactions
                </button>}
              </div>
            </div>
            <TransactionsHistory
            accountId={account?._id}
            refreshKey={transactionsRefreshKey}
            newDeletion={()=>{
              setTransactionsRefreshKey(k => k + 1);
              fetchAccountDetails();
            }}
            accountType={account.accountType}
            accountMembers={members.map(member=>member.name)}
            />
          </div>
        </div>
      </div>

      {/* Sticky AI Summarizer Button */}
      <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50">
        <button
          onClick={handleAISummarizer}
          disabled={isFetching}
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-full shadow-lg hover:from-purple-700 hover:to-pink-700 transition-all duration-200 transform hover:scale-105 active:scale-95"
        >
          <HiSparkles className="w-5 h-5" />
          <span className="font-semibold">AI Summarizer</span>
        </button>
      </div>

      {/* AI Summary Popup */}
      {showSummaryPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-y-scroll">
            {/* Header */}
            <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <HiSparkles className="w-6 h-6" />
                  <h2 className="text-xl font-bold">AI Account Summary</h2>
                </div>
                <button
                  onClick={closeSummaryPopup}
                  className="text-white hover:text-gray-200 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="flex flex-col h-full">
              <div className="flex-1 overflow-y-auto p-6">
                {isAISummaryLoading ? (
                  <div className="flex flex-col items-center justify-center py-12">
                    <div className="relative">
                      <div className="w-16 h-16 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin"></div>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <HiSparkles className="w-8 h-8 text-purple-600 animate-pulse" />
                      </div>
                    </div>
                    <div className="mt-6 text-center">
                      <h3 className="text-lg font-semibold text-gray-800 mb-2">AI is analyzing your account...</h3>
                      <p className="text-gray-600">Generating intelligent insights from your transaction data</p>
                    </div>
                    <div className="mt-4 flex space-x-1">
                      <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                      <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-4 border border-purple-100">
                      <h3 className="font-semibold text-gray-800 mb-2">📊 Account Insights</h3>
                        <ReportViewer text={aiSummary}/>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Fixed Footer with Close Button */}
              <div className="border-t border-gray-200 p-4 bg-white">
                <div className="flex justify-end">
                  <button
                    onClick={closeSummaryPopup}
                    className="px-6 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all duration-200 font-semibold"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <AddTransactionPopup
        isOpen={isAddTransactionOpen}
        accountMembers={members.map(member=>member.name)}
        accountId={account?._id}
        onClose={(value) => {
          setIsAddTransactionOpen(false);
          if(value) {
          toast.success("Transaction Added Successfully.");
          setTransactionsRefreshKey(k => k + 1);
          fetchAccountDetails();
          }
        }}
        accountType={account.accountType}
      />
    </div>
  );
};

export default AccountDetails; 