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
import { useState } from 'react';
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
    <div className={cn("prose prose-sm max-w-none dark:prose-invert text-base text-[#A7A7A7] text-left", className)}>
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
                <div className="relative group my-2">
                  <SyntaxHighlighter
                    style={oneDark}
                    language={language}
                    PreTag="div"
                    className="!m-0 !border-0 rounded-[20px]"
                    customStyle={{
                      margin: 0,
                      padding: '1.5rem',
                      fontSize: '1rem',
                      lineHeight: '1.4',
                      borderRadius: '20px',
                    }}
                    showLineNumbers={false}
                    wrapLines={true}
                    {...restProps}
                  >
                    {code}
                  </SyntaxHighlighter>
                  <div className="absolute top-2 right-2 flex items-center gap-2">
                    <span className="text-xs font-medium text-muted-foreground/70 uppercase tracking-wide px-2 py-1 bg-background/20 rounded-[20px] backdrop-blur-sm">
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
                  "bg-[#151515] font-mono text-[#A7A7A7] text-base px-1 py-0.5",
                  className
                )}
                style={{ borderRadius: '10px' }}
                {...restProps}
              >
                {children}
              </code>
            );
          },

          blockquote({ children }) {
            return (
              <blockquote className="border-l-4 border-primary/30 bg-muted/20 pl-4 py-2 my-4 italic rounded-[var(--radius)] text-base">
                {children}
              </blockquote>
            );
          },

          table({ children }) {
            return (
              <div className="overflow-x-auto my-4">
                <table className="w-full border-collapse border border-border rounded-[var(--radius)] text-base">
                  {children}
                </table>
              </div>
            );
          },

          th({ children }) {
            return (
              <th className="border border-border bg-muted/50 px-3 py-2 text-left font-medium text-base">
                {children}
              </th>
            );
          },

          td({ children }) {
            return (
              <td className="border border-border px-3 py-2 text-base">
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
                  "inline-flex items-center gap-2 px-2 py-1 rounded-md font-medium transition-colors text-base",
                  isFile
                    ? "bg-muted text-foreground hover:bg-muted/80"
                    : "text-primary hover:text-primary/80 underline underline-offset-2"
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
                  className="rounded-lg border max-w-full h-auto max-h-96"
                  style={{ objectFit: 'contain' }}
                  unoptimized
                />
              </div>
            );
          },

          ul({ children }) {
            return (
              <ul className="list-disc list-outside space-y-1 my-2 ml-6 text-base">
                {children}
              </ul>
            );
          },

          ol({ children }) {
            return (
              <ol className="list-decimal list-outside space-y-1 my-2 ml-6 text-base">
                {children}
              </ol>
            );
          },

          h1({ children }) {
            return (
              <h1 className="text-2xl font-bold mt-6 mb-3 border-b border-border pb-2 text-[#A7A7A7]">
                {children}
              </h1>
            );
          },

          h2({ children }) {
            return (
              <h2 className="text-xl font-semibold mt-5 mb-2 text-[#A7A7A7]">
                {children}
              </h2>
            );
          },

          h3({ children }) {
            return (
              <h3 className="text-base font-medium mt-4 mb-2 text-[#A7A7A7]">
                {children}
              </h3>
            );
          },

          p({ children }) {
            return (
              <p className="mb-3 leading-relaxed text-[#A7A7A7] text-base">
                {children}
              </p>
            );
          },

          li({ children }) {
            return (
              <li className=" leading-relaxed text-[#A7A7A7] text-base">
                {children}
              </li>
            );
          },

          pre({ children }) {
            return <>{children}</>;
          },

          hr() {
            return (
              <hr className="my-6 border-border" />
            );
          },

          em({ children }) {
            return (
              <em className="italic text-[#A7A7A7] text-base">
                {children}
              </em>
            );
          },

          strong({ children }) {
            return (
              <strong className="font-semibold text-[#d5d5d5] text-base">
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