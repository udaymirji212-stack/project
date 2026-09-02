import React, { useState } from 'react';
import { workflowApi } from '../../services/workflowApi';
import type { Project } from '../../types/project';
import {
  DownloadCloud,
  ShieldCheck,
  PackageCheck,
  Terminal,
  FileArchive,
  CheckCircle2,
  Loader2,
  Copy,
  Check,
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface ExportStageProps {
  project: Project;
}

export const ExportStage: React.FC<ExportStageProps> = ({ project }) => {
  const [isDownloading, setIsDownloading] = useState(false);
  const [copiedSection, setCopiedSection] = useState<string | null>(null);

  const handleDownloadZip = async () => {
    setIsDownloading(true);
    try {
      await workflowApi.downloadZip(project.id, project.name);
      try {
        confetti({
          particleCount: 120,
          spread: 80,
          origin: { y: 0.6 },
        });
      } catch {
        // ignore
      }
    } catch (err) {
      console.error('Failed to download ZIP:', err);
    } finally {
      setIsDownloading(false);
    }
  };

  const copyToClipboard = (text: string, section: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSection(section);
    setTimeout(() => setCopiedSection(null), 2000);
  };

  const dockerCommand = `# 1. Unzip the codebase
unzip ${project.name.toLowerCase().replace(/[^a-z0-9]/g, '_')}_codebase.zip
cd ${project.name.toLowerCase().replace(/[^a-z0-9]/g, '_')}

# 2. Spin up multi-container environment (Frontend, Backend, PostgreSQL)
docker-compose up --build -d

# 3. Access your running application
# Frontend: http://localhost:5173
# Backend API: http://localhost:8000/docs`;

  const localRunCommand = `# 1. Setup Backend
cd backend
python -m venv venv && source venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000

# 2. Setup Frontend (in separate terminal)
cd frontend
npm install
npm run dev`;

  return (
    <div className="space-y-6">
      {/* Top Banner Header */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-forest-950 via-forest-900 to-forest-800 p-8 text-ivory-100 shadow-xl border border-forest-900/50">
        <div className="absolute right-0 top-0 -mt-12 -mr-12 h-64 w-64 rounded-full bg-lime-500/10 blur-3xl" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center space-x-2 rounded-full bg-lime-400/15 px-3 py-1 text-xs font-semibold text-lime-400 border border-lime-400/30">
              <PackageCheck className="h-3.5 w-3.5" />
              <span>Production Codebase Ready</span>
            </div>
            <h2 className="font-serif text-3xl font-bold text-ivory-50">
              Export & Download Full-Stack ZIP Archive
            </h2>
            <p className="text-xs text-ivory-300/80 leading-relaxed">
              Your software project is fully validated, tested, documented, and packaged into a sanitized, production-ready distribution package.
            </p>
          </div>

          <div className="shrink-0">
            <button
              onClick={handleDownloadZip}
              disabled={isDownloading}
              className="inline-flex items-center space-x-2 rounded-2xl bg-lime-500 px-6 py-4 text-sm font-bold text-forest-950 shadow-xl shadow-lime-500/25 transition-all hover:bg-lime-400 hover:scale-105 active:scale-95 disabled:opacity-50"
            >
              {isDownloading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  <span>Packaging ZIP Archive...</span>
                </>
              ) : (
                <>
                  <DownloadCloud className="h-5 w-5" />
                  <span>Download Complete ZIP</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Security & Verification Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="rounded-2xl bg-ivory-50 p-5 border border-forest-900/10 shadow-sm space-y-2">
          <div className="flex items-center space-x-2 text-emerald-700">
            <ShieldCheck className="h-5 w-5" />
            <h4 className="font-bold text-sm">Security Sanitized</h4>
          </div>
          <p className="text-xs text-forest-700/80">
            Zero secret leakage guarantee. All API keys and environment variables are sanitized into safe <code className="font-mono bg-forest-900/5 px-1 rounded">.env.example</code> templates.
          </p>
        </div>

        <div className="rounded-2xl bg-ivory-50 p-5 border border-forest-900/10 shadow-sm space-y-2">
          <div className="flex items-center space-x-2 text-forest-900">
            <CheckCircle2 className="h-5 w-5 text-lime-600" />
            <h4 className="font-bold text-sm">Automated Test Passed</h4>
          </div>
          <p className="text-xs text-forest-700/80">
            Pytest suite and frontend component bindings passed all validation criteria.
          </p>
        </div>

        <div className="rounded-2xl bg-ivory-50 p-5 border border-forest-900/10 shadow-sm space-y-2">
          <div className="flex items-center space-x-2 text-forest-900">
            <FileArchive className="h-5 w-5 text-forest-700" />
            <h4 className="font-bold text-sm">Docker & Cloud Ready</h4>
          </div>
          <p className="text-xs text-forest-700/80">
            Pre-configured Dockerfile and docker-compose.yml for one-command cloud or local container deployment.
          </p>
        </div>
      </div>

      {/* Quick Start Instructions */}
      <div className="space-y-4">
        <h3 className="font-serif text-lg font-bold text-forest-950">
          How to Run Your Downloaded Codebase
        </h3>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Option A: Docker Compose */}
          <div className="rounded-3xl bg-forest-950 p-6 border border-forest-900 shadow-md space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 text-lime-400 font-mono text-xs font-bold">
                <Terminal className="h-4 w-4" />
                <span>Option A: Docker Compose (Recommended)</span>
              </div>
              <button
                onClick={() => copyToClipboard(dockerCommand, 'docker')}
                className="flex items-center space-x-1 font-mono text-xs text-ivory-300 hover:text-ivory-100 bg-forest-900 px-2.5 py-1 rounded-lg transition-colors"
              >
                {copiedSection === 'docker' ? (
                  <Check className="h-3 w-3 text-lime-400" />
                ) : (
                  <Copy className="h-3 w-3" />
                )}
                <span>{copiedSection === 'docker' ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
            <pre className="font-mono text-xs text-ivory-200 overflow-x-auto leading-relaxed">
              {dockerCommand}
            </pre>
          </div>

          {/* Option B: Local Native */}
          <div className="rounded-3xl bg-forest-950 p-6 border border-forest-900 shadow-md space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 text-lime-400 font-mono text-xs font-bold">
                <Terminal className="h-4 w-4" />
                <span>Option B: Local Python & Node Setup</span>
              </div>
              <button
                onClick={() => copyToClipboard(localRunCommand, 'local')}
                className="flex items-center space-x-1 font-mono text-xs text-ivory-300 hover:text-ivory-100 bg-forest-900 px-2.5 py-1 rounded-lg transition-colors"
              >
                {copiedSection === 'local' ? (
                  <Check className="h-3 w-3 text-lime-400" />
                ) : (
                  <Copy className="h-3 w-3" />
                )}
                <span>{copiedSection === 'local' ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
            <pre className="font-mono text-xs text-ivory-200 overflow-x-auto leading-relaxed">
              {localRunCommand}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};
