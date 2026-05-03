import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ShoppingCart, Heart, Minus, Plus, ChevronRight, Truck, Shield, RotateCcw } from 'lucide-react';
import { productsApi } from '../api/products';
import { cartApi } from '../api/cart';
import { Button } from '../components/ui/Button';
import { Stars, Skeleton, Badge } from '../components/ui/Shared';
import { useAuthStore } from '../store/authStore';
import { useCartStore } from '../store/cartStore';
import { formatPrice, formatDate } from '../utils/helpers';
import toast from 'react-hot-toast';

export const ProductDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [selectedVariant, setSelectedVariant] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [adding, setAdding] = useState(false);
  const [buyingNow, setBuyingNow] = useState(false);

  const { isAuthenticated } = useAuthStore();
  const { incrementCount } = useCartStore();

  const { data, isLoading, error } = useQuery({
    queryKey: ['product', id],
    queryFn: async () => {
      const response = await productsApi.getById(id!);
      return response.data.data;
    },
    enabled: !!id,
  });

  const product = data;

  const handleAddToCart = async (redirect = false) => {
    if (!isAuthenticated) {
      toast.error('Please sign in to continue');
      navigate('/login');
      return;
    }

    if (redirect) setBuyingNow(true);
    else setAdding(true);

    try {
      await cartApi.addItem({
        productId: product!.id,
        variantId: selectedVariant || undefined,
        quantity,
      });
      incrementCount(quantity);
      
      if (redirect) {
        navigate('/checkout');
      } else {
        toast.success('Added to cart!');
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Action failed');
    } finally {
      setAdding(false);
      setBuyingNow(false);
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-7 flex gap-4">
            <div className="hidden sm:flex flex-col gap-3">
              {[1, 2, 3].map(i => <Skeleton key={i} className="w-16 h-16 rounded-lg" />)}
            </div>
            <Skeleton className="flex-1 aspect-square rounded-2xl" />
          </div>
          <div className="lg:col-span-5 space-y-6">
            <Skeleton className="h-10 w-3/4" />
            <Skeleton className="h-6 w-1/4" />
            <Skeleton className="h-12 w-1/3" />
            <Skeleton className="h-32 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="text-center py-24 px-4">
        <div className="max-w-md mx-auto">
          <h2 className="text-3xl font-bold text-surface-900 dark:text-white mb-4">Oops! Product Not Found</h2>
          <p className="text-surface-500 mb-8">The product you're looking for might have been moved or is currently unavailable.</p>
          <Link to="/products">
            <Button size="lg" variant="primary" className="w-full">
              Continue Shopping
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const currentPrice = selectedVariant
    ? product.variants.find((v) => v.id === selectedVariant)?.price || product.price
    : product.price;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 page-enter">
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-2 text-xs font-medium text-surface-400 mb-6 overflow-hidden whitespace-nowrap">
        <Link to="/" className="hover:text-primary-600 transition-colors">Home</Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <Link to="/products" className="hover:text-primary-600 transition-colors">Products</Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-surface-600 dark:text-surface-300 truncate">{product.name}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
        {/* Left: Image Section */}
        <div className="lg:col-span-7">
          <div className="flex flex-col-reverse sm:flex-row gap-4">
            {/* Thumbnails */}
            {product.images.length > 1 && (
              <div className="flex sm:flex-col gap-3 overflow-x-auto sm:overflow-y-auto max-h-[500px] no-scrollbar">
                {product.images.map((img, idx) => (
                  <button
                    key={img.id}
                    onClick={() => setSelectedImage(idx)}
                    className={`
                      shrink-0 w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden border-2 transition-all
                      ${idx === selectedImage ? 'border-primary-500 ring-2 ring-primary-500/20' : 'border-surface-200 dark:border-surface-800 hover:border-surface-400'}
                    `}
                  >
                    <img src={img.url} alt={img.alt} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
            
            {/* Main Image */}
            <div className="flex-1 relative rounded-2xl overflow-hidden bg-surface-50 dark:bg-surface-900 border border-surface-200 dark:border-surface-800 group">
              <img
                src={product.images[selectedImage]?.url || 'https://placehold.co/800x800/1e293b/94a3b8?text=No+Image'}
                alt={product.name}
                className="w-full aspect-square object-contain transition-transform duration-500 group-hover:scale-105"
              />
              {product.compareAtPrice && (
                <div className="absolute top-4 left-4 px-3 py-1 bg-danger-500 text-white text-xs font-bold rounded-full shadow-lg">
                  -{Math.round(((product.compareAtPrice - product.price) / product.compareAtPrice) * 100)}% OFF
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right: Product Details */}
        <div className="lg:col-span-5 flex flex-col">
          <div className="sticky top-24 space-y-6">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Badge variant="info" className="uppercase tracking-wider px-2">Brand Store</Badge>
                {product.stock < 10 && product.stock > 0 && (
                  <span className="text-xs font-bold text-danger-500 animate-pulse">Only {product.stock} left!</span>
                )}
              </div>
              <h1 className="text-3xl font-extrabold text-surface-900 dark:text-white leading-tight mb-2">
                {product.name}
              </h1>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1.5 px-2 py-0.5 bg-success-500/10 text-success-600 rounded-md">
                  <span className="text-sm font-bold">{product.avgRating.toFixed(1)}</span>
                  <Stars rating={Math.round(product.avgRating)} size={12} />
                </div>
                <span className="text-sm text-surface-400 font-medium">| {product.reviewCount} Ratings</span>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-surface-50 dark:bg-surface-800/50 border border-surface-200 dark:border-surface-700">
              <div className="flex items-baseline gap-3 mb-1">
                <span className="text-4xl font-black text-surface-900 dark:text-white">{formatPrice(currentPrice)}</span>
                {product.compareAtPrice && (
                  <span className="text-lg text-surface-400 line-through font-medium">{formatPrice(product.compareAtPrice)}</span>
                )}
              </div>
              <p className="text-xs text-success-500 font-bold">Inclusive of all taxes</p>
            </div>

            {/* Description */}
            <div className="prose prose-sm dark:prose-invert">
              <h3 className="text-sm font-bold text-surface-900 dark:text-white uppercase tracking-widest mb-2">About this item</h3>
              <p className="text-surface-600 dark:text-surface-400 leading-relaxed line-clamp-4 hover:line-clamp-none cursor-pointer transition-all">
                {product.description}
              </p>
            </div>

            {/* Variants */}
            {product.variants.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-sm font-bold text-surface-900 dark:text-white uppercase tracking-widest">Select Variant</h3>
                <div className="flex flex-wrap gap-2">
                  {product.variants.map((variant) => (
                    <button
                      key={variant.id}
                      onClick={() => setSelectedVariant(variant.id === selectedVariant ? null : variant.id)}
                      className={`
                        min-w-[80px] px-4 py-2 rounded-xl text-sm font-bold border-2 transition-all
                        ${variant.id === selectedVariant
                          ? 'border-primary-500 bg-primary-500/5 text-primary-600 dark:text-primary-400'
                          : 'border-surface-200 dark:border-surface-800 text-surface-600 dark:text-surface-400 hover:border-surface-400'}
                        ${variant.stock === 0 ? 'opacity-50 grayscale cursor-not-allowed' : ''}
                      `}
                      disabled={variant.stock === 0}
                    >
                      {variant.name}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="space-y-4 pt-4 border-t border-surface-100 dark:border-surface-800">
              <div className="flex items-center gap-4">
                <div className="flex items-center bg-surface-100 dark:bg-surface-800 rounded-xl p-1">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="p-2 hover:bg-white dark:hover:bg-surface-700 rounded-lg transition-all shadow-sm"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="w-10 text-center font-bold text-lg">{quantity}</span>
                  <button
                    onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                    className="p-2 hover:bg-white dark:hover:bg-surface-700 rounded-lg transition-all shadow-sm"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                <p className="text-xs text-surface-500 italic">Maximize quantity available: {product.stock}</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Button
                  size="xl"
                  variant="outline"
                  className="w-full border-2 font-bold py-4 h-auto"
                  onClick={() => handleAddToCart(false)}
                  loading={adding}
                  disabled={product.stock === 0 || buyingNow}
                >
                  <ShoppingCart className="w-5 h-5 mr-2" />
                  Add to Cart
                </Button>
                <Button
                  size="xl"
                  variant="primary"
                  className="w-full bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 border-none font-bold py-4 h-auto shadow-lg shadow-orange-500/30"
                  onClick={() => handleAddToCart(true)}
                  loading={buyingNow}
                  disabled={product.stock === 0 || adding}
                >
                  Buy Now
                </Button>
              </div>
              
              <button className="flex items-center justify-center gap-2 w-full text-sm font-semibold text-surface-500 hover:text-danger-500 transition-colors">
                <Heart className="w-4 h-4" />
                Add to Wishlist
              </button>
            </div>

            {/* Delivery/Warranty */}
            <div className="grid grid-cols-3 gap-2">
              {[
                { icon: Truck, title: 'Free Delivery', sub: 'On all orders' },
                { icon: Shield, title: 'Warranty', sub: '2 Year Plan' },
                { icon: RotateCcw, title: 'Easy Returns', sub: '30-Day Window' },
              ].map((item, i) => (
                <div key={i} className="flex flex-col items-center text-center p-3 rounded-xl bg-surface-50 dark:bg-surface-900/50 border border-surface-100 dark:border-surface-800">
                  <item.icon className="w-5 h-5 text-primary-500 mb-2" />
                  <span className="text-[10px] font-bold text-surface-900 dark:text-white uppercase truncate w-full">{item.title}</span>
                  <span className="text-[9px] text-surface-500 truncate w-full">{item.sub}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Product Features / Specs */}
      <section className="mt-16 pt-16 border-t border-surface-100 dark:border-surface-800">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          <div>
            <h2 className="text-2xl font-bold text-surface-900 dark:text-white mb-6">Technical Specifications</h2>
            <div className="space-y-0 rounded-2xl overflow-hidden border border-surface-200 dark:border-surface-800">
              {[
                { label: 'Category', value: product.category.name },
                { label: 'SKU', value: product.sku || 'N/A' },
                { label: 'Stock Status', value: product.stock > 0 ? 'Available' : 'Out of Stock' },
                { label: 'Last Updated', value: formatDate(product.updatedAt) },
              ].map((spec, i) => (
                <div key={i} className={`flex p-4 text-sm ${i % 2 === 0 ? 'bg-surface-50 dark:bg-surface-900/50' : 'bg-white dark:bg-surface-900'}`}>
                  <span className="w-1/3 font-semibold text-surface-500">{spec.label}</span>
                  <span className="w-2/3 text-surface-900 dark:text-white font-medium">{spec.value}</span>
                </div>
              ))}
            </div>
          </div>
          <div>
            <h2 className="text-2xl font-bold text-surface-900 dark:text-white mb-6">Product Details</h2>
            <div className="prose prose-sm dark:prose-invert max-w-none text-surface-600 dark:text-surface-400">
              <p>{product.description}</p>
              <ul className="mt-4 space-y-2">
                <li>Premium quality materials and build</li>
                <li>Designed for maximum durability and comfort</li>
                <li>Full manufacturer support and warranty</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Reviews Section */}
      <section className="mt-16 pt-16 border-t border-surface-100 dark:border-surface-800">
        <div className="flex flex-col md:flex-row items-baseline justify-between gap-4 mb-10">
          <h2 className="text-3xl font-black text-surface-900 dark:text-white">Customer Reviews</h2>
          <div className="flex items-center gap-4 p-4 rounded-2xl bg-primary-500/5 border border-primary-500/20">
            <div className="text-center px-4 border-r border-primary-500/20">
              <div className="text-3xl font-black text-primary-600">{product.avgRating.toFixed(1)}</div>
              <Stars rating={Math.round(product.avgRating)} size={12} />
            </div>
            <div className="text-sm font-medium text-surface-600 dark:text-surface-400">
              Based on {product.reviewCount} verified purchases
            </div>
          </div>
        </div>

        {product.reviews && product.reviews.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {product.reviews.map((review) => (
              <div key={review.id} className="p-6 rounded-2xl bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-800 shadow-sm hover:shadow-md transition-all">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-surface-100 dark:bg-surface-800 rounded-full flex items-center justify-center text-primary-600 text-sm font-bold border border-surface-200 dark:border-surface-700">
                      {review.user.firstName.charAt(0)}
                    </div>
                    <div>
                      <p className="font-bold text-surface-900 dark:text-white text-sm">
                        {review.user.firstName} {review.user.lastName}
                      </p>
                      <p className="text-[10px] text-surface-400 uppercase tracking-tighter">{formatDate(review.createdAt)}</p>
                    </div>
                  </div>
                  <Stars rating={review.rating} size={14} />
                </div>
                {review.title && <h4 className="font-bold text-surface-900 dark:text-white mb-2">{review.title}</h4>}
                {review.comment && <p className="text-surface-600 dark:text-surface-400 text-sm leading-relaxed italic">"{review.comment}"</p>}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 p-8 rounded-3xl bg-surface-50 dark:bg-surface-900/50 border-2 border-dashed border-surface-200 dark:border-surface-800">
            <p className="text-surface-500">No reviews yet. Be the first to share your experience!</p>
          </div>
        )}
      </section>
    </div>
  );
};
