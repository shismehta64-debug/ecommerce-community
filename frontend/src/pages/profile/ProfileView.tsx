import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '../../store/authStore';
import { useToastStore } from '../../store/toastStore';
import { updateMe } from '../../api/auth';
import { getReceivedEnquiries, getSentEnquiries } from '../../api/enquiries';
import { listBusinesses } from '../../api/industry';
import { listProduce } from '../../api/farmer';
import { listProducts } from '../../api/women';
import { listServices } from '../../api/socialWork';
import { listFamilies } from '../../api/families';
import { 
  User as UserIcon, 
  Settings, 
  MessageSquare, 
  Building2, 
  Wheat, 
  ShoppingBag, 
  HeartHandshake, 
  Home, 
  Phone, 
  Mail, 
  Save, 
  Loader2,
  Inbox
} from 'lucide-react';
import Badge from '../../components/Badge';
import { Link } from 'react-router-dom';

export default function ProfileView() {
  const { user, updateUser } = useAuthStore();
  const addToast = useToastStore((state) => state.addToast);
  const queryClient = useQueryClient();

  const [activeTab, setActiveTab] = useState<'profile' | 'listings' | 'enquiries' | 'family'>('profile');

  // Profile Form state
  const [fullName, setFullName] = useState(user?.fullName || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [city, setCity] = useState(user?.city || '');
  const [state, setState] = useState(user?.state || '');
  const [photoUrl, setPhotoUrl] = useState(user?.profilePhotoUrl || '');

  // Reset form when user changes
  useEffect(() => {
    if (user) {
      setFullName(user.fullName);
      setPhone(user.phone);
      setCity(user.city);
      setState(user.state);
      setPhotoUrl(user.profilePhotoUrl || '');
    }
  }, [user]);

  // Update Profile Mutation
  const updateProfileMutation = useMutation({
    mutationFn: () => updateMe({ fullName, phone, city, state, profilePhotoUrl: photoUrl || undefined }),
    onSuccess: (updatedUser) => {
      updateUser(updatedUser);
      addToast('Profile updated successfully!', 'success');
    },
    onError: (err: any) => {
      addToast(err.response?.data?.error?.message || 'Failed to update profile', 'error');
    },
  });

  // Query sent & received enquiries
  const { data: sentEnquiries } = useQuery({
    queryKey: ['sentEnquiries'],
    queryFn: getSentEnquiries,
    enabled: activeTab === 'enquiries',
  });

  const { data: receivedEnquiries } = useQuery({
    queryKey: ['receivedEnquiries'],
    queryFn: getReceivedEnquiries,
    enabled: activeTab === 'enquiries',
  });

  // Query User Listings across all modules (using owner filter)
  const { data: userBusinesses } = useQuery({
    queryKey: ['userBusinesses'],
    queryFn: () => listBusinesses({ limit: 100 }), // Filter will happen locally or backend supports all. Since backend returns all, we filter locally where ownerId === user.id
    enabled: activeTab === 'listings' && !!user,
  });

  const { data: userProduce } = useQuery({
    queryKey: ['userProduce'],
    queryFn: () => listProduce({ limit: 100 }),
    enabled: activeTab === 'listings' && !!user,
  });

  const { data: userProducts } = useQuery({
    queryKey: ['userProducts'],
    queryFn: () => listProducts({ limit: 100 }),
    enabled: activeTab === 'listings' && !!user,
  });

  const { data: userServices } = useQuery({
    queryKey: ['userServices'],
    queryFn: () => listServices({ limit: 100 }),
    enabled: activeTab === 'listings' && !!user,
  });

  // Query user families
  const { data: userFamilies } = useQuery({
    queryKey: ['userFamilies'],
    queryFn: () => listFamilies({ limit: 100 }),
    enabled: activeTab === 'family' && !!user,
  });

  const myBusinesses = userBusinesses?.data.filter((b) => b.ownerId === user?.id) || [];
  const myProduce = userProduce?.data.filter((p) => p.ownerId === user?.id) || [];
  const myProducts = userProducts?.data.filter((p) => p.ownerId === user?.id) || [];
  const myServices = userServices?.data.filter((s) => s.ownerId === user?.id) || [];
  const myFamilies = userFamilies?.data.filter((f) => f.headOfFamilyUserId === user?.id) || [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight mb-8">My Account</h1>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        
        {/* Left Sidebar Tab Navigation */}
        <div className="md:col-span-1 bg-white p-5 rounded-3xl border border-slate-100 shadow-sm h-fit space-y-2">
          
          <button
            onClick={() => setActiveTab('profile')}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
              activeTab === 'profile'
                ? 'bg-primary text-white'
                : 'text-slate-650 hover:bg-slate-50'
            }`}
          >
            <Settings className="w-5 h-5" />
            <span>Profile Settings</span>
          </button>

          <button
            onClick={() => setActiveTab('listings')}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
              activeTab === 'listings'
                ? 'bg-primary text-white'
                : 'text-slate-650 hover:bg-slate-50'
            }`}
          >
            <Building2 className="w-5 h-5" />
            <span>My Listings</span>
          </button>

          <button
            onClick={() => setActiveTab('enquiries')}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
              activeTab === 'enquiries'
                ? 'bg-primary text-white'
                : 'text-slate-650 hover:bg-slate-50'
            }`}
          >
            <MessageSquare className="w-5 h-5" />
            <span>My Enquiries</span>
          </button>

          <button
            onClick={() => setActiveTab('family')}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
              activeTab === 'family'
                ? 'bg-primary text-white'
                : 'text-slate-650 hover:bg-slate-50'
            }`}
          >
            <Home className="w-5 h-5" />
            <span>My Family Profile</span>
          </button>

        </div>

        {/* Right Content Panel */}
        <div className="md:col-span-3">
          
          {/* Tab 1: Profile settings */}
          {activeTab === 'profile' && (
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-100 shadow-sm space-y-6">
              <h2 className="text-xl font-bold text-slate-800 border-b border-slate-50 pb-2">Profile Settings</h2>
              
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  updateProfileMutation.mutate();
                }}
                className="space-y-4"
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Full Name */}
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-semibold text-slate-700 mb-1">Full Name</label>
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                      required
                    />
                  </div>

                  {/* Phone */}
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">Phone Number</label>
                    <input
                      type="text"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                      required
                    />
                  </div>

                  {/* Email (Read Only) */}
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">Email Address</label>
                    <input
                      type="email"
                      value={user?.email}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-400 text-sm cursor-not-allowed"
                      disabled
                    />
                  </div>

                  {/* City */}
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">City</label>
                    <input
                      type="text"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                      required
                    />
                  </div>

                  {/* State */}
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">State</label>
                    <input
                      type="text"
                      value={state}
                      onChange={(e) => setState(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                      required
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={updateProfileMutation.isPending}
                  className="flex justify-center items-center py-3 px-6 border border-transparent text-sm font-bold rounded-xl text-white bg-primary hover:bg-indigo-900 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow mt-6"
                >
                  {updateProfileMutation.isPending ? (
                    <>
                      <Loader2 className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Save Changes
                    </>
                  )}
                </button>
              </form>
            </div>
          )}

          {/* Tab 2: User Listings */}
          {activeTab === 'listings' && (
            <div className="space-y-6">
              {/* Business listings */}
              <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4">
                <h3 className="text-lg font-bold text-slate-800 border-b border-slate-50 pb-2 flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-indigo-650" />
                  <span>My Commercial Businesses</span>
                </h3>
                {myBusinesses.length === 0 ? (
                  <p className="text-slate-400 text-xs italic">No commercial businesses registered.</p>
                ) : (
                  <div className="divide-y divide-slate-50">
                    {myBusinesses.map((b) => (
                      <div key={b.id} className="py-3 flex justify-between items-center text-sm gap-2">
                        <Link to={`/industry/${b.id}`} className="font-bold text-slate-700 hover:text-primary">
                          {b.businessName}
                        </Link>
                        <Badge variant={b.isVerified ? 'success' : 'warning'}>
                          {b.isVerified ? 'Verified' : 'Pending Verification'}
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Farmer harvest produce listings */}
              <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4">
                <h3 className="text-lg font-bold text-slate-800 border-b border-slate-50 pb-2 flex items-center gap-2">
                  <Wheat className="w-5 h-5 text-emerald-600" />
                  <span>My Farmer Harvest Produce</span>
                </h3>
                {myProduce.length === 0 ? (
                  <p className="text-slate-400 text-xs italic">No harvest produce listed.</p>
                ) : (
                  <div className="divide-y divide-slate-50">
                    {myProduce.map((p) => (
                      <div key={p.id} className="py-3 flex justify-between items-center text-sm gap-2">
                        <Link to={`/farmer/${p.id}`} className="font-bold text-slate-700 hover:text-primary">
                          {p.cropName}
                        </Link>
                        <span className="text-xs text-slate-400 font-semibold">
                          Qty: {p.quantityAvailable} {p.unit}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Women boutique products */}
              <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4">
                <h3 className="text-lg font-bold text-slate-800 border-b border-slate-50 pb-2 flex items-center gap-2">
                  <ShoppingBag className="w-5 h-5 text-rose-600" />
                  <span>My Boutique & Handmade Products</span>
                </h3>
                {myProducts.length === 0 ? (
                  <p className="text-slate-400 text-xs italic">No boutique products listed.</p>
                ) : (
                  <div className="divide-y divide-slate-50">
                    {myProducts.map((p) => (
                      <div key={p.id} className="py-3 flex justify-between items-center text-sm gap-2">
                        <Link to={`/women/${p.id}`} className="font-bold text-slate-700 hover:text-primary">
                          {p.name}
                        </Link>
                        <span className="text-xs text-slate-400 font-semibold">Stock: {p.stockQuantity}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Social services */}
              <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4">
                <h3 className="text-lg font-bold text-slate-800 border-b border-slate-50 pb-2 flex items-center gap-2">
                  <HeartHandshake className="w-5 h-5 text-cyan-600" />
                  <span>My Social Work Services</span>
                </h3>
                {myServices.length === 0 ? (
                  <p className="text-slate-400 text-xs italic">No free social services posted.</p>
                ) : (
                  <div className="divide-y divide-slate-50">
                    {myServices.map((s) => (
                      <div key={s.id} className="py-3 flex justify-between items-center text-sm gap-2">
                        <Link to={`/social-work/${s.id}`} className="font-bold text-slate-700 hover:text-primary">
                          {s.serviceName}
                        </Link>
                        <Badge variant="info">{s.category.replace('_', ' ')}</Badge>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Tab 3: Enquiries list */}
          {activeTab === 'enquiries' && (
            <div className="space-y-8 animate-in fade-in duration-200">
              {/* Received Enquiries */}
              <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4">
                <h3 className="text-lg font-bold text-slate-800 border-b border-slate-50 pb-2 flex items-center gap-2">
                  <Inbox className="w-5 h-5 text-primary" />
                  <span>Received Business Enquiries</span>
                </h3>
                
                {!receivedEnquiries || receivedEnquiries.length === 0 ? (
                  <p className="text-slate-400 text-xs italic">No enquiries received for your businesses yet.</p>
                ) : (
                  <div className="space-y-4 divide-y divide-slate-50">
                    {receivedEnquiries.map((enquiry) => (
                      <div key={enquiry.id} className="pt-4 first:pt-0 space-y-2 text-xs">
                        <div className="flex justify-between items-center text-slate-400">
                          <span>Listing Type: <span className="font-semibold text-slate-700">{enquiry.listingType}</span></span>
                          <span>Received: {new Date(enquiry.createdAt).toLocaleDateString()}</span>
                        </div>
                        <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 text-slate-700 text-sm italic">
                          &ldquo;{enquiry.message}&rdquo;
                        </div>
                        <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                          <div>
                            Sender: <span className="font-bold text-slate-800">{enquiry.buyer?.fullName}</span>
                          </div>
                          <a href={`tel:${enquiry.contactPhone}`} className="flex items-center gap-1 text-primary font-semibold">
                            <Phone className="w-3.5 h-3.5" /> Call: {enquiry.contactPhone}
                          </a>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Sent Enquiries */}
              <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4">
                <h3 className="text-lg font-bold text-slate-800 border-b border-slate-50 pb-2 flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-slate-500" />
                  <span>Sent Business Enquiries</span>
                </h3>

                {!sentEnquiries || sentEnquiries.length === 0 ? (
                  <p className="text-slate-400 text-xs italic">You haven't sent any enquiries yet.</p>
                ) : (
                  <div className="space-y-4 divide-y divide-slate-50">
                    {sentEnquiries.map((enquiry) => (
                      <div key={enquiry.id} className="pt-4 first:pt-0 space-y-2 text-xs">
                        <div className="flex justify-between items-center text-slate-400">
                          <span>Listing Reference ID: <span className="font-semibold text-slate-700">{enquiry.listingId.slice(0, 8)}</span></span>
                          <span>Sent: {new Date(enquiry.createdAt).toLocaleDateString()}</span>
                        </div>
                        <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 text-slate-700 text-sm italic">
                          &ldquo;{enquiry.message}&rdquo;
                        </div>
                        <div className="flex justify-between items-center text-xs">
                          <span>Listing Type: <Badge variant="info">{enquiry.listingType}</Badge></span>
                          <span className="text-slate-500">Contact Number Shared: {enquiry.contactPhone}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Tab 4: Family Profile shortcut */}
          {activeTab === 'family' && (
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-100 shadow-sm space-y-4">
              <h2 className="text-xl font-bold text-slate-800 border-b border-slate-50 pb-2 flex items-center gap-2">
                <Home className="w-5 h-5 text-amber-500" />
                <span>My Registered Families</span>
              </h2>

              {myFamilies.length === 0 ? (
                <div className="text-center py-10 space-y-4">
                  <p className="text-slate-400 text-sm italic">You haven't created a family profile in the directory yet.</p>
                  <Link
                    to="/families/new"
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-primary text-white rounded-xl text-sm font-semibold hover:bg-indigo-900 shadow-sm"
                  >
                    Create Family Profile
                  </Link>
                </div>
              ) : (
                <div className="divide-y divide-slate-50">
                  {myFamilies.map((f) => (
                    <div key={f.id} className="py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-sm">
                      <div>
                        <h4 className="font-bold text-slate-800 text-base">{f.familyName}</h4>
                        <p className="text-slate-400 text-xs mt-0.5">
                          Native Place: {f.nativePlace} &bull; City: {f.currentCity}
                        </p>
                      </div>

                      <div className="flex gap-2">
                        <Link
                          to={`/families/${f.id}`}
                          className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-650 hover:bg-slate-100 text-xs font-semibold"
                        >
                          Manage Members
                        </Link>
                        <Link
                          to={`/families/${f.id}/edit`}
                          className="px-3 py-1.5 border border-slate-200 rounded-lg text-slate-650 hover:bg-slate-50 text-xs font-semibold"
                        >
                          Edit Profile
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

        </div>

      </div>
    </div>
  );
}
