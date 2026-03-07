"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { db } from '@/firebase/firebase';
import { collection, query, where, getDocs, updateDoc, doc } from 'firebase/firestore';
import { MessageSquare, Phone, CheckCircle, Clock } from 'lucide-react';

export default function FeedbackInbox() {
    const { user } = useAuth();
    const [feedbackList, setFeedbackList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');

    useEffect(() => {
        async function fetchFeedback() {
            if (!user) return;
            try {
                const q = query(collection(db, 'feedback'), where('merchantId', '==', user.uid));
                const snapshot = await getDocs(q);
                const data = snapshot.docs.map(d => ({
                    id: d.id, ...d.data(),
                    date: d.data().timestamp ? d.data().timestamp.toDate() : new Date()
                })).sort((a, b) => b.date - a.date);
                setFeedbackList(data);
            } catch (err) { console.error(err); }
            finally { setLoading(false); }
        }
        fetchFeedback();
    }, [user]);

    const markResolved = async (id) => {
        try {
            await updateDoc(doc(db, 'feedback', id), { status: 'resolved' });
            setFeedbackList(feedbackList.map(f => f.id === id ? { ...f, status: 'resolved' } : f));
        } catch (err) { console.error(err); }
    };

    const filteredList = feedbackList.filter(item => {
        if (filter === 'unread') return item.status === 'unread';
        if (filter === 'resolved') return item.status === 'resolved';
        return true;
    });

    const getIssueColor = (category) => {
        switch (category) {
            case 'Food Quality': return 'bg-orange-100 text-orange-700';
            case 'Service Speed': return 'bg-yellow-100 text-yellow-700';
            case 'Cleanliness': return 'bg-blue-100 text-blue-700';
            case 'Staff Politeness': return 'bg-purple-100 text-purple-700';
            default: return 'bg-gray-100 text-gray-700';
        }
    };

    if (loading) return <div className="p-6">Loading inbox...</div>;

    return (
        <div className="p-6 max-w-7xl mx-auto flex flex-col h-full">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                        <MessageSquare size={24} className="text-blue-600" /> Feedback Inbox
                    </h2>
                    <p className="text-gray-600 mt-1 text-sm">Review privately captured feedback and contact customers.</p>
                </div>
                <div className="flex items-center gap-2 bg-white rounded-lg p-1 border border-gray-200">
                    {['all', 'unread', 'resolved'].map(f => (
                        <button key={f} onClick={() => setFilter(f)}
                            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${filter === f ? 'bg-gray-100 text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}>
                            {f.charAt(0).toUpperCase() + f.slice(1)}
                        </button>
                    ))}
                </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 shadow-sm flex-1 overflow-hidden flex flex-col">
                {filteredList.length === 0 ? (
                    <div className="flex-1 flex flex-col items-center justify-center p-12 text-center">
                        <CheckCircle size={32} className="text-gray-300 mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-1">You're all caught up!</h3>
                        <p className="text-gray-500">No {filter !== 'all' ? filter : ''} feedback currently.</p>
                    </div>
                ) : (
                    <div className="overflow-y-auto flex-1 p-4 space-y-3">
                        {filteredList.map((feedback) => (
                            <div key={feedback.id} className={`p-5 rounded-lg border ${feedback.status === 'unread' ? 'bg-red-50/50 border-red-100' : 'bg-white border-gray-100 hover:border-gray-300'}`}>
                                <div className="flex justify-between items-start mb-3">
                                    <div className="flex items-center gap-3">
                                        <div className={`px-3 py-1 text-xs font-bold uppercase tracking-wider rounded-full ${getIssueColor(feedback.issueCategory)}`}>{feedback.issueCategory}</div>
                                        <div className="flex items-center gap-1 text-xs font-medium bg-gray-100 text-gray-600 px-2 py-1 rounded">
                                            <span className="text-yellow-500">★</span> {feedback.rating}/5
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 text-xs text-gray-500">
                                        <Clock size={14} />
                                        {new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' }).format(feedback.date)}
                                    </div>
                                </div>
                                <p className="text-gray-800 text-sm leading-relaxed mb-4">"{feedback.text}"</p>
                                <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100/50">
                                    <div>
                                        {feedback.phone ? (
                                            <a href={`tel:${feedback.phone}`} className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800 font-medium bg-blue-50 px-3 py-1.5 rounded-md w-fit">
                                                <Phone size={14} /> {feedback.phone}
                                            </a>
                                        ) : <span className="text-sm text-gray-400 italic">No phone provided</span>}
                                    </div>
                                    {feedback.status === 'unread' ? (
                                        <button onClick={() => markResolved(feedback.id)} className="text-sm bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 px-4 py-1.5 rounded-md font-medium shadow-sm transition-colors">Mark Resolved</button>
                                    ) : (
                                        <span className="text-sm text-green-600 flex items-center gap-1 font-medium bg-green-50 px-3 py-1.5 rounded-md"><CheckCircle size={16} /> Resolved</span>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
