import { useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import Topbar from './Topbar';

import AnalyticsOverview from '../../../pages/Dashboard/AnalyticsOverview';
import QRCodeGenerator from '../../../pages/Dashboard/QRCodeGenerator';
import FeedbackInbox from '../../../pages/Dashboard/FeedbackInbox';
import CouponsList from '../../../pages/Dashboard/CouponsList';

export default function DashboardLayout() {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    return (
        <div className="flex h-screen overflow-hidden bg-gray-50 font-sans">
            <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />

            <div className="flex flex-col flex-1 w-full overflow-hidden">
                <Topbar setIsSidebarOpen={setIsSidebarOpen} />

                <main className="flex-1 overflow-y-auto w-full">
                    <Routes>
                        <Route path="/" element={<AnalyticsOverview />} />
                        <Route path="/qr" element={<QRCodeGenerator />} />
                        <Route path="/feedback" element={<FeedbackInbox />} />
                        <Route path="/coupons" element={<CouponsList />} />

                        {/* Catch-all route to overview */}
                        <Route path="*" element={<Navigate to="/dashboard" replace />} />
                    </Routes>
                </main>
            </div>
        </div>
    );
}
