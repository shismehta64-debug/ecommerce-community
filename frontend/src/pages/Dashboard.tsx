import React from 'react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { 
  Building2, 
  Wheat, 
  ShoppingBag, 
  HeartHandshake, 
  Users, 
  UserSquare2, 
  MessageSquare, 
  ClipboardList, 
  Truck,
  PlusCircle
} from 'lucide-react';

export default function Dashboard() {
  const { user } = useAuthStore();

  const modules = [
    {
      title: 'Industry Directory',
      icon: <Building2 className="h-6 w-6 text-indigo-600" />,
      path: '/industry',
      addPath: '/industry/new',
      addLabel: 'Add Business',
      color: 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100',
    },
    {
      title: 'Farmer Market',
      icon: <Wheat className="h-6 w-6 text-emerald-600" />,
      path: '/farmer',
      addPath: '/farmer/new',
      addLabel: 'List Produce',
      color: 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100',
    },
    {
      title: 'Women Store',
      icon: <ShoppingBag className="h-6 w-6 text-rose-600" />,
      path: '/women',
      addPath: '/women/new',
      addLabel: 'Add Product',
      color: 'bg-rose-50 text-rose-700 hover:bg-rose-100',
    },
    {
      title: 'Social Services',
      icon: <HeartHandshake className="h-6 w-6 text-cyan-600" />,
      path: '/social-work',
      addPath: '/social-work/new',
      addLabel: 'List Service',
      color: 'bg-cyan-50 text-cyan-700 hover:bg-cyan-100',
    },
    {
      title: 'Family Directory',
      icon: <Users className="h-6 w-6 text-amber-600" />,
      path: '/families',
      addPath: '/families/new',
      addLabel: 'Create Profile',
      color: 'bg-amber-50 text-amber-700 hover:bg-amber-100',
    },
  ];

  const shortcuts = [
    {
      label: 'Manage My Profile',
      description: 'Update your contact and location details.',
      icon: <UserSquare2 className="h-5 w-5 text-slate-500" />,
      path: '/profile',
    },
    {
      label: 'My Enquiries',
      description: 'View sent/received business interest messages.',
      icon: <MessageSquare className="h-5 w-5 text-slate-500" />,
      path: '/profile?tab=enquiries',
    },
    {
      label: 'My Orders',
      description: 'Check status of your grocery & boutique orders.',
      icon: <Truck className="h-5 w-5 text-slate-500" />,
      path: '/orders',
    },
    {
      label: 'My Listings',
      description: 'Edit, update stock, or remove your items.',
      icon: <ClipboardList className="h-5 w-5 text-slate-500" />,
      path: '/profile?tab=listings',
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Header */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-100 shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-10">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            Kem Cho, {user?.fullName}!
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Access the community modules, manage your shop listings, and link up with families.
          </p>
        </div>
        <Link
          to="/profile"
          className="inline-flex items-center px-4 py-2 border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 bg-white hover:bg-slate-50 transition-colors w-fit"
        >
          View Profile
        </Link>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Module Explorer */}
        <div className="lg:col-span-2 space-y-6">
          <h2 className="text-xl font-bold text-slate-800">Explore Directory & Markets</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {modules.map((m) => (
              <div
                key={m.title}
                className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between"
              >
                <div className="flex items-center space-x-3">
                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                    {m.icon}
                  </div>
                  <h3 className="font-bold text-slate-800 text-base">{m.title}</h3>
                </div>
                
                <div className="mt-6 flex gap-2">
                  <Link
                    to={m.path}
                    className="flex-1 text-center py-2 px-3 rounded-lg text-sm font-semibold bg-primary text-white hover:bg-indigo-900 transition-colors"
                  >
                    Open
                  </Link>
                  <Link
                    to={m.addPath}
                    className={`flex items-center gap-1 py-2 px-3 rounded-lg text-sm font-semibold border ${m.color} transition-colors`}
                  >
                    <PlusCircle className="h-4 w-4" />
                    <span>{m.addLabel}</span>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Shortcuts / Quick Actions */}
        <div className="space-y-6">
          <h2 className="text-xl font-bold text-slate-800">Quick Shortcuts</h2>
          <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 space-y-4">
            {shortcuts.map((s) => (
              <Link
                key={s.label}
                to={s.path}
                className="flex items-start space-x-3 p-3 rounded-xl hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100 group"
              >
                <div className="p-2 bg-slate-50 rounded-xl group-hover:bg-white border border-transparent group-hover:border-slate-100">
                  {s.icon}
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-800 group-hover:text-primary transition-colors">
                    {s.label}
                  </h4>
                  <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">{s.description}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
