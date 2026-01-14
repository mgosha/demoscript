import { DataCard } from './DataCard';
import type { DataCard as DataCardType } from '../../types/dashboard-data';

interface DataCardsProps {
  cards: DataCardType[];
  baseUrl?: string;
  countersEnabled?: boolean;
}

export function DataCards({ cards, baseUrl, countersEnabled = true }: DataCardsProps) {
  if (!cards || cards.length === 0) {
    return null;
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {cards.map((card, index) => (
        <DataCard
          key={index}
          config={card}
          baseUrl={baseUrl}
          countersEnabled={countersEnabled}
        />
      ))}
    </div>
  );
}
