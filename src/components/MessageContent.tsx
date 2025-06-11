"use client";

import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { PrismLight as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark, oneLight } from 'react-syntax-highlighter/dist/cjs/styles/prism';
import { useTheme } from 'next-themes';
import { Button } from '@/components/ui/button';
import { Copy, Check } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';

interface MessageContentProps {
  content: string;
  className?: string;
}

interface CodeComponentProps {
  inline?: boolean;
  className?: string;
  children?: React.ReactNode;
}

export function MessageContent({ content, className }: MessageContentProps) {
  const { theme } = useTheme();
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const copyToClipboard = async (code: string, blockId: string) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopiedCode(blockId);
      setTimeout(() => setCopiedCode(null), 2000);
    } catch (err) {
      console.error('Failed to copy code:', err);
    }
  };

  return (
    <div className={cn("prose prose-sm max-w-none dark:prose-invert", className)}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          code(props: CodeComponentProps) {
            const { inline, className, children, ...restProps } = props;
            const match = /language-(\w+)/.exec(className || '');
            const language = match ? match[1] : '';
            const code = String(children).replace(/\n$/, '');
            const blockId = `${language}-${code.slice(0, 20)}`;

            if (!inline && language) {
              const customDarkStyle = {
                ...oneDark,
                'pre[class*="language-"]': {
                  ...oneDark['pre[class*="language-"]'],
                  background: theme === 'dark' 
                    ? 'hsl(var(--card) / 0.85)' 
                    : 'hsl(var(--card) / 0.95)',
                  margin: 0,
                  padding: 0,
                  borderRadius: 'var(--radius)',
                },
                'code[class*="language-"]': {
                  ...oneDark['code[class*="language-"]'],
                  background: 'transparent',
                }
              };

              const customLightStyle = {
                ...oneLight,
                'pre[class*="language-"]': {
                  ...oneLight['pre[class*="language-"]'],
                  background: theme === 'dark' 
                    ? 'hsl(var(--card) / 0.85)' 
                    : 'hsl(var(--card) / 0.95)',
                  margin: 0,
                  padding: 0,
                  borderRadius: 'var(--radius)',
                },
                'code[class*="language-"]': {
                  ...oneLight['code[class*="language-"]'],
                  background: 'transparent',
                }
              };

              return (
                <div className="relative group my-2">
                  <SyntaxHighlighter
                    style={theme === 'dark' ? customDarkStyle : customLightStyle}
                    language={language}
                    PreTag="div"
                    className="!m-0 !border-0"
                    customStyle={{
                      margin: '0',
                      padding: '1rem',
                      fontSize: '0.875rem',
                      lineHeight: '1.5',
                      borderRadius: 'var(--radius)',
                      backgroundColor: theme === 'dark' 
                        ? 'hsl(var(--card) / 0.85)' 
                        : 'hsl(var(--card) / 0.95)',
                      position: 'relative',
                    }}
                    showLineNumbers={false}
                    wrapLines={true}
                    {...restProps}
                  >
                    {code}
                  </SyntaxHighlighter>
                  <div className="absolute top-0 right-0 flex items-center gap-2">
                    <span className="text-xs font-medium text-muted-foreground/70 uppercase tracking-wide px-2 py-1 bg-background/20 rounded-[var(--radius)] backdrop-blur-sm">
                      {language}
                    </span>
                    <Button
                      size="sm"
                      className="h-7 w-7 p-0 hover:cursor-pointer  bg-background/20 text-muted-foreground/70 hover:bg-background/100 backdrop-blur-sm rounded-[var(--radius)]"
                      onClick={() => copyToClipboard(code, blockId)}
                    >
                      {copiedCode === blockId ? (
                        <Check className="h-3 w-3 text-green-500" />
                      ) : (
                        <Copy className="h-3 w-3" />
                      )}
                    </Button>
                  </div>
                </div>
              );
            }

            return (
              <code
                className={cn(
                  "relative rounded-[var(--radius)] bg-muted px-1.5 py-0.5 font-mono text-sm",
                  "border border-border/50"
                )}
                style={{ borderRadius: 'var(--radius)' }}
                {...restProps}
              >
                {children}
              </code>
            );
          },

          blockquote({ children }) {
            return (
              <blockquote className="border-l-4 border-primary/30 bg-muted/20 pl-4 py-2 my-4 italic rounded-[var(--radius)]">
                {children}
              </blockquote>
            );
          },

          table({ children }) {
            return (
              <div className="overflow-x-auto my-4">
                <table className="w-full border-collapse border border-border rounded-[var(--radius)]">
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

          p({ children }) {
            return (
              <p className="mb-3 leading-relaxed">
                {children}
              </p>
            );
          },

          li({ children }) {
            return (
              <li className="text-sm leading-relaxed">
                {children}
              </li>
            );
          },

          pre({ children }) {
            return (
              <pre className="overflow-x-auto rounded-[var(--radius)] bg-muted p-4 my-4">
                {children}
              </pre>
            );
          },

          hr() {
            return (
              <hr className="my-6 border-border" />
            );
          },

          em({ children }) {
            return (
              <em className="italic text-muted-foreground">
                {children}
              </em>
            );
          },

          strong({ children }) {
            return (
              <strong className="font-semibold">
                {children}
              </strong>
            );
          },
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
} 