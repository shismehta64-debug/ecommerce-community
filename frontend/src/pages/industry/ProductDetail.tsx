import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getProduct, deleteProduct } from '../../api/industry';
import { createEnquiry } from '../../api/enquiries';
import { useAuthStore } from '../../store/authStore';
import { useToastStore } from '../../store/toastStore';
import { 
  Building2, 
  ArrowLeft, 
  Edit, 
  Trash, 
  MessageCircle, 
  Package, 
  CheckCircle,
  Loader2
} from 'lucide-react';
import Badge from '../../components/Badge';
import Modal from '../../components/Modal';

export default function ProductDetail() {
  const { productId } = useParams<{ productId: string }>();
  const { user, isAuthenticated } = useAuthStore();
  const queryClient = useQueryClient();
  const addToast = useToastStore((state) => state.addToast);
  const navigate = useNavigate();

  const [isEnquiryOpen, setIsEnquiryOpen] = useState(false);
  const [enquiryMessage, setEnquiryMessage] = useState('');
  const [enquiryPhone, setEnquiryPhone] = useState(user?.phone || '');
  const [isSendingEnquiry, setIsSendingEnquiry] = useState(false);

  // Fetch Product details
  const { data: product, isLoading } = useQuery({
    queryKey: ['product', productId],
    queryFn: () => getProduct(productId!),
    enabled: !!productId,
  });

  // Delete product mutation
  const deleteMutation = useMutation({
    mutationFn: () => deleteProduct(productId!),
    onSuccess: () => {
      addToast('Product deleted successfully', 'success');
      if (product) {
        navigate(`/industry/${product.businessId}`);
      } else {
        navigate('/industry');
      }
    },
    onError: () => {
      addToast('Failed to delete product', 'error');
    },
  });

  const isOwner = user?.role === 'ADMIN' || (product && user?.id === product.business?.ownerId);

  const handleOpenEnquiry = () => {
    if (!isAuthenticated) {
      addToast('Please login to send an enquiry', 'info');
      navigate('/login');
      return;
    }
    setEnquiryMessage(`Hello, I am interested in your product "${product?.name}". Please share details regarding wholesale rates and delivery.`);
    setEnquiryPhone(user?.phone || '');
    setIsEnquiryOpen(true);
  };

  const handleSendEnquiry = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!enquiryPhone) {
      addToast('Contact phone number is required', 'error');
      return;
    }
    try {
      setIsSendingEnquiry(true);
      await createEnquiry({
        listingType: 'INDUSTRY_PRODUCT',
        listingId: productId!,
        message: enquiryMessage,
        contactPhone: enquiryPhone,
      });
      addToast('Enquiry sent successfully to the business owner!', 'success');
      setIsEnquiryOpen(false);
    } catch (error) {
      addToast('Failed to send enquiry', 'error');
    } finally {
      setIsSendingEnquiry(false);
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
        <Link to="/industry" className="mt-4 inline-flex items-center text-primary font-semibold hover:underline">
          <ArrowLeft className="w-4 h-4 mr-1" /> Back to Directory
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      
      {/* Back Button */}
      <Link
        to={`/industry/${product.businessId}`}
        className="inline-flex items-center text-slate-500 hover:text-slate-700 font-semibold mb-6 text-sm"
      >
        <ArrowLeft className="w-4 h-4 mr-1" /> Back to Business
      </Link>

      {/* Product Detail Panel */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden grid grid-cols-1 md:grid-cols-2 gap-8 p-6 sm:p-8">
        
        {/* Left Side: Product Images */}
        <div>
          {product.images && product.images.length > 0 ? (
            <img
              src={getFullUrl(product.images[0])}
              alt={product.name}
              className="w-full h-80 sm:h-[450px] object-cover rounded-2xl border border-slate-100 shadow-sm"
            />
          ) : (
            <div className="w-full h-80 sm:h-[450px] bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-center text-slate-300">
              <Package className="w-20 h-20" />
            </div>
          )}
        </div>

        {/* Right Side: Product Details */}
        <div className="flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <Badge variant="info">{product.category}</Badge>
            
            <h1 className="text-3xl font-extrabold text-slate-900 leading-tight">{product.name}</h1>
            
            <div className="flex items-center gap-2 border-y border-slate-50 py-4">
              <span className="text-2xl font-bold text-primary">{product.priceRange}</span>
              <span className="text-slate-400 text-sm">/ {product.unit}</span>
            </div>

            <div className="space-y-2 text-sm text-slate-600">
              <p>
                <span className="font-semibold text-slate-700">Minimum Order Quantity (MOQ):</span>{' '}
                {product.moq || 'No minimum limit'}
              </p>
              <div className="flex items-center space-x-1">
                <span className="font-semibold text-slate-700">Listing Status:</span>
                {product.isActive ? (
                  <span className="text-emerald-600 font-semibold flex items-center gap-0.5">
                    <CheckCircle className="w-3.5 h-3.5" /> Active
                  </span>
                ) : (
                  <span className="text-rose-600 font-semibold">Inactive</span>
                )}
              </div>
            </div>

            <div className="space-y-2 pt-2">
              <h3 className="font-bold text-slate-800 text-sm">Description</h3>
              <p className="text-slate-600 text-sm leading-relaxed whitespace-pre-wrap">{product.description}</p>
            </div>
          </div>

          {/* Business Link & Action Buttons */}
          <div className="space-y-4 pt-6 border-t border-slate-50">
            <Link
              to={`/industry/${product.businessId}`}
              className="flex items-center space-x-3 p-3 rounded-xl border border-slate-100 hover:bg-slate-50 transition-colors"
            >
              <div className="p-2 bg-slate-100 rounded-lg text-slate-500">
                <Building2 className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Sold By</p>
                <h4 className="text-sm font-bold text-slate-800 hover:text-primary">{product.business?.businessName}</h4>
              </div>
            </Link>

            <div className="flex gap-2">
              {isOwner ? (
                <>
                  <Link
                    to={`/industry/products/${product.id}/edit`}
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
                </>
              ) : (
                <button
                  onClick={handleOpenEnquiry}
                  className="w-full inline-flex justify-center items-center gap-2 py-3.5 px-4 bg-primary text-white rounded-xl text-sm font-bold hover:bg-indigo-900 transition-all shadow"
                >
                  <MessageCircle className="h-4 w-4" />
                  <span>Send Enquiry / Interest</span>
                </button>
              )}
            </div>
          </div>

        </div>
      </div>

      {/* Enquiry Modal */}
      <Modal isOpen={isEnquiryOpen} onClose={() => setIsEnquiryOpen(false)} title="Send Enquiry">
        <form onSubmit={handleSendEnquiry} className="space-y-4">
          <p className="text-xs text-slate-500">
            Sending enquiry regarding <span className="font-semibold">{product.name}</span>. The seller will contact you via Phone or WhatsApp.
          </p>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Your Message</label>
            <textarea
              rows={4}
              value={enquiryMessage}
              onChange={(e) => setEnquiryMessage(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-none"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Contact Phone Number</label>
            <input
              type="text"
              value={enquiryPhone}
              onChange={(e) => setEnquiryPhone(e.target.value)}
              placeholder="Your 10-digit mobile number"
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
              required
            />
          </div>

          <button
            type="submit"
            disabled={isSendingEnquiry}
            className="w-full flex justify-center items-center py-3 px-4 border border-transparent text-sm font-bold rounded-xl text-white bg-primary hover:bg-indigo-900 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow"
          >
            {isSendingEnquiry ? (
              <>
                <Loader2 className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" />
                Sending...
              </>
            ) : (
              'Send Enquiry'
            )}
          </button>
        </form>
      </Modal>

    </div>
  );
}
