import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { toast } from 'react-hot-toast';
import { Card, CardHeader, CardTitle, CardContent, Button } from '@/components/ui';
import { copyToClipboard, downloadAsFile } from '@/lib/utils';
import { Copy, Download, Check, FileText, ExternalLink } from 'lucide-react';

interface PostmortemViewerProps {
  report: string;
  incidentTitle?: string;
}

export const PostmortemViewer: React.FC<PostmortemViewerProps> = ({
  report,
  incidentTitle = 'Incident',
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    const success = await copyToClipboard(report);
    if (success) {
      setCopied(true);
      toast.success('Report copied to clipboard');
      setTimeout(() => setCopied(false), 2000);
    } else {
      toast.error('Failed to copy to clipboard');
    }
  };

  const handleDownload = () => {
    const filename = `postmortem-${incidentTitle.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}.md`;
    downloadAsFile(report, filename, 'text/markdown');
    toast.success('Report downloaded');
  };

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Postmortem Report
        </CardTitle>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleCopy}
            leftIcon={copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
          >
            {copied ? 'Copied!' : 'Copy'}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDownload}
            leftIcon={<Download className="h-4 w-4" />}
          >
            Export
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="markdown-content prose prose-slate dark:prose-invert max-w-none">
          <ReactMarkdown
            components={{
              // Custom link rendering with external icon
              a: ({ href, children }) => (
                <a
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1"
                >
                  {children}
                  <ExternalLink className="h-3 w-3" />
                </a>
              ),
              // Custom code block styling
              code: ({ className, children, ...props }) => {
                const isInline = !className;
                if (isInline) {
                  return (
                    <code
                      className="bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded text-sm"
                      {...props}
                    >
                      {children}
                    </code>
                  );
                }
                return (
                  <code className={className} {...props}>
                    {children}
                  </code>
                );
              },
              // Custom pre styling for code blocks
              pre: ({ children }) => (
                <pre className="bg-slate-900 dark:bg-slate-950 text-slate-100 p-4 rounded-lg overflow-x-auto">
                  {children}
                </pre>
              ),
              // Custom heading styles
              h1: ({ children }) => (
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white border-b border-slate-200 dark:border-slate-700 pb-2">
                  {children}
                </h1>
              ),
              h2: ({ children }) => (
                <h2 className="text-xl font-semibold text-slate-900 dark:text-white mt-8 mb-4">
                  {children}
                </h2>
              ),
              h3: ({ children }) => (
                <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mt-6 mb-3">
                  {children}
                </h3>
              ),
              // Custom list styling
              ul: ({ children }) => (
                <ul className="list-disc pl-5 space-y-1 text-slate-600 dark:text-slate-300">
                  {children}
                </ul>
              ),
              ol: ({ children }) => (
                <ol className="list-decimal pl-5 space-y-1 text-slate-600 dark:text-slate-300">
                  {children}
                </ol>
              ),
              // Custom blockquote styling
              blockquote: ({ children }) => (
                <blockquote className="border-l-4 border-primary-500 pl-4 py-1 my-4 bg-slate-50 dark:bg-slate-800/50 rounded-r">
                  {children}
                </blockquote>
              ),
              // Custom table styling
              table: ({ children }) => (
                <div className="overflow-x-auto my-4">
                  <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
                    {children}
                  </table>
                </div>
              ),
              th: ({ children }) => (
                <th className="px-4 py-2 text-left text-sm font-semibold text-slate-900 dark:text-white bg-slate-50 dark:bg-slate-800">
                  {children}
                </th>
              ),
              td: ({ children }) => (
                <td className="px-4 py-2 text-sm text-slate-600 dark:text-slate-300 border-t border-slate-200 dark:border-slate-700">
                  {children}
                </td>
              ),
            }}
          >
            {report}
          </ReactMarkdown>
        </div>
      </CardContent>
    </Card>
  );
};
