import { createHighlighter, bundledLanguages, } from 'shiki'

let highlighter: any = null

// Custom Superchat Dark theme with your specified colors
const superchatDarkTheme = {
  name: 'superchat-dark',
  settings: [
    {
      scope: ['comment', 'punctuation.definition.comment'],
      settings: {
        foreground: '#7a6483',
        fontStyle: 'italic'
      }
    },
    {
      scope: [
        'keyword',
        'storage.type',
        'storage.modifier',
        'keyword.control',
        'keyword.operator',
        'constant.language'
      ],
      settings: {
        foreground: '#f789b1' // Pink for keywords
      }
    },
    {
      scope: [
        'string',
        'string.quoted',
        'string.template'
      ],
      settings: {
        foreground: '#92d1b9' // Green/Teal for strings
      }
    },
    {
      scope: [
        'support.type.property-name',
        'meta.property-name',
        'entity.name.type',
        'entity.name.class',
        'support.class',
        'entity.name.function',
        'support.function'
      ],
      settings: {
        foreground: '#bda7e7' // Blue for properties and functions
      }
    },
    {
      scope: [
        'constant.numeric',
        'constant.language.boolean',
        'constant.other',
        'support.constant'
      ],
      settings: {
        foreground: '#f5b698' // Light purple for constants and values
      }
    },
    {
      scope: [
        'variable',
        'variable.parameter',
        'variable.other'
      ],
      settings: {
        foreground: '#e6e6e6' // Light gray for variables
      }
    },
    {
      scope: [
        'punctuation',
        'meta.brace',
        'meta.delimiter'
      ],
      settings: {
        foreground: '#d1d5db' // Light gray for punctuation
      }
    },
    {
      scope: [
        'entity.name.tag'
      ],
      settings: {
        foreground: '#e27ca5' // Pink for tags
      }
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
        'entity.name.type.tsx'
      ],
      settings: {
        foreground: '#a3d8f8' // Light blue for type annotations, parameters, constraints, and JSDoc types
      }
    }
  ]
}

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
    ].filter((l) => l in bundledLanguages)

    highlighter = await createHighlighter({
      themes: [superchatDarkTheme, 'github-light'],
      langs: preferredLangs,
    })
  }
  return highlighter
}

export function resolvePreferredShikiTheme() {
  if (typeof document !== 'undefined') {
    const isDark =
      document.documentElement.classList.contains('dark') ||
      window.matchMedia?.('(prefers-color-scheme: dark)').matches
    return isDark ? 'superchat-dark' : 'github-light'
  }
  return 'github-light'
}

export async function highlightCode(
  code: string,
  lang = 'text',
  theme = 'superchat-dark'
) {
  try {
    const highlighter = await getShikiHighlighter()
    
    // Fallback to 'text' if language is not supported
    const supportedLang = highlighter.getLoadedLanguages().includes(lang) ? lang : 'text'
    
    return highlighter.codeToHtml(code, {
      lang: supportedLang,
      theme: 'superchat-dark',
    })
  } catch (error) {
    console.error('Shiki highlighting error:', error)
    // Fallback to plain text if highlighting fails
    return `<pre><code>${code}</code></pre>`
  }
}
