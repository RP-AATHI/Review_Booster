import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { db } from '../../firebase/firebase';
import { collection, query, where, getDocs, addDoc, serverTimestamp } from 'firebase/firestore';
import { Star, Loader2, CheckCircle, Store, Send } from 'lucide-react';

export default function CustomerReview() {
    const { merchantId } = useParams(); // Note: This will actually be the qrLinkSuffix based on our routing
    const [merchant, setMerchant] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Funnel State
    const [step, setStep] = useState('rating'); // rating -> external_redirect OR private_feedback -> coupon
    const [rating, setRating] = useState(0);
    const [hoverRating, setHoverRating] = useState(0);
    const [submitting, setSubmitting] = useState(false);

    // Feedback Data
    const [feedback, setFeedback] = useState({
        issueCategory: 'Food Quality',
        text: '',
        phone: '',
        consent: false
    });

    // Coupon state
    const [couponCode, setCouponCode] = useState(null);

    // 1. Load Merchant Data based on URL suffix
    useEffect(() => {
        async function fetchMerchant() {
            try {
                const q = query(collection(db, 'merchants'), where('qrLinkSuffix', '==', merchantId));
                const querySnapshot = await getDocs(q);

                if (querySnapshot.empty) {
                    // Fallback: check if they passed the actual exact UID
                    const q2 = query(collection(db, 'merchants'), where('__name__', '==', merchantId));
                    const snap2 = await getDocs(q2);
                    if (snap2.empty) {
                        setError("Restaurant not found.");
                        return;
                    }
                    setMerchant({ id: snap2.docs[0].id, ...snap2.docs[0].data() });
                } else {
                    setMerchant({ id: querySnapshot.docs[0].id, ...querySnapshot.docs[0].data() });
                }
            } catch (err) {
                console.error(err);
                setError("Failed to load restaurant data.");
            } finally {
                setLoading(false);
            }
        }

        fetchMerchant();
    }, [merchantId]);

    // 2. Handle Rating Selection
    const handleRatingSubmit = async (selectedRating) => {
        setRating(selectedRating);

        if (selectedRating >= 4) {
            // High rating -> Log scan -> Move to redirect step
            setStep('external_redirect');
            await logScan('google_review', selectedRating);
        } else {
            // Low rating -> Log scan -> Move to private feedback
            setStep('private_feedback');
            await logScan('private_feedback', selectedRating);
        }
    };

    const logScan = async (actionType, selectedRating) => {
        try {
            await addDoc(collection(db, 'scans'), {
                merchantId: merchant.id,
                rating: selectedRating,
                action: actionType,
                timestamp: serverTimestamp()
            });
        } catch (err) {
            console.error("Failed to log scan analytics", err);
        }
    };

    // 3. Handle Private Feedback Submit
    const handleFeedbackSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);

        try {
            // Save feedback
            await addDoc(collection(db, 'feedback'), {
                merchantId: merchant.id,
                rating,
                ...feedback,
                timestamp: serverTimestamp(),
                status: 'unread'
            });

            // Generate coupon code
            await generateCoupon();
            setStep('coupon');

            // Trigger WhatsApp API (Vercel Serverless Function)
            if (merchant.whatsappNumber) {
                fetch('/api/send-whatsapp', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        merchantId: merchant.id,
                        rating: rating,
                        text: feedback.text,
                        issueCategory: feedback.issueCategory,
                        phone: feedback.phone,
                        ownerWhatsApp: merchant.whatsappNumber
                    })
                }).catch(err => console.error("Error calling WhatsApp API:", err));
            }
        } catch (err) {
            console.error(err);
            alert("Failed to send feedback. Please try again.");
        } finally {
            setSubmitting(false);
        }
    };

    // 4. Handle Redirection to Google
    const handleGoogleRedirect = async () => {
        // Generate coupon BEFORE they leave, in case they come back to the tab
        await generateCoupon();

        // In production, this would be the merchant.googleMapsUrl. 
        // Using a placeholder for MVP.
        const targetUrl = merchant.googleMapsUrl || `https://search.google.com/local/writereview?placeid=ChIJN1t_tDeuEmsRUsoyG83frY4`;
        window.open(targetUrl, '_blank');
        setStep('coupon');
    };

    const generateCoupon = async () => {
        try {
            const code = `RB-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
            setCouponCode(code);

            await addDoc(collection(db, 'coupons'), {
                merchantId: merchant.id,
                code: code,
                status: 'issued',
                reason: rating >= 4 ? 'review_click' : 'private_feedback',
                createdAt: serverTimestamp()
            });
        } catch (err) {
            console.error("Failed to generate coupon", err);
        }
    };

    // --------------------------------------------------------------------------
    // UI RENDERERS
    // --------------------------------------------------------------------------

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <Loader2 className="animate-spin text-blue-600 w-12 h-12" />
            </div>
        );
    }

    if (error || !merchant) {
        return (
            <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
                <Store className="w-16 h-16 text-gray-400 mb-4" />
                <h1 className="text-2xl font-bold text-gray-900 mb-2">Oops!</h1>
                <p className="text-gray-600">{error || "This link is no longer active."}</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 font-sans sm:pt-12">
            <div className="max-w-md mx-auto bg-white min-h-screen sm:min-h-[auto] sm:rounded-3xl shadow-xl shadow-gray-200/50 border border-gray-100 overflow-hidden flex flex-col relative">

                {/* Header */}
                <div className="bg-blue-600 px-6 py-8 text-center text-white relative">
                    <div className="absolute top-0 right-0 -mr-10 -mt-10 w-32 h-32 rounded-full bg-white opacity-10 blur-2xl pointer-events-none"></div>
                    <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-3 shadow-md text-blue-600 font-bold text-2xl">
                        {merchant.restaurantName.charAt(0)}
                    </div>
                    <h1 className="text-2xl font-bold">{merchant.restaurantName}</h1>
                    <p className="text-blue-100 mt-1">We value your opinion.</p>
                </div>

                {/* Dynamic Content Area */}
                <div className="flex-1 p-6 flex flex-col justify-center">

                    {/* STEP 1: INITIAL RATING */}
                    {step === 'rating' && (
                        <div className="text-center animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <h2 className="text-xl font-bold text-gray-900 mb-8">How was your experience today?</h2>
                            <div className="flex justify-center gap-2 sm:gap-4 mb-4">
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <button
                                        key={star}
                                        onClick={() => handleRatingSubmit(star)}
                                        onMouseEnter={() => setHoverRating(star)}
                                        onMouseLeave={() => setHoverRating(0)}
                                        className="focus:outline-none transform transition-transform hover:scale-110 active:scale-95"
                                    >
                                        <Star
                                            size={48}
                                            className={`
                        transition-colors duration-200
                        ${(hoverRating || rating) >= star
                                                    ? 'fill-yellow-400 text-yellow-400'
                                                    : 'fill-gray-100 text-gray-300'
                                                }
                      `}
                                        />
                                    </button>
                                ))}
                            </div>
                            <p className="text-gray-500 text-sm mt-6">Tap a star to rate</p>
                        </div>
                    )}

                    {/* STEP 2a: HIGH RATING ROUTE (GOOGLE) */}
                    {step === 'external_redirect' && (
                        <div className="text-center animate-in zoom-in-95 duration-500">
                            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                                <Star size={40} className="text-green-500 fill-current" />
                            </div>
                            <h2 className="text-2xl font-bold text-gray-900 mb-3">Thank you!</h2>
                            <p className="text-gray-600 mb-8 text-lg">
                                We're thrilled you had a {rating}-star experience! It would mean the world to us if you shared it on Google.
                            </p>

                            <button
                                onClick={handleGoogleRedirect}
                                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl shadow-lg shadow-blue-500/30 transition-all hover:scale-[1.02] flex items-center justify-center gap-2 mb-4"
                            >
                                <img src="https://upload.wikimedia.org/wikipedia/commons/5/53/Google_%22G%22_Logo.svg" alt="Google" className="w-6 h-6 bg-white rounded-full p-1" />
                                Review us on Google
                            </button>
                        </div>
                    )}

                    {/* STEP 2b: LOW RATING ROUTE (PRIVATE FEEDBACK) */}
                    {step === 'private_feedback' && (
                        <div className="animate-in slide-in-from-right-8 duration-500">
                            <h2 className="text-xl font-bold text-gray-900 mb-2">We're sorry to hear that.</h2>
                            <p className="text-gray-600 mb-6 text-sm">Please tell us what went wrong so the owner can fix it immediately.</p>

                            <form onSubmit={handleFeedbackSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Issue Category</label>
                                    <select
                                        required
                                        value={feedback.issueCategory}
                                        onChange={e => setFeedback({ ...feedback, issueCategory: e.target.value })}
                                        className="block w-full border-gray-300 rounded-lg py-3 px-3 bg-gray-50 border focus:ring-blue-500 focus:border-blue-500"
                                    >
                                        <option>Food Quality</option>
                                        <option>Service Speed</option>
                                        <option>Staff Politeness</option>
                                        <option>Cleanliness</option>
                                        <option>Other</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Details</label>
                                    <textarea
                                        required
                                        rows={3}
                                        value={feedback.text}
                                        onChange={e => setFeedback({ ...feedback, text: e.target.value })}
                                        className="block w-full border-gray-300 rounded-lg py-3 px-3 bg-gray-50 border focus:ring-blue-500 focus:border-blue-500"
                                        placeholder="Tell us exactly what happened..."
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number (Optional)</label>
                                    <input
                                        type="tel"
                                        value={feedback.phone}
                                        onChange={e => setFeedback({ ...feedback, phone: e.target.value })}
                                        className="block w-full border-gray-300 rounded-lg py-3 px-3 bg-gray-50 border focus:ring-blue-500 focus:border-blue-500"
                                        placeholder="So the manager can reach out"
                                    />
                                </div>

                                <div className="flex items-start pt-2">
                                    <div className="flex items-center h-5">
                                        <input
                                            id="consent"
                                            type="checkbox"
                                            required
                                            checked={feedback.consent}
                                            onChange={e => setFeedback({ ...feedback, consent: e.target.checked })}
                                            className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                        />
                                    </div>
                                    <div className="ml-3 text-sm">
                                        <label htmlFor="consent" className="font-medium text-gray-700">I agree to send this feedback.</label>
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="w-full mt-4 bg-gray-900 hover:bg-black text-white font-bold py-4 rounded-xl transition-all disabled:opacity-70 flex items-center justify-center gap-2"
                                >
                                    {submitting ? <Loader2 className="animate-spin" size={20} /> : <Send size={20} />}
                                    {submitting ? 'Sending to manager...' : 'Submit Feedback'}
                                </button>
                            </form>
                        </div>
                    )}

                    {/* STEP 3: REWARD COUPON */}
                    {step === 'coupon' && (
                        <div className="text-center animate-in zoom-in duration-700">
                            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
                                <CheckCircle size={40} className="text-green-500" />
                            </div>
                            <h2 className="text-2xl font-bold text-gray-900 mb-2">Feedback Received!</h2>
                            <p className="text-gray-600 mb-8">As a token of our appreciation, please show this code to your server on your next visit for a surprise reward.</p>

                            <div className="border-2 border-dashed border-blue-300 bg-blue-50 rounded-2xl p-6 relative overflow-hidden">
                                <div className="absolute top-0 left-0 w-4 h-4 rounded-br-full border-b-2 border-r-2 border-dashed border-blue-300 bg-white"></div>
                                <div className="absolute top-0 right-0 w-4 h-4 rounded-bl-full border-b-2 border-l-2 border-dashed border-blue-300 bg-white"></div>
                                <div className="absolute bottom-0 left-0 w-4 h-4 rounded-tr-full border-t-2 border-r-2 border-dashed border-blue-300 bg-white"></div>
                                <div className="absolute bottom-0 right-0 w-4 h-4 rounded-tl-full border-t-2 border-l-2 border-dashed border-blue-300 bg-white"></div>

                                <p className="text-sm font-bold text-blue-600 uppercase tracking-widest mb-2">Your Reward Code</p>
                                <div className="text-4xl font-black text-gray-900 tracking-wider">
                                    {couponCode || "LOADING..."}
                                </div>
                            </div>

                            <p className="text-xs text-gray-400 mt-6">*Valid at {merchant.restaurantName}. One time use only.</p>
                        </div>
                    )}

                </div>
            </div>
        </div>
    );
}
