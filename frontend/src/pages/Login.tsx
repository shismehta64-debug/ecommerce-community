import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { useToastStore } from '../store/toastStore';
import { login, loginWithGoogle } from '../api/auth';
import { Loader2, Lock, Mail, Phone, User as UserIcon } from 'lucide-react';
import { GoogleLogin } from '@react-oauth/google';

const loginSchema = z.object({
  username: z.string().min(1, 'Email or Phone is required'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type LoginSchemaType = z.infer<typeof loginSchema>;

export default function Login() {
  const [isLoading, setIsLoading] = useState(false);
  const setAuth = useAuthStore((state) => state.setAuth);
  const addToast = useToastStore((state) => state.addToast);
  const navigate = useNavigate();
  const location = useLocation();

  const from = (location.state as any)?.from?.pathname || '/dashboard';

  const {
    register: formRegister,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginSchemaType>({
    resolver: zodResolver(loginSchema),
  });

  const handleGoogleSuccess = async (credentialResponse: any) => {
    if (!credentialResponse.credential) return;
    try {
      setIsLoading(true);
      const result = await loginWithGoogle(credentialResponse.credential);
      setAuth(result.user, result.token);
      addToast(`Welcome back, ${result.user.fullName}!`, 'success');
      navigate(from, { replace: true });
    } catch (error: any) {
      const msg = error.response?.data?.error?.message || 'Google Sign-in failed.';
      addToast(msg, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmit = async (data: LoginSchemaType) => {
    try {
      setIsLoading(true);
      const result = await login(data);
      setAuth(result.user, result.token);
      addToast(`Welcome back, ${result.user.fullName}!`, 'success');
      navigate(from, { replace: true });
    } catch (error: any) {
      const msg = error.response?.data?.error?.message || 'Login failed. Please check credentials.';
      addToast(msg, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 sm:p-10 rounded-3xl border border-slate-100 shadow-md">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Sign In</h2>
          <p className="mt-2 text-sm text-slate-500">
            Access your community directory, listings, and store
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-4">
            {/* Username (Email or Phone) */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">
                Email Address or Phone Number
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <UserIcon className="h-5 w-5" />
                </div>
                <input
                  type="text"
                  placeholder="e.g., admin@communityconnect.in or 9876543210"
                  {...formRegister('username')}
                  className="pl-10 w-full px-4 py-3 rounded-xl border border-slate-200 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm"
                />
              </div>
              {errors.username && (
                <p className="mt-1 text-xs text-rose-500 font-medium">{errors.username.message}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Lock className="h-5 w-5" />
                </div>
                <input
                  type="password"
                  placeholder="Enter your password"
                  {...formRegister('password')}
                  className="pl-10 w-full px-4 py-3 rounded-xl border border-slate-200 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm"
                />
              </div>
              {errors.password && (
                <p className="mt-1 text-xs text-rose-500 font-medium">{errors.password.message}</p>
              )}
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex justify-center items-center py-3 px-4 border border-transparent text-sm font-bold rounded-xl text-white bg-primary hover:bg-indigo-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow"
          >
            {isLoading ? (
              <>
                <Loader2 className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" />
                Signing in...
              </>
            ) : (
              'Sign In'
            )}
          </button>
        </form>

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-100"></div>
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-white px-2 text-slate-400">Or continue with</span>
          </div>
        </div>

        <div className="flex justify-center w-full">
          <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={() => addToast('Google Sign-in failed', 'error')}
            useOneTap
          />
        </div>

        <div className="text-center text-sm text-slate-500 mt-6">
          New to Community Connect?{' '}
          <Link to="/register" className="font-semibold text-primary hover:underline">
            Create an Account
          </Link>
        </div>
      </div>
    </div>
  );
}
