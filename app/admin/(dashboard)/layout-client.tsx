'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Toaster } from '@/components/ui/toaster';
import { Sidebar } from '../components/Sidebar';
import { Header } from '../components/Header';
import { User } from '@/lib/types/users';

export function AdminLayoutClient({ children }: { children: React.ReactNode }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const checkLoginStatus = async () => {
      try {
        const response = await fetch('/api/auth/status', { cache: 'no-store' });
        const data = await response.json();

        if (data.isLoggedIn) {
          setIsLoggedIn(true);
          setCurrentUser(data.user);
        } else {
          router.replace('/admin/login');
        }
      } catch (error) {
        console.error('Error checking auth status:', error);
        router.replace('/admin/login');
      } finally {
        setLoading(false);
      }
    };

    checkLoginStatus();
  }, [router]);

  const handleLogout = async () => {
    await fetch('/api/auth', { method: 'DELETE' });
    router.replace('/admin/login');
  };

  const hasPermission = (permission: string) => {
    if (!currentUser?.role) return true; // authenticated but role not yet in session → show everything
    if (currentUser.role === 'Administrator') return true;
    if (currentUser.role === 'Editor') return permission === 'manage_pages';
    return true; // unknown/custom roles — show all, rely on server-side auth
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100">
        <p>Ładowanie panelu...</p>
      </div>
    );
  }

  if (!isLoggedIn) {
    return null; // Will redirect in useEffect
  }

  return (
    <>
      <Toaster />
      <div className="flex h-screen bg-gray-50">
        <Sidebar
          currentUser={currentUser}
          sidebarCollapsed={sidebarCollapsed}
          setSidebarCollapsed={setSidebarCollapsed}
          hasPermission={hasPermission}
          onLogout={handleLogout}
        />
        <div className="flex-1 flex flex-col overflow-hidden">
          <Header />
          <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 p-6">
            {children}
          </main>
        </div>
      </div>
    </>
  );
}
