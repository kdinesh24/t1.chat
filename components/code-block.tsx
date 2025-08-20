'use client';

import { useEffect, useMemo, useState } from 'react';
import { getShikiHighlighter, resolvePreferredShikiTheme } from '@/lib/shiki';
import { Copy, Check } from 'lucide-react';
import { Button } from './ui/button';

interface CodeBlockProps {
  node: any;
  inline?: boolean;
  className?: string;
  children: any;
  noCopyButton?: boolean;
  noBorder?: boolean;
}

export function CodeBlock({
  node,
  inline,
  className,
  children,
  noCopyButton = false,
  noBorder = false,
  ...props
}: CodeBlockProps) {
  const [copied, setCopied] = useState(false);
  const [html, setHtml] = useState<string | null>(null);

  const codeText = useMemo(() => String(children ?? ''), [children]);

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

    const match = /language-[\w-]+/.exec(className || '');
    if (match) {
      const lang = (match[0].split('language-')[1] || '').trim();
      if (lang) return alias(lang);
    }
    const text = codeText.trimStart();
    if (text.startsWith('#!')) return 'bash';
    if (/\bpackage\s+main\b/.test(text) || /\bfunc\s+main\s*\(/.test(text) || /\bfmt\./.test(text))
      return 'go';
    return undefined;
  }, [className, codeText]);

  // Treat explicit inline or single-line language-less code as inline
  const treatAsInline = useMemo(() => {
    if (inline) return true;
    const isSingleLine = !codeText.includes('\n');
    const hasLanguage = Boolean(language);
    return !hasLanguage && isSingleLine;
  }, [inline, codeText, language]);

  useEffect(() => {
    let isMounted = true;
    async function highlight() {
      if (treatAsInline) return;
      try {
        const highlighter = await getShikiHighlighter();
        const theme = resolvePreferredShikiTheme();
        const code = codeText;
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
  }, [codeText, treatAsInline, language]);

  const handleCopy = async () => {
    const text = String(children ?? '');
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (treatAsInline) {
    // Inline code (single backticks)
    return (
      <code
        className={`${
          className || ''
        } text-sm bg-zinc-100 dark:bg-zinc-800 py-0.5 px-1 rounded-md`}
        {...props}
      >
        {children}
      </code>
    );
  }

  // Block code (triple backticks) — let the <pre> wrapper come from the Markdown renderer
  if (html) {
    return (
      <div className="relative group mb-6">
        {!noCopyButton && (
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
        )}
        <div
          className={`not-prose rounded-lg overflow-x-auto bg-black ${noBorder ? '' : 'border border-border'}`}
          dangerouslySetInnerHTML={{ __html: html }}
        />
      </div>
    );
  }

  // Fallback SSR: unhighlighted block code
  return (
    <div className="relative group mb-6">
      {!noCopyButton && (
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
      )}
      <pre className={`text-sm w-full overflow-x-auto p-4 bg-black rounded-lg ${noBorder ? '' : 'border border-border'}`}>
        <code className={`whitespace-pre break-words font-mono text-white ${className || ''}`} {...props}>
          {children}
        </code>
      </pre>
    </div>
  );
}