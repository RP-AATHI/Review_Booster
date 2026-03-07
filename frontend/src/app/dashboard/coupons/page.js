"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { db } from '@/firebase/firebase';
import { collection, query, where, getDocs, updateDoc, doc } from 'firebase/firestore';
import { Ticket, Search, CheckCircle } from 'lucide-react';

export default function CouponsList() {
    const { user } = useAuth();
    const [coupons, setCoupons] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [redeemLoading, setRedeemLoading] = useState(null);

    useEffect(() => {
        async function fetchCoupons() {
            if (!user) return;
            try {
                const q = query(collection(db, 'coupons'), where('merchantId', '==', user.uid));
                const snapshot = await getDocs(q);
                const data = snapshot.docs.map(d => ({
                    id: d.id, ...d.data(),
                    date: d.data().createdAt ? d.data().createdAt.toDate() : new Date()
                })).sort((a, b) => b.date - a.date);
                setCoupons(data);
            } catch (err) { console.error(err); }
            finally { setLoading(false); }
        }
        fetchCoupons();
    }, [user]);

    const handleRedeem = async (id) => {
        if (!window.confirm("Mark this coupon as redeemed? This cannot be undone.")) return;
        setRedeemLoading(id);
        try {
            await updateDoc(doc(db, 'coupons', id), { status: 'redeemed' });
            setCoupons(coupons.map(c => c.id === id ? { ...c, status: 'redeemed' } : c));
        } catch (err) { console.error(err); alert("Failed to redeem coupon."); }
        finally { setRedeemLoading(null); }
    };

    const filteredCoupons = coupons.filter(c => !searchQuery || c.code.toLowerCase().includes(searchQuery.toLowerCase()));

    if (loading) return <div className="p-6">Loading coupons...</div>;

    return (
        <div className="p-6 max-w-7xl mx-auto flex flex-col h-full">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2"><Ticket size={24} className="text-blue-600" /> Reward Coupons</h2>
                    <p className="text-gray-600 mt-1 text-sm">Verify and redeem customer coupon codes.</p>
                </div>
                <div className="relative w-full sm:w-72">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><Search size={18} className="text-gray-400" /></div>
                    <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                        className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm shadow-sm"
                        placeholder="Search code (ex: RB-9F3K)..." />
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 flex-1 overflow-hidden flex flex-col">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                {['Coupon Code', 'Status', 'Issued Reason', 'Date', 'Actions'].map((h, i) => (
                                    <th key={h} scope="col" className={`px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider ${i === 4 ? 'text-right' : 'text-left'}`}>{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {filteredCoupons.map((coupon) => (
                                <tr key={coupon.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className="font-mono text-sm font-bold text-gray-900 bg-gray-100 px-3 py-1 rounded">{coupon.code}</span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        {coupon.status === 'redeemed' ? (
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800"><CheckCircle size={12} className="mr-1" /> Redeemed</span>
                                        ) : (
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800"><CheckCircle size={12} className="mr-1" /> Active</span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap"><span className="text-sm text-gray-500 capitalize">{coupon.reason?.replace('_', ' ')}</span></td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(coupon.date)}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        {coupon.status !== 'redeemed' && (
                                            <button onClick={() => handleRedeem(coupon.id)} disabled={redeemLoading === coupon.id}
                                                className="text-blue-600 hover:text-blue-900 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-md transition-colors">
                                                {redeemLoading === coupon.id ? 'Processing...' : 'Redeem Now'}
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {filteredCoupons.length === 0 && (
                        <div className="text-center py-12">
                            <Ticket className="mx-auto h-12 w-12 text-gray-300 mb-3" />
                            <h3 className="text-sm font-medium text-gray-900">No coupons found</h3>
                            <p className="mt-1 text-sm text-gray-500">Wait for customers to complete the feedback loop to distribute coupons.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
