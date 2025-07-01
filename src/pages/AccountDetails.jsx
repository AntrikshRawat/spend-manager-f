import { useParams } from 'react-router-dom';
import { HiArrowLeft, HiPlus, HiRefresh } from 'react-icons/hi';
import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import AddTransactionPopup from '../components/AddTransactionPopup';
import axiosInstance from '../functions/axiosInstance';
import TransactionsHistory from '../components/TransactionsHistory';
import { useNavigate } from 'react-router-dom';
import AccountPaidSpend from '../components/AccountPaidSpend';

const AccountDetails = () => {
  const [account, setAccount] = useState({});
  const [members,setMembers] = useState([]);
  let { acId } = useParams();
  const [isAddTransactionOpen, setIsAddTransactionOpen] = useState(false);
  const navigate = useNavigate();
  const [transactionsRefreshKey, setTransactionsRefreshKey] = useState(0);
  const [loading, setLoading] = useState(false);

  const fetchAccountDetails = async () => {
    try {
      const {data} = await axiosInstance.post(`${import.meta.env.VITE_BACKEND_URL}/account/details`,{
        acId
      },{
        withCredentials: true,
      });
      if (!data || !data._id) {
        alert('No account found');
        navigate('/my-accounts');
        return;
      }
      setAccount(data);
      fetchMembersName(data.accountMembers);
    } catch {
      alert('No account found');
      navigate('/my-accounts');
    }
  }
  const fetchMembersName=async(userIds)=>{
      const {data} = await axiosInstance.post(`${import.meta.env.VITE_BACKEND_URL}/auth/v1/usernames`,{
        userIds
      },{
        withCredentials: true,
      });
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
    fetchAccountDetails();
  }, []);

  // Clear Transactions handler
  const handleClearTransactions = async () => {
    if (!window.confirm('Are you sure you want to clear all transactions?')) return;
    setLoading(true);
    try {
      await axiosInstance.put(
        `${import.meta.env.VITE_BACKEND_URL}/payment/clear`,
        {},
        {
          params: { accountId: account._id },
          headers: { 'Content-Type': 'application/json' },
          withCredentials: true,
        }
      );
      window.location.reload();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to clear transactions.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-purple-50 to-pink-100 py-8 px-4">
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
          <h1 className="text-3xl font-bold text-gray-800 mb-2">{account.accountName}</h1>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white rounded-xl shadow-md p-4">
              <p className="text-sm text-gray-500 mb-1">Total Spend</p>
              <p className="text-2xl font-bold" >
                ₹{account.totalSpend}
              </p>
            </div>
            <div className="bg-white rounded-xl shadow-md p-4">
              <p className="text-sm text-gray-500 mb-1">Members</p>
              <p className="text-2xl font-bold text-gray-800">{account.accountMembers?.length}</p>
            </div>
            <div className="bg-white rounded-xl shadow-md p-4">
              <p className="text-sm text-gray-500 mb-1">Total Transactions</p>
              <p className="text-2xl font-bold text-gray-800">{account.totalTransaction ?? 0}</p>
            </div>
          </div>
        </div>

        <AccountPaidSpend accountMembers={members.map(member=>member.name)} accountId={account._id} />

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
                <button
                  onClick={handleClearTransactions}
                  className="px-4 py-2 bg-red-500 text-white rounded-lg shadow hover:bg-red-600 transition disabled:opacity-50 w-full sm:w-auto"
                  disabled={loading}
                >
                  Clear Transactions
                </button>
              </div>
            </div>
            <TransactionsHistory accountId={account._id} refreshKey={transactionsRefreshKey} />
          </div>
        </div>
      </div>

      <AddTransactionPopup
        isOpen={isAddTransactionOpen}
        accountMembers={members.map(member=>member.name)}
        accountId={account._id}
        onClose={() => {
          setIsAddTransactionOpen(false);
          window.location.reload();
        }}
      />
    </div>
  );
};

export default AccountDetails; 