import { AnimatedCounter, CurrencyCounter } from '../effects';
import type { DataCard as DataCardType } from '../../types/dashboard-data';
import { useDataFetch } from '../../hooks/useDataFetch';

interface DataCardProps {
  config: DataCardType;
  baseUrl?: string;
  countersEnabled?: boolean;
}

export function DataCard({ config, baseUrl, countersEnabled = true }: DataCardProps) {
  const { label, url, value, type = 'text', poll_interval } = config;

  // Fetch data if URL is provided
  const { data, isLoading, error } = useDataFetch<unknown>({
    url: url && type !== 'link' ? url : undefined,
    valuePath: typeof value === 'string' && url ? value : undefined,
    pollInterval: poll_interval,
    enabled: !!url && type !== 'link',
    baseUrl,
  });

  // Determine the display value
  const displayValue = url && type !== 'link' ? data : value;

  // Render loading state
  if (isLoading && displayValue === null) {
    return (
      <div className="text-center p-4 rounded-lg bg-slate-50 dark:bg-slate-700/30 animate-pulse">
        <div className="h-4 bg-slate-200 dark:bg-slate-600 rounded w-16 mx-auto mb-2" />
        <div className="h-6 bg-slate-200 dark:bg-slate-600 rounded w-24 mx-auto mb-1" />
        <div className="h-3 bg-slate-200 dark:bg-slate-600 rounded w-20 mx-auto" />
      </div>
    );
  }

  // Render error state
  if (error && !displayValue) {
    return (
      <div className="text-center p-4 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/50">
        <div className="text-red-500 dark:text-red-400 mb-1">
          <svg className="w-5 h-5 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <div className="text-xs text-red-600 dark:text-red-400">{label}</div>
        <div className="text-xs text-red-500 dark:text-red-500 mt-1">Error</div>
      </div>
    );
  }

  // Render link type
  if (type === 'link') {
    return (
      <a
        href={url || String(value)}
        target="_blank"
        rel="noopener noreferrer"
        className="block text-center p-4 rounded-lg bg-slate-50 dark:bg-slate-700/30 hover:bg-slate-100 dark:hover:bg-slate-700/50 transition-colors group"
      >
        <div className="flex justify-center text-blue-500 dark:text-blue-400 mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-300">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
        </div>
        <div className="font-medium text-blue-600 dark:text-blue-400 group-hover:text-blue-700 dark:group-hover:text-blue-300">
          {label}
        </div>
      </a>
    );
  }

  // Render value based on type
  const renderValue = () => {
    if (displayValue === null || displayValue === undefined) {
      return <span className="text-slate-400 dark:text-slate-500">-</span>;
    }

    switch (type) {
      case 'number':
        const numValue = Number(displayValue);
        if (isNaN(numValue)) {
          return <span className="text-slate-700 dark:text-slate-200">{String(displayValue)}</span>;
        }
        return countersEnabled ? (
          <AnimatedCounter
            end={numValue}
            decimals={Number.isInteger(numValue) ? 0 : 2}
            duration={1}
          />
        ) : (
          <span>{numValue.toLocaleString()}</span>
        );

      case 'currency':
        const currencyValue = Number(displayValue);
        if (isNaN(currencyValue)) {
          return <span className="text-slate-700 dark:text-slate-200">{String(displayValue)}</span>;
        }
        return countersEnabled ? (
          <CurrencyCounter amount={currencyValue} duration={1.5} />
        ) : (
          <span>${currencyValue.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
        );

      case 'text':
      default:
        return <span>{String(displayValue)}</span>;
    }
  };

  // Get value color based on type
  const valueColor = type === 'currency'
    ? 'text-green-600 dark:text-green-400'
    : type === 'number'
      ? 'text-cyan-600 dark:text-cyan-400'
      : 'text-slate-700 dark:text-slate-200';

  return (
    <div className="text-center p-4 rounded-lg bg-slate-50 dark:bg-slate-700/30">
      <div className="flex justify-center text-slate-400 dark:text-slate-500 mb-2">
        {type === 'number' && (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
          </svg>
        )}
        {type === 'currency' && (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        )}
        {type === 'text' && (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        )}
      </div>
      <div className={`font-bold text-lg ${valueColor}`}>
        {renderValue()}
      </div>
      <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
        {label}
      </div>
    </div>
  );
}
