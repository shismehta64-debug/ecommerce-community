import React from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getFamily, deleteFamily, deleteMember } from '../../api/families';
import { useAuthStore } from '../../store/authStore';
import { useToastStore } from '../../store/toastStore';
import { 
  Home, 
  MapPin, 
  Phone, 
  Mail, 
  Plus, 
  Edit, 
  Trash, 
  ArrowLeft,
  User as UserIcon,
  Briefcase,
  GraduationCap,
  Calendar,
  Heart,
  Users
} from 'lucide-react';
import Badge from '../../components/Badge';

export default function FamilyDetail() {
  const { id } = useParams<{ id: string }>();
  const { user, isAuthenticated } = useAuthStore();
  const queryClient = useQueryClient();
  const addToast = useToastStore((state) => state.addToast);
  const navigate = useNavigate();

  // Fetch Family details
  const { data: family, isLoading } = useQuery({
    queryKey: ['familyDetail', id],
    queryFn: () => getFamily(id!),
    enabled: !!id,
  });

  // Delete family mutation
  const deleteFamilyMutation = useMutation({
    mutationFn: () => deleteFamily(id!),
    onSuccess: () => {
      addToast('Family profile deleted successfully', 'success');
      navigate('/families');
    },
    onError: () => {
      addToast('Failed to delete family profile', 'error');
    },
  });

  // Delete family member mutation
  const deleteMemberMutation = useMutation({
    mutationFn: (memberId: string) => deleteMember(memberId),
    onSuccess: () => {
      addToast('Family member removed successfully', 'success');
      queryClient.invalidateQueries({ queryKey: ['familyDetail', id] });
    },
    onError: () => {
      addToast('Failed to remove family member', 'error');
    },
  });

  const isOwner = user?.role === 'ADMIN' || (family && user?.id === family.headOfFamilyUserId);

  const calculateAge = (dobString?: string) => {
    if (!dobString) return 'N/A';
    const birthDate = new Date(dobString);
    const difference = Date.now() - birthDate.getTime();
    const ageDate = new Date(difference);
    return Math.abs(ageDate.getUTCFullYear() - 1970);
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
        <div className="h-40 bg-slate-100 rounded-3xl" />
        <div className="h-60 bg-slate-100 rounded-3xl" />
      </div>
    );
  }

  if (!family) {
    return (
      <div className="text-center py-20">
        <h3 className="text-xl font-bold text-slate-800">Family Profile Not Found</h3>
        <Link to="/families" className="mt-4 inline-flex items-center text-primary font-semibold hover:underline">
          <ArrowLeft className="w-4 h-4 mr-1" /> Back to Directory
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      
      {/* Back Button */}
      <Link to="/families" className="inline-flex items-center text-slate-500 hover:text-slate-700 font-semibold mb-6 text-sm">
        <ArrowLeft className="w-4 h-4 mr-1" /> Back to Directory
      </Link>

      {/* Main Family Banner */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 sm:p-8 flex flex-col md:flex-row md:items-start justify-between gap-6 mb-8">
        <div className="flex flex-col sm:flex-row items-center sm:items-start space-x-0 sm:space-x-6 gap-4">
          <div className="p-5 bg-amber-50 border border-amber-100 rounded-2xl text-amber-600">
            <Home className="w-12 h-12" />
          </div>
          
          <div className="text-center sm:text-left space-y-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">{family.familyName}</h1>
            <p className="text-sm text-slate-500">
              Native Place:{' '}
              <span className="font-semibold text-slate-700 underline decoration-accent decoration-2">
                {family.nativePlace}
              </span>
            </p>
            
            <div className="flex items-center justify-center sm:justify-start gap-1 text-slate-500 text-sm">
              <MapPin className="w-4 h-4 text-slate-400" />
              <span>{family.currentAddress}, {family.currentCity}, {family.currentState}</span>
            </div>

            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 text-xs text-slate-500 pt-2">
              <a href={`tel:${family.contactPhone}`} className="flex items-center gap-1 hover:text-primary">
                <Phone className="w-3.5 h-3.5" /> {family.contactPhone}
              </a>
              {family.contactEmail && (
                <a href={`mailto:${family.contactEmail}`} className="flex items-center gap-1 hover:text-primary">
                  <Mail className="w-3.5 h-3.5" /> {family.contactEmail}
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Action Controls for owner / Admin */}
        {isOwner && (
          <div className="flex sm:flex-row flex-col gap-2 w-full md:w-auto">
            <Link
              to={`/families/${family.id}/edit`}
              className="inline-flex justify-center items-center gap-1.5 px-4 py-2 border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 bg-white hover:bg-slate-50 transition-all shadow-sm"
            >
              <Edit className="h-4 w-4" />
              <span>Edit Profile</span>
            </Link>
            <button
              onClick={() => {
                if (window.confirm('Are you sure you want to delete this entire family directory profile?')) {
                  deleteFamilyMutation.mutate();
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

      {/* Members Directory Section */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-slate-800">Family Members</h2>
          {isOwner && (
            <Link
              to={`/families/${family.id}/members/new`}
              className="inline-flex items-center gap-1 px-4 py-2 bg-primary text-white rounded-xl text-sm font-semibold hover:bg-indigo-900 transition-colors shadow-sm"
            >
              <Plus className="h-4 w-4" />
              <span>Add Member</span>
            </Link>
          )}
        </div>

        {!family.members || family.members.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-3xl border border-slate-100 shadow-sm">
            <Users className="h-10 w-10 text-slate-300 mx-auto mb-2" />
            <p className="text-slate-400 text-sm">No family members added to this profile yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {family.members.map((member) => (
              <div
                key={member.id}
                className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden flex flex-col justify-between hover:shadow-md transition-all relative group"
              >
                {/* Matrimonial Info Cards */}
                <div className="p-6 space-y-4">
                  <div className="flex items-start space-x-4">
                    {member.photoUrl ? (
                      <img
                        src={getFullUrl(member.photoUrl)}
                        alt={member.fullName}
                        className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover border border-slate-100 shadow-sm"
                      />
                    ) : (
                      <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl text-slate-400 flex items-center justify-center">
                        <UserIcon className="w-8 h-8" />
                      </div>
                    )}

                    <div className="space-y-1">
                      <h3 className="font-bold text-slate-850 text-base line-clamp-1">{member.fullName}</h3>
                      <div className="flex flex-wrap gap-1.5 pt-0.5">
                        <Badge variant="info" className="text-[10px]">
                          {member.relation}
                        </Badge>
                        <Badge variant="accent" className="text-[10px]">
                          {member.maritalStatus}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2 pt-2 border-t border-slate-50 text-xs text-slate-650">
                    {/* Age & DOB */}
                    <div className="flex items-center gap-2">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      <span>
                        Age: <span className="font-semibold text-slate-850">{calculateAge(member.dob)}</span> years
                      </span>
                    </div>

                    {/* Education */}
                    {member.education && (
                      <div className="flex items-center gap-2">
                        <GraduationCap className="w-3.5 h-3.5 text-slate-400" />
                        <span className="line-clamp-1">{member.education}</span>
                      </div>
                    )}

                    {/* Profession & Company */}
                    {member.profession && (
                      <div className="flex items-center gap-2">
                        <Briefcase className="w-3.5 h-3.5 text-slate-400" />
                        <span className="line-clamp-1">
                          {member.profession} {member.companyName ? `at ${member.companyName}` : ''}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Bio */}
                  {member.bio && (
                    <div className="bg-slate-50/50 p-3 rounded-xl border border-slate-100 text-xs text-slate-500 leading-relaxed italic">
                      &ldquo;{member.bio}&rdquo;
                    </div>
                  )}
                </div>

                {/* Edit / Remove controls for family admin */}
                {isOwner && (
                  <div className="px-6 py-3 bg-slate-50/50 border-t border-slate-100 flex justify-end gap-2">
                    <Link
                      to={`/family-members/${member.id}/edit`}
                      className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-200 hover:text-slate-700 transition-colors"
                      title="Edit Member Info"
                    >
                      <Edit className="w-4 h-4" />
                    </Link>
                    <button
                      onClick={() => {
                        if (window.confirm(`Are you sure you want to remove ${member.fullName} from this family profile?`)) {
                          deleteMemberMutation.mutate(member.id);
                        }
                      }}
                      className="p-1.5 rounded-lg text-slate-400 hover:bg-rose-50 hover:text-rose-500 transition-colors"
                      title="Remove Member"
                    >
                      <Trash className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
