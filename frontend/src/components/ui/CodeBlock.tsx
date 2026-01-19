import React from 'react';
import { cn } from '@/lib/utils';
import { Copy, Download, Check } from 'lucide-react';
import { copyToClipboard, downloadAsFile } from '@/lib/utils';
import { toast } from 'react-hot-toast';

interface CodeBlockProps {
  code: string;
  language?: string;
  title?: string;
  showLineNumbers?: boolean;
  maxHeight?: string;
  copyable?: boolean;
  downloadable?: boolean;
  filename?: string;
  className?: string;
}

export const CodeBlock: React.FC<CodeBlockProps> = ({
  code,
  language = 'text',
  title,
  showLineNumbers = true,
  maxHeight = '400px',
  copyable = true,
  downloadable = false,
  filename = 'code.txt',
  className,
}) => {
  const [copied, setCopied] = React.useState(false);
  const lines = code.split('\n');

  const handleCopy = async () => {
    const success = await copyToClipboard(code);
    if (success) {
      setCopied(true);
      toast.success('Copied to clipboard');
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDownload = () => {
    downloadAsFile(code, filename);
    toast.success(`Downloaded ${filename}`);
  };

  return (
    <div className={cn('rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700', className)}>
      {/* Header */}
      {(title || copyable || downloadable) && (
        <div className="flex items-center justify-between px-4 py-2 bg-slate-100 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-3">
            <div className="flex gap-1.5">
              <span className="w-3 h-3 rounded-full bg-red-400" />
              <span className="w-3 h-3 rounded-full bg-amber-400" />
              <span className="w-3 h-3 rounded-full bg-green-400" />
            </div>
            {title && (
              <span className="text-sm font-medium text-slate-600 dark:text-slate-400">
                {title}
              </span>
            )}
            {language && !title && (
              <span className="text-xs font-mono text-slate-500 dark:text-slate-400 uppercase">
                {language}
              </span>
            )}
          </div>
          <div className="flex items-center gap-1">
            {downloadable && (
              <button
                onClick={handleDownload}
                className="p-1.5 rounded hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 transition-colors"
                title="Download"
              >
                <Download className="h-4 w-4" />
              </button>
            )}
            {copyable && (
              <button
                onClick={handleCopy}
                className="p-1.5 rounded hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 transition-colors"
                title="Copy"
              >
                {copied ? (
                  <Check className="h-4 w-4 text-green-500" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </button>
            )}
          </div>
        </div>
      )}

      {/* Code content */}
      <div
        className="overflow-auto bg-slate-900 dark:bg-slate-950"
        style={{ maxHeight }}
      >
        <pre className="p-4 text-sm font-mono">
          <code>
            {lines.map((line, index) => (
              <div key={index} className="flex">
                {showLineNumbers && (
                  <span className="inline-block w-8 mr-4 text-right text-slate-500 select-none">
                    {index + 1}
                  </span>
                )}
                <span className="text-slate-100 whitespace-pre-wrap break-all">
                  {line || ' '}
                </span>
              </div>
            ))}
          </code>
        </pre>
      </div>
    </div>
  );
};

// Log viewer component
interface LogLine {
  timestamp?: string;
  level?: 'info' | 'warn' | 'error' | 'debug';
  message: string;
}

interface LogViewerProps {
  logs: LogLine[];
  title?: string;
  maxHeight?: string;
  showTimestamps?: boolean;
  className?: string;
}

const logLevelColors = {
  info: 'text-blue-400',
  warn: 'text-amber-400',
  error: 'text-red-400',
  debug: 'text-slate-400',
};

export const LogViewer: React.FC<LogViewerProps> = ({
  logs,
  title = 'Logs',
  maxHeight = '400px',
  showTimestamps = true,
  className,
}) => {
  return (
    <div className={cn('rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700', className)}>
      <div className="flex items-center justify-between px-4 py-2 bg-slate-100 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
        <span className="text-sm font-medium text-slate-600 dark:text-slate-400">
          {title}
        </span>
        <span className="text-xs text-slate-500 dark:text-slate-400">
          {logs.length} entries
        </span>
      </div>
      <div
        className="overflow-auto bg-slate-900 dark:bg-slate-950 font-mono text-sm"
        style={{ maxHeight }}
      >
        <div className="p-4 space-y-1">
          {logs.map((log, index) => (
            <div key={index} className="flex gap-3 hover:bg-slate-800/50 px-2 py-0.5 rounded">
              {showTimestamps && log.timestamp && (
                <span className="text-slate-500 whitespace-nowrap">
                  {log.timestamp}
                </span>
              )}
              {log.level && (
                <span
                  className={cn(
                    'uppercase text-xs font-semibold w-12',
                    logLevelColors[log.level]
                  )}
                >
                  {log.level}
                </span>
              )}
              <span className="text-slate-100 whitespace-pre-wrap break-all">
                {log.message}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// JSON Viewer
interface JsonViewerProps {
  data: object;
  title?: string;
  expanded?: boolean;
  className?: string;
}

export const JsonViewer: React.FC<JsonViewerProps> = ({
  data,
  title = 'JSON Data',
  className,
}) => {
  const formattedJson = JSON.stringify(data, null, 2);

  return (
    <CodeBlock
      code={formattedJson}
      language="json"
      title={title}
      showLineNumbers={false}
      copyable
      downloadable
      filename="data.json"
      className={className}
    />
  );
};
