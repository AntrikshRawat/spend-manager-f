const AccountPaidSpend = ({accountMembers,paidSpendLoading,paidSpendSummery}) => {

  const paidSummary = paidSpendSummery?.paidSummary || {};
  const expenseSummary = paidSpendSummery?.expenseSummary || {};
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
      {/* Paid Section */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-lg overflow-hidden">
        <div className="p-5 border-b border-gray-100 flex items-center gap-2">
          <div className="w-1.5 h-6 bg-gradient-to-b from-green-500 to-emerald-500 rounded-full"></div>
          <h2 className="text-lg font-bold text-gray-800">Paid</h2>
        </div>
        <div className="p-5">
          {paidSpendLoading ? (
            <div className="flex flex-col items-center justify-center py-10">
              <div className="w-10 h-10 rounded-full border-4 border-green-200 border-t-green-500 animate-spin"></div>
              <p className="text-gray-500 mt-3 text-sm">Loading paid data...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {accountMembers?.map((member) => {
                return (
                  <div
                    key={member}
                    className="group relative rounded-xl transition-all duration-300 hover:-translate-y-1"
                  >
                    <div className="absolute -inset-0.5 bg-gradient-to-r from-green-400 to-emerald-400 rounded-xl blur opacity-0 group-hover:opacity-30 transition-all duration-500"></div>
                    <div className="relative bg-gray-50 group-hover:bg-green-50 rounded-xl p-4 border border-gray-100 group-hover:border-green-200 flex flex-col items-center transition-all duration-300">
                      <div className="w-11 h-11 rounded-full bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center mb-2.5 shadow-md">
                        <span className="text-white text-base font-bold">
                          {member ? member?.charAt(0).toUpperCase() : '?'}
                        </span>
                      </div>
                      <p className="text-sm font-semibold text-gray-800 mb-1 text-center truncate w-full">
                        {member}
                      </p>
                      <p className="text-lg font-bold text-green-600 text-center">
                        ₹{paidSummary[member] ?? 0}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Spend Section */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-lg overflow-hidden">
        <div className="p-5 border-b border-gray-100 flex items-center gap-2">
          <div className="w-1.5 h-6 bg-gradient-to-b from-purple-500 to-pink-500 rounded-full"></div>
          <h2 className="text-lg font-bold text-gray-800">Spend</h2>
        </div>
        <div className="p-5">
          {paidSpendLoading ? (
            <div className="flex flex-col items-center justify-center py-10">
              <div className="w-10 h-10 rounded-full border-4 border-purple-200 border-t-purple-500 animate-spin"></div>
              <p className="text-gray-500 mt-3 text-sm">Loading spend data...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {accountMembers.map((member) => {
                return (
                  <div
                    key={member}
                    className="group relative rounded-xl transition-all duration-300 hover:-translate-y-1"
                  >
                    <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-400 to-pink-400 rounded-xl blur opacity-0 group-hover:opacity-30 transition-all duration-500"></div>
                    <div className="relative bg-gray-50 group-hover:bg-purple-50 rounded-xl p-4 border border-gray-100 group-hover:border-purple-200 flex flex-col items-center transition-all duration-300">
                      <div className="w-11 h-11 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center mb-2.5 shadow-md">
                        <span className="text-white text-base font-bold">
                          {member ? member?.charAt(0).toUpperCase() : '?'}
                        </span>
                      </div>
                      <p className="text-sm font-semibold text-gray-800 mb-1 text-center truncate w-full">
                        {member}
                      </p>
                      <p className="text-lg font-bold text-purple-600 text-center">
                        ₹{expenseSummary[member] ?? 0}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AccountPaidSpend;