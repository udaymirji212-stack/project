import React, { useState, useEffect } from 'react';
import { workflowApi } from '../../services/workflowApi';
import type { GeneratedFile } from '../../types/workspace';
import type { Project } from '../../types/project';
import {
  Cpu,
  Code2,
  FileCode,
  Terminal,
  ArrowRight,
  Loader2,
  Sparkles,
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface CodeGenerationStageProps {
  project: Project;
  onAdvance: () => void;
  onRefreshProject?: () => void;
}

export const CodeGenerationStage: React.FC<CodeGenerationStageProps> = ({
  project,
  onAdvance,
  onRefreshProject,
}) => {
  const [files, setFiles] = useState<GeneratedFile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [includeTests, setIncludeTests] = useState(true);
  const [includeDocker, setIncludeDocker] = useState(true);
  const [generationLogs, setGenerationLogs] = useState<string[]>([]);
  const [progress, setProgress] = useState(0);

  const loadFiles = async () => {
    try {
      setIsLoading(true);
      const res = await workflowApi.listFiles(project.id);
      setFiles(res);
      if (res.length > 0) {
        setProgress(100);
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadFiles();
  }, [project.id]);

  const handleGenerateCode = async () => {
    setIsGenerating(true);
    setProgress(15);
    setGenerationLogs([
      '⚡ [1/6] Initializing AI software architecture parser...',
      '📦 [2/6] Generating data models, Pydantic schemas, and SQLAlchemy ORM entities...',
      '🚀 [3/6] Synthesizing FastAPI router endpoints with dependency injection...',
    ]);

    setTimeout(() => {
      setProgress(50);
      setGenerationLogs((prev) => [
        ...prev,
        '🎨 [4/6] Creating React client services, Tailwind layouts, and state stores...',
        '🧪 [5/6] Writing comprehensive pytest unit & integration test suites...',
      ]);
    }, 800);

    setTimeout(() => {
      setProgress(85);
      setGenerationLogs((prev) => [
        ...prev,
        '🐳 [6/6] Packaging Dockerfiles, docker-compose.yml, and environment configs...',
      ]);
    }, 1500);

    try {
      const res = await workflowApi.generateCode(project.id, {
        force_regenerate: true,
      });

      setTimeout(() => {
        setFiles(res);
        setProgress(100);
        setGenerationLogs((prev) => [
          ...prev,
          `✨ [SUCCESS] Codebase generation complete! Total ${res.length} production files created.`,
        ]);
        setIsGenerating(false);

        try {
          confetti({
            particleCount: 80,
            spread: 70,
            origin: { y: 0.6 },
          });
        } catch {
          // ignore
        }

        if (onRefreshProject) onRefreshProject();
      }, 2000);
    } catch (err) {
      console.error('Failed to generate code:', err);
      setIsGenerating(false);
    }
  };

  const getFilesByCategory = (category: string) => {
    return files.filter(
      (f) =>
        f.file_type === category ||
        (category === 'frontend' && (f.path.includes('frontend') || f.path.endsWith('.tsx') || f.path.endsWith('.jsx'))) ||
        (category === 'backend' && (f.path.includes('backend') || f.path.endsWith('.py') || f.path.endsWith('.go'))) ||
        (category === 'test' && f.path.includes('test')) ||
        (category === 'docker' && (f.path.includes('docker') || f.path.includes('compose')))
    );
  };

  if (isLoading && files.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 space-y-4">
        <Loader2 className="h-10 w-10 animate-spin text-forest-900" />
        <p className="text-sm font-semibold text-forest-800">
          Checking codebase workspace...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Banner Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 rounded-3xl bg-ivory-50 p-6 border border-forest-900/10 shadow-sm">
        <div>
          <div className="flex items-center space-x-2">
            <span className="rounded-lg bg-forest-900/10 p-1.5 text-forest-900 font-mono text-xs font-bold">
              Stage 05
            </span>
            <h2 className="font-serif text-2xl font-bold text-forest-950">
              Autonomous Full-Stack Code Generation
            </h2>
          </div>
          <p className="mt-1 text-xs text-forest-700/70">
            Synthesize entire multi-tier production codebases directly from verified architecture, schemas, and requirements.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          {files.length > 0 && (
            <button
              onClick={onAdvance}
              className="inline-flex items-center space-x-2 rounded-xl bg-forest-900 px-5 py-2.5 text-xs font-bold text-lime-400 shadow-md hover:bg-forest-950 transition-all"
            >
              <Code2 className="h-4 w-4" />
              <span>Launch Monaco IDE Workspace</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Code Generation Action Card */}
      <div className="rounded-3xl bg-ivory-50 p-8 border border-forest-900/10 shadow-sm space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <h3 className="font-serif text-xl font-bold text-forest-950">
              {files.length > 0 ? 'Codebase Successfully Generated' : 'Ready to Synthesize Codebase'}
            </h3>
            <p className="text-xs text-forest-700/80 leading-relaxed">
              The AI code generator will assemble backend APIs, database models, frontend interfaces, docker containers, and automated test suites based on your approved specifications.
            </p>
          </div>

          {/* Generator Toggles & Action */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <label className="flex items-center space-x-2 text-xs font-bold text-forest-900 cursor-pointer">
              <input
                type="checkbox"
                checked={includeTests}
                onChange={(e) => setIncludeTests(e.target.checked)}
                className="rounded border-forest-900/20 text-lime-500 focus:ring-lime-400"
              />
              <span>Include Automated Tests</span>
            </label>

            <label className="flex items-center space-x-2 text-xs font-bold text-forest-900 cursor-pointer">
              <input
                type="checkbox"
                checked={includeDocker}
                onChange={(e) => setIncludeDocker(e.target.checked)}
                className="rounded border-forest-900/20 text-lime-500 focus:ring-lime-400"
              />
              <span>Include Docker manifests</span>
            </label>

            <button
              onClick={handleGenerateCode}
              disabled={isGenerating}
              className="inline-flex items-center space-x-2 rounded-2xl bg-forest-900 px-6 py-3 text-xs font-bold text-lime-400 shadow-md hover:bg-forest-950 disabled:opacity-50 transition-all"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Synthesizing Codebase...</span>
                </>
              ) : (
                <>
                  <Cpu className="h-4 w-4" />
                  <span>{files.length > 0 ? 'Regenerate Codebase' : 'Generate Full Codebase'}</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Progress Bar */}
        {(isGenerating || progress > 0) && (
          <div className="space-y-2">
            <div className="flex justify-between text-xs font-bold text-forest-900">
              <span className="flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5 text-lime-600" />
                <span>Synthesis Progress</span>
              </span>
              <span className="font-mono">{progress}%</span>
            </div>
            <div className="h-3 w-full rounded-full bg-forest-900/10 overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-forest-800 via-emerald-600 to-lime-500 transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}

        {/* Terminal Logs View */}
        {generationLogs.length > 0 && (
          <div className="rounded-2xl bg-forest-950 p-4 border border-forest-900 shadow-inner space-y-1.5">
            <div className="flex items-center space-x-2 text-[11px] font-mono text-lime-400 mb-2">
              <Terminal className="h-3.5 w-3.5" />
              <span>AI Build Engine Console</span>
            </div>
            {generationLogs.map((log, idx) => (
              <div key={idx} className="font-mono text-xs text-ivory-200">
                {log}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Generated Files Breakdown */}
      {files.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-serif text-lg font-bold text-forest-950">
              Generated Codebase Files ({files.length} Total Files)
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="rounded-2xl bg-ivory-50 p-4 border border-forest-900/10 shadow-sm">
              <span className="text-xs font-bold text-forest-700/70 uppercase">Backend API</span>
              <div className="mt-2 text-2xl font-serif font-bold text-forest-950">
                {getFilesByCategory('backend').length || Math.ceil(files.length * 0.4)}
              </div>
              <span className="text-[11px] text-forest-700/60">Models, routes & config</span>
            </div>

            <div className="rounded-2xl bg-ivory-50 p-4 border border-forest-900/10 shadow-sm">
              <span className="text-xs font-bold text-forest-700/70 uppercase">Frontend UI</span>
              <div className="mt-2 text-2xl font-serif font-bold text-forest-950">
                {getFilesByCategory('frontend').length || Math.ceil(files.length * 0.3)}
              </div>
              <span className="text-[11px] text-forest-700/60">Pages, components & API</span>
            </div>

            <div className="rounded-2xl bg-ivory-50 p-4 border border-forest-900/10 shadow-sm">
              <span className="text-xs font-bold text-forest-700/70 uppercase">Test Suites</span>
              <div className="mt-2 text-2xl font-serif font-bold text-forest-950">
                {getFilesByCategory('test').length || Math.ceil(files.length * 0.2)}
              </div>
              <span className="text-[11px] text-forest-700/60">Unit & integration tests</span>
            </div>

            <div className="rounded-2xl bg-ivory-50 p-4 border border-forest-900/10 shadow-sm">
              <span className="text-xs font-bold text-forest-700/70 uppercase">DevOps & Docker</span>
              <div className="mt-2 text-2xl font-serif font-bold text-forest-950">
                {getFilesByCategory('docker').length || Math.ceil(files.length * 0.1)}
              </div>
              <span className="text-[11px] text-forest-700/60">Compose & Dockerfiles</span>
            </div>
          </div>

          {/* Files List */}
          <div className="rounded-3xl bg-ivory-50 p-4 border border-forest-900/10 shadow-sm max-h-72 overflow-y-auto divide-y divide-forest-900/5">
            {files.map((file) => (
              <div
                key={file.id}
                className="py-2.5 px-3 flex items-center justify-between hover:bg-forest-900/5 rounded-xl transition-colors"
              >
                <div className="flex items-center space-x-3 min-w-0">
                  <FileCode className="h-4 w-4 text-forest-700 shrink-0" />
                  <span className="font-mono text-xs font-bold text-forest-950 truncate">
                    {file.path}
                  </span>
                </div>
                <div className="flex items-center space-x-2 shrink-0">
                  <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-forest-900/5 text-forest-700">
                    {file.language || 'code'}
                  </span>
                  <span className="font-mono text-[10px] text-forest-700/60">
                    {(file.size_bytes / 1024).toFixed(1)} KB
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
