import React, { useState, useEffect } from 'react';
import Editor from '@monaco-editor/react';
import useLanguageDetection from '../hooks/useLanguageDetection';

interface CodeEditorProps {
  initialValue?: string;
  language?: string;
  onChange?: (value: string | undefined) => void;
  onLanguageChange?: (language: string) => void;
}

const CodeEditor: React.FC<CodeEditorProps> = ({ 
  initialValue = '// 在这里输入或粘贴您的代码',
  language = 'javascript',
  onChange,
  onLanguageChange
}) => {
  const [editorLanguage, setEditorLanguage] = useState(language);
  const [editorValue, setEditorValue] = useState(initialValue);
  const [detectionEnabled, setDetectionEnabled] = useState(true);
  
  // Use our custom hook for language detection
  const detectedLanguage = useLanguageDetection(editorValue);
  
  // Update editor language if the prop changes
  useEffect(() => {
    setEditorLanguage(language);
  }, [language]);
  
  // Update editor value if initialValue changes
  useEffect(() => {
    setEditorValue(initialValue);
  }, [initialValue]);
  
  // Apply detected language when detection is enabled
  useEffect(() => {
    if (detectionEnabled && detectedLanguage && detectedLanguage !== editorLanguage) {
      setEditorLanguage(detectedLanguage);
      
      if (onLanguageChange) {
        onLanguageChange(detectedLanguage);
      }
    }
  }, [detectedLanguage, editorLanguage, detectionEnabled, onLanguageChange]);
  
  const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newLanguage = e.target.value;
    setEditorLanguage(newLanguage);
    
    // Disable auto-detection when manually selecting a language
    setDetectionEnabled(false);
    
    if (onLanguageChange) {
      onLanguageChange(newLanguage);
    }
  };
  
  const handleEditorChange = (value: string | undefined) => {
    if (value) {
      setEditorValue(value);
      
      // Re-enable detection if significant content changes
      if (!detectionEnabled && value.length > 50 && value !== initialValue) {
        setDetectionEnabled(true);
      }
      
      if (onChange) {
        onChange(value);
      }
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex justify-between items-center p-2 bg-gray-800 border-b border-gray-700">
        <div className="flex items-center">
          <div className="text-sm font-medium mr-2">语言:</div>
          <select 
            value={editorLanguage}
            onChange={handleLanguageChange}
            className="bg-gray-700 text-white text-xs rounded px-2 py-1 border-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="javascript">JavaScript</option>
            <option value="typescript">TypeScript</option>
            <option value="python">Python</option>
            <option value="java">Java</option>
            <option value="csharp">C#</option>
            <option value="cpp">C++</option>
            <option value="go">Go</option>
            <option value="rust">Rust</option>
            <option value="php">PHP</option>
            <option value="ruby">Ruby</option>
            <option value="html">HTML</option>
            <option value="css">CSS</option>
            <option value="json">JSON</option>
            <option value="markdown">Markdown</option>
            <option value="sql">SQL</option>
          </select>
        </div>
        <div className="text-xs flex items-center">
          <label className="flex items-center text-gray-400">
            <input
              type="checkbox"
              checked={detectionEnabled}
              onChange={(e) => setDetectionEnabled(e.target.checked)}
              className="mr-1 h-3 w-3 rounded bg-gray-700 border-gray-600"
            />
            自动检测语言
          </label>
        </div>
      </div>
      <div className="flex-1">
        <Editor
          height="100%"
          language={editorLanguage}
          value={editorValue}
          theme="vs-dark"
          onChange={handleEditorChange}
          options={{
            minimap: { enabled: false },
            fontSize: 14,
            wordWrap: 'on',
            scrollBeyondLastLine: false,
            automaticLayout: true,
            lineNumbers: 'on',
            renderLineHighlight: 'all',
            scrollbar: {
              verticalScrollbarSize: 8,
              horizontalScrollbarSize: 8
            },
            quickSuggestions: true,
            suggestOnTriggerCharacters: true,
            tabSize: 2,
            formatOnPaste: true,
            formatOnType: true,
          }}
        />
      </div>
    </div>
  );
};

export default CodeEditor;