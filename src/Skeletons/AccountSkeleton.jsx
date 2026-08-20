export const AccountSkeleton = () => (
  <div className="group relative bg-white rounded-2xl shadow-lg overflow-hidden animate-pulse border border-gray-100">
    <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5"></div>
    <div className="relative p-6">
      <div className="flex justify-between items-start mb-6">
        <div className="space-y-2">
          <div className="h-7 bg-gradient-to-r from-gray-200 to-gray-300 rounded-lg w-40"></div>
          <div className="h-4 bg-gray-200 rounded w-24"></div>
        </div>
        <div className="flex gap-2">
          <div className="w-10 h-10 bg-gray-200 rounded-xl"></div>
          <div className="w-10 h-10 bg-gray-200 rounded-xl"></div>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-gray-50 rounded-xl p-3 text-center">
          <div className="h-3 bg-gray-200 rounded w-12 mx-auto mb-2"></div>
          <div className="h-6 bg-gray-200 rounded w-16 mx-auto"></div>
        </div>
        <div className="bg-gray-50 rounded-xl p-3 text-center">
          <div className="h-3 bg-gray-200 rounded w-12 mx-auto mb-2"></div>
          <div className="h-6 bg-gray-200 rounded w-8 mx-auto"></div>
        </div>
        <div className="bg-gray-50 rounded-xl p-3 text-center">
          <div className="h-3 bg-gray-200 rounded w-16 mx-auto mb-2"></div>
          <div className="h-6 bg-gray-200 rounded w-8 mx-auto"></div>
        </div>
      </div>
    </div>
  </div>
);