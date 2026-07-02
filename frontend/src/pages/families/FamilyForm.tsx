import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getFamily, createFamily, updateFamily } from '../../api/families';
import { useToastStore } from '../../store/toastStore';
import { ArrowLeft, Loader2, Save } from 'lucide-react';

const familySchema = z.object({
  familyName: z.string().min(2, 'Family name must be at least 2 characters'),
  nativePlace: z.string().min(2, 'Native place is required'),
  currentCity: z.string().min(2, 'Current city is required'),
  currentState: z.string().min(2, 'Current state is required'),
  currentAddress: z.string().min(5, 'Current address is required'),
  contactPhone: z.string().regex(/^\d{10}$/, 'Phone number must be exactly 10 digits'),
  contactEmail: z.string().email('Invalid email address').optional().or(z.literal('')),
  isPublic: z.boolean().default(true),
});

type FamilySchemaType = z.infer<typeof familySchema>;

export default function FamilyForm() {
  const { id } = useParams<{ id: string }>();
  const isEditMode = !!id;
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const addToast = useToastStore((state) => state.addToast);

  // Fetch family if editing
  const { data: existingFamily, isLoading: isFetching } = useQuery({
    queryKey: ['familyDetail', id],
    queryFn: () => getFamily(id!),
    enabled: isEditMode,
  });

  const {
    register: formRegister,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FamilySchemaType>({
    resolver: zodResolver(familySchema) as any,
    defaultValues: {
      currentState: 'Gujarat',
      isPublic: true,
    },
  });

  // Load existing values
  useEffect(() => {
    if (existingFamily) {
      reset({
        familyName: existingFamily.familyName,
        nativePlace: existingFamily.nativePlace,
        currentCity: existingFamily.currentCity,
        currentState: existingFamily.currentState,
        currentAddress: existingFamily.currentAddress,
        contactPhone: existingFamily.contactPhone,
        contactEmail: existingFamily.contactEmail || '',
        isPublic: existingFamily.isPublic,
      });
    }
  }, [existingFamily, reset]);

  // Mutation
  const mutation = useMutation({
    mutationFn: (data: FamilySchemaType) => {
      const payload = {
        ...data,
        contactEmail: data.contactEmail || undefined,
      };
      return isEditMode ? updateFamily(id!, payload) : createFamily(payload);
    },
    onSuccess: (result) => {
      addToast(
        isEditMode ? 'Family profile updated successfully' : 'Family profile registered successfully!',
        'success'
      );
      queryClient.invalidateQueries({ queryKey: ['families'] });
      queryClient.invalidateQueries({ queryKey: ['familyDetail', result.id] });
      navigate(`/families/${result.id}`);
    },
    onError: (error: any) => {
      const msg = error.response?.data?.error?.message || 'Failed to save family profile';
      addToast(msg, 'error');
    },
  });

  const onSubmit = (data: FamilySchemaType) => {
    mutation.mutate(data);
  };

  if (isEditMode && isFetching) {
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
        to={isEditMode ? `/families/${id}` : '/families'}
        className="inline-flex items-center text-slate-500 hover:text-slate-700 font-semibold mb-6 text-sm"
      >
        <ArrowLeft className="w-4 h-4 mr-1" /> Back
      </Link>

      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-100 shadow-sm">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mb-2">
          {isEditMode ? 'Edit Family Profile' : 'Register Family Profile'}
        </h1>
        <p className="text-sm text-slate-500 mb-8">
          Fill in your family name, native home origin, current address details, and contact coordinates.
        </p>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            
            {/* Family Name */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Family Name</label>
              <input
                type="text"
                placeholder="e.g., Patel Family, Shah Family"
                {...formRegister('familyName')}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
              {errors.familyName && (
                <p className="mt-1 text-xs text-rose-500 font-medium">{errors.familyName.message}</p>
              )}
            </div>

            {/* Native Place */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Native Village / Origin Place</label>
              <input
                type="text"
                placeholder="e.g., Bardoli, Gandevi, Ahmedabad"
                {...formRegister('nativePlace')}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
              {errors.nativePlace && (
                <p className="mt-1 text-xs text-rose-500 font-medium">{errors.nativePlace.message}</p>
              )}
            </div>

            {/* Current Address */}
            <div className="sm:col-span-2">
              <label className="block text-sm font-semibold text-slate-700 mb-1">Current Residential Address</label>
              <input
                type="text"
                placeholder="Plot no, Apartment name, Area, City Pincode"
                {...formRegister('currentAddress')}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
              {errors.currentAddress && (
                <p className="mt-1 text-xs text-rose-500 font-medium">{errors.currentAddress.message}</p>
              )}
            </div>

            {/* Current City */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Current City</label>
              <input
                type="text"
                placeholder="e.g., Surat"
                {...formRegister('currentCity')}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
              {errors.currentCity && (
                <p className="mt-1 text-xs text-rose-500 font-medium">{errors.currentCity.message}</p>
              )}
            </div>

            {/* Current State */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Current State</label>
              <input
                type="text"
                placeholder="Gujarat"
                {...formRegister('currentState')}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
              {errors.currentState && (
                <p className="mt-1 text-xs text-rose-500 font-medium">{errors.currentState.message}</p>
              )}
            </div>

            {/* Contact Phone */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Contact Phone</label>
              <input
                type="text"
                placeholder="10-digit number"
                {...formRegister('contactPhone')}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
              {errors.contactPhone && (
                <p className="mt-1 text-xs text-rose-500 font-medium">{errors.contactPhone.message}</p>
              )}
            </div>

            {/* Contact Email */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Contact Email (Optional)</label>
              <input
                type="email"
                placeholder="contact@familyname.com"
                {...formRegister('contactEmail')}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
              {errors.contactEmail && (
                <p className="mt-1 text-xs text-rose-500 font-medium">{errors.contactEmail.message}</p>
              )}
            </div>

            {/* Privacy switches */}
            <div className="sm:col-span-2 flex items-center space-x-3 pt-2">
              <input
                type="checkbox"
                id="isPublic"
                {...formRegister('isPublic')}
                className="w-4 h-4 text-primary focus:ring-primary border-slate-300 rounded focus:ring-2"
              />
              <label htmlFor="isPublic" className="text-sm font-bold text-slate-700 select-none cursor-pointer">
                Make this profile PUBLIC (visible in the community family search list)
              </label>
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
                Saving Profile...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                {isEditMode ? 'Save Changes' : 'Register Family'}
              </>
            )}
          </button>

        </form>
      </div>

    </div>
  );
}
