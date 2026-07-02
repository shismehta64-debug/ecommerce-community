import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getPendingVerifications, verify } from '../../api/admin';
import { useToastStore } from '../../store/toastStore';
import { ShieldCheck, Loader2, Building2, UserCheck, ArrowLeft, CheckSquare } from 'lucide-react';
import { Link } from 'react-router-dom';
import Badge from '../../components/Badge';

export default function AdminVerifications() {
  const queryClient = useQueryClient();
  const addToast = useToastStore((state) => state.addToast);

  // Fetch pending verifications
  const { data, isLoading } = useQuery({
    queryKey: ['pendingVerifications'],
    queryFn: getPendingVerifications,
  });

  // Verify mutation
  const verifyMutation = useMutation({
    mutationFn: ({ type, id }: { type: string; id: string }) => verify(type, id),
    onSuccess: () => {
      addToast('Resource approved and verified successfully!', 'success');
      queryClient.invalidateQueries({ queryKey: ['pendingVerifications'] });
      queryClient.invalidateQueries({ queryKey: ['businesses'] });
    },
    onError: () => {
      addToast('Failed to verify resource', 'error');
    },
  });

  const handleVerify = (type: string, id: string) => {
    verifyMutation.mutate({ type, id });
  };

  const getFullUrl = (urlPath?: string) => {
    if (!urlPath) return '';
    if (urlPath.startsWith('http')) return urlPath;
    const base = (import.meta.env.VITE_API_BASE_URL as string) || 'http://localhost:3000';
    return `${base}${urlPath.startsWith('/') ? urlPath : `/${urlPath}`}`;
  };

  // Extract pending lists from the backend response
  const pendingBusinesses = data?.businesses || [];

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 flex flex-col items-center justify-center space-y-4">
        <Loader2 className="h-8 w-8 text-primary animate-spin" />
        <p className="text-slate-500 text-sm">Loading pending verifications...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      
      {/* Back Button */}
      <Link to="/dashboard" className="inline-flex items-center text-slate-500 hover:text-slate-700 font-semibold mb-6 text-sm">
        <ArrowLeft className="w-4 h-4 mr-1" /> Back to Dashboard
      </Link>

      <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <ShieldCheck className="h-8 w-8 text-primary" />
            <span>Admin Verification Portal</span>
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Review and approve pending commercial businesses listed by community members.
          </p>
        </div>
      </div>

      {pendingBusinesses.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-3xl border border-slate-100 shadow-sm">
          <CheckSquare className="h-12 w-12 text-slate-350 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-slate-700">All Caught Up!</h3>
          <p className="text-slate-400 text-sm mt-1">No businesses are currently pending administrative verification.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {pendingBusinesses.map((b: any) => (
            <div
              key={b.id}
              className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 transition-all"
            >
              <div className="flex items-start space-x-4">
                {b.logoUrl ? (
                  <img
                    src={getFullUrl(b.logoUrl)}
                    alt="Logo"
                    className="w-14 h-14 rounded-2xl object-cover border border-slate-100"
                  />
                ) : (
                  <div className="p-3 bg-slate-50 border border-slate-100 rounded-2xl text-slate-400">
                    <Building2 className="w-8 h-8" />
                  </div>
                )}
                <div>
                  <h3 className="font-bold text-slate-800 text-base">{b.businessName}</h3>
                  <div className="flex flex-wrap items-center gap-2 mt-1 text-xs text-slate-450">
                    <Badge variant="info">{b.segment.replace('_', ' ')}</Badge>
                    <span>&bull;</span>
                    <span>
                      {b.city}, {b.state}
                    </span>
                  </div>
                  <p className="text-slate-500 text-xs mt-2 line-clamp-2 max-w-lg leading-relaxed">
                    {b.description}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 flex-shrink-0">
                <button
                  onClick={() => handleVerify('business', b.id)}
                  disabled={verifyMutation.isPending}
                  className="inline-flex justify-center items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all disabled:opacity-50"
                >
                  {verifyMutation.isPending ? (
                    <Loader2 className="h-3 w-3 animate-spin" />
                  ) : (
                    <ShieldCheck className="h-4 w-4" />
                  )}
                  <span>Approve & Verify</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

    </div>
  );
}
