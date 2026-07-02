import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { listServices } from '../../api/socialWork';
import { Search, MapPin, HeartHandshake, Plus, Clock, Users } from 'lucide-react';
import Pagination from '../../components/Pagination';
import Badge from '../../components/Badge';
import { SocialServiceCategory } from '../../types';

export default function ServiceList() {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState<string>('');
  const [city, setCity] = useState('');
  const [page, setPage] = useState(1);

  // Fetch social services
  const { data: serviceData, isLoading } = useQuery({
    queryKey: ['socialServices', search, category, city, page],
    queryFn: () => listServices({ search, category, city, page, limit: 12 }),
  });

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  const categories: SocialServiceCategory[] = [
    'EDUCATION_TUITION',
    'HEALTHCARE_CAMP',
    'SKILL_TRAINING',
    'COUNSELING',
    'LEGAL_AID',
    'OTHERS',
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Social Services Directory</h1>
          <p className="text-sm text-slate-500 mt-1">
            Access free educational tuitions, medical checkup camps, skill-training seminars, and counseling programs.
          </p>
        </div>
        <Link
          to="/social-work/new"
          className="inline-flex items-center gap-1 px-4 py-2 bg-primary text-white rounded-xl text-sm font-semibold hover:bg-indigo-900 transition-colors shadow-sm w-fit"
        >
          <Plus className="h-4 w-4" />
          <span>Post Social Service</span>
        </Link>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
          <input
            type="text"
            placeholder="Search services..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="pl-10 w-full px-4 py-2.5 rounded-xl border border-slate-200 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm"
          />
        </div>

        {/* Category Filter */}
        <select
          value={category}
          onChange={(e) => {
            setCategory(e.target.value);
            setPage(1);
          }}
          className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm bg-white"
        >
          <option value="">All Categories</option>
          {categories.map((cat) => (
            <option key={cat} value={cat}>
              {cat.replace('_', ' ')}
            </option>
          ))}
        </select>

        {/* City Filter */}
        <div className="relative">
          <MapPin className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
          <input
            type="text"
            placeholder="Filter by city (e.g. Surat)"
            value={city}
            onChange={(e) => {
              setCity(e.target.value);
              setPage(1);
            }}
            className="pl-10 w-full px-4 py-2.5 rounded-xl border border-slate-200 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm"
          />
        </div>
      </div>

      {/* Main Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-64 rounded-3xl bg-slate-100 animate-pulse border border-slate-200" />
          ))}
        </div>
      ) : !serviceData?.data || serviceData.data.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-3xl border border-slate-100 shadow-sm">
          <HeartHandshake className="h-12 w-12 text-slate-300 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-slate-700">No Services Listed</h3>
          <p className="text-slate-400 text-sm mt-1">Try resetting your filters or posting a new community helper service.</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {serviceData.data.map((service) => (
              <Link
                key={service.id}
                to={`/social-work/${service.id}`}
                className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex flex-col justify-between hover:shadow-md hover:-translate-y-0.5 transition-all group"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <Badge variant="info">
                      {service.category.replace('_', ' ')}
                    </Badge>
                    <Badge variant={service.providerType === 'NGO' ? 'success' : 'default'}>
                      {service.providerType}
                    </Badge>
                  </div>

                  <h3 className="font-bold text-slate-800 group-hover:text-primary transition-colors text-lg line-clamp-1 mt-4">
                    {service.serviceName}
                  </h3>

                  <p className="text-slate-600 text-sm mt-2 line-clamp-3 leading-relaxed">
                    {service.description}
                  </p>

                  <div className="mt-4 flex items-center space-x-2 text-xs text-slate-400">
                    <Clock className="w-4 h-4 text-slate-400" />
                    <span>{service.schedule}</span>
                  </div>
                </div>

                <div className="mt-6 border-t border-slate-50 pt-4 flex items-center justify-between text-xs text-slate-400">
                  <div className="flex items-center space-x-1">
                    <MapPin className="w-4 h-4 text-slate-400" />
                    <span>
                      {service.city}
                    </span>
                  </div>
                  <span>{new Date(service.createdAt).toLocaleDateString()}</span>
                </div>
              </Link>
            ))}
          </div>

          <Pagination
            currentPage={serviceData.meta.page}
            totalPages={serviceData.meta.totalPages}
            onPageChange={handlePageChange}
          />
        </>
      )}

    </div>
  );
}
