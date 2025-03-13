// lib/api.ts
import { Message, DeepseekResponse, SerpApiResponse, SearchResult } from '../types';
import * as aiPrompts from './aiPrompts';

export const searchWithSerpApi = async (
  query: string, 
  serpApiKey: string,
  codeContext?: { language: string; code: string }
): Promise<SearchResult[]> => {
  if (!serpApiKey) {
    return [{
      title: '搜索API未配置',
      link: '#',
      snippet: '请在设置中配置SerpAPI密钥。'
    }];
  }

  // Add code context to search query if available
  let enhancedQuery = query;
  if (codeContext && codeContext.code && codeContext.code.trim() !== '// 在这里输入或粘贴您的代码') {
    // Only include a snippet of the code to avoid excessive query length
    const codeSnippet = codeContext.code.substring(0, 300);
    enhancedQuery = `${query} (Code context in ${codeContext.language}: ${codeSnippet}...)`;
  }

  try {
    // 使用API代理路由
    const searchResponse = await fetch(
      `/api/search?query=${encodeURIComponent(enhancedQuery)}&apiKey=${encodeURIComponent(serpApiKey)}`
    );
    
    if (!searchResponse.ok) {
      const errorText = await searchResponse.text();
      console.error('API error:', searchResponse.status, errorText.substring(0, 100));
      throw new Error(`API返回错误: ${searchResponse.status}`);
    }
    
    const searchData: SerpApiResponse = await searchResponse.json();
    
    if (searchData.organic_results && searchData.organic_results.length > 0) {
      // 限制结果数量，避免上下文过长
      return searchData.organic_results.slice(0, 5).map(item => ({
        title: item.title,
        link: item.link,
        snippet: item.snippet || '没有提供摘要'
      }));
    } else if (searchData.error) {
      return [{
        title: 'SerpAPI错误',
        link: '#',
        snippet: searchData.error || '搜索API返回错误'
      }];
    } else {
      return [{
        title: '没有找到结果',
        link: '#',
        snippet: `未找到与"${query}"相关的搜索结果。`
      }];
    }
  } catch (error) {
    console.error('Error performing search:', error);
    return [{
      title: '搜索错误',
      link: '#',
      snippet: '执行搜索时发生错误。请检查您的API设置或稍后再试。'
    }];
  }
};

export const callDeepseekAPI = async (
  messageHistory: Message[],
  apiKey: string,
  searchResults?: SearchResult[],
  codeContext?: { language: string; code: string }
): Promise<{ content: string, tokenCount?: { prompt: number, completion: number, total: number } }> => {
  if (!apiKey) {
    return { content: '请在设置中配置您的Deepseek API密钥。' };
  }

  // Create a copy of message history to avoid modifying the original
  let updatedMessageHistory = [...messageHistory];
  
  // Include code context if available and not empty
  if (codeContext && codeContext.code && codeContext.code.trim() !== '// 在这里输入或粘贴您的代码') {
    // Create a system message with code context instructions
    const codeContextMessage = {
      role: 'system' as const,
      content: `用户正在编辑${codeContext.language}代码。以下是当前编辑器中的代码：
\`\`\`${codeContext.language}
${codeContext.code}
\`\`\`

请在回答用户问题时，考虑上述代码上下文。如果用户请求对代码进行分析、修改或优化，请基于此代码进行操作。
如果您建议对代码进行修改，请清晰地标明哪些部分被修改了以及为什么。
在提供代码示例时，使用Markdown格式的代码块并标明语言。`
    };
    
    // Add code context as the first system message
    updatedMessageHistory.unshift(codeContextMessage);
  }
  
  // Add search results if available
  if (searchResults && searchResults.length > 0) {
    // Create more detailed search results context
    const contextMessage = {
      role: 'system' as const,
      content: `我为您找到了以下相关信息，请基于这些信息回答用户的问题：

${searchResults.map((result, index) => 
  `[${index + 1}] ${result.title}\n链接: ${result.link}\n摘要: ${result.snippet}`
).join('\n\n')}

请基于以上搜索结果和您的知识回答用户的问题。如果搜索结果中包含有用信息，请引用并标明来源。`
    };
    
    // Add search results as a system message after code context (if any)
    updatedMessageHistory.unshift(contextMessage);
  }

  try {
    const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: updatedMessageHistory,
        temperature: 0.7,
        max_tokens: 1000
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || `API错误: ${response.status}`);
    }

    const data: DeepseekResponse = await response.json();
    if (data.error) {
      throw new Error(data.error.message || '未知错误');
    }
    
    // Extract token usage information if available
    const tokenCount = data.usage ? {
      prompt: data.usage.prompt_tokens,
      completion: data.usage.completion_tokens,
      total: data.usage.total_tokens
    } : undefined;
    
    return {
      content: data.choices[0].message.content,
      tokenCount
    };
  } catch (error) {
    console.error('Deepseek API error:', error);
    throw error;
  }
};