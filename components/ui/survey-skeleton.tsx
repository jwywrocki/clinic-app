export function SurveySkeleton() {
    return (
        <div className="animate-pulse bg-blue-50 border-blue-200 rounded-lg p-6">
            {/* Survey header skeleton */}
            <div className="mb-6">
                <div className="h-6 bg-blue-200 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-blue-100 rounded w-full"></div>
            </div>

            {/* Questions skeleton */}
            <div className="space-y-6">
                {[1, 2, 3].map((i) => (
                    <div key={i} className="bg-white p-4 rounded-lg border">
                        <div className="h-5 bg-gray-200 rounded w-2/3 mb-3"></div>
                        <div className="space-y-2">
                            <div className="h-4 bg-gray-100 rounded w-1/2"></div>
                            <div className="h-4 bg-gray-100 rounded w-1/3"></div>
                            <div className="h-4 bg-gray-100 rounded w-2/5"></div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Submit button skeleton */}
            <div className="flex justify-end mt-6">
                <div className="h-10 bg-blue-200 rounded w-32"></div>
            </div>
        </div>
    );
}
