import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import type { Project } from '../../types/project';
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
    <header className="sticky top-0 z-40 w-full bg-white/70 backdrop-blur-md transition-all">
      <div className="relative z-10 flex items-center justify-between px-8 py-6 max-w-7xl mx-auto font-body">
        {/* Logo & Breadcrumb */}
        <div className="flex items-center gap-4">
          <Link to="/dashboard" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-full bg-black flex items-center justify-center text-white shadow-xs group-hover:scale-105 transition-transform">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <span className="font-display text-3xl font-normal tracking-tight text-black">
              BuildMind
            </span>
          </Link>

          {currentProject && (
            <div className="hidden sm:flex items-center gap-2 pl-3 border-l border-zinc-200">
              <ChevronRight className="w-3.5 h-3.5 text-zinc-400" />
              <div className="flex items-center gap-1.5 px-2.5 py-1 bg-zinc-100 rounded-full border border-zinc-200">
                <FolderGit2 className="w-3.5 h-3.5 text-zinc-600" />
                <span className="text-xs font-serif font-normal text-zinc-800 truncate max-w-[200px]">
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
            className={`text-sm font-body transition-colors duration-200 ${
              isActive('/#workflow') ? 'text-black' : 'text-[#6F6F6F] hover:text-black'
            }`}
          >
            Workflow
          </Link>
          <Link
            to="/#features"
            className={`text-sm font-body transition-colors duration-200 ${
              isActive('/#features') ? 'text-black' : 'text-[#6F6F6F] hover:text-black'
            }`}
          >
            Platform Features
          </Link>
          <Link
            to="/#security"
            className={`text-sm font-body transition-colors duration-200 ${
              isActive('/#security') ? 'text-black' : 'text-[#6F6F6F] hover:text-black'
            }`}
          >
            Security & RBAC
          </Link>
          {isAuthenticated && (
            <Link
              to="/dashboard"
              className={`text-sm font-body transition-colors duration-200 flex items-center gap-1.5 ${
                isActive('/dashboard') ? 'text-black font-medium' : 'text-[#6F6F6F] hover:text-black'
              }`}
            >
              <LayoutDashboard className="w-4 h-4 text-black" />
              Dashboard
            </Link>
          )}
        </nav>

        {/* Action Buttons */}
        <div className="hidden md:flex items-center gap-3">
          {isAuthenticated ? (
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => navigate('/projects/new')}
                className="rounded-full px-6 py-2.5 text-sm font-medium bg-black text-white transition-transform duration-200 hover:scale-[1.03] inline-flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <PlusCircle className="w-4 h-4" />
                New Project
              </button>
              <div className="h-6 w-px bg-zinc-200 mx-1" />
              <div className="flex items-center gap-2 pl-1">
                <div className="w-8 h-8 rounded-full bg-zinc-100 border border-zinc-200 flex items-center justify-center font-serif text-xs text-black">
                  {user?.full_name?.charAt(0).toUpperCase() || 'U'}
                </div>
                <span className="text-xs font-medium text-black truncate max-w-[120px]">
                  {user?.full_name}
                </span>
                <button
                  type="button"
                  onClick={handleLogout}
                  title="Sign out"
                  className="p-1.5 rounded-full text-[#6F6F6F] hover:text-rose-600 hover:bg-rose-50 transition-colors ml-1 cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Link
                to="/login"
                className="text-sm font-body text-[#6F6F6F] hover:text-black transition-colors px-3 py-2"
              >
                Sign In
              </Link>
              <Link to="/register">
                <button
                  type="button"
                  className="rounded-full px-6 py-2.5 text-sm font-medium bg-black text-white transition-transform duration-200 hover:scale-[1.03] cursor-pointer shadow-xs"
                >
                  Get Started
                </button>
              </Link>
            </div>
          )}
        </div>

        {/* Mobile menu toggle button */}
        <div className="flex md:hidden items-center gap-2">
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-xl text-black hover:bg-black/5 cursor-pointer"
            aria-label="Toggle Menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white/95 backdrop-blur-md border-b border-zinc-200 px-8 pt-2 pb-6 space-y-3 font-body">
          <Link
            to="/#workflow"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-sm text-[#6F6F6F] hover:text-black transition-colors"
          >
            Workflow
          </Link>
          <Link
            to="/#features"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-sm text-[#6F6F6F] hover:text-black transition-colors"
          >
            Platform Features
          </Link>
          <Link
            to="/#security"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-sm text-[#6F6F6F] hover:text-black transition-colors"
          >
            Security & RBAC
          </Link>
          {isAuthenticated ? (
            <div className="pt-3 border-t border-zinc-100 space-y-3">
              <Link
                to="/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="block py-2 text-sm font-medium text-black"
              >
                Dashboard
              </Link>
              <button
                type="button"
                className="w-full rounded-full py-2.5 text-sm font-medium bg-black text-white cursor-pointer shadow-xs"
                onClick={() => {
                  setMobileMenuOpen(false);
                  navigate('/projects/new');
                }}
              >
                Create New Project
              </button>
              <button
                type="button"
                className="w-full rounded-full py-2.5 text-sm font-medium border border-zinc-200 text-black hover:bg-zinc-50 cursor-pointer"
                onClick={() => {
                  setMobileMenuOpen(false);
                  handleLogout();
                }}
              >
                Sign Out ({user?.full_name})
              </button>
            </div>
          ) : (
            <div className="pt-3 border-t border-zinc-100 flex flex-col gap-2">
              <Link to="/login" onClick={() => setMobileMenuOpen(false)}>
                <button
                  type="button"
                  className="w-full rounded-full py-2.5 text-sm font-medium border border-zinc-200 text-black hover:bg-zinc-50 cursor-pointer"
                >
                  Sign In
                </button>
              </Link>
              <Link to="/register" onClick={() => setMobileMenuOpen(false)}>
                <button
                  type="button"
                  className="w-full rounded-full py-2.5 text-sm font-medium bg-black text-white cursor-pointer shadow-xs"
                >
                  Get Started
                </button>
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
};
