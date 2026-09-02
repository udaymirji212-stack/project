import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import type { Project } from '../../types/project';
import { Button } from './Button';
import {
  Sparkles,
  LayoutDashboard,
  LogOut,
  PlusCircle,
  Menu,
  X,
  ChevronRight,
  FolderGit2,
} from 'lucide-react';

interface NavbarProps {
  currentProject?: Project;
}

export const Navbar: React.FC<NavbarProps> = ({ currentProject }) => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="sticky top-0 z-40 w-full bg-[#FAF7F2]/90 backdrop-blur-md border-b border-[#0D2818]/10 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        {/* Logo & Breadcrumb */}
        <div className="flex items-center gap-4">
          <Link to="/dashboard" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-full bg-[#0D2818] flex items-center justify-center text-[#84CC16] shadow-sm group-hover:scale-105 transition-transform">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <span className="font-serif font-bold text-xl tracking-tight text-[#0D2818] block leading-none">
                BuildMind
              </span>
              <span className="text-[10px] font-mono tracking-widest text-[#0D2818]/60 uppercase block mt-0.5">
                AI Software Factory
              </span>
            </div>
          </Link>

          {currentProject && (
            <div className="hidden sm:flex items-center gap-2 pl-3 border-l border-[#0D2818]/15">
              <ChevronRight className="w-3.5 h-3.5 text-[#0D2818]/40" />
              <div className="flex items-center gap-1.5 px-2.5 py-1 bg-[#0D2818]/5 rounded-lg border border-[#0D2818]/10">
                <FolderGit2 className="w-3.5 h-3.5 text-[#0D2818]/70" />
                <span className="text-xs font-serif font-bold text-[#0D2818] truncate max-w-[200px]">
                  {currentProject.name}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-8">
          <Link
            to="/#workflow"
            className="text-sm font-medium text-[#0D2818]/80 hover:text-[#0D2818] transition-colors"
          >
            Workflow
          </Link>
          <Link
            to="/#features"
            className="text-sm font-medium text-[#0D2818]/80 hover:text-[#0D2818] transition-colors"
          >
            Platform Features
          </Link>
          <Link
            to="/#security"
            className="text-sm font-medium text-[#0D2818]/80 hover:text-[#0D2818] transition-colors"
          >
            Security & RBAC
          </Link>
          {isAuthenticated && (
            <Link
              to="/dashboard"
              className={`text-sm font-medium transition-colors flex items-center gap-1.5 ${
                isActive('/dashboard') ? 'text-[#0D2818] font-semibold' : 'text-[#0D2818]/80 hover:text-[#0D2818]'
              }`}
            >
              <LayoutDashboard className="w-4 h-4 text-[#84CC16]" />
              Dashboard
            </Link>
          )}
        </nav>

        {/* Action Buttons */}
        <div className="hidden md:flex items-center gap-3">
          {isAuthenticated ? (
            <div className="flex items-center gap-3">
              <Button
                size="sm"
                variant="accent"
                icon={<PlusCircle className="w-4 h-4" />}
                onClick={() => navigate('/projects/new')}
              >
                New Project
              </Button>
              <div className="h-6 w-px bg-[#0D2818]/15 mx-1" />
              <div className="flex items-center gap-2 pl-1">
                <div className="w-8 h-8 rounded-full bg-[#0D2818]/10 flex items-center justify-center font-serif font-bold text-xs text-[#0D2818]">
                  {user?.full_name?.charAt(0).toUpperCase() || 'U'}
                </div>
                <span className="text-xs font-medium text-[#0D2818] truncate max-w-[120px]">
                  {user?.full_name}
                </span>
                <button
                  onClick={handleLogout}
                  title="Sign out"
                  className="p-1.5 rounded-full text-[#0D2818]/60 hover:text-rose-600 hover:bg-rose-50 transition-colors ml-1"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Link to="/login">
                <Button size="sm" variant="ghost">
                  Sign In
                </Button>
              </Link>
              <Link to="/register">
                <Button size="sm" variant="primary">
                  Get Started
                </Button>
              </Link>
            </div>
          )}
        </div>

        {/* Mobile menu toggle button */}
        <div className="flex md:hidden items-center gap-2">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-xl text-[#0D2818] hover:bg-[#0D2818]/5"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#FAF7F2] border-b border-[#0D2818]/15 px-4 pt-2 pb-6 space-y-3">
          <Link
            to="/#workflow"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-sm font-medium text-[#0D2818]"
          >
            Workflow
          </Link>
          <Link
            to="/#features"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-sm font-medium text-[#0D2818]"
          >
            Platform Features
          </Link>
          <Link
            to="/#security"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-sm font-medium text-[#0D2818]"
          >
            Security & RBAC
          </Link>
          {isAuthenticated ? (
            <div className="pt-3 border-t border-[#0D2818]/10 space-y-3">
              <Link
                to="/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="block py-2 text-sm font-semibold text-[#0D2818]"
              >
                Dashboard
              </Link>
              <Button
                size="sm"
                variant="accent"
                className="w-full"
                onClick={() => {
                  setMobileMenuOpen(false);
                  navigate('/projects/new');
                }}
              >
                Create New Project
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="w-full"
                onClick={() => {
                  setMobileMenuOpen(false);
                  handleLogout();
                }}
              >
                Sign Out ({user?.full_name})
              </Button>
            </div>
          ) : (
            <div className="pt-3 border-t border-[#0D2818]/10 flex flex-col gap-2">
              <Link to="/login" onClick={() => setMobileMenuOpen(false)}>
                <Button size="sm" variant="outline" className="w-full">
                  Sign In
                </Button>
              </Link>
              <Link to="/register" onClick={() => setMobileMenuOpen(false)}>
                <Button size="sm" variant="primary" className="w-full">
                  Get Started
                </Button>
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
};
