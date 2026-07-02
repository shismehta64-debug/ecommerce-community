import React, { useEffect, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getFamily, addMember, updateMember } from '../../api/families';
import { useToastStore } from '../../store/toastStore';
import { ArrowLeft, Loader2, Save } from 'lucide-react';
import ImageUploader from '../../components/ImageUploader';
import { Relation, Gender, MaritalStatus } from '../../types';

const memberSchema = z.object({
  fullName: z.string().min(2, 'Full name must be at least 2 characters'),
  relation: z.enum(['SELF', 'SPOUSE', 'SON', 'DAUGHTER', 'FATHER', 'MOTHER', 'OTHER']),
  gender: z.enum(['MALE', 'FEMALE']),
  dob: z.string().min(1, 'Date of birth is required'),
  education: z.string().optional().or(z.literal('')),
  profession: z.string().optional().or(z.literal('')),
  companyName: z.string().optional().or(z.literal('')),
  maritalStatus: z.enum(['SINGLE', 'MARRIED', 'ENGAGED', 'DIVORCED', 'WIDOWED']),
  imageUrl: z.string().optional(),
  bio: z.string().optional().or(z.literal('')),
});

type MemberSchemaType = z.infer<typeof memberSchema>;

export default function FamilyMemberForm() {
  const { familyId, memberId } = useParams<{ familyId: string; memberId?: string }>();
  const isEditMode = !!memberId;
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const addToast = useToastStore((state) => state.addToast);

  // Fetch family details to extract the existing member if in edit mode
  const { data: family, isLoading: isFetching } = useQuery({
    queryKey: ['familyDetail', familyId],
    queryFn: () => getFamily(familyId!),
    enabled: !!familyId,
  });

  const {
    register: formRegister,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<MemberSchemaType>({
    resolver: zodResolver(memberSchema),
  });

  // Load existing values if editing
  useEffect(() => {
    if (isEditMode && family?.members) {
      const existingMember = family.members.find((m) => m.id === memberId);
      if (existingMember) {
        reset({
          fullName: existingMember.fullName,
          relation: existingMember.relation,
          gender: existingMember.gender,
          dob: new Date(existingMember.dob).toISOString().split('T')[0],
          education: existingMember.education || '',
          profession: existingMember.profession || '',
          companyName: existingMember.companyName || '',
          maritalStatus: existingMember.maritalStatus,
          imageUrl: existingMember.photoUrl || '',
          bio: existingMember.bio || '',
        });
      }
    }
  }, [family, memberId, isEditMode, reset]);

  // Mutation
  const mutation = useMutation({
    mutationFn: (data: MemberSchemaType) => {
      const payload = {
        fullName: data.fullName,
        relation: data.relation,
        gender: data.gender,
        dob: new Date(data.dob).toISOString(),
        education: data.education || undefined,
        profession: data.profession || undefined,
        companyName: data.companyName || undefined,
        maritalStatus: data.maritalStatus,
        photoUrl: data.imageUrl || undefined,
        bio: data.bio || undefined,
      };

      return isEditMode
        ? updateMember(memberId!, payload)
        : addMember(familyId!, payload);
    },
    onSuccess: () => {
      addToast(
        isEditMode ? 'Family member details updated' : 'Family member added successfully!',
        'success'
      );
      queryClient.invalidateQueries({ queryKey: ['familyDetail', familyId] });
      navigate(`/families/${familyId}`);
    },
    onError: (error: any) => {
      const msg = error.response?.data?.error?.message || 'Failed to save family member details';
      addToast(msg, 'error');
    },
  });

  const onSubmit = (data: MemberSchemaType) => {
    mutation.mutate(data);
  };

  if (isFetching) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 animate-pulse space-y-6">
        <div className="h-10 bg-slate-100 rounded-lg w-1/3" />
        <div className="h-80 bg-slate-100 rounded-3xl" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      
      {/* Back Button */}
      <Link
        to={`/families/${familyId}`}
        className="inline-flex items-center text-slate-500 hover:text-slate-700 font-semibold mb-6 text-sm"
      >
        <ArrowLeft className="w-4 h-4 mr-1" /> Back to Family
      </Link>

      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-100 shadow-sm">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mb-2">
          {isEditMode ? 'Edit Family Member' : 'Add Family Member'}
        </h1>
        <p className="text-sm text-slate-500 mb-8">
          Provide complete demographic, educational, professional, and matrimonial-relevant information for the member.
        </p>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          
          {/* Profile Photo */}
          <div className="border-b border-slate-100 pb-6">
            <Controller
              name="imageUrl"
              control={control}
              render={({ field }) => (
                <ImageUploader value={field.value} onChange={field.onChange} label="Profile Photo" />
              )}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Full Name */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Full Name</label>
              <input
                type="text"
                placeholder="e.g., Meena Patel"
                {...formRegister('fullName')}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
              {errors.fullName && (
                <p className="mt-1 text-xs text-rose-500 font-medium">{errors.fullName.message}</p>
              )}
            </div>

            {/* Relation to Head of Family */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Relation to Head</label>
              <select
                {...formRegister('relation')}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 bg-white"
              >
                <option value="">Select Relation</option>
                <option value="SELF">SELF (Head of Family)</option>
                <option value="SPOUSE">SPOUSE</option>
                <option value="SON">SON</option>
                <option value="DAUGHTER">DAUGHTER</option>
                <option value="FATHER">FATHER</option>
                <option value="MOTHER">MOTHER</option>
                <option value="OTHER">OTHER</option>
              </select>
              {errors.relation && (
                <p className="mt-1 text-xs text-rose-500 font-medium">{errors.relation.message}</p>
              )}
            </div>

            {/* Gender */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Gender</label>
              <select
                {...formRegister('gender')}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 bg-white"
              >
                <option value="">Select Gender</option>
                <option value="MALE">MALE</option>
                <option value="FEMALE">FEMALE</option>
              </select>
              {errors.gender && (
                <p className="mt-1 text-xs text-rose-500 font-medium">{errors.gender.message}</p>
              )}
            </div>

            {/* Date of Birth */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Date of Birth</label>
              <input
                type="date"
                {...formRegister('dob')}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
              {errors.dob && (
                <p className="mt-1 text-xs text-rose-500 font-medium">{errors.dob.message}</p>
              )}
            </div>

            {/* Marital Status (Matrimonial card fields) */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Marital Status</label>
              <select
                {...formRegister('maritalStatus')}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 bg-white"
              >
                <option value="">Select Status</option>
                <option value="SINGLE">SINGLE</option>
                <option value="MARRIED">MARRIED</option>
                <option value="ENGAGED">ENGAGED</option>
                <option value="DIVORCED">DIVORCED</option>
                <option value="WIDOWED">WIDOWED</option>
              </select>
              {errors.maritalStatus && (
                <p className="mt-1 text-xs text-rose-500 font-medium">{errors.maritalStatus.message}</p>
              )}
            </div>

            {/* Education */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Education Degree (Optional)</label>
              <input
                type="text"
                placeholder="e.g., B.E. Computer Science, MBA"
                {...formRegister('education')}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
              {errors.education && (
                <p className="mt-1 text-xs text-rose-500 font-medium">{errors.education.message}</p>
              )}
            </div>

            {/* Profession */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Profession / Job (Optional)</label>
              <input
                type="text"
                placeholder="e.g., Software Developer, Teacher"
                {...formRegister('profession')}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
              {errors.profession && (
                <p className="mt-1 text-xs text-rose-500 font-medium">{errors.profession.message}</p>
              )}
            </div>

            {/* Company Name */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Company / Employer Name (Optional)</label>
              <input
                type="text"
                placeholder="e.g., TCS, self-employed"
                {...formRegister('companyName')}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
              {errors.companyName && (
                <p className="mt-1 text-xs text-rose-500 font-medium">{errors.companyName.message}</p>
              )}
            </div>

            {/* Bio */}
            <div className="sm:col-span-2">
              <label className="block text-sm font-semibold text-slate-700 mb-1">Bio / Personal Details (Optional)</label>
              <textarea
                rows={3}
                placeholder="A brief personal statement (hobbies, expectations, details for matrimony searches)..."
                {...formRegister('bio')}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
              />
              {errors.bio && (
                <p className="mt-1 text-xs text-rose-500 font-medium">{errors.bio.message}</p>
              )}
            </div>
          </div>

          <button
            type="submit"
            disabled={mutation.isPending}
            className="w-full flex justify-center items-center py-3.5 px-4 border border-transparent text-sm font-bold rounded-xl text-white bg-primary hover:bg-indigo-900 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md mt-6"
          >
            {mutation.isPending ? (
              <>
                <Loader2 className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" />
                Saving Member...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                {isEditMode ? 'Save Changes' : 'Add Member'}
              </>
            )}
          </button>

        </form>
      </div>

    </div>
  );
}
