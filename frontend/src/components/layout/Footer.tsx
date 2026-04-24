import React from 'react';
import { Link } from 'react-router-dom';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-surface-100 dark:bg-surface-900 border-t border-surface-200 dark:border-surface-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-1 md:col-span-1">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <div className="w-9 h-9 bg-gradient-to-br from-primary-500 to-primary-700 rounded-xl flex items-center justify-center">
                <span className="text-white font-bold text-lg">G</span>
              </div>
              <span className="text-xl font-bold text-surface-900 dark:text-white">
                The<span className="gradient-text">Great</span>
              </span>
            </Link>
            <p className="text-sm text-surface-500 dark:text-surface-400 mb-4">
              Premium products for the modern lifestyle. Quality you can trust, style you'll love.
            </p>
          </div>

          {/* Shop */}
          <div>
            <h4 className="font-semibold text-surface-900 dark:text-white mb-4">Shop</h4>
            <ul className="space-y-2.5">
              <li><Link to="/products" className="text-sm text-surface-500 dark:text-surface-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">All Products</Link></li>
              <li><Link to="/products?featured=true" className="text-sm text-surface-500 dark:text-surface-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">Featured</Link></li>
              <li><Link to="/products?category=electronics" className="text-sm text-surface-500 dark:text-surface-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">Electronics</Link></li>
              <li><Link to="/products?category=clothing" className="text-sm text-surface-500 dark:text-surface-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">Clothing</Link></li>
            </ul>
          </div>

          {/* Account */}
          <div>
            <h4 className="font-semibold text-surface-900 dark:text-white mb-4">Account</h4>
            <ul className="space-y-2.5">
              <li><Link to="/profile" className="text-sm text-surface-500 dark:text-surface-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">Profile</Link></li>
              <li><Link to="/orders" className="text-sm text-surface-500 dark:text-surface-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">Orders</Link></li>
              <li><Link to="/cart" className="text-sm text-surface-500 dark:text-surface-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">Cart</Link></li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="font-semibold text-surface-900 dark:text-white mb-4">Support</h4>
            <ul className="space-y-2.5">
              <li><span className="text-sm text-surface-500 dark:text-surface-400">help@thegreat.com</span></li>
              <li><span className="text-sm text-surface-500 dark:text-surface-400">1-800-THEGREAT</span></li>
              <li><span className="text-sm text-surface-500 dark:text-surface-400">Mon-Fri 9am-6pm EST</span></li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-surface-200 dark:border-surface-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-surface-500 dark:text-surface-400">
            © {new Date().getFullYear()} TheGreat Store. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            <span className="text-sm text-surface-500 dark:text-surface-400">Privacy Policy</span>
            <span className="text-sm text-surface-500 dark:text-surface-400">Terms of Service</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
