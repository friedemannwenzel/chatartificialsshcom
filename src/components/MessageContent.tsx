"use client";

import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark, oneLight } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { useTheme } from 'next-themes';
import { cn } from '@/lib/utils';

interface MessageContentProps {
  content: string;
  className?: string;
}

export function MessageContent({ content, className }: MessageContentProps) {
  const { theme } = useTheme();

  return (
    <div className={cn("prose prose-sm max-w-none dark:prose-invert", className)}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          // Custom code block component with syntax highlighting and copy button
          code({ node, inline, className, children, ...props }: any) {
            const match = /language-(\w+)/.exec(className || '');
            const language = match ? match[1] : '';
            const code = String(children).replace(/\n$/, '');

            if (!inline && language) {
              return (
                <SyntaxHighlighter
                  style={theme === 'dark' ? oneDark : oneLight}
                  language={language}
                  PreTag="div"
                  className="!m-0 !rounded-lg"
                  customStyle={{
                    margin: '0',
                    padding: '1rem',
                    fontSize: '0.875rem',
                    lineHeight: '1.5',
                    borderRadius: '0.5rem',
                  } as any}
                  showLineNumbers={false}
                  wrapLines={true}
                  {...props}
                >
                  {code}
                </SyntaxHighlighter>
              );
            }

            // Inline code
            return (
              <code
                className={cn(
                  "relative rounded bg-muted px-1.5 py-0.5 font-mono text-sm",
                  "border border-border/50"
                )}
                {...props}
              >
                {children}
              </code>
            );
          },

          // Custom blockquote styling
          blockquote({ children }) {
            return (
              <blockquote className="border-l-4 border-primary/30 bg-muted/20 pl-4 py-2 my-4 italic">
                {children}
              </blockquote>
            );
          },

          // Custom table styling
          table({ children }) {
            return (
              <div className="overflow-x-auto my-4">
                <table className="w-full border-collapse border border-border rounded-lg">
                  {children}
                </table>
              </div>
            );
          },

          th({ children }) {
            return (
              <th className="border border-border bg-muted/50 px-3 py-2 text-left font-medium">
                {children}
              </th>
            );
          },

          td({ children }) {
            return (
              <td className="border border-border px-3 py-2">
                {children}
              </td>
            );
          },

          // Custom link styling
          a({ href, children }) {
            return (
              <a
                href={href}
                className="text-primary hover:text-primary/80 underline underline-offset-2"
                target="_blank"
                rel="noopener noreferrer"
              >
                {children}
              </a>
            );
          },

          // Custom list styling
          ul({ children }) {
            return (
              <ul className="list-disc list-inside space-y-1 my-2">
                {children}
              </ul>
            );
          },

          ol({ children }) {
            return (
              <ol className="list-decimal list-inside space-y-1 my-2">
                {children}
              </ol>
            );
          },

          // Custom heading styling
          h1({ children }) {
            return (
              <h1 className="text-xl font-bold mt-6 mb-3 border-b border-border pb-2">
                {children}
              </h1>
            );
          },

          h2({ children }) {
            return (
              <h2 className="text-lg font-semibold mt-5 mb-2">
                {children}
              </h2>
            );
          },

          h3({ children }) {
            return (
              <h3 className="text-base font-medium mt-4 mb-2">
                {children}
              </h3>
            );
          },

          // Custom paragraph spacing
          p({ children }) {
            return (
              <p className="mb-3 leading-relaxed">
                {children}
              </p>
            );
          },
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
} 