import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useAuth } from '../contexts/AuthContext';
import { authApi } from '../services/authApi';
import { Button } from '../components/common/Button';
import { RealisticEarthScene } from '../components/3d/RealisticEarthScene';
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
  Globe2,
  Compass,
  Radio,
} from 'lucide-react';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
});

const registerSchema = z.object({
  fullName: z.string().min(2, 'Full name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type LoginFormValues = z.infer<typeof loginSchema>;
type RegisterFormValues = z.infer<typeof registerSchema>;

export const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDemoLoading, setIsDemoLoading] = useState(false);

  // Login Form
  const {
    register: registerLogin,
    handleSubmit: handleLoginSubmit,
    formState: { errors: loginErrors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  // Register Form
  const {
    register: registerSignup,
    handleSubmit: handleRegisterSubmit,
    formState: { errors: registerErrors },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: { fullName: '', email: '', password: '' },
  });

  const onLogin = async (values: LoginFormValues) => {
    try {
      setIsSubmitting(true);
      setErrorMessage(null);
      const tokens = await authApi.login({
        email: values.email,
        password: values.password,
      });
      await login(tokens);
      navigate('/dashboard');
    } catch (err: any) {
      setErrorMessage(err.message || 'Invalid email or password');
    } finally {
      setIsSubmitting(false);
    }
  };

  const onRegister = async (values: RegisterFormValues) => {
    try {
      setIsSubmitting(true);
      setErrorMessage(null);
      const tokens = await authApi.register({
        full_name: values.fullName,
        email: values.email,
        password: values.password,
        confirm_password: values.password,
      });
      await login(tokens);
      navigate('/dashboard');
    } catch (err: any) {
      setErrorMessage(err.message || 'Registration failed. Please try again.');
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
    <div className="min-h-screen bg-[#05130B] text-white flex items-center justify-center p-4 sm:p-6 lg:p-10 relative overflow-hidden">
      {/* Background Deep Cosmic Gradients */}
      <div className="absolute inset-0 bg-radial from-[#0D2818]/60 via-[#05130B] to-[#020905] pointer-events-none" />
      <div className="absolute top-10 left-1/3 w-[600px] h-[600px] bg-[#84CC16]/5 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-10 right-1/4 w-[500px] h-[500px] bg-[#38BDF8]/5 rounded-full blur-[120px] pointer-events-none" />

      {/* Main Spaceedu Cockpit Container */}
      <div className="max-w-7xl w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
        
        {/* Left 7 Columns: Hyper-Realistic 3D Earth Globe Canvas */}
        <div className="lg:col-span-7 h-[420px] sm:h-[560px] lg:h-[640px] rounded-3xl bg-[#0A2315]/40 backdrop-blur-xl border border-white/10 shadow-2xl relative overflow-hidden flex flex-col justify-between">
          <RealisticEarthScene />

          {/* Bottom Telemetry Bar */}
          <div className="p-4 sm:p-6 bg-gradient-to-t from-[#05130B]/90 to-transparent flex items-center justify-between z-20 pointer-events-none">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-[#84CC16] text-[#0D2818]">
                <Globe2 className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] font-mono uppercase tracking-widest text-[#84CC16] font-bold block">
                  BUILDMIND GEODESIC CORE
                </span>
                <span className="font-serif font-bold text-sm text-white">
                  Orbital Software Synthesis Platform
                </span>
              </div>
            </div>

            <div className="hidden sm:flex items-center gap-4 text-xs font-mono text-emerald-300">
              <div className="flex items-center gap-1.5">
                <Compass className="w-3.5 h-3.5 text-[#84CC16]" />
                <span>ORBIT: 420.8 KM</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Radio className="w-3.5 h-3.5 text-[#84CC16] animate-pulse" />
                <span>TELEMETRY: ACTIVE</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right 5 Columns: Spaceedu Glassmorphism Authentication Form */}
        <div className="lg:col-span-5 bg-[#0D2818]/85 backdrop-blur-2xl p-6 sm:p-8 rounded-3xl border border-white/15 shadow-2xl space-y-6 relative overflow-hidden">
          {/* Top Brand & Header */}
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 border border-white/15 text-xs font-mono shadow-sm">
              <Sparkles className="w-3.5 h-3.5 text-[#84CC16]" />
              <span className="text-[#84CC16] font-bold">BuildMind</span>
              <span className="text-white/40">•</span>
              <span className="text-white/80">Spaceedu Portal</span>
            </div>
            <h1 className="font-serif font-bold text-3xl sm:text-4xl text-white tracking-tight">
              {activeTab === 'login' ? 'Mission Control' : 'Initialize Account'}
            </h1>
            <p className="text-xs sm:text-sm text-white/70 font-sans">
              {activeTab === 'login'
                ? 'Sign in to access your models, SRS specs & codebases.'
                : 'Join the next-generation software architecture factory.'}
            </p>
          </div>

          {/* Tab Switcher */}
          <div className="grid grid-cols-2 p-1 bg-black/30 rounded-2xl border border-white/10">
            <button
              type="button"
              onClick={() => {
                setActiveTab('login');
                setErrorMessage(null);
              }}
              className={`py-2.5 rounded-xl text-xs font-mono font-bold transition-all ${
                activeTab === 'login'
                  ? 'bg-[#84CC16] text-[#0D2818] shadow-lg'
                  : 'text-white/70 hover:text-white'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveTab('register');
                setErrorMessage(null);
              }}
              className={`py-2.5 rounded-xl text-xs font-mono font-bold transition-all ${
                activeTab === 'register'
                  ? 'bg-[#84CC16] text-[#0D2818] shadow-lg'
                  : 'text-white/70 hover:text-white'
              }`}
            >
              Create Account
            </button>
          </div>

          {/* 1-Click Fast Launch Demo Mode */}
          <button
            type="button"
            onClick={handleDemoLogin}
            disabled={isDemoLoading || isSubmitting}
            className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-[#163E2B] to-[#0D2818] hover:from-[#1E523A] hover:to-[#163E2B] text-white border border-[#84CC16]/40 shadow-lg text-xs font-mono flex items-center justify-between group transition-all"
          >
            <div className="flex items-center gap-2.5">
              <Zap className="w-4 h-4 text-[#84CC16] animate-pulse" />
              <span className="font-semibold text-white">1-Click Fast Launch (Demo Mode)</span>
            </div>
            <span className="text-[10px] text-[#84CC16] bg-white/10 px-2 py-0.5 rounded-full group-hover:bg-[#84CC16] group-hover:text-[#0D2818] transition-colors">
              {isDemoLoading ? 'Launching...' : 'Instant Access →'}
            </span>
          </button>

          {errorMessage && (
            <div className="p-3.5 rounded-2xl bg-rose-500/20 border border-rose-500/40 text-rose-200 text-xs font-mono text-center animate-fade-in">
              {errorMessage}
            </div>
          )}

          {/* Sign In Form */}
          {activeTab === 'login' && (
            <form onSubmit={handleLoginSubmit(onLogin)} className="space-y-4">
              {/* Email */}
              <div className="space-y-1.5">
                <label className="block text-[11px] font-mono font-bold uppercase tracking-wider text-emerald-300">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-white/40 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    {...registerLogin('email')}
                    placeholder="architect@buildmind.ai"
                    className="w-full bg-black/40 text-xs text-white placeholder-white/40 pl-10 pr-4 py-3 rounded-2xl border border-white/15 focus:outline-none focus:ring-2 focus:ring-[#84CC16] transition-all font-mono"
                  />
                </div>
                {loginErrors.email && (
                  <p className="text-[11px] text-rose-400 font-mono mt-0.5">{loginErrors.email.message}</p>
                )}
              </div>

              {/* Password */}
              <div className="space-y-1.5">
                <label className="block text-[11px] font-mono font-bold uppercase tracking-wider text-emerald-300">
                  Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-white/40 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    {...registerLogin('password')}
                    placeholder="••••••••"
                    className="w-full bg-black/40 text-xs text-white placeholder-white/40 pl-10 pr-10 py-3 rounded-2xl border border-white/15 focus:outline-none focus:ring-2 focus:ring-[#84CC16] transition-all font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/50 hover:text-white transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {loginErrors.password && (
                  <p className="text-[11px] text-rose-400 font-mono mt-0.5">{loginErrors.password.message}</p>
                )}
              </div>

              <Button
                type="submit"
                size="lg"
                variant="accent"
                className="w-full mt-2"
                isLoading={isSubmitting}
                icon={<ArrowRight className="w-4 h-4" />}
              >
                Sign In to Mission Control
              </Button>
            </form>
          )}

          {/* Register Form */}
          {activeTab === 'register' && (
            <form onSubmit={handleRegisterSubmit(onRegister)} className="space-y-4">
              {/* Full Name */}
              <div className="space-y-1.5">
                <label className="block text-[11px] font-mono font-bold uppercase tracking-wider text-emerald-300">
                  Full Name
                </label>
                <div className="relative">
                  <UserIcon className="w-4 h-4 text-white/40 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    {...registerSignup('fullName')}
                    placeholder="Dr. Elena Rostova"
                    className="w-full bg-black/40 text-xs text-white placeholder-white/40 pl-10 pr-4 py-3 rounded-2xl border border-white/15 focus:outline-none focus:ring-2 focus:ring-[#84CC16] transition-all font-mono"
                  />
                </div>
                {registerErrors.fullName && (
                  <p className="text-[11px] text-rose-400 font-mono mt-0.5">{registerErrors.fullName.message}</p>
                )}
              </div>

              {/* Email */}
              <div className="space-y-1.5">
                <label className="block text-[11px] font-mono font-bold uppercase tracking-wider text-emerald-300">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-white/40 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    {...registerSignup('email')}
                    placeholder="architect@buildmind.ai"
                    className="w-full bg-black/40 text-xs text-white placeholder-white/40 pl-10 pr-4 py-3 rounded-2xl border border-white/15 focus:outline-none focus:ring-2 focus:ring-[#84CC16] transition-all font-mono"
                  />
                </div>
                {registerErrors.email && (
                  <p className="text-[11px] text-rose-400 font-mono mt-0.5">{registerErrors.email.message}</p>
                )}
              </div>

              {/* Password */}
              <div className="space-y-1.5">
                <label className="block text-[11px] font-mono font-bold uppercase tracking-wider text-emerald-300">
                  Password (min. 6 chars)
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-white/40 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    {...registerSignup('password')}
                    placeholder="••••••••"
                    className="w-full bg-black/40 text-xs text-white placeholder-white/40 pl-10 pr-10 py-3 rounded-2xl border border-white/15 focus:outline-none focus:ring-2 focus:ring-[#84CC16] transition-all font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/50 hover:text-white transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {registerErrors.password && (
                  <p className="text-[11px] text-rose-400 font-mono mt-0.5">{registerErrors.password.message}</p>
                )}
              </div>

              <Button
                type="submit"
                size="lg"
                variant="accent"
                className="w-full mt-2"
                isLoading={isSubmitting}
                icon={<ArrowRight className="w-4 h-4" />}
              >
                Create Account & Launch
              </Button>
            </form>
          )}

          {/* Security & Verification Footer */}
          <div className="pt-4 border-t border-white/10 flex items-center justify-between text-[10px] font-mono text-white/60">
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-[#84CC16]" />
              <span>JWT HS256 Protected</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#84CC16] animate-pulse" />
              <span>System: 100% Operational</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
