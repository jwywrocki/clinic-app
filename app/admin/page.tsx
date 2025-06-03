'use client';

import { Suspense } from 'react';
import AdminPanel from './components/AdminPanel';
import { Toaster } from '@/components/ui/toaster';
import { Card, CardContent } from '@/components/ui/card';

function LoadingSpinner() {
    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
            <Card className="w-96">
                <CardContent className="p-6">
                    <div className="flex items-center justify-center space-x-2">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                        <span className="text-gray-600">Loading admin panel...</span>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

export default function AdminPage() {
    return (
        <>
            <Suspense fallback={<LoadingSpinner />}>
                <AdminPanel />
            </Suspense>
            <Toaster />
        </>
    );
}
