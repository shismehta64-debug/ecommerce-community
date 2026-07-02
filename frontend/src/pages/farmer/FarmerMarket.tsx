import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link, useNavigate } from 'react-router-dom';
import { listProduce } from '../../api/farmer';
import { useCart } from '../../hooks/useCart';
import { useToastStore } from '../../store/toastStore';
import { Search, MapPin, Wheat, Plus, ShoppingCart, Leaf } from 'lucide-react';
import Pagination from '../../components/Pagination';
import Badge from '../../components/Badge';
import { CropCategory, ProduceUnit } from '../../types';

export default function FarmerMarket() {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState<string>('');
  const [city, setCity] = useState('');
  const [page, setPage] = useState(1);
  const navigate = useNavigate();

  const { addToCart, cartItems } = useCart();
  const addToast = useToastStore((state) => state.addToast);

  // Fetch produce
  const { data: produceData, isLoading } = useQuery({
    queryKey: ['farmerProduce', search, category, city, page],
    queryFn: () => listProduce({ search, category, city, page, limit: 12 }),
  });

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  const handleAddToCart = async (e: React.MouseEvent, item: any) => {
    e.preventDefault(); // Stop navigation to detail page
    
    // Check if item is already in cart and if we exceed stock
    const cartItem = cartItems.find((ci) => ci.itemId === item.id);
    const currentQty = cartItem?.quantity || 0;

    if (currentQty + 1 > item.quantityAvailable) {
      addToast(`Cannot add more. Only ${item.quantityAvailable} ${item.unit} available.`, 'error');
      return;
    }

    try {
      await addToCart({
        itemType: 'FARMER_PRODUCE',
        itemId: item.id,
        quantity: 1,
      });
      addToast(`Added 1 ${item.unit} of "${item.cropName}" to cart`, 'success');
    } catch (err: any) {
      const msg = err.response?.data?.error?.message || 'Failed to add to cart. Are you logged in?';
      addToast(msg, 'error');
      if (err.response?.status === 401) {
        navigate('/login');
      }
    }
  };

  const getFullUrl = (urlPath?: string) => {
    if (!urlPath) return '';
    if (urlPath.startsWith('http')) return urlPath;
    const base = (import.meta.env.VITE_API_BASE_URL as string) || 'http://localhost:3000';
    return `${base}${urlPath.startsWith('/') ? urlPath : `/${urlPath}`}`;
  };

  const categories: CropCategory[] = ['VEGETABLE', 'FRUIT', 'GRAIN', 'DAIRY', 'OTHER'];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Farmer Marketplace</h1>
          <p className="text-sm text-slate-500 mt-1">
            Buy fresh vegetables, organic grains, and dairy items directly from growers with zero retail markups.
          </p>
        </div>
        <Link
          to="/farmer/new"
          className="inline-flex items-center gap-1 px-4 py-2 bg-primary text-white rounded-xl text-sm font-semibold hover:bg-indigo-900 transition-colors shadow-sm w-fit"
        >
          <Plus className="h-4 w-4" />
          <span>List Produce</span>
        </Link>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
          <input
            type="text"
            placeholder="Search crops..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="pl-10 w-full px-4 py-2.5 rounded-xl border border-slate-200 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm"
          />
        </div>

        {/* Category Filter */}
        <select
          value={category}
          onChange={(e) => {
            setCategory(e.target.value);
            setPage(1);
          }}
          className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm bg-white"
        >
          <option value="">All Categories</option>
          {categories.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>

        {/* City Filter */}
        <div className="relative">
          <MapPin className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
          <input
            type="text"
            placeholder="Filter by city (e.g. Navsari)"
            value={city}
            onChange={(e) => {
              setCity(e.target.value);
              setPage(1);
            }}
            className="pl-10 w-full px-4 py-2.5 rounded-xl border border-slate-200 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm"
          />
        </div>
      </div>

      {/* Main Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="h-72 rounded-3xl bg-slate-100 animate-pulse border border-slate-200" />
          ))}
        </div>
      ) : !produceData?.data || produceData.data.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-3xl border border-slate-100 shadow-sm">
          <Wheat className="h-12 w-12 text-slate-300 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-slate-700">No Produce Found</h3>
          <p className="text-slate-400 text-sm mt-1">Try resetting your filters or posting a new harvest item.</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {produceData.data.map((item) => (
              <Link
                key={item.id}
                to={`/farmer/${item.id}`}
                className="bg-white rounded-3xl border border-slate-100 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all overflow-hidden flex flex-col justify-between group"
              >
                <div>
                  {item.images && item.images.length > 0 ? (
                    <img
                      src={getFullUrl(item.images[0])}
                      alt={item.cropName}
                      className="w-full h-44 object-cover border-b border-slate-50"
                    />
                  ) : (
                    <div className="w-full h-44 bg-slate-50 border-b border-slate-100 flex items-center justify-center text-slate-300">
                      <Wheat className="w-12 h-12" />
                    </div>
                  )}

                  <div className="p-5 space-y-2">
                    <div className="flex items-center justify-between gap-1">
                      <Badge variant="info">{item.category}</Badge>
                      {item.isOrganic && (
                        <Badge variant="success" className="flex items-center gap-0.5">
                          <Leaf className="w-3 h-3" />
                          Organic
                        </Badge>
                      )}
                    </div>

                    <h3 className="font-bold text-slate-800 text-base line-clamp-1 group-hover:text-primary transition-colors mt-2">
                      {item.cropName}
                    </h3>

                    <p className="text-xs text-slate-400 flex items-center gap-0.5">
                      <MapPin className="w-3.5 h-3.5" />
                      <span>{item.village}, {item.city}</span>
                    </p>
                  </div>
                </div>

                <div className="p-5 pt-0">
                  <div className="flex items-center justify-between border-t border-slate-50 pt-4 mt-2">
                    <div>
                      <span className="text-lg font-bold text-slate-800">₹{item.pricePerUnit}</span>
                      <span className="text-slate-400 text-xs"> / {item.unit}</span>
                    </div>

                    <button
                      onClick={(e) => handleAddToCart(e, item)}
                      disabled={item.quantityAvailable <= 0}
                      className="p-2.5 bg-primary text-white rounded-xl hover:bg-indigo-900 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                      title={item.quantityAvailable <= 0 ? 'Out of stock' : 'Add to Cart'}
                    >
                      <ShoppingCart className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          <Pagination
            currentPage={produceData.meta.page}
            totalPages={produceData.meta.totalPages}
            onPageChange={handlePageChange}
          />
        </>
      )}

    </div>
  );
}
