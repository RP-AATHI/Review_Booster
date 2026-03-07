import React from 'react';
import Link from 'next/link';
import { Star, TrendingUp, ShieldCheck, ArrowRight, MessageSquare } from 'lucide-react';

export default function Landing() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      {/* Navigation */}
      <nav className="bg-white sticky top-0 z-50 shadow-sm border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between h-16 items-center">
          <div className="flex items-center gap-2">
            <div className="bg-blue-600 text-white p-2 rounded-lg">
              <Star size={20} className="fill-current" />
            </div>
            <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-700 to-blue-500">
              Review Booster
            </span>
          </div>
          <div className="flex gap-4">
            <Link href="/login" className="text-gray-600 hover:text-gray-900 font-medium px-4 py-2 transition-colors">
              Login
            </Link>
            <Link href="/register" className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-full font-medium shadow-md shadow-blue-500/20 transition-all hover:-translate-y-0.5">
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="flex-grow">
        <div className="relative overflow-hidden bg-white">
          <div className="absolute inset-y-0 h-full w-full pointer-events-none">
            <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 rounded-full bg-blue-50 blur-3xl opacity-50"></div>
            <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 rounded-full bg-blue-100 blur-3xl opacity-50"></div>
          </div>

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-24 relative z-10 text-center">
            <h1 className="text-5xl md:text-6xl font-extrabold text-gray-900 tracking-tight leading-tight mb-6">
              Turn Happy Customers Into <br className="hidden md:block" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-blue-400">
                5-Star Google Reviews
              </span>
            </h1>
            <p className="mt-4 max-w-2xl mx-auto text-xl text-gray-600 mb-10">
              The intelligent QR feedback funnel for restaurants. Route 5-star experiences to Google, catch negative feedback privately, and reward loyalty automatically.
            </p>
            <div className="flex justify-center gap-4">
              <Link href="/register" className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-full font-bold text-lg shadow-lg shadow-blue-500/30 transition-all hover:scale-105">
                Start Free Trial <ArrowRight size={20} />
              </Link>
            </div>
          </div>
        </div>

        {/* Feature Highlights */}
        <div className="bg-gray-50 py-24 border-t border-gray-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold text-gray-900">How It Works</h2>
              <p className="mt-4 text-lg text-gray-600">A seamless experience for your customers, powerful results for your restaurant.</p>
            </div>

            <div className="grid md:grid-cols-3 gap-10">
              <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                <div className="bg-blue-100 w-14 h-14 rounded-xl flex items-center justify-center mb-6 text-blue-600">
                  <Star size={28} />
                </div>
                <h3 className="text-xl font-bold mb-3 text-gray-900">1. Smart Rating Funnel</h3>
                <p className="text-gray-600 leading-relaxed">Customers scan a QR code and rate their experience. 4 and 5-star ratings are instantly prompted to review you on Google.</p>
              </div>

              <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                <div className="bg-blue-100 w-14 h-14 rounded-xl flex items-center justify-center mb-6 text-blue-600">
                  <ShieldCheck size={28} />
                </div>
                <h3 className="text-xl font-bold mb-3 text-gray-900">2. Intercept Bad Reviews</h3>
                <p className="text-gray-600 leading-relaxed">1 to 3-star ratings open a private feedback form instead. The issue is sent straight to your WhatsApp before it hits the internet.</p>
              </div>

              <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                <div className="bg-blue-100 w-14 h-14 rounded-xl flex items-center justify-center mb-6 text-blue-600">
                  <TrendingUp size={28} />
                </div>
                <h3 className="text-xl font-bold mb-3 text-gray-900">3. Automated Rewards</h3>
                <p className="text-gray-600 leading-relaxed">After leaving feedback, the customer receives a unique, customizable coupon code to encourage a return visit.</p>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white py-12 border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4 text-center text-gray-500">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Star size={16} className="text-gray-400" />
            <span className="font-semibold text-gray-900">Review Booster</span>
          </div>
          <p>© 2026 Review Booster Platform. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
