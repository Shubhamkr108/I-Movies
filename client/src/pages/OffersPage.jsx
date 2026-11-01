import React, { useState, useEffect } from 'react';
import { Tag, Copy, Check, Sparkles } from 'lucide-react';
import toast from 'react-hot-toast';
import { offerAPI } from '../services/api';
import { formatDate } from '../utils/helpers';
import { INITIAL_OFFERS } from '../utils/movieData';

export default function OffersPage() {
  const [offers, setOffers] = useState(INITIAL_OFFERS);
  const [copiedCode, setCopiedCode] = useState(null);

  useEffect(() => {
    fetchLiveOffers();
  }, []);

  const fetchLiveOffers = async () => {
    try {
      const { data } = await offerAPI.getAll();
      if (data.success && data.offers?.length > 0) {
        setOffers(data.offers);
      }
    } catch (_) {
      // Keep preloaded offers
    }
  };

  const copyToClipboard = (code) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    toast.success(`Coupon "${code}" copied to clipboard!`);
    setTimeout(() => setCopiedCode(null), 3000);
  };

  return (
    <div className="min-h-screen pt-28 pb-20 px-4 sm:px-6 max-w-7xl mx-auto text-white">
      <div className="mb-10 text-center sm:text-left">
        <h1 className="text-4xl sm:text-5xl font-extrabold font-display mb-2">
          Special <span className="gradient-text">Offers & Discounts</span>
        </h1>
        <p className="text-gray-400 text-sm max-w-xl">
          Apply promotional codes during checkout to enjoy discounts on movie tickets.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {offers.map(offer => (
          <div
            key={offer._id || offer.couponCode}
            className="glass-card rounded-2xl p-4 sm:p-6 border border-white/10 relative overflow-hidden flex flex-col justify-between hover:border-pink-500/30 transition-all group"
          >
            <div className="absolute top-0 right-0 w-28 h-28 bg-gradient-to-bl from-purple-500/10 to-transparent rounded-bl-full" />

            <div>
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-purple-500/15 border border-purple-500/25 flex items-center justify-center text-purple-400">
                  <Tag className="w-6 h-6" />
                </div>
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-pink-500/20 text-pink-300 border border-pink-500/30">
                  {offer.discountType === 'percentage' ? `${offer.discountValue}% OFF` : `₹${offer.discountValue} FLAT OFF`}
                </span>
              </div>

              <h3 className="text-xl font-bold font-display text-white mb-2 group-hover:text-purple-300 transition-colors">
                {offer.title}
              </h3>
              <p className="text-gray-400 text-xs sm:text-sm mb-6 leading-relaxed">
                {offer.description}
              </p>
            </div>

            <div>
              <div className="flex flex-wrap items-center justify-between gap-1 text-xs text-gray-400 mb-3">
                <span>Min order: ₹{offer.minOrderAmount}</span>
                <span>Valid till: {formatDate(offer.expiryDate)}</span>
              </div>

              <div className="flex items-center gap-2">
                <div className="flex-1 py-2.5 px-4 rounded-xl bg-white/5 border border-dashed border-purple-500/40 text-center font-mono font-bold text-purple-300 text-sm tracking-wider">
                  {offer.couponCode}
                </div>
                <button
                  onClick={() => copyToClipboard(offer.couponCode)}
                  className="p-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white transition-colors flex items-center justify-center"
                  title="Copy Code"
                >
                  {copiedCode === offer.couponCode ? <Check className="w-4 h-4 text-green-300" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
