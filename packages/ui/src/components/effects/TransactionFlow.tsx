import { BlockchainViz, TransactionStage } from './BlockchainViz';
import type { StepStatus } from '../../context/DemoContext';

interface TransactionFlowProps {
  stepStatus: StepStatus;
  isPolling?: boolean;
  hasError?: boolean;
  className?: string;
}

export function TransactionFlow({
  stepStatus,
  isPolling = false,
  hasError = false,
  className = '',
}: TransactionFlowProps) {
  // Map step status to visualization stage
  const getStage = (): TransactionStage => {
    if (hasError) return 'failed';

    switch (stepStatus) {
      case 'pending':
        return 'idle';
      case 'executing':
        return isPolling ? 'mining' : 'sending';
      case 'complete':
        return 'confirmed';
      case 'error':
        return 'failed';
      default:
        return 'idle';
    }
  };

  return <BlockchainViz stage={getStage()} className={className} />;
}
