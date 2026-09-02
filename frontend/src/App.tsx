import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { AppLayout } from './components/layout/AppLayout';
import { ProjectLayout } from './components/layout/ProjectLayout';

// Pages
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { DashboardPage } from './pages/DashboardPage';
import { NewProjectPage } from './pages/NewProjectPage';
import { RequirementsPage } from './pages/RequirementsPage';
import { SrsPage } from './pages/SrsPage';
import { ArchitecturePage } from './pages/ArchitecturePage';
import { DatabaseApiPage } from './pages/DatabaseApiPage';
import { CodeGenerationPage } from './pages/CodeGenerationPage';
import { WorkspacePage } from './pages/WorkspacePage';
import { ReviewTestingPage } from './pages/ReviewTestingPage';
import { DocumentationPage } from './pages/DocumentationPage';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 1000 * 30, // 30 seconds
    },
  },
});

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#FAF7F2] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-[#0D2818] border-t-[#84CC16] rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

const PublicOnlyRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#FAF7F2] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-[#0D2818] border-t-[#84CC16] rounded-full animate-spin" />
      </div>
    );
  }

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

import { ErrorBoundary } from './components/common/ErrorBoundary';

export default function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <BrowserRouter>
            <Routes>
              {/* Main Layout wrapper */}
              <Route element={<AppLayout />}>
                {/* Public Routes */}
                <Route path="/" element={<LandingPage />} />
                <Route
                  path="/login"
                  element={
                    <PublicOnlyRoute>
                      <LoginPage />
                    </PublicOnlyRoute>
                  }
                />
                <Route
                  path="/register"
                  element={
                    <PublicOnlyRoute>
                      <RegisterPage />
                    </PublicOnlyRoute>
                  }
                />

                {/* Protected Dashboard & Project Routes */}
                <Route
                  path="/dashboard"
                  element={
                    <ProtectedRoute>
                      <DashboardPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/projects/new"
                  element={
                    <ProtectedRoute>
                      <NewProjectPage />
                    </ProtectedRoute>
                  }
                />

                {/* Nested Project Stage Workflow Routes */}
                <Route
                  path="/projects/:projectId"
                  element={
                    <ProtectedRoute>
                      <ProjectLayout />
                    </ProtectedRoute>
                  }
                >
                  <Route index element={<Navigate to="requirements" replace />} />
                  <Route path="requirements" element={<RequirementsPage />} />
                  <Route path="srs" element={<SrsPage />} />
                  <Route path="architecture" element={<ArchitecturePage />} />
                  <Route path="database-api" element={<DatabaseApiPage />} />
                  <Route path="code-generation" element={<CodeGenerationPage />} />
                  <Route path="workspace" element={<WorkspacePage />} />
                  <Route path="review-testing" element={<ReviewTestingPage />} />
                  <Route path="documentation" element={<DocumentationPage />} />
                </Route>
              </Route>

              {/* Fallback */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </BrowserRouter>
        </AuthProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}
