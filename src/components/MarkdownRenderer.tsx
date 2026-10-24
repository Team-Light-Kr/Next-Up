import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface MarkdownRendererProps {
  content: string;
}

export default function MarkdownRenderer({ content }: MarkdownRendererProps) {
  if (!content) {
    return <p className="text-xs text-slate-400">본문 내용이 없습니다.</p>;
  }

  return (
    <div className="markdown-body text-slate-800 text-left space-y-2">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h1: ({ node, ...props }) => (
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 mt-6 mb-3 pb-2 border-b border-slate-200 text-left" {...props} />
          ),
          h2: ({ node, ...props }) => (
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 mt-5 mb-2.5 pb-1 border-b border-slate-200 text-left" {...props} />
          ),
          h3: ({ node, ...props }) => (
            <h3 className="text-base sm:text-lg font-semibold text-slate-900 mt-4 mb-2 text-left" {...props} />
          ),
          p: ({ node, ...props }) => (
            <p className="text-xs sm:text-sm leading-relaxed mb-3 text-slate-700 text-left whitespace-pre-wrap break-words" {...props} />
          ),
          ul: ({ node, ...props }) => (
            <ul className="list-disc pl-6 mb-4 text-xs sm:text-sm space-y-1.5 text-slate-700 text-left" {...props} />
          ),
          ol: ({ node, ...props }) => (
            <ol className="list-decimal pl-6 mb-4 text-xs sm:text-sm space-y-1.5 text-slate-700 text-left" {...props} />
          ),
          li: ({ node, ...props }) => (
            <li className="leading-relaxed text-left" {...props} />
          ),
          blockquote: ({ node, ...props }) => (
            <blockquote className="border-l-4 border-blue-500 pl-4 py-1.5 italic bg-blue-50/50 text-slate-600 rounded-r my-3 text-xs sm:text-sm text-left" {...props} />
          ),
          a: ({ node, href, children, ...props }) => (
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 underline font-medium hover:text-blue-800 break-all"
              {...props}
            >
              {children}
            </a>
          ),
          img: ({ node, src, alt, ...props }) => (
            <span className="block my-5 clear-both">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={src}
                alt={alt || "패치 노트 이미지"}
                className="rounded-xl border border-slate-200 max-h-[560px] max-w-full w-auto object-contain shadow-xs bg-slate-50"
                loading="lazy"
                onError={(e) => {
                  (e.currentTarget as HTMLElement).style.display = "none";
                }}
              />
              {alt && alt !== "패치 노트 이미지" && alt !== "패치 이미지" && (
                <span className="block text-xs text-slate-500 mt-1.5">{alt}</span>
              )}
            </span>
          ),
          table: ({ node, ...props }) => (
            <div className="overflow-x-auto my-4 border border-slate-200 rounded-xl">
              <table className="w-full text-xs text-left text-slate-700 divide-y divide-slate-200" {...props} />
            </div>
          ),
          th: ({ node, ...props }) => (
            <th className="px-3 py-2 bg-slate-50 font-bold text-slate-900 border-b border-slate-200" {...props} />
          ),
          td: ({ node, ...props }) => (
            <td className="px-3 py-2 border-b border-slate-100" {...props} />
          ),
          code: ({ node, className, children, ...props }) => {
            const isInline = !className;
            if (isInline) {
              return (
                <code className="bg-slate-100 px-1.5 py-0.5 rounded text-xs font-mono text-blue-700" {...props}>
                  {children}
                </code>
              );
            }
            return (
              <pre className="bg-slate-900 text-slate-100 p-4 rounded-xl overflow-x-auto text-xs font-mono my-3 border border-slate-800 text-left">
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
