import React, { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import { productsApi } from '../api/products';
import { ProductCardSkeleton, Stars } from '../components/ui/Shared';
import { Button } from '../components/ui/Button';
import { formatPrice, useDebounce } from '../utils/helpers';
import type { Product, Category } from '../types';

export const ProductListing: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [showFilters, setShowFilters] = useState(false);

  const page = Number(searchParams.get('page')) || 1;
  const search = searchParams.get('search') || '';
  const category = searchParams.get('category') || '';
  const sort = searchParams.get('sort') || 'newest';
  const featured = searchParams.get('featured') || '';
  const minPrice = searchParams.get('minPrice') || '';
  const maxPrice = searchParams.get('maxPrice') || '';

  const [localSearch, setLocalSearch] = useState(search);
  const debouncedSearch = useDebounce(localSearch, 400);

  const { data, isLoading } = useQuery({
    queryKey: ['products', { page, search: debouncedSearch, category, sort, featured, minPrice, maxPrice }],
    queryFn: () =>
      productsApi.getAll({
        page,
        limit: 12,
        search: debouncedSearch || undefined,
        category: category || undefined,
        sort,
        featured: featured ? true : undefined,
        minPrice: minPrice ? Number(minPrice) : undefined,
        maxPrice: maxPrice ? Number(maxPrice) : undefined,
      }),
  });

  const { data: categoriesData } = useQuery({
    queryKey: ['categories'],
    queryFn: () => productsApi.getCategories(),
  });

  const products: Product[] = data?.data?.data?.products || [];
  const pagination = data?.data?.data?.pagination;
  const categories: Category[] = categoriesData?.data?.data || [];

  const updateParam = (key: string, value: string) => {
    const newParams = new URLSearchParams(searchParams);
    if (value) {
      newParams.set(key, value);
    } else {
      newParams.delete(key);
    }
    if (key !== 'page') newParams.delete('page');
    setSearchParams(newParams);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 page-enter">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-surface-900 dark:text-white">
            {category ? categories.find((c) => c.slug === category)?.name || 'Products' : featured ? 'Featured Products' : 'All Products'}
          </h1>
          {pagination && (
            <p className="text-sm text-surface-500 mt-1">{pagination.total} products found</p>
          )}
        </div>
        <div className="flex items-center gap-3">
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400" />
            <input
              type="text"
              placeholder="Search..."
              value={localSearch}
              onChange={(e) => setLocalSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white dark:bg-surface-800 border border-surface-200 dark:border-surface-700 text-sm focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 outline-none transition-all"
            />
          </div>
          <select
            value={sort}
            onChange={(e) => updateParam('sort', e.target.value)}
            className="px-4 py-2.5 rounded-xl bg-white dark:bg-surface-800 border border-surface-200 dark:border-surface-700 text-sm focus:ring-2 focus:ring-primary-500/50 outline-none"
          >
            <option value="newest">Newest</option>
            <option value="price_asc">Price: Low to High</option>
            <option value="price_desc">Price: High to Low</option>
            <option value="name">Name A-Z</option>
          </select>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="lg:hidden p-2.5 rounded-xl border border-surface-200 dark:border-surface-700 hover:bg-surface-100 dark:hover:bg-surface-800"
          >
            <SlidersHorizontal className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="flex gap-8">
        {/* Sidebar Filters */}
        <aside className={`${showFilters ? 'block' : 'hidden'} lg:block w-full lg:w-64 shrink-0`}>
          <div className="glass-card p-5 space-y-6 sticky top-24">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-surface-900 dark:text-white">Filters</h3>
              {(category || minPrice || maxPrice) && (
                <button
                  onClick={() => setSearchParams({})}
                  className="text-xs text-primary-600 dark:text-primary-400 hover:underline"
                >
                  Clear all
                </button>
              )}
            </div>

            {/* Categories */}
            <div>
              <h4 className="text-sm font-medium text-surface-700 dark:text-surface-300 mb-3">Category</h4>
              <div className="space-y-2">
                <button
                  onClick={() => updateParam('category', '')}
                  className={`block w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                    !category ? 'bg-primary-500/10 text-primary-600 dark:text-primary-400 font-medium' : 'text-surface-600 dark:text-surface-400 hover:bg-surface-100 dark:hover:bg-surface-800'
                  }`}
                >
                  All Categories
                </button>
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => updateParam('category', cat.slug)}
                    className={`block w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                      category === cat.slug
                        ? 'bg-primary-500/10 text-primary-600 dark:text-primary-400 font-medium'
                        : 'text-surface-600 dark:text-surface-400 hover:bg-surface-100 dark:hover:bg-surface-800'
                    }`}
                  >
                    {cat.name}
                    <span className="text-xs text-surface-400 ml-1">({cat._count?.products})</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Price Range */}
            <div>
              <h4 className="text-sm font-medium text-surface-700 dark:text-surface-300 mb-3">Price Range</h4>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  placeholder="Min"
                  value={minPrice}
                  onChange={(e) => updateParam('minPrice', e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-white dark:bg-surface-800 border border-surface-200 dark:border-surface-700 text-sm outline-none focus:ring-2 focus:ring-primary-500/50"
                />
                <span className="text-surface-400">–</span>
                <input
                  type="number"
                  placeholder="Max"
                  value={maxPrice}
                  onChange={(e) => updateParam('maxPrice', e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-white dark:bg-surface-800 border border-surface-200 dark:border-surface-700 text-sm outline-none focus:ring-2 focus:ring-primary-500/50"
                />
              </div>
            </div>
          </div>
        </aside>

        {/* Product Grid */}
        <div className="flex-1">
          {/* Active Filters */}
          {(category || search || featured) && (
            <div className="flex flex-wrap items-center gap-2 mb-6">
              {search && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary-500/10 text-primary-600 dark:text-primary-400 text-xs font-medium">
                  Search: {search}
                  <button onClick={() => { setLocalSearch(''); updateParam('search', ''); }}>
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
              {category && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary-500/10 text-primary-600 dark:text-primary-400 text-xs font-medium">
                  {categories.find((c) => c.slug === category)?.name}
                  <button onClick={() => updateParam('category', '')}>
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
            {isLoading
              ? Array.from({ length: 6 }).map((_, i) => <ProductCardSkeleton key={i} />)
              : products.map((product) => (
                  <Link
                    key={product.id}
                    to={`/products/${product.id}`}
                    className="glass-card overflow-hidden hover-lift group"
                  >
                    <div className="relative overflow-hidden">
                      <img
                        src={product.images[0]?.url || 'https://placehold.co/400x400/1e293b/94a3b8?text=No+Image'}
                        alt={product.name}
                        className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      {product.compareAtPrice && (
                        <div className="absolute top-3 left-3 px-2.5 py-1 bg-danger-500 text-white text-xs font-bold rounded-lg">
                          -{Math.round(((product.compareAtPrice - product.price) / product.compareAtPrice) * 100)}%
                        </div>
                      )}
                      {product.stock < 5 && product.stock > 0 && (
                        <div className="absolute top-3 right-3 px-2.5 py-1 bg-warning-500 text-white text-xs font-bold rounded-lg">
                          Only {product.stock} left
                        </div>
                      )}
                    </div>
                    <div className="p-5">
                      <p className="text-xs text-primary-600 dark:text-primary-400 font-medium mb-1">
                        {product.category?.name}
                      </p>
                      <h3 className="font-semibold text-surface-900 dark:text-white mb-2 line-clamp-1">
                        {product.name}
                      </h3>
                      <div className="flex items-center gap-2 mb-3">
                        <Stars rating={Math.round(product.avgRating)} size={14} />
                        <span className="text-xs text-surface-500">({product.reviewCount})</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-lg font-bold text-surface-900 dark:text-white">
                          {formatPrice(product.price)}
                        </span>
                        {product.compareAtPrice && (
                          <span className="text-sm text-surface-400 line-through">
                            {formatPrice(product.compareAtPrice)}
                          </span>
                        )}
                      </div>
                    </div>
                  </Link>
                ))}
          </div>

          {/* Empty State */}
          {!isLoading && products.length === 0 && (
            <div className="text-center py-16">
              <p className="text-lg font-medium text-surface-700 dark:text-surface-300 mb-2">No products found</p>
              <p className="text-surface-500 mb-6">Try adjusting your filters or search query</p>
              <Button variant="outline" onClick={() => setSearchParams({})}>Clear Filters</Button>
            </div>
          )}

          {/* Pagination */}
          {pagination && pagination.totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-12">
              {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  onClick={() => updateParam('page', String(p))}
                  className={`w-10 h-10 rounded-xl text-sm font-medium transition-all ${
                    p === pagination.page
                      ? 'bg-primary-600 text-white shadow-lg shadow-primary-600/30'
                      : 'bg-white dark:bg-surface-800 text-surface-700 dark:text-surface-300 hover:bg-surface-100 dark:hover:bg-surface-700 border border-surface-200 dark:border-surface-700'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
