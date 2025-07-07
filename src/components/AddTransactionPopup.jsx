import { useState } from 'react';
import { HiX } from 'react-icons/hi';
import useUserStore from '../store/useUserStore';
import axiosInstance from '../functions/axiosInstance';
import { toast } from 'react-toastify';

const AddTransactionPopup = ({ isOpen, onClose, accountMembers = [],accountId }) => {
  const {user} = useUserStore();
  const [formData, setFormData] = useState({
    amount: '',
    where: '',
  });
  const [memberAmounts, setMemberAmounts] = useState(() => accountMembers.map(() => ''));
  const [error, setError] = useState('');
  const [equalSplit, setEqualSplit] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const total = memberAmounts.reduce((sum, val) => sum + Number(val || 0), 0);
    const transactionAmount = Number(formData.amount);
    
    if (total !== transactionAmount) {
      setError(`Total of member amounts (₹${total}) must equal the transaction amount (₹${transactionAmount})`);
      return;
    }
    setError('');
    setLoading(true);
    try {
      await axiosInstance.post(
        `${import.meta.env.VITE_BACKEND_URL}/payment/add`,
        {
          accountId,
          where: formData.where,
          paidBy: user.userName,
          amount: formData.amount,
          memberExpenses: memberAmounts,
        },
        {
          params:{
            accountId
          },
          headers: {
            'Content-Type': 'application/json',
          },
          withCredentials: true,
        }
      );
      onClose(true);
      setFormData({
    amount: '',
    where: '',
  })
    } catch (err) {
      const errorMsg = err.response?.data?.message?.[0] || err.response?.data?.message || 'Failed to add transaction.';
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    let { name, value } = e.target;
    if(name === "amount") {
      value = value>10000?10000:value; 
    }
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // If amount changes, recalculate equal split if enabled
    if (name === 'amount' && equalSplit) {
      const transactionAmount = Number(value);
      if (transactionAmount > 0 && accountMembers.length > 0) {
        const equalValue = Math.floor(transactionAmount / accountMembers.length);
        let amountsArr = Array(accountMembers.length).fill(equalValue.toString());
        // Distribute the remainder to the first few
        let remainder = transactionAmount - equalValue * accountMembers.length;
        for (let i = 0; i < remainder; i++) {
          amountsArr[i] = (equalValue + 1).toString();
        }
        setMemberAmounts(amountsArr);
      } else {
        // If amount is 0 or invalid, clear all member amounts
        setMemberAmounts(Array(accountMembers.length).fill(''));
      }
    }
  };

  const handleMemberAmountChange = (idx, value) => {
    setMemberAmounts(prev => {
      const arr = [...prev];
      arr[idx] = value;
      return arr;
    });
  };

  const handleEqualSplitChange = (e) => {
    const checked = e.target.checked;
    setEqualSplit(checked);
    if (checked && accountMembers.length > 0 && formData.amount) {
      const transactionAmount = Number(formData.amount);
      if (transactionAmount > 0) {
        const equalValue = Math.floor(transactionAmount / accountMembers.length);
        let amountsArr = Array(accountMembers.length).fill(equalValue.toString());
        // Distribute the remainder to the first few
        let remainder = transactionAmount - equalValue * accountMembers.length;
        for (let i = 0; i < remainder; i++) {
          amountsArr[i] = (equalValue + 1).toString();
        }
        setMemberAmounts(amountsArr);
      }
    } else if (!checked) {
      // If unchecking equal split, clear all amounts
      setMemberAmounts(Array(accountMembers.length).fill(''));
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white/95 rounded-xl shadow-xl w-full max-w-md mx-4">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800">Add Transaction</h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 transition-colors"
            >
              <HiX className="w-6 h-6" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
          <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Paid By
              </label>
              <input
                type="text"
                name="paidBy"
                disabled={true}
                value={user.userName}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-200"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Amount
              </label>
              <input
                type="number"
                name="amount"
                value={formData.amount}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="0-10,000"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Where
              </label>
              <input
                type="text"
                name="where"
                value={formData.where}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Where was this expense made?"
                required
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-sm font-medium text-gray-700">Member Amounts</label>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="equal-split"
                    checked={equalSplit}
                    onChange={handleEqualSplitChange}
                    className="accent-blue-600"
                  />
                  <label htmlFor="equal-split" className="text-sm font-medium text-gray-700 cursor-pointer select-none">
                    Split equally
                  </label>
                </div>
              </div>
              
              <div className="space-y-3 border-1 p-3 rounded-xl bg-gray-50">
                {accountMembers.map((member, idx) => (
                  <div key={member} className="flex items-center gap-3">
                    <span className="flex-1 text-gray-700 font-medium">{member}</span>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">₹</span>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={memberAmounts[idx]}
                        onChange={e => handleMemberAmountChange(idx, e.target.value)}
                        className="w-24 pl-8 pr-2 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-right"
                        placeholder="0"
                        disabled={equalSplit}
                        required
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {error && <div className="text-red-600 text-sm font-medium text-center">{error}</div>}

            <div className="flex justify-end gap-4 mt-6">
              <button
                type="button"
                onClick={()=>{onClose(false)}}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className={`px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 flex items-center justify-center ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
              >
                {loading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Adding...
                  </>
                ) : (
                  'Add Transaction'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddTransactionPopup;