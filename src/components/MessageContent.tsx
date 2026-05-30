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
    <div className={cn("prose prose-sm max-w-none dark:prose-invert text-[15px] leading-7 text-[#A7A7A7] text-left prose-p:my-3 prose-li:my-1 prose-pre:my-0", className)}>
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
                <div className="relative group my-4 overflow-hidden rounded-lg border border-[#2C2C2C] bg-[#0A0A0A]">
                  <div className="flex items-center justify-between border-b border-[#2C2C2C] bg-[#111111] px-3 py-2">
                    <span className="text-[11px] font-medium text-[#8A8A8A] uppercase">
                      {language || 'code'}
                    </span>
                    <Button
                      size="sm"
                      className="h-7 w-7 p-0 hover:cursor-pointer bg-transparent text-[#8A8A8A] hover:bg-[#2C2C2C] hover:text-[#D5D5D5] rounded-md"
                      onClick={() => copyToClipboard(code, blockId)}
                    >
                      {copiedCode === blockId ? (
                        <Check className="h-3 w-3 text-green-500" />
                      ) : (
                        <Copy className="h-3 w-3" />
                      )}
                    </Button>
                  </div>
                  <SyntaxHighlighter
                    style={oneDark}
                    language={language}
                    PreTag="div"
                    className="!m-0 !border-0 !bg-[#0A0A0A]"
                    customStyle={{
                      margin: 0,
                      padding: '1rem',
                      fontSize: '0.875rem',
                      lineHeight: '1.65',
                      borderRadius: 0,
                      background: '#0A0A0A',
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
                  "bg-[#1B1B1B] border border-[#2C2C2C] font-mono text-[#D5D5D5] text-[0.9em] px-1.5 py-0.5 rounded-md",
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
              <blockquote className="border-l-2 border-[#5D5D5D] bg-[#151515] pl-4 pr-3 py-2 my-4 rounded-md text-[15px] text-[#B8B8B8]">
                {children}
              </blockquote>
            );
          },

          table({ children }) {
            return (
              <div className="overflow-x-auto my-5 rounded-lg border border-[#2C2C2C] bg-[#0F0F0F]">
                <table className="w-full border-collapse text-sm">
                  {children}
                </table>
              </div>
            );
          },

          th({ children }) {
            return (
              <th className="border-b border-r last:border-r-0 border-[#2C2C2C] bg-[#151515] px-3 py-2.5 text-left font-semibold text-[#D5D5D5] align-top">
                {children}
              </th>
            );
          },

          td({ children }) {
            return (
              <td className="border-b border-r last:border-r-0 border-[#242424] px-3 py-2.5 text-[#B8B8B8] align-top last:[tr_&]:border-r-0">
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
                    ? "bg-[#1B1B1B] px-2 py-1 text-[#D5D5D5] hover:bg-[#242424]"
                    : "text-[#D5D5D5] underline decoration-[#5D5D5D] underline-offset-4 hover:text-white hover:decoration-[#A7A7A7]"
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
              <ul className="list-disc list-outside space-y-1.5 my-3 pl-6 marker:text-[#6F6F6F]">
                {children}
              </ul>
            );
          },

          ol({ children }) {
            return (
              <ol className="list-decimal list-outside space-y-1.5 my-3 pl-6 marker:text-[#8A8A8A] marker:font-medium">
                {children}
              </ol>
            );
          },

          h1({ children }) {
            return (
              <h1 className="text-2xl font-semibold mt-7 mb-3 border-b border-[#2C2C2C] pb-2 text-[#E5E5E5]">
                {children}
              </h1>
            );
          },

          h2({ children }) {
            return (
              <h2 className="text-xl font-semibold mt-6 mb-2 text-[#E0E0E0]">
                {children}
              </h2>
            );
          },

          h3({ children }) {
            return (
              <h3 className="text-base font-semibold mt-5 mb-2 text-[#D5D5D5]">
                {children}
              </h3>
            );
          },

          p({ children }) {
            return (
              <p className="my-3 leading-7 text-[#B8B8B8] text-[15px]">
                {children}
              </p>
            );
          },

          li({ children }) {
            return (
              <li className="pl-1 leading-7 text-[#B8B8B8] text-[15px]">
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
}); 
