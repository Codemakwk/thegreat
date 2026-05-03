import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { MapPin, CreditCard, CheckCircle } from 'lucide-react';
import { addressApi, ordersApi } from '../api/orders';
import { cartApi } from '../api/cart';
import { Button } from '../components/ui/Button';
import { LoadingSpinner } from '../components/ui/Shared';
import { Input } from '../components/ui/Input';
import { formatPrice } from '../utils/helpers';
import toast from 'react-hot-toast';
import type { Address } from '../types';

export const CheckoutPage: React.FC = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [selectedAddress, setSelectedAddress] = useState<string | null>(null);
  const [couponCode, setCouponCode] = useState('');
  const [processing, setProcessing] = useState(false);

  const { data: cartData, isLoading: loadingCart } = useQuery({
    queryKey: ['cart'],
    queryFn: () => cartApi.get(),
  });

  const { data: addressData, isLoading: loadingAddresses } = useQuery({
    queryKey: ['addresses'],
    queryFn: () => addressApi.getAll(),
  });

  const cart = cartData?.data?.data;
  const addresses: Address[] = addressData?.data?.data || [];

  React.useEffect(() => {
    if (addresses.length > 0 && !selectedAddress) {
      const defaultAddr = addresses.find((a) => a.isDefault) || addresses[0];
      setSelectedAddress(defaultAddr.id);
    }
  }, [addresses, selectedAddress]);

  const handleCheckout = async () => {
    if (!selectedAddress) {
      toast.error('Please select a shipping address');
      return;
    }
    setProcessing(true);
    try {
      const response = await ordersApi.checkout({
        shippingAddressId: selectedAddress,
        couponCode: couponCode || undefined,
      });
      const { order } = response.data.data;
      toast.success('Order placed successfully!');
      navigate(`/orders/${order.id}`);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Checkout failed');
    } finally {
      setProcessing(false);
    }
  };

  if (loadingCart || loadingAddresses) return <LoadingSpinner />;

  if (!cart || cart.items.length === 0) {
    navigate('/cart');
    return null;
  }

  const shippingCost = cart.subtotal > 100 ? 0 : 9.99;
  const tax = Math.round(cart.subtotal * 0.08 * 100) / 100;
  const total = cart.subtotal + shippingCost + tax;

  const steps = [
    { num: 1, label: 'Address', icon: MapPin },
    { num: 2, label: 'Payment', icon: CreditCard },
    { num: 3, label: 'Confirm', icon: CheckCircle },
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 page-enter">
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-surface-900 dark:text-white">Checkout</h1>
        <p className="text-surface-500">Complete your purchase securely.</p>
      </div>

      {/* Step Indicator */}
      <div className="flex items-center justify-center mb-12">
        <div className="flex items-center w-full max-w-2xl">
          {steps.map((s, idx) => (
            <React.Fragment key={s.num}>
              <div className="relative flex flex-col items-center">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-300 ${
                  step >= s.num ? 'bg-primary-600 text-white shadow-xl shadow-primary-600/20' : 'bg-surface-100 dark:bg-surface-800 text-surface-400'
                }`}>
                  <s.icon className="w-6 h-6" />
                </div>
                <span className={`absolute -bottom-7 text-xs font-bold whitespace-nowrap uppercase tracking-wider transition-colors ${
                  step >= s.num ? 'text-primary-600 dark:text-primary-400' : 'text-surface-400'
                }`}>
                  {s.label}
                </span>
              </div>
              {idx < steps.length - 1 && (
                <div className="flex-1 mx-4 h-1 rounded-full bg-surface-100 dark:bg-surface-800 overflow-hidden">
                  <div 
                    className="h-full bg-primary-500 transition-all duration-500 ease-out" 
                    style={{ width: step > s.num ? '100%' : '0%' }}
                  />
                </div>
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-4">
        <div className="lg:col-span-2">
          {/* Step 1: Address */}
          {step === 1 && (
            <div className="glass-card p-6 animate-fade-in">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-xl font-bold text-surface-900 dark:text-white">Shipping Address</h2>
                <Link to="/profile" className="text-sm text-primary-600 hover:underline">Manage Addresses</Link>
              </div>
              
              {addresses.length === 0 ? (
                <div className="p-8 text-center bg-surface-50 dark:bg-surface-800/50 rounded-2xl border-2 border-dashed border-surface-200 dark:border-surface-700">
                  <MapPin className="w-12 h-12 text-surface-300 mx-auto mb-4" />
                  <p className="text-surface-500 mb-6">No addresses saved yet.</p>
                  <Link to="/profile"><Button variant="outline">Add New Address</Button></Link>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {addresses.map((addr) => (
                    <label
                      key={addr.id}
                      className={`relative flex flex-col p-5 rounded-2xl border-2 cursor-pointer transition-all ${
                        selectedAddress === addr.id
                          ? 'border-primary-500 bg-primary-500/5 shadow-lg shadow-primary-500/5'
                          : 'border-surface-200 dark:border-surface-700 hover:border-surface-300 dark:hover:border-surface-600 bg-white dark:bg-surface-800/40'
                      }`}
                    >
                      <input
                        type="radio"
                        name="address"
                        checked={selectedAddress === addr.id}
                        onChange={() => setSelectedAddress(addr.id)}
                        className="sr-only"
                      />
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-sm font-bold text-surface-900 dark:text-white uppercase tracking-tight">{addr.label}</span>
                        {selectedAddress === addr.id && (
                          <div className="w-5 h-5 bg-primary-600 rounded-full flex items-center justify-center">
                            <div className="w-2 h-2 bg-white rounded-full" />
                          </div>
                        )}
                      </div>
                      <p className="text-sm font-semibold text-surface-900 dark:text-white">
                        {addr.firstName} {addr.lastName}
                      </p>
                      <p className="text-xs text-surface-500 mt-1 leading-relaxed">
                        {addr.street}<br />
                        {addr.city}, {addr.state} {addr.zipCode}
                      </p>
                    </label>
                  ))}
                </div>
              )}
              
              <div className="mt-8 flex justify-end">
                <Button size="lg" onClick={() => setStep(2)} disabled={!selectedAddress}>
                  Continue to Payment
                </Button>
              </div>
            </div>
          )}

          {/* Step 2: Payment */}
          {step === 2 && (
            <div className="glass-card p-6 animate-fade-in">
              <h2 className="text-xl font-bold text-surface-900 dark:text-white mb-8">Payment Method</h2>
              <div className="p-8 rounded-2xl bg-surface-50 dark:bg-surface-800/50 border border-surface-200 dark:border-surface-700 text-center">
                <div className="w-16 h-16 bg-primary-500/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <CreditCard className="w-8 h-8 text-primary-500" />
                </div>
                <h3 className="text-lg font-bold text-surface-900 dark:text-white mb-2">Secure Payment via Stripe</h3>
                <p className="text-sm text-surface-500 max-w-md mx-auto mb-6">
                  Your payment information is encrypted and never stored on our servers.
                  In this demo, we'll simulate a successful transaction.
                </p>
                <div className="flex items-center justify-center gap-4">
                  {/* Mock card icons */}
                  <div className="w-10 h-6 bg-surface-200 dark:bg-surface-700 rounded shadow-sm" />
                  <div className="w-10 h-6 bg-surface-200 dark:bg-surface-700 rounded shadow-sm" />
                  <div className="w-10 h-6 bg-surface-200 dark:bg-surface-700 rounded shadow-sm" />
                </div>
              </div>
              
              <div className="mt-8 flex justify-between">
                <Button variant="ghost" onClick={() => setStep(1)}>Back to Shipping</Button>
                <Button size="lg" onClick={() => setStep(3)}>Review & Pay</Button>
              </div>
            </div>
          )}

          {/* Step 3: Review */}
          {step === 3 && (
            <div className="glass-card p-6 animate-fade-in">
              <h2 className="text-xl font-bold text-surface-900 dark:text-white mb-8">Review Order</h2>
              
              <div className="space-y-6 mb-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-5 rounded-2xl bg-surface-50 dark:bg-surface-800/40 border border-surface-200 dark:border-surface-700">
                  <div>
                    <p className="text-xs font-bold text-surface-400 uppercase tracking-widest mb-2">Shipping To</p>
                    {addresses.find(a => a.id === selectedAddress) && (
                      <p className="text-sm text-surface-600 dark:text-surface-300">
                        <span className="font-bold">{addresses.find(a => a.id === selectedAddress)?.firstName} {addresses.find(a => a.id === selectedAddress)?.lastName}</span><br />
                        {addresses.find(a => a.id === selectedAddress)?.street}<br />
                        {addresses.find(a => a.id === selectedAddress)?.city}, {addresses.find(a => a.id === selectedAddress)?.state}
                      </p>
                    )}
                  </div>
                  <div>
                    <p className="text-xs font-bold text-surface-400 uppercase tracking-widest mb-2">Payment</p>
                    <div className="flex items-center gap-2 text-sm text-surface-600 dark:text-surface-300">
                      <CreditCard className="w-4 h-4" />
                      <span>Card ending in •••• 4242</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <p className="text-xs font-bold text-surface-400 uppercase tracking-widest">Order Items</p>
                  {cart.items.map((item) => (
                    <div key={item.id} className="flex items-center gap-4">
                      <img
                        src={item.product.images?.[0]?.url || 'https://placehold.co/64x64'}
                        alt=""
                        className="w-14 h-14 object-cover rounded-xl border border-surface-200 dark:border-surface-700"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-surface-900 dark:text-white text-sm truncate">{item.product.name}</p>
                        <p className="text-xs text-surface-500">Quantity: {item.quantity}</p>
                      </div>
                      <p className="font-bold text-surface-900 dark:text-white">
                        {formatPrice((item.variant?.price || item.product.price) * item.quantity)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-between items-center pt-6 border-t border-surface-200 dark:border-surface-700">
                <Button variant="ghost" onClick={() => setStep(2)}>Back</Button>
                <Button size="xl" onClick={handleCheckout} loading={processing} className="px-12 shadow-2xl shadow-primary-500/20">
                  Place Order — {formatPrice(total)}
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Sidebar Summary */}
        <div className="lg:col-span-1">
          <div className="glass-card p-6 sticky top-24">
            <h3 className="text-lg font-bold text-surface-900 dark:text-white mb-6">Order Summary</h3>
            
            <div className="space-y-4 mb-6 text-sm">
              <div className="flex justify-between">
                <span className="text-surface-500">Items ({cart.itemCount})</span>
                <span className="font-semibold text-surface-900 dark:text-white">{formatPrice(cart.subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-surface-500">Shipping</span>
                <span className="font-semibold">
                  {shippingCost === 0 ? <span className="text-success-500">Free</span> : formatPrice(shippingCost)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-surface-500">Estimated Tax</span>
                <span className="font-semibold text-surface-900 dark:text-white">{formatPrice(tax)}</span>
              </div>
              
              <div className="pt-4 mt-4 border-t border-surface-200 dark:border-surface-700">
                <div className="relative">
                  <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400" />
                  <input
                    placeholder="Coupon code"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                    className="w-full pl-10 pr-16 py-2.5 rounded-xl bg-surface-50 dark:bg-surface-800/50 border border-surface-200 dark:border-surface-700 text-sm focus:ring-2 focus:ring-primary-500/50 outline-none"
                  />
                  <button className="absolute right-2 top-1/2 -translate-y-1/2 text-xs font-bold text-primary-600 hover:text-primary-700">Apply</button>
                </div>
              </div>

              <div className="flex justify-between text-xl font-black pt-4 text-surface-900 dark:text-white">
                <span>Total</span>
                <span className="gradient-text">{formatPrice(total)}</span>
              </div>
            </div>
            
            <div className="p-4 rounded-xl bg-primary-500/5 border border-primary-500/10 flex items-start gap-3">
              <Shield className="w-5 h-5 text-primary-500 shrink-0 mt-0.5" />
              <p className="text-[11px] text-surface-600 dark:text-surface-400 leading-relaxed">
                Secure SSL connection. By placing your order, you agree to our Terms of Service and Privacy Policy.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
