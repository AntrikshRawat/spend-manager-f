import { useState, useEffect } from "react";
import { HiX } from "react-icons/hi";
import { toast } from "react-toastify";
import axiosInstance from "../functions/axiosInstance";
import useUserStore from "../store/useUserStore";

const SettlePaymentPopup = ({
  isOpen,
  onClose,
  paidSpendLoading,
  paidSpendSummery,
}) => {
  const [selectedMember, setSelectedMember] = useState("");
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [members, setMembers] = useState([]);
  const user = useUserStore((u)=>u.user);

  const selectedMemberData = members?.find(
    (m) => m.userName === selectedMember,
  );
  const maxAmount = selectedMemberData ? selectedMemberData.due : 0;

  useEffect(() => {
    const fetchSettlementData = async () => {
      if (!isOpen || !paidSpendSummery) return;

      try {
        const response = await axiosInstance.post(
          `${import.meta.env.VITE_BACKEND_URL}/userAccount/settlement`,
          {
            userName:user.userName,
            paidSummery: paidSpendSummery.paidSummary,
            expenseSummery: paidSpendSummery.expenseSummary,
          },
        );
        setMembers(response.data.settlement || []);
      } catch (error) {
        console.error("Failed to fetch settlement data:", error);
        setMembers([]);
      }
    };

    fetchSettlementData();
  }, [isOpen, paidSpendSummery?.paidSummary, paidSpendSummery?.expenseSummary]);

  useEffect(() => {
    if (selectedMemberData) {
      setAmount(selectedMemberData.due.toString());
    }
  }, [selectedMemberData]);

  const handlePay = async () => {
    if (!selectedMember || !amount || parseFloat(amount) <= 0) {
      return;
    }

    if (parseFloat(amount) > maxAmount) {
      toast.error(`Amount cannot exceed ₹${maxAmount}`);
      return;
    }

    setLoading(true);
    try {
      
      toast.info(`Transaction details are sent to ${selectedMember}`);
      handleClose();
    } catch (error) {
      console.error("Payment failed:", error);
      toast.error("Payment failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      setSelectedMember("");
      setAmount("");
      onClose(false);
    }
  };

  if (!isOpen || paidSpendLoading) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-md w-full overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-br from-blue-600 to-indigo-600 p-6 relative">
          <button
            onClick={handleClose}
            disabled={loading}
            className="absolute top-4 right-4 text-white/80 hover:text-white transition-colors disabled:opacity-50 bg-white/10 rounded-full p-1.5"
          >
            <HiX className="w-5 h-5" />
          </button>
          <h2 className="text-xl font-semibold text-white">Pay Someone</h2>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">
          {/* Member Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              To
            </label>
            <div className="relative">
              <select
                value={selectedMember}
                onChange={(e) => setSelectedMember(e.target.value)}
                disabled={loading}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all appearance-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed text-gray-800"
              >
                <option value="">Select person</option>
                {members.map((member) => (
                  <option key={member.userName} value={member.userName}>
                    {member.userName}
                  </option>
                ))}
              </select>
              <svg
                className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </div>
          </div>

          {/* Amount Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Amount
            </label>
            <div className="relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600 font-medium text-xl">
                ₹
              </div>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                disabled={!selectedMember || loading}
                placeholder="0"
                min="0"
                max={maxAmount}
                step="0.01"
                className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-2xl font-semibold text-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
              />
            </div>
            {selectedMember && (
              <p className="text-xs text-gray-500 mt-2">
                You owe ₹{maxAmount.toFixed(2)}
              </p>
            )}
          </div>

          {/* Payment Summary */}
          {selectedMember && amount && parseFloat(amount) > 0 && (
            <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Paying</span>
                <span className="text-xl font-bold text-gray-900">
                  ₹{parseFloat(amount).toFixed(2)}
                </span>
              </div>
              <div className="flex items-center justify-between mt-1">
                <span className="text-gray-600">To</span>
                <span className="font-medium text-gray-900">
                  {selectedMember}
                </span>
              </div>
            </div>
          )}

          {/* Action Button */}
          <div className="space-y-3 pt-2">
            <button
              onClick={handlePay}
              disabled={!selectedMember || !amount || parseFloat(amount) <= 0 || loading}
              className="w-full py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-semibold shadow-md hover:shadow-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-md"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg
                    className="animate-spin h-5 w-5"
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
                  Processing...
                </span>
              ) : (
                "Confirm Payment"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettlePaymentPopup;
