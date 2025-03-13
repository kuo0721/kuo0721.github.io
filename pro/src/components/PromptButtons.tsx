import React, { useState, useRef, useEffect } from 'react';
import { Code, MessageSquarePlus, Zap, ChevronDown, Bug, Sparkles, RefreshCw } from 'lucide-react';

interface PromptButtonsProps {
  onPromptSelect: (prompt: string) => void;
}

const PromptButtons: React.FC<PromptButtonsProps> = ({ onPromptSelect }) => {
  const [showCodeOptions, setShowCodeOptions] = useState(false);
  const codeButtonRef = useRef<HTMLButtonElement>(null);

  const handleAddComment = () => {
    onPromptSelect("请为左侧编辑器中的代码添加详细的注释，解释每个部分的功能和实现原理。");
  };

  const handleOptimize = () => {
    onPromptSelect("请帮我优化左侧编辑器中的代码，提高其性能、可读性和可维护性。请解释你做出的每一处改变的原因。");
  };

  const handleDebug = () => {
    onPromptSelect("请帮我找出左侧代码中可能存在的错误或漏洞，并提供修复方案。");
  };

  const handleExplain = () => {
    onPromptSelect("请详细解释左侧代码的工作原理，包括核心算法、数据流和主要功能。适合初学者理解的方式来解释。");
  };

  const handleCodeTranslation = (language: string) => {
    onPromptSelect(`请将左侧编辑器中的代码转换成${language}语言，并保持相同的功能和逻辑。`);
    setShowCodeOptions(false);
  };

  const handleUnitTest = () => {
    onPromptSelect("请为左侧代码编写完整的单元测试，覆盖主要功能和边界情况。");
  };

  const languageOptions = [
    { name: 'Python', value: 'Python' },
    { name: 'JavaScript', value: 'JavaScript' },
    { name: 'TypeScript', value: 'TypeScript' },
    { name: 'Java', value: 'Java' },
    { name: 'C++', value: 'C++' },
    { name: 'Go', value: 'Go' },
    { name: 'Rust', value: 'Rust' },
  ];

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (codeButtonRef.current && !codeButtonRef.current.contains(event.target as Node)) {
        setShowCodeOptions(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className="flex flex-wrap gap-2 mb-3">
      <button
        onClick={handleAddComment}
        className="flex items-center px-3 py-1.5 bg-gray-700 hover:bg-gray-600 rounded-lg text-xs"
      >
        <MessageSquarePlus size={14} className="mr-1.5" />
        添加注释
      </button>
      
      <div className="relative">
        <button
          ref={codeButtonRef}
          onClick={() => setShowCodeOptions(!showCodeOptions)}
          className="flex items-center px-3 py-1.5 bg-gray-700 hover:bg-gray-600 rounded-lg text-xs"
        >
          <Code size={14} className="mr-1.5" />
          代码转换
          <ChevronDown size={12} className="ml-1" />
        </button>
        
        {showCodeOptions && (
          <div className="absolute z-10 mt-1 w-32 bg-gray-800 rounded-md shadow-lg p-1">
            {languageOptions.map((lang) => (
              <button
                key={lang.value}
                onClick={() => handleCodeTranslation(lang.value)}
                className="block w-full text-left px-3 py-1.5 text-xs hover:bg-gray-700 rounded"
              >
                {lang.name}
              </button>
            ))}
          </div>
        )}
      </div>
      
      <button
        onClick={handleOptimize}
        className="flex items-center px-3 py-1.5 bg-gray-700 hover:bg-gray-600 rounded-lg text-xs"
      >
        <Zap size={14} className="mr-1.5" />
        优化代码
      </button>

      <button
        onClick={handleDebug}
        className="flex items-center px-3 py-1.5 bg-gray-700 hover:bg-gray-600 rounded-lg text-xs"
      >
        <Bug size={14} className="mr-1.5" />
        调试问题
      </button>

      <button
        onClick={handleExplain}
        className="flex items-center px-3 py-1.5 bg-gray-700 hover:bg-gray-600 rounded-lg text-xs"
      >
        <Sparkles size={14} className="mr-1.5" />
        解释代码
      </button>

      <button
        onClick={handleUnitTest}
        className="flex items-center px-3 py-1.5 bg-gray-700 hover:bg-gray-600 rounded-lg text-xs"
      >
        <RefreshCw size={14} className="mr-1.5" />
        单元测试
      </button>
    </div>
  );
};

export default PromptButtons;