import { extractValueByPath } from '../../lib/variable-substitution';
import { ResultValue } from './ResultValue';
import { CollapsibleSection } from '../CollapsibleSection';
import type { ResultField } from '../../types/schema';

interface Props {
  response: unknown;
  results?: ResultField[];
}

function getResponseSummary(response: unknown): string {
  if (response === null || response === undefined) return '';

  const json = JSON.stringify(response);
  const size = json.length;
  const sizeStr = size > 1000 ? `${(size / 1024).toFixed(1)}KB` : `${size}B`;

  if (typeof response === 'object' && response !== null) {
    if (Array.isArray(response)) {
      return `${response.length} items, ${sizeStr}`;
    }
    const keys = Object.keys(response);
    return `${keys.length} keys, ${sizeStr}`;
  }

  return sizeStr;
}

export function ResponseDisplay({ response, results }: Props) {
  const responseSummary = getResponseSummary(response);

  return (
    <div className="border-t border-gray-200 dark:border-slate-700/50 p-4 bg-gray-50/50 dark:bg-slate-900/30 space-y-3">
      <CollapsibleSection title="Response" summary={responseSummary} defaultExpanded={true}>
        <pre className="bg-gray-100 dark:bg-slate-950 text-gray-800 dark:text-slate-100 p-3 rounded-lg text-sm overflow-x-auto max-h-64 border border-gray-200 dark:border-slate-700/50">
          <code>{JSON.stringify(response, null, 2)}</code>
        </pre>
      </CollapsibleSection>

      {results && results.length > 0 && (
        <CollapsibleSection
          title="Results"
          summary={`${results.length} field${results.length > 1 ? 's' : ''}`}
          defaultExpanded={true}
        >
          <div className="bg-gray-100 dark:bg-slate-800/50 rounded-lg p-4 space-y-2 border border-gray-200 dark:border-slate-700/50">
            {results.map((result) => {
              const value = extractValueByPath(response, result.key);
              return (
                <div key={result.key} className="flex items-center gap-2">
                  <span className="text-gray-500 dark:text-slate-400 text-sm">{result.label}:</span>
                  <ResultValue
                  value={value}
                  type={result.type}
                  link={result.link}
                  expandedDepth={result.expandedDepth}
                  columns={result.columns}
                />
                </div>
              );
            })}
          </div>
        </CollapsibleSection>
      )}
    </div>
  );
}
