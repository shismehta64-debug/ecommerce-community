import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getProduce, deleteProduce } from '../../api/farmer';
import { useAuthStore } from '../../store/authStore';
import { useToastStore } from '../../store/toastStore';
import { useCart } from '../../hooks/useCart';
import { 
  Wheat, 
  MapPin, 
  User as UserIcon, 
  ArrowLeft, 
  Edit, 
  Trash, 
  ShoppingCart, 
  Leaf, 
  Calendar,
  CheckCircle,
  AlertTriangle
} from 'lucide-react';
import Badge from '../../components/Badge';

export default function ProduceDetail() {
  const { id } = useParams<{ id: string }>();
  const { user, isAuthenticated } = useAuthStore();
  const queryClient = useQueryClient();
  const addToast = useToastStore((state) => state.addToast);
  const navigate = useNavigate();

  const { addToCart, cartItems } = useCart();
  const [quantity, setQuantity] = useState(1);

  // Fetch produce detail
  const { data: produce, isLoading } = useQuery({
    queryKey: ['farmerProduceItem', id],
    queryFn: () => getProduce(id!),
    enabled: !!id,
  });

  // Delete produce mutation
  const deleteMutation = useMutation({
    mutationFn: () => deleteProduce(id!),
    onSuccess: () => {
      addToast('Produce listing deleted successfully', 'success');
      navigate('/farmer');
    },
    onError: () => {
      addToast('Failed to delete produce listing', 'error');
    },
  });

  const isOwner = user?.role === 'ADMIN' || (produce && user?.id === produce.ownerId);

  const handleAddToCart = async () => {
    if (!produce) return;

    // Check if quantity exceeds stock
    const cartItem = cartItems.find((ci) => ci.itemId === produce.id);
    const currentQty = cartItem?.quantity || 0;

    if (currentQty + quantity > produce.quantityAvailable) {
      addToast(`Cannot add that many. Only ${produce.quantityAvailable - currentQty} more can be added.`, 'error');
      return;
    }

    try {
      await addToCart({
        itemType: 'FARMER_PRODUCE',
        itemId: produce.id,
        quantity,
      });
      addToast(`Added ${quantity} ${produce.unit} of "${produce.cropName}" to cart`, 'success');
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

  if (!produce) {
    return (
      <div className="text-center py-20">
        <h3 className="text-xl font-bold text-slate-800">Produce Listing Not Found</h3>
        <Link to="/farmer" className="mt-4 inline-flex items-center text-primary font-semibold hover:underline">
          <ArrowLeft className="w-4 h-4 mr-1" /> Back to Marketplace
        </Link>
      </div>
    );
  }

  const inStock = produce.quantityAvailable > 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      
      {/* Back Button */}
      <Link to="/farmer" className="inline-flex items-center text-slate-500 hover:text-slate-700 font-semibold mb-6 text-sm">
        <ArrowLeft className="w-4 h-4 mr-1" /> Back to Marketplace
      </Link>

      {/* Produce Detail Panel */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden grid grid-cols-1 md:grid-cols-2 gap-8 p-6 sm:p-8">
        
        {/* Left Side: Images */}
        <div>
          {produce.images && produce.images.length > 0 ? (
            <img
              src={getFullUrl(produce.images[0])}
              alt={produce.cropName}
              className="w-full h-80 sm:h-[450px] object-cover rounded-2xl border border-slate-100 shadow-sm"
            />
          ) : (
            <div className="w-full h-80 sm:h-[450px] bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-center text-slate-300">
              <Wheat className="w-20 h-20" />
            </div>
          )}
        </div>

        {/* Right Side: Details */}
        <div className="flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            
            <div className="flex items-center gap-2">
              <Badge variant="info">{produce.category}</Badge>
              {produce.isOrganic && (
                <Badge variant="success" className="flex items-center gap-0.5">
                  <Leaf className="w-3.5 h-3.5" />
                  Organic
                </Badge>
              )}
            </div>

            <h1 className="text-3xl font-extrabold text-slate-900 leading-tight">{produce.cropName}</h1>
            
            <div className="flex items-center gap-2 border-y border-slate-50 py-4">
              <span className="text-2xl font-bold text-primary">₹{produce.pricePerUnit}</span>
              <span className="text-slate-400 text-sm">/ {produce.unit}</span>
            </div>

            <div className="space-y-3 text-sm text-slate-600">
              {/* Location */}
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-slate-400" />
                <span className="font-semibold text-slate-700">Origin:</span>
                <span>{produce.village}, {produce.city}</span>
              </div>
              
              {/* Harvest Date */}
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-slate-400" />
                <span className="font-semibold text-slate-700">Harvest Date:</span>
                <span>{new Date(produce.harvestDate).toLocaleDateString()}</span>
              </div>

              {/* Stock status */}
              <div className="flex items-center gap-2">
                <span className="font-semibold text-slate-700">Available Stock:</span>
                {inStock ? (
                  <Badge variant="success">{produce.quantityAvailable} {produce.unit} In Stock</Badge>
                ) : (
                  <Badge variant="danger">Out of Stock</Badge>
                )}
              </div>
            </div>
          </div>

          {/* User Grower & Buy Actions */}
          <div className="space-y-4 pt-6 border-t border-slate-50">
            {/* Grower Card */}
            <div className="flex items-center space-x-3 p-3 rounded-xl border border-slate-100">
              <div className="p-2 bg-slate-100 rounded-lg text-slate-500">
                <UserIcon className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Grown By</p>
                <h4 className="text-sm font-bold text-slate-800">{produce.owner?.fullName || 'Local Community Farmer'}</h4>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex flex-col gap-3">
              {isOwner ? (
                <div className="flex gap-2">
                  <Link
                    to={`/farmer/${produce.id}/edit`}
                    className="flex-1 inline-flex justify-center items-center gap-1.5 py-3 px-4 border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 bg-white hover:bg-slate-50 transition-all shadow-sm"
                  >
                    <Edit className="h-4 w-4" />
                    <span>Edit Listing</span>
                  </Link>
                  <button
                    onClick={() => {
                      if (window.confirm('Are you sure you want to delete this produce listing?')) {
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
                      onClick={() => setQuantity(Math.min(produce.quantityAvailable, quantity + 1))}
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
                  <span>This item is currently out of stock. Contact the grower to inquire about upcoming harvests.</span>
                </div>
              )}
            </div>
          </div>

        </div>
      </div>

    </div>
  );
}
