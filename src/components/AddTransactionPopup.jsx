import { useState, useEffect } from "react";
import { HiX, HiOutlineCurrencyRupee, HiOutlineUser, HiOutlinePencilAlt, HiOutlineUsers } from "react-icons/hi";
import useUserStore from "../store/useUserStore";
import axiosInstance from "../functions/axiosInstance";
import { toast } from "react-toastify";

const AddTransactionPopup = ({
  isOpen,
  onClose,
  accountMembers = [],
  accountId,
  accountType,
}) => {
  const user = useUserStore((u) => u.user);
  const [formData, setFormData] = useState({
    amount: "",
    where: "",
  });
  const [memberAmounts, setMemberAmounts] = useState(() =>
    accountMembers.map(() => ""),
  );
  const [excludedMembers, setExcludedMembers] = useState(() =>
    accountMembers.map(() => false),
  );
  const [error, setError] = useState("");
  const [equalSplit, setEqualSplit] = useState(false);
  const [loading, setLoading] = useState(false);

  // Sync state arrays when accountMembers prop changes
  useEffect(() => {
    setMemberAmounts(accountMembers.map(() => ""));
    setExcludedMembers(accountMembers.map(() => false));
    setEqualSplit(false);
  }, [accountMembers]);

  const clearForm = (status) => {
    setFormData({
      amount: "",
      where: "",
    });
    setMemberAmounts(accountMembers.map(() => ""));
    setExcludedMembers(accountMembers.map(() => false));
    setEqualSplit(false);
    setError("");
    onClose(status);
  };
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (accountType === "shared") {
      const total = memberAmounts.reduce(
        (sum, val) => sum + Number(val || 0),
        0,
      );
      const transactionAmount = Number(formData.amount);

      if (total !== transactionAmount) {
        setError(
          `Total of member amounts (₹${total}) must equal the transaction amount (₹${transactionAmount})`,
        );
        return;
      }
    }

    setError("");
    setLoading(true);
    try {
      await axiosInstance.post(
        `${import.meta.env.VITE_BACKEND_URL}/payment/add`,
        {
          accountId,
          where: formData.where,
          paidBy: user.userName,
          amount: formData.amount,
          memberExpenses:
            accountType === "shared" ? memberAmounts : [formData.amount],
        },
        {
          params: {
            accountId,
          },
          headers: {
            "Content-Type": "application/json",
          },
          withCredentials: true,
        },
      );
      clearForm(true);
    } catch (err) {
      const errorMsg =
        err.response?.data?.message?.[0]?.msg ||
        err.response?.data?.message ||
        "Failed to add transaction.";
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
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // If amount changes, recalculate equal split if enabled
    if (name === "amount" && equalSplit) {
      const transactionAmount = Number(value);
      if (transactionAmount > 0 && accountMembers.length > 0) {
        const includedMembers = excludedMembers.filter(
          (excluded) => !excluded,
        ).length;
        if (includedMembers === 0) return;

        const equalValue = Math.floor(transactionAmount / includedMembers);
        let amountsArr = Array(accountMembers.length).fill("0");
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
        setMemberAmounts((prev) =>
          prev.map((amt, idx) => (excludedMembers[idx] ? "0" : "")),
        );
      }
    }
  };

  const handleMemberAmountChange = (idx, value) => {
    setMemberAmounts((prev) => {
      const arr = [...prev];
      arr[idx] = value;
      return arr;
    });
  };

  const handleMemberExcludeChange = (idx, checked) => {
    setExcludedMembers((prev) => {
      const arr = [...prev];
      arr[idx] = checked;
      return arr;
    });

    // Set amount to 0 if excluded
    if (checked) {
      setMemberAmounts((prev) => {
        const arr = [...prev];
        arr[idx] = "0";
        return arr;
      });

      // Recalculate equal split for remaining included members
      if (equalSplit && formData.amount) {
        const transactionAmount = Number(formData.amount);
        const newExcludedMembers = [...excludedMembers];
        newExcludedMembers[idx] = true;
        const includedCount = newExcludedMembers.filter(
          (excluded) => !excluded,
        ).length;

        if (transactionAmount > 0 && includedCount > 0) {
          const equalValue = Math.floor(transactionAmount / includedCount);
          let amountsArr = Array(accountMembers.length).fill("0");
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
        const includedCount = newExcludedMembers.filter(
          (excluded) => !excluded,
        ).length;

        if (transactionAmount > 0 && includedCount > 0) {
          const equalValue = Math.floor(transactionAmount / includedCount);
          let amountsArr = Array(accountMembers.length).fill("0");
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
        const includedMembers = excludedMembers.filter(
          (excluded) => !excluded,
        ).length;
        if (includedMembers === 0) return;

        const equalValue = Math.floor(transactionAmount / includedMembers);
        let amountsArr = Array(accountMembers.length).fill("0");
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
      setMemberAmounts((prev) =>
        prev.map((amt, idx) => (excludedMembers[idx] ? "0" : "")),
      );
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl border border-gray-200 shadow-2xl w-full max-w-md max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="shrink-0 bg-gradient-to-r from-blue-600 to-purple-600 p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
              <HiOutlineCurrencyRupee className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-xl font-bold text-white">Add Transaction</h2>
          </div>
          <button
            onClick={() => clearForm(false)}
            className="w-8 h-8 rounded-lg bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
          >
            <HiX className="w-5 h-5 text-white" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto min-h-0 p-5">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Paid By */}
            <div>
              <label className="flex items-center gap-1.5 text-sm font-semibold text-gray-700 mb-2">
                <HiOutlineUser className="w-4 h-4 text-gray-400" />
                Paid By
              </label>
              <input
                type="text"
                name="paidBy"
                disabled={true}
                value={user.userName}
                onChange={handleChange}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl bg-gray-50 text-gray-600 font-medium cursor-not-allowed"
                required
              />
            </div>

            {/* Amount */}
            <div>
              <label className="flex items-center gap-1.5 text-sm font-semibold text-gray-700 mb-2">
                <HiOutlineCurrencyRupee className="w-4 h-4 text-gray-400" />
                Amount
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-semibold">₹</span>
                <input
                  type="number"
                  name="amount"
                  value={formData.amount}
                  onChange={handleChange}
                  className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all outline-none bg-white"
                  placeholder="0 - 100,000"
                  required
                />
              </div>
            </div>

            {/* Where */}
            <div>
              <label className="flex items-center gap-1.5 text-sm font-semibold text-gray-700 mb-2">
                <HiOutlinePencilAlt className="w-4 h-4 text-gray-400" />
                Where
              </label>
              <input
                type="text"
                name="where"
                value={formData.where}
                onChange={handleChange}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all outline-none bg-white"
                placeholder="What was this expense for?"
                required
              />
            </div>

            {/* Member Amounts (Shared accounts) */}
            {accountType === "shared" && (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="flex items-center gap-1.5 text-sm font-semibold text-gray-700">
                    <HiOutlineUsers className="w-4 h-4 text-gray-400" />
                    Member Amounts
                  </label>
                  <label
                    htmlFor="equal-split"
                    className="flex items-center gap-2 cursor-pointer select-none group"
                  >
                    <input
                      type="checkbox"
                      id="equal-split"
                      checked={equalSplit}
                      onChange={handleEqualSplitChange}
                      className="w-4 h-4 accent-purple-600 rounded cursor-pointer"
                    />
                    <span className="text-sm font-medium text-gray-600 group-hover:text-purple-600 transition-colors">
                      Split equally
                    </span>
                  </label>
                </div>

                <div className="space-y-2 border border-gray-200 p-4 rounded-xl bg-gray-50/50">
                  {accountMembers.map((member, idx) => (
                    <div
                      key={member}
                      className={`flex items-center gap-3 p-2.5 rounded-xl transition-all duration-200 ${
                        excludedMembers[idx]
                          ? "opacity-40 bg-gray-100"
                          : "bg-white border border-gray-100 shadow-sm"
                      }`}
                    >
                      <input
                        type="checkbox"
                        id={`exclude-${idx}`}
                        checked={!excludedMembers[idx]}
                        onChange={(e) =>
                          handleMemberExcludeChange(idx, !e.target.checked)
                        }
                        className="w-4 h-4 accent-purple-600 rounded cursor-pointer shrink-0"
                      />
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center shrink-0">
                        <span className="text-white text-xs font-bold">
                          {member?.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <span className="flex-1 text-gray-800 font-medium text-sm truncate">
                        {member}
                      </span>
                      <div className="relative shrink-0">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">
                          ₹
                        </span>
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={memberAmounts[idx]}
                          onChange={(e) =>
                            handleMemberAmountChange(idx, e.target.value)
                          }
                          className="w-24 pl-7 pr-2 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-right text-sm font-semibold outline-none transition-all disabled:bg-gray-100 disabled:cursor-not-allowed"
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

            {/* Error */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-red-600 text-sm font-medium text-center">
                {error}
              </div>
            )}
          </form>
        </div>

        {/* Footer */}
        <div className="shrink-0 border-t border-gray-100 bg-gray-50/50 px-5 py-4 flex justify-end gap-3">
          <button
            type="button"
            onClick={() => clearForm(false)}
            className="px-5 py-2.5 text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-100 transition-colors font-medium text-sm"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            onClick={handleSubmit}
            className={`px-5 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-200 font-medium text-sm flex items-center justify-center gap-2 shadow-md hover:shadow-lg ${
              loading ? "opacity-70 cursor-not-allowed" : ""
            }`}
          >
            {loading ? (
              <>
                <div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin"></div>
                Adding...
              </>
            ) : (
              "Add Transaction"
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddTransactionPopup;
