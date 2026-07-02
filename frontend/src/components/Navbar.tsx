import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { useCart } from '../hooks/useCart';
import { ShoppingCart, User as UserIcon, LogOut, Menu, X, Landmark, Flower2, ShieldAlert } from 'lucide-react';
import Badge from './Badge';

export default function Navbar() {
  const { isAuthenticated, user, clearAuth } = useAuthStore();
  const { cartItemsCount } = useCart();
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    clearAuth();
    navigate('/');
  };

  const navLinks = [
    { label: 'Industry', path: '/industry' },
    { label: 'Farmer Market', path: '/farmer' },
    { label: 'Women Store', path: '/women' },
    { label: 'Social Work', path: '/social-work' },
    { label: 'Families', path: '/families' },
  ];

  const isActive = (path: string) => location.pathname.startsWith(path);

  return (
    <nav className="sticky top-0 z-40 bg-primary text-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2 font-bold text-xl tracking-wide text-white">
              <Flower2 className="h-6 w-6 text-accent" />
              <span>Community Connect</span>
            </Link>
          </div>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center space-x-6">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`text-sm font-medium hover:text-accent transition-colors ${
                  isActive(link.path) ? 'text-accent border-b-2 border-accent pb-1' : 'text-slate-100'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* User Profile and Cart Actions */}
          <div className="hidden md:flex items-center space-x-4">
            {isAuthenticated ? (
              <>
                {/* Admin indicator */}
                {user?.role === 'ADMIN' && (
                  <Link to="/admin/verifications" title="Admin Portal">
                    <Badge variant="warning" className="flex items-center gap-1 cursor-pointer">
                      <ShieldAlert className="h-3 w-3" />
                      Admin
                    </Badge>
                  </Link>
                )}

                {/* Cart Icon */}
                <Link to="/cart" className="relative p-2 text-slate-100 hover:text-accent transition-colors">
                  <ShoppingCart className="h-6 w-6" />
                  {cartItemsCount > 0 && (
                    <span className="absolute top-0 right-0 inline-flex items-center justify-center px-1.5 py-0.5 text-xs font-bold leading-none text-white bg-accent rounded-full transform translate-x-1/2 -translate-y-1/2 shadow">
                      {cartItemsCount}
                    </span>
                  )}
                </Link>

                {/* User Dashboard / Profile */}
                <Link
                  to="/dashboard"
                  className="flex items-center space-x-2 p-2 rounded-lg hover:bg-indigo-800 transition-colors"
                >
                  {user?.profilePhotoUrl ? (
                    <img
                      src={user.profilePhotoUrl.startsWith('http') ? user.profilePhotoUrl : `http://localhost:3000${user.profilePhotoUrl}`}
                      alt="Profile"
                      referrerPolicy="no-referrer"
                      className="h-8 w-8 rounded-full object-cover border border-slate-300"
                    />
                  ) : (
                    <div className="h-8 w-8 rounded-full bg-accent text-primary flex items-center justify-center font-bold">
                      {user?.fullName?.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <span className="text-sm font-semibold max-w-[120px] truncate">{user?.fullName}</span>
                </Link>

                {/* Logout */}
                <button
                  onClick={handleLogout}
                  className="p-2 rounded-lg text-slate-100 hover:bg-rose-800 hover:text-white transition-colors"
                  title="Logout"
                >
                  <LogOut className="h-5 w-5" />
                </button>
              </>
            ) : (
              <div className="flex items-center space-x-3">
                <Link
                  to="/login"
                  className="px-4 py-2 text-sm font-medium text-slate-100 hover:text-accent transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 text-sm font-medium bg-accent text-primary rounded-lg hover:bg-yellow-400 transition-colors shadow-sm"
                >
                  Register
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex items-center md:hidden space-x-2">
            {isAuthenticated && (
              <Link to="/cart" className="relative p-2 text-slate-100 hover:text-accent">
                <ShoppingCart className="h-6 w-6" />
                {cartItemsCount > 0 && (
                  <span className="absolute top-0 right-0 inline-flex items-center justify-center px-1.5 py-0.5 text-xs font-bold leading-none text-white bg-accent rounded-full">
                    {cartItemsCount}
                  </span>
                )}
              </Link>
            )}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 rounded-md hover:bg-indigo-800 focus:outline-none"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer menu */}
      {isOpen && (
        <div className="md:hidden bg-indigo-950 px-2 pt-2 pb-3 space-y-1">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              onClick={() => setIsOpen(false)}
              className={`block px-3 py-2 rounded-md text-base font-medium ${
                isActive(link.path) ? 'bg-accent text-primary' : 'text-slate-100 hover:bg-indigo-900'
              }`}
            >
              {link.label}
            </Link>
          ))}
          <div className="border-t border-indigo-900 pt-4 pb-2">
            {isAuthenticated ? (
              <div className="space-y-1 px-3">
                <div className="flex items-center space-x-3 mb-3">
                  {user?.profilePhotoUrl ? (
                    <img
                      src={user.profilePhotoUrl.startsWith('http') ? user.profilePhotoUrl : `http://localhost:3000${user.profilePhotoUrl}`}
                      alt="Profile"
                      referrerPolicy="no-referrer"
                      className="h-8 w-8 rounded-full object-cover border border-slate-300"
                    />
                  ) : (
                    <div className="h-8 w-8 rounded-full bg-accent text-primary flex items-center justify-center font-bold">
                      {user?.fullName?.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div>
                    <div className="text-sm font-semibold text-white">{user?.fullName}</div>
                    <div className="text-xs text-slate-400">{user?.role}</div>
                  </div>
                </div>
                {user?.role === 'ADMIN' && (
                  <Link
                    to="/admin/verifications"
                    onClick={() => setIsOpen(false)}
                    className="block px-3 py-2 rounded-md text-base font-medium text-slate-100 hover:bg-indigo-900"
                  >
                    Admin Portal
                  </Link>
                )}
                <Link
                  to="/dashboard"
                  onClick={() => setIsOpen(false)}
                  className="block px-3 py-2 rounded-md text-base font-medium text-slate-100 hover:bg-indigo-900"
                >
                  Dashboard
                </Link>
                <Link
                  to="/profile"
                  onClick={() => setIsOpen(false)}
                  className="block px-3 py-2 rounded-md text-base font-medium text-slate-100 hover:bg-indigo-900"
                >
                  My Profile
                </Link>
                <button
                  onClick={() => {
                    setIsOpen(false);
                    handleLogout();
                  }}
                  className="w-full text-left block px-3 py-2 rounded-md text-base font-medium text-rose-400 hover:bg-rose-900 hover:text-white"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2 px-3">
                <Link
                  to="/login"
                  onClick={() => setIsOpen(false)}
                  className="w-full text-center px-4 py-2 text-sm font-medium border border-slate-400 rounded-lg text-white hover:bg-indigo-900"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  onClick={() => setIsOpen(false)}
                  className="w-full text-center px-4 py-2 text-sm font-medium bg-accent text-primary rounded-lg hover:bg-yellow-400 font-bold"
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
