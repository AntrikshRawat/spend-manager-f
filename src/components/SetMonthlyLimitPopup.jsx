import { useState, useEffect, useMemo } from "react";
import { HiX, HiOutlineShieldCheck, HiOutlineCurrencyRupee, HiOutlineCalendar } from "react-icons/hi";
import { toast } from "react-toastify";
import useAccountStore from "../store/useAccountStore";

const monthNames = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

const QUICK_AMOUNTS = [1000, 5000, 10000, 20000, 50000];

const SetMonthlyLimitPopup = ({
  isOpen,
  onClose,
  accountId,
  initialLimit = 10000,
  defaultMonthKey,
}) => {
  const monthlyLimits = useAccountStore((s) => s.monthlyLimits);
  const setMonthlyLimit = useAccountStore((s) => s.setMonthlyLimit);

  // Available months: Only Current Month and Upcoming Months (Next 11 months)
  const monthOptions = useMemo(() => {
    const options = [];
    const now = new Date();
    for (let offset = 0; offset <= 11; offset++) {
      const d = new Date(now.getFullYear(), now.getMonth() + offset, 1);
      const name = `${monthNames[d.getMonth()]} ${d.getFullYear()}`;
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      const isCurrent = offset === 0;
      options.push({
        name,
        key,
        year: d.getFullYear(),
        month: d.getMonth(),
        label: isCurrent ? `${name} (Current Month)` : name,
        isCurrent,
      });
    }
    return options;
  }, []);

  const [selectedMonthKey, setSelectedMonthKey] = useState(monthOptions[0]?.key || "");
  const [limitValue, setLimitValue] = useState("");

  // When modal opens, select defaultMonthKey if available and valid in options
  useEffect(() => {
    if (isOpen) {
      if (defaultMonthKey && monthOptions.some((m) => m.key === defaultMonthKey)) {
        setSelectedMonthKey(defaultMonthKey);
      } else if (monthOptions[0]?.key) {
        setSelectedMonthKey(monthOptions[0].key);
      }
    }
  }, [isOpen, defaultMonthKey, monthOptions]);

  const activeOption = useMemo(() => {
    return monthOptions.find((m) => m.key === selectedMonthKey) || monthOptions[0];
  }, [monthOptions, selectedMonthKey]);

  // Sync stored limit only when popup opens or when selected month changes
  useEffect(() => {
    if (isOpen && accountId && activeOption) {
      const stored =
        monthlyLimits?.[accountId]?.[activeOption.name] ??
        monthlyLimits?.[accountId]?.[activeOption.key] ??
        initialLimit;
      setLimitValue(String(stored && Number(stored) >= 1000 ? stored : 10000));
    }
  }, [isOpen, accountId, selectedMonthKey]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    const num = Number(limitValue);
    if (!limitValue || isNaN(num) || num < 1000) {
      toast.error("Please enter a valid monthly limit of at least ₹1,000");
      return;
    }

    setMonthlyLimit(accountId, activeOption.name, num, activeOption.key);
    toast.success(`Monthly limit for ${activeOption.name} updated to ₹${num.toLocaleString("en-IN")}`);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden transform transition-all">
        {/* Header with gradient banner */}
        <div className="relative bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 p-6 text-white overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-xl bg-white/20 hover:bg-white/30 text-white transition-all"
            aria-label="Close"
          >
            <HiX className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-3">
            <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-sm shadow-inner">
              <HiOutlineShieldCheck className="w-7 h-7 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white tracking-tight">Set Monthly Limit</h2>
              <p className="text-amber-100 text-xs mt-0.5">Define your target spend budget for the month</p>
            </div>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Month Selector - Current and Upcoming only */}
          <div>
            <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <HiOutlineCalendar className="w-4 h-4 text-amber-500" />
              Target Month
            </label>
            <div className="relative">
              <select
                value={selectedMonthKey}
                onChange={(e) => setSelectedMonthKey(e.target.value)}
                className="w-full appearance-none bg-gray-50 border border-gray-200 text-gray-800 text-sm font-semibold rounded-xl px-4 py-3 pr-10 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-amber-400 transition-all cursor-pointer hover:bg-gray-100/70"
              >
                {monthOptions.map((opt) => (
                  <option key={opt.key} value={opt.key}>
                    {opt.label}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>

          {/* Amount Input */}
          <div>
            <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <HiOutlineCurrencyRupee className="w-4 h-4 text-amber-500" />
              Monthly Spend Limit (₹)
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-lg select-none">
                ₹
              </span>
              <input
                type="number"
                min="1000"
                step="any"
                value={limitValue}
                onChange={(e) => setLimitValue(e.target.value)}
                placeholder="10000"
                required
                className="w-full pl-9 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl font-bold text-lg text-gray-800 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-amber-400 focus:bg-white transition-all"
              />
            </div>
            <p className="text-xs text-gray-400 mt-1.5">Minimum limit is ₹1,000</p>
          </div>

          {/* Quick Presets */}
          <div>
            <p className="text-xs font-medium text-gray-500 mb-2">Quick Presets:</p>
            <div className="flex flex-wrap gap-2">
              {QUICK_AMOUNTS.map((amt) => (
                <button
                  type="button"
                  key={amt}
                  onClick={() => setLimitValue(String(amt))}
                  className={`text-xs px-3 py-1.5 rounded-lg font-semibold border transition-all ${
                    Number(limitValue) === amt
                      ? "bg-amber-500 text-white border-amber-500 shadow-sm shadow-amber-200"
                      : "bg-gray-50 text-gray-600 border-gray-200 hover:bg-amber-50 hover:text-amber-700 hover:border-amber-200"
                  }`}
                >
                  ₹{amt.toLocaleString("en-IN")}
                </button>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-xl text-sm transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-3 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-bold rounded-xl text-sm transition-all shadow-lg shadow-amber-500/25 active:scale-95"
            >
              Save Limit
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SetMonthlyLimitPopup;
