import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../firebase/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { QrCode, Download, Link as LinkIcon, Save, Copy, Check } from 'lucide-react';

export default function QRCodeGenerator() {
    const { user } = useAuth();
    const [merchant, setMerchant] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [copied, setCopied] = useState(false);
    const qrRef = useRef(null);

    // Form state
    const [linkSuffix, setLinkSuffix] = useState('');

    useEffect(() => {
        async function loadMerchantData() {
            if (!user) return;
            try {
                const docRef = doc(db, 'merchants', user.uid);
                const docSnap = await getDoc(docRef);

                if (docSnap.exists()) {
                    const data = docSnap.data();
                    setMerchant(data);
                    // If they already have a custom link, use it, else generate one
                    setLinkSuffix(data.qrLinkSuffix || user.uid.substring(0, 8).toLowerCase());
                }
            } catch (err) {
                console.error("Error loading merchant:", err);
            } finally {
                setLoading(false);
            }
        }
        loadMerchantData();
    }, [user]);

    const qrUrl = `${window.location.origin}/review/${linkSuffix}`;

    // We use an external API for fast SVG generation instead of a heavylib for MVP
    const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=500x500&data=${encodeURIComponent(qrUrl)}&format=svg`;

    const handleSaveSettings = async () => {
        setSaving(true);
        try {
            await setDoc(doc(db, 'merchants', user.uid), {
                qrLinkSuffix: linkSuffix
            }, { merge: true });

            // Also save to qr_codes collection for redundancy/scale tracking
            await setDoc(doc(db, 'qr_codes', linkSuffix), {
                merchantId: user.uid,
                url: qrUrl,
                createdAt: new Date()
            });

        } catch (err) {
            console.error("Error saving QR settings:", err);
        } finally {
            setSaving(false);
        }
    };

    const copyToClipboard = () => {
        navigator.clipboard.writeText(qrUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleDownload = async (format) => {
        try {
            const url = `https://api.qrserver.com/v1/create-qr-code/?size=1000x1000&data=${encodeURIComponent(qrUrl)}&format=${format}`;
            const response = await fetch(url);
            const blob = await response.blob();
            const objectUrl = URL.createObjectURL(blob);

            const link = document.createElement('a');
            link.href = objectUrl;
            link.download = `review-booster-qr-${linkSuffix}.${format}`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(objectUrl);
        } catch (err) {
            console.error("Download failed", err);
        }
    };

    if (loading) {
        return <div className="p-6">Loading QR generator...</div>;
    }

    return (
        <div className="p-6 max-w-5xl mx-auto">
            <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-900">QR Code Generator</h2>
                <p className="text-gray-600">Create, customize, and download the QR code for your restaurant tables.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

                {/* Left Column - Configuration */}
                <div className="space-y-6">
                    <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                        <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2 mb-4">
                            <LinkIcon size={20} className="text-blue-600" />
                            Link Customization
                        </h3>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Your Feedback URL</label>
                                <div className="flex rounded-md shadow-sm">
                                    <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 sm:text-sm">
                                        {window.location.host}/review/
                                    </span>
                                    <input
                                        type="text"
                                        onChange={(e) => setLinkSuffix(e.target.value.replace(/[^a-zA-Z0-9-]/g, '').toLowerCase())}
                                        value={linkSuffix}
                                        className="flex-1 min-w-0 block w-full px-3 py-2 rounded-none rounded-r-md border border-gray-300 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                        placeholder="joes-pizza"
                                    />
                                </div>
                                <p className="mt-1 text-xs text-gray-500">Only letters, numbers, and hyphens allowed.</p>
                            </div>

                            <div className="pt-2">
                                <button
                                    onClick={handleSaveSettings}
                                    disabled={saving}
                                    className="w-full flex justify-center items-center gap-2 bg-gray-900 text-white py-2.5 px-4 rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-70"
                                >
                                    <Save size={18} />
                                    {saving ? 'Saving...' : 'Save Configuration'}
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                        <h3 className="text-lg font-bold text-gray-900 mb-4">How to Use</h3>
                        <ul className="space-y-3 text-sm text-gray-600">
                            <li className="flex items-start">
                                <span className="bg-blue-100 text-blue-700 w-6 h-6 rounded-full flex items-center justify-center font-bold mr-3 shrink-0">1</span>
                                <span>Download the high-resolution QR code (PNG or SVG).</span>
                            </li>
                            <li className="flex items-start">
                                <span className="bg-blue-100 text-blue-700 w-6 h-6 rounded-full flex items-center justify-center font-bold mr-3 shrink-0">2</span>
                                <span>Print it on table tents, receipts, or menu inserts.</span>
                            </li>
                            <li className="flex items-start">
                                <span className="bg-blue-100 text-blue-700 w-6 h-6 rounded-full flex items-center justify-center font-bold mr-3 shrink-0">3</span>
                                <span>Customers scan with their phone camera to start the feedback flow.</span>
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Right Column - Preview & Actions */}
                <div className="bg-white p-8 rounded-xl border border-gray-200 shadow-sm flex flex-col items-center">
                    <h3 className="text-lg font-bold text-gray-900 mb-6 w-full text-center">Live Preview</h3>

                    <div className="bg-white p-4 rounded-2xl shadow-md border border-gray-100 mb-8 w-64 h-64 flex items-center justify-center relative group">
                        <img
                            ref={qrRef}
                            src={qrImageUrl}
                            alt="Restaurant QR Code"
                            className="w-full h-full object-contain"
                        />

                        {/* Hover overlay for quick copy */}
                        <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-xl">
                            <button
                                onClick={copyToClipboard}
                                className="bg-white shadow-lg text-gray-900 px-4 py-2 rounded-full text-sm font-medium flex items-center gap-2 transform translate-y-2 group-hover:translate-y-0 transition-all"
                            >
                                {copied ? <Check size={16} className="text-green-500" /> : <Copy size={16} />}
                                {copied ? 'Copied!' : 'Copy Link'}
                            </button>
                        </div>
                    </div>

                    <div className="w-full grid grid-cols-2 gap-4 mt-auto">
                        <button
                            onClick={() => handleDownload('png')}
                            className="flex items-center justify-center gap-2 py-3 px-4 border-2 border-blue-600 text-blue-700 font-medium rounded-lg hover:bg-blue-50 transition-colors"
                        >
                            <Download size={18} />
                            PNG (Raster)
                        </button>
                        <button
                            onClick={() => handleDownload('svg')}
                            className="flex items-center justify-center gap-2 py-3 px-4 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            <Download size={18} />
                            SVG (Vector)
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
