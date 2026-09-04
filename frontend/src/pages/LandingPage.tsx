import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Badge } from '../components/common/Badge';
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
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    video.muted = true;
    const playPromise = video.play();
    if (playPromise !== undefined) {
      playPromise.catch(() => {
        // Autoplay policy fallback
      });
    }
  }, []);

  return (
    <div className="space-y-24 pb-24 bg-white text-black font-sans">
      {/* 1. CINEMATIC HERO SECTION WITH LOOPING VIDEO */}
      <section className="relative min-h-screen w-full overflow-hidden flex flex-col items-center justify-start">
        {/* Background Video */}
        <video
          ref={videoRef}
          autoPlay
          loop
          muted
          playsInline
          preload="auto"
          className="absolute inset-0 h-full w-full object-cover z-0 pointer-events-none opacity-85 transition-opacity duration-700"
        >
          <source src="/hero-bg.mp4" type="video/mp4" />
          <source
            src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260319_015952_e1deeb12-8fb7-4071-a42a-60779fc64ab6.mp4"
            type="video/mp4"
          />
        </video>

        {/* Video Gradient Overlay for high text legibility while keeping video clearly visible */}
        <div className="absolute inset-0 bg-gradient-to-b from-white/20 via-transparent to-white pointer-events-none z-0" />

        {/* Hero Content */}
        <div
          className="relative z-10 flex flex-col items-center justify-center text-center px-6 pb-40 max-w-7xl mx-auto"
          style={{ paddingTop: "calc(8rem - 75px)" }}
        >
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/70 border border-zinc-200/80 text-black shadow-xs backdrop-blur-md mb-8 animate-fade-rise">
            <span className="w-2 h-2 rounded-full bg-black animate-pulse" />
            <span className="text-xs font-sans tracking-wide uppercase text-[#6F6F6F] font-semibold">
              Production Architecture & Code Engine
            </span>
          </div>

          {/* Headline */}
          <h1
            className="font-display font-normal text-5xl sm:text-7xl md:text-8xl max-w-7xl text-black animate-fade-rise"
            style={{ lineHeight: 0.95, letterSpacing: "-2.46px" }}
          >
            Transform requirements into{' '}
            <span className="italic font-serif text-[#6F6F6F]">
              production-ready
            </span>{' '}
            software.
          </h1>

          {/* Description */}
          <p className="font-body text-base sm:text-lg max-w-2xl mt-8 leading-relaxed text-[#6F6F6F] animate-fade-rise-delay">
            From raw business ideas to complete IEEE-830 specifications, micro-modular architecture, relational ER schemas, validated codebases, and tests in minutes.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-rise-delay-2">
            <Link to="/register">
              <button
                type="button"
                className="rounded-full px-14 py-5 text-base font-medium mt-12 bg-black text-white transition-transform duration-200 hover:scale-[1.03] cursor-pointer shadow-sm inline-flex items-center gap-2"
              >
                <span>Start Project Now</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </Link>
            <a href="#workflow" className="inline-block mt-12 sm:mt-12">
              <button
                type="button"
                className="rounded-full px-8 py-5 text-base font-medium border border-zinc-200 bg-white/80 backdrop-blur-md text-black hover:bg-white transition-transform duration-200 hover:scale-[1.03] cursor-pointer shadow-xs"
              >
                Explore Full Workflow
              </button>
            </a>
          </div>
        </div>
      </section>

      {/* 2. STEP-BY-STEP WORKFLOW */}
      <section id="workflow" className="px-6 md:px-12 lg:px-20 max-w-7xl mx-auto space-y-12">
        <div className="text-center space-y-3">
          <Badge variant="lime" size="md">
            8-STAGE PIPELINE
          </Badge>
          <h2 className="text-4xl sm:text-5xl font-display text-black tracking-tight font-normal">
            The Requirement-to-Code Transformation
          </h2>
          <p className="text-base text-[#6F6F6F] max-w-2xl mx-auto font-body">
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
              desc: 'Interactive React Flow diagram and spatial view of decoupled client-server micro-modules.',
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
            <div
              key={item.step}
              className="bg-white/60 backdrop-blur-xl border border-white/50 rounded-2xl shadow-[0_25px_80px_-12px_rgba(0,0,0,0.08)] flex flex-col justify-between p-6 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="font-mono text-2xl font-bold text-black bg-zinc-100 px-2.5 py-0.5 rounded-xl border border-zinc-200">
                    {item.step}
                  </span>
                  <div className="p-2.5 rounded-xl bg-zinc-50 text-black border border-zinc-200/80">
                    <item.icon className="w-5 h-5" />
                  </div>
                </div>
                <h3 className="font-display text-2xl font-normal text-black mb-2">{item.title}</h3>
                <p className="text-xs text-[#6F6F6F] leading-relaxed font-body">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 3. PLATFORM FEATURES & ENTERPRISE POWER */}
      <section id="features" className="px-6 md:px-12 lg:px-20 max-w-7xl mx-auto space-y-12">
        <div className="bg-black text-white rounded-3xl p-8 sm:p-14 border border-zinc-800 shadow-xl relative overflow-hidden">
          <div className="max-w-3xl space-y-6 relative z-10">
            <span className="text-xs font-mono uppercase tracking-widest text-zinc-400 font-bold">
              Engineered for Real Engineering
            </span>
            <h2 className="text-4xl sm:text-5xl font-display leading-tight text-white font-normal">
              Not a prototype. A complete software synthesis factory.
            </h2>
            <p className="text-sm sm:text-base text-zinc-300 leading-relaxed font-body">
              Every visible button triggers real application logic. Edit requirements on the fly, rearrange React Flow architecture nodes, write code inside Monaco Editor, run automated tests, and download cleanly packaged ZIP archives.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
              {[
                'JWT Access & Refresh Token Rotation',
                'FastAPI Asynchronous REST Backend',
                'React 19 + TypeScript + Tailwind CSS',
                'SQLAlchemy 2.0 & PostgreSQL Relational DDL',
                'OpenAI Compatible AI Service Engine',
                'Sanitized Zero-Leak ZIP Archive Exporter',
              ].map((text, idx) => (
                <div key={idx} className="flex items-center gap-2.5 text-xs font-mono text-zinc-300">
                  <CheckCircle2 className="w-4 h-4 text-white shrink-0" />
                  <span>{text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 4. SECURITY & PRIVACY */}
      <section id="security" className="px-6 md:px-12 lg:px-20 max-w-7xl mx-auto">
        <div className="text-center space-y-3 mb-10">
          <Badge variant="lime" size="md">
            SECURITY ASSURANCE
          </Badge>
          <h2 className="text-3xl sm:text-4xl font-display text-black font-normal">
            Zero Leaks. Strict Ownership. Full Isolation.
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white/60 backdrop-blur-xl border border-white/50 rounded-2xl shadow-[0_25px_80px_-12px_rgba(0,0,0,0.08)] p-6 space-y-3">
            <Lock className="w-6 h-6 text-black" />
            <h4 className="font-display text-2xl font-normal text-black">Encrypted Credentials</h4>
            <p className="text-xs text-[#6F6F6F] leading-relaxed font-body">
              Passwords hashed with bcrypt/Argon2. Tokens signed with HS256 JWTs with automatic rotation.
            </p>
          </div>
          <div className="bg-white/60 backdrop-blur-xl border border-white/50 rounded-2xl shadow-[0_25px_80px_-12px_rgba(0,0,0,0.08)] p-6 space-y-3">
            <Shield className="w-6 h-6 text-black" />
            <h4 className="font-display text-2xl font-normal text-black">Strict Project Ownership</h4>
            <p className="text-xs text-[#6F6F6F] leading-relaxed font-body">
              Users have access only to their own workspaces, diagrams, codebases, and generated files.
            </p>
          </div>
          <div className="bg-white/60 backdrop-blur-xl border border-white/50 rounded-2xl shadow-[0_25px_80px_-12px_rgba(0,0,0,0.08)] p-6 space-y-3">
            <Download className="w-6 h-6 text-black" />
            <h4 className="font-display text-2xl font-normal text-black">Sanitized ZIP Exports</h4>
            <p className="text-xs text-[#6F6F6F] leading-relaxed font-body">
              ZIP archives strip real environment credentials and supply clean `.env.example` templates.
            </p>
          </div>
        </div>
      </section>

      {/* 5. CALL TO ACTION */}
      <section className="px-6 md:px-12 lg:px-20 max-w-5xl mx-auto text-center space-y-6 pt-6">
        <h2 className="text-4xl sm:text-5xl font-display text-black font-normal">
          Ready to build your next software project?
        </h2>
        <p className="text-base text-[#6F6F6F] max-w-xl mx-auto font-body">
          Start with a business idea or problem statement and let the platform engineer the full software architecture.
        </p>
        <Link to="/register" className="inline-block">
          <button
            type="button"
            className="rounded-full px-14 py-5 text-base font-medium bg-black text-white transition-transform duration-200 hover:scale-[1.03] cursor-pointer shadow-sm inline-flex items-center gap-2"
          >
            <Zap className="w-4 h-4" />
            <span>Create Free Account & Start</span>
          </button>
        </Link>
      </section>
    </div>
  );
};

export default LandingPage;
