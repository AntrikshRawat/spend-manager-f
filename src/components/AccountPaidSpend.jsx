const AccountPaidSpend = ({accountMembers,paidSpendLoading,paidSpendSummery}) => {

  const paidSummary = paidSpendSummery?.paidSummary || {};
  const expenseSummary = paidSpendSummery?.expenseSummary || {};
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
      {/* Paid Section */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-xl font-semibold text-gray-800">Paid</h2>
        </div>
        <div className="p-6">
          {paidSpendLoading ? (
            <div className="text-center text-gray-500">Loading...</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {accountMembers?.map((member) => {
                return (
                  <div
                    key={member}
                    className="bg-gradient-to-br from-indigo-50 to-blue-50 rounded-xl p-6 shadow-md flex flex-col items-center transition-transform hover:shadow-lg"
                  >
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-indigo-400 flex items-center justify-center mb-3 shadow">
                      <span className="text-white text-lg font-bold">
                        {member ? member?.charAt(0).toUpperCase() : '?'}
                      </span>
                    </div>
                    <p className="text-base font-semibold text-gray-800 mb-1 text-center">
                      {member}
                    </p>
                    <p className="text-xl font-bold text-indigo-700 text-center">
                      ₹{paidSummary[member] ?? 0}
                    </p>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
      {/* Spend Section */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-xl font-semibold text-gray-800">Spend</h2>
        </div>
        <div className="p-6">
          {paidSpendLoading ? (
            <div className="text-center text-gray-500">Loading...</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {accountMembers.map((member) => {
                return (
                  <div
                    key={member}
                    className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-6 shadow-md flex flex-col items-center transition-transform hover:shadow-lg"
                  >
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-400 to-purple-400 flex items-center justify-center mb-3 shadow">
                      <span className="text-white text-lg font-bold">
                        {member ? member?.charAt(0).toUpperCase() : '?'}
                      </span>
                    </div>
                    <p className="text-base font-semibold text-gray-800 mb-1 text-center">
                      {member}
                    </p>
                    <p className="text-xl font-bold text-indigo-700 text-center">
                      ₹{expenseSummary[member] ?? 0}
                    </p>
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