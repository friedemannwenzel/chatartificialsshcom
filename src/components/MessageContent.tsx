"use client";

import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { PrismLight as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/cjs/styles/prism';
import jsx from 'react-syntax-highlighter/dist/cjs/languages/prism/jsx';
import typescript from 'react-syntax-highlighter/dist/cjs/languages/prism/typescript';
import javascript from 'react-syntax-highlighter/dist/cjs/languages/prism/javascript';
import python from 'react-syntax-highlighter/dist/cjs/languages/prism/python';
import Image from 'next/image';
import css from 'react-syntax-highlighter/dist/cjs/languages/prism/css';
import bash from 'react-syntax-highlighter/dist/cjs/languages/prism/bash';
import json from 'react-syntax-highlighter/dist/cjs/languages/prism/json';
import { Button } from '@/components/ui/button';
import { Copy, Check, FileText } from 'lucide-react';
import { useState, memo } from 'react';
import { cn } from '@/lib/utils';

// Register languages
SyntaxHighlighter.registerLanguage('jsx', jsx);
SyntaxHighlighter.registerLanguage('tsx', jsx);
SyntaxHighlighter.registerLanguage('typescript', typescript);
SyntaxHighlighter.registerLanguage('javascript', javascript);
SyntaxHighlighter.registerLanguage('python', python);
SyntaxHighlighter.registerLanguage('css', css);
SyntaxHighlighter.registerLanguage('bash', bash);
SyntaxHighlighter.registerLanguage('json', json);

// Code blocks stay intentionally dark in both themes — a framed "editor"
// card that reads as a distinct surface against the conversation.
const CODE_BG = '#0d0e11';
const CODE_HEADER_BG = '#15171c';

interface MessageContentProps {
  content: string;
  className?: string;
}

interface CodeComponentProps {
  inline?: boolean;
  className?: string;
  children?: React.ReactNode;
}

export const MessageContent = memo(function MessageContent({ content, className }: MessageContentProps) {
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
    <div className={cn("prose prose-sm max-w-none dark:prose-invert text-[15px] leading-7 text-ink text-left prose-p:my-3 prose-li:my-1 prose-pre:my-0", className)}>
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
              return (
                <div className="relative group my-4 overflow-hidden rounded-xl border border-line" style={{ background: CODE_BG }}>
                  <div className="flex items-center justify-between border-b border-white/[0.06] px-3.5 py-2" style={{ background: CODE_HEADER_BG }}>
                    <span className="text-[11px] font-medium uppercase tracking-wider text-[#8a8f99]">
                      {language || 'code'}
                    </span>
                    <Button
                      size="sm"
                      className="h-7 w-7 p-0 hover:cursor-pointer bg-transparent text-[#8a8f99] hover:bg-white/10 hover:text-zinc-100 rounded-md"
                      onClick={() => copyToClipboard(code, blockId)}
                    >
                      {copiedCode === blockId ? (
                        <Check className="h-3 w-3 text-emerald-400" />
                      ) : (
                        <Copy className="h-3 w-3" />
                      )}
                    </Button>
                  </div>
                  <SyntaxHighlighter
                    style={oneDark}
                    language={language}
                    PreTag="div"
                    className="!m-0 !border-0"
                    customStyle={{
                      margin: 0,
                      padding: '1rem',
                      fontSize: '0.875rem',
                      lineHeight: '1.65',
                      borderRadius: 0,
                      background: CODE_BG,
                    }}
                    showLineNumbers={false}
                    wrapLines={true}
                    wrapLongLines={true}
                    {...restProps}
                  >
                    {code}
                  </SyntaxHighlighter>
                </div>
              );
            }

            return (
              <code
                className={cn(
                  "bg-panel border border-line font-mono text-ink text-[0.9em] px-1.5 py-0.5 rounded-md",
                  className
                )}
                {...restProps}
              >
                {children}
              </code>
            );
          },

          blockquote({ children }) {
            return (
              <blockquote className="border-l-2 border-brand-line bg-panel/70 pl-4 pr-3 py-2 my-4 rounded-r-md text-[15px] text-body">
                {children}
              </blockquote>
            );
          },

          table({ children }) {
            return (
              <div className="overflow-x-auto my-5 rounded-lg border border-line bg-panel">
                <table className="w-full border-collapse text-sm">
                  {children}
                </table>
              </div>
            );
          },

          th({ children }) {
            return (
              <th className="border-b border-r last:border-r-0 border-line bg-panel px-3 py-2.5 text-left font-semibold text-ink align-top">
                {children}
              </th>
            );
          },

          td({ children }) {
            return (
              <td className="border-b border-r last:border-r-0 border-line px-3 py-2.5 text-body align-top last:[tr_&]:border-r-0">
                {children}
              </td>
            );
          },

          a({ href, children }) {
            const isFile = href && /\.(pdf|docx?|txt|rtf|xls[x]?|csv|pptx?)(\?.*)?$/i.test(href);
            return (
              <a
                href={href}
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-md font-medium transition-colors text-[15px]",
                  isFile
                    ? "bg-panel border border-line px-2 py-1 text-body hover:bg-hover"
                    : "text-brand-ink underline decoration-brand-line underline-offset-4 hover:text-brand hover:decoration-brand"
                )}
                target="_blank"
                rel="noopener noreferrer"
              >
                {isFile && <FileText className="w-4 h-4" />}
                {children}
              </a>
            );
          },

          img({ src, alt }) {
            if (!src) return null;

            return (
              <div className="my-4">
                <Image
                  src={src as string}
                  alt={alt || 'Uploaded image'}
                  width={800}
                  height={600}
                  className="rounded-lg border border-line max-w-full h-auto max-h-96"
                  style={{ objectFit: 'contain' }}
                  unoptimized
                />
              </div>
            );
          },

          ul({ children }) {
            return (
              <ul className="list-disc list-outside space-y-1.5 my-3 pl-6 marker:text-faint">
                {children}
              </ul>
            );
          },

          ol({ children }) {
            return (
              <ol className="list-decimal list-outside space-y-1.5 my-3 pl-6 marker:text-dim marker:font-medium">
                {children}
              </ol>
            );
          },

          h1({ children }) {
            return (
              <h1 className="text-2xl font-semibold tracking-tight mt-7 mb-3 border-b border-line pb-2 text-ink">
                {children}
              </h1>
            );
          },

          h2({ children }) {
            return (
              <h2 className="text-xl font-semibold tracking-tight mt-6 mb-2 text-ink">
                {children}
              </h2>
            );
          },

          h3({ children }) {
            return (
              <h3 className="text-base font-semibold mt-5 mb-2 text-ink">
                {children}
              </h3>
            );
          },

          p({ children }) {
            return (
              <p className="my-3 leading-7 text-body text-[15px]">
                {children}
              </p>
            );
          },

          li({ children }) {
            return (
              <li className="pl-1 leading-7 text-body text-[15px]">
                {children}
              </li>
            );
          },

          pre({ children }) {
            return <>{children}</>;
          },

          hr() {
            return (
              <hr className="my-6 border-line" />
            );
          },

          em({ children }) {
            return (
              <em className="italic text-dim text-base">
                {children}
              </em>
            );
          },

          strong({ children }) {
            return (
              <strong className="font-semibold text-ink text-base">
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
});
