import { useDemo, VariableProvider } from '../../context/DemoContext';

interface MissingVariable {
  name: string;
  provider?: VariableProvider;
}

interface Props {
  missingVariables: MissingVariable[];
}

export function MissingVariablesBanner({ missingVariables }: Props) {
  const { dispatch } = useDemo();

  if (missingVariables.length === 0) {
    return null;
  }

  const handleGoToStep = (stepIndex: number) => {
    dispatch({ type: 'SET_STEP', payload: stepIndex });
  };

  // Group variables by provider step
  const variablesWithProvider = missingVariables.filter(v => v.provider);
  const variablesWithoutProvider = missingVariables.filter(v => !v.provider);

  return (
    <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 rounded-lg p-3 mb-4">
      <div className="flex items-start gap-2">
        <svg
          className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
          />
        </svg>
        <div className="flex-1 text-sm">
          <p className="font-medium text-amber-800 dark:text-amber-200">
            Missing variables
          </p>
          <div className="mt-1 text-amber-700 dark:text-amber-300">
            {variablesWithProvider.length > 0 && (
              <div className="space-y-1">
                {variablesWithProvider.map(({ name, provider }) => (
                  <div key={name} className="flex items-center gap-1 flex-wrap">
                    <code className="bg-amber-100 dark:bg-amber-800/50 px-1 rounded text-xs">
                      ${name}
                    </code>
                    <span className="text-amber-600 dark:text-amber-400">is set by</span>
                    <button
                      onClick={() => handleGoToStep(provider!.stepIndex)}
                      className="text-amber-800 dark:text-amber-200 underline hover:no-underline font-medium"
                    >
                      {provider!.stepTitle}
                    </button>
                  </div>
                ))}
              </div>
            )}
            {variablesWithoutProvider.length > 0 && (
              <div className="mt-1">
                <span>Unknown variables: </span>
                {variablesWithoutProvider.map(({ name }, i) => (
                  <span key={name}>
                    {i > 0 && ', '}
                    <code className="bg-amber-100 dark:bg-amber-800/50 px-1 rounded text-xs">
                      ${name}
                    </code>
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
