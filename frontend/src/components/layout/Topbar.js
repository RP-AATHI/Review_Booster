"use client";

import { useAuth } from '@/context/AuthContext';
import { Menu, Bell } from 'lucide-react';

export default function Topbar({ setIsSidebarOpen }) {
    const { user } = useAuth();

    return (
        <header className="bg-white border-b border-gray-200 h-16 flex items-center justify-between px-4 sm:px-6 lg:px-8 shrink-0">
            <div className="flex items-center gap-4">
                <button
                    onClick={() => setIsSidebarOpen(true)}
                    className="text-gray-500 hover:text-gray-700 lg:hidden focus:outline-none"
                >
                    <Menu size={24} />
                </button>

                <h1 className="text-xl font-semibold text-gray-800 hidden sm:block">
                    Dashboard Overview
                </h1>
            </div>

            <div className="flex items-center gap-4">
                <button className="text-gray-400 hover:text-gray-500 relative p-2 rounded-full hover:bg-gray-50 transition-colors">
                    <Bell size={20} />
                    <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>
                </button>

                <div className="flex items-center gap-3 border-l border-gray-200 pl-4 ml-2">
                    <div className="hidden md:flex flex-col items-end">
                        <span className="text-sm font-medium text-gray-900 truncate max-w-[150px]">
                            {user?.email}
                        </span>
                        <span className="text-xs text-gray-500">Restaurant Owner</span>
                    </div>
                    <div className="w-9 h-9 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold shadow-sm">
                        {user?.email?.charAt(0).toUpperCase() || 'U'}
                    </div>
                </div>
            </div>
        </header>
    );
}
