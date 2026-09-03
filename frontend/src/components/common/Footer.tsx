import React from 'react';
import { Sparkles, Shield, Cpu } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-white text-[#6F6F6F] border-t border-zinc-200 pt-16 pb-12 transition-all font-body">
      <div className="max-w-7xl mx-auto px-8 space-y-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          {/* Brand Col */}
          <div className="space-y-4 md:col-span-1">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-black flex items-center justify-center text-white">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <span className="font-display text-3xl font-normal tracking-tight text-black">BuildMind</span>
            </div>
            <p className="text-xs text-[#6F6F6F] leading-relaxed font-body">
              Transforming software business requirements and ideas into validated, production-ready full-stack software architectures and codebases.
            </p>
            <div className="flex items-center gap-2 text-xs font-mono text-black font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              System Status: Operational
            </div>
          </div>

          {/* Workflow Links */}
          <div className="space-y-3">
            <h4 className="font-body text-xs uppercase tracking-widest text-black font-semibold">Workflow Pipeline</h4>
            <ul className="space-y-2 text-xs text-[#6F6F6F]">
              <li>1. Requirements Analysis</li>
              <li>2. IEEE 830 SRS Specification</li>
              <li>3. Micro-modular Architecture</li>
              <li>4. Relational Database & REST API</li>
              <li>5. Multi-file Code Generation</li>
              <li>6. Monaco Workspace & Testing</li>
            </ul>
          </div>

          {/* Technology Standards */}
          <div className="space-y-3">
            <h4 className="font-body text-xs uppercase tracking-widest text-black font-semibold">Tech Standards</h4>
            <ul className="space-y-2 text-xs text-[#6F6F6F]">
              <li className="flex items-center gap-1.5">
                <Cpu className="w-3.5 h-3.5 text-black" />
                FastAPI & Python 3.12+
              </li>
              <li className="flex items-center gap-1.5">
                <Cpu className="w-3.5 h-3.5 text-black" />
                React 19 & TypeScript
              </li>
              <li className="flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-black" />
                PostgreSQL 16 & ACID Isolation
              </li>
              <li className="flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-black" />
                JWT Access & Refresh Token Rotation
              </li>
            </ul>
          </div>

          {/* Enterprise & Security */}
          <div className="space-y-3">
            <h4 className="font-body text-xs uppercase tracking-widest text-black font-semibold">Security & Privacy</h4>
            <p className="text-xs text-[#6F6F6F] leading-relaxed">
              Zero hardcoded secrets, strict OWASP compliance, automated code quality auditing, and sanitized zero-leak ZIP exports.
            </p>
            <div className="pt-2">
              <span className="text-[11px] font-mono px-2.5 py-1 rounded-full bg-zinc-100 text-black border border-zinc-200">
                Argon2 & Bcrypt Protected
              </span>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-zinc-100 pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-zinc-400 gap-4">
          <p>© 2026 BuildMind AI Platform. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <span>Production Architecture Engine</span>
            <span>IEEE-830 Compliant</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
