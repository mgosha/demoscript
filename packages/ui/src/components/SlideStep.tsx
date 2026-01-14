import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useDemo } from '../context/DemoContext';
import { substituteVariables } from '../lib/variable-substitution';
import type { SlideStep as SlideStepType, ExplicitSlideStep } from '../types/schema';
import { getSlideContent } from '../types/schema';
import { GlowingCard } from './effects';
import { ChoiceButtons } from './ChoiceButtons';

interface Props {
  step: SlideStepType | ExplicitSlideStep;
}

export function SlideStep({ step }: Props) {
  const { state, gotoStepById } = useDemo();

  const content = substituteVariables(getSlideContent(step), state.variables);

  const handleChoiceSelect = (gotoId: string) => {
    gotoStepById(gotoId);
  };

  return (
    <GlowingCard isActive={true} color="purple" intensity="subtle">
      <div className="bg-white/90 dark:bg-slate-800/80 backdrop-blur-sm rounded-xl shadow-md dark:shadow-xl border border-gray-200 dark:border-purple-500/20 p-8 transition-colors duration-300">
        <div className="prose prose-lg max-w-none prose-headings:text-gray-900 dark:prose-invert dark:prose-headings:bg-gradient-to-r dark:prose-headings:from-purple-400 dark:prose-headings:to-cyan-400 dark:prose-headings:bg-clip-text dark:prose-headings:text-transparent prose-strong:text-purple-600 dark:prose-strong:text-purple-300 prose-p:text-gray-700 dark:prose-p:text-slate-300 prose-li:text-gray-700 dark:prose-li:text-slate-300">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
        </div>

        {step.choices && step.choices.length > 0 && (
          <ChoiceButtons choices={step.choices} onSelect={handleChoiceSelect} />
        )}
      </div>
    </GlowingCard>
  );
}
