import type { Choice } from '../types/schema';

interface Props {
  choices: Choice[];
  onSelect: (gotoId: string) => void;
}

export function ChoiceButtons({ choices, onSelect }: Props) {
  return (
    <div className="mt-8 flex flex-wrap gap-4 justify-center">
      {choices.map((choice, index) => (
        <button
          key={index}
          onClick={() => onSelect(choice.goto)}
          className="group px-6 py-4 bg-gradient-to-r from-purple-600 to-cyan-600
                     text-white rounded-xl font-medium
                     hover:from-purple-500 hover:to-cyan-500
                     shadow-lg shadow-purple-500/25
                     hover:shadow-xl hover:shadow-purple-500/40
                     transition-all duration-300
                     border border-purple-500/30
                     flex flex-col items-center min-w-[180px]
                     transform hover:scale-105"
        >
          <span className="text-base font-semibold">{choice.label}</span>
          {choice.description && (
            <span className="text-xs text-white/70 mt-1 group-hover:text-white/90 transition-colors">
              {choice.description}
            </span>
          )}
        </button>
      ))}
    </div>
  );
}
