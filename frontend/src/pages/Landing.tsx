import React from 'react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { Landmark, Wheat, ShoppingBag, HeartHandshake, Users, ArrowRight } from 'lucide-react';

export default function Landing() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  const modules = [
    {
      title: 'Industry Directory',
      description: 'Connect with Surat textile hubs, diamond jewellers, chemical firms, logistics, and wholesale markets.',
      icon: <Landmark className="h-10 w-10 text-indigo-600" />,
      path: '/industry',
      color: 'border-indigo-100 hover:border-indigo-300 bg-indigo-50/20',
    },
    {
      title: 'Farmer Marketplace',
      description: 'Buy fresh crops, organic vegetables, and fruits directly from local farmers with zero retail markup.',
      icon: <Wheat className="h-10 w-10 text-emerald-600" />,
      path: '/farmer',
      color: 'border-emerald-100 hover:border-emerald-300 bg-emerald-50/20',
    },
    {
      title: 'Women Entrepreneur Store',
      description: 'Shop homemade pickles, traditional bandhani dupattas, local crafts, and home decor items.',
      icon: <ShoppingBag className="h-10 w-10 text-rose-600" />,
      path: '/women',
      color: 'border-rose-100 hover:border-rose-300 bg-rose-50/20',
    },
    {
      title: 'Social Services',
      description: 'Explore community-sponsored healthcare camps, free tuitions, counseling, and training programs.',
      icon: <HeartHandshake className="h-10 w-10 text-cyan-600" />,
      path: '/social-work',
      color: 'border-cyan-100 hover:border-cyan-300 bg-cyan-50/20',
    },
    {
      title: 'Social Contacts & Families',
      description: 'Browse the unified community directory, trace native places, and search matrimonial profiles.',
      icon: <Users className="h-10 w-10 text-amber-600" />,
      path: '/families',
      color: 'border-amber-100 hover:border-amber-300 bg-amber-50/20',
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Hero section */}
      <div className="text-center max-w-3xl mx-auto mb-16">
        <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight">
          Empowering Our Community through <span className="text-primary border-b-4 border-accent">Connection & Commerce</span>
        </h1>
        <p className="mt-6 text-lg text-slate-600 leading-relaxed">
          Welcome to the unified digital home for our community. Discover local businesses, buy directly from farmers, support women-led micro-enterprises, access free services, and connect with local families.
        </p>
        
        <div className="mt-8 flex items-center justify-center space-x-4">
          {isAuthenticated ? (
            <Link
              to="/dashboard"
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-semibold rounded-xl text-white bg-primary hover:bg-indigo-900 shadow transition-all hover:scale-105"
            >
              Go to Dashboard
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          ) : (
            <>
              <Link
                to="/register"
                className="inline-flex items-center px-6 py-3 border border-transparent text-base font-semibold rounded-xl text-white bg-primary hover:bg-indigo-900 shadow transition-all hover:scale-105"
              >
                Join Now
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
              <Link
                to="/login"
                className="inline-flex items-center px-6 py-3 border border-slate-300 text-base font-semibold rounded-xl text-slate-700 bg-white hover:bg-slate-50 shadow-sm transition-all"
              >
                Sign In
              </Link>
            </>
          )}
        </div>
      </div>

      {/* Module grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {modules.map((module) => (
          <Link
            key={module.title}
            to={module.path}
            className={`flex flex-col p-8 rounded-2xl border-2 transition-all hover:shadow-lg hover:-translate-y-1 ${module.color}`}
          >
            <div className="bg-white p-3 rounded-xl shadow-sm w-fit border border-slate-100">
              {module.icon}
            </div>
            <h3 className="mt-6 text-xl font-bold text-slate-800">{module.title}</h3>
            <p className="mt-3 text-slate-600 text-sm flex-grow leading-relaxed">{module.description}</p>
            <div className="mt-6 flex items-center text-sm font-semibold text-primary group">
              Explore Module
              <ArrowRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
