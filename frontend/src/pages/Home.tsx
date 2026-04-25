import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles, Truck, Shield, RotateCcw } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { ProductCardSkeleton, Stars } from '../components/ui/Shared';
import { productsApi } from '../api/products';
import { useQuery } from '@tanstack/react-query';
import { formatPrice } from '../utils/helpers';
import type { Product, Category } from '../types';

export const HomePage: React.FC = () => {
  const { data: featuredData, isLoading: loadingFeatured } = useQuery({
    queryKey: ['products', 'featured'],
    queryFn: () => productsApi.getAll({ featured: true, limit: 8 }),
  });

  const { data: categoriesData } = useQuery({
    queryKey: ['categories'],
    queryFn: () => productsApi.getCategories(),
  });

  const featured: Product[] = featuredData?.data?.data?.products || [];
  const categories: Category[] = categoriesData?.data?.data || [];

  return (
    <div className="page-enter">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-surface-900 via-surface-800 to-primary-900 dark:from-surface-950 dark:via-surface-900 dark:to-primary-950">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iYSIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSIgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBwYXR0ZXJuVHJhbnNmb3JtPSJyb3RhdGUoNDUpIj48cGF0aCBkPSJNLTEwIDMwaDYwdi0yMGgtNjB6IiBmaWxsPSJyZ2JhKDI1NSwgMjU1LCAyNTUsIDAuMDIpIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2EpIi8+PC9zdmc+')] opacity-50" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-24 lg:py-36">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-500/15 text-primary-300 text-sm font-medium mb-6 animate-fade-in">
              <Sparkles className="w-4 h-4" />
              New Collection Available
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-7xl font-black text-white leading-tight mb-6 animate-slide-up">
              Discover
              <span className="block bg-gradient-to-r from-primary-400 to-primary-300 bg-clip-text text-transparent">
                Premium Products
              </span>
            </h1>
            <p className="text-lg sm:text-xl text-surface-300 mb-10 max-w-xl animate-slide-up" style={{ animationDelay: '100ms' }}>
              Curated selection of high-quality products designed for the modern lifestyle.
              Free shipping on orders over $100.
            </p>
            <div className="flex flex-wrap gap-4 animate-slide-up" style={{ animationDelay: '200ms' }}>
              <Link to="/products">
                <Button size="lg">
                  Shop Now <ArrowRight className="w-5 h-5" />
                </Button>
              </Link>
              <Link to="/products?featured=true">
                <Button variant="outline" size="lg" className="border-surface-600 text-white hover:border-primary-400 hover:text-primary-400">
                  View Featured
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Strip */}
      <section className="bg-white dark:bg-surface-900 border-b border-surface-200 dark:border-surface-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { icon: Truck, label: 'Free Shipping', desc: 'On orders over $100' },
              { icon: Shield, label: 'Secure Payments', desc: 'SSL encrypted checkout' },
              { icon: RotateCcw, label: '30-Day Returns', desc: 'Hassle-free returns' },
              { icon: Sparkles, label: 'Top Quality', desc: 'Curated premium products' },
            ].map((benefit) => (
              <div key={benefit.label} className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-primary-500/10 text-primary-600 dark:text-primary-400">
                  <benefit.icon className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-surface-900 dark:text-white">{benefit.label}</p>
                  <p className="text-xs text-surface-500">{benefit.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories Grid */}
      {categories.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold text-surface-900 dark:text-white">Shop by Category</h2>
              <p className="text-surface-500 mt-1">Browse our curated collections</p>
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {categories.map((cat) => (
              <Link
                key={cat.id}
                to={`/products?category=${cat.slug}`}
                className="group relative overflow-hidden rounded-2xl aspect-square hover-lift"
              >
                <img
                  src={cat.image || 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400'}
                  alt={cat.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <h3 className="text-white font-semibold text-sm">{cat.name}</h3>
                  <p className="text-white/70 text-xs">{cat._count?.products || 0} products</p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Featured Products */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-surface-900 dark:text-white">Featured Products</h2>
            <p className="text-surface-500 mt-1">Our top picks for you</p>
          </div>
          <Link to="/products?featured=true" className="text-sm font-medium text-primary-600 dark:text-primary-400 hover:text-primary-700 flex items-center gap-1">
            View All <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {loadingFeatured
            ? Array.from({ length: 4 }).map((_, i) => <ProductCardSkeleton key={i} />)
            : featured.map((product) => (
                <Link
                  key={product.id}
                  to={`/products/${product.id}`}
                  className="glass-card overflow-hidden hover-lift group"
                >
                  <div className="relative overflow-hidden">
                    <img
                      src={product.images[0]?.url || 'https://via.placeholder.com/400'}
                      alt={product.name}
                      className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    {product.compareAtPrice && (
                      <div className="absolute top-3 left-3 px-2.5 py-1 bg-danger-500 text-white text-xs font-bold rounded-lg">
                        -{Math.round(((product.compareAtPrice - product.price) / product.compareAtPrice) * 100)}%
                      </div>
                    )}
                  </div>
                  <div className="p-5">
                    <p className="text-xs text-primary-600 dark:text-primary-400 font-medium mb-1">{product.category?.name}</p>
                    <h3 className="font-semibold text-surface-900 dark:text-white mb-2 line-clamp-1">{product.name}</h3>
                    <div className="flex items-center gap-2 mb-3">
                      <Stars rating={Math.round(product.avgRating)} size={14} />
                      <span className="text-xs text-surface-500">({product.reviewCount})</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-lg font-bold text-surface-900 dark:text-white">{formatPrice(product.price)}</span>
                        {product.compareAtPrice && (
                          <span className="text-sm text-surface-400 line-through">{formatPrice(product.compareAtPrice)}</span>
                        )}
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-tr from-primary-700 to-indigo-900" />
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20" />
        
        <div className="relative max-w-4xl mx-auto px-4 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-white text-xs font-semibold uppercase tracking-wider mb-8 backdrop-blur-md border border-white/20">
            <Sparkles className="w-4 h-4" /> Limited Time Offer
          </div>
          
          <h2 className="text-4xl sm:text-5xl font-black text-white mb-6 tracking-tight">
            Ready to Start Shopping?
          </h2>
          
          <p className="text-xl text-primary-50 mb-10 leading-relaxed max-w-2xl mx-auto opacity-90">
            Join thousands of happy customers. Use code 
            <span className="mx-2 px-3 py-1 bg-white text-primary-700 font-bold rounded-lg shadow-sm">WELCOME15</span> 
            for 15% off your first order!
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/register">
              <Button size="lg" className="bg-white text-black hover:bg-surface-50 shadow-2xl px-10 py-6 text-lg font-bold transition-all transform hover:scale-105">
                Create Free Account <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};
