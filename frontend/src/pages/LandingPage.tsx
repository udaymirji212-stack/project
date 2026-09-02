import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/common/Button';
import { Card } from '../components/common/Card';
import { Badge } from '../components/common/Badge';
import { OrbitalWorkflowCanvas } from '../components/3d/OrbitalWorkflowCanvas';
import {
  Sparkles,
  ArrowRight,
  Shield,
  Layers,
  Code2,
  Database,
  CheckCircle2,
  Terminal,
  FileText,
  Lock,
  Download,
  Zap,
} from 'lucide-react';

export const LandingPage: React.FC = () => {
  return (
    <div className="space-y-24 pb-24 overflow-hidden">
      {/* 1. HERO SECTION */}
      <section className="relative pt-12 sm:pt-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center space-y-6 max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#0D2818] text-white border border-[#84CC16]/30 shadow-md">
            <span className="w-2 h-2 rounded-full bg-[#84CC16] animate-pulse" />
            <span className="text-xs font-mono tracking-widest uppercase text-[#84CC16] font-bold">
              Production Architecture & Code Engine
            </span>
          </div>

          <h1 className="text-5xl sm:text-7xl font-serif font-bold text-[#0D2818] tracking-tight leading-[1.08]">
            Transform requirements into{' '}
            <span className="italic underline decoration-[#84CC16] decoration-wavy decoration-2">
              production-ready
            </span>{' '}
            software.
          </h1>

          <p className="text-lg sm:text-xl text-[#0D2818]/80 font-sans max-w-2xl mx-auto leading-relaxed">
            From raw business ideas to complete IEEE-830 specifications, micro-modular architecture, relational ER schemas, validated codebases, and tests in minutes.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link to="/register">
              <Button size="lg" variant="accent" icon={<ArrowRight className="w-5 h-5" />}>
                Start Project Now
              </Button>
            </Link>
            <a href="#workflow">
              <Button size="lg" variant="outline">
                Explore Full Workflow
              </Button>
            </a>
          </div>
        </div>

        {/* Interactive 3D Orbital Hero Visual */}
        <div className="mt-14 max-w-5xl mx-auto">
          <OrbitalWorkflowCanvas />
        </div>
      </section>

      {/* 2. STEP-BY-STEP WORKFLOW */}
      <section id="workflow" className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-12">
        <div className="text-center space-y-3">
          <Badge variant="lime" size="md">
            8-STAGE PIPELINE
          </Badge>
          <h2 className="text-4xl sm:text-5xl font-serif font-bold text-[#0D2818]">
            The Requirement-to-Code Transformation
          </h2>
          <p className="text-base text-[#0D2818]/70 max-w-2xl mx-auto">
            Every step is connected to real domain logic, fully editable, and persisted in your relational database.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            {
              step: '01',
              title: 'Requirement Analysis',
              desc: 'Structured functional/non-functional breakdown, user roles, user stories, and risk matrices.',
              icon: FileText,
            },
            {
              step: '02',
              title: 'IEEE 830 SRS Spec',
              desc: 'Complete 11-section Software Requirements Specification with live markdown editing and export.',
              icon: Sparkles,
            },
            {
              step: '03',
              title: 'System Architecture',
              desc: 'Interactive React Flow diagram and 3D spatial view of decoupled client-server micro-modules.',
              icon: Layers,
            },
            {
              step: '04',
              title: 'Database & REST API',
              desc: 'Entity-relationship schema DDL with relations, indexes, and full REST endpoint specifications.',
              icon: Database,
            },
            {
              step: '05',
              title: 'Code Generation',
              desc: 'Production-ready file tree with FastAPI backend, React TypeScript frontend, and Docker files.',
              icon: Code2,
            },
            {
              step: '06',
              title: 'Monaco Workspace',
              desc: 'Full embedded IDE with collapsible file tree, multi-tab editing, syntax highlighting, and live saving.',
              icon: Terminal,
            },
            {
              step: '07',
              title: 'AI Review & Testing',
              desc: 'Static security scanner, code smell detector, one-click diff fixes, and live pytest runner.',
              icon: Shield,
            },
            {
              step: '08',
              title: 'Docs & ZIP Export',
              desc: 'Automated README, deployment manuals, and one-click sanitized ZIP download ready for deployment.',
              icon: Download,
            },
          ].map((item) => (
            <Card key={item.step} hover className="flex flex-col justify-between p-6">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="font-mono text-2xl font-bold text-[#84CC16] bg-[#0D2818] px-2.5 py-0.5 rounded-xl">
                    {item.step}
                  </span>
                  <div className="p-2 rounded-xl bg-[#FAF7F2] text-[#0D2818] border border-[#0D2818]/10">
                    <item.icon className="w-5 h-5 text-[#0D2818]" />
                  </div>
                </div>
                <h3 className="font-serif font-bold text-lg text-[#0D2818] mb-2">{item.title}</h3>
                <p className="text-xs text-[#0D2818]/70 leading-relaxed font-sans">{item.desc}</p>
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* 3. PLATFORM FEATURES & ENTERPRISE POWER */}
      <section id="features" className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-12">
        <div className="bg-[#0D2818] text-white rounded-3xl p-8 sm:p-14 border border-[#84CC16]/20 shadow-2xl relative overflow-hidden">
          <div className="max-w-3xl space-y-6 relative z-10">
            <span className="text-xs font-mono uppercase tracking-widest text-[#84CC16] font-bold">
              Engineered for Real Engineering
            </span>
            <h2 className="text-4xl sm:text-5xl font-serif font-bold leading-tight">
              Not a prototype. A complete software synthesis factory.
            </h2>
            <p className="text-sm sm:text-base text-white/80 leading-relaxed">
              Every visible button triggers real application logic. Edit requirements on the fly, rearrange React Flow architecture nodes, write code inside Monaco Editor, run automated tests, and download cleanly packaged ZIP archives.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
              {[
                'JWT Access & Refresh Token Rotation',
                'FastAPI Asynchronous REST Backend',
                'React 18 + TypeScript + Tailwind CSS',
                'SQLAlchemy 2.0 & PostgreSQL Relational DDL',
                'OpenAI Compatible AI Service Engine',
                'Sanitized Zero-Leak ZIP Archive Exporter',
              ].map((text, idx) => (
                <div key={idx} className="flex items-center gap-2.5 text-xs font-mono text-emerald-300">
                  <CheckCircle2 className="w-4 h-4 text-[#84CC16] shrink-0" />
                  <span>{text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 4. SECURITY & PRIVACY */}
      <section id="security" className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center space-y-3 mb-10">
          <Badge variant="forest" size="md">
            SECURITY ASSURANCE
          </Badge>
          <h2 className="text-3xl sm:text-4xl font-serif font-bold text-[#0D2818]">
            Zero Leaks. Strict Ownership. Full Isolation.
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="p-6 space-y-3">
            <Lock className="w-6 h-6 text-[#84CC16]" />
            <h4 className="font-serif font-bold text-base text-[#0D2818]">Encrypted Credentials</h4>
            <p className="text-xs text-[#0D2818]/70 leading-relaxed font-sans">
              Passwords hashed with bcrypt/Argon2. Tokens signed with HS256 JWTs with automatic rotation.
            </p>
          </Card>
          <Card className="p-6 space-y-3">
            <Shield className="w-6 h-6 text-[#84CC16]" />
            <h4 className="font-serif font-bold text-base text-[#0D2818]">Strict Project Ownership</h4>
            <p className="text-xs text-[#0D2818]/70 leading-relaxed font-sans">
              Users have access only to their own workspaces, diagrams, codebases, and generated files.
            </p>
          </Card>
          <Card className="p-6 space-y-3">
            <Download className="w-6 h-6 text-[#84CC16]" />
            <h4 className="font-serif font-bold text-base text-[#0D2818]">Sanitized ZIP Exports</h4>
            <p className="text-xs text-[#0D2818]/70 leading-relaxed font-sans">
              ZIP archives strip real environment credentials and supply clean `.env.example` templates.
            </p>
          </Card>
        </div>
      </section>

      {/* 5. CALL TO ACTION */}
      <section className="px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto text-center space-y-6 pt-10">
        <h2 className="text-4xl sm:text-5xl font-serif font-bold text-[#0D2818]">
          Ready to build your next software project?
        </h2>
        <p className="text-base text-[#0D2818]/70 max-w-xl mx-auto">
          Start with a business idea or problem statement and let the platform engineer the full software architecture.
        </p>
        <Link to="/register" className="inline-block">
          <Button size="lg" variant="accent" icon={<Zap className="w-5 h-5" />}>
            Create Free Account & Start
          </Button>
        </Link>
      </section>
    </div>
  );
};
