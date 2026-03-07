"use client";

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import {
    BarChart3,
    QrCode,
    MessageSquare,
    Ticket,
    Settings,
    LogOut,
    Star,
    ChevronLeft,
} from 'lucide-react';

export default function Sidebar({ isOpen, setIsOpen }) {
    const { logout } = useAuth();
    const pathname = usePathname();
    const router = useRouter();

    const navigation = [
        { name: 'Analytics', href: '/dashboard', icon: BarChart3 },
        { name: 'QR Code', href: '/dashboard/qr', icon: QrCode },
        { name: 'Feedback', href: '/dashboard/feedback', icon: MessageSquare },
        { name: 'Coupons', href: '/dashboard/coupons', icon: Ticket },
        { name: 'Settings', href: '/dashboard/settings', icon: Settings },
    ];

    const handleLogout = async () => {
        await logout();
        router.push('/login');
    };

    return (
        <>
            {/* Mobile backdrop */}
            {isOpen && (
                <div
                    className="fixed inset-0 z-20 bg-gray-900/50 lg:hidden"
                    onClick={() => setIsOpen(false)}
                />
            )}

            {/* Sidebar */}
            <div className={`
        fixed inset-y-0 left-0 z-30 w-64 bg-white border-r border-gray-200 transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 flex flex-col
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
                {/* Logo area */}
                <div className="flex items-center justify-between h-16 px-6 border-b border-gray-100">
                    <div className="flex items-center gap-2">
                        <div className="bg-blue-600 text-white p-1.5 rounded-md">
                            <Star size={16} className="fill-current" />
                        </div>
                        <span className="text-lg font-bold text-gray-900">Review Booster</span>
                    </div>
                    <button onClick={() => setIsOpen(false)} className="lg:hidden text-gray-500 hover:text-gray-700">
                        <ChevronLeft size={20} />
                    </button>
                </div>

                {/* Navigation */}
                <div className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
                    {navigation.map((item) => {
                        const Icon = item.icon;
                        const isActive = item.href === '/dashboard'
                            ? pathname === '/dashboard'
                            : pathname.startsWith(item.href);
                        return (
                            <Link
                                key={item.name}
                                href={item.href}
                                onClick={() => setIsOpen(false)}
                                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg font-medium transition-colors
                  ${isActive
                                        ? 'bg-blue-50 text-blue-700'
                                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                    }`}
                            >
                                <Icon size={20} className="shrink-0" />
                                {item.name}
                            </Link>
                        );
                    })}
                </div>

                {/* Footer actions */}
                <div className="p-4 border-t border-gray-100">
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 px-3 py-2.5 w-full rounded-lg font-medium text-red-600 hover:bg-red-50 transition-colors"
                    >
                        <LogOut size={20} />
                        Sign Out
                    </button>
                </div>
            </div>
        </>
    );
}
