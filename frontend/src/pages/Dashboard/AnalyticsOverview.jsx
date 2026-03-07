import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../firebase/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { QrCode, Star, MessageSquare, Ticket, TrendingUp } from 'lucide-react';

export default function AnalyticsOverview() {
    const { user } = useAuth();
    const [stats, setStats] = useState({
        totalScans: 0,
        googleRedirects: 0,
        privateFeedback: 0,
        couponsIssued: 0,
        couponsRedeemed: 0
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchStats() {
            if (!user) return;

            try {
                // In a production app, we would aggregate these via Cloud Functions 
                // or a more optimized query to save read costs, but for MVP we fetch direct.

                // 1. Scans
                const scansRef = collection(db, 'scans');
                const qScans = query(scansRef, where('merchantId', '==', user.uid));
                const scanSnapshot = await getDocs(qScans);

                let googleCount = 0;
                let feedbackCount = 0;

                scanSnapshot.forEach(doc => {
                    const data = doc.data();
                    if (data.action === 'google_review') googleCount++;
                    if (data.action === 'private_feedback') feedbackCount++;
                });

                // 2. Coupons
                const couponsRef = collection(db, 'coupons');
                const qCoupons = query(couponsRef, where('merchantId', '==', user.uid));
                const couponsSnapshot = await getDocs(qCoupons);

                let redeemedCount = 0;
                couponsSnapshot.forEach(doc => {
                    if (doc.data().status === 'redeemed') redeemedCount++;
                });

                setStats({
                    totalScans: scanSnapshot.size,
                    googleRedirects: googleCount,
                    privateFeedback: feedbackCount,
                    couponsIssued: couponsSnapshot.size,
                    couponsRedeemed: redeemedCount
                });
            } catch (error) {
                console.error('Error fetching stats:', error);
            } finally {
                setLoading(false);
            }
        }

        fetchStats();
    }, [user]);

    const StatCard = ({ title, value, icon: Icon, colorClass, trend }) => (
        <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-lg ${colorClass}`}>
                    <Icon size={24} />
                </div>
                {trend && (
                    <div className="flex items-center text-sm font-medium text-green-600 bg-green-50 px-2.5 py-1 rounded-full">
                        <TrendingUp size={16} className="mr-1" />
                        {trend}
                    </div>
                )}
            </div>
            <h3 className="text-gray-500 text-sm font-medium">{title}</h3>
            <div className="text-3xl font-bold text-gray-900 mt-1">{value}</div>
        </div>
    );

    if (loading) {
        return (
            <div className="p-6">
                <h2 className="text-2xl font-bold mb-6 text-gray-900">Dashboard Overview</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-pulse">
                    {[1, 2, 3, 4].map(i => (
                        <div key={i} className="h-32 bg-gray-200 rounded-xl"></div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="p-6 max-w-7xl mx-auto">
            <h2 className="text-2xl font-bold mb-6 text-gray-900">Dashboard Overview</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <StatCard
                    title="Total QR Scans"
                    value={stats.totalScans}
                    icon={QrCode}
                    colorClass="bg-blue-100 text-blue-600"
                    trend="+12%"
                />
                <StatCard
                    title="Google Reviews"
                    value={stats.googleRedirects}
                    icon={Star}
                    colorClass="bg-green-100 text-green-600"
                    trend="+8%"
                />
                <StatCard
                    title="Private Feedback"
                    value={stats.privateFeedback}
                    icon={MessageSquare}
                    colorClass="bg-red-100 text-red-600"
                />
                <StatCard
                    title="Coupons Redeemed"
                    value={stats.couponsRedeemed}
                    icon={Ticket}
                    colorClass="bg-purple-100 text-purple-600"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-white rounded-xl border border-gray-100 shadow-sm p-6 flex flex-col items-center justify-center min-h-[300px]">
                    <BarChart3 className="text-gray-300 mb-4" size={48} />
                    <p className="text-gray-500 font-medium text-center">Charts will appear once sufficient data is available.</p>
                </div>

                <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
                    <h3 className="text-lg font-bold text-gray-900 mb-4">Quick Actions</h3>
                    <div className="space-y-3">
                        <button className="w-full text-left px-4 py-3 rounded-lg border border-gray-200 hover:border-blue-500 hover:bg-blue-50 transition-colors flex items-center justify-between group">
                            <span className="font-medium text-gray-700 group-hover:text-blue-700">Download QR Code</span>
                            <QrCode size={18} className="text-gray-400 group-hover:text-blue-500" />
                        </button>
                        <button className="w-full text-left px-4 py-3 rounded-lg border border-gray-200 hover:border-blue-500 hover:bg-blue-50 transition-colors flex items-center justify-between group">
                            <span className="font-medium text-gray-700 group-hover:text-blue-700">View Unread Feedback</span>
                            <MessageSquare size={18} className="text-gray-400 group-hover:text-blue-500" />
                        </button>
                        <button className="w-full text-left px-4 py-3 rounded-lg border border-gray-200 hover:border-blue-500 hover:bg-blue-50 transition-colors flex items-center justify-between group">
                            <span className="font-medium text-gray-700 group-hover:text-blue-700">Edit Welcome Coupon</span>
                            <Ticket size={18} className="text-gray-400 group-hover:text-blue-500" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
