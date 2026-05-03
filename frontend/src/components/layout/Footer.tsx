import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Send, Instagram, Twitter, Facebook } from 'lucide-react';
import { GOOGLE_SHEET_URL } from '../../config/constants';
import toast from 'react-hot-toast';

export const Footer: React.FC = () => {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    if (!GOOGLE_SHEET_URL) {
      toast.error('Newsletter not configured yet.');
      return;
    }

    setIsSubmitting(true);
    try {
      const params = new URLSearchParams();
      params.append('timestamp', new Date().toLocaleString());
      params.append('type', 'newsletter');
      params.append('email', email);
      params.append('subject', 'Newsletter Subscription');
      params.append('message', `User subscribed to newsletter: ${email}`);

      await fetch(GOOGLE_SHEET_URL, {
        method: 'POST',
        mode: 'no-cors',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: params.toString(),
      });

      toast.success('Thank you for subscribing!');
      setEmail('');
    } catch (error) {
      console.error('Newsletter error:', error);
      toast.error('Failed to subscribe.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <footer className="bg-surface-100 dark:bg-surface-900 border-t border-surface-200 dark:border-surface-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Brand & Social */}
          <div className="space-y-6">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-9 h-9 bg-gradient-to-br from-primary-500 to-primary-700 rounded-xl flex items-center justify-center">
                <span className="text-white font-bold text-lg">G</span>
              </div>
              <span className="text-xl font-bold text-surface-900 dark:text-white">
                The<span className="gradient-text">Great</span>
              </span>
            </Link>
            <p className="text-sm text-surface-500 dark:text-surface-400">
              Premium products for the modern lifestyle. Quality you can trust, style you'll love.
            </p>
            <div className="flex items-center gap-4">
              <a href="#" className="w-10 h-10 rounded-xl bg-white dark:bg-surface-800 flex items-center justify-center text-surface-400 hover:text-primary-600 dark:hover:text-primary-400 transition-all border border-surface-200 dark:border-surface-700 shadow-sm">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 rounded-xl bg-white dark:bg-surface-800 flex items-center justify-center text-surface-400 hover:text-primary-600 dark:hover:text-primary-400 transition-all border border-surface-200 dark:border-surface-700 shadow-sm">
                <Twitter className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 rounded-xl bg-white dark:bg-surface-800 flex items-center justify-center text-surface-400 hover:text-primary-600 dark:hover:text-primary-400 transition-all border border-surface-200 dark:border-surface-700 shadow-sm">
                <Facebook className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Shop */}
          <div>
            <h4 className="font-semibold text-surface-900 dark:text-white mb-6 uppercase tracking-wider text-xs">Shop</h4>
            <ul className="space-y-4">
              <li><Link to="/products" className="text-sm text-surface-500 dark:text-surface-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">All Products</Link></li>
              <li><Link to="/products?featured=true" className="text-sm text-surface-500 dark:text-surface-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">Featured</Link></li>
              <li><Link to="/products?category=electronics" className="text-sm text-surface-500 dark:text-surface-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">Electronics</Link></li>
              <li><Link to="/products?category=clothing" className="text-sm text-surface-500 dark:text-surface-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">Clothing</Link></li>
            </ul>
          </div>

          {/* Account & Help */}
          <div>
            <h4 className="font-semibold text-surface-900 dark:text-white mb-6 uppercase tracking-wider text-xs">Support</h4>
            <ul className="space-y-4">
              <li><Link to="/profile" className="text-sm text-surface-500 dark:text-surface-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">My Profile</Link></li>
              <li><Link to="/contact" className="text-sm text-surface-500 dark:text-surface-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors font-medium">Contact Us</Link></li>
              <li><span className="text-sm text-surface-500 dark:text-surface-400">help@thegreat.com</span></li>
              <li><span className="text-sm text-surface-500 dark:text-surface-400">1-800-THEGREAT</span></li>
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h4 className="font-semibold text-surface-900 dark:text-white mb-6 uppercase tracking-wider text-xs">Newsletter</h4>
            <p className="text-sm text-surface-500 dark:text-surface-400 mb-4">
              Subscribe to receive updates, access to exclusive deals, and more.
            </p>
            <form onSubmit={handleNewsletterSubmit} className="relative">
              <input
                type="email"
                placeholder="email@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full pl-4 pr-12 py-3 rounded-xl bg-white dark:bg-surface-800 border border-surface-200 dark:border-surface-700 text-sm focus:ring-2 focus:ring-primary-500/50 outline-none transition-all"
              />
              <button
                type="submit"
                disabled={isSubmitting}
                className="absolute right-1.5 top-1.5 w-9 h-9 rounded-lg bg-primary-600 text-white flex items-center justify-center hover:bg-primary-700 transition-colors disabled:opacity-50"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-surface-200 dark:border-surface-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-surface-500 dark:text-surface-400">
            © {new Date().getFullYear()} TheGreat Store. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            <span className="text-sm text-surface-500 dark:text-surface-400 cursor-pointer hover:text-primary-600">Privacy Policy</span>
            <span className="text-sm text-surface-500 dark:text-surface-400 cursor-pointer hover:text-primary-600">Terms of Service</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
