import { useState } from 'react';
import { useDemo } from '../context/DemoContext';
import { substituteVariables } from '../lib/variable-substitution';
import type { CodeStep as CodeStepType, ExplicitCodeStep } from '../types/schema';
import { getCodeSource } from '../types/schema';
import { GlowingCard } from './effects';

interface Props {
  step: CodeStepType | ExplicitCodeStep;
}

export function CodeStep({ step }: Props) {
  const { state } = useDemo();
  const [copied, setCopied] = useState(false);

  const code = substituteVariables(getCodeSource(step), state.variables);
  const lines = code.split('\n');

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getLanguageLabel = (lang?: string): string => {
    const labels: Record<string, string> = {
      js: 'JavaScript',
      javascript: 'JavaScript',
      ts: 'TypeScript',
      typescript: 'TypeScript',
      python: 'Python',
      py: 'Python',
      bash: 'Bash',
      sh: 'Shell',
      json: 'JSON',
      yaml: 'YAML',
      yml: 'YAML',
      sql: 'SQL',
      go: 'Go',
      rust: 'Rust',
      java: 'Java',
      cpp: 'C++',
      c: 'C',
    };
    return labels[lang?.toLowerCase() || ''] || lang || 'Code';
  };

  return (
    <GlowingCard isActive={true} color="cyan" intensity="subtle">
      <div className="bg-white/90 dark:bg-slate-800/80 backdrop-blur-sm rounded-xl shadow-md dark:shadow-xl border border-gray-200 dark:border-slate-600/30 overflow-hidden transition-colors duration-300">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-2 bg-gray-50 dark:bg-slate-900/50 border-b border-gray-200 dark:border-slate-700/50">
          <div className="flex items-center gap-3">
            {/* Terminal dots */}
            <div className="flex gap-1.5">
              <div className="w-3 h-3 rounded-full bg-red-400" />
              <div className="w-3 h-3 rounded-full bg-yellow-400" />
              <div className="w-3 h-3 rounded-full bg-green-400" />
            </div>
            {step.filename && (
              <span className="text-sm font-mono text-gray-600 dark:text-slate-400">
                {step.filename}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500 dark:text-slate-500 uppercase tracking-wide">
              {getLanguageLabel(step.language)}
            </span>
            <button
              onClick={handleCopy}
              className="px-2 py-1 text-xs font-medium text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-200 hover:bg-gray-100 dark:hover:bg-slate-700/50 rounded transition-colors"
              aria-label="Copy code"
            >
              {copied ? (
                <span className="text-green-500 dark:text-green-400">Copied!</span>
              ) : (
                <span className="flex items-center gap-1">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  Copy
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Code content */}
        <div className="overflow-x-auto">
          <pre className="p-4 text-sm font-mono bg-slate-950 dark:bg-slate-950 text-slate-100">
            <code>
              {lines.map((line, index) => {
                const lineNumber = index + 1;
                const isHighlighted = step.highlight?.includes(lineNumber);
                return (
                  <div
                    key={index}
                    className={`flex ${isHighlighted ? 'bg-yellow-500/20 -mx-4 px-4' : ''}`}
                  >
                    <span className="select-none text-slate-500 w-8 text-right pr-4 flex-shrink-0">
                      {lineNumber}
                    </span>
                    <span className={isHighlighted ? 'text-yellow-200' : ''}>
                      {line || ' '}
                    </span>
                  </div>
                );
              })}
            </code>
          </pre>
        </div>
      </div>
    </GlowingCard>
  );
}
