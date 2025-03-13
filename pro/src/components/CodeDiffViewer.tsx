import React, { useState } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { X, Check, ArrowRight, Maximize, Minimize } from 'lucide-react';

interface CodeDiffViewerProps {
  originalCode: string;
  modifiedCode: string;
  language: string;
  onApplyChanges?: (newCode: string) => void;
  onClose?: () => void;
}

// Helper function to get unified diff lines
const getUnifiedDiffLines = (originalCode: string, modifiedCode: string) => {
  const originalLines = originalCode.split('\n');
  const modifiedLines = modifiedCode.split('\n');
  
  const diffLines: Array<{
    type: 'unchanged' | 'added' | 'removed';
    content: string;
    lineNumber: number | null;
  }> = [];
  
  // Very simple diff algorithm for demonstration
  // In a real app, you'd use a proper diff library like diff-match-patch or jsdiff
  
  let originalIdx = 0;
  let modifiedIdx = 0;
  
  while (originalIdx < originalLines.length || modifiedIdx < modifiedLines.length) {
    if (originalIdx < originalLines.length && modifiedIdx < modifiedLines.length &&
        originalLines[originalIdx] === modifiedLines[modifiedIdx]) {
      // Unchanged line
      diffLines.push({
        type: 'unchanged',
        content: originalLines[originalIdx],
        lineNumber: originalIdx + 1
      });
      originalIdx++;
      modifiedIdx++;
    } else if (modifiedIdx < modifiedLines.length && 
              (originalIdx >= originalLines.length || 
               !originalLines.slice(originalIdx).includes(modifiedLines[modifiedIdx]))) {
      // Added line
      diffLines.push({
        type: 'added',
        content: modifiedLines[modifiedIdx],
        lineNumber: null
      });
      modifiedIdx++;
    } else {
      // Removed line
      diffLines.push({
        type: 'removed',
        content: originalLines[originalIdx],
        lineNumber: originalIdx + 1
      });
      originalIdx++;
    }
  }
  
  return diffLines;
};

const CodeDiffViewer: React.FC<CodeDiffViewerProps> = ({
  originalCode,
  modifiedCode,
  language,
  onApplyChanges,
  onClose
}) => {
  const [expanded, setExpanded] = useState(false);
  const diffLines = getUnifiedDiffLines(originalCode, modifiedCode);
  
  return (
    <div className={`bg-gray-900 border border-gray-700 rounded-lg overflow-hidden mb-4 ${expanded ? 'fixed inset-4 z-50' : ''}`}>
      <div className="flex justify-between items-center p-3 bg-gray-800 border-b border-gray-700">
        <div className="text-sm font-medium">建议的代码更改</div>
        <div className="flex space-x-2">
          <button
            onClick={() => setExpanded(!expanded)}
            className="p-1 text-gray-400 hover:text-white rounded hover:bg-gray-700"
            title={expanded ? "缩小" : "放大"}
          >
            {expanded ? <Minimize size={16} /> : <Maximize size={16} />}
          </button>
          {onApplyChanges && (
            <button
              onClick={() => onApplyChanges(modifiedCode)}
              className="p-1 text-green-400 hover:text-green-300 rounded hover:bg-gray-700"
              title="应用更改"
            >
              <Check size={16} />
            </button>
          )}
          {onClose && (
            <button
              onClick={onClose}
              className="p-1 text-gray-400 hover:text-white rounded hover:bg-gray-700"
              title="关闭"
            >
              <X size={16} />
            </button>
          )}
        </div>
      </div>
      
      <div className="overflow-auto max-h-96">
        <table className="w-full">
          <tbody>
            {diffLines.map((line, index) => (
              <tr 
                key={index} 
                className={`
                  ${line.type === 'added' ? 'bg-green-900 bg-opacity-30' : ''}
                  ${line.type === 'removed' ? 'bg-red-900 bg-opacity-30' : ''}
                  ${line.type === 'unchanged' ? '' : 'border-y border-gray-700'}
                `}
              >
                <td className="w-10 text-right text-xs text-gray-500 px-2 py-0 select-none">
                  {line.lineNumber}
                </td>
                <td className="w-6 text-center px-0 py-0">
                  {line.type === 'added' && <span className="text-green-500">+</span>}
                  {line.type === 'removed' && <span className="text-red-500">-</span>}
                </td>
                <td className="w-full px-0 py-0">
                  <div className="text-xs font-mono whitespace-pre overflow-x-auto">
                    <SyntaxHighlighter
                      language={language}
                      style={vscDarkPlus}
                      customStyle={{
                        margin: 0,
                        padding: '2px 8px',
                        background: 'transparent',
                        fontSize: '12px'
                      }}
                      wrapLines={true}
                    >
                      {line.content}
                    </SyntaxHighlighter>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      <div className="p-2 border-t border-gray-700 bg-gray-800 flex justify-end">
        <div className="text-xs text-gray-400">
          <span className="inline-flex items-center mr-3">
            <span className="w-3 h-3 inline-block bg-green-900 bg-opacity-30 border border-green-500 mr-1"></span>
            添加的代码
          </span>
          <span className="inline-flex items-center">
            <span className="w-3 h-3 inline-block bg-red-900 bg-opacity-30 border border-red-500 mr-1"></span>
            删除的代码
          </span>
        </div>
      </div>
    </div>
  );
};

export default CodeDiffViewer;