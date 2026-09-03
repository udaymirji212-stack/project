import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useAuth } from '../contexts/AuthContext';
import { authApi } from '../services/authApi';
import { Button } from '../components/common/Button';
import {
  Sparkles,
  Eye,
  EyeOff,
  Lock,
  Mail,
  User as UserIcon,
  ArrowRight,
  ShieldCheck,
  Zap,
} from 'lucide-react';

const registerSchema = z
  .object({
    full_name: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.string().email('Please enter a valid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    confirm_password: z.string().min(6, 'Confirm password must be at least 6 characters'),
  })
  .refine((data) => data.password === data.confirm_password, {
    message: 'Passwords do not match',
    path: ['confirm_password'],
  });

type RegisterFormValues = z.infer<typeof registerSchema>;

export const RegisterPage: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDemoLoading, setIsDemoLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      full_name: '',
      email: '',
      password: '',
      confirm_password: '',
    },
  });

  const onSubmit = async (values: RegisterFormValues) => {
    try {
      setIsSubmitting(true);
      setErrorMessage(null);
      const tokens = await authApi.register({
        full_name: values.full_name,
        email: values.email,
        password: values.password,
        confirm_password: values.confirm_password,
      });
      await login(tokens);
      navigate('/dashboard');
    } catch (err: any) {
      setErrorMessage(err.message || 'Registration failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDemoLogin = async () => {
    try {
      setIsDemoLoading(true);
      setErrorMessage(null);
      try {
        const tokens = await authApi.login({
          email: 'demo@buildmind.ai',
          password: 'Password123!',
        });
        await login(tokens);
      } catch {
        const tokens = await authApi.register({
          full_name: 'Demo Architect',
          email: 'demo@buildmind.ai',
          password: 'Password123!',
          confirm_password: 'Password123!',
        });
        await login(tokens);
      }
      navigate('/dashboard');
    } catch (err: any) {
      setErrorMessage(err.message || 'Demo login failed');
    } finally {
      setIsDemoLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA] text-zinc-900 flex items-center justify-center p-4 sm:p-6 lg:p-10 font-sans relative overflow-hidden">
      {/* Soft Ambient SaaS Gradient */}
      <div className="absolute top-[-10%] left-[20%] w-[500px] h-[500px] bg-indigo-50/60 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[20%] w-[500px] h-[500px] bg-blue-50/60 rounded-full blur-[100px] pointer-events-none" />

      {/* Main SaaS Container */}
      <div className="max-w-md w-full relative z-10 space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <Link to="/" className="inline-flex items-center gap-2.5 mb-2 group">
            <div className="w-10 h-10 rounded-full bg-zinc-900 flex items-center justify-center text-white shadow-xs group-hover:scale-105 transition-transform">
              <Sparkles className="w-5 h-5 text-indigo-400" />
            </div>
            <span className="font-serif font-bold text-2xl text-zinc-900">BuildMind</span>
          </Link>
          <h1 className="font-serif text-3xl sm:text-4xl text-zinc-900 tracking-tight">
            Create your account
          </h1>
          <p className="text-sm text-zinc-500 font-sans">
            Start synthesizing enterprise software with AI in minutes.
          </p>
        </div>

        {/* Card Container */}
        <div className="rounded-2xl border border-zinc-200 bg-white/90 backdrop-blur-xl p-6 sm:p-8 shadow-[var(--shadow-dashboard)] space-y-6">
          {/* Tab Switcher */}
          <div className="grid grid-cols-2 p-1 bg-zinc-100 rounded-xl border border-zinc-200/80">
            <button
              type="button"
              onClick={() => navigate('/login')}
              className="py-2 rounded-lg text-xs font-medium font-sans text-zinc-500 hover:text-zinc-900 transition-all cursor-pointer"
            >
              Sign In
            </button>
            <button
              type="button"
              className="py-2 rounded-lg text-xs font-medium font-sans bg-white text-zinc-900 shadow-xs transition-all cursor-pointer"
            >
              Create Account
            </button>
          </div>

          {/* 1-Click Fast Launch Demo Mode */}
          <button
            type="button"
            onClick={handleDemoLogin}
            disabled={isDemoLoading || isSubmitting}
            className="w-full py-2.5 px-4 rounded-xl bg-indigo-50/80 hover:bg-indigo-50 text-indigo-900 border border-indigo-200/80 text-xs font-sans flex items-center justify-between group transition-all cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-indigo-600 animate-pulse" />
              <span className="font-medium text-zinc-800">1-Click Fast Launch (Demo Mode)</span>
            </div>
            <span className="text-[11px] font-semibold text-indigo-600">
              {isDemoLoading ? 'Launching...' : 'Instant Access →'}
            </span>
          </button>

          {errorMessage && (
            <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-600 text-sm font-sans text-center">
              {errorMessage}
            </div>
          )}

          {/* Register Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-zinc-800">
                Full Name
              </label>
              <div className="relative">
                <UserIcon className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  {...register('full_name')}
                  placeholder="Elena Rostova"
                  className="h-11 w-full rounded-lg border border-zinc-200 bg-white pl-10 pr-4 font-body text-sm text-zinc-900 outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              {errors.full_name && (
                <p className="text-sm text-red-600 mt-0.5">{errors.full_name.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-zinc-800">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="email"
                  {...register('email')}
                  placeholder="architect@buildmind.ai"
                  className="h-11 w-full rounded-lg border border-zinc-200 bg-white pl-10 pr-4 font-body text-sm text-zinc-900 outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              {errors.email && (
                <p className="text-sm text-red-600 mt-0.5">{errors.email.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-zinc-800">
                Password (min. 6 chars)
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  {...register('password')}
                  placeholder="••••••••"
                  className="h-11 w-full rounded-lg border border-zinc-200 bg-white pl-10 pr-10 font-body text-sm text-zinc-900 outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && (
                <p className="text-sm text-red-600 mt-0.5">{errors.password.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-zinc-800">
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  {...register('confirm_password')}
                  placeholder="••••••••"
                  className="h-11 w-full rounded-lg border border-zinc-200 bg-white pl-10 pr-4 font-body text-sm text-zinc-900 outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              {errors.confirm_password && (
                <p className="text-sm text-red-600 mt-0.5">{errors.confirm_password.message}</p>
              )}
            </div>

            <Button
              type="submit"
              size="md"
              variant="primary"
              className="w-full mt-2"
              isLoading={isSubmitting}
              icon={<ArrowRight className="w-4 h-4" />}
            >
              Create Account & Launch
            </Button>
          </form>

          {/* Security & Verification Footer */}
          <div className="pt-3 border-t border-zinc-100 flex items-center justify-between text-xs text-zinc-400 font-sans">
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-indigo-600" />
              <span>Bcrypt & Argon2 Hashed</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>System: Operational</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
