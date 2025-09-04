'use client';

// Enhanced code formatter with professional formatting features
export function formatCode(code: string, language: string): string {
  try {
    // For JavaScript/TypeScript, use professional formatting rules
    if (shouldUseProfessionalFormatting(language)) {
      return formatProfessionally(code, language);
    }

    // For other languages, use enhanced basic formatting
    return formatBasicIndentation(code);
  } catch (error) {
    console.warn('Code formatting failed:', error);
    return code;
  }
}

function shouldUseProfessionalFormatting(language: string): boolean {
  return ['javascript', 'js', 'jsx', 'typescript', 'ts', 'tsx'].includes(
    language.toLowerCase(),
  );
}

function formatProfessionally(code: string, language: string): string {
  // Professional formatting rules for JS/TS similar to Prettier
  const lines = code.split('\n');
  let indentLevel = 0;
  const formattedLines: string[] = [];
  const indentSize = 2;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmedLine = line.trim();

    if (!trimmedLine) {
      formattedLines.push('');
      continue;
    }

    
    if (shouldDecreaseIndent(trimmedLine)) {
      indentLevel = Math.max(0, indentLevel - 1);
    }

    
    const indentation = ' '.repeat(indentLevel * indentSize);

   
    const enhancedLine = enhanceLineFormatting(trimmedLine);
    formattedLines.push(indentation + enhancedLine);

    
    if (shouldIncreaseIndent(trimmedLine, language)) {
      indentLevel++;
    }
  }

  return formattedLines.join('\n');
}

function enhanceLineFormatting(line: string): string {
  return (
    line
      // Fix spacing around assignment operators
      .replace(/([^=!<>])\s*=\s*([^=])/g, '$1 = $2')
      .replace(/([^=!<>])\s*==\s*([^=])/g, '$1 == $2')
      .replace(/([^=!<>])\s*===\s*([^=])/g, '$1 === $2')
      .replace(/([^!])\s*!=\s*([^=])/g, '$1 != $2')
      .replace(/([^!])\s*!==\s*([^=])/g, '$1 !== $2')
      // Fix spacing around logical operators
      .replace(/\s*&&\s*/g, ' && ')
      .replace(/\s*\|\|\s*/g, ' || ')
      // Fix spacing around arithmetic operators
      .replace(/\s*\+\s*/g, ' + ')
      .replace(/\s*-\s*/g, ' - ')
      .replace(/\s*\*\s*/g, ' * ')
      .replace(/\s*\/\s*/g, ' / ')
      .replace(/\s*%\s*/g, ' % ')
      // Add space after keywords
      .replace(
        /\b(if|for|while|switch|catch|function|const|let|var|return|import|export|from)\s*\(/g,
        '$1 (',
      )
      .replace(
        /\b(if|for|while|switch|catch|function|const|let|var|return|import|export|from)\s*\{/g,
        '$1 {',
      )
      // Add space after commas
      .replace(/,([^\s])/g, ', $1')
      // Add space around object/array brackets
      .replace(/\{([^\s}])/g, '{ $1')
      .replace(/([^\s{])\}/g, '$1 }')
      .replace(/\[([^\s\]])/g, '[ $1')
      .replace(/([^\s\[])\]/g, '$1 ]')
      // Fix semicolon spacing
      .replace(/;\s*/g, '; ')
      .replace(/;\s*}/g, ';}')
      // Clean up multiple spaces
      .replace(/\s+/g, ' ')
      .trim()
  );
}

function formatBasicIndentation(code: string): string {
  const lines = code.split('\n');
  let indentLevel = 0;
  const formattedLines: string[] = [];

  for (const line of lines) {
    const trimmedLine = line.trim();

    if (!trimmedLine) {
      formattedLines.push('');
      continue;
    }

    // Decrease indent for closing brackets
    if (shouldDecreaseIndent(trimmedLine)) {
      indentLevel = Math.max(0, indentLevel - 1);
    }

    // Add indentation
    const indentation = '  '.repeat(indentLevel);
    formattedLines.push(indentation + trimmedLine);

    // Increase indent for opening brackets
    if (shouldIncreaseIndent(trimmedLine, 'generic')) {
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

export function shouldFormatLanguage(language: string): boolean {
  const formattableLanguages = [
    'javascript',
    'js',
    'jsx',
    'typescript',
    'ts',
    'tsx',
    'html',
    'xml',
    'css',
    'scss',
    'less',
    'json',
    'python',
    'py',
    'java',
    'c',
    'cpp',
    'c++',
    'go',
    'php',
    'ruby',
    'rb',
    'yaml',
    'yml',
  ];

  return formattableLanguages.includes(language?.toLowerCase() || '');
}
