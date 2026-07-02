import React, { useEffect, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getProduct, createProduct, updateProduct } from '../../api/women';
import { useToastStore } from '../../store/toastStore';
import { ArrowLeft, Loader2, Save } from 'lucide-react';
import ImageUploader from '../../components/ImageUploader';

const womenProductSchema = z.object({
  name: z.string().min(2, 'Product name must be at least 2 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  category: z.enum([
    'HANDICRAFTS',
    'FOOD_PICKLES',
    'CLOTHING_BOUTIQUE',
    'JEWELLERY_ACCESSORIES',
    'BEAUTY_WELLNESS',
    'HOME_DECOR',
    'OTHERS',
  ]),
  price: z.coerce.number().positive('Price must be greater than 0'),
  stockQuantity: z.coerce.number().min(0, 'Stock quantity cannot be negative'),
  imageUrl: z.string().optional(),
});

type WomenProductSchemaType = z.infer<typeof womenProductSchema>;

export default function WomenProductForm() {
  const { id } = useParams<{ id: string }>();
  const isEditMode = !!id;
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const addToast = useToastStore((state) => state.addToast);

  // Fetch product if editing
  const { data: existingProduct, isLoading: isFetching } = useQuery({
    queryKey: ['womenProductDetail', id],
    queryFn: () => getProduct(id!),
    enabled: isEditMode,
  });

  const {
    register: formRegister,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<WomenProductSchemaType>({
    resolver: zodResolver(womenProductSchema) as any,
    defaultValues: {
      stockQuantity: 10,
    },
  });

  // Load existing values
  useEffect(() => {
    if (existingProduct) {
      reset({
        name: existingProduct.name,
        description: existingProduct.description,
        category: existingProduct.category,
        price: existingProduct.price,
        stockQuantity: existingProduct.stockQuantity,
        imageUrl: existingProduct.images?.[0] || '',
      });
    }
  }, [existingProduct, reset]);

  // Mutation
  const mutation = useMutation({
    mutationFn: (data: WomenProductSchemaType) => {
      const payload = {
        name: data.name,
        description: data.description,
        category: data.category,
        price: data.price,
        stockQuantity: data.stockQuantity,
        images: data.imageUrl ? [data.imageUrl] : [],
      };

      return isEditMode ? updateProduct(id!, payload) : createProduct(payload);
    },
    onSuccess: (result) => {
      addToast(
        isEditMode ? 'Product updated successfully' : 'Product listed successfully!',
        'success'
      );
      queryClient.invalidateQueries({ queryKey: ['womenProducts'] });
      queryClient.invalidateQueries({ queryKey: ['womenProductDetail', result.id] });
      navigate(`/women/${result.id}`);
    },
    onError: (error: any) => {
      const msg = error.response?.data?.error?.message || 'Failed to save product listing';
      addToast(msg, 'error');
    },
  });

  const onSubmit = (data: WomenProductSchemaType) => {
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
        to={isEditMode ? `/women/${id}` : '/women'}
        className="inline-flex items-center text-slate-500 hover:text-slate-700 font-semibold mb-6 text-sm"
      >
        <ArrowLeft className="w-4 h-4 mr-1" /> Back
      </Link>

      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-100 shadow-sm">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mb-2">
          {isEditMode ? 'Edit Product Listing' : 'List New Product'}
        </h1>
        <p className="text-sm text-slate-500 mb-8">
          Add description, pricing, category (boutique, pickles, handicrafts), stock quantities, and product photos.
        </p>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          
          {/* Image Uploader */}
          <div className="border-b border-slate-100 pb-6">
            <Controller
              name="imageUrl"
              control={control}
              render={({ field }) => (
                <ImageUploader value={field.value} onChange={field.onChange} label="Product Image" />
              )}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Product Name */}
            <div className="sm:col-span-2">
              <label className="block text-sm font-semibold text-slate-700 mb-1">Product Name</label>
              <input
                type="text"
                placeholder="e.g., Handmade Mango Pickle, Designer Bandhani Dupatta"
                {...formRegister('name')}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
              {errors.name && (
                <p className="mt-1 text-xs text-rose-500 font-medium">{errors.name.message}</p>
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
                <option value="HANDICRAFTS">HANDICRAFTS</option>
                <option value="FOOD_PICKLES">FOOD_PICKLES (Spices / Pickles)</option>
                <option value="CLOTHING_BOUTIQUE">CLOTHING_BOUTIQUE (Boutique / Fabrics)</option>
                <option value="JEWELLERY_ACCESSORIES">JEWELLERY_ACCESSORIES</option>
                <option value="BEAUTY_WELLNESS">BEAUTY_WELLNESS</option>
                <option value="HOME_DECOR">HOME_DECOR</option>
                <option value="OTHERS">OTHERS</option>
              </select>
              {errors.category && (
                <p className="mt-1 text-xs text-rose-500 font-medium">{errors.category.message}</p>
              )}
            </div>

            {/* Price */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Price (₹)</label>
              <input
                type="number"
                placeholder="e.g., 350"
                {...formRegister('price')}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
              {errors.price && (
                <p className="mt-1 text-xs text-rose-500 font-medium">{errors.price.message}</p>
              )}
            </div>

            {/* Stock Quantity */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Stock Quantity Available</label>
              <input
                type="number"
                placeholder="e.g., 50"
                {...formRegister('stockQuantity')}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
              {errors.stockQuantity && (
                <p className="mt-1 text-xs text-rose-500 font-medium">{errors.stockQuantity.message}</p>
              )}
            </div>

            {/* Description */}
            <div className="sm:col-span-2">
              <label className="block text-sm font-semibold text-slate-700 mb-1">Product Description</label>
              <textarea
                rows={4}
                placeholder="Describe your handmade item, ingredients used, sizes, or washing instructions..."
                {...formRegister('description')}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
              />
              {errors.description && (
                <p className="mt-1 text-xs text-rose-500 font-medium">{errors.description.message}</p>
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
                Saving Product...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                {isEditMode ? 'Save Changes' : 'List Product'}
              </>
            )}
          </button>

        </form>
      </div>

    </div>
  );
}
