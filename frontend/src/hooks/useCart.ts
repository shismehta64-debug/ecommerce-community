import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as cartApi from '../api/cart';
import { useAuthStore } from '../store/authStore';
import { CartInput } from '../api/cart';

export function useCart() {
  const queryClient = useQueryClient();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  // Fetch Cart Items
  const cartQuery = useQuery({
    queryKey: ['cart'],
    queryFn: cartApi.getCart,
    enabled: isAuthenticated, // Only fetch cart when logged in
  });

  // Add Item to Cart
  const addToCartMutation = useMutation({
    mutationFn: (data: CartInput) => cartApi.addToCart(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
    },
  });

  // Update Cart Item Quantity
  const updateQuantityMutation = useMutation({
    mutationFn: ({ itemId, quantity }: { itemId: string; quantity: number }) =>
      cartApi.updateCartItem(itemId, quantity),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
    },
  });

  // Remove Item from Cart
  const removeItemMutation = useMutation({
    mutationFn: (itemId: string) => cartApi.removeCartItem(itemId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
    },
  });

  const cartItemsCount = cartQuery.data?.reduce((acc, item) => acc + item.quantity, 0) || 0;

  return {
    cartItems: cartQuery.data || [],
    isLoading: cartQuery.isLoading,
    isError: cartQuery.isError,
    addToCart: addToCartMutation.mutateAsync,
    isAdding: addToCartMutation.isPending,
    updateQuantity: updateQuantityMutation.mutateAsync,
    isUpdating: updateQuantityMutation.isPending,
    removeItem: removeItemMutation.mutateAsync,
    isRemoving: removeItemMutation.isPending,
    cartItemsCount,
    refetch: cartQuery.refetch,
  };
}
