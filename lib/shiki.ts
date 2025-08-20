import { createHighlighter, bundledLanguages, bundledThemes } from 'shiki'

let highlighter: any = null

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
      themes: ['poimandres', 'github-dark', 'github-light', 'nord'],
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
    return isDark ? 'poimandres' : 'github-light'
  }
  return 'github-light'
}

export async function highlightCode(
  code: string,
  lang: string = 'text',
  theme: string = 'poimandres'
) {
  try {
    const highlighter = await getShikiHighlighter()
    
    // Fallback to 'text' if language is not supported
    const supportedLang = highlighter.getLoadedLanguages().includes(lang) ? lang : 'text'
    
    return highlighter.codeToHtml(code, {
      lang: supportedLang,
      theme: theme,
    })
  } catch (error) {
    // Fallback to plain text if highlighting fails
    return `<pre><code>${code}</code></pre>`
  }
}
