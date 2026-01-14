import { useState, useEffect } from 'react';
import { useDemo } from '../context/DemoContext';
import { substituteVariables, substituteInObject, extractValueByPath } from '../lib/variable-substitution';
import type { DatabaseStep as DatabaseStepType, ExplicitDatabaseStep } from '../types/schema';
import { getDatabaseOperation } from '../types/schema';
import { GlowingCard, SuccessCheck } from './effects';

interface Props {
  step: DatabaseStepType | ExplicitDatabaseStep;
}

export function DatabaseStep({ step }: Props) {
  const { state, dispatch, getStepStatus } = useDemo();
  const [response, setResponse] = useState<unknown>(null);
  const [error, setError] = useState<string | null>(null);

  const status = getStepStatus(state.currentStep);
  const dbType = step.type || 'mongodb';
  const description = step.description
    ? substituteVariables(step.description, state.variables)
    : undefined;

  // Reset state when step changes
  useEffect(() => {
    setResponse(null);
    setError(null);
  }, [state.currentStep]);

  // Load from recordings in recorded mode
  useEffect(() => {
    if (state.mode === 'recorded' && state.recordings) {
      const recording = state.recordings.recordings.find(
        (r) => r.stepId === `step-${state.currentStep}`
      );
      if (recording?.response?.body) {
        setResponse(recording.response.body);
      }
    }
  }, [state.mode, state.recordings, state.currentStep]);

  const handleExecute = async () => {
    dispatch({ type: 'SET_STEP_STATUS', payload: { step: state.currentStep, status: 'executing' } });
    setError(null);

    try {
      if (state.mode === 'recorded') {
        // Simulate delay for recorded mode
        await new Promise((resolve) => setTimeout(resolve, 500));

        const recording = state.recordings?.recordings.find(
          (r) => r.stepId === `step-${state.currentStep}`
        );

        if (recording?.response?.body) {
          setResponse(recording.response.body);
          saveVariables(recording.response.body);
          dispatch({ type: 'SET_STEP_STATUS', payload: { step: state.currentStep, status: 'complete' } });
        } else {
          throw new Error('No recording found for this step');
        }
      } else {
        // Live execution
        const query = substituteInObject(step.query || {}, state.variables);
        const update = step.update ? substituteInObject(step.update, state.variables) : undefined;
        const document = step.document ? substituteInObject(step.document, state.variables) : undefined;

        const res = await fetch('/api/execute-db', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'ngrok-skip-browser-warning': 'true',
          },
          body: JSON.stringify({
            operation: getDatabaseOperation(step),
            type: dbType,
            collection: step.collection,
            table: step.table,
            query,
            update,
            document,
            projection: step.projection,
          }),
        });

        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.error || `Request failed with status ${res.status}`);
        }

        setResponse(data);
        saveVariables(data);
        dispatch({ type: 'SET_STEP_STATUS', payload: { step: state.currentStep, status: 'complete' } });
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Database operation failed';
      setError(message);
      dispatch({ type: 'SET_STEP_ERROR', payload: { step: state.currentStep, error: message } });
      dispatch({ type: 'SET_STEP_STATUS', payload: { step: state.currentStep, status: 'error' } });
    }
  };

  const saveVariables = (data: unknown) => {
    if (!step.save) return;

    const newVariables: Record<string, unknown> = {};
    for (const [varName, path] of Object.entries(step.save)) {
      const value = extractValueByPath(data, path);
      if (value !== undefined) {
        newVariables[varName] = value;
      }
    }

    if (Object.keys(newVariables).length > 0) {
      dispatch({ type: 'SET_VARIABLES', payload: newVariables });
    }
  };

  const getOperationLabel = (op: string): string => {
    const labels: Record<string, string> = {
      find: 'Find Documents',
      findOne: 'Find One Document',
      insertOne: 'Insert Document',
      updateOne: 'Update Document',
      deleteOne: 'Delete Document',
      query: 'Execute Query',
    };
    return labels[op] || op;
  };

  const getDbIcon = () => {
    if (dbType === 'mongodb') {
      return (
        <svg className="w-5 h-5 text-emerald-600 dark:text-emerald-400" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z" />
        </svg>
      );
    }
    return (
      <svg className="w-5 h-5 text-emerald-600 dark:text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
      </svg>
    );
  };

  const formatQuery = () => {
    if (typeof step.query === 'string') {
      return step.query;
    }
    return JSON.stringify(substituteInObject(step.query || {}, state.variables), null, 2);
  };

  return (
    <GlowingCard isActive={status === 'complete'} color="green" intensity="medium">
      <div className="bg-white/90 dark:bg-slate-800/80 backdrop-blur-sm rounded-xl shadow-md dark:shadow-xl border border-gray-200 dark:border-emerald-500/20 overflow-hidden transition-colors duration-300">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 dark:border-slate-700/50 bg-gray-50 dark:bg-slate-900/30">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-emerald-100 dark:bg-emerald-500/20 flex items-center justify-center">
                {getDbIcon()}
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  {step.title || getOperationLabel(getDatabaseOperation(step))}
                </h3>
                <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-slate-400">
                  <span className="px-2 py-0.5 bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 rounded text-xs font-medium uppercase">
                    {dbType}
                  </span>
                  {step.collection && (
                    <span className="font-mono">{step.collection}</span>
                  )}
                  {step.table && (
                    <span className="font-mono">{step.table}</span>
                  )}
                </div>
              </div>
            </div>
            {status === 'complete' && <SuccessCheck size={24} animated={false} />}
          </div>
        </div>

        {/* Description */}
        {description && (
          <div className="px-6 py-3 border-b border-gray-200 dark:border-slate-700/50 bg-gray-50/50 dark:bg-slate-900/20">
            <p className="text-sm text-gray-600 dark:text-slate-400">{description}</p>
          </div>
        )}

        {/* Operation display */}
        <div className="p-4 border-b border-gray-200 dark:border-slate-700/50">
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2 py-1 bg-slate-100 dark:bg-slate-700/50 text-slate-700 dark:text-slate-300 rounded text-xs font-mono font-medium">
              {getDatabaseOperation(step)}
            </span>
          </div>

          {/* Query preview */}
          {step.query && (
            <div className="mt-3">
              <label className="block text-xs font-medium text-gray-500 dark:text-slate-500 uppercase tracking-wide mb-1">
                {typeof step.query === 'string' ? 'Query' : 'Filter'}
              </label>
              <pre className="p-3 bg-slate-950 rounded-lg text-sm font-mono text-emerald-300 overflow-x-auto">
                {formatQuery()}
              </pre>
            </div>
          )}

          {/* Update preview */}
          {step.update && (
            <div className="mt-3">
              <label className="block text-xs font-medium text-gray-500 dark:text-slate-500 uppercase tracking-wide mb-1">
                Update
              </label>
              <pre className="p-3 bg-slate-950 rounded-lg text-sm font-mono text-yellow-300 overflow-x-auto">
                {JSON.stringify(substituteInObject(step.update, state.variables), null, 2)}
              </pre>
            </div>
          )}

          {/* Document preview */}
          {step.document && (
            <div className="mt-3">
              <label className="block text-xs font-medium text-gray-500 dark:text-slate-500 uppercase tracking-wide mb-1">
                Document
              </label>
              <pre className="p-3 bg-slate-950 rounded-lg text-sm font-mono text-blue-300 overflow-x-auto">
                {JSON.stringify(substituteInObject(step.document, state.variables), null, 2)}
              </pre>
            </div>
          )}
        </div>

        {/* Execute button */}
        <div className="p-4 border-b border-gray-200 dark:border-slate-700/50">
          <button
            onClick={handleExecute}
            disabled={status === 'executing'}
            className="w-full px-4 py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-medium rounded-lg hover:from-emerald-400 hover:to-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-emerald-500/25 transition-all duration-300 flex items-center justify-center gap-2"
          >
            {status === 'executing' ? (
              <>
                <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Executing...
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                Execute
              </>
            )}
          </button>
        </div>

        {/* Error display */}
        {error && (
          <div className="p-4 bg-red-50 dark:bg-red-500/10 border-b border-red-200 dark:border-red-500/30">
            <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
          </div>
        )}

        {/* Response display */}
        {response !== null && response !== undefined && (
          <div className="p-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
              Result
            </label>
            {Array.isArray(response) ? (
              <div className="space-y-2">
                <p className="text-sm text-gray-500 dark:text-slate-400">
                  {response.length} document{response.length !== 1 ? 's' : ''} returned
                </p>
                <pre className="p-4 bg-slate-950 rounded-lg text-sm font-mono text-green-300 overflow-x-auto max-h-96">
                  {JSON.stringify(response, null, 2)}
                </pre>
              </div>
            ) : (
              <pre className="p-4 bg-slate-950 rounded-lg text-sm font-mono text-green-300 overflow-x-auto max-h-96">
                {JSON.stringify(response, null, 2)}
              </pre>
            )}
          </div>
        )}
      </div>
    </GlowingCard>
  );
}
