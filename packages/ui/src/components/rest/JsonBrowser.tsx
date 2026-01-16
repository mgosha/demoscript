import { useState, useCallback, useMemo } from 'react';

interface JsonBrowserProps {
  data: unknown;
  defaultExpandedDepth?: number;
  maxHeight?: string;
}

interface JsonNodeProps {
  data: unknown;
  path: string;
  depth: number;
  expandedPaths: Set<string>;
  toggleExpand: (path: string) => void;
  searchTerm: string;
  onCopyPath: (path: string) => void;
  onCopyValue: (value: unknown) => void;
}

// Check if a node or its children match the search term
function nodeMatchesSearch(data: unknown, searchTerm: string): boolean {
  if (!searchTerm) return false;
  const term = searchTerm.toLowerCase();

  if (data === null || data === undefined) {
    return 'null'.includes(term) || 'undefined'.includes(term);
  }

  if (typeof data === 'string' || typeof data === 'number' || typeof data === 'boolean') {
    return String(data).toLowerCase().includes(term);
  }

  if (Array.isArray(data)) {
    return data.some(item => nodeMatchesSearch(item, searchTerm));
  }

  if (typeof data === 'object') {
    return Object.entries(data).some(
      ([key, value]) => key.toLowerCase().includes(term) || nodeMatchesSearch(value, searchTerm)
    );
  }

  return false;
}

// Check if a key matches the search term
function keyMatchesSearch(key: string, searchTerm: string): boolean {
  if (!searchTerm) return false;
  return key.toLowerCase().includes(searchTerm.toLowerCase());
}

// Check if a primitive value matches the search term
function valueMatchesSearch(value: unknown, searchTerm: string): boolean {
  if (!searchTerm) return false;
  if (value === null || value === undefined) return false;
  if (typeof value === 'object') return false;
  return String(value).toLowerCase().includes(searchTerm.toLowerCase());
}

function JsonNode({ data, path, depth, expandedPaths, toggleExpand, searchTerm, onCopyPath, onCopyValue }: JsonNodeProps) {
  const [hoveredPath, setHoveredPath] = useState<string | null>(null);
  const isExpanded = expandedPaths.has(path);

  const handleKeyClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onCopyPath(path);
  };

  const handleValueClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onCopyValue(data);
  };

  // Render primitive values
  if (data === null) {
    const matches = valueMatchesSearch(null, searchTerm);
    return (
      <span
        className={`italic cursor-pointer hover:bg-gray-200 dark:hover:bg-slate-600 rounded px-0.5 ${matches ? 'bg-yellow-200 dark:bg-yellow-800' : 'text-gray-400 dark:text-slate-500'}`}
        onClick={handleValueClick}
        title="Click to copy value"
      >
        null
      </span>
    );
  }

  if (data === undefined) {
    return <span className="text-gray-400 dark:text-slate-500 italic">undefined</span>;
  }

  if (typeof data === 'boolean') {
    const matches = valueMatchesSearch(data, searchTerm);
    return (
      <span
        className={`cursor-pointer hover:bg-gray-200 dark:hover:bg-slate-600 rounded px-0.5 ${matches ? 'bg-yellow-200 dark:bg-yellow-800' : 'text-purple-600 dark:text-purple-400'}`}
        onClick={handleValueClick}
        title="Click to copy value"
      >
        {String(data)}
      </span>
    );
  }

  if (typeof data === 'number') {
    const matches = valueMatchesSearch(data, searchTerm);
    return (
      <span
        className={`cursor-pointer hover:bg-gray-200 dark:hover:bg-slate-600 rounded px-0.5 ${matches ? 'bg-yellow-200 dark:bg-yellow-800' : 'text-cyan-600 dark:text-cyan-400'}`}
        onClick={handleValueClick}
        title="Click to copy value"
      >
        {data}
      </span>
    );
  }

  if (typeof data === 'string') {
    const matches = valueMatchesSearch(data, searchTerm);
    const displayValue = data.length > 100 ? `${data.slice(0, 100)}...` : data;
    return (
      <span
        className={`cursor-pointer hover:bg-gray-200 dark:hover:bg-slate-600 rounded px-0.5 ${matches ? 'bg-yellow-200 dark:bg-yellow-800' : 'text-green-600 dark:text-green-400'}`}
        onClick={handleValueClick}
        title={data.length > 100 ? `${data}\n\nClick to copy value` : 'Click to copy value'}
      >
        "{displayValue}"
      </span>
    );
  }

  // Render arrays
  if (Array.isArray(data)) {
    if (data.length === 0) {
      return <span className="text-gray-500 dark:text-slate-400">[]</span>;
    }

    const hasMatchingChildren = searchTerm && nodeMatchesSearch(data, searchTerm);

    return (
      <span
        onMouseEnter={() => setHoveredPath(path)}
        onMouseLeave={() => setHoveredPath(null)}
      >
        <button
          onClick={() => toggleExpand(path)}
          className="inline-flex items-center text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-300 focus:outline-none"
        >
          <svg className={`w-3 h-3 mr-1 transition-transform ${isExpanded ? 'rotate-90' : ''}`} fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
          </svg>
          <span className={hasMatchingChildren && !isExpanded ? 'text-yellow-600 dark:text-yellow-400' : ''}>
            [{data.length}]
          </span>
        </button>
        {hoveredPath === path && (
          <button
            onClick={handleKeyClick}
            className="ml-1 text-xs text-gray-400 hover:text-blue-500 dark:hover:text-blue-400"
            title="Copy path"
          >
            {path || 'root'}
          </button>
        )}
        {isExpanded && (
          <div className="ml-4 pl-2 border-l-2 border-gray-200 dark:border-slate-600">
            {data.map((item, index) => {
              const itemPath = path ? `${path}[${index}]` : `[${index}]`;
              return (
                <div key={index} className="py-0.5">
                  <span className="text-gray-400 dark:text-slate-500 mr-2">{index}:</span>
                  <JsonNode
                    data={item}
                    path={itemPath}
                    depth={depth + 1}
                    expandedPaths={expandedPaths}
                    toggleExpand={toggleExpand}
                    searchTerm={searchTerm}
                    onCopyPath={onCopyPath}
                    onCopyValue={onCopyValue}
                  />
                </div>
              );
            })}
          </div>
        )}
      </span>
    );
  }

  // Render objects
  if (typeof data === 'object') {
    const entries = Object.entries(data);
    if (entries.length === 0) {
      return <span className="text-gray-500 dark:text-slate-400">{'{}'}</span>;
    }

    const hasMatchingChildren = searchTerm && nodeMatchesSearch(data, searchTerm);

    return (
      <span
        onMouseEnter={() => setHoveredPath(path)}
        onMouseLeave={() => setHoveredPath(null)}
      >
        <button
          onClick={() => toggleExpand(path)}
          className="inline-flex items-center text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-300 focus:outline-none"
        >
          <svg className={`w-3 h-3 mr-1 transition-transform ${isExpanded ? 'rotate-90' : ''}`} fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
          </svg>
          <span className={hasMatchingChildren && !isExpanded ? 'text-yellow-600 dark:text-yellow-400' : ''}>
            {`{${entries.length}}`}
          </span>
        </button>
        {hoveredPath === path && (
          <button
            onClick={handleKeyClick}
            className="ml-1 text-xs text-gray-400 hover:text-blue-500 dark:hover:text-blue-400"
            title="Copy path"
          >
            {path || 'root'}
          </button>
        )}
        {isExpanded && (
          <div className="ml-4 pl-2 border-l-2 border-gray-200 dark:border-slate-600">
            {entries.map(([key, val]) => {
              const keyPath = path ? `${path}.${key}` : key;
              const keyMatches = keyMatchesSearch(key, searchTerm);
              return (
                <div key={key} className="py-0.5">
                  <span
                    className={`mr-1 cursor-pointer hover:underline ${keyMatches ? 'bg-yellow-200 dark:bg-yellow-800 text-blue-700 dark:text-blue-300' : 'text-blue-600 dark:text-blue-400'}`}
                    onClick={(e) => { e.stopPropagation(); onCopyPath(keyPath); }}
                    title={`Copy path: ${keyPath}`}
                  >
                    "{key}"
                  </span>
                  <span className="text-gray-400 dark:text-slate-500 mr-1">:</span>
                  <JsonNode
                    data={val}
                    path={keyPath}
                    depth={depth + 1}
                    expandedPaths={expandedPaths}
                    toggleExpand={toggleExpand}
                    searchTerm={searchTerm}
                    onCopyPath={onCopyPath}
                    onCopyValue={onCopyValue}
                  />
                </div>
              );
            })}
          </div>
        )}
      </span>
    );
  }

  return <span className="text-gray-700 dark:text-slate-300">{String(data)}</span>;
}

// Get all paths that should be expanded by default
function getDefaultExpandedPaths(data: unknown, maxDepth: number, currentPath = '', currentDepth = 0): string[] {
  const paths: string[] = [];

  if (currentDepth >= maxDepth) return paths;

  if (Array.isArray(data)) {
    paths.push(currentPath);
    data.forEach((item, index) => {
      const itemPath = currentPath ? `${currentPath}[${index}]` : `[${index}]`;
      paths.push(...getDefaultExpandedPaths(item, maxDepth, itemPath, currentDepth + 1));
    });
  } else if (data !== null && typeof data === 'object') {
    paths.push(currentPath);
    Object.entries(data).forEach(([key, val]) => {
      const keyPath = currentPath ? `${currentPath}.${key}` : key;
      paths.push(...getDefaultExpandedPaths(val, maxDepth, keyPath, currentDepth + 1));
    });
  }

  return paths;
}

// Get all expandable paths in the data
function getAllExpandablePaths(data: unknown, currentPath = ''): string[] {
  const paths: string[] = [];

  if (Array.isArray(data) && data.length > 0) {
    paths.push(currentPath);
    data.forEach((item, index) => {
      const itemPath = currentPath ? `${currentPath}[${index}]` : `[${index}]`;
      paths.push(...getAllExpandablePaths(item, itemPath));
    });
  } else if (data !== null && typeof data === 'object' && Object.keys(data).length > 0) {
    paths.push(currentPath);
    Object.entries(data).forEach(([key, val]) => {
      const keyPath = currentPath ? `${currentPath}.${key}` : key;
      paths.push(...getAllExpandablePaths(val, keyPath));
    });
  }

  return paths;
}

export function JsonBrowser({ data, defaultExpandedDepth = 2, maxHeight = '400px' }: JsonBrowserProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [copied, setCopied] = useState<string | null>(null);

  // Initialize expanded paths based on default depth
  const defaultPaths = useMemo(() => {
    return new Set(getDefaultExpandedPaths(data, defaultExpandedDepth));
  }, [data, defaultExpandedDepth]);

  const [expandedPaths, setExpandedPaths] = useState<Set<string>>(defaultPaths);

  const toggleExpand = useCallback((path: string) => {
    setExpandedPaths(prev => {
      const next = new Set(prev);
      if (next.has(path)) {
        next.delete(path);
      } else {
        next.add(path);
      }
      return next;
    });
  }, []);

  const expandAll = useCallback(() => {
    const allPaths = getAllExpandablePaths(data);
    setExpandedPaths(new Set(allPaths));
  }, [data]);

  const collapseAll = useCallback(() => {
    setExpandedPaths(new Set());
  }, []);

  const copyAll = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(JSON.stringify(data, null, 2));
      setCopied('all');
      setTimeout(() => setCopied(null), 2000);
    } catch {
      // Ignore
    }
  }, [data]);

  const onCopyPath = useCallback(async (path: string) => {
    try {
      await navigator.clipboard.writeText(path || 'root');
      setCopied(path || 'root');
      setTimeout(() => setCopied(null), 2000);
    } catch {
      // Ignore
    }
  }, []);

  const onCopyValue = useCallback(async (value: unknown) => {
    try {
      const text = typeof value === 'string' ? value : JSON.stringify(value, null, 2);
      await navigator.clipboard.writeText(text);
      setCopied('value');
      setTimeout(() => setCopied(null), 2000);
    } catch {
      // Ignore
    }
  }, []);

  return (
    <div className="border border-gray-200 dark:border-slate-700 rounded-lg overflow-hidden">
      {/* Toolbar */}
      <div className="flex items-center gap-2 px-3 py-2 bg-gray-100 dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700">
        {/* Search */}
        <div className="relative flex-1 max-w-xs">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search keys or values..."
            className="w-full pl-7 pr-2 py-1 text-xs bg-white dark:bg-slate-900 border border-gray-300 dark:border-slate-600 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 dark:focus:ring-blue-400"
          />
          <svg className="absolute left-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>

        {/* Buttons */}
        <div className="flex items-center gap-1">
          <button
            onClick={expandAll}
            className="px-2 py-1 text-xs text-gray-600 dark:text-slate-400 hover:bg-gray-200 dark:hover:bg-slate-700 rounded transition-colors"
            title="Expand all"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
            </svg>
          </button>
          <button
            onClick={collapseAll}
            className="px-2 py-1 text-xs text-gray-600 dark:text-slate-400 hover:bg-gray-200 dark:hover:bg-slate-700 rounded transition-colors"
            title="Collapse all"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 9V4.5M9 9H4.5M9 9L3.75 3.75M9 15v4.5M9 15H4.5M9 15l-5.25 5.25M15 9h4.5M15 9V4.5M15 9l5.25-5.25M15 15h4.5M15 15v4.5m0-4.5l5.25 5.25" />
            </svg>
          </button>
          <button
            onClick={copyAll}
            className="px-2 py-1 text-xs text-gray-600 dark:text-slate-400 hover:bg-gray-200 dark:hover:bg-slate-700 rounded transition-colors flex items-center gap-1"
            title="Copy all"
          >
            {copied === 'all' ? (
              <>
                <svg className="w-3.5 h-3.5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-green-500">Copied!</span>
              </>
            ) : (
              <>
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                </svg>
                <span>Copy</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* JSON Tree */}
      <div
        className="p-3 bg-gray-50 dark:bg-slate-900/50 font-mono text-sm overflow-auto"
        style={{ maxHeight }}
      >
        <JsonNode
          data={data}
          path=""
          depth={0}
          expandedPaths={expandedPaths}
          toggleExpand={toggleExpand}
          searchTerm={searchTerm}
          onCopyPath={onCopyPath}
          onCopyValue={onCopyValue}
        />
      </div>

      {/* Status bar */}
      {(copied && copied !== 'all') && (
        <div className="px-3 py-1 bg-green-50 dark:bg-green-900/20 border-t border-gray-200 dark:border-slate-700 text-xs text-green-600 dark:text-green-400">
          Copied: {copied === 'value' ? 'value' : copied}
        </div>
      )}
    </div>
  );
}
