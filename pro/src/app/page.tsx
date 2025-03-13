'use client'

import { useState, useEffect, useRef, FormEvent } from 'react';
import { ArrowUp, Bot, Search, Code, X } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import ChatMessage from '../components/ChatMessage';
import CodeEditor from '../components/CodeEditor';
import CodeDiffViewer from '../components/CodeDiffViewer';
import SearchResults from '../components/SearchResults';
import PromptButtons from '../components/PromptButtons';
import { Message, SearchResult } from '../types';
import { callDeepseekAPI, searchWithSerpApi } from '../lib/api';
import { chatDB, ChatSession } from '../lib/db';

export default function HomePage() {
  // 基本状态
  const [input, setInput] = useState<string>('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  
  // API 和设置相关状态
  const [apiKey, setApiKey] = useState<string>('');
  const [serpApiKey, setSerpApiKey] = useState<string>('');
  const [showSettings, setShowSettings] = useState<boolean>(false);
  
  // 搜索相关状态
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [showSearch, setShowSearch] = useState<boolean>(false);
  const [webSearchEnabled, setWebSearchEnabled] = useState<boolean>(false);
  
  // 聊天历史相关状态
  const [recentChats, setRecentChats] = useState<{id: string; title: string; timestamp: number}[]>([]);
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);
  
  // UI相关状态
  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(true);
  
  // 代码编辑器相关状态
  const [codeValue, setCodeValue] = useState<string>('// 在这里输入或粘贴您的代码');
  const [codeLanguage, setCodeLanguage] = useState<string>('javascript');
  
  // 代码差异查看器相关状态
  const [suggestedCode, setSuggestedCode] = useState<string | null>(null);
  const [showDiffViewer, setShowDiffViewer] = useState<boolean>(false);
  
  // AI交互相关状态
  const [tokenCount, setTokenCount] = useState<{ prompt: number; completion: number; total: number } | null>(null);
  const [currentPromptType, setCurrentPromptType] = useState<'analyze' | 'optimize' | 'explain' | 'debug' | 'unitTest' | 'general' | 'review'>('general');
  
  // Refs
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // 在客户端加载API密钥和历史会话
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setApiKey(localStorage.getItem('deepseekApiKey') || '');
      setSerpApiKey(localStorage.getItem('serpApiKey') || '');
      loadRecentChats();
    }
  }, []);

  // 当消息变化且不在加载状态时，保存当前会话
  useEffect(() => {
    if (messages.length > 0 && !loading) {
      saveCurrentChat();
    }
  }, [messages, loading]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadRecentChats = async () => {
    try {
      const chats = await chatDB.getAllChats();
      setRecentChats(chats.map(chat => ({
        id: chat.id as string,
        title: chat.title,
        timestamp: chat.timestamp
      })));
    } catch (error) {
      console.error('Failed to load recent chats:', error);
    }
  };

  const saveCurrentChat = async () => {
    if (messages.length === 0) return;

    try {
      // 使用第一条用户消息作为标题
      const firstUserMessage = messages.find(msg => msg.role === 'user');
      const title = firstUserMessage 
        ? (firstUserMessage.content.length > 30 
          ? firstUserMessage.content.substring(0, 30) + '...' 
          : firstUserMessage.content)
        : '新对话';

      const chatSession: ChatSession = {
        id: currentChatId || undefined,
        title,
        messages,
        timestamp: Date.now()
      };
      
      const id = await chatDB.saveChat(chatSession);
      if (!currentChatId) {
        setCurrentChatId(id);
      }
      
      // 刷新会话列表
      loadRecentChats();
    } catch (error) {
      console.error('Failed to save chat:', error);
    }
  };

  const handleSelectChat = async (id: string) => {
    try {
      const chat = await chatDB.getChat(id);
      if (chat) {
        setMessages(chat.messages);
        setCurrentChatId(id);
        setShowSearch(false);
      }
    } catch (error) {
      console.error('Failed to load chat:', error);
    }
  };

  const handleDeleteChat = async (id: string) => {
    try {
      await chatDB.deleteChat(id);
      if (currentChatId === id) {
        // 如果删除当前对话，清空界面
        setMessages([]);
        setCurrentChatId(null);
        setShowSearch(false);
      }
      loadRecentChats();
    } catch (error) {
      console.error('Failed to delete chat:', error);
    }
  };

  const handleNewChat = () => {
    setMessages([]);
    setCurrentChatId(null);
    setSearchResults([]);
    setShowSearch(false);
  };

  const saveSettings = () => {
    localStorage.setItem('deepseekApiKey', apiKey);
    localStorage.setItem('serpApiKey', serpApiKey);
    setShowSettings(false);
  };

  const handlePromptSelect = (prompt: string, promptType?: string) => {
    setInput(prompt);
    if (inputRef.current) {
      inputRef.current.focus();
    }
    
    // Store the promptType if provided
    if (promptType) {
      setCurrentPromptType(promptType as 'analyze' | 'optimize' | 'explain' | 'debug' | 'unitTest' | 'general' | 'review');
    }
  };
  
  const handleCodeInsert = () => {
    // Insert the current code from editor into the chat input
    if (codeValue && codeValue !== '// 在这里输入或粘贴您的代码') {
      const codeBlock = `\`\`\`${codeLanguage}\n${codeValue}\n\`\`\``;
      setInput(prev => prev ? `${prev}\n\n${codeBlock}` : codeBlock);
      if (inputRef.current) {
        inputRef.current.focus();
      }
    }
  };

  // 分析代码建议并处理潜在的差异显示
  const analyzeCodeSuggestions = (responseContent: string, codeContext: { language: string; code: string }) => {
    // Simple regex to extract code blocks with the same language
    const codeBlockRegex = new RegExp('```(?:' + codeContext.language + ')?\\s*\\n([\\s\\S]*?)\\n```', 'g');
    const matches = [...responseContent.matchAll(codeBlockRegex)];
    
    // If we find code blocks that might be suggestions
    if (matches.length > 0) {
      // Get the largest code block as it likely represents a complete solution
      let largestMatch = matches[0];
      let largestMatchLength = matches[0][1].length;
      
      for (let i = 1; i < matches.length; i++) {
        if (matches[i][1].length > largestMatchLength) {
          largestMatch = matches[i];
          largestMatchLength = matches[i][1].length;
        }
      }
      
      const suggestedCodeContent = largestMatch[1];
      
      // Only show diff if suggested code is different and not too large
      if (
        suggestedCodeContent !== codeContext.code && 
        suggestedCodeContent.length > 10 &&
        // Don't show diff for huge files or tiny snippets
        suggestedCodeContent.length < 5000 && 
        suggestedCodeContent.length > codeContext.code.length * 0.5 &&
        suggestedCodeContent.length < codeContext.code.length * 2
      ) {
        setSuggestedCode(suggestedCodeContent);
        setShowDiffViewer(true);
      }
    }
  };
  
  // Function to apply suggested code changes to the editor
  const applySuggestedChanges = (newCode: string) => {
    setCodeValue(newCode);
    setShowDiffViewer(false);
    setSuggestedCode(null);
  };
  
  // Function to close the diff viewer
  const closeDiffViewer = () => {
    setShowDiffViewer(false);
    setSuggestedCode(null);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage: Message = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);
    setTokenCount(null);
    
    // Reset the diff viewer
    setShowDiffViewer(false);
    setSuggestedCode(null);

    // Create code context object if there is code in the editor
    const codeContextObj = (codeValue && codeValue !== '// 在这里输入或粘贴您的代码') 
      ? { language: codeLanguage, code: codeValue } 
      : undefined;

    try {
      // If web search is enabled, search first
      let currentSearchResults: SearchResult[] | undefined = undefined;
      if (webSearchEnabled && serpApiKey) {
        try {
          // Pass code context for better search results
          currentSearchResults = await searchWithSerpApi(input, serpApiKey, codeContextObj);
          setSearchResults(currentSearchResults);
          setShowSearch(true);
        } catch (error) {
          console.error('Error performing search:', error);
        }
      }

      // Call API, always pass latest search results (if any) and code context, along with promptType
      const response = await callDeepseekAPI(
        [...messages, userMessage], 
        apiKey, 
        currentSearchResults || (showSearch ? searchResults : undefined),
        codeContextObj,
        currentPromptType
      );
      
      // Store token usage if available
      if (response.tokenCount) {
        setTokenCount(response.tokenCount);
      }
      
      const assistantMessage: Message = { role: 'assistant', content: response.content };
      setMessages(prev => [...prev, assistantMessage]);
      
      // If response contains code suggestions and we're in optimization mode, analyze them for potential diff display
      if (codeContextObj && 
          response.content.includes('```') && 
          (currentPromptType === 'optimize' || currentPromptType === 'debug' || input.toLowerCase().includes('优化') || input.toLowerCase().includes('修改'))) {
        analyzeCodeSuggestions(response.content, codeContextObj);
      }
      
      // Reset prompt type to general after submission
      setCurrentPromptType('general');
    } catch (error) {
      console.error('Error in conversation flow:', error);
      const errorMessage: Message = { 
        role: 'assistant', 
        content: '抱歉，处理您的请求时发生错误。请检查您的API密钥设置或稍后再试。' 
      };
      setMessages(prev => [...prev, errorMessage]);
      // Reset prompt type on error
      setCurrentPromptType('general');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen bg-gray-900 text-white">
      {/* Sidebar */}
      <Sidebar 
        onNewChat={handleNewChat} 
        onOpenSettings={() => setShowSettings(true)}
        recentChats={recentChats}
        onSelectChat={handleSelectChat}
        onDeleteChat={handleDeleteChat}
        currentChatId={currentChatId || undefined}
        isCollapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
      />
      
      {/* Main content area */}
      <div className="flex flex-1 overflow-hidden">
        {/* Code Editor Panel - Left Side */}
        <div className="w-1/2 border-r border-gray-700 flex flex-col">
          <div className="p-2 bg-gray-800 border-b border-gray-700 flex justify-between items-center">
            <div className="text-sm font-medium flex items-center">
              <Code size={16} className="mr-1" />
              代码编辑区
            </div>
            <button 
              onClick={handleCodeInsert}
              className="text-xs px-2 py-1 bg-blue-600 hover:bg-blue-500 rounded"
            >
              插入代码到对话
            </button>
          </div>
          <div className="flex-1">
            <CodeEditor
              initialValue={codeValue}
              language={codeLanguage}
              onChange={(value) => setCodeValue(value || '')}
              onLanguageChange={setCodeLanguage}
            />
          </div>
        </div>
        
        {/* Chat Panel - Right Side */}
        <div className="w-1/2 flex flex-col">
          {/* Settings modal */}
          {showSettings && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-gray-800 p-6 rounded-lg w-96">
                <h2 className="text-xl font-bold mb-4">API设置</h2>
                
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-1">Deepseek API密钥</label>
                  <input
                    type="password"
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    className="w-full p-2 bg-gray-700 rounded"
                    placeholder="sk-..."
                  />
                </div>
                
                <div className="mb-6">
                  <label className="block text-sm font-medium mb-1">SerpAPI密钥</label>
                  <input
                    type="password"
                    value={serpApiKey}
                    onChange={(e) => setSerpApiKey(e.target.value)}
                    className="w-full p-2 bg-gray-700 rounded"
                    placeholder="输入您的SerpAPI密钥"
                  />
                </div>
                
                <div className="flex justify-end space-x-2">
                  <button
                    onClick={() => setShowSettings(false)}
                    className="px-4 py-2 bg-gray-600 rounded hover:bg-gray-500"
                  >
                    取消
                  </button>
                  <button
                    onClick={saveSettings}
                    className="px-4 py-2 bg-blue-600 rounded hover:bg-blue-500"
                  >
                    保存
                  </button>
                </div>
              </div>
            </div>
          )}
          
          {/* Message area */}
          <div className="flex-1 overflow-y-auto p-4">
            {messages.length === 0 ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <h1 className="text-2xl font-bold mb-6">智能编程助手</h1>
                  <p className="text-lg mb-8">您的代码编写、优化与问题解决专家</p>
                  <div className="grid grid-cols-1 gap-4 max-w-lg mx-auto">
                    <div className="bg-gray-800 p-4 rounded-lg">
                      <div className="flex items-center mb-2">
                        <Code className="mr-2" />
                        <h3 className="font-semibold">代码编辑与分析</h3>
                      </div>
                      <p className="text-gray-400">在左侧编辑器中输入您的代码，然后询问AI进行分析、优化或问题解决</p>
                    </div>
                    <div className="bg-gray-800 p-4 rounded-lg">
                      <div className="flex items-center mb-2">
                        <Bot className="mr-2" />
                        <h3 className="font-semibold">编程问题咨询</h3>
                      </div>
                      <p className="text-gray-400">尝试提问："如何实现React中的状态管理？"或"帮我优化左侧的代码"</p>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <>
                {showDiffViewer && suggestedCode && (
                  <CodeDiffViewer
                    originalCode={codeValue}
                    modifiedCode={suggestedCode}
                    language={codeLanguage}
                    onApplyChanges={applySuggestedChanges}
                    onClose={closeDiffViewer}
                  />
                )}
                
                {messages.map((message, index) => (
                  <ChatMessage key={index} message={message} />
                ))}
                
                {loading && (
                  <div className="flex items-center space-x-2 p-4 bg-gray-800 rounded-lg my-2">
                    <div className="animate-pulse flex space-x-2">
                      <div className="h-3 w-3 bg-blue-400 rounded-full"></div>
                      <div className="h-3 w-3 bg-blue-400 rounded-full"></div>
                      <div className="h-3 w-3 bg-blue-400 rounded-full"></div>
                    </div>
                    <span>思考中...</span>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </>
            )}
          </div>
          
          {/* Search results area */}
          {showSearch && (
            <SearchResults 
              results={searchResults} 
              onClose={() => setShowSearch(false)} 
            />
          )}
          
          {/* Input area */}
          <div className="p-4 border-t border-gray-700">
            {/* 预设提示按钮 */}
            <PromptButtons onPromptSelect={(prompt, promptType) => handlePromptSelect(prompt, promptType)} />
            
            <form onSubmit={handleSubmit} className="relative">
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  // Submit on Enter (without Shift)
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    if (input.trim() && !loading) {
                      handleSubmit(e as unknown as FormEvent);
                    }
                  }
                }}
                placeholder="询问关于代码的问题或请求帮助..."
                className="w-full p-3 pr-12 bg-gray-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                rows={input.split('\n').length > 1 ? Math.min(5, input.split('\n').length) : 1}
                disabled={loading}
              />
              <div className="absolute text-gray-500 text-xs bottom-1 left-3">
                按Shift+Enter换行
              </div>
              <button
                type="submit"
                disabled={loading || !input.trim()}
                className="absolute right-3 top-3 text-blue-500 hover:text-blue-400 disabled:text-gray-500"
              >
                <ArrowUp size={20} />
              </button>
            </form>
            
            {/* Web search toggle and token count */}
            <div className="flex justify-between items-center mt-2">
              <div className="flex items-center text-xs">
                <button
                  onClick={() => setWebSearchEnabled(!webSearchEnabled)}
                  className={`flex items-center px-3 py-1.5 rounded-lg ${
                    webSearchEnabled
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  <Search size={14} className="mr-1" />
                  {webSearchEnabled ? '已启用联网搜索' : '启用联网搜索'}
                </button>
              </div>
              
              <div className="text-xs text-gray-400 flex items-center">
                {tokenCount && (
                  <span className="mr-2">
                    Token: {tokenCount.total.toLocaleString()} ({tokenCount.prompt.toLocaleString()} + {tokenCount.completion.toLocaleString()})
                  </span>
                )}
                由 Deepseek AI 提供技术支持
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}