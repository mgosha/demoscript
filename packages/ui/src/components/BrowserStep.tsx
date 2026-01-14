import { useState } from 'react';
import { useDemo } from '../context/DemoContext';
import { substituteVariables } from '../lib/variable-substitution';
import type { BrowserStep as BrowserStepType, ExplicitBrowserStep } from '../types/schema';
import { getBrowserUrl } from '../types/schema';

interface Props {
  step: BrowserStepType | ExplicitBrowserStep;
}

export function BrowserStep({ step }: Props) {
  const { state, dispatch, getStepStatus } = useDemo();
  const [imageError, setImageError] = useState(false);

  const status = getStepStatus(state.currentStep);
  const error = state.stepErrors[state.currentStep];

  const url = substituteVariables(getBrowserUrl(step), state.variables);

  const handleOpenBrowser = async () => {
    dispatch({ type: 'SET_STEP_STATUS', payload: { step: state.currentStep, status: 'executing' } });

    try {
      if (state.mode === 'live') {
        // In live mode, request the server to open the browser
        const response = await fetch('/api/open-browser', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'ngrok-skip-browser-warning': 'true',
          },
          body: JSON.stringify({ url }),
        });

        if (!response.ok) {
          const result = await response.json();
          throw new Error(result.error || 'Failed to open browser');
        }

        dispatch({ type: 'SET_STEP_STATUS', payload: { step: state.currentStep, status: 'complete' } });
      } else {
        // In recorded mode, just mark as complete
        await new Promise((r) => setTimeout(r, 500));
        dispatch({ type: 'SET_STEP_STATUS', payload: { step: state.currentStep, status: 'complete' } });
      }
    } catch (err) {
      dispatch({
        type: 'SET_STEP_ERROR',
        payload: { step: state.currentStep, error: err instanceof Error ? err.message : 'Unknown error' },
      });
      dispatch({ type: 'SET_STEP_STATUS', payload: { step: state.currentStep, status: 'error' } });
    }
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-gray-200 dark:border-slate-700">
      {/* Header */}
      <div className="border-b border-gray-200 dark:border-slate-700 p-4">
        <div className="flex items-center gap-3">
          <span className="px-2 py-1 rounded text-sm font-bold bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-300">
            BROWSER
          </span>
          {step.title && (
            <span className="font-medium text-gray-900 dark:text-gray-100">{step.title}</span>
          )}
        </div>
        {step.description && (
          <p className="text-gray-600 dark:text-gray-400 text-sm mt-2">{step.description}</p>
        )}
      </div>

      {/* URL Preview */}
      <div className="p-4 bg-gray-50 dark:bg-slate-900/50 border-b border-gray-200 dark:border-slate-700">
        <div className="flex items-center gap-3">
          <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
          </svg>
          <code className="flex-1 text-sm text-gray-700 dark:text-gray-300 bg-white dark:bg-slate-800 px-3 py-2 rounded border border-gray-200 dark:border-slate-600 truncate">
            {url}
          </code>
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:text-blue-700 dark:text-blue-400"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </a>
        </div>
      </div>

      {/* Screenshot Preview (for recorded mode) */}
      {step.screenshot && state.mode === 'recorded' && (
        <div className="p-4">
          {!imageError ? (
            <img
              src={step.screenshot}
              alt="Browser screenshot"
              className="w-full rounded-lg border border-gray-200 dark:border-slate-700"
              onError={() => setImageError(true)}
            />
          ) : (
            <div className="bg-gray-100 dark:bg-slate-700 rounded-lg p-8 text-center text-gray-500 dark:text-gray-400">
              <svg className="w-12 h-12 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              Screenshot not available
            </div>
          )}
        </div>
      )}

      {/* Open Button */}
      <div className="p-4 flex items-center gap-4">
        <button
          onClick={handleOpenBrowser}
          disabled={status === 'executing'}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          {status === 'executing' ? (
            <>
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Opening...
            </>
          ) : (
            <>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
              Open in Browser
            </>
          )}
        </button>

        {status === 'complete' && (
          <span className="text-green-600 font-medium flex items-center gap-1">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            Opened
          </span>
        )}

        {status === 'error' && (
          <span className="text-red-600 font-medium flex items-center gap-1">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            Failed
          </span>
        )}
      </div>

      {/* Error */}
      {error && (
        <div className="border-t border-red-200 bg-red-50 dark:bg-red-900/20 p-4">
          <p className="text-red-700 dark:text-red-400 text-sm">{error}</p>
        </div>
      )}
    </div>
  );
}
