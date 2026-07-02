import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate, Link } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { checkout } from '../../api/cart';
import { useCart } from '../../hooks/useCart';
import { useToastStore } from '../../store/toastStore';
import { ArrowLeft, Loader2, CreditCard, ShieldCheck } from 'lucide-react';

const checkoutSchema = z.object({
  shippingAddress: z.string().min(10, 'Full shipping address must be at least 10 characters'),
});

type CheckoutSchemaType = z.infer<typeof checkoutSchema>;

export default function CheckoutView() {
  const { cartItems, cartItemsCount, refetch } = useCart();
  const queryClient = useQueryClient();
  const addToast = useToastStore((state) => state.addToast);
  const navigate = useNavigate();

  const {
    register: formRegister,
    handleSubmit,
    formState: { errors },
  } = useForm<CheckoutSchemaType>({
    resolver: zodResolver(checkoutSchema),
  });

  const calculateTotal = () => {
    return cartItems.reduce((acc, item) => {
      const price = item.itemType === 'FARMER_PRODUCE'
        ? item.farmerProduce?.pricePerUnit || 0
        : item.womenProduct?.price || 0;
      return acc + price * item.quantity;
    }, 0);
  };

  const mutation = useMutation({
    mutationFn: (data: CheckoutSchemaType) => checkout(data.shippingAddress),
    onSuccess: (result) => {
      addToast('Order placed successfully!', 'success');
      // Invalidate queries to refresh cart count
      queryClient.invalidateQueries({ queryKey: ['cart'] });
      refetch();
      navigate('/orders');
    },
    onError: (error: any) => {
      const msg = error.response?.data?.error?.message || 'Failed to checkout. Check item stock.';
      addToast(msg, 'error');
    },
  });

  const onSubmit = (data: CheckoutSchemaType) => {
    mutation.mutate(data);
  };

  if (cartItems.length === 0) {
    return (
      <div className="text-center py-20">
        <h3 className="text-xl font-bold text-slate-800">Your cart is empty</h3>
        <Link to="/farmer" className="mt-4 inline-flex items-center text-primary font-semibold hover:underline">
          Go Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      
      {/* Back Button */}
      <Link to="/cart" className="inline-flex items-center text-slate-500 hover:text-slate-700 font-semibold mb-6 text-sm">
        <ArrowLeft className="w-4 h-4 mr-1" /> Back to Cart
      </Link>

      <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight mb-8">Checkout</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Shipping Form */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-100 shadow-sm">
            <h2 className="text-lg font-bold text-slate-800 border-b border-slate-50 pb-2 mb-6">Delivery Address</h2>
            
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">
                  Full Address (with LandMark & Pincode)
                </label>
                <textarea
                  rows={4}
                  placeholder="e.g., 204, Shreeji Apartment, Opposite Joggers Park, Adajan, Surat - 395009"
                  {...formRegister('shippingAddress')}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
                />
                {errors.shippingAddress && (
                  <p className="mt-1 text-xs text-rose-500 font-medium">{errors.shippingAddress.message}</p>
                )}
              </div>

              {/* Payment Info Box (Stubbed) */}
              <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 flex items-start space-x-3 mt-6">
                <CreditCard className="h-5 w-5 text-indigo-500 mt-0.5" />
                <div>
                  <h4 className="text-sm font-bold text-slate-800">Cash on Delivery (COD)</h4>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                    Currently supporting Cash on Delivery (COD) for community products. Order will be confirmed immediately.
                  </p>
                </div>
              </div>

              <button
                type="submit"
                disabled={mutation.isPending}
                className="w-full flex justify-center items-center py-3.5 px-4 border border-transparent text-sm font-bold rounded-xl text-white bg-primary hover:bg-indigo-900 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md mt-6"
              >
                {mutation.isPending ? (
                  <>
                    <Loader2 className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" />
                    Processing Order...
                  </>
                ) : (
                  <>
                    <ShieldCheck className="mr-2 h-4 w-4" />
                    Place Order (COD) — ₹{calculateTotal()}
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Order Items Review */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4">
            <h3 className="text-lg font-bold text-slate-800 border-b border-slate-50 pb-2">Review Order Items</h3>
            
            <div className="divide-y divide-slate-50 overflow-y-auto max-h-[40vh] pr-2">
              {cartItems.map((item) => {
                const name = item.itemType === 'FARMER_PRODUCE' ? item.farmerProduce?.cropName : item.womenProduct?.name;
                const price = item.itemType === 'FARMER_PRODUCE' ? item.farmerProduce?.pricePerUnit : item.womenProduct?.price;
                return (
                  <div key={item.id} className="py-3 flex items-center justify-between text-xs gap-4">
                    <div className="truncate">
                      <span className="font-bold text-slate-800 line-clamp-1">{name}</span>
                      <span className="text-slate-400">Qty: {item.quantity}</span>
                    </div>
                    <span className="font-semibold text-slate-700 flex-shrink-0">₹{(price || 0) * item.quantity}</span>
                  </div>
                );
              })}
            </div>

            <div className="border-t border-slate-50 pt-4 flex justify-between font-bold text-base text-slate-900">
              <span>Grand Total</span>
              <span>₹{calculateTotal()}</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
