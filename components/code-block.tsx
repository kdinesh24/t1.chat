'use client';

import { useEffect, useMemo, useState } from 'react';
import { useTheme } from 'next-themes';
import { highlightAndFormatCode, getShikiHighlighter } from '@/lib/shiki';
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
  const [isClient, setIsClient] = useState(false);
  const { theme } = useTheme();

  const codeText = useMemo(() => String(children ?? ''), [children]);

  const isSingleLine = useMemo(() => {
    const trimmedCode = codeText.trim();
    return !trimmedCode.includes('\n') && trimmedCode.length < 100; // Single line and not too long
  }, [codeText]);

  // Handle client-side mounting
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Resolve theme for Shiki with proper SSR handling
  const shikiTheme = useMemo(() => {
    // For SSR consistency, always start with dark theme
    if (typeof window === 'undefined') return 'superchat-dark';

    // On client, respect user theme preference
    if (!isClient) return 'superchat-dark';

    return theme === 'light' ? 'github-light' : 'superchat-dark';
  }, [theme, isClient]);

  const language = useMemo(() => {
    const alias = (lang: string) => {
      const map: Record<string, string> = {
        golang: 'go',
        go: 'go',
        js: 'jsx',
        javascript: 'jsx',
        jsx: 'jsx',
        ts: 'tsx',
        typescript: 'tsx',
        tsx: 'tsx',
        sh: 'bash',
        shell: 'bash',
        py: 'python',
        yml: 'yaml',
        tf: 'hcl',
      };
      return map[lang.toLowerCase()] ?? lang.toLowerCase();
    };

    const match = /language-[\w-]+/.exec(className || '');
    if (match) {
      const lang = (match[0].split('language-')[1] || '').trim();
      if (lang) return alias(lang);
    }
    const text = codeText.trimStart();
    if (text.startsWith('#!')) return 'bash';
    if (
      /\bpackage\s+main\b/.test(text) ||
      /\bfunc\s+main\s*\(/.test(text) ||
      /\bfmt\./.test(text)
    )
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

  // Apply Shiki highlighting - optimized for SSR
  useEffect(() => {
    let isMounted = true;

    async function highlight() {
      if (treatAsInline) return;

      try {
        // Start highlighting immediately, even on server
        const result = await highlightAndFormatCode(
          codeText,
          language || 'text',
          shikiTheme,
        );

        if (isMounted) {
          setHtml(result);
        }
      } catch (error) {
        console.warn('Shiki highlighting with formatting failed:', error);
        if (isMounted) setHtml(null);
      }
    }

    highlight();
    return () => {
      isMounted = false;
    };
  }, [codeText, treatAsInline, language, shikiTheme]);

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
        className={`${className || ''} text-sm py-0.5 px-1 rounded-md`}
        style={{ backgroundColor: '#2b2431' }}
        {...props}
      >
        {children}
      </code>
    );
  }

  // Block code (triple backticks) with Shiki highlighting
  if (html) {
    return (
      <div
        className={`relative group mb-6 mt-4 code-block-container ${isSingleLine ? 'code-block-compact' : ''}`}
      >
        {/* Header with language name */}
        <div
          className={`flex items-center justify-between px-4 rounded-t-lg border-b ${isSingleLine ? 'py-1' : 'py-2'}`}
          style={{ backgroundColor: '#362d3d', borderColor: '#374141' }}
        >
          <span className="text-sm font-medium font-mono text-zinc-300 tracking-wider">
            {language || 'plaintext'}
          </span>
          {!noCopyButton && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCopy}
              className="h-6 w-6 p-0 opacity-70 hover:opacity-100 transition-opacity"
              style={{ backgroundColor: 'transparent' }}
            >
              {copied ? (
                <Check className="h-3 w-3 text-green-400" />
              ) : (
                <Copy className="h-3 w-3" />
              )}
            </Button>
          )}
        </div>
        <div
          className={`not-prose rounded-b-lg overflow-x-auto overflow-y-hidden code-scrollbar max-w-full ${noBorder ? 'bg-[#362d3d]' : 'border-l border-r border-b border-border bg-[#1a151f]'}`}
          style={{
            overflowX: 'auto',
            overflowY: 'hidden',
            maxWidth: '100%',
            minHeight: html ? 'auto' : '2rem',
          }}
          dangerouslySetInnerHTML={{ __html: html }}
        />
      </div>
    );
  }

  // Fallback: loading state while Shiki processes
  return (
    <div className="relative group mb-6 mt-4 code-block-container">
      {/* Header with language name */}
      <div
        className={`flex items-center justify-between px-4 rounded-t-lg border-b ${isSingleLine ? 'py-1' : 'py-2'}`}
        style={{ backgroundColor: '#362d3d', borderColor: '#374141' }}
      >
        <span className="text-sm font-medium font-mono text-zinc-300 tracking-wider">
          {language || 'plaintext'}
        </span>
        {!noCopyButton && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleCopy}
            className="h-6 w-6 p-0 opacity-70 hover:opacity-100 transition-opacity"
            style={{ backgroundColor: 'transparent' }}
          >
            {copied ? (
              <Check className="h-3 w-3 text-green-400" />
            ) : (
              <Copy className="h-3 w-3" />
            )}
          </Button>
        )}
      </div>
      <pre
        className={`text-sm w-full overflow-x-auto overflow-y-hidden code-scrollbar rounded-b-lg max-w-full ${isSingleLine ? 'px-4 py-2' : 'p-4'} ${noBorder ? 'bg-[#1a151f]' : 'border-l border-r border-b border-border bg-[#1a151f]'}`}
        style={{
          overflowX: 'auto',
          overflowY: 'hidden',
          maxWidth: '100%',
          minHeight: '2rem',
        }}
      >
        <code
          className={`whitespace-pre font-mono text-white ${className || ''}`}
          {...props}
        >
          {children}
        </code>
      </pre>
    </div>
  );
}
