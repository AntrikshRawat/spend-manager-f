export const TransactionSkeleton = () => (
  <div className="bg-gray-50 rounded-xl p-5 animate-pulse space-y-3">
    <div className="flex items-center gap-3">
      <div className="w-10 h-10 bg-gray-200 rounded-full shrink-0"></div>
      <div className="flex-1 space-y-2">
        <div className="h-4 bg-gray-200 rounded w-28"></div>
        <div className="h-3 bg-gray-200 rounded w-20"></div>
      </div>
      <div className="h-5 bg-gray-200 rounded w-16"></div>
    </div>
    <div className="flex gap-3">
      <div className="h-3 bg-gray-200 rounded w-24"></div>
      <div className="h-3 bg-gray-200 rounded w-32"></div>
    </div>
  </div>
);