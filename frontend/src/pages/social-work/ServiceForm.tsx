import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getService, createService, updateService } from '../../api/socialWork';
import { useToastStore } from '../../store/toastStore';
import { ArrowLeft, Loader2, Save } from 'lucide-react';

const serviceSchema = z.object({
  providerType: z.enum(['INDIVIDUAL', 'NGO']),
  serviceName: z.string().min(2, 'Service name must be at least 2 characters'),
  category: z.enum([
    'EDUCATION_TUITION',
    'HEALTHCARE_CAMP',
    'SKILL_TRAINING',
    'COUNSELING',
    'LEGAL_AID',
    'OTHERS',
  ]),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  schedule: z.string().min(5, 'Schedule detail is required (e.g., Weekends 9 AM - 12 PM)'),
  city: z.string().min(1, 'City is required'),
  address: z.string().min(5, 'Address must be at least 5 characters'),
  contactPhone: z.string().regex(/^\d{10}$/, 'Phone number must be exactly 10 digits'),
});

type ServiceSchemaType = z.infer<typeof serviceSchema>;

export default function ServiceForm() {
  const { id } = useParams<{ id: string }>();
  const isEditMode = !!id;
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const addToast = useToastStore((state) => state.addToast);

  // Fetch service if editing
  const { data: existingService, isLoading: isFetching } = useQuery({
    queryKey: ['socialServiceItem', id],
    queryFn: () => getService(id!),
    enabled: isEditMode,
  });

  const {
    register: formRegister,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ServiceSchemaType>({
    resolver: zodResolver(serviceSchema),
  });

  // Load existing values
  useEffect(() => {
    if (existingService) {
      reset({
        providerType: existingService.providerType,
        serviceName: existingService.serviceName,
        category: existingService.category,
        description: existingService.description,
        schedule: existingService.schedule,
        city: existingService.city,
        address: existingService.address,
        contactPhone: existingService.contactPhone,
      });
    }
  }, [existingService, reset]);

  // Mutation
  const mutation = useMutation({
    mutationFn: (data: ServiceSchemaType) => {
      return isEditMode ? updateService(id!, data) : createService(data);
    },
    onSuccess: (result) => {
      addToast(
        isEditMode ? 'Social service listing updated' : 'Social service listed successfully!',
        'success'
      );
      queryClient.invalidateQueries({ queryKey: ['socialServices'] });
      queryClient.invalidateQueries({ queryKey: ['socialServiceItem', result.id] });
      navigate(`/social-work/${result.id}`);
    },
    onError: (error: any) => {
      const msg = error.response?.data?.error?.message || 'Failed to save social service listing';
      addToast(msg, 'error');
    },
  });

  const onSubmit = (data: ServiceSchemaType) => {
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
        to={isEditMode ? `/social-work/${id}` : '/social-work'}
        className="inline-flex items-center text-slate-500 hover:text-slate-700 font-semibold mb-6 text-sm"
      >
        <ArrowLeft className="w-4 h-4 mr-1" /> Back
      </Link>

      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-100 shadow-sm">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mb-2">
          {isEditMode ? 'Edit Social Service Profile' : 'List New Social Service'}
        </h1>
        <p className="text-sm text-slate-500 mb-8">
          Share details of free tuition, skill workshops, health camps, or legal aid offerings.
        </p>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            
            {/* Service Name */}
            <div className="sm:col-span-2">
              <label className="block text-sm font-semibold text-slate-700 mb-1">Service Name / Title</label>
              <input
                type="text"
                placeholder="e.g., Free Mathematics Evening Classes for Class 10"
                {...formRegister('serviceName')}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
              {errors.serviceName && (
                <p className="mt-1 text-xs text-rose-500 font-medium">{errors.serviceName.message}</p>
              )}
            </div>

            {/* Provider Type */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Provider Type</label>
              <select
                {...formRegister('providerType')}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 bg-white"
              >
                <option value="">Select Type</option>
                <option value="INDIVIDUAL">INDIVIDUAL</option>
                <option value="NGO">NGO (Registered Organisation)</option>
              </select>
              {errors.providerType && (
                <p className="mt-1 text-xs text-rose-500 font-medium">{errors.providerType.message}</p>
              )}
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Category</label>
              <select
                {...formRegister('category')}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 bg-white"
              >
                <option value="">Select Category</option>
                <option value="EDUCATION_TUITION">EDUCATION_TUITION (Classes / Coaching)</option>
                <option value="HEALTHCARE_CAMP">HEALTHCARE_CAMP (Medical Camps)</option>
                <option value="SKILL_TRAINING">SKILL_TRAINING (Workshops / Seminars)</option>
                <option value="COUNSELING">COUNSELING</option>
                <option value="LEGAL_AID">LEGAL_AID</option>
                <option value="OTHERS">OTHERS</option>
              </select>
              {errors.category && (
                <p className="mt-1 text-xs text-rose-500 font-medium">{errors.category.message}</p>
              )}
            </div>

            {/* Description */}
            <div className="sm:col-span-2">
              <label className="block text-sm font-semibold text-slate-700 mb-1">Service Description</label>
              <textarea
                rows={4}
                placeholder="Give a brief summary of what classes are taught, who can join, entry guidelines, or required materials..."
                {...formRegister('description')}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
              />
              {errors.description && (
                <p className="mt-1 text-xs text-rose-500 font-medium">{errors.description.message}</p>
              )}
            </div>

            {/* Schedule */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Weekly Schedule / Timings</label>
              <input
                type="text"
                placeholder="e.g., Mon-Fri 5:00 PM - 7:00 PM"
                {...formRegister('schedule')}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
              {errors.schedule && (
                <p className="mt-1 text-xs text-rose-500 font-medium">{errors.schedule.message}</p>
              )}
            </div>

            {/* Contact Phone */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Contact Phone</label>
              <input
                type="text"
                placeholder="10-digit mobile number"
                {...formRegister('contactPhone')}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
              {errors.contactPhone && (
                <p className="mt-1 text-xs text-rose-500 font-medium">{errors.contactPhone.message}</p>
              )}
            </div>

            {/* Address */}
            <div className="sm:col-span-2">
              <label className="block text-sm font-semibold text-slate-700 mb-1">Venue Address</label>
              <input
                type="text"
                placeholder="Plot no, Community Hall name, Street name"
                {...formRegister('address')}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
              {errors.address && (
                <p className="mt-1 text-xs text-rose-500 font-medium">{errors.address.message}</p>
              )}
            </div>

            {/* City */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">City</label>
              <input
                type="text"
                placeholder="e.g., Surat"
                {...formRegister('city')}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
              {errors.city && (
                <p className="mt-1 text-xs text-rose-500 font-medium">{errors.city.message}</p>
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
                Saving Service...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                {isEditMode ? 'Save Changes' : 'Post Listing'}
              </>
            )}
          </button>

        </form>
      </div>

    </div>
  );
}
