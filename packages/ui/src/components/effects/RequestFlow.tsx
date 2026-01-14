interface RequestFlowProps {
  status: 'pending' | 'submitted' | 'confirming' | 'confirmed' | 'failed';
}

export function RequestFlow({ status }: RequestFlowProps) {
  const stage = status === 'pending' ? 'idle'
    : status === 'submitted' ? 'sending'
    : status === 'confirming' ? 'processing'
    : status === 'confirmed' ? 'confirmed'
    : 'idle';

  const isAnimating = status === 'submitted' || status === 'confirming';

  return (
    <div className="relative h-24 overflow-hidden rounded-lg bg-gray-100 dark:bg-slate-900/50 border border-gray-200 dark:border-slate-700/50">
      {/* Background grid */}
      <div className="absolute inset-0 opacity-20">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `linear-gradient(rgba(139,92,246,0.3) 1px, transparent 1px),
                             linear-gradient(90deg, rgba(139,92,246,0.3) 1px, transparent 1px)`,
            backgroundSize: '20px 20px',
          }}
        />
      </div>

      {/* Client icon */}
      <div className="absolute left-4 top-1/2 -translate-y-1/2 z-10">
        <div
          className={`
            w-12 h-12 rounded-lg flex items-center justify-center transition-all duration-300
            ${stage === 'sending'
              ? 'bg-cyan-500 shadow-[0_0_20px_rgba(6,182,212,0.6)] scale-110'
              : 'bg-gray-200 dark:bg-slate-700 border border-gray-300 dark:border-slate-600'
            }
          `}
        >
          <svg
            className={`w-6 h-6 ${stage === 'sending' ? 'text-white' : 'text-gray-500 dark:text-slate-400'}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
            />
          </svg>
        </div>
      </div>

      {/* Request packet */}
      {isAnimating && (
        <div
          className="absolute top-1/2 -translate-y-1/2 z-20 animate-[movePacket_2s_ease-in-out_infinite]"
        >
          <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-400 to-cyan-500 shadow-[0_0_20px_rgba(139,92,246,0.8)] flex items-center justify-center">
            <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
            </svg>
          </div>
        </div>
      )}

      {/* Connection line */}
      <div className="absolute left-20 right-20 top-1/2 -translate-y-1/2 h-0.5">
        <div
          className={`
            h-full transition-all duration-500
            ${stage === 'confirmed'
              ? 'bg-gradient-to-r from-cyan-500 via-purple-500 to-green-500'
              : 'bg-gray-300 dark:bg-slate-600'
            }
          `}
        />
        {isAnimating && (
          <div className="absolute inset-0 overflow-hidden">
            <div
              className="h-full w-1/3 bg-gradient-to-r from-transparent via-cyan-400 to-transparent animate-[shimmer_1.5s_linear_infinite]"
            />
          </div>
        )}
      </div>

      {/* Processing animation */}
      {stage === 'processing' && (
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
          <div className="w-14 h-14 rounded-lg bg-purple-500 shadow-[0_0_25px_rgba(168,85,247,0.6)] flex items-center justify-center animate-pulse">
            <svg
              className="w-7 h-7 text-white animate-spin"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
          </div>
        </div>
      )}

      {/* Server icon */}
      <div className="absolute right-4 top-1/2 -translate-y-1/2 z-10">
        <div
          className={`
            w-12 h-12 rounded-lg flex items-center justify-center transition-all duration-500
            ${stage === 'confirmed'
              ? 'bg-green-500 shadow-[0_0_20px_rgba(34,197,94,0.6)] scale-110'
              : 'bg-gray-200 dark:bg-slate-700 border border-gray-300 dark:border-slate-600'
            }
          `}
        >
          <svg
            className={`w-6 h-6 ${stage === 'confirmed' ? 'text-white' : 'text-gray-500 dark:text-slate-400'}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01"
            />
          </svg>
        </div>
      </div>
    </div>
  );
}
