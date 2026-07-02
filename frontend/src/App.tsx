import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { GoogleOAuthProvider } from '@react-oauth/google';

// Shared Components
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/AdminRoute';
import ToastContainer from './components/Toast';

// Public Pages
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';

// Dashboard & Profile
import Dashboard from './pages/Dashboard';
import ProfileView from './pages/profile/ProfileView';

// Industry Directory Pages
import BusinessDirectory from './pages/industry/BusinessDirectory';
import BusinessDetail from './pages/industry/BusinessDetail';
import ProductDetail from './pages/industry/ProductDetail';
import BusinessForm from './pages/industry/BusinessForm';
import ProductForm from './pages/industry/ProductForm';

// Farmer Marketplace Pages
import FarmerMarket from './pages/farmer/FarmerMarket';
import ProduceDetail from './pages/farmer/ProduceDetail';
import ProduceForm from './pages/farmer/ProduceForm';

// Women Entrepreneur Store Pages
import WomenStore from './pages/women/WomenStore';
import WomenProductDetail from './pages/women/WomenProductDetail';
import WomenProductForm from './pages/women/WomenProductForm';

// Cart & Orders Pages
import CartView from './pages/cart/CartView';
import CheckoutView from './pages/cart/CheckoutView';
import OrderHistory from './pages/orders/OrderHistory';

// Social Services Pages
import ServiceList from './pages/social-work/ServiceList';
import ServiceDetail from './pages/social-work/ServiceDetail';
import ServiceForm from './pages/social-work/ServiceForm';

// Family Directory Pages
import FamilyDirectory from './pages/families/FamilyDirectory';
import FamilyDetail from './pages/families/FamilyDetail';
import FamilyForm from './pages/families/FamilyForm';
import FamilyMemberForm from './pages/families/FamilyMemberForm';

// Admin Page
import AdminVerifications from './pages/admin/AdminVerifications';

// Create TanStack Query Client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

const googleClientId = (import.meta.env.VITE_GOOGLE_CLIENT_ID as string) || '';

export default function App() {
  return (
    <GoogleOAuthProvider clientId={googleClientId}>
      <QueryClientProvider client={queryClient}>
        <Router>
          <div className="flex flex-col min-h-screen bg-warmBg">
            <Navbar />
          
          <main className="flex-grow">
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Landing />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />

              {/* Protected Dashboard & Account */}
              <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
              <Route path="/profile" element={<ProtectedRoute><ProfileView /></ProtectedRoute>} />

              {/* Industry Directory Routes */}
              <Route path="/industry" element={<BusinessDirectory />} />
              <Route path="/industry/:businessId" element={<BusinessDetail />} />
              <Route path="/industry/products/:productId" element={<ProductDetail />} />
              <Route path="/industry/new" element={<ProtectedRoute><BusinessForm /></ProtectedRoute>} />
              <Route path="/industry/:businessId/edit" element={<ProtectedRoute><BusinessForm /></ProtectedRoute>} />
              <Route path="/industry/:businessId/products/new" element={<ProtectedRoute><ProductForm /></ProtectedRoute>} />
              <Route path="/industry/products/:productId/edit" element={<ProtectedRoute><ProductForm /></ProtectedRoute>} />

              {/* Farmer Marketplace Routes */}
              <Route path="/farmer" element={<FarmerMarket />} />
              <Route path="/farmer/:id" element={<ProduceDetail />} />
              <Route path="/farmer/new" element={<ProtectedRoute><ProduceForm /></ProtectedRoute>} />
              <Route path="/farmer/:id/edit" element={<ProtectedRoute><ProduceForm /></ProtectedRoute>} />

              {/* Women Entrepreneur Store Routes */}
              <Route path="/women" element={<WomenStore />} />
              <Route path="/women/:id" element={<WomenProductDetail />} />
              <Route path="/women/new" element={<ProtectedRoute><WomenProductForm /></ProtectedRoute>} />
              <Route path="/women/:id/edit" element={<ProtectedRoute><WomenProductForm /></ProtectedRoute>} />

              {/* Cart & Checkout Routes */}
              <Route path="/cart" element={<ProtectedRoute><CartView /></ProtectedRoute>} />
              <Route path="/checkout" element={<ProtectedRoute><CheckoutView /></ProtectedRoute>} />
              <Route path="/orders" element={<ProtectedRoute><OrderHistory /></ProtectedRoute>} />

              {/* Social Services Routes */}
              <Route path="/social-work" element={<ServiceList />} />
              <Route path="/social-work/:id" element={<ServiceDetail />} />
              <Route path="/social-work/new" element={<ProtectedRoute><ServiceForm /></ProtectedRoute>} />
              <Route path="/social-work/:id/edit" element={<ProtectedRoute><ServiceForm /></ProtectedRoute>} />

              {/* Family Directory Routes */}
              <Route path="/families" element={<FamilyDirectory />} />
              <Route path="/families/:id" element={<FamilyDetail />} />
              <Route path="/families/new" element={<ProtectedRoute><FamilyForm /></ProtectedRoute>} />
              <Route path="/families/:id/edit" element={<ProtectedRoute><FamilyForm /></ProtectedRoute>} />
              <Route path="/families/:familyId/members/new" element={<ProtectedRoute><FamilyMemberForm /></ProtectedRoute>} />
              <Route path="/families/:familyId/members/:memberId/edit" element={<ProtectedRoute><FamilyMemberForm /></ProtectedRoute>} />

              {/* Admin Portal Route */}
              <Route path="/admin/verifications" element={<ProtectedRoute><AdminRoute><AdminVerifications /></AdminRoute></ProtectedRoute>} />
            </Routes>
          </main>

          <Footer />
          <ToastContainer />
          </div>
        </Router>
      </QueryClientProvider>
    </GoogleOAuthProvider>
  );
}
