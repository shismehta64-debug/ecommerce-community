import React, { useEffect, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getBusiness, createBusiness, updateBusiness, getSegments } from '../../api/industry';
import { useToastStore } from '../../store/toastStore';
import { ArrowLeft, Loader2, Save } from 'lucide-react';
import ImageUploader from '../../components/ImageUploader';

const businessSchema = z.object({
  businessName: z.string().min(2, 'Business name must be at least 2 characters'),
  segment: z.string().min(1, 'Segment selection is required'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  city: z.string().min(1, 'City is required'),
  state: z.string().min(1, 'State is required'),
  address: z.string().min(5, 'Address must be at least 5 characters'),
  contactPhone: z.string().regex(/^\d{10}$/, 'Phone number must be exactly 10 digits'),
  whatsappNumber: z.string().regex(/^\d{10}$/, 'WhatsApp number must be exactly 10 digits').optional().or(z.literal('')),
  contactEmail: z.string().email('Invalid email address').optional().or(z.literal('')),
  logoUrl: z.string().optional(),
  gstNumber: z.string().max(15, 'GST must be maximum 15 characters').optional().or(z.literal('')),
});

type BusinessSchemaType = z.infer<typeof businessSchema>;

export default function BusinessForm() {
  const { businessId } = useParams<{ businessId: string }>();
  const isEditMode = !!businessId;
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const addToast = useToastStore((state) => state.addToast);

  // Fetch segments
  const { data: segments } = useQuery({
    queryKey: ['segments'],
    queryFn: getSegments,
  });

  // Fetch business if editing
  const { data: existingBusiness, isLoading: isFetching } = useQuery({
    queryKey: ['business', businessId],
    queryFn: () => getBusiness(businessId!),
    enabled: isEditMode,
  });

  const {
    register: formRegister,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<BusinessSchemaType>({
    resolver: zodResolver(businessSchema),
    defaultValues: {
      state: 'Gujarat',
    },
  });

  // Load existing business values into form
  useEffect(() => {
    if (existingBusiness) {
      reset({
        businessName: existingBusiness.businessName,
        segment: existingBusiness.segment,
        description: existingBusiness.description,
        city: existingBusiness.city,
        state: existingBusiness.state,
        address: existingBusiness.address,
        contactPhone: existingBusiness.contactPhone,
        whatsappNumber: existingBusiness.whatsappNumber || '',
        contactEmail: existingBusiness.contactEmail || '',
        logoUrl: existingBusiness.logoUrl || '',
        gstNumber: existingBusiness.gstNumber || '',
      });
    }
  }, [existingBusiness, reset]);

  // Mutations
  const mutation = useMutation({
    mutationFn: (data: BusinessSchemaType) => {
      // Clean empty strings
      const cleanedData = {
        ...data,
        whatsappNumber: data.whatsappNumber || undefined,
        contactEmail: data.contactEmail || undefined,
        gstNumber: data.gstNumber || undefined,
        logoUrl: data.logoUrl || undefined,
      } as any;

      return isEditMode
        ? updateBusiness(businessId!, cleanedData)
        : createBusiness(cleanedData);
    },
    onSuccess: (result) => {
      addToast(
        isEditMode ? 'Business profile updated successfully' : 'Business registered successfully!',
        'success'
      );
      queryClient.invalidateQueries({ queryKey: ['businesses'] });
      if (isEditMode) {
        queryClient.invalidateQueries({ queryKey: ['business', businessId] });
      }
      navigate(`/industry/${result.id}`);
    },
    onError: (error: any) => {
      const msg = error.response?.data?.error?.message || 'Failed to save business profile';
      addToast(msg, 'error');
    },
  });

  const onSubmit = (data: BusinessSchemaType) => {
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
        to={isEditMode ? `/industry/${businessId}` : '/industry'}
        className="inline-flex items-center text-slate-500 hover:text-slate-700 font-semibold mb-6 text-sm"
      >
        <ArrowLeft className="w-4 h-4 mr-1" /> Back
      </Link>

      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-100 shadow-sm">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mb-2">
          {isEditMode ? 'Edit Business Profile' : 'Register New Business'}
        </h1>
        <p className="text-sm text-slate-500 mb-8">
          Fill out all relevant commercial listing details so community buyers can find your brand.
        </p>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          
          {/* Logo Upload */}
          <div className="border-b border-slate-100 pb-6">
            <Controller
              name="logoUrl"
              control={control}
              render={({ field }) => (
                <ImageUploader value={field.value} onChange={field.onChange} label="Business Logo" />
              )}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Business Name */}
            <div className="sm:col-span-2">
              <label className="block text-sm font-semibold text-slate-700 mb-1">Business Name</label>
              <input
                type="text"
                placeholder="e.g., Surat Silk Weavers"
                {...formRegister('businessName')}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
              {errors.businessName && (
                <p className="mt-1 text-xs text-rose-500 font-medium">{errors.businessName.message}</p>
              )}
            </div>

            {/* Segment */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Industry Segment</label>
              <select
                {...formRegister('segment')}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 bg-white"
              >
                <option value="">Select Segment</option>
                {segments?.map((seg) => (
                  <option key={seg} value={seg}>
                    {seg.replace('_', ' ')}
                  </option>
                ))}
              </select>
              {errors.segment && (
                <p className="mt-1 text-xs text-rose-500 font-medium">{errors.segment.message}</p>
              )}
            </div>

            {/* GST Number */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">GSTIN Number (Optional)</label>
              <input
                type="text"
                placeholder="e.g., 24AAAAB1111C1Z1"
                {...formRegister('gstNumber')}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
              {errors.gstNumber && (
                <p className="mt-1 text-xs text-rose-500 font-medium">{errors.gstNumber.message}</p>
              )}
            </div>

            {/* Description */}
            <div className="sm:col-span-2">
              <label className="block text-sm font-semibold text-slate-700 mb-1">Description</label>
              <textarea
                rows={4}
                placeholder="Describe your manufacturing, wholesale trade, or services catalog..."
                {...formRegister('description')}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
              />
              {errors.description && (
                <p className="mt-1 text-xs text-rose-500 font-medium">{errors.description.message}</p>
              )}
            </div>

            {/* Address */}
            <div className="sm:col-span-2">
              <label className="block text-sm font-semibold text-slate-700 mb-1">Office/Factory Address</label>
              <input
                type="text"
                placeholder="Plot no, Street name, Area"
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

            {/* State */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">State</label>
              <input
                type="text"
                placeholder="Gujarat"
                {...formRegister('state')}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
              {errors.state && (
                <p className="mt-1 text-xs text-rose-500 font-medium">{errors.state.message}</p>
              )}
            </div>

            {/* Phone */}
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

            {/* WhatsApp */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">WhatsApp Number (Optional)</label>
              <input
                type="text"
                placeholder="10-digit number"
                {...formRegister('whatsappNumber')}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
              {errors.whatsappNumber && (
                <p className="mt-1 text-xs text-rose-500 font-medium">{errors.whatsappNumber.message}</p>
              )}
            </div>

            {/* Email */}
            <div className="sm:col-span-2">
              <label className="block text-sm font-semibold text-slate-700 mb-1">Contact Email (Optional)</label>
              <input
                type="email"
                placeholder="info@businessname.com"
                {...formRegister('contactEmail')}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
              {errors.contactEmail && (
                <p className="mt-1 text-xs text-rose-500 font-medium">{errors.contactEmail.message}</p>
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
                Saving Profile...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                {isEditMode ? 'Save Changes' : 'Register Business'}
              </>
            )}
          </button>

        </form>
      </div>

    </div>
  );
}
