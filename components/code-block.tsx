'use client';

import { useEffect, useMemo, useState } from 'react';
import { getShikiHighlighter, resolvePreferredShikiTheme } from '@/lib/shiki';
import { Copy, Check } from 'lucide-react';
import { Button } from './ui/button';

interface CodeBlockProps {
  node: any;
  inline: boolean;
  className: string;
  children: any;
}

export function CodeBlock({
  node,
  inline,
  className,
  children,
  ...props
}: CodeBlockProps) {
  const [copied, setCopied] = useState(false);
  const [html, setHtml] = useState<string | null>(null);

  const language = useMemo(() => {
    const alias = (lang: string) => {
      const map: Record<string, string> = {
        golang: 'go',
        go: 'go',
        js: 'javascript',
        jsx: 'jsx',
        ts: 'typescript',
        tsx: 'tsx',
        sh: 'bash',
        shell: 'bash',
        py: 'python',
        yml: 'yaml',
        tf: 'hcl',
      };
      return map[lang.toLowerCase()] ?? lang;
    };

    const match = /language-([\w-]+)/.exec(className || '');
    if (match) return alias(match[1]);
    const text = String(children ?? '').trimStart();
    if (text.startsWith('#!')) return 'bash';
    if (/\bpackage\s+main\b/.test(text) || /\bfunc\s+main\s*\(/.test(text) || /\bfmt\./.test(text))
      return 'go';
    return undefined;
  }, [className, children]);

  useEffect(() => {
    let isMounted = true;
    async function highlight() {
      if (inline) return;
      try {
        const highlighter = await getShikiHighlighter();
        const theme = resolvePreferredShikiTheme();
        const code = String(children ?? '');
        const lang = language || 'plaintext';
        const result = highlighter.codeToHtml(code, { lang, theme });
        if (isMounted) setHtml(result);
      } catch {
        if (isMounted) setHtml(null);
      }
    }
    highlight();
    return () => {
      isMounted = false;
    };
  }, [children, inline, language]);

  const handleCopy = async () => {
    const text = String(children ?? '');
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // For inline code (single line)
  if (inline) {
    return (
      <code
        className={`${className} text-sm bg-black text-white py-0.5 px-1.5 rounded-md font-mono border border-border`}
        {...props}
      >
        {children}
      </code>
    );
  }

  // For block code (multi-line)
  if (html) {
    // Render Shiki's highlighted output
    return (
      <div className="relative group">
        <div className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleCopy}
            className="h-8 w-8 p-0 bg-black hover:bg-gray-800 text-white border border-gray-600"
          >
            {copied ? (
              <Check className="h-4 w-4 text-green-400" />
            ) : (
              <Copy className="h-4 w-4" />
            )}
          </Button>
        </div>
        <div 
          className="not-prose border border-border rounded-lg overflow-hidden bg-black"
          dangerouslySetInnerHTML={{ __html: html }} 
        />
      </div>
    );
  }

  // Fallback SSR/first paint: plain code with proper styling
  return (
    <div className="relative group">
      <div className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleCopy}
          className="h-8 w-8 p-0 bg-black hover:bg-gray-800 text-white border border-gray-600"
        >
          {copied ? (
            <Check className="h-4 w-4 text-green-400" />
          ) : (
            <Copy className="h-4 w-4" />
          )}
        </Button>
      </div>
      <pre className="text-sm w-full overflow-x-auto p-4 bg-black border border-border rounded-lg">
        <code className="whitespace-pre break-words font-mono text-white" {...props}>
          {children}
        </code>
      </pre>
    </div>
  );
}
