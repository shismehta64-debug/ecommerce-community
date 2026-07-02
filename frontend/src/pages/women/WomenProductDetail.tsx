import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getProduct, deleteProduct } from '../../api/women';
import { useAuthStore } from '../../store/authStore';
import { useToastStore } from '../../store/toastStore';
import { useCart } from '../../hooks/useCart';
import { 
  ShoppingBag, 
  MapPin, 
  User as UserIcon, 
  ArrowLeft, 
  Edit, 
  Trash, 
  ShoppingCart, 
  Heart,
  CheckCircle,
  AlertTriangle
} from 'lucide-react';
import Badge from '../../components/Badge';

export default function WomenProductDetail() {
  const { id } = useParams<{ id: string }>();
  const { user, isAuthenticated } = useAuthStore();
  const queryClient = useQueryClient();
  const addToast = useToastStore((state) => state.addToast);
  const navigate = useNavigate();

  const { addToCart, cartItems } = useCart();
  const [quantity, setQuantity] = useState(1);

  // Fetch product detail
  const { data: product, isLoading } = useQuery({
    queryKey: ['womenProductDetail', id],
    queryFn: () => getProduct(id!),
    enabled: !!id,
  });

  // Delete product mutation
  const deleteMutation = useMutation({
    mutationFn: () => deleteProduct(id!),
    onSuccess: () => {
      addToast('Product listing deleted successfully', 'success');
      navigate('/women');
    },
    onError: () => {
      addToast('Failed to delete product', 'error');
    },
  });

  const isOwner = user?.role === 'ADMIN' || (product && user?.id === product.ownerId);

  const handleAddToCart = async () => {
    if (!product) return;

    // Check stock
    const cartItem = cartItems.find((ci) => ci.itemId === product.id);
    const currentQty = cartItem?.quantity || 0;

    if (currentQty + quantity > product.stockQuantity) {
      addToast(`Cannot add that many. Only ${product.stockQuantity - currentQty} items left in stock.`, 'error');
      return;
    }

    try {
      await addToCart({
        itemType: 'WOMEN_PRODUCT',
        itemId: product.id,
        quantity,
      });
      addToast(`Added ${quantity} item(s) of "${product.name}" to cart`, 'success');
    } catch (err: any) {
      const msg = err.response?.data?.error?.message || 'Failed to add to cart. Are you logged in?';
      addToast(msg, 'error');
      if (err.response?.status === 401) {
        navigate('/login');
      }
    }
  };

  const getFullUrl = (urlPath?: string) => {
    if (!urlPath) return '';
    if (urlPath.startsWith('http')) return urlPath;
    const base = (import.meta.env.VITE_API_BASE_URL as string) || 'http://localhost:3000';
    return `${base}${urlPath.startsWith('/') ? urlPath : `/${urlPath}`}`;
  };

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 animate-pulse space-y-6">
        <div className="h-96 bg-slate-100 rounded-3xl" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="text-center py-20">
        <h3 className="text-xl font-bold text-slate-800">Product Not Found</h3>
        <Link to="/women" className="mt-4 inline-flex items-center text-primary font-semibold hover:underline">
          <ArrowLeft className="w-4 h-4 mr-1" /> Back to Store
        </Link>
      </div>
    );
  }

  const inStock = product.stockQuantity > 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      
      {/* Back Button */}
      <Link to="/women" className="inline-flex items-center text-slate-500 hover:text-slate-700 font-semibold mb-6 text-sm">
        <ArrowLeft className="w-4 h-4 mr-1" /> Back to Store
      </Link>

      {/* Product Detail Panel */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden grid grid-cols-1 md:grid-cols-2 gap-8 p-6 sm:p-8">
        
        {/* Left Side: Images */}
        <div>
          {product.images && product.images.length > 0 ? (
            <img
              src={getFullUrl(product.images[0])}
              alt={product.name}
              className="w-full h-80 sm:h-[450px] object-cover rounded-2xl border border-slate-100 shadow-sm"
            />
          ) : (
            <div className="w-full h-80 sm:h-[450px] bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-center text-slate-300">
              <ShoppingBag className="w-20 h-20" />
            </div>
          )}
        </div>

        {/* Right Side: Details */}
        <div className="flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            
            <div className="flex items-center gap-2">
              <Badge variant="info">{product.category.replace('_', ' ')}</Badge>
              <Badge variant="accent" className="flex items-center gap-0.5">
                <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
                Handmade
              </Badge>
            </div>

            <h1 className="text-3xl font-extrabold text-slate-900 leading-tight">{product.name}</h1>
            
            <div className="flex items-center gap-2 border-y border-slate-50 py-4">
              <span className="text-2xl font-bold text-primary">₹{product.price}</span>
            </div>

            <div className="space-y-3 text-sm text-slate-600">
              {/* Location */}
              {product.owner?.city && (
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-slate-400" />
                  <span className="font-semibold text-slate-700">Location:</span>
                  <span>{product.owner.city}, {product.owner.state}</span>
                </div>
              )}

              {/* Stock status */}
              <div className="flex items-center gap-2">
                <span className="font-semibold text-slate-700">Stock Status:</span>
                {inStock ? (
                  <Badge variant="success">{product.stockQuantity} items in stock</Badge>
                ) : (
                  <Badge variant="danger">Out of Stock</Badge>
                )}
              </div>
            </div>

            <div className="space-y-2 pt-2">
              <h3 className="font-bold text-slate-800 text-sm">Product Description</h3>
              <p className="text-slate-600 text-sm leading-relaxed whitespace-pre-wrap">{product.description}</p>
            </div>
          </div>

          {/* User Seller & Buy Actions */}
          <div className="space-y-4 pt-6 border-t border-slate-50">
            {/* Seller Card */}
            <div className="flex items-center space-x-3 p-3 rounded-xl border border-slate-100">
              <div className="p-2 bg-slate-100 rounded-lg text-slate-500">
                <UserIcon className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Created By</p>
                <h4 className="text-sm font-bold text-slate-800">{product.owner?.fullName || 'Local Community Entrepreneur'}</h4>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex flex-col gap-3">
              {isOwner ? (
                <div className="flex gap-2">
                  <Link
                    to={`/women/${product.id}/edit`}
                    className="flex-1 inline-flex justify-center items-center gap-1.5 py-3 px-4 border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 bg-white hover:bg-slate-50 transition-all shadow-sm"
                  >
                    <Edit className="h-4 w-4" />
                    <span>Edit Product</span>
                  </Link>
                  <button
                    onClick={() => {
                      if (window.confirm('Are you sure you want to delete this product listing?')) {
                        deleteMutation.mutate();
                      }
                    }}
                    className="flex-1 inline-flex justify-center items-center gap-1.5 py-3 px-4 border border-rose-100 rounded-xl text-sm font-semibold text-rose-700 bg-rose-50/50 hover:bg-rose-50 transition-all"
                  >
                    <Trash className="h-4 w-4" />
                    <span>Delete</span>
                  </button>
                </div>
              ) : inStock ? (
                <div className="flex sm:flex-row flex-col gap-2">
                  {/* Quantity selector */}
                  <div className="flex items-center border border-slate-200 rounded-xl overflow-hidden bg-white w-fit">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="px-4 py-3 text-slate-500 hover:bg-slate-50 transition-colors font-bold text-lg"
                    >
                      -
                    </button>
                    <span className="px-4 font-bold text-slate-700 text-sm">{quantity}</span>
                    <button
                      onClick={() => setQuantity(Math.min(product.stockQuantity, quantity + 1))}
                      className="px-4 py-3 text-slate-500 hover:bg-slate-50 transition-colors font-bold text-lg"
                    >
                      +
                    </button>
                  </div>
                  
                  {/* Add to Cart button */}
                  <button
                    onClick={handleAddToCart}
                    className="flex-1 inline-flex justify-center items-center gap-2 py-3.5 px-4 bg-primary text-white rounded-xl text-sm font-bold hover:bg-indigo-900 transition-all shadow"
                  >
                    <ShoppingCart className="h-4 w-4" />
                    <span>Add {quantity} to Cart</span>
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-rose-600 bg-rose-50 p-4 rounded-xl text-sm border border-rose-100">
                  <AlertTriangle className="h-5 w-5 flex-shrink-0" />
                  <span>This item is currently out of stock. Contact the entrepreneur to inquire about availability.</span>
                </div>
              )}
            </div>
          </div>

        </div>
      </div>

    </div>
  );
}
