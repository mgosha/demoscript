import { extractValueByPath } from '../../lib/variable-substitution';
import { ResultValue } from './ResultValue';
import { JsonBrowser } from './JsonBrowser';
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
        <JsonBrowser data={response} defaultExpandedDepth={2} maxHeight="320px" />
      </CollapsibleSection>

      {results && results.length > 0 && (
        <CollapsibleSection
          title="Results"
          summary={`${results.length} field${results.length > 1 ? 's' : ''}`}
          defaultExpanded={true}
        >
          <div className="bg-gray-100 dark:bg-slate-800/50 rounded-lg p-4 space-y-3 border border-gray-200 dark:border-slate-700/50">
            {results.map((result) => {
              const value = extractValueByPath(response, result.key);
              const isBlockType = result.type === 'table' || result.type === 'json' || result.type === 'code';

              // Block types (table, json, code) get stacked layout
              if (isBlockType) {
                return (
                  <div key={result.key || result.label} className="space-y-1">
                    <span className="text-gray-500 dark:text-slate-400 text-sm font-medium">{result.label}</span>
                    <ResultValue
                      value={value}
                      type={result.type}
                      link={result.link}
                      expandedDepth={result.expandedDepth}
                      columns={result.columns}
                    />
                  </div>
                );
              }

              // Inline types get horizontal layout
              return (
                <div key={result.key || result.label} className="flex items-center gap-2">
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
