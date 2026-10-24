import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface MarkdownRendererProps {
  content: string;
}

export default function MarkdownRenderer({ content }: MarkdownRendererProps) {
  return (
    <div className="markdown-body text-slate-800">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h1: ({ node, ...props }) => (
            <h1 className="text-2xl font-bold text-slate-900 mt-6 mb-3 pb-2 border-b border-slate-200" {...props} />
          ),
          h2: ({ node, ...props }) => (
            <h2 className="text-xl font-bold text-slate-900 mt-5 mb-2.5 pb-1 border-b border-slate-200" {...props} />
          ),
          h3: ({ node, ...props }) => (
            <h3 className="text-lg font-semibold text-slate-900 mt-4 mb-2" {...props} />
          ),
          p: ({ node, ...props }) => (
            <p className="text-sm leading-relaxed mb-3 text-slate-700" {...props} />
          ),
          ul: ({ node, ...props }) => (
            <ul className="list-disc pl-5 mb-3 text-sm space-y-1 text-slate-700" {...props} />
          ),
          ol: ({ node, ...props }) => (
            <ol className="list-decimal pl-5 mb-3 text-sm space-y-1 text-slate-700" {...props} />
          ),
          li: ({ node, ...props }) => (
            <li className="leading-relaxed" {...props} />
          ),
          blockquote: ({ node, ...props }) => (
            <blockquote className="border-l-4 border-blue-500 pl-4 py-1 italic bg-blue-50/50 text-slate-600 rounded-r my-3 text-sm" {...props} />
          ),
          a: ({ node, href, children, ...props }) => (
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 underline font-medium hover:text-blue-800"
              {...props}
            >
              {children}
            </a>
          ),
          img: ({ node, src, alt, ...props }) => (
            <span className="block my-4">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={src}
                alt={alt || "패치 노트 이미지"}
                className="rounded-lg border border-slate-200 max-h-[480px] w-auto object-cover shadow-sm"
                loading="lazy"
              />
              {alt && <span className="block text-xs text-slate-500 mt-1">{alt}</span>}
            </span>
          ),
          code: ({ node, className, children, ...props }) => {
            const isInline = !className;
            if (isInline) {
              return (
                <code className="bg-slate-100 px-1.5 py-0.5 rounded text-xs font-mono text-pink-600" {...props}>
                  {children}
                </code>
              );
            }
            return (
              <pre className="bg-slate-900 text-slate-100 p-4 rounded-lg overflow-x-auto text-xs font-mono my-3 border border-slate-800">
                <code>{children}</code>
              </pre>
            );
          },
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
