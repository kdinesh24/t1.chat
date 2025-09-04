import { createHighlighter, bundledLanguages } from 'shiki';

let highlighter: any = null;

// Fixed Superchat Dark theme compatible with Shiki v3 TypeScript
const superchatDarkTheme = {
  name: 'superchat-dark',
  type: 'dark',
  // Required root properties for TypeScript compatibility
  fg: '#e6e6e6',
  bg: '#1a151f',
  // TextMate format settings (required for Shiki v3)
  settings: [
    {
      settings: {
        foreground: '#e6e6e6',
        background: '#1a151f',
      },
    },
    {
      scope: ['comment', 'punctuation.definition.comment'],
      settings: {
        foreground: '#7a6483',
        fontStyle: 'italic',
      },
    },
    {
      scope: [
        'keyword',
        'storage.type',
        'storage.modifier',
        'keyword.control',
        'keyword.operator',
        'constant.language',
      ],
      settings: {
        foreground: '#f789b1', // Pink for keywords
      },
    },
    {
      scope: ['string', 'string.quoted', 'string.template'],
      settings: {
        foreground: '#92d1b9', // Green/Teal for strings
      },
    },
    {
      scope: [
        'support.type.property-name',
        'meta.property-name',
        'entity.name.type',
        'entity.name.class',
        'support.class',
        'entity.name.function',
        'support.function',
      ],
      settings: {
        foreground: '#bda7e7', // Blue for properties and functions
      },
    },
    {
      scope: [
        'constant.numeric',
        'constant.language.boolean',
        'constant.other',
        'support.constant',
      ],
      settings: {
        foreground: '#f5b698', // Light purple for constants and values
      },
    },
    {
      scope: ['variable', 'variable.parameter', 'variable.other'],
      settings: {
        foreground: '#e6e6e6', // Light gray for variables
      },
    },
    {
      scope: ['punctuation', 'meta.brace', 'meta.delimiter'],
      settings: {
        foreground: '#d1d5db', // Light gray for punctuation
      },
    },
    {
      scope: ['entity.name.tag'],
      settings: {
        foreground: '#e27ca5', // Pink for tags
      },
    },
    {
      scope: [
        'entity.name.type.parameter',
        'meta.type.parameters',
        'support.type.generic',
        'entity.name.type.generic',
        'meta.generic',
        'storage.type.generic',
        'entity.name.type.instance',
        'meta.type.annotation',
        'meta.type.constraint',
        'entity.other.inherited-class',
        'support.type',
        'meta.type',
        'comment.block.documentation entity.name.type',
        'comment.line.documentation entity.name.type',
        'string.other.link.title.markdown entity.name.type',
        'variable.parameter.type',
        'meta.function.type.parameter',
        'entity.name.type.ts',
        'entity.name.type.tsx',
      ],
      settings: {
        foreground: '#a3d8f8', // Light blue for type annotations, parameters, constraints, and JSDoc types
      },
    },
  ],
};

export async function getShikiHighlighter() {
  if (!highlighter) {
    const preferredLangs = [
      'go',
      'bash',
      'shell',
      'powershell',
      'javascript',
      'typescript',
      'tsx',
      'jsx',
      'json',
      'yaml',
      'yml',
      'toml',
      'dockerfile',
      'sql',
      'python',
      'rust',
      'c',
      'cpp',
      'java',
      'kotlin',
      'swift',
      'ruby',
      'php',
      'hcl',
      'html',
      'css',
      'scss',
      'markdown',
      'ini',
      'make',
      'diff',
    ].filter((l) => l in bundledLanguages);

    try {
      highlighter = await createHighlighter({
        themes: [superchatDarkTheme as any, 'github-light'],
        langs: preferredLangs,
      });
    } catch (error) {
      console.error(
        'Failed to create Shiki highlighter with custom theme:',
        error,
      );
      // Create a minimal fallback highlighter with built-in themes
      try {
        highlighter = await createHighlighter({
          themes: ['github-dark', 'github-light'],
          langs: preferredLangs.slice(0, 10), // Use fewer languages for fallback
        });
      } catch (fallbackError) {
        console.error(
          'Failed to create fallback Shiki highlighter:',
          fallbackError,
        );
        // Final fallback with minimal configuration
        highlighter = await createHighlighter({
          themes: ['github-dark'],
          langs: ['javascript', 'typescript', 'html', 'css', 'json'],
        });
      }
    }
  }
  return highlighter;
}

export function resolvePreferredShikiTheme() {
  // For server-side rendering, always default to dark theme for consistency
  if (typeof window === 'undefined') {
    return 'superchat-dark';
  }

  try {
    // Check for stored theme preference first
    const storedTheme = localStorage.getItem('theme');
    if (storedTheme === 'light') return 'github-light';
    if (storedTheme === 'dark') return 'superchat-dark';

    // Check document class if available
    if (typeof document !== 'undefined') {
      const hasExplicitDark =
        document.documentElement.classList.contains('dark');
      const hasExplicitLight =
        document.documentElement.classList.contains('light');

      if (hasExplicitDark) return 'superchat-dark';
      if (hasExplicitLight) return 'github-light';
    }

    // Check system preference as final fallback
    if (window.matchMedia?.('(prefers-color-scheme: light)').matches) {
      return 'github-light';
    }

    return 'superchat-dark';
  } catch (error) {
    // Fallback for any errors - prefer github-dark if superchat-dark fails
    console.warn('Theme resolution failed, using fallback theme:', error);
    return 'github-dark';
  }
}

export async function highlightCode(
  code: string,
  lang = 'text',
  theme?: string,
) {
  try {
    const highlighter = await getShikiHighlighter();

    // Use provided theme or resolve preferred theme
    const selectedTheme = theme || resolvePreferredShikiTheme();

    // Fallback to 'text' if language is not supported
    const supportedLang = highlighter.getLoadedLanguages().includes(lang)
      ? lang
      : 'text';

    return highlighter.codeToHtml(code, {
      lang: supportedLang,
      theme: selectedTheme,
    });
  } catch (error) {
    console.error('Shiki highlighting error:', error);
    // Fallback to plain text if highlighting fails
    return `<pre><code>${code}</code></pre>`;
  }
}

export async function highlightAndFormatCode(
  code: string,
  lang = 'text',
  theme?: string,
) {
  try {
    const highlighter = await getShikiHighlighter();

    // Use provided theme or resolve preferred theme
    const selectedTheme = theme || resolvePreferredShikiTheme();

    // Fallback to 'text' if language is not supported
    const supportedLang = highlighter.getLoadedLanguages().includes(lang)
      ? lang
      : 'text';

    // First apply basic formatting to the raw code for better structure
    const formattedCode = applyBasicFormatting(code, supportedLang);

    // Ensure theme exists before using it with multiple fallbacks
    const availableThemes = highlighter.getLoadedThemes();
    let finalTheme = selectedTheme;

    if (!availableThemes.includes(selectedTheme)) {
      // Try fallback themes in order of preference
      if (availableThemes.includes('superchat-dark')) {
        finalTheme = 'superchat-dark';
      } else if (availableThemes.includes('github-dark')) {
        finalTheme = 'github-dark';
      } else if (availableThemes.includes('github-light')) {
        finalTheme = 'github-light';
      } else {
        // Use first available theme as last resort
        finalTheme = availableThemes[0];
      }
    }

    // Then apply Shiki highlighting to the formatted code
    const result = highlighter.codeToHtml(formattedCode, {
      lang: supportedLang,
      theme: finalTheme,
    });

    return result;
  } catch (error) {
    console.error('Shiki highlighting with formatting error:', error);
    // Fallback to basic highlighting without formatting
    try {
      const highlighter = await getShikiHighlighter();
      const selectedTheme = theme || 'github-dark';
      const supportedLang = highlighter.getLoadedLanguages().includes(lang)
        ? lang
        : 'text';

      const availableThemes = highlighter.getLoadedThemes();
      const finalTheme = availableThemes.includes(selectedTheme)
        ? selectedTheme
        : availableThemes[0];

      return highlighter.codeToHtml(code, {
        lang: supportedLang,
        theme: finalTheme,
      });
    } catch (fallbackError) {
      console.error('Shiki fallback also failed:', fallbackError);
      // Ultimate fallback - return formatted HTML without highlighting
      const formattedCode = applyBasicFormatting(code, lang);
      return `<pre style="background-color: #1a151f; color: #e6e6e6; padding: 1rem; border-radius: 0.5rem; overflow-x: auto; white-space: pre; tab-size: 2;"><code>${formattedCode}</code></pre>`;
    }
  }
}

function applyBasicFormatting(code: string, language: string): string {
  // Only apply light formatting that doesn't interfere with syntax tokens
  const lines = code.split('\n');
  let indentLevel = 0;
  const formattedLines: string[] = [];
  const indentSize = 2;

  for (const line of lines) {
    const trimmedLine = line.trim();

    if (!trimmedLine) {
      formattedLines.push('');
      continue;
    }

    // Handle closing brackets/braces
    if (shouldDecreaseIndent(trimmedLine)) {
      indentLevel = Math.max(0, indentLevel - 1);
    }

    // Add proper indentation
    const indentation = ' '.repeat(indentLevel * indentSize);
    formattedLines.push(indentation + trimmedLine);

    // Handle opening brackets/braces
    if (shouldIncreaseIndent(trimmedLine, language)) {
      indentLevel++;
    }
  }

  return formattedLines.join('\n');
}

function shouldDecreaseIndent(line: string): boolean {
  // Closing brackets, braces, parentheses
  if (line.match(/^[}\])]/) || line.match(/^\)/)) {
    return true;
  }

  // Closing HTML/XML tags
  if (line.match(/^<\/\w+/)) {
    return true;
  }

  // CSS closing braces
  if (line === '}') {
    return true;
  }

  // else, catch, finally statements
  if (line.match(/^(else|catch|finally)\b/)) {
    return true;
  }

  return false;
}

function shouldIncreaseIndent(line: string, language: string): boolean {
  // Opening brackets and braces
  if (line.match(/[{\[(]\s*$/)) {
    return true;
  }

  // HTML/XML opening tags (but not self-closing)
  if (
    line.match(/<\w+[^>]*>\s*$/) &&
    !line.match(/<\/\w+>\s*$/) &&
    !line.match(/\/>\s*$/)
  ) {
    return true;
  }

  // Function declarations
  if (line.match(/function\s*\w*\s*\([^)]*\)\s*\{?\s*$/)) {
    return true;
  }

  // Control structures (if, for, while, etc.)
  if (
    line.match(/^\s*(if|for|while|switch|try|else\s+if)\s*\([^)]*\)\s*\{?\s*$/)
  ) {
    return true;
  }

  // Object and array literals
  if (line.match(/[=:]\s*[\[{]\s*$/)) {
    return true;
  }

  // CSS selectors and rules
  if (language === 'css' && line.match(/[{:]\s*$/)) {
    return true;
  }

  // Python and YAML colon endings
  if ((language === 'python' || language === 'yaml') && line.endsWith(':')) {
    return true;
  }

  // Arrow functions
  if (line.match(/=>\s*\{?\s*$/)) {
    return true;
  }

  return false;
}
