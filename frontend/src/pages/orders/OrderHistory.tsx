import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { listOrders } from '../../api/cart';
import { Truck, ArrowLeft, Calendar, MapPin, Package, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import Badge from '../../components/Badge';
import { OrderStatus } from '../../types';

export default function OrderHistory() {
  // Fetch orders
  const { data: orders, isLoading } = useQuery({
    queryKey: ['ordersList'],
    queryFn: listOrders,
  });

  const getStatusVariant = (status: OrderStatus) => {
    const variants: Record<OrderStatus, 'default' | 'info' | 'warning' | 'success' | 'danger'> = {
      PENDING: 'warning',
      CONFIRMED: 'info',
      SHIPPED: 'info',
      DELIVERED: 'success',
      CANCELLED: 'danger',
    };
    return variants[status] || 'default';
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 flex flex-col items-center justify-center space-y-4">
        <Loader2 className="h-8 w-8 text-primary animate-spin" />
        <p className="text-slate-500 text-sm">Loading your orders...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      
      {/* Back to Dashboard */}
      <Link to="/dashboard" className="inline-flex items-center text-slate-500 hover:text-slate-700 font-semibold mb-6 text-sm">
        <ArrowLeft className="w-4 h-4 mr-1" /> Back to Dashboard
      </Link>

      <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight mb-8">My Orders</h1>

      {!orders || orders.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-3xl border border-slate-100 shadow-sm">
          <Truck className="h-12 w-12 text-slate-300 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-slate-700">No Orders Placed Yet</h3>
          <p className="text-slate-400 text-sm mt-1">When you buy items from the Farmer Market or Women Store, they will show up here.</p>
          <div className="mt-6 flex justify-center gap-4">
            <Link to="/farmer" className="px-4 py-2 bg-primary text-white rounded-xl text-sm font-semibold hover:bg-indigo-900 shadow">
              Shop Produce
            </Link>
            <Link to="/women" className="px-4 py-2 border border-slate-200 text-slate-700 bg-white rounded-xl text-sm font-semibold hover:bg-slate-50">
              Shop Boutique
            </Link>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => (
            <div key={order.id} className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
              {/* Order Header */}
              <div className="bg-slate-50/50 px-6 py-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-sm">
                <div className="flex flex-wrap items-center gap-4 text-slate-500">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4 text-slate-400" />
                    <span>{new Date(order.createdAt).toLocaleDateString()}</span>
                  </div>
                  <div>
                    Order ID: <span className="font-semibold text-slate-700">{order.id.slice(0, 8).toUpperCase()}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-slate-400 text-xs font-medium">Status:</span>
                  <Badge variant={getStatusVariant(order.status)}>
                    {order.status}
                  </Badge>
                </div>
              </div>

              {/* Order Items */}
              <div className="p-6 divide-y divide-slate-100">
                {order.orderItems?.map((item) => (
                  <div key={item.id} className="py-4 flex items-center justify-between gap-4 text-sm first:pt-0 last:pb-0">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-slate-50 rounded-xl text-slate-400">
                        <Package className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-800 line-clamp-1">{item.itemNameSnapshot}</h4>
                        <p className="text-slate-400 text-xs mt-0.5">
                          {item.itemType.replace('_', ' ')} &bull; Qty: {item.quantity}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="font-bold text-slate-800">₹{item.priceAtPurchase * item.quantity}</span>
                      <p className="text-slate-400 text-[10px] mt-0.5">₹{item.priceAtPurchase} each</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Order Footer summary */}
              <div className="bg-slate-50/20 px-6 py-4 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 text-sm">
                <div className="flex items-start gap-1.5 text-xs text-slate-500 max-w-md">
                  <MapPin className="w-4 h-4 text-slate-400 mt-0.5 flex-shrink-0" />
                  <span>Ship To: {order.shippingAddress}</span>
                </div>
                <div className="text-right flex-shrink-0">
                  <span className="text-slate-400 text-xs font-semibold mr-2">Grand Total Paid:</span>
                  <span className="text-lg font-bold text-primary">₹{order.totalAmount}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

    </div>
  );
}
