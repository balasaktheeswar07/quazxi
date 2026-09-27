'use client';

import { memo, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Check, Copy } from 'lucide-react';

function CodeBlock({ className, children }: { className?: string; children?: React.ReactNode }) {
  const [copied, setCopied] = useState(false);
  const text = String(children ?? '').replace(/\n$/, '');

  const copy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const lang = className?.replace(/^language-/, '') || 'code';

  return (
    <div className="group relative my-3 overflow-hidden rounded-lg border border-white/10 bg-[#0d0d0f]">
      <div className="flex items-center justify-between border-b border-white/5 bg-white/[0.03] px-3 py-1.5">
        <span className="font-mono text-[11px] uppercase tracking-wide text-zinc-500">
          {lang}
        </span>
        <button
          onClick={copy}
          className="flex items-center gap-1.5 rounded text-[11px] text-zinc-500 transition-colors hover:text-zinc-200"
        >
          {copied ? (
            <>
              <Check className="h-3 w-3" /> Copied
            </>
          ) : (
            <>
              <Copy className="h-3 w-3" /> Copy
            </>
          )}
        </button>
      </div>
      <pre className="overflow-x-auto p-3 text-[13px] leading-relaxed">
        <code className="font-mono text-zinc-200">{text}</code>
      </pre>
    </div>
  );
}

export const Markdown = memo(function Markdown({ content }: { content: string }) {
  return (
    <div className="prose-chat">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          code({ className, children, ...props }) {
            const isInline = !className;
            if (isInline) {
              return (
                <code className="rounded bg-white/10 px-1.5 py-0.5 font-mono text-[12px] text-zinc-300" {...props}>
                  {children}
                </code>
              );
            }
            return <CodeBlock className={className}>{children}</CodeBlock>;
          },
          p({ children }) {
            return <p className="mb-3 leading-relaxed last:mb-0">{children}</p>;
          },
          ul({ children }) {
            return <ul className="mb-3 list-disc space-y-1 pl-5 last:mb-0">{children}</ul>;
          },
          ol({ children }) {
            return <ol className="mb-3 list-decimal space-y-1 pl-5 last:mb-0">{children}</ol>;
          },
          li({ children }) {
            return <li className="leading-relaxed">{children}</li>;
          },
          h1({ children }) {
            return <h1 className="mb-3 mt-4 text-lg font-semibold text-zinc-100 first:mt-0">{children}</h1>;
          },
          h2({ children }) {
            return <h2 className="mb-2 mt-4 text-base font-semibold text-zinc-100 first:mt-0">{children}</h2>;
          },
          h3({ children }) {
            return <h3 className="mb-2 mt-3 text-sm font-semibold text-zinc-200 first:mt-0">{children}</h3>;
          },
          a({ href, children }) {
            return (
              <a
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-zinc-300 underline underline-offset-2 hover:text-zinc-100"
              >
                {children}
              </a>
            );
          },
          blockquote({ children }) {
            return (
              <blockquote className="mb-3 border-l-2 border-zinc-600 pl-3 text-zinc-400">
                {children}
              </blockquote>
            );
          },
          table({ children }) {
            return (
              <div className="mb-3 overflow-x-auto">
                <table className="w-full border-collapse text-sm">{children}</table>
              </div>
            );
          },
          th({ children }) {
            return (
              <th className="border border-white/10 bg-white/5 px-3 py-1.5 text-left font-medium text-zinc-200">
                {children}
              </th>
            );
          },
          td({ children }) {
            return <td className="border border-white/10 px-3 py-1.5 text-zinc-300">{children}</td>;
          },
          hr() {
            return <hr className="my-4 border-white/10" />;
          },
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
});
