import React from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getBusiness, listProducts, deleteBusiness } from '../../api/industry';
import { useAuthStore } from '../../store/authStore';
import { useToastStore } from '../../store/toastStore';
import { 
  Building2, 
  MapPin, 
  Phone, 
  Mail, 
  MessageSquare, 
  Plus, 
  Edit, 
  Trash, 
  ShieldCheck, 
  ArrowLeft,
  Package
} from 'lucide-react';
import Badge from '../../components/Badge';

export default function BusinessDetail() {
  const { businessId } = useParams<{ businessId: string }>();
  const { user, isAuthenticated } = useAuthStore();
  const queryClient = useQueryClient();
  const addToast = useToastStore((state) => state.addToast);
  const navigate = useNavigate();

  // Fetch Business detail
  const { data: business, isLoading: isBusinessLoading } = useQuery({
    queryKey: ['business', businessId],
    queryFn: () => getBusiness(businessId!),
    enabled: !!businessId,
  });

  // Fetch Products
  const { data: products, isLoading: isProductsLoading } = useQuery({
    queryKey: ['businessProducts', businessId],
    queryFn: () => listProducts(businessId!),
    enabled: !!businessId,
  });

  // Delete Business mutation
  const deleteMutation = useMutation({
    mutationFn: () => deleteBusiness(businessId!),
    onSuccess: () => {
      addToast('Business deleted successfully', 'success');
      navigate('/industry');
    },
    onError: () => {
      addToast('Failed to delete business', 'error');
    },
  });

  const isOwner = user?.role === 'ADMIN' || (business && user?.id === business.ownerId);

  const getFullUrl = (urlPath?: string) => {
    if (!urlPath) return '';
    if (urlPath.startsWith('http')) return urlPath;
    const base = (import.meta.env.VITE_API_BASE_URL as string) || 'http://localhost:3000';
    return `${base}${urlPath.startsWith('/') ? urlPath : `/${urlPath}`}`;
  };

  if (isBusinessLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 animate-pulse space-y-6">
        <div className="h-40 bg-slate-100 rounded-3xl" />
        <div className="h-60 bg-slate-100 rounded-3xl" />
      </div>
    );
  }

  if (!business) {
    return (
      <div className="text-center py-20">
        <h3 className="text-xl font-bold text-slate-800">Business Profile Not Found</h3>
        <Link to="/industry" className="mt-4 inline-flex items-center text-primary font-semibold hover:underline">
          <ArrowLeft className="w-4 h-4 mr-1" /> Back to Directory
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      
      {/* Back Button */}
      <Link to="/industry" className="inline-flex items-center text-slate-500 hover:text-slate-700 font-semibold mb-6 text-sm">
        <ArrowLeft className="w-4 h-4 mr-1" /> Back to Directory
      </Link>

      {/* Main Details Banner */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 sm:p-8 flex flex-col md:flex-row md:items-start justify-between gap-6 mb-8">
        
        <div className="flex flex-col sm:flex-row items-center sm:items-start space-x-0 sm:space-x-6 gap-4">
          {business.logoUrl ? (
            <img
              src={getFullUrl(business.logoUrl)}
              alt="Logo"
              className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl object-cover border border-slate-100 shadow-sm"
            />
          ) : (
            <div className="p-6 bg-slate-50 border border-slate-100 rounded-2xl text-slate-400">
              <Building2 className="w-12 h-12" />
            </div>
          )}
          
          <div className="text-center sm:text-left space-y-2">
            <div className="flex flex-col sm:flex-row items-center gap-2">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">{business.businessName}</h1>
              {business.isVerified && (
                <Badge variant="success" className="flex items-center gap-0.5">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Verified
                </Badge>
              )}
            </div>
            
            <Badge variant="info">{business.segment.replace('_', ' ')}</Badge>
            
            <div className="flex items-center justify-center sm:justify-start gap-1 text-slate-500 text-sm">
              <MapPin className="w-4 h-4 text-slate-400" />
              <span>{business.address}, {business.city}, {business.state}</span>
            </div>

            {business.gstNumber && (
              <p className="text-xs text-slate-400 font-medium">GSTIN: {business.gstNumber}</p>
            )}
          </div>
        </div>

        {/* Action Controls for owner / Admin */}
        {isOwner && (
          <div className="flex sm:flex-row flex-col gap-2 w-full md:w-auto">
            <Link
              to={`/industry/${business.id}/edit`}
              className="inline-flex justify-center items-center gap-1.5 px-4 py-2 border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 bg-white hover:bg-slate-50 transition-all"
            >
              <Edit className="h-4 w-4" />
              <span>Edit Profile</span>
            </Link>
            <button
              onClick={() => {
                if (window.confirm('Are you sure you want to delete this business profile? This will also remove all listed products.')) {
                  deleteMutation.mutate();
                }
              }}
              className="inline-flex justify-center items-center gap-1.5 px-4 py-2 border border-rose-100 rounded-xl text-sm font-semibold text-rose-700 bg-rose-50/50 hover:bg-rose-50 transition-all"
            >
              <Trash className="h-4 w-4" />
              <span>Delete</span>
            </button>
          </div>
        )}
      </div>

      {/* Grid: Description & Contacts, and Products List */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Side: Description & Contacts */}
        <div className="space-y-6 lg:col-span-1">
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4">
            <h2 className="text-lg font-bold text-slate-800 border-b border-slate-50 pb-2">About Business</h2>
            <p className="text-slate-600 text-sm leading-relaxed whitespace-pre-wrap">{business.description}</p>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4">
            <h2 className="text-lg font-bold text-slate-800 border-b border-slate-50 pb-2">Contact Details</h2>
            <div className="space-y-3 text-sm text-slate-600">
              <a href={`tel:${business.contactPhone}`} className="flex items-center gap-2 hover:text-primary transition-colors">
                <Phone className="w-4 h-4 text-slate-400" />
                <span>Call: {business.contactPhone}</span>
              </a>
              {business.contactEmail && (
                <a href={`mailto:${business.contactEmail}`} className="flex items-center gap-2 hover:text-primary transition-colors">
                  <Mail className="w-4 h-4 text-slate-400" />
                  <span className="truncate">{business.contactEmail}</span>
                </a>
              )}
              {business.whatsappNumber && (
                <a
                  href={`https://wa.me/91${business.whatsappNumber}`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-2 text-emerald-600 hover:text-emerald-700 font-semibold"
                >
                  <MessageSquare className="w-4 h-4 text-emerald-500" />
                  <span>WhatsApp: {business.whatsappNumber}</span>
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Right Side: Products Catalog */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-slate-800">Products Catalog</h2>
            {isOwner && (
              <Link
                to={`/industry/${business.id}/products/new`}
                className="inline-flex items-center gap-1 px-4 py-2 bg-primary text-white rounded-xl text-sm font-semibold hover:bg-indigo-900 transition-colors shadow-sm"
              >
                <Plus className="h-4 w-4" />
                <span>Add Product</span>
              </Link>
            )}
          </div>

          {isProductsLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="h-40 bg-slate-100 rounded-3xl animate-pulse" />
              <div className="h-40 bg-slate-100 rounded-3xl animate-pulse" />
            </div>
          ) : !products || products.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-3xl border border-slate-100 shadow-sm">
              <Package className="h-10 w-10 text-slate-300 mx-auto mb-2" />
              <p className="text-slate-400 text-sm">No products listed by this business yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {products.map((product) => (
                <Link
                  key={product.id}
                  to={`/industry/products/${product.id}`}
                  className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all flex flex-col justify-between group"
                >
                  <div>
                    {product.images && product.images.length > 0 ? (
                      <img
                        src={getFullUrl(product.images[0])}
                        alt={product.name}
                        className="w-full h-32 object-cover rounded-2xl mb-4 border border-slate-50"
                      />
                    ) : (
                      <div className="w-full h-32 bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-center text-slate-300 mb-4">
                        <Package className="w-8 h-8" />
                      </div>
                    )}
                    <h3 className="font-bold text-slate-800 text-base line-clamp-1 group-hover:text-primary transition-colors">
                      {product.name}
                    </h3>
                    <p className="text-slate-500 text-xs mt-1">{product.category}</p>
                    <p className="text-slate-600 text-sm mt-2 line-clamp-2 leading-relaxed">{product.description}</p>
                  </div>

                  <div className="mt-4 pt-4 border-t border-slate-50 flex items-center justify-between text-xs">
                    <span className="font-semibold text-primary">{product.priceRange}</span>
                    <span className="text-slate-400 font-medium">MOQ: {product.moq || 'N/A'}</span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
