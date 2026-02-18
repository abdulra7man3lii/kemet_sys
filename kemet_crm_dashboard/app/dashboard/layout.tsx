'use client';

import { Sidebar } from '@/components/sidebar';
import { Header } from '@/components/header';
import { useAuth } from '@/context/AuthContext';
import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { user, isLoading, isAuthenticated } = useAuth();
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        if (!isLoading) {
            if (!isAuthenticated) {
                router.push('/login');
            } else if (user?.role === 'EMPLOYEE') {
                const restrictedPaths = [
                    '/dashboard/import',
                    '/dashboard/team',
                    '/dashboard/finance',
                    '/dashboard/marketing',
                    '/dashboard/laundry'
                ];
                if (restrictedPaths.some(path => pathname.startsWith(path))) {
                    router.push('/dashboard');
                }
            }
        }
    }, [isLoading, isAuthenticated, user, router, pathname]);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-50">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-600"></div>
            </div>
        );
    }

    if (!isAuthenticated) return null;

    return (
        <div className="flex min-h-screen bg-white relative overflow-hidden">
            {/* Luxury Ambient Glows */}
            <div className="absolute top-0 left-64 w-[500px] h-[500px] bg-yellow-500/5 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-yellow-600/5 rounded-full blur-[100px] pointer-events-none" />

            {/* Subtle Grid overlay for texture */}
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgyMTgsMTY1LDMyLDAuMDIpIiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] pointer-events-none opacity-50" />
            {/* Desktop Sidebar */}
            <Sidebar className="hidden lg:flex fixed inset-y-0" />

            {/* Main Content Area */}
            <div className="flex flex-col flex-1 lg:pl-64">
                <Header />
                <main className="flex-1 p-6 overflow-auto">
                    {children}
                </main>
            </div>
        </div>
    );
}
