import { useEffect, useState } from 'react';

export type TransactionStage = 'idle' | 'sending' | 'mining' | 'confirmed' | 'failed';

interface BlockchainVizProps {
  stage: TransactionStage;
  className?: string;
}

export function BlockchainViz({ stage, className = '' }: BlockchainVizProps) {
  const [packetProgress, setPacketProgress] = useState(0);

  // Animate packet movement when in sending/mining stage
  useEffect(() => {
    if (stage === 'sending') {
      const interval = setInterval(() => {
        setPacketProgress((prev) => (prev >= 1 ? 0 : prev + 0.05));
      }, 50);
      return () => clearInterval(interval);
    } else if (stage === 'mining') {
      setPacketProgress(1);
    } else if (stage === 'confirmed') {
      setPacketProgress(1);
    } else {
      setPacketProgress(0);
    }
  }, [stage]);

  const getStageColors = () => {
    switch (stage) {
      case 'idle':
        return { primary: '#94a3b8', secondary: '#64748b', glow: 'rgba(148, 163, 184, 0.3)' };
      case 'sending':
        return { primary: '#3b82f6', secondary: '#1d4ed8', glow: 'rgba(59, 130, 246, 0.5)' };
      case 'mining':
        return { primary: '#f59e0b', secondary: '#d97706', glow: 'rgba(245, 158, 11, 0.5)' };
      case 'confirmed':
        return { primary: '#22c55e', secondary: '#16a34a', glow: 'rgba(34, 197, 94, 0.5)' };
      case 'failed':
        return { primary: '#ef4444', secondary: '#dc2626', glow: 'rgba(239, 68, 68, 0.5)' };
    }
  };

  const colors = getStageColors();

  return (
    <div className={`relative bg-slate-900/50 rounded-xl p-4 overflow-hidden ${className}`}>
      <svg viewBox="0 0 400 100" className="w-full h-20">
        {/* Connection line */}
        <line
          x1="70"
          y1="50"
          x2="330"
          y2="50"
          stroke={colors.secondary}
          strokeWidth="2"
          strokeDasharray="8,4"
          className="opacity-50"
        />

        {/* Wallet icon */}
        <g transform="translate(30, 30)">
          <rect
            x="0"
            y="0"
            width="40"
            height="40"
            rx="8"
            fill={stage !== 'idle' ? colors.primary : '#475569'}
            className="transition-all duration-300"
            style={{
              filter: stage !== 'idle' ? `drop-shadow(0 0 8px ${colors.glow})` : 'none',
            }}
          />
          <path
            d="M10 15 L30 15 L30 30 L10 30 Z M10 18 L30 18"
            fill="none"
            stroke="white"
            strokeWidth="2"
            strokeLinecap="round"
          />
          <circle cx="25" cy="24" r="3" fill="white" />
        </g>

        {/* Transaction packet (animated) */}
        {(stage === 'sending' || stage === 'mining' || stage === 'confirmed') && (
          <g
            transform={`translate(${70 + packetProgress * 130}, 40)`}
            className="transition-transform"
          >
            <rect
              x="0"
              y="0"
              width="20"
              height="20"
              rx="4"
              fill={colors.primary}
              style={{
                filter: `drop-shadow(0 0 6px ${colors.glow})`,
              }}
            />
            <path
              d="M5 10 L15 10 M10 5 L10 15"
              stroke="white"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </g>
        )}

        {/* Blockchain blocks */}
        <g transform="translate(220, 25)">
          {/* Block 1 */}
          <rect
            x="0"
            y="0"
            width="50"
            height="50"
            rx="6"
            fill={stage === 'mining' || stage === 'confirmed' ? colors.primary : '#475569'}
            className="transition-all duration-500"
            style={{
              filter:
                stage === 'mining'
                  ? `drop-shadow(0 0 12px ${colors.glow})`
                  : stage === 'confirmed'
                    ? `drop-shadow(0 0 8px ${colors.glow})`
                    : 'none',
            }}
          />
          <text x="25" y="30" textAnchor="middle" fill="white" fontSize="10" fontFamily="monospace">
            #N
          </text>

          {/* Block 2 */}
          <rect
            x="55"
            y="0"
            width="50"
            height="50"
            rx="6"
            fill={stage === 'confirmed' ? colors.primary : '#475569'}
            className="transition-all duration-500"
            style={{
              filter: stage === 'confirmed' ? `drop-shadow(0 0 8px ${colors.glow})` : 'none',
            }}
          />
          <text x="80" y="30" textAnchor="middle" fill="white" fontSize="10" fontFamily="monospace">
            #N+1
          </text>

          {/* Chain links between blocks */}
          <path
            d="M50 25 L55 25"
            stroke={stage === 'confirmed' ? colors.primary : '#475569'}
            strokeWidth="3"
            className="transition-all duration-500"
          />
        </g>

        {/* Mining animation (pickaxe) */}
        {stage === 'mining' && (
          <g transform="translate(235, 0)" className="animate-bounce">
            <text fontSize="16">
              <tspan>
                <animate
                  attributeName="opacity"
                  values="1;0.5;1"
                  dur="0.8s"
                  repeatCount="indefinite"
                />
              </tspan>
            </text>
          </g>
        )}

        {/* Confirmed checkmark */}
        {stage === 'confirmed' && (
          <g transform="translate(355, 30)">
            <circle cx="20" cy="20" r="18" fill={colors.primary} />
            <path
              d="M12 20 L18 26 L28 14"
              fill="none"
              stroke="white"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </g>
        )}

        {/* Failed X */}
        {stage === 'failed' && (
          <g transform="translate(355, 30)">
            <circle cx="20" cy="20" r="18" fill={colors.primary} />
            <path
              d="M13 13 L27 27 M27 13 L13 27"
              fill="none"
              stroke="white"
              strokeWidth="3"
              strokeLinecap="round"
            />
          </g>
        )}
      </svg>

      {/* Status text */}
      <div className="text-center mt-2">
        <span
          className="text-sm font-medium transition-colors duration-300"
          style={{ color: colors.primary }}
        >
          {stage === 'idle' && 'Ready to submit'}
          {stage === 'sending' && 'Sending transaction...'}
          {stage === 'mining' && 'Mining block...'}
          {stage === 'confirmed' && 'Transaction confirmed!'}
          {stage === 'failed' && 'Transaction failed'}
        </span>
      </div>
    </div>
  );
}
