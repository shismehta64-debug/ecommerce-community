import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getService, deleteService } from '../../api/socialWork';
import { createEnquiry } from '../../api/enquiries';
import { useAuthStore } from '../../store/authStore';
import { useToastStore } from '../../store/toastStore';
import { 
  HeartHandshake, 
  MapPin, 
  User as UserIcon, 
  ArrowLeft, 
  Edit, 
  Trash, 
  MessageCircle, 
  Clock,
  Loader2,
  CheckCircle2
} from 'lucide-react';
import Badge from '../../components/Badge';
import Modal from '../../components/Modal';

export default function ServiceDetail() {
  const { id } = useParams<{ id: string }>();
  const { user, isAuthenticated } = useAuthStore();
  const queryClient = useQueryClient();
  const addToast = useToastStore((state) => state.addToast);
  const navigate = useNavigate();

  const [isEnquiryOpen, setIsEnquiryOpen] = useState(false);
  const [enquiryMessage, setEnquiryMessage] = useState('');
  const [enquiryPhone, setEnquiryPhone] = useState(user?.phone || '');
  const [isSendingEnquiry, setIsSendingEnquiry] = useState(false);

  // Fetch service detail
  const { data: service, isLoading } = useQuery({
    queryKey: ['socialServiceItem', id],
    queryFn: () => getService(id!),
    enabled: !!id,
  });

  // Delete service mutation
  const deleteMutation = useMutation({
    mutationFn: () => deleteService(id!),
    onSuccess: () => {
      addToast('Social service listing deleted', 'success');
      navigate('/social-work');
    },
    onError: () => {
      addToast('Failed to delete social service listing', 'error');
    },
  });

  const isOwner = user?.role === 'ADMIN' || (service && user?.id === service.ownerId);

  const handleOpenEnquiry = () => {
    if (!isAuthenticated) {
      addToast('Please login to contact the service provider', 'info');
      navigate('/login');
      return;
    }
    setEnquiryMessage(`Hello, I am interested in your free community service "${service?.serviceName}". Please share details regarding how to register or participate.`);
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
        listingType: 'SOCIAL_SERVICE',
        listingId: id!,
        message: enquiryMessage,
        contactPhone: enquiryPhone,
      });
      addToast('Enquiry sent successfully to the service provider!', 'success');
      setIsEnquiryOpen(false);
    } catch (error) {
      addToast('Failed to send enquiry', 'error');
    } finally {
      setIsSendingEnquiry(false);
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 animate-pulse space-y-6">
        <div className="h-60 bg-slate-100 rounded-3xl" />
      </div>
    );
  }

  if (!service) {
    return (
      <div className="text-center py-20">
        <h3 className="text-xl font-bold text-slate-800">Social Service Not Found</h3>
        <Link to="/social-work" className="mt-4 inline-flex items-center text-primary font-semibold hover:underline">
          <ArrowLeft className="w-4 h-4 mr-1" /> Back to Services
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      
      {/* Back Button */}
      <Link to="/social-work" className="inline-flex items-center text-slate-500 hover:text-slate-700 font-semibold mb-6 text-sm">
        <ArrowLeft className="w-4 h-4 mr-1" /> Back to Services
      </Link>

      {/* Main Card */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden p-6 sm:p-8 space-y-6">
        
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 border-b border-slate-55 pb-6">
          <div className="space-y-3">
            <div className="flex items-center gap-2 flex-wrap">
              <Badge variant="info">{service.category.replace('_', ' ')}</Badge>
              <Badge variant={service.providerType === 'NGO' ? 'success' : 'default'}>
                {service.providerType}
              </Badge>
              {service.isActive && (
                <span className="text-xs text-emerald-600 font-semibold flex items-center gap-0.5 ml-2">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Active
                </span>
              )}
            </div>
            
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 leading-tight">
              {service.serviceName}
            </h1>
            
            <div className="flex items-center gap-1.5 text-slate-500 text-sm">
              <MapPin className="w-4 h-4 text-slate-400" />
              <span>{service.address}, {service.city}</span>
            </div>
          </div>

          {/* Edit / Delete for Owner */}
          {isOwner && (
            <div className="flex gap-2">
              <Link
                to={`/social-work/${service.id}/edit`}
                className="inline-flex justify-center items-center gap-1 px-3 py-2 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50"
              >
                <Edit className="h-3.5 h-3.5" />
                <span>Edit</span>
              </Link>
              <button
                onClick={() => {
                  if (window.confirm('Are you sure you want to delete this social service listing?')) {
                    deleteMutation.mutate();
                  }
                }}
                className="inline-flex justify-center items-center gap-1 px-3 py-2 border border-rose-100 rounded-lg text-xs font-semibold text-rose-700 bg-rose-50/50 hover:bg-rose-50"
              >
                <Trash className="h-3.5 h-3.5" />
                <span>Delete</span>
              </button>
            </div>
          )}
        </div>

        {/* Info Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
          
          <div className="md:col-span-2 space-y-4">
            <h3 className="font-bold text-slate-800 text-base">Service Description</h3>
            <p className="text-slate-600 text-sm leading-relaxed whitespace-pre-wrap">{service.description}</p>
          </div>

          <div className="md:col-span-1 bg-slate-50 p-5 rounded-2xl border border-slate-100 space-y-4 h-fit">
            <h4 className="font-bold text-slate-800 text-sm">Schedule & Contacts</h4>
            
            <div className="space-y-3 text-xs text-slate-600">
              <div className="flex items-start gap-1.5">
                <Clock className="w-4 h-4 text-slate-400 mt-0.5" />
                <div>
                  <p className="font-semibold text-slate-700">Timing:</p>
                  <p className="mt-0.5 leading-relaxed">{service.schedule}</p>
                </div>
              </div>

              <div className="flex items-start gap-1.5">
                <UserIcon className="w-4 h-4 text-slate-400 mt-0.5" />
                <div>
                  <p className="font-semibold text-slate-700">Posted By:</p>
                  <p className="mt-0.5">{service.owner?.fullName || 'Community Helper'}</p>
                </div>
              </div>
            </div>

            {/* Direct Contact Button */}
            {!isOwner && (
              <button
                onClick={handleOpenEnquiry}
                className="w-full flex items-center justify-center gap-1.5 py-3 px-4 bg-primary text-white rounded-xl text-xs font-bold hover:bg-indigo-900 transition-colors shadow"
              >
                <MessageCircle className="h-4 w-4" />
                <span>Contact Provider</span>
              </button>
            )}
          </div>

        </div>

      </div>

      {/* Contact Modal */}
      <Modal isOpen={isEnquiryOpen} onClose={() => setIsEnquiryOpen(false)} title="Contact Service Provider">
        <form onSubmit={handleSendEnquiry} className="space-y-4">
          <p className="text-xs text-slate-500">
            Send an enquiry message to the provider of <span className="font-semibold">{service.serviceName}</span>. They will contact you shortly.
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
