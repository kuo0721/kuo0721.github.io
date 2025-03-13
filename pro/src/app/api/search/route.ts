// app/api/search/route.ts
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  // 从URL获取参数
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('query');
  const apiKey = searchParams.get('apiKey');

  if (!query || !apiKey) {
    return NextResponse.json({ error: '缺少必要参数' }, { status: 400 });
  }

  try {
    // 通过服务器端调用SerpAPI
    const searchResponse = await fetch(
      `https://serpapi.com/search.json?q=${encodeURIComponent(query)}&api_key=${apiKey}&engine=google`
    );
    
    if (!searchResponse.ok) {
      const errorText = await searchResponse.text();
      console.error('SerpAPI error:', searchResponse.status, errorText);
      return NextResponse.json({ 
        error: `SerpAPI返回错误: ${searchResponse.status}` 
      }, { status: searchResponse.status });
    }
    
    const searchData = await searchResponse.json();
    
    // 确保返回的数据格式正确
    if (!searchData.organic_results) {
      console.warn('SerpAPI response missing organic_results:', searchData);
      return NextResponse.json({ 
        organic_results: [],
        error: '搜索结果格式不正确或为空' 
      });
    }
    
    return NextResponse.json(searchData);
  } catch (error) {
    console.error('API搜索错误:', error);
    return NextResponse.json({ error: '搜索服务出错' }, { status: 500 });
  }
}