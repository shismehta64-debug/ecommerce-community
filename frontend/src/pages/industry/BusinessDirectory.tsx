import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { listBusinesses, getSegments } from '../../api/industry';
import { Search, MapPin, Building2, Plus, ShieldCheck } from 'lucide-react';
import Pagination from '../../components/Pagination';
import Badge from '../../components/Badge';
import { IndustrySegment } from '../../types';

export default function BusinessDirectory() {
  const [search, setSearch] = useState('');
  const [segment, setSegment] = useState<string>('');
  const [city, setCity] = useState('');
  const [page, setPage] = useState(1);

  // Fetch segments list
  const { data: segments } = useQuery({
    queryKey: ['segments'],
    queryFn: getSegments,
  });

  // Fetch businesses
  const { data: businessData, isLoading } = useQuery({
    queryKey: ['businesses', search, segment, city, page],
    queryFn: () => listBusinesses({ search, segment, city, page, limit: 12 }),
  });

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  const getFullUrl = (urlPath?: string) => {
    if (!urlPath) return '';
    if (urlPath.startsWith('http')) return urlPath;
    const base = (import.meta.env.VITE_API_BASE_URL as string) || 'http://localhost:3000';
    return `${base}${urlPath.startsWith('/') ? urlPath : `/${urlPath}`}`;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Industry Directory</h1>
          <p className="text-sm text-slate-500 mt-1">
            Connect with local businesses in textile hubs, chemical manufacturing, diamond crafts, and services.
          </p>
        </div>
        <Link
          to="/industry/new"
          className="inline-flex items-center gap-1 px-4 py-2 bg-primary text-white rounded-xl text-sm font-semibold hover:bg-indigo-900 transition-colors shadow-sm w-fit"
        >
          <Plus className="h-4 w-4" />
          <span>Register Business</span>
        </Link>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
          <input
            type="text"
            placeholder="Search businesses..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="pl-10 w-full px-4 py-2.5 rounded-xl border border-slate-200 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm"
          />
        </div>

        {/* Segment Filter */}
        <select
          value={segment}
          onChange={(e) => {
            setSegment(e.target.value);
            setPage(1);
          }}
          className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm bg-white"
        >
          <option value="">All Segments</option>
          {segments?.map((seg) => (
            <option key={seg} value={seg}>
              {seg.replace('_', ' ')}
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
            <div key={i} className="h-60 rounded-3xl bg-slate-100 animate-pulse border border-slate-200" />
          ))}
        </div>
      ) : !businessData?.data || businessData.data.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-3xl border border-slate-100 shadow-sm">
          <Building2 className="h-12 w-12 text-slate-300 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-slate-700">No Businesses Found</h3>
          <p className="text-slate-400 text-sm mt-1">Try resetting your filters or registering a new business profile.</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {businessData.data.map((business) => (
              <Link
                key={business.id}
                to={`/industry/${business.id}`}
                className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex flex-col justify-between hover:shadow-md hover:-translate-y-0.5 transition-all group"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center space-x-3">
                      {business.logoUrl ? (
                        <img
                          src={getFullUrl(business.logoUrl)}
                          alt="Logo"
                          className="w-12 h-12 rounded-xl object-cover border border-slate-100"
                        />
                      ) : (
                        <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl text-slate-400">
                          <Building2 className="w-6 h-6" />
                        </div>
                      )}
                      <div>
                        <h3 className="font-bold text-slate-800 group-hover:text-primary transition-colors text-base line-clamp-1">
                          {business.businessName}
                        </h3>
                        <Badge variant="info" className="mt-1">
                          {business.segment.replace('_', ' ')}
                        </Badge>
                      </div>
                    </div>
                    {business.isVerified && (
                      <Badge variant="success" className="flex items-center gap-0.5">
                        <ShieldCheck className="w-3.5 h-3.5" />
                        Verified
                      </Badge>
                    )}
                  </div>

                  <p className="text-slate-600 text-sm mt-4 line-clamp-3 leading-relaxed">
                    {business.description}
                  </p>
                </div>

                <div className="mt-6 border-t border-slate-50 pt-4 flex items-center justify-between text-xs text-slate-400">
                  <div className="flex items-center space-x-1">
                    <MapPin className="w-4 h-4 text-slate-400" />
                    <span>
                      {business.city}, {business.state}
                    </span>
                  </div>
                  <span>{new Date(business.createdAt).toLocaleDateString()}</span>
                </div>
              </Link>
            ))}
          </div>

          <Pagination
            currentPage={businessData.meta.page}
            totalPages={businessData.meta.totalPages}
            onPageChange={handlePageChange}
          />
        </>
      )}

    </div>
  );
}
