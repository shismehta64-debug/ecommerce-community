import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { listFamilies } from '../../api/families';
import { Search, MapPin, Users, Plus, Home } from 'lucide-react';
import Pagination from '../../components/Pagination';
import Badge from '../../components/Badge';

export default function FamilyDirectory() {
  const [search, setSearch] = useState('');
  const [city, setCity] = useState('');
  const [page, setPage] = useState(1);

  // Fetch families
  const { data: familyData, isLoading } = useQuery({
    queryKey: ['families', search, city, page],
    queryFn: () => listFamilies({ search, city, page, limit: 12 }),
  });

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Family Directory</h1>
          <p className="text-sm text-slate-500 mt-1">
            Search and connect with families in our community. View native place links, current locations, and matrimonial directory cards.
          </p>
        </div>
        <Link
          to="/families/new"
          className="inline-flex items-center gap-1 px-4 py-2 bg-primary text-white rounded-xl text-sm font-semibold hover:bg-indigo-900 transition-colors shadow-sm w-fit"
        >
          <Plus className="h-4 w-4" />
          <span>Register Family</span>
        </Link>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
          <input
            type="text"
            placeholder="Search family name or native place..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="pl-10 w-full px-4 py-2.5 rounded-xl border border-slate-200 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm"
          />
        </div>

        {/* City Filter */}
        <div className="relative">
          <MapPin className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
          <input
            type="text"
            placeholder="Filter by current city (e.g. Surat)"
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
            <div key={i} className="h-48 rounded-3xl bg-slate-100 animate-pulse border border-slate-200" />
          ))}
        </div>
      ) : !familyData?.data || familyData.data.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-3xl border border-slate-100 shadow-sm">
          <Users className="h-12 w-12 text-slate-300 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-slate-700">No Families Listed</h3>
          <p className="text-slate-400 text-sm mt-1">Try resetting your filters or registering your own family profile.</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {familyData.data.map((family) => (
              <Link
                key={family.id}
                to={`/families/${family.id}`}
                className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all group flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="p-3 bg-amber-50 border border-amber-100 rounded-xl text-amber-600">
                      <Home className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-800 group-hover:text-primary transition-colors text-lg line-clamp-1">
                        {family.familyName}
                      </h3>
                      <p className="text-slate-400 text-xs mt-0.5">
                        Native Place: <span className="font-semibold text-slate-600">{family.nativePlace}</span>
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2 text-sm text-slate-600">
                    <p className="flex items-center gap-1 text-xs">
                      <MapPin className="w-4 h-4 text-slate-400" />
                      <span>Current City: {family.currentCity}, {family.currentState}</span>
                    </p>
                  </div>
                </div>

                <div className="mt-6 border-t border-slate-50 pt-4 flex items-center justify-between text-xs text-slate-400">
                  <span className="font-bold text-primary">
                    {family._count?.members || family.members?.length || 0} family members
                  </span>
                  <span>Registered: {new Date(family.createdAt).toLocaleDateString()}</span>
                </div>
              </Link>
            ))}
          </div>

          <Pagination
            currentPage={familyData.meta.page}
            totalPages={familyData.meta.totalPages}
            onPageChange={handlePageChange}
          />
        </>
      )}

    </div>
  );
}
