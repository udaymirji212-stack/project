import React, { useState } from 'react';
import {
  X,
  Sparkles,
  Stethoscope,
  ShoppingCart,
  Receipt,
  FileCheck,
  Check,
  type LucideIcon,
} from 'lucide-react';
import type { CreateProjectPayload } from '../../services/projectApi';

interface NewProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateProjectPayload) => Promise<void>;
}

interface ProjectTemplate {
  name: string;
  category: string;
  icon: LucideIcon;
  techStack: string;
  idea: string;
  targetUsers: string;
  features: string;
  constraints: string;
}

const TEMPLATES: ProjectTemplate[] = [
  {
    name: 'FinPulse AI - Wealth & Expense Tracker',
    category: 'FinTech',
    icon: Receipt,
    techStack: 'React + FastAPI + PostgreSQL',
    idea: 'An intelligent personal wealth & SaaS expense tracking platform that automatically categorizes transactions, forecasts monthly cashflows with AI, detects recurring subscription creep, and provides multi-currency investment dashboards.',
    targetUsers: 'Individual investors, freelance professionals, remote contractors, and small business owners.',
    features: 'Automated bank CSV parsing, subscription recurring billing alerts, AI budget forecasting, interactive wealth charts, multi-currency ledger, PDF tax summary export.',
    constraints: 'Must support AES-256 encrypted storage for financial credentials, sub-100ms API queries, and responsive mobile view.',
  },
  {
    name: 'MediSync Telehealth & EHR Platform',
    category: 'HealthTech',
    icon: Stethoscope,
    techStack: 'React + FastAPI + PostgreSQL',
    idea: 'A secure cloud electronic health records and telehealth video consultation system featuring patient intake triage, appointment scheduling, encrypted doctor notes, and prescription management.',
    targetUsers: 'Doctors, clinical nurses, telemedicine patients, and hospital administrators.',
    features: 'Patient registration with medical history, slot-based doctor appointment scheduler, WebRTC consultation room, digital prescription generator, audit logging.',
    constraints: 'Strict HIPAA-compliant data partitioning, role-based access control (Doctor, Patient, Admin), zero plain-text medical records.',
  },
  {
    name: 'NexusDocs - Intelligent Document Search & RAG',
    category: 'AI & Knowledge',
    icon: FileCheck,
    techStack: 'React + FastAPI + PostgreSQL',
    idea: 'An enterprise knowledge retrieval and semantic search engine allowing engineering and legal teams to upload PDFs, manuals, and markdown files, query them with natural language, and inspect cited snippet references.',
    targetUsers: 'Legal teams, compliance officers, developers, and corporate research analysts.',
    features: 'Multi-format document ingestion (PDF, DOCX, MD), chunking & vector embedding index, interactive AI chat with source citations, workspace permission scopes.',
    constraints: 'Fast chunking latency, isolated tenant vector indices, accurate page citation linking.',
  },
  {
    name: 'NovaMart - Multi-Vendor Marketplace',
    category: 'E-Commerce',
    icon: ShoppingCart,
    techStack: 'React + FastAPI + PostgreSQL',
    idea: 'A modern multi-vendor marketplace engine supporting storefront customization, real-time inventory management, stripe checkout, merchant payout dashboards, and order tracking.',
    targetUsers: 'Independent artisans, boutique merchants, and digital shoppers.',
    features: 'Product catalog with variants and media gallery, vendor store manager, cart & checkout, order status webhook notifications, customer review system.',
    constraints: 'Optimistic UI for cart additions, ACID-compliant checkout transactions, SEO friendly product pages.',
  },
];

export const NewProjectModal: React.FC<NewProjectModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
}) => {
  const [name, setName] = useState('');
  const [businessIdea, setBusinessIdea] = useState('');
  const [targetUsers, setTargetUsers] = useState('');
  const [expectedFeatures, setExpectedFeatures] = useState('');
  const [preferredTechStack, setPreferredTechStack] = useState('React + FastAPI + PostgreSQL');
  const [constraints, setConstraints] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedTemplateIndex, setSelectedTemplateIndex] = useState<number | null>(null);

  if (!isOpen) return null;

  const handleApplyTemplate = (tmpl: ProjectTemplate, idx: number) => {
    setSelectedTemplateIndex(idx);
    setName(tmpl.name);
    setBusinessIdea(tmpl.idea);
    setTargetUsers(tmpl.targetUsers);
    setExpectedFeatures(tmpl.features);
    setPreferredTechStack(tmpl.techStack);
    setConstraints(tmpl.constraints);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !businessIdea.trim()) return;

    setIsSubmitting(true);
    try {
      await onSubmit({
        name,
        business_idea: businessIdea,
        target_users: targetUsers,
        expected_features: expectedFeatures,
        preferred_tech_stack: preferredTechStack,
        constraints,
      });
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/40 p-4 backdrop-blur-xs font-sans">
      <div className="relative w-full max-w-4xl rounded-2xl bg-white/95 backdrop-blur-xl p-6 sm:p-8 shadow-[var(--shadow-dashboard)] border border-zinc-200 max-h-[90vh] overflow-y-auto">
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute right-6 top-6 rounded-full p-2 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700 transition-colors cursor-pointer"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Header */}
        <div className="flex items-center space-x-3 mb-6">
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-zinc-900 text-white shadow-xs">
            <Sparkles className="h-5 w-5 text-indigo-400" />
          </div>
          <div>
            <h2 className="font-serif text-2xl text-zinc-900">
              Create New Software Project
            </h2>
            <p className="text-xs text-zinc-500 font-sans">
              Describe your software concept or choose a quick starter template.
            </p>
          </div>
        </div>

        {/* Template Quick Selection */}
        <div className="mb-6">
          <label className="block text-xs font-medium text-zinc-500 uppercase tracking-wider mb-2.5">
            Instant Starter Templates (Click to Auto-Fill)
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {TEMPLATES.map((t, idx) => {
              const Icon = t.icon;
              const isSelected = selectedTemplateIndex === idx;
              return (
                <button
                  key={t.name}
                  type="button"
                  onClick={() => handleApplyTemplate(t, idx)}
                  className={`p-3.5 rounded-xl text-left border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-zinc-900 text-white border-zinc-900 shadow-sm'
                      : 'bg-white text-zinc-800 border-zinc-200 hover:border-zinc-300 hover:bg-zinc-50'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div
                      className={`p-1.5 rounded-lg ${
                        isSelected ? 'bg-zinc-800 text-indigo-400' : 'bg-zinc-100 text-zinc-700'
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                    </div>
                    {isSelected && <Check className="h-4 w-4 text-indigo-400" />}
                  </div>
                  <div className="font-medium text-xs line-clamp-1">{t.name}</div>
                  <div
                    className={`text-[11px] mt-1 line-clamp-2 ${
                      isSelected ? 'text-zinc-400' : 'text-zinc-500'
                    }`}
                  >
                    {t.category} • {t.techStack.split('+')[0]}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Project Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-zinc-800 mb-1.5">
                Project Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., FinPulse AI - Smart Wealth & Ledger"
                className="saas-input"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-800 mb-1.5">
                Preferred Tech Stack
              </label>
              <select
                value={preferredTechStack}
                onChange={(e) => setPreferredTechStack(e.target.value)}
                className="saas-input cursor-pointer"
              >
                <option value="React + FastAPI + PostgreSQL">React + FastAPI + PostgreSQL (Recommended)</option>
                <option value="Next.js + Node.js + Prisma + PostgreSQL">Next.js + Node.js + Prisma + PostgreSQL</option>
                <option value="Vue 3 + Golang + PostgreSQL">Vue 3 + Golang + PostgreSQL</option>
                <option value="React + Django REST + PostgreSQL">React + Django REST + PostgreSQL</option>
                <option value="SvelteKit + Fastify + SQLite">SvelteKit + Fastify + SQLite</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-800 mb-1.5">
              Core Business Concept / Problem Statement <span className="text-red-500">*</span>
            </label>
            <textarea
              required
              rows={3}
              value={businessIdea}
              onChange={(e) => setBusinessIdea(e.target.value)}
              placeholder="Describe the application, what problem it solves, what value it brings, and how it will work..."
              className="w-full rounded-lg border border-zinc-200 bg-white p-3 font-sans text-sm text-zinc-900 outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-zinc-800 mb-1.5">
                Target User Personas
              </label>
              <input
                type="text"
                value={targetUsers}
                onChange={(e) => setTargetUsers(e.target.value)}
                placeholder="e.g., Financial managers, Freelancers, Retail customers"
                className="saas-input"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-800 mb-1.5">
                Key Features List
              </label>
              <input
                type="text"
                value={expectedFeatures}
                onChange={(e) => setExpectedFeatures(e.target.value)}
                placeholder="e.g., Auth, Dashboard, CSV import, Stripe, Reports"
                className="saas-input"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-800 mb-1.5">
              Technical Constraints & Non-Functional Requirements (Optional)
            </label>
            <input
              type="text"
              value={constraints}
              onChange={(e) => setConstraints(e.target.value)}
              placeholder="e.g., Sub-100ms response time, AES-256 data encryption, WCAG AA compliance"
              className="saas-input"
            />
          </div>

          {/* Action Buttons */}
          <div className="mt-6 pt-4 border-t border-zinc-100 flex items-center justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="rounded-full px-5 py-2.5 text-xs font-medium text-zinc-600 hover:bg-zinc-100 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !name.trim() || !businessIdea.trim()}
              className="inline-flex items-center space-x-2 rounded-full bg-zinc-900 px-6 py-2.5 text-xs font-medium text-white shadow-sm transition-all hover:bg-black disabled:opacity-50 cursor-pointer"
            >
              <Sparkles className="h-4 w-4 text-indigo-400" />
              <span>{isSubmitting ? 'Initializing Project...' : 'Start Transformation Pipeline'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
