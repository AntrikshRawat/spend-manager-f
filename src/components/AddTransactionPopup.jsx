import { useState } from 'react';
import { HiX } from 'react-icons/hi';
import useUserStore from '../store/useUserStore';
import axiosInstance from '../functions/axiosInstance';
import { toast } from 'react-toastify';

const AddTransactionPopup = ({ isOpen, onClose, accountMembers = [], accountId ,accountType}) => {
  const user = useUserStore(u=>u.user);
  const [formData, setFormData] = useState({
    amount: '',
    where: '',
  });
  const [memberAmounts, setMemberAmounts] = useState(() => accountMembers.map(() => ''));
  const [excludedMembers, setExcludedMembers] = useState(() => accountMembers.map(() => false));
  const [error, setError] = useState('');
  const [equalSplit, setEqualSplit] = useState(false);
  const [loading, setLoading] = useState(false);


  const clearForm=(status)=>{
    setFormData({
      amount:'',
      where:''
    });
    setExcludedMembers(accountMembers.map(()=>false));
    onClose(status);
  }
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (accountType === 'shared') {
      const total = memberAmounts.reduce((sum, val) => sum + Number(val || 0), 0);
      const transactionAmount = Number(formData.amount);

      if (total !== transactionAmount) {
        setError(`Total of member amounts (₹${total}) must equal the transaction amount (₹${transactionAmount})`);
        return;
      }
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
          memberExpenses: accountType === 'shared' ?          memberAmounts : [formData.amount],
        },
        {
          params: {
            accountId
          },
          headers: {
            'Content-Type': 'application/json',
          },
          withCredentials: true,
        }
      );
      clearForm(true);
    } catch (err) {
      const errorMsg = err.response?.data?.message?.[0]?.msg || err.response?.data?.message || 'Failed to add transaction.';
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    let { name, value } = e.target;
    if (name === "amount") {
      value = value > 100000 ? 100000 : value;
    }
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // If amount changes, recalculate equal split if enabled
    if (name === 'amount' && equalSplit) {
      const transactionAmount = Number(value);
      if (transactionAmount > 0 && accountMembers.length > 0) {
        const includedMembers = excludedMembers.filter(excluded => !excluded).length;
        if (includedMembers === 0) return;
        
        const equalValue = Math.floor(transactionAmount / includedMembers);
        let amountsArr = Array(accountMembers.length).fill('0');
        let remainder = transactionAmount - equalValue * includedMembers;
        
        let distributedCount = 0;
        for (let i = 0; i < accountMembers.length; i++) {
          if (!excludedMembers[i]) {
            amountsArr[i] = equalValue.toString();
            if (distributedCount < remainder) {
              amountsArr[i] = (equalValue + 1).toString();
              distributedCount++;
            }
          }
        }
        setMemberAmounts(amountsArr);
      } else {
        // If amount is 0 or invalid, clear all non-excluded member amounts
        setMemberAmounts(prev => prev.map((amt, idx) => excludedMembers[idx] ? '0' : ''));
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

  const handleMemberExcludeChange = (idx, checked) => {
    setExcludedMembers(prev => {
      const arr = [...prev];
      arr[idx] = checked;
      return arr;
    });
    
    // Set amount to 0 if excluded
    if (checked) {
      setMemberAmounts(prev => {
        const arr = [...prev];
        arr[idx] = '0';
        return arr;
      });
      
      // Recalculate equal split for remaining included members
      if (equalSplit && formData.amount) {
        const transactionAmount = Number(formData.amount);
        const newExcludedMembers = [...excludedMembers];
        newExcludedMembers[idx] = true;
        const includedCount = newExcludedMembers.filter(excluded => !excluded).length;
        
        if (transactionAmount > 0 && includedCount > 0) {
          const equalValue = Math.floor(transactionAmount / includedCount);
          let amountsArr = Array(accountMembers.length).fill('0');
          let remainder = transactionAmount - equalValue * includedCount;
          
          let distributedCount = 0;
          for (let i = 0; i < accountMembers.length; i++) {
            if (!newExcludedMembers[i]) {
              amountsArr[i] = equalValue.toString();
              if (distributedCount < remainder) {
                amountsArr[i] = (equalValue + 1).toString();
                distributedCount++;
              }
            }
          }
          setMemberAmounts(amountsArr);
        }
      }
    } else {
      // Member is being re-included
      if (equalSplit && formData.amount) {
        const transactionAmount = Number(formData.amount);
        const newExcludedMembers = [...excludedMembers];
        newExcludedMembers[idx] = false;
        const includedCount = newExcludedMembers.filter(excluded => !excluded).length;
        
        if (transactionAmount > 0 && includedCount > 0) {
          const equalValue = Math.floor(transactionAmount / includedCount);
          let amountsArr = Array(accountMembers.length).fill('0');
          let remainder = transactionAmount - equalValue * includedCount;
          
          let distributedCount = 0;
          for (let i = 0; i < accountMembers.length; i++) {
            if (!newExcludedMembers[i]) {
              amountsArr[i] = equalValue.toString();
              if (distributedCount < remainder) {
                amountsArr[i] = (equalValue + 1).toString();
                distributedCount++;
              }
            }
          }
          setMemberAmounts(amountsArr);
        }
      }
    }
  };

  const handleEqualSplitChange = (e) => {
    const checked = e.target.checked;
    setEqualSplit(checked);
    if (checked && accountMembers.length > 0 && formData.amount) {
      const transactionAmount = Number(formData.amount);
      if (transactionAmount > 0) {
        const includedMembers = excludedMembers.filter(excluded => !excluded).length;
        if (includedMembers === 0) return;
        
        const equalValue = Math.floor(transactionAmount / includedMembers);
        let amountsArr = Array(accountMembers.length).fill('0');
        let remainder = transactionAmount - equalValue * includedMembers;
        
        let distributedCount = 0;
        for (let i = 0; i < accountMembers.length; i++) {
          if (!excludedMembers[i]) {
            amountsArr[i] = equalValue.toString();
            if (distributedCount < remainder) {
              amountsArr[i] = (equalValue + 1).toString();
              distributedCount++;
            }
          }
        }
        setMemberAmounts(amountsArr);
      }
    } else if (!checked) {
      // If unchecking equal split, clear all amounts except excluded members
      setMemberAmounts(prev => prev.map((amt, idx) => excludedMembers[idx] ? '0' : ''));
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white/95 rounded-xl shadow-xl w-full max-w-md max-h-[90vh] flex flex-col">
        <div className="p-6 overflow-y-auto">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800">Add Transaction</h2>
            <button
              onClick={() => { clearForm(false) }}
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
                placeholder="0-100,000"
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

            {accountType === 'shared' && (
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
                    <div key={member} className={`flex items-center gap-3 ${excludedMembers[idx] ? 'opacity-40' : ''}`}>
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          id={`exclude-${idx}`}
                          checked={!excludedMembers[idx]}
                          onChange={(e) => handleMemberExcludeChange(idx, !e.target.checked)}
                          className="accent-blue-600 cursor-pointer"
                        />
                        <label htmlFor={`exclude-${idx}`} className="text-xs text-gray-600 cursor-pointer select-none whitespace-nowrap">
                          Include
                        </label>
                      </div>
                      <span className="flex-1 text-gray-700 font-medium">{member}</span>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">₹</span>
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={memberAmounts[idx]}
                          onChange={e => handleMemberAmountChange(idx, e.target.value)}
                          className="w-24 pl-8 pr-2 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-right disabled:bg-gray-100 disabled:cursor-not-allowed"
                          placeholder="0"
                          disabled={equalSplit || excludedMembers[idx]}
                          required
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {error && <div className="text-red-600 text-sm font-medium text-center">{error}</div>}

            <div className="flex justify-end gap-4 mt-6">
              <button
                type="button"
                onClick={() => { clearForm(false) }}
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