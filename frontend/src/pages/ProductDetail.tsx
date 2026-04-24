import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
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
  const [selectedVariant, setSelectedVariant] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [adding, setAdding] = useState(false);

  const { isAuthenticated } = useAuthStore();
  const { incrementCount } = useCartStore();

  const { data, isLoading } = useQuery({
    queryKey: ['product', id],
    queryFn: () => productsApi.getById(id!),
    enabled: !!id,
  });

  const product = data?.data?.data;

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      toast.error('Please sign in to add items to cart');
      return;
    }
    setAdding(true);
    try {
      await cartApi.addItem({
        productId: product!.id,
        variantId: selectedVariant || undefined,
        quantity,
      });
      incrementCount(quantity);
      toast.success('Added to cart!');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to add to cart');
    } finally {
      setAdding(false);
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <Skeleton className="w-full aspect-square rounded-2xl" />
          <div className="space-y-4">
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-10 w-32" />
            <Skeleton className="h-24 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="text-center py-24">
        <h2 className="text-2xl font-bold text-surface-900 dark:text-white mb-4">Product Not Found</h2>
        <Link to="/products"><Button>Browse Products</Button></Link>
      </div>
    );
  }

  const currentPrice = selectedVariant
    ? product.variants.find((v) => v.id === selectedVariant)?.price || product.price
    : product.price;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 page-enter">
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-2 text-sm text-surface-500 mb-8">
        <Link to="/" className="hover:text-primary-600">Home</Link>
        <ChevronRight className="w-4 h-4" />
        <Link to="/products" className="hover:text-primary-600">Products</Link>
        <ChevronRight className="w-4 h-4" />
        <span className="text-surface-900 dark:text-white font-medium">{product.name}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Image Gallery */}
        <div>
          <div className="relative rounded-2xl overflow-hidden bg-surface-100 dark:bg-surface-800 mb-4">
            <img
              src={product.images[selectedImage]?.url || 'https://via.placeholder.com/600'}
              alt={product.name}
              className="w-full aspect-square object-cover"
            />
            {product.compareAtPrice && (
              <div className="absolute top-4 left-4 px-3 py-1.5 bg-danger-500 text-white text-sm font-bold rounded-xl">
                Sale -{Math.round(((product.compareAtPrice - product.price) / product.compareAtPrice) * 100)}%
              </div>
            )}
          </div>
          {product.images.length > 1 && (
            <div className="flex gap-3">
              {product.images.map((img, idx) => (
                <button
                  key={img.id}
                  onClick={() => setSelectedImage(idx)}
                  className={`w-20 h-20 rounded-xl overflow-hidden border-2 transition-all ${
                    idx === selectedImage ? 'border-primary-500 shadow-glow' : 'border-surface-200 dark:border-surface-700'
                  }`}
                >
                  <img src={img.url} alt={img.alt} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Info */}
        <div>
          <Badge variant={product.stock > 0 ? 'success' : 'danger'} className="mb-3">
            {product.stock > 0 ? `In Stock (${product.stock})` : 'Out of Stock'}
          </Badge>

          <h1 className="text-3xl font-bold text-surface-900 dark:text-white mb-2">{product.name}</h1>

          <div className="flex items-center gap-3 mb-4">
            <Stars rating={Math.round(product.avgRating)} size={18} />
            <span className="text-sm text-surface-500">({product.reviewCount} reviews)</span>
          </div>

          <div className="flex items-center gap-3 mb-6">
            <span className="text-3xl font-bold text-surface-900 dark:text-white">{formatPrice(currentPrice)}</span>
            {product.compareAtPrice && (
              <span className="text-xl text-surface-400 line-through">{formatPrice(product.compareAtPrice)}</span>
            )}
          </div>

          <p className="text-surface-600 dark:text-surface-400 mb-8 leading-relaxed">{product.description}</p>

          {/* Variants */}
          {product.variants.length > 0 && (
            <div className="mb-6">
              <h3 className="text-sm font-medium text-surface-700 dark:text-surface-300 mb-3">Options</h3>
              <div className="flex flex-wrap gap-2">
                {product.variants.map((variant) => (
                  <button
                    key={variant.id}
                    onClick={() => setSelectedVariant(variant.id === selectedVariant ? null : variant.id)}
                    className={`px-4 py-2 rounded-xl text-sm font-medium border-2 transition-all ${
                      variant.id === selectedVariant
                        ? 'border-primary-500 bg-primary-500/10 text-primary-600 dark:text-primary-400'
                        : 'border-surface-200 dark:border-surface-700 text-surface-700 dark:text-surface-300 hover:border-surface-400'
                    }`}
                    disabled={variant.stock === 0}
                  >
                    {variant.name}
                    {variant.stock === 0 && ' (Out of stock)'}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Quantity + Add to Cart */}
          <div className="flex items-center gap-4 mb-8">
            <div className="flex items-center border border-surface-200 dark:border-surface-700 rounded-xl">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="p-3 hover:bg-surface-100 dark:hover:bg-surface-800 rounded-l-xl transition-colors"
              >
                <Minus className="w-4 h-4" />
              </button>
              <span className="w-12 text-center font-semibold">{quantity}</span>
              <button
                onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                className="p-3 hover:bg-surface-100 dark:hover:bg-surface-800 rounded-r-xl transition-colors"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
            <Button
              size="lg"
              className="flex-1"
              onClick={handleAddToCart}
              loading={adding}
              disabled={product.stock === 0}
            >
              <ShoppingCart className="w-5 h-5" />
              Add to Cart
            </Button>
            <button className="p-3 rounded-xl border border-surface-200 dark:border-surface-700 hover:bg-danger-500/10 hover:border-danger-400 hover:text-danger-500 transition-all">
              <Heart className="w-5 h-5" />
            </button>
          </div>

          {/* Benefits */}
          <div className="space-y-3 p-5 rounded-2xl bg-surface-50 dark:bg-surface-800/50 border border-surface-200 dark:border-surface-700">
            {[
              { icon: Truck, text: 'Free shipping on orders over $100' },
              { icon: Shield, text: '2-year warranty included' },
              { icon: RotateCcw, text: '30-day return policy' },
            ].map((item) => (
              <div key={item.text} className="flex items-center gap-3 text-sm text-surface-600 dark:text-surface-400">
                <item.icon className="w-4 h-4 text-success-500" />
                {item.text}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Reviews Section */}
      {product.reviews && product.reviews.length > 0 && (
        <section className="mt-16">
          <h2 className="text-2xl font-bold text-surface-900 dark:text-white mb-8">Customer Reviews</h2>
          <div className="space-y-6">
            {product.reviews.map((review) => (
              <div key={review.id} className="glass-card p-6">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-primary-400 to-primary-600 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                      {review.user.firstName.charAt(0)}
                    </div>
                    <div>
                      <p className="font-medium text-surface-900 dark:text-white">
                        {review.user.firstName} {review.user.lastName}
                      </p>
                      <p className="text-xs text-surface-500">{formatDate(review.createdAt)}</p>
                    </div>
                  </div>
                  <Stars rating={review.rating} size={14} />
                </div>
                {review.title && <h4 className="font-semibold text-surface-900 dark:text-white mb-1">{review.title}</h4>}
                {review.comment && <p className="text-surface-600 dark:text-surface-400 text-sm">{review.comment}</p>}
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};
