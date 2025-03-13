// hooks/useLanguageDetection.ts
import { useState, useEffect, useCallback } from 'react';

// Language detection patterns
const LANGUAGE_PATTERNS = {
  javascript: {
    patterns: [
      /\bconst\b|\blet\b|\bvar\b|\bfunction\b|\b=>\b|\brequire\b|\bimport\b.*\bfrom\b|\bexport\b/,
      /\bdocument\b|\bwindow\b|\bconsole\.log\b/,
      /\$\(.*\)|\bawait\b|\basync\b/
    ],
    extensions: ['.js', '.jsx', '.mjs']
  },
  typescript: {
    patterns: [
      /\binterface\b|\btype\b|\bnamespace\b|\benum\b/,
      /\:\s*(string|number|boolean|any)\b/,
      /<[A-Za-z]+>|<[A-Za-z]+,\s*[A-Za-z]+>/,
      /import\s+.*\s+from\s+['"][^'"]+['"]|\bexport\b/
    ],
    extensions: ['.ts', '.tsx']
  },
  html: {
    patterns: [
      /<!DOCTYPE\s+html>|<html>|<\/html>|<head>|<body>/i,
      /<div>|<p>|<span>|<a\s+href|<img\s+src/,
      /<link\s+rel|<script>|<\/script>|<meta/
    ],
    extensions: ['.html', '.htm']
  },
  css: {
    patterns: [
      /[.#][\w-]+\s*\{[^}]*\}/,
      /@media\b|@import\b|@keyframes\b/,
      /\b(margin|padding|color|background|font-size|display):/
    ],
    extensions: ['.css', '.scss', '.less']
  },
  python: {
    patterns: [
      /\bdef\b|\bclass\b|\bimport\b|\bfrom\b.*\bimport\b/,
      /\bif\s+__name__\s*==\s*['"]__main__['"]\b/,
      /\bprint\s*\(|\binput\s*\(|\brange\s*\(/
    ],
    extensions: ['.py', '.pyw']
  },
  java: {
    patterns: [
      /\bpublic\b|\bprivate\b|\bprotected\b|\bclass\b|\binterface\b|\bextends\b|\bimplements\b/,
      /\bvoid\b|\bint\b|\bString\b|\bboolean\b|\bstatic\b/,
      /System\.out\.println\(/
    ],
    extensions: ['.java']
  },
  csharp: {
    patterns: [
      /\busing\b.*;\s*$|\bnamespace\b|\bclass\b|\bpublic\b|\bprivate\b/,
      /\bvoid\b|\bstring\b|\bint\b|\bbool\b|\bvar\b/,
      /Console\.WriteLine\(/
    ],
    extensions: ['.cs']
  },
  cpp: {
    patterns: [
      /#include\s*<.*>|\busing\s+namespace\b|\bstd::/,
      /\bint\s+main\s*\(|\bclass\b.*\{|\bpublic:\b|\bprivate:\b/,
      /\bcout\s*<<|\bcin\s*>>/
    ],
    extensions: ['.cpp', '.cc', '.cxx', '.c', '.h', '.hpp']
  },
  php: {
    patterns: [
      /<\?php|\?>|<\?=|<\?/,
      /\$[a-zA-Z_\x7f-\xff][a-zA-Z0-9_\x7f-\xff]*/,
      /\becho\b|\bforeach\b|\bfunction\b/
    ],
    extensions: ['.php']
  },
  ruby: {
    patterns: [
      /\bdef\b|\bclass\b|\bmodule\b|\brequire\b|\binclude\b/,
      /\bend\b|\bdo\b|\bputs\b|\battr_accessor\b/,
      /\.(each|map|select|inject|reduce)\b/
    ],
    extensions: ['.rb']
  },
  go: {
    patterns: [
      /\bpackage\b|\bimport\b|\bfunc\b|\btype\b|\bstruct\b/,
      /\bgo\b|\bdefer\b|\binterface\b|\bchan\b|\bvar\b|\bconst\b/,
      /fmt\.(Print|Println|Printf)\(/
    ],
    extensions: ['.go']
  },
  rust: {
    patterns: [
      /\bfn\b|\blet\b|\bmut\b|\bpub\b|\buse\b|\bmod\b/,
      /\bimpl\b|\bstruct\b|\benum\b|\btrait\b/,
      /\bString::from\b|\bvec!\b|\bprintln!\b/
    ],
    extensions: ['.rs']
  },
  sql: {
    patterns: [
      /\bSELECT\b.*\bFROM\b|\bINSERT\b.*\bINTO\b|\bUPDATE\b.*\bSET\b/i,
      /\bCREATE\b\s+\bTABLE\b|\bALTER\b\s+\bTABLE\b|\bDROP\b\s+\bTABLE\b/i,
      /\bWHERE\b|\bGROUP\b\s+\bBY\b|\bORDER\b\s+\bBY\b|\bJOIN\b/i
    ],
    extensions: ['.sql']
  },
  markdown: {
    patterns: [
      /^#\s+.*$|^##\s+.*$|^###\s+.*$/m,
      /\[.*\]\(.*\)/,
      /\*\*.*\*\*|__.*__|_.*_|\*.*\*/
    ],
    extensions: ['.md', '.markdown']
  },
  json: {
    patterns: [
      /^\s*\{\s*".*"\s*:/,
      /^\s*\[\s*\{\s*".*"\s*:/,
      /".*"\s*:\s*(".*"|[0-9]+|true|false|null|\{|\[)/
    ],
    extensions: ['.json']
  }
};

export function useLanguageDetection(code: string): string {
  const [detectedLanguage, setDetectedLanguage] = useState<string>('javascript');
  
  const detectLanguage = useCallback((input: string) => {
    // Skip detection for empty or very short inputs
    if (!input || input.length < 10 || input.trim() === '// 在这里输入或粘贴您的代码') {
      return 'javascript';
    }
    
    // Create a scoring system for each language
    type LanguageScore = {
      language: string;
      score: number;
    };
    
    const scores: LanguageScore[] = Object.entries(LANGUAGE_PATTERNS).map(([language, { patterns }]) => {
      // Calculate how many patterns match
      const matchCount = patterns.reduce((count, pattern) => {
        return count + (pattern.test(input) ? 1 : 0);
      }, 0);
      
      // Calculate score as a percentage of matched patterns
      const score = matchCount / patterns.length;
      
      return { language, score };
    });
    
    // Sort by score in descending order
    scores.sort((a, b) => b.score - a.score);
    
    // Return the language with the highest score, if it's above a threshold
    return scores[0].score > 0.3 ? scores[0].language : 'javascript';
  }, []);
  
  useEffect(() => {
    const language = detectLanguage(code);
    setDetectedLanguage(language);
  }, [code, detectLanguage]);
  
  return detectedLanguage;
}

export default useLanguageDetection;