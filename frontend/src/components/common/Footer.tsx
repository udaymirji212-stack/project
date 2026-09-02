import React from 'react';
import { Sparkles, Shield, Cpu } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-[#0D2818] text-[#FAF7F2] border-t border-[#84CC16]/20 pt-16 pb-12 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          {/* Brand Col */}
          <div className="space-y-4 md:col-span-1">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-[#84CC16] flex items-center justify-center text-[#0D2818] font-bold">
                <Sparkles className="w-5 h-5" />
              </div>
              <span className="font-serif font-bold text-2xl text-white">BuildMind</span>
            </div>
            <p className="text-xs text-[#FAF7F2]/70 leading-relaxed font-sans">
              Transforming software business requirements and ideas into validated, production-ready full-stack software architectures and codebases.
            </p>
            <div className="flex items-center gap-2 text-xs font-mono text-[#84CC16]">
              <span className="w-2 h-2 rounded-full bg-[#84CC16] animate-pulse" />
              System Status: Operational
            </div>
          </div>

          {/* Workflow Links */}
          <div className="space-y-3">
            <h4 className="font-mono text-xs uppercase tracking-widest text-[#84CC16]">Workflow Pipeline</h4>
            <ul className="space-y-2 text-xs text-[#FAF7F2]/80">
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
            <h4 className="font-mono text-xs uppercase tracking-widest text-[#84CC16]">Tech Standards</h4>
            <ul className="space-y-2 text-xs text-[#FAF7F2]/80">
              <li className="flex items-center gap-1.5">
                <Cpu className="w-3.5 h-3.5 text-[#84CC16]" />
                FastAPI & Python 3.12+
              </li>
              <li className="flex items-center gap-1.5">
                <Cpu className="w-3.5 h-3.5 text-[#84CC16]" />
                React 18 & TypeScript
              </li>
              <li className="flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-[#84CC16]" />
                PostgreSQL 16 & ACID Isolation
              </li>
              <li className="flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-[#84CC16]" />
                JWT Access & Refresh Token Rotation
              </li>
            </ul>
          </div>

          {/* Enterprise & Security */}
          <div className="space-y-3">
            <h4 className="font-mono text-xs uppercase tracking-widest text-[#84CC16]">Security & Privacy</h4>
            <p className="text-xs text-[#FAF7F2]/70 leading-relaxed">
              Zero hardcoded secrets, strict OWASP compliance, automated code quality auditing, and sanitized zero-leak ZIP exports.
            </p>
            <div className="pt-2">
              <span className="text-[11px] font-mono px-2.5 py-1 rounded-full bg-white/10 text-white/90 border border-white/10">
                Argon2 & Bcrypt Protected
              </span>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-white/10 pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-[#FAF7F2]/60 gap-4">
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
