import React from 'react';
import { X, ExternalLink } from 'lucide-react';
import { SearchResult } from '@/types';

interface SearchResultsProps {
  results: SearchResult[];
  onClose: () => void;
}

const SearchResults: React.FC<SearchResultsProps> = ({ results, onClose }) => {
  return (
    <div className="border-t border-gray-700 bg-gray-800 p-4">
      <div className="flex justify-between items-center mb-3">
        <h3 className="font-medium">搜索结果</h3>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-white"
          aria-label="关闭搜索结果"
        >
          <X size={18} />
        </button>
      </div>
      
      <div className="space-y-3 max-h-60 overflow-y-auto">
        {results.map((result, index) => (
          <div key={index} className="p-3 bg-gray-700 rounded-lg">
            <a 
              href={result.link} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-blue-400 hover:underline font-medium flex items-center"
            >
              {result.title}
              <ExternalLink size={14} className="ml-1" />
            </a>
            <p className="text-sm text-gray-300 mt-1">{result.snippet}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SearchResults;