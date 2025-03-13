import React from 'react';
import { User, Bot } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Message } from '@/types';

interface ChatMessageProps {
  message: Message;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  const isUser = message.role === 'user';
  
  return (
    <div className="flex mb-4">
      <div className={`flex-shrink-0 h-8 w-8 rounded-full flex items-center justify-center mr-3 ${isUser ? 'bg-blue-600' : 'bg-gray-800'}`}>
        {isUser ? <User size={16} /> : <Bot size={16} />}
      </div>
      <div className="flex-1 max-w-full">
        <div className={`p-3 rounded-lg ${isUser ? 'bg-blue-700' : 'bg-gray-700'}`}>
          {message.role === 'system' ? (
            <div className="text-sm text-gray-300">
              <strong>系统信息:</strong> {message.content}
            </div>
          ) : (
            <div className="prose prose-invert max-w-none">
              <ReactMarkdown
                components={{
                  code({node, inline, className, children, ...props}) {
                    const match = /language-(\w+)/.exec(className || '');
                    return !inline && match ? (
                      <SyntaxHighlighter
                        style={vscDarkPlus}
                        language={match[1]}
                        PreTag="div"
                        {...props}
                      >
                        {String(children).replace(/\n$/, '')}
                      </SyntaxHighlighter>
                    ) : (
                      <code className={`${className} bg-gray-800 px-1 py-0.5 rounded text-sm`} {...props}>
                        {children}
                      </code>
                    );
                  }
                }}
              >
                {message.content}
              </ReactMarkdown>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatMessage;