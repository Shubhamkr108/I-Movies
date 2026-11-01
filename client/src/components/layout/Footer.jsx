import React from 'react';
import { Link } from 'react-router-dom';
import { Film, Mail, Phone, MapPin, Globe, Share2, Heart, Award } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-[#080810] border-t border-purple-900/20 mt-14 sm:mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 sm:py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {/* Brand */}
          <div className="sm:col-span-2 lg:col-span-1">
            <div className="flex items-center gap-2 mb-6">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center">
                <Film className="w-5 h-5 text-white" />
              </div>
              <span className="text-2xl font-bold font-display">
                <span className="text-white">I</span>
                <span className="gradient-text">Movies</span>
              </span>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed mb-6">
              Your premium destination for the ultimate cinema experience. Book tickets, explore movies, and enjoy the magic of cinema.
            </p>
            <div className="flex gap-3">
              {[
                { icon: Globe, label: 'Website' },
                { icon: Share2, label: 'Community' },
                { icon: Heart, label: 'Cinema Club' },
                { icon: Award, label: 'Rewards' },
              ].map(({ icon: Icon, label }, idx) => (
                <div
                  key={idx}
                  className="w-9 h-9 rounded-xl glass flex items-center justify-center text-gray-400 hover:text-purple-400 transition-all hover:scale-110 cursor-pointer"
                  title={label}
                >
                  <Icon className="w-4 h-4" />
                </div>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-semibold font-display mb-6">Quick Links</h4>
            <ul className="space-y-3">
              {[
                { label: 'Movies', to: '/movies' },
                { label: 'Theatres', to: '/theatres' },
                { label: 'Offers & Deals', to: '/offers' },
                { label: 'My Bookings', to: '/my-bookings' },
              ].map(item => (
                <li key={item.label}>
                  <Link to={item.to} className="text-gray-400 hover:text-purple-400 text-sm transition-colors">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Help */}
          <div>
            <h4 className="text-white font-semibold font-display mb-6">Help & Support</h4>
            <ul className="space-y-3 text-sm text-gray-400">
              <li><a href="#" className="hover:text-purple-400 transition-colors">FAQ & Guidelines</a></li>
              <li><a href="#" className="hover:text-purple-400 transition-colors">Terms & Conditions</a></li>
              <li><a href="#" className="hover:text-purple-400 transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-purple-400 transition-colors">Refund & Cancellation</a></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-white font-semibold font-display mb-6">Contact Us</h4>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-purple-400 mt-0.5 shrink-0" />
                <span className="text-gray-400 text-sm">IMovies HQ, Bandra Kurla Complex, Mumbai - 400051</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-purple-400 shrink-0" />
                <span className="text-gray-400 text-sm">1800-121-IMOV (4668)</span>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-purple-400 shrink-0" />
                <span className="text-gray-400 text-sm">support@imovies.com</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/5 mt-10 sm:mt-12 pt-6 sm:pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          <p className="text-gray-500 text-xs sm:text-sm">© 2025 IMovies. All rights reserved. Built with ❤️ for cinema lovers.</p>
          <div className="flex items-center gap-6">
            <span className="text-gray-600 text-xs">v1.0.0</span>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></div>
              <span className="text-gray-500 text-xs">All systems operational</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
