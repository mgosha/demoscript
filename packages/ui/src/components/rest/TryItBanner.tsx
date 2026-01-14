interface Props {
  response: unknown;
  error: string | null;
  onReturn: () => void;
}

export function TryItBanner({ response, error, onReturn }: Props) {
  return (
    <div className="border-t border-amber-300 dark:border-amber-500/30 bg-amber-50 dark:bg-amber-900/20 p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2 text-amber-700 dark:text-amber-300">
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
          </svg>
          <span className="text-sm font-medium">Live Response (not from recording)</span>
        </div>
        <button
          onClick={onReturn}
          className="text-sm text-amber-600 dark:text-amber-400 hover:text-amber-700 dark:hover:text-amber-300 hover:underline transition-colors flex items-center gap-1"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Return to recorded
        </button>
      </div>

      {error && (
        <div className="mb-3 p-3 bg-red-100 dark:bg-red-500/20 rounded-lg border border-red-300 dark:border-red-500/30">
          <p className="text-red-700 dark:text-red-400 text-sm">{error}</p>
        </div>
      )}

      {response !== null && response !== undefined && (
        <>
          <h3 className="text-sm font-semibold text-amber-700 dark:text-amber-300 mb-2">Response</h3>
          <pre className="bg-white dark:bg-slate-950 text-gray-800 dark:text-slate-100 p-3 rounded-lg text-sm overflow-x-auto max-h-64 border border-amber-300 dark:border-amber-500/30">
            <code>{JSON.stringify(response, null, 2)}</code>
          </pre>
        </>
      )}
    </div>
  );
}
