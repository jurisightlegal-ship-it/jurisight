export default function Loading() {
  return (
    <div className="min-h-screen bg-white">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-8">
        {/* Title skeleton */}
        <div className="h-8 w-3/4 bg-gray-200 animate-pulse rounded mb-4" />
        {/* Meta row skeleton */}
        <div className="flex items-center gap-4 mb-6">
          <div className="h-4 w-24 bg-gray-200 animate-pulse rounded" />
          <div className="h-4 w-20 bg-gray-200 animate-pulse rounded" />
          <div className="h-4 w-28 bg-gray-200 animate-pulse rounded" />
        </div>
        {/* Featured image skeleton */}
        <div className="w-full aspect-video bg-gray-200 animate-pulse rounded mb-6" />
        {/* Body skeleton blocks */}
        <div className="space-y-3">
          <div className="h-4 w-full bg-gray-200 animate-pulse rounded" />
          <div className="h-4 w-11/12 bg-gray-200 animate-pulse rounded" />
          <div className="h-4 w-10/12 bg-gray-200 animate-pulse rounded" />
          <div className="h-4 w-9/12 bg-gray-200 animate-pulse rounded" />
          <div className="h-4 w-8/12 bg-gray-200 animate-pulse rounded" />
        </div>
      </div>
    </div>
  );
}
