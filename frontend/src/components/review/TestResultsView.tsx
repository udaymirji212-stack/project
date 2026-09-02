import React from 'react';
import type { TestRun } from '../../types/workflow';
import { Card } from '../common/Card';
import { CheckCircle2, XCircle, Clock, Terminal } from 'lucide-react';

interface TestResultsViewProps {
  testRun: TestRun;
}

export const TestResultsView: React.FC<TestResultsViewProps> = ({ testRun }) => {
  return (
    <div className="space-y-6">
      {/* Metrics Banner */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card className="p-4 text-center">
          <span className="text-[10px] font-mono uppercase text-[#0D2818]/60 font-bold">Total Tests</span>
          <p className="text-2xl font-serif font-bold text-[#0D2818] mt-1">{testRun.total_count}</p>
        </Card>
        <Card className="p-4 text-center bg-emerald-50/50 border-emerald-300">
          <span className="text-[10px] font-mono uppercase text-emerald-800 font-bold">Passed</span>
          <p className="text-2xl font-serif font-bold text-emerald-700 mt-1">{testRun.passed_count}</p>
        </Card>
        <Card className="p-4 text-center bg-rose-50/50 border-rose-300">
          <span className="text-[10px] font-mono uppercase text-rose-800 font-bold">Failed</span>
          <p className="text-2xl font-serif font-bold text-rose-700 mt-1">{testRun.failed_count}</p>
        </Card>
        <Card className="p-4 text-center">
          <span className="text-[10px] font-mono uppercase text-[#0D2818]/60 font-bold">Execution</span>
          <p className="text-2xl font-serif font-bold text-[#0D2818] mt-1">{testRun.execution_time_ms}ms</p>
        </Card>
      </div>

      {/* Test Cases List */}
      <Card className="p-6 space-y-4">
        <h4 className="font-serif font-bold text-lg text-[#0D2818]">Automated Test Cases</h4>
        <div className="divide-y divide-[#0D2818]/10 text-xs font-mono">
          {testRun.test_cases.map((tc, idx) => (
            <div key={idx} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                {tc.status === 'PASSED' ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                ) : (
                  <XCircle className="w-4 h-4 text-rose-600 shrink-0" />
                )}
                <span className="font-bold text-[#0D2818]">{tc.name}</span>
                <span className="text-[10px] text-[#0D2818]/60 bg-[#FAF7F2] px-2 py-0.5 rounded-full border border-[#0D2818]/10">
                  {tc.suite}
                </span>
              </div>
              <div className="flex items-center gap-3 text-[#0D2818]/70">
                <span className="flex items-center gap-1 text-[11px]">
                  <Clock className="w-3 h-3" /> {tc.duration_ms}ms
                </span>
                <span
                  className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                    tc.status === 'PASSED'
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-rose-100 text-rose-800'
                  }`}
                >
                  {tc.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Terminal Output */}
      {testRun.raw_output && (
        <div className="bg-[#0D2818] text-white p-5 rounded-3xl font-mono text-xs overflow-x-auto shadow-lg border border-white/10">
          <div className="flex items-center gap-2 text-[#84CC16] mb-3 pb-2 border-b border-white/10 font-bold uppercase tracking-widest text-[10px]">
            <Terminal className="w-3.5 h-3.5" /> Pytest Test Execution Console Logs
          </div>
          <pre className="text-emerald-300 whitespace-pre-wrap leading-relaxed">
            {testRun.raw_output}
          </pre>
        </div>
      )}
    </div>
  );
};
