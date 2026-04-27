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
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 page-enter">
      <h1 className="text-2xl sm:text-3xl font-bold text-surface-900 dark:text-white mb-8">Checkout</h1>

      {/* Step Indicator */}
      <div className="flex items-center justify-center gap-4 mb-12">
        {steps.map((s, idx) => (
          <React.Fragment key={s.num}>
            <div className="flex items-center gap-2">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold transition-all ${
                step >= s.num ? 'bg-primary-600 text-white shadow-lg shadow-primary-600/30' : 'bg-surface-200 dark:bg-surface-700 text-surface-500'
              }`}>
                <s.icon className="w-5 h-5" />
              </div>
              <span className={`text-sm font-medium hidden sm:block ${step >= s.num ? 'text-primary-600 dark:text-primary-400' : 'text-surface-500'}`}>
                {s.label}
              </span>
            </div>
            {idx < steps.length - 1 && (
              <div className={`w-16 h-0.5 ${step > s.num ? 'bg-primary-500' : 'bg-surface-200 dark:bg-surface-700'}`} />
            )}
          </React.Fragment>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          {/* Step 1: Address */}
          {step === 1 && (
            <div className="glass-card p-6">
              <h2 className="text-lg font-semibold text-surface-900 dark:text-white mb-6">Shipping Address</h2>
              {addresses.length === 0 ? (
                <p className="text-surface-500">No addresses saved. Please add one from your profile.</p>
              ) : (
                <div className="space-y-3">
                  {addresses.map((addr) => (
                    <label
                      key={addr.id}
                      className={`flex items-start gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                        selectedAddress === addr.id
                          ? 'border-primary-500 bg-primary-500/5'
                          : 'border-surface-200 dark:border-surface-700 hover:border-surface-400'
                      }`}
                    >
                      <input
                        type="radio"
                        name="address"
                        checked={selectedAddress === addr.id}
                        onChange={() => setSelectedAddress(addr.id)}
                        className="mt-1 text-primary-600 focus:ring-primary-500"
                      />
                      <div>
                        <p className="font-medium text-surface-900 dark:text-white">
                          {addr.firstName} {addr.lastName}
                          {addr.isDefault && <span className="ml-2 text-xs text-primary-500">(Default)</span>}
                        </p>
                        <p className="text-sm text-surface-500">{addr.street}</p>
                        <p className="text-sm text-surface-500">{addr.city}, {addr.state} {addr.zipCode}</p>
                      </div>
                    </label>
                  ))}
                </div>
              )}
              <div className="mt-6 flex justify-end">
                <Button onClick={() => setStep(2)}>Continue to Payment</Button>
              </div>
            </div>
          )}

          {/* Step 2: Payment */}
          {step === 2 && (
            <div className="glass-card p-6">
              <h2 className="text-lg font-semibold text-surface-900 dark:text-white mb-6">Payment</h2>
              <div className="p-6 rounded-xl bg-surface-50 dark:bg-surface-800/50 border border-surface-200 dark:border-surface-700 text-center">
                <CreditCard className="w-12 h-12 text-primary-500 mx-auto mb-4" />
                <p className="text-surface-600 dark:text-surface-400 mb-2">
                  Stripe Payment Integration
                </p>
                <p className="text-sm text-surface-500">
                  In production, Stripe Elements would appear here for secure card entry.
                  For demo, click "Place Order" to simulate payment.
                </p>
              </div>
              <div className="mt-6 flex justify-between">
                <Button variant="outline" onClick={() => setStep(1)}>Back</Button>
                <Button onClick={() => setStep(3)}>Review Order</Button>
              </div>
            </div>
          )}

          {/* Step 3: Confirm */}
          {step === 3 && (
            <div className="glass-card p-6">
              <h2 className="text-lg font-semibold text-surface-900 dark:text-white mb-6">Review & Place Order</h2>
              <div className="space-y-4 mb-6">
                {cart.items.map((item) => (
                  <div key={item.id} className="flex items-center gap-4">
                    <img
                      src={item.product.images?.[0]?.url || 'https://placehold.co/60x60/1e293b/94a3b8?text=No+Image'}
                      alt={item.product.name}
                      className="w-14 h-14 object-cover rounded-lg"
                    />
                    <div className="flex-1">
                      <p className="font-medium text-surface-900 dark:text-white text-sm">{item.product.name}</p>
                      <p className="text-xs text-surface-500">Qty: {item.quantity}</p>
                    </div>
                    <p className="font-semibold text-surface-900 dark:text-white">
                      {formatPrice((item.variant?.price || item.product.price) * item.quantity)}
                    </p>
                  </div>
                ))}
              </div>

              {/* Coupon */}
              <div className="flex gap-2 mb-6">
                <Input
                  placeholder="Coupon code"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                />
                <Button variant="outline">Apply</Button>
              </div>

              <div className="flex justify-between">
                <Button variant="outline" onClick={() => setStep(2)}>Back</Button>
                <Button size="lg" onClick={handleCheckout} loading={processing}>
                  Place Order — {formatPrice(total)}
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Summary Sidebar */}
        <div>
          <div className="glass-card p-6 sticky top-24">
            <h3 className="text-lg font-semibold text-surface-900 dark:text-white mb-4">Order Summary</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between"><span className="text-surface-500">Subtotal ({cart.itemCount} items)</span><span>{formatPrice(cart.subtotal)}</span></div>
              <div className="flex justify-between"><span className="text-surface-500">Shipping</span><span>{shippingCost === 0 ? <span className="text-success-500">Free</span> : formatPrice(shippingCost)}</span></div>
              <div className="flex justify-between"><span className="text-surface-500">Tax</span><span>{formatPrice(tax)}</span></div>
              <hr className="border-surface-200 dark:border-surface-700" />
              <div className="flex justify-between text-lg font-bold"><span>Total</span><span>{formatPrice(total)}</span></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
