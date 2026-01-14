import { DataListCards } from './DataListCards';
import { DataListTable } from './DataListTable';
import { useDataFetch } from '../../hooks/useDataFetch';
import type { DataList } from '../../types/dashboard-data';

interface DataListsProps {
  config: DataList;
  baseUrl?: string;
}

export function DataLists({ config, baseUrl }: DataListsProps) {
  const { label, url, items: itemsPath, layout = 'cards', limit, poll_interval, empty_message, card, columns } = config;

  const { data, isLoading, error, refresh } = useDataFetch<unknown[]>({
    url,
    itemsPath: itemsPath,
    pollInterval: poll_interval,
    enabled: true,
    baseUrl,
    limit,
  });

  // Ensure data is an array
  const items = Array.isArray(data) ? data : [];

  return (
    <div className="bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
        <div>
          <h3 className="font-medium text-slate-800 dark:text-slate-200">
            {label}
          </h3>
          {items.length > 0 && (
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {limit ? `Latest ${items.length}` : `${items.length} items`}
            </p>
          )}
        </div>
        <button
          onClick={refresh}
          className="p-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors text-slate-500 dark:text-slate-400"
          title="Refresh"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </button>
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Loading state */}
        {isLoading && items.length === 0 && (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-20 bg-slate-100 dark:bg-slate-700/50 rounded-lg animate-pulse"
              />
            ))}
          </div>
        )}

        {/* Error state */}
        {error && items.length === 0 && (
          <div className="text-center py-8">
            <div className="text-red-500 dark:text-red-400 mb-2">
              <svg className="w-8 h-8 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="text-slate-600 dark:text-slate-400">{error}</p>
            <button
              onClick={refresh}
              className="mt-3 px-3 py-1.5 text-sm bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 rounded transition-colors"
            >
              Retry
            </button>
          </div>
        )}

        {/* Render cards or table layout */}
        {!isLoading && !error && layout === 'cards' && card && (
          <DataListCards items={items} config={card} emptyMessage={empty_message} />
        )}

        {!isLoading && !error && layout === 'table' && columns && (
          <DataListTable items={items} columns={columns} emptyMessage={empty_message} />
        )}

        {/* Empty state when no config */}
        {!isLoading && !error && items.length === 0 && (
          <div className="text-center py-8">
            <p className="text-slate-500 dark:text-slate-400">
              {empty_message || 'No items found'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
