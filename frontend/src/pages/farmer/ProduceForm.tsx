import React, { useEffect, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getProduce, createProduce, updateProduce } from '../../api/farmer';
import { useToastStore } from '../../store/toastStore';
import { ArrowLeft, Loader2, Save } from 'lucide-react';
import ImageUploader from '../../components/ImageUploader';

const produceSchema = z.object({
  cropName: z.string().min(2, 'Crop name must be at least 2 characters'),
  category: z.enum(['VEGETABLE', 'FRUIT', 'GRAIN', 'DAIRY', 'OTHER']),
  pricePerUnit: z.coerce.number().positive('Price must be greater than 0'),
  unit: z.enum(['KG', 'DOZEN', 'QUINTAL']),
  quantityAvailable: z.coerce.number().min(0, 'Quantity cannot be negative'),
  harvestDate: z.string().min(1, 'Harvest date is required'),
  village: z.string().min(2, 'Village is required'),
  city: z.string().min(2, 'City is required'),
  imageUrl: z.string().optional(),
  isOrganic: z.boolean().default(false),
});

type ProduceSchemaType = z.infer<typeof produceSchema>;

export default function ProduceForm() {
  const { id } = useParams<{ id: string }>();
  const isEditMode = !!id;
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const addToast = useToastStore((state) => state.addToast);

  // Fetch produce item if editing
  const { data: existingProduce, isLoading: isFetching } = useQuery({
    queryKey: ['farmerProduceItem', id],
    queryFn: () => getProduce(id!),
    enabled: isEditMode,
  });

  const {
    register: formRegister,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<ProduceSchemaType>({
    resolver: zodResolver(produceSchema) as any,
    defaultValues: {
      isOrganic: false,
      harvestDate: new Date().toISOString().split('T')[0],
    },
  });

  // Load existing values
  useEffect(() => {
    if (existingProduce) {
      reset({
        cropName: existingProduce.cropName,
        category: existingProduce.category,
        pricePerUnit: existingProduce.pricePerUnit,
        unit: existingProduce.unit,
        quantityAvailable: existingProduce.quantityAvailable,
        harvestDate: new Date(existingProduce.harvestDate).toISOString().split('T')[0],
        village: existingProduce.village,
        city: existingProduce.city,
        imageUrl: existingProduce.images?.[0] || '',
        isOrganic: existingProduce.isOrganic,
      });
    }
  }, [existingProduce, reset]);

  // Mutation
  const mutation = useMutation({
    mutationFn: (data: ProduceSchemaType) => {
      const payload = {
        cropName: data.cropName,
        category: data.category,
        pricePerUnit: data.pricePerUnit,
        unit: data.unit,
        quantityAvailable: data.quantityAvailable,
        harvestDate: new Date(data.harvestDate).toISOString(),
        village: data.village,
        city: data.city,
        images: data.imageUrl ? [data.imageUrl] : [],
        isOrganic: data.isOrganic,
      };

      return isEditMode ? updateProduce(id!, payload) : createProduce(payload);
    },
    onSuccess: (result) => {
      addToast(
        isEditMode ? 'Harvest listing updated successfully' : 'Harvest listing created successfully!',
        'success'
      );
      queryClient.invalidateQueries({ queryKey: ['farmerProduce'] });
      queryClient.invalidateQueries({ queryKey: ['farmerProduceItem', result.id] });
      navigate(`/farmer/${result.id}`);
    },
    onError: (error: any) => {
      const msg = error.response?.data?.error?.message || 'Failed to save harvest listing';
      addToast(msg, 'error');
    },
  });

  const onSubmit = (data: ProduceSchemaType) => {
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
        to={isEditMode ? `/farmer/${id}` : '/farmer'}
        className="inline-flex items-center text-slate-500 hover:text-slate-700 font-semibold mb-6 text-sm"
      >
        <ArrowLeft className="w-4 h-4 mr-1" /> Back
      </Link>

      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-100 shadow-sm">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mb-2">
          {isEditMode ? 'Edit Harvest Listing' : 'List New Harvest'}
        </h1>
        <p className="text-sm text-slate-500 mb-8">
          Add fresh crop harvests, pricing, units, organic certification status, and source village.
        </p>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          
          {/* Harvest Image */}
          <div className="border-b border-slate-100 pb-6">
            <Controller
              name="imageUrl"
              control={control}
              render={({ field }) => (
                <ImageUploader value={field.value} onChange={field.onChange} label="Produce Image" />
              )}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Crop Name */}
            <div className="sm:col-span-2">
              <label className="block text-sm font-semibold text-slate-700 mb-1">Crop Name</label>
              <input
                type="text"
                placeholder="e.g., Kesar Mango, Basmati Paddy, Fresh Tomato"
                {...formRegister('cropName')}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
              {errors.cropName && (
                <p className="mt-1 text-xs text-rose-500 font-medium">{errors.cropName.message}</p>
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
                <option value="VEGETABLE">VEGETABLE</option>
                <option value="FRUIT">FRUIT</option>
                <option value="GRAIN">GRAIN</option>
                <option value="DAIRY">DAIRY</option>
                <option value="OTHER">OTHER</option>
              </select>
              {errors.category && (
                <p className="mt-1 text-xs text-rose-500 font-medium">{errors.category.message}</p>
              )}
            </div>

            {/* Harvest Date */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Harvest Date</label>
              <input
                type="date"
                {...formRegister('harvestDate')}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
              {errors.harvestDate && (
                <p className="mt-1 text-xs text-rose-500 font-medium">{errors.harvestDate.message}</p>
              )}
            </div>

            {/* Price Per Unit */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Price (₹)</label>
              <input
                type="number"
                placeholder="e.g., 50"
                {...formRegister('pricePerUnit')}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
              {errors.pricePerUnit && (
                <p className="mt-1 text-xs text-rose-500 font-medium">{errors.pricePerUnit.message}</p>
              )}
            </div>

            {/* Unit */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Per Unit Of Measure</label>
              <select
                {...formRegister('unit')}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 bg-white"
              >
                <option value="">Select Unit</option>
                <option value="KG">KG</option>
                <option value="DOZEN">DOZEN</option>
                <option value="QUINTAL">QUINTAL</option>
              </select>
              {errors.unit && (
                <p className="mt-1 text-xs text-rose-500 font-medium">{errors.unit.message}</p>
              )}
            </div>

            {/* Quantity Available */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Stock Quantity Available</label>
              <input
                type="number"
                placeholder="e.g., 200"
                {...formRegister('quantityAvailable')}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
              {errors.quantityAvailable && (
                <p className="mt-1 text-xs text-rose-500 font-medium">{errors.quantityAvailable.message}</p>
              )}
            </div>

            {/* Village */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Village Name</label>
              <input
                type="text"
                placeholder="e.g., Jalalpore"
                {...formRegister('village')}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
              {errors.village && (
                <p className="mt-1 text-xs text-rose-500 font-medium">{errors.village.message}</p>
              )}
            </div>

            {/* City */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Market City</label>
              <input
                type="text"
                placeholder="e.g., Navsari"
                {...formRegister('city')}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
              {errors.city && (
                <p className="mt-1 text-xs text-rose-500 font-medium">{errors.city.message}</p>
              )}
            </div>

            {/* Organic Switch */}
            <div className="sm:col-span-2 flex items-center space-x-3 pt-2">
              <input
                type="checkbox"
                id="isOrganic"
                {...formRegister('isOrganic')}
                className="w-4 h-4 text-primary focus:ring-primary border-slate-300 rounded focus:ring-2"
              />
              <label htmlFor="isOrganic" className="text-sm font-bold text-slate-700 select-none cursor-pointer">
                This crop is 100% Organically Grown (No chemical fertilizers/pesticides used)
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
                Saving Harvest...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                {isEditMode ? 'Save Changes' : 'List Harvest'}
              </>
            )}
          </button>

        </form>
      </div>

    </div>
  );
}
