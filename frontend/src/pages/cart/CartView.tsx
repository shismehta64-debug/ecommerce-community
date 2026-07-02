import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../../hooks/useCart';
import { useToastStore } from '../../store/toastStore';
import { Trash2, ShoppingBag, ArrowRight, Wheat, Loader2, ArrowLeft } from 'lucide-react';
import Badge from '../../components/Badge';

export default function CartView() {
  const { cartItems, isLoading, updateQuantity, removeItem, cartItemsCount } = useCart();
  const addToast = useToastStore((state) => state.addToast);
  const navigate = useNavigate();

  const handleQtyChange = async (itemId: string, itemType: string, currentQty: number, change: number, maxQty: number) => {
    const newQty = currentQty + change;
    if (newQty < 1) return;
    if (newQty > maxQty) {
      addToast(`Cannot exceed available stock of ${maxQty}.`, 'error');
      return;
    }

    try {
      await updateQuantity({ itemId, quantity: newQty });
      addToast('Cart updated', 'success');
    } catch (err) {
      addToast('Failed to update quantity', 'error');
    }
  };

  const handleRemove = async (itemId: string) => {
    try {
      await removeItem(itemId);
      addToast('Item removed from cart', 'success');
    } catch (err) {
      addToast('Failed to remove item', 'error');
    }
  };

  // Group items by type
  const farmerItems = cartItems.filter((i) => i.itemType === 'FARMER_PRODUCE');
  const womenItems = cartItems.filter((i) => i.itemType === 'WOMEN_PRODUCT');

  // Compute Total
  const calculateTotal = () => {
    return cartItems.reduce((acc, item) => {
      const price = item.itemType === 'FARMER_PRODUCE'
        ? item.farmerProduce?.pricePerUnit || 0
        : item.womenProduct?.price || 0;
      return acc + price * item.quantity;
    }, 0);
  };

  const getFullUrl = (urlPath?: string) => {
    if (!urlPath) return '';
    if (urlPath.startsWith('http')) return urlPath;
    const base = (import.meta.env.VITE_API_BASE_URL as string) || 'http://localhost:3000';
    return `${base}${urlPath.startsWith('/') ? urlPath : `/${urlPath}`}`;
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 flex flex-col items-center justify-center space-y-4">
        <Loader2 className="h-8 w-8 text-primary animate-spin" />
        <p className="text-slate-500 text-sm">Loading your cart...</p>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center bg-white rounded-3xl border border-slate-100 shadow-sm mt-10">
        <ShoppingBag className="h-16 w-16 text-slate-300 mx-auto mb-4 animate-bounce" />
        <h2 className="text-2xl font-extrabold text-slate-800">Your Cart is Empty</h2>
        <p className="text-slate-500 text-sm mt-2 max-w-md mx-auto">
          Support local community growth by browsing fresh farm produce or artisan products and adding them to your cart.
        </p>
        <div className="mt-8 flex justify-center gap-4">
          <Link
            to="/farmer"
            className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-primary text-white rounded-xl text-sm font-semibold hover:bg-indigo-900 transition-colors shadow-sm"
          >
            <Wheat className="w-4 h-4" />
            <span>Browse Farmers</span>
          </Link>
          <Link
            to="/women"
            className="inline-flex items-center gap-1.5 px-5 py-2.5 border border-slate-200 text-slate-700 bg-white rounded-xl text-sm font-semibold hover:bg-slate-50 transition-colors shadow-sm"
          >
            <ShoppingBag className="w-4 h-4 text-slate-500" />
            <span>Browse Women Store</span>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight mb-8">Shopping Cart</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Cart List */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Farmer Group */}
          {farmerItems.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-lg font-bold text-slate-800 flex items-center gap-1.5">
                <Wheat className="w-5 h-5 text-emerald-600" />
                <span>Farm Fresh Produce</span>
              </h2>
              
              <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden divide-y divide-slate-100">
                {farmerItems.map((item) => {
                  const fp = item.farmerProduce;
                  if (!fp) return null;
                  return (
                    <div key={item.id} className="p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                      <div className="flex items-center space-x-4">
                        {fp.images && fp.images.length > 0 ? (
                          <img
                            src={getFullUrl(fp.images[0])}
                            alt={fp.cropName}
                            className="w-16 h-16 rounded-xl object-cover border border-slate-50"
                          />
                        ) : (
                          <div className="w-16 h-16 bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-center text-slate-300">
                            <Wheat className="w-6 h-6" />
                          </div>
                        )}
                        <div>
                          <h4 className="font-bold text-slate-800 text-sm line-clamp-1">{fp.cropName}</h4>
                          <p className="text-slate-400 text-xs mt-0.5">₹{fp.pricePerUnit} / {fp.unit}</p>
                          <Badge variant="info" className="mt-1.5 text-[10px]">
                            {fp.village}, {fp.city}
                          </Badge>
                        </div>
                      </div>

                      <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto">
                        {/* Quantity Selector */}
                        <div className="flex items-center border border-slate-200 rounded-lg overflow-hidden bg-white">
                          <button
                            onClick={() => handleQtyChange(item.id, item.itemType, item.quantity, -1, fp.quantityAvailable)}
                            className="px-3 py-1 bg-slate-50 hover:bg-slate-100 text-slate-600 transition-colors font-bold"
                          >
                            -
                          </button>
                          <span className="px-3 font-semibold text-slate-700 text-sm">{item.quantity}</span>
                          <button
                            onClick={() => handleQtyChange(item.id, item.itemType, item.quantity, 1, fp.quantityAvailable)}
                            className="px-3 py-1 bg-slate-50 hover:bg-slate-100 text-slate-600 transition-colors font-bold"
                          >
                            +
                          </button>
                        </div>

                        {/* Price & Remove */}
                        <div className="flex items-center space-x-4">
                          <span className="font-bold text-slate-800 text-sm w-16 text-right">
                            ₹{fp.pricePerUnit * item.quantity}
                          </span>
                          <button
                            onClick={() => handleRemove(item.id)}
                            className="p-2 rounded-lg text-slate-400 hover:bg-rose-50 hover:text-rose-500 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Women Entrepreneur Group */}
          {womenItems.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-lg font-bold text-slate-800 flex items-center gap-1.5">
                <ShoppingBag className="w-5 h-5 text-rose-600" />
                <span>Boutique & Handmade Crafts</span>
              </h2>

              <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden divide-y divide-slate-100">
                {womenItems.map((item) => {
                  const wp = item.womenProduct;
                  if (!wp) return null;
                  return (
                    <div key={item.id} className="p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                      <div className="flex items-center space-x-4">
                        {wp.images && wp.images.length > 0 ? (
                          <img
                            src={getFullUrl(wp.images[0])}
                            alt={wp.name}
                            className="w-16 h-16 rounded-xl object-cover border border-slate-55"
                          />
                        ) : (
                          <div className="w-16 h-16 bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-center text-slate-300">
                            <ShoppingBag className="w-6 h-6" />
                          </div>
                        )}
                        <div>
                          <h4 className="font-bold text-slate-800 text-sm line-clamp-1">{wp.name}</h4>
                          <p className="text-slate-400 text-xs mt-0.5">₹{wp.price}</p>
                          <Badge variant="info" className="mt-1.5 text-[10px]">
                            {wp.category.replace('_', ' ')}
                          </Badge>
                        </div>
                      </div>

                      <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto">
                        {/* Quantity Selector */}
                        <div className="flex items-center border border-slate-200 rounded-lg overflow-hidden bg-white">
                          <button
                            onClick={() => handleQtyChange(item.id, item.itemType, item.quantity, -1, wp.stockQuantity)}
                            className="px-3 py-1 bg-slate-50 hover:bg-slate-100 text-slate-600 transition-colors font-bold"
                          >
                            -
                          </button>
                          <span className="px-3 font-semibold text-slate-700 text-sm">{item.quantity}</span>
                          <button
                            onClick={() => handleQtyChange(item.id, item.itemType, item.quantity, 1, wp.stockQuantity)}
                            className="px-3 py-1 bg-slate-50 hover:bg-slate-100 text-slate-600 transition-colors font-bold"
                          >
                            +
                          </button>
                        </div>

                        {/* Price & Remove */}
                        <div className="flex items-center space-x-4">
                          <span className="font-bold text-slate-800 text-sm w-16 text-right">
                            ₹{wp.price * item.quantity}
                          </span>
                          <button
                            onClick={() => handleRemove(item.id)}
                            className="p-2 rounded-lg text-slate-400 hover:bg-rose-50 hover:text-rose-500 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4">
            <h3 className="text-lg font-bold text-slate-800 border-b border-slate-50 pb-2">Order Summary</h3>
            
            <div className="space-y-3 text-sm text-slate-600">
              <div className="flex justify-between">
                <span>Items total ({cartItemsCount})</span>
                <span className="font-semibold text-slate-800">₹{calculateTotal()}</span>
              </div>
              <div className="flex justify-between">
                <span>Delivery Charges</span>
                <span className="text-emerald-600 font-semibold">Free Delivery</span>
              </div>
            </div>

            <div className="border-t border-slate-50 pt-4 flex justify-between font-bold text-base text-slate-900">
              <span>Total Amount</span>
              <span>₹{calculateTotal()}</span>
            </div>

            <Link
              to="/checkout"
              className="w-full inline-flex justify-center items-center gap-1.5 py-3 px-4 bg-primary text-white rounded-xl text-sm font-bold hover:bg-indigo-900 transition-all shadow-md mt-4"
            >
              <span>Proceed to Checkout</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          
          <Link
            to="/farmer"
            className="w-full inline-flex justify-center items-center gap-1.5 py-3 px-4 border border-slate-200 text-slate-700 bg-white rounded-xl text-sm font-semibold hover:bg-slate-50 transition-all shadow-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Continue Shopping</span>
          </Link>
        </div>

      </div>
    </div>
  );
}
