interface PollingProgressProps {
  stage: 'submitting' | 'confirming' | 'complete';
}

export function PollingProgress({ stage }: PollingProgressProps) {
  const stages = ['Sending', 'Processing', 'Complete'];
  const currentIndex = stage === 'submitting' ? 0 : stage === 'confirming' ? 1 : 2;

  return (
    <div className="flex items-center justify-between w-full max-w-md mx-auto">
      {stages.map((s, i) => (
        <div key={s} className="flex items-center">
          <div className="flex flex-col items-center">
            <div
              className={`
                w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium
                transition-all duration-500
                ${i < currentIndex
                  ? 'bg-green-500 text-white shadow-[0_0_15px_rgba(34,197,94,0.5)]'
                  : i === currentIndex
                  ? 'bg-purple-500 text-white animate-pulse shadow-[0_0_15px_rgba(168,85,247,0.5)]'
                  : 'bg-gray-200 dark:bg-slate-700 text-gray-500 dark:text-slate-400 border border-gray-300 dark:border-slate-600'
                }
              `}
            >
              {i < currentIndex ? (
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              ) : (
                i + 1
              )}
            </div>
            <span className={`mt-2 text-xs ${i <= currentIndex ? 'text-gray-700 dark:text-slate-200 font-medium' : 'text-gray-400 dark:text-slate-500'}`}>
              {s}
            </span>
          </div>
          {i < stages.length - 1 && (
            <div
              className={`
                w-16 h-1 mx-2 rounded transition-all duration-500
                ${i < currentIndex ? 'bg-green-500' : 'bg-gray-300 dark:bg-slate-700'}
              `}
            />
          )}
        </div>
      ))}
    </div>
  );
}
