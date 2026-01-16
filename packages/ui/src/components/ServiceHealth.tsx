import type { HealthStatus } from '../hooks/useHealthCheck';
import { PulsingDot } from './effects';

interface ServiceHealthProps {
  statuses: HealthStatus[];
  compact?: boolean;
}

export function ServiceHealth({ statuses, compact = false }: ServiceHealthProps) {
  if (statuses.length === 0) return null;

  if (compact) {
    return <ServiceHealthCompact statuses={statuses} />;
  }

  return (
    <div className="flex flex-wrap gap-4">
      {statuses.map((status) => (
        <ServiceHealthCard key={status.url} status={status} />
      ))}
    </div>
  );
}

function ServiceHealthCard({ status }: { status: HealthStatus }) {
  const isChecking = status.healthy === null;
  const isHealthy = status.healthy === true;

  return (
    <div className={`
      rounded-lg border p-4 transition-all duration-200 max-w-md
      ${isHealthy
        ? 'bg-green-50/50 dark:bg-green-900/10 border-green-200 dark:border-green-500/30'
        : isChecking
          ? 'bg-slate-50/50 dark:bg-slate-800/30 border-slate-200 dark:border-slate-600'
          : 'bg-red-50/50 dark:bg-red-900/10 border-red-200 dark:border-red-500/30'
      }
    `}>
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 min-w-0">
          <StatusIndicator healthy={status.healthy} />
          <div className="min-w-0">
            <h4
              className="font-medium text-slate-800 dark:text-slate-200 truncate"
              title={status.name}
            >
              {status.name}
            </h4>
            <p
              className="text-xs text-slate-500 dark:text-slate-400 truncate"
              title={status.url}
            >
              {status.url}
            </p>
          </div>
        </div>
        <span className={`text-xs font-medium px-2 py-1 rounded-full flex-shrink-0 ${
          isHealthy
            ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
            : isChecking
              ? 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
              : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
        }`}>
          {isChecking ? 'Checking...' : isHealthy ? 'Healthy' : 'Down'}
        </span>
      </div>
      {status.error && (
        <p
          className="mt-2 text-xs text-red-600 dark:text-red-400 truncate"
          title={status.error}
        >
          {status.error}
        </p>
      )}
    </div>
  );
}

function ServiceHealthCompact({ statuses }: { statuses: HealthStatus[] }) {
  const healthyCount = statuses.filter(s => s.healthy === true).length;
  const totalCount = statuses.length;
  const allHealthy = healthyCount === totalCount;
  const someHealthy = healthyCount > 0;

  return (
    <div className="flex items-center gap-2">
      <StatusIndicator
        healthy={allHealthy ? true : someHealthy ? null : false}
        size="sm"
      />
      <span className={`text-sm font-medium ${
        allHealthy
          ? 'text-green-600 dark:text-green-400'
          : someHealthy
            ? 'text-yellow-600 dark:text-yellow-400'
            : 'text-red-600 dark:text-red-400'
      }`}>
        {healthyCount}/{totalCount} Services
      </span>
    </div>
  );
}

function StatusIndicator({
  healthy,
  size = 'md'
}: {
  healthy: boolean | null;
  size?: 'sm' | 'md';
}) {
  const sizeClass = size === 'sm' ? 'w-2 h-2' : 'w-3 h-3';

  if (healthy === null) {
    return <PulsingDot color="slate" size={size} />;
  }

  return (
    <div className={`${sizeClass} rounded-full ${
      healthy
        ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]'
        : 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]'
    }`} />
  );
}

// Header component for showing health in the header bar
export function ServiceHealthHeader({ statuses }: { statuses: HealthStatus[] }) {
  if (statuses.length === 0) return null;

  const healthyCount = statuses.filter(s => s.healthy === true).length;
  const totalCount = statuses.length;
  const allHealthy = healthyCount === totalCount;
  const someHealthy = healthyCount > 0;

  return (
    <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800/50">
      <div className={`w-2 h-2 rounded-full ${
        allHealthy
          ? 'bg-green-500'
          : someHealthy
            ? 'bg-yellow-500'
            : 'bg-red-500'
      }`} />
      <span className="text-xs font-medium text-slate-600 dark:text-slate-300">
        {healthyCount}/{totalCount} Services
      </span>
    </div>
  );
}
