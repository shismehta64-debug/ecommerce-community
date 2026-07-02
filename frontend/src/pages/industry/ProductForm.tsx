import React, { useEffect, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getProduct, createProduct, updateProduct } from '../../api/industry';
import { useToastStore } from '../../store/toastStore';
import { ArrowLeft, Loader2, Save } from 'lucide-react';
import ImageUploader from '../../components/ImageUploader';

const productSchema = z.object({
  name: z.string().min(2, 'Product name must be at least 2 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  category: z.string().min(1, 'Category is required'),
  priceRange: z.string().min(1, 'Price range is required (e.g., ₹500 - ₹1000)'),
  unit: z.string().min(1, 'Unit of measurement is required (e.g., Meter, Piece)'),
  imageUrl: z.string().optional(),
  moq: z.string().optional(),
});

type ProductSchemaType = z.infer<typeof productSchema>;

export default function ProductForm() {
  const { businessId, productId } = useParams<{ businessId?: string; productId?: string }>();
  const isEditMode = !!productId;
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const addToast = useToastStore((state) => state.addToast);

  // Fetch product if editing
  const { data: existingProduct, isLoading: isFetching } = useQuery({
    queryKey: ['product', productId],
    queryFn: () => getProduct(productId!),
    enabled: isEditMode,
  });

  const {
    register: formRegister,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<ProductSchemaType>({
    resolver: zodResolver(productSchema),
  });

  // Load product if editing
  useEffect(() => {
    if (existingProduct) {
      reset({
        name: existingProduct.name,
        description: existingProduct.description,
        category: existingProduct.category,
        priceRange: existingProduct.priceRange,
        unit: existingProduct.unit,
        imageUrl: existingProduct.images?.[0] || '',
        moq: existingProduct.moq || '',
      });
    }
  }, [existingProduct, reset]);

  // Mutation
  const mutation = useMutation({
    mutationFn: (data: ProductSchemaType) => {
      const payload = {
        name: data.name,
        description: data.description,
        category: data.category,
        priceRange: data.priceRange,
        unit: data.unit,
        images: data.imageUrl ? [data.imageUrl] : [],
        moq: data.moq || undefined,
      };

      return isEditMode
        ? updateProduct(productId!, payload)
        : createProduct(businessId!, payload);
    },
    onSuccess: (result) => {
      addToast(
        isEditMode ? 'Product catalog listing updated' : 'Product successfully added to catalog!',
        'success'
      );
      queryClient.invalidateQueries({ queryKey: ['businessProducts'] });
      queryClient.invalidateQueries({ queryKey: ['product', result.id] });
      navigate(isEditMode ? `/industry/products/${result.id}` : `/industry/${businessId}`);
    },
    onError: (error: any) => {
      const msg = error.response?.data?.error?.message || 'Failed to save product catalog listing';
      addToast(msg, 'error');
    },
  });

  const onSubmit = (data: ProductSchemaType) => {
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

  const handleBackPath = () => {
    if (isEditMode && existingProduct) {
      return `/industry/products/${existingProduct.id}`;
    }
    return `/industry/${businessId}`;
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      
      {/* Back Button */}
      <Link
        to={handleBackPath()}
        className="inline-flex items-center text-slate-500 hover:text-slate-700 font-semibold mb-6 text-sm"
      >
        <ArrowLeft className="w-4 h-4 mr-1" /> Back
      </Link>

      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-100 shadow-sm">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mb-2">
          {isEditMode ? 'Edit Product Catalog Item' : 'Add New Product Listing'}
        </h1>
        <p className="text-sm text-slate-500 mb-8">
          Add professional details, images, pricing range, and minimum order specs for your item.
        </p>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          
          {/* Product Image */}
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
                placeholder="e.g., Surat Georgette Designer Saree Fabric"
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
              <input
                type="text"
                placeholder="e.g., Saree Fabric, Chemicals, Machinery"
                {...formRegister('category')}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
              {errors.category && (
                <p className="mt-1 text-xs text-rose-500 font-medium">{errors.category.message}</p>
              )}
            </div>

            {/* Minimum Order Quantity (MOQ) */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Minimum Order Qty (Optional)</label>
              <input
                type="text"
                placeholder="e.g., 500 Meters, 10 Units"
                {...formRegister('moq')}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
              {errors.moq && (
                <p className="mt-1 text-xs text-rose-500 font-medium">{errors.moq.message}</p>
              )}
            </div>

            {/* Price Range */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Price Range / Estimate</label>
              <input
                type="text"
                placeholder="e.g., ₹200 - ₹500"
                {...formRegister('priceRange')}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
              {errors.priceRange && (
                <p className="mt-1 text-xs text-rose-500 font-medium">{errors.priceRange.message}</p>
              )}
            </div>

            {/* Unit */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Per Unit Of Measure</label>
              <input
                type="text"
                placeholder="e.g., Meter, Piece, Roll, Box"
                {...formRegister('unit')}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
              {errors.unit && (
                <p className="mt-1 text-xs text-rose-500 font-medium">{errors.unit.message}</p>
              )}
            </div>

            {/* Description */}
            <div className="sm:col-span-2">
              <label className="block text-sm font-semibold text-slate-700 mb-1">Product Description</label>
              <textarea
                rows={4}
                placeholder="Describe material compositions, width, colors, bulk packaging specs..."
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
                {isEditMode ? 'Save Changes' : 'Add to Catalog'}
              </>
            )}
          </button>

        </form>
      </div>

    </div>
  );
}
