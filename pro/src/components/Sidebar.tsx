import React from 'react';
import { Plus, MessageCircle, Github, Settings, Trash2, ChevronLeft, ChevronRight, Code } from 'lucide-react';

interface ChatHistory {
  id: string;
  title: string;
  timestamp: number;
}

interface SidebarProps {
  onNewChat: () => void;
  onOpenSettings: () => void;
  recentChats: ChatHistory[];
  onSelectChat: (id: string) => void;
  onDeleteChat: (id: string) => void;
  currentChatId?: string;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ 
  onNewChat, 
  onOpenSettings, 
  recentChats,
  onSelectChat,
  onDeleteChat,
  currentChatId,
  isCollapsed,
  onToggleCollapse
}) => {
  if (isCollapsed) {
    return (
      <div className="w-12 bg-gray-800 flex flex-col items-center py-4 border-r border-gray-700">
        <button
          onClick={onToggleCollapse}
          className="p-2 mb-4 text-gray-400 hover:text-white rounded-lg hover:bg-gray-700"
          aria-label="展开侧边栏"
        >
          <ChevronRight size={20} />
        </button>
        <button
          onClick={onNewChat}
          className="p-2 mb-4 text-gray-400 hover:text-white rounded-lg hover:bg-gray-700"
          aria-label="新对话"
        >
          <Plus size={20} />
        </button>
        <button
          onClick={onOpenSettings}
          className="p-2 text-gray-400 hover:text-white rounded-lg hover:bg-gray-700 mt-auto"
          aria-label="设置"
        >
          <Settings size={20} />
        </button>
      </div>
    );
  }

  return (
    <div className="w-48 bg-gray-800 p-3 flex flex-col h-full border-r border-gray-700">
      {/* Title and collapse button */}
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center">
          <Code className="w-5 h-5 mr-2 text-blue-500" />
          <span className="text-sm font-bold text-white">编程助手</span>
        </div>
        <button
          onClick={onToggleCollapse}
          className="p-1 text-gray-400 hover:text-white rounded-lg hover:bg-gray-700"
          aria-label="收起侧边栏"
        >
          <ChevronLeft size={16} />
        </button>
      </div>

      <button
        onClick={onNewChat}
        className="flex items-center justify-center w-full p-2 mb-4 bg-blue-600 rounded-lg hover:bg-blue-500 transition-colors text-sm"
      >
        <Plus size={14} className="mr-1" />
        新对话
      </button>
      
      <div className="flex-1 overflow-y-auto">
        <div className="mb-2 text-xs font-medium text-gray-400">历史对话</div>
        <div className="space-y-1">
          {recentChats.length > 0 ? (
            recentChats.map((chat) => (
              <div key={chat.id} className="flex items-center group">
                <button 
                  onClick={() => onSelectChat(chat.id)}
                  className={`flex-1 flex items-center w-full p-1.5 text-xs text-left rounded-lg hover:bg-gray-700 ${
                    currentChatId === chat.id ? 'bg-gray-700' : ''
                  }`}
                >
                  <MessageCircle size={12} className="mr-1.5 text-gray-400 flex-shrink-0" />
                  <span className="truncate">{chat.title}</span>
                </button>
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteChat(chat.id);
                  }}
                  className="p-1 text-gray-400 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                  aria-label="删除对话"
                >
                  <Trash2 size={12} />
                </button>
              </div>
            ))
          ) : (
            <div className="text-gray-500 text-xs p-2">没有历史对话</div>
          )}
        </div>
      </div>
      
      <div className="mt-4 pt-3 border-t border-gray-700 space-y-2">
        <button
          onClick={onOpenSettings}
          className="flex items-center w-full p-2 text-left text-xs text-gray-400 hover:text-white rounded-lg hover:bg-gray-700"
        >
          <Settings size={12} className="mr-1.5" />
          API设置
        </button>
        <a href="https://github.com/username/code-assistant" target="_blank" rel="noopener noreferrer" className="flex items-center p-2 text-xs text-gray-400 hover:text-white rounded-lg hover:bg-gray-700">
          {/* <Github size={12} className="mr-1.5" /> */}
          随意出品，未经授权，剽窃必究
        </a>
      </div>
    </div>
  );
};

export default Sidebar;